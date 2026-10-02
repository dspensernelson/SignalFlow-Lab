"""Check m0-4: the typer CLI runs the transform with correct exit codes, and
the learner's own test file exists and passes."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from mock_services.payments import SAMPLE_EVENTS

ROOT = Path(__file__).resolve().parents[2]
LEARNER_TESTS = ROOT / "tests" / "test_transform.py"


def run_cli(*args: str, env_extra: dict | None = None) -> subprocess.CompletedProcess:
    import os

    env = {**os.environ, "CRM_API_KEY": "k", **(env_extra or {})}
    return subprocess.run(
        [sys.executable, "-m", "tools.cli", *args],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=60,
        env=env,
    )


def test_cli_transforms_a_good_event_to_stdout(tmp_path):
    src = tmp_path / "evt.json"
    src.write_text(json.dumps(SAMPLE_EVENTS[0]), encoding="utf-8")
    proc = run_cli("transform", str(src))
    assert proc.returncode == 0, proc.stderr
    record = json.loads(proc.stdout)
    assert record["processor_ref"] == "ch_338804917"
    assert record["amount_cents"] == 7500


def test_cli_writes_out_file(tmp_path):
    src = tmp_path / "evt.json"
    src.write_text(json.dumps(SAMPLE_EVENTS[1]), encoding="utf-8")
    out = tmp_path / "record.json"
    proc = run_cli("transform", str(src), "--out", str(out))
    assert proc.returncode == 0, proc.stderr
    assert json.loads(out.read_text(encoding="utf-8"))["donor_email"] == "priya.n@example.org"


def test_cli_exit_2_on_missing_file(tmp_path):
    proc = run_cli("transform", str(tmp_path / "nope.json"))
    assert proc.returncode == 2
    assert proc.stderr.strip() and "Traceback" not in proc.stderr


def test_cli_exit_2_on_unsupported_event(tmp_path):
    src = tmp_path / "refund.json"
    src.write_text(json.dumps(SAMPLE_EVENTS[2]), encoding="utf-8")
    proc = run_cli("transform", str(src))
    assert proc.returncode == 2
    assert "Traceback" not in proc.stderr


def test_learner_tests_exist_and_pass():
    assert LEARNER_TESTS.exists(), "write your own tests in middleware/tests/test_transform.py"
    proc = subprocess.run(
        [sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", str(LEARNER_TESTS)],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert proc.returncode == 0, proc.stdout + proc.stderr
    summary = proc.stdout.strip().splitlines()[-1]
    passed = int(summary.split(" passed")[0].split()[-1]) if " passed" in summary else 0
    assert passed >= 3, f"expected at least 3 of your own tests, saw: {summary}"
