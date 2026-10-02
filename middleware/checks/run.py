"""Run one lesson's acceptance check and record the result for the app.

    uv run --directory middleware python checks/run.py m0-1-environment
    uv run --directory middleware python checks/run.py --all

Maps a lesson id to ``checks/<module>/test_<lesson_id_with_underscores>.py``,
runs pytest on it, and writes ``checks/results/<lesson-id>.json``::

    {"lessonId": "m0-1-environment", "passed": false,
     "timestamp": "2026-10-02T21:00:00+00:00",
     "failing": ["checks/m0/test_m0_1_environment.py::test_prints_json"],
     "durationMs": 812, "pytestExit": 1}

The SignalFlow Lab dev server reads that directory and the lesson unlocks
when ``passed`` is true. Exit code is pytest's, so this also works in a shell
loop or a pre-commit hook.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import pytest

CHECKS_DIR = Path(__file__).resolve().parent
RESULTS_DIR = CHECKS_DIR / "results"
LESSON_ID = re.compile(r"^(m[0-8])-\d+-[a-z0-9-]+$")


def test_path_for(lesson_id: str) -> Path:
    m = LESSON_ID.match(lesson_id)
    if not m:
        raise SystemExit(f"'{lesson_id}' is not a lesson id (expected m<module>-<n>-<slug>)")
    return CHECKS_DIR / m.group(1) / f"test_{lesson_id.replace('-', '_')}.py"


class _Collector:
    """pytest plugin: remembers failing node ids."""

    def __init__(self) -> None:
        self.failing: list[str] = []
        self.ran = 0

    def pytest_runtest_logreport(self, report):
        if report.when == "call":
            self.ran += 1
        if report.failed:
            self.failing.append(report.nodeid)


def run_lesson(lesson_id: str, test_path: Path | None = None, results_dir: Path = RESULTS_DIR) -> dict:
    path = test_path or test_path_for(lesson_id)
    if not path.exists():
        raise SystemExit(f"no check file for {lesson_id}: {path.relative_to(CHECKS_DIR.parent)}")
    collector = _Collector()
    started = time.monotonic()
    exit_code = pytest.main(["-q", "-p", "no:cacheprovider", str(path)], plugins=[collector])
    duration_ms = int((time.monotonic() - started) * 1000)
    passed = int(exit_code) == 0 and collector.ran > 0
    result = {
        "lessonId": lesson_id,
        "passed": passed,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "failing": sorted(set(collector.failing)),
        "durationMs": duration_ms,
        "pytestExit": int(exit_code),
    }
    results_dir.mkdir(parents=True, exist_ok=True)
    (results_dir / f"{lesson_id}.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    return result


def all_lesson_ids() -> list[str]:
    ids = []
    for module_dir in sorted(CHECKS_DIR.glob("m[0-8]")):
        for test_file in sorted(module_dir.glob("test_m*_*.py")):
            ids.append(test_file.stem[len("test_"):].replace("_", "-"))
    return ids


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="checks/run.py", description=__doc__.split("\n")[0])
    parser.add_argument("lesson_id", nargs="?", help="e.g. m0-1-environment")
    parser.add_argument("--all", action="store_true", help="run every lesson check")
    args = parser.parse_args(argv)
    if not args.lesson_id and not args.all:
        parser.error("give a lesson id or --all")

    ids = all_lesson_ids() if args.all else [args.lesson_id]
    worst = 0
    for lesson_id in ids:
        result = run_lesson(lesson_id)
        mark = "PASS" if result["passed"] else "FAIL"
        print(f"{mark} {lesson_id} ({result['durationMs']} ms)"
              + ("" if result["passed"] else f" - {len(result['failing'])} failing"))
        worst = max(worst, result["pytestExit"])
    return worst


if __name__ == "__main__":
    sys.exit(main())
