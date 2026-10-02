"""Self-test for checks/run.py: it must map lesson ids to files, run pytest,
and write the result JSON the app reads, for both a passing and a failing
check.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

CHECKS_DIR = Path(__file__).resolve().parents[1]
if str(CHECKS_DIR) not in sys.path:
    sys.path.insert(0, str(CHECKS_DIR))

import run  # noqa: E402  (checks/run.py)


def test_test_path_mapping():
    assert run.test_path_for("m0-1-environment") == CHECKS_DIR / "m0" / "test_m0_1_environment.py"
    assert run.test_path_for("m4-3-long-running-tasks") == CHECKS_DIR / "m4" / "test_m4_3_long_running_tasks.py"


def test_run_lesson_writes_passing_and_failing_results(tmp_path):
    good = tmp_path / "test_m9_good.py"
    good.write_text("def test_ok():\n    assert 1 == 1\n", encoding="utf-8")
    bad = tmp_path / "test_m9_bad.py"
    bad.write_text("def test_ok():\n    assert 1 == 1\n\ndef test_nope():\n    assert 1 == 2\n", encoding="utf-8")
    results = tmp_path / "results"

    r_good = run.run_lesson("m0-9-good", test_path=good, results_dir=results)
    assert r_good["passed"] is True and r_good["failing"] == [] and r_good["pytestExit"] == 0

    r_bad = run.run_lesson("m0-9-bad", test_path=bad, results_dir=results)
    assert r_bad["passed"] is False and r_bad["pytestExit"] == 1
    assert r_bad["failing"] == [f"{bad.name}::test_nope"] or r_bad["failing"][0].endswith("::test_nope")

    on_disk = json.loads((results / "m0-9-bad.json").read_text(encoding="utf-8"))
    assert on_disk["lessonId"] == "m0-9-bad"
    assert set(on_disk) == {"lessonId", "passed", "timestamp", "failing", "durationMs", "pytestExit"}


def test_run_lesson_with_no_tests_collected_is_not_a_pass(tmp_path):
    empty = tmp_path / "test_m9_empty.py"
    empty.write_text("# no tests here\n", encoding="utf-8")
    r = run.run_lesson("m0-9-empty", test_path=empty, results_dir=tmp_path / "results")
    assert r["passed"] is False
