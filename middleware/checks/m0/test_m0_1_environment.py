"""Check m0-1: hello/fetch_api.py runs as a program, fetches JSON, prints a
field, and fails cleanly (no traceback) on an HTTP error."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def run(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, "-m", "hello.fetch_api", *args],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=30,
    )


def test_prints_the_requested_field_as_json(mock_crm):
    proc = run(f"{mock_crm.base_url}/health", "--field", "status")
    assert proc.returncode == 0, proc.stderr
    line = proc.stdout.strip().splitlines()[-1]
    out = json.loads(line)
    assert out == {"url": f"{mock_crm.base_url}/health", "field": "status", "value": "ok"}


def test_another_field_from_a_different_endpoint(mock_crm):
    proc = run(f"{mock_crm.base_url}/donors/3", "--field", "last_name")
    assert proc.returncode == 0, proc.stderr
    out = json.loads(proc.stdout.strip().splitlines()[-1])
    assert out["value"] == "Okafor"


def test_missing_field_exits_2(mock_crm):
    proc = run(f"{mock_crm.base_url}/health", "--field", "nope")
    assert proc.returncode == 2
    assert json.loads(proc.stderr.strip().splitlines()[-1]) == {"error": "missing_field", "field": "nope"}


def test_http_error_exits_1_without_a_traceback(mock_crm):
    proc = run(f"{mock_crm.base_url}/donors/999", "--field", "id")
    assert proc.returncode == 1
    assert "error: HTTP 404" in proc.stderr
    assert "Traceback" not in proc.stderr
