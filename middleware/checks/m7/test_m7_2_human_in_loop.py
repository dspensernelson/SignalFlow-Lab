"""Check m7-2: the graph interrupts before the write, resumes after approval
(the write then goes through the server's own gate), a rejection never
writes, and an unanswered approval expires."""

from __future__ import annotations

import httpx
from langgraph.checkpoint.memory import InMemorySaver

from agent.graph import build_graph, initial_state
from agent.hitl import approve, expire_pending, pending_interrupt, reject
from agent.mcp_tools import MCPToolSource
from checks.m7._agent_helpers import agent_env
from tools.client import DonorClient
from tools.provider import ReplayProvider


class FakeClock:
    def __init__(self):
        self.t = 1_700_000_000.0

    def __call__(self):
        return self.t


def script():
    return ReplayProvider([
        {"text": "lookup"},
        {"tool_calls": [{"name": "find_donor", "arguments": {"query": "maria.alvarez@example.org"}}]},
        {"text": "Maria Alvarez, id 1."},
        {"text": "draft"},
        {"text": "Dear Maria, thank you."},
        {"text": "approval"},
        {"text": "done"},
    ])


def _graph(crm_url, clock):
    from mcp_server.server import build_server

    tools = MCPToolSource(build_server(DonorClient(crm_url)))
    tools.__enter__()
    graph = build_graph(script(), tools, checkpointer=InMemorySaver(), clock=clock)
    return graph, tools


def test_interrupt_then_approve(fresh_crm, tmp_path):
    clock = FakeClock()
    config = {"configurable": {"thread_id": "t-approve"}}
    with agent_env(fresh_crm.base_url, tmp_path):
        graph, tools = _graph(fresh_crm.base_url, clock)
        try:
            state = graph.invoke(initial_state("Thank Maria for her gift and send the receipt"), config)
            assert "__interrupt__" in state, "the graph must pause before the write"
            payload = pending_interrupt(graph, config)
            assert payload and "Dear Maria" in payload["draft"] and payload["tool_calls"] == ["find_donor"]
            assert httpx.get(f"{fresh_crm.base_url}/receipts").json() == []

            final = approve(graph, config, donation_id=6, sent_to="maria.alvarez@example.org", decided_by="director")
        finally:
            tools.__exit__(None, None, None)
    assert final["done"] is True
    assert final["tool_calls"] == ["find_donor", "create_receipt"]
    assert final["approval"]["error"]["code"] == "pending_approval", "the server's own gate still holds the write"
    assert pending_interrupt(graph, config) is None


def test_reject_never_writes(fresh_crm, tmp_path):
    clock = FakeClock()
    config = {"configurable": {"thread_id": "t-reject"}}
    with agent_env(fresh_crm.base_url, tmp_path):
        graph, tools = _graph(fresh_crm.base_url, clock)
        try:
            graph.invoke(initial_state("Thank Maria and send the receipt"), config)
            final = reject(graph, config, reason="wrong donor")
        finally:
            tools.__exit__(None, None, None)
    assert final["approval"] == {"status": "rejected", "reason": "wrong donor"}
    assert "create_receipt" not in final["tool_calls"] and final["done"] is True


def test_unanswered_approval_expires(fresh_crm, tmp_path):
    clock = FakeClock()
    config = {"configurable": {"thread_id": "t-expire"}}
    with agent_env(fresh_crm.base_url, tmp_path):
        graph, tools = _graph(fresh_crm.base_url, clock)
        try:
            graph.invoke(initial_state("Thank Maria and send the receipt"), config)
            assert expire_pending(graph, config, timeout_seconds=3600, clock=clock) is None, "not yet expired"
            clock.t += 3601
            final = expire_pending(graph, config, timeout_seconds=3600, clock=clock)
        finally:
            tools.__exit__(None, None, None)
    assert final is not None and final["approval"]["status"] == "rejected" and final["approval"]["reason"] == "timeout"
    assert "create_receipt" not in final["tool_calls"]
    assert httpx.get(f"{fresh_crm.base_url}/receipts").json() == []
