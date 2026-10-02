"""Check m6-2: the eval runner loads at least 20 regular cases, runs them
offline against the mock CRM, reports per case, and at least 18 pass; a
deliberately wrong case fails with reasons."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from evals.runner import CASES_DIR, EvalCase, EvalResult, Expectation, Summary, load_cases, run_all, run_case
from tools.client import DonorClient
from tools.schemas import build_registry

ROOT = Path(__file__).resolve().parents[2]


def test_at_least_twenty_regular_cases_with_unique_ids():
    cases = load_cases(CASES_DIR)
    regular = [c for c in cases if not c.adversarial]
    assert len(regular) >= 20, f"found {len(regular)} regular cases"
    assert len({c.id for c in cases}) == len(cases)
    assert all(c.replay for c in cases) and all(c.user_message.strip() for c in cases)
    used = {name for c in regular for r in c.replay for tc in r.get("tool_calls", []) for name in [tc["name"]]}
    assert {"find_donor", "get_donation_history", "create_receipt"} <= used, "cover every tool"
    assert any(c.expect.errors for c in regular), "include cases that expect an error code"


def test_regular_cases_mostly_pass(fresh_crm):
    cases = [c for c in load_cases(CASES_DIR) if not c.adversarial]
    summary = run_all(cases, build_registry(DonorClient(fresh_crm.base_url)))
    assert isinstance(summary, Summary) and summary.total == len(cases)
    assert summary.passed + summary.failed == summary.total
    failing = [r for r in summary.results if not r.passed]
    assert summary.passed >= 18, "failing: " + "; ".join(f"{r.id}: {r.reasons}" for r in failing)


def test_a_wrong_expectation_fails_with_reasons(fresh_crm):
    case = EvalCase(
        id="synthetic-wrong",
        user_message="Find Okafor",
        replay=[{"tool_calls": [{"name": "find_donor", "arguments": {"query": "okafor"}}]}, {"text": "Found David Okafor."}],
        expect=Expectation(tools=["get_donation_history"], final_contains="Nobody"),
    )
    result = run_case(case, build_registry(DonorClient(fresh_crm.base_url)))
    assert isinstance(result, EvalResult) and result.passed is False
    assert len(result.reasons) == 2 and result.tool_calls == ["find_donor"]


def test_no_write_blocks_and_reports(fresh_crm):
    import httpx

    case = EvalCase(
        id="synthetic-write",
        user_message="Send Maria a receipt for donation 6",
        replay=[{"tool_calls": [{"name": "create_receipt", "arguments": {"donation_id": 6, "sent_to": "maria.alvarez@example.org"}}]}, {"text": "Queued."}],
        expect=Expectation(no_write=True),
    )
    result = run_case(case, build_registry(DonorClient(fresh_crm.base_url)))
    assert result.passed is False and any("write" in r.lower() for r in result.reasons)
    assert httpx.get(f"{fresh_crm.base_url}/receipts").json() == [], "the harness must never execute writes"


def test_cli_reports_and_exits(fresh_crm, tmp_path):
    import os

    cases = tmp_path / "cases"
    cases.mkdir()
    (cases / "ok.json").write_text(json.dumps({
        "id": "ok", "user_message": "Find Okafor",
        "replay": [{"tool_calls": [{"name": "find_donor", "arguments": {"query": "okafor"}}]}, {"text": "David Okafor."}],
        "expect": {"tools": ["find_donor"], "final_contains": "Okafor"},
    }), encoding="utf-8")
    (cases / "bad.json").write_text(json.dumps({
        "id": "bad", "user_message": "Find nobody",
        "replay": [{"text": "I will not look."}],
        "expect": {"tools": ["find_donor"]},
    }), encoding="utf-8")
    env = {**os.environ, "CRM_URL": fresh_crm.base_url, "CRM_API_KEY": "k"}
    proc = subprocess.run([sys.executable, "-m", "evals.runner", "--cases", str(cases)], cwd=ROOT, capture_output=True, text=True, env=env, timeout=120)
    assert proc.returncode == 1, proc.stdout + proc.stderr
    assert "PASS ok" in proc.stdout and "FAIL bad" in proc.stdout
    proc = subprocess.run([sys.executable, "-m", "evals.runner", "--cases", str(cases), "--min-pass", "1"], cwd=ROOT, capture_output=True, text=True, env=env, timeout=120)
    assert proc.returncode == 0
