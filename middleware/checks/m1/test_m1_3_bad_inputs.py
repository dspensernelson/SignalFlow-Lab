"""Check m1-3: every failure is a structured error the model can act on,
never an exception that reaches the user."""

from __future__ import annotations

import pytest

from tools.client import DonorClient
from tools.errors import ERROR_CODES, error_result, is_error
from tools.loop import run_loop
from tools.provider import ReplayProvider
from tools.schemas import build_registry


@pytest.fixture
def registry(fresh_crm):
    return build_registry(DonorClient(fresh_crm.base_url))


def test_error_helper_shape():
    e = error_result("not_found", "No donor matches that email.", suggestion="Try the last name.", query="x@y")
    assert set(e) == {"error"}
    assert e["error"]["code"] == "not_found" and e["error"]["suggestion"] == "Try the last name."
    assert e["error"]["details"] == {"query": "x@y"}
    assert is_error(e) and not is_error({"matches": 2}) and not is_error(None)
    assert "invalid_arguments" in ERROR_CODES


def test_missing_donor_is_not_found(registry):
    r = registry.call("get_donation_history", {"donor_id": 999})
    assert is_error(r) and r["error"]["code"] == "not_found"
    assert "999" in r["error"]["message"] or r["error"]["details"].get("donor_id") == 999


def test_no_match_is_an_empty_result_not_an_error(registry):
    r = registry.call("find_donor", {"query": "zzzz-nobody"})
    assert not is_error(r) and r["matches"] == 0 and r["donors"] == []


def test_malformed_arguments_are_invalid_arguments(registry):
    r = registry.call("get_donation_history", {"donor_id": "abc"})
    assert is_error(r) and r["error"]["code"] == "invalid_arguments"
    assert "donor_id" in r["error"]["details"].get("fields", [])

    r = registry.call("get_donation_history", {"donor_id": 1, "since": "31/12/2025"})
    assert is_error(r) and r["error"]["code"] == "invalid_arguments"
    assert "since" in r["error"]["details"].get("fields", [])

    r = registry.call("find_donor", {})
    assert is_error(r) and r["error"]["code"] == "invalid_arguments"


def test_unknown_tool(registry):
    r = registry.call("delete_everything", {})
    assert is_error(r) and r["error"]["code"] == "unknown_tool"
    assert set(r["error"]["details"].get("available", [])) == {"find_donor", "get_donation_history", "create_receipt"}


def test_duplicate_call_in_one_run_executes_once(registry, fresh_crm):
    provider = ReplayProvider(
        [
            {"tool_calls": [{"name": "create_receipt", "arguments": {"donation_id": 6, "sent_to": "maria.alvarez@example.org"}}]},
            {"tool_calls": [{"name": "create_receipt", "arguments": {"donation_id": 6, "sent_to": "maria.alvarez@example.org"}}]},
            {"text": "Receipt sent once."},
        ]
    )
    result = run_loop(provider, registry, "send Maria a receipt for donation 6")
    assert result.stop_reason == "final"
    assert len(result.tool_calls) == 2
    assert not is_error(result.tool_calls[0].result)
    assert is_error(result.tool_calls[1].result) and result.tool_calls[1].result["error"]["code"] == "duplicate_call"
    import httpx

    assert len(httpx.get(f"{fresh_crm.base_url}/receipts").json()) == 1


def test_upstream_failure_is_an_error_not_an_exception(fresh_crm):
    dead = build_registry(DonorClient("http://127.0.0.1:9", timeout=0.5))
    r = dead.call("find_donor", {"query": "maria"})
    assert is_error(r) and r["error"]["code"] == "upstream_error"
