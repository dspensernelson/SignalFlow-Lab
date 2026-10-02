"""Check m1-2: with a scripted model, the loop executes the right tool against
the CRM, feeds the result back, and terminates. With a real free-tier key,
an end-to-end smoke test runs (skipped otherwise)."""

from __future__ import annotations

import json

import pytest

from tools.client import DonorClient
from tools.loop import LoopResult, run_loop
from tools.provider import ReplayProvider, get_provider
from tools.schemas import build_registry


@pytest.fixture
def registry(fresh_crm):
    return build_registry(DonorClient(fresh_crm.base_url))


def test_scripted_loop_executes_tool_and_terminates(registry):
    provider = ReplayProvider(
        [
            {"tool_calls": [{"name": "find_donor", "arguments": {"query": "Maria Alvarez"}}]},
            {"text": "I found two donors named Maria Alvarez. Which one do you mean?"},
        ]
    )
    result = run_loop(provider, registry, "Did Maria Alvarez give this spring?")
    assert isinstance(result, LoopResult)
    assert result.stop_reason == "final"
    assert result.turns == 2
    assert "two donors" in (result.final_text or "")
    assert [c.name for c in result.tool_calls] == ["find_donor"]
    assert result.tool_calls[0].result["matches"] == 2

    # The loop sent the tool result back to the model as a tool message.
    second_call_messages = provider.calls[1]["messages"]
    tool_msgs = [m for m in second_call_messages if m["role"] == "tool"]
    assert len(tool_msgs) == 1
    assert json.loads(tool_msgs[0]["content"])["matches"] == 2
    assert tool_msgs[0]["tool_call_id"] == result.tool_calls[0].id
    # Turn 1 carried the system prompt, the user message, and the three tool specs.
    first = provider.calls[0]
    assert [m["role"] for m in first["messages"]] == ["system", "user"]
    assert {t["name"] for t in first["tools"]} == {"find_donor", "get_donation_history", "create_receipt"}


def test_two_tools_in_sequence(registry):
    provider = ReplayProvider(
        [
            {"tool_calls": [{"name": "find_donor", "arguments": {"query": "priya.n@example.org"}}]},
            {"tool_calls": [{"name": "get_donation_history", "arguments": {"donor_id": 4}}]},
            {"text": "Priya has given before."},
        ]
    )
    result = run_loop(provider, registry, "Has Priya given before?")
    assert [c.name for c in result.tool_calls] == ["find_donor", "get_donation_history"]
    assert result.tool_calls[1].result["donor_id"] == 4
    assert result.final_text == "Priya has given before."


def test_max_turns_stops_a_model_that_never_answers(registry):
    provider = ReplayProvider(
        [{"tool_calls": [{"name": "find_donor", "arguments": {"query": f"donor {i}"}}]} for i in range(20)]
    )
    result = run_loop(provider, registry, "loop forever", max_turns=4)
    assert result.stop_reason == "max_turns"
    assert result.final_text is None
    assert result.turns == 4


@pytest.mark.live
def test_live_smoke_with_a_real_provider(registry):
    provider = get_provider()
    result = run_loop(provider, registry, "Find the donor with email maria.alvarez@example.org and tell me her full name.")
    assert result.stop_reason == "final"
    assert any(c.name == "find_donor" for c in result.tool_calls)
    assert "Alvarez" in (result.final_text or "")
