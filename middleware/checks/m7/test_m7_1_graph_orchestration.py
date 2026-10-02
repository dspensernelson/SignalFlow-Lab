"""Check m7-1: the MCP adapter exposes the server's tools synchronously, and
a scripted scenario routes supervisor -> lookup -> draft -> done with the
expected tool calls, never a write from the lookup node."""

from __future__ import annotations

import httpx

from agent.graph import ROUTES, build_graph, initial_state, run
from agent.mcp_tools import MCPToolSource
from checks.m7._agent_helpers import agent_env
from tools.client import DonorClient
from tools.provider import ReplayProvider


def test_adapter_lists_and_calls_tools_in_process(fresh_crm, tmp_path):
    with agent_env(fresh_crm.base_url, tmp_path):
        from mcp_server.server import build_server

        with MCPToolSource(build_server(DonorClient(fresh_crm.base_url))) as tools:
            specs = tools.tools()
            names = {t["name"] for t in specs}
            assert {"find_donor", "get_donation_history", "create_receipt"} <= names
            assert all({"name", "description", "input_schema"} <= set(t) for t in specs)
            assert [t["name"] for t in tools.tools(["find_donor"])] == ["find_donor"]
            assert "create_receipt" in tools.write_tools() and "find_donor" in tools.read_tools()
            data = tools.call("find_donor", {"query": "okafor"})
            assert data["matches"] == 1
            err = tools.call("get_donation_history", {"donor_id": 999})
            assert err["error"]["code"] == "not_found"


def test_scripted_scenario_routes_and_calls_in_order(fresh_crm, tmp_path):
    provider = ReplayProvider([
        {"text": "lookup"},
        {"tool_calls": [{"name": "find_donor", "arguments": {"query": "maria.alvarez@example.org"}}]},
        {"tool_calls": [{"name": "get_donation_history", "arguments": {"donor_id": 1}}]},
        {"text": "Maria Alvarez, id 1, most recent gift found."},
        {"text": "draft"},
        {"text": "Dear Maria, thank you for your recent gift to Lakeshore Food Pantry."},
        {"text": "done"},
    ])
    with agent_env(fresh_crm.base_url, tmp_path):
        from mcp_server.server import build_server

        with MCPToolSource(build_server(DonorClient(fresh_crm.base_url))) as tools:
            graph = build_graph(provider, tools)
            final = run(graph, "Draft a thank-you for Maria Alvarez's latest gift")
    assert final["tool_calls"] == ["find_donor", "get_donation_history"]
    assert final["draft"] and "Maria" in final["draft"]
    assert final["done"] is True
    assert set(ROUTES) == {"lookup", "draft", "approval", "done"}
    routing_calls = [c for c in provider.calls if not c["tools"]]
    assert len(routing_calls) >= 3, "the supervisor must ask the model for a route before each step"
    assert httpx.get(f"{fresh_crm.base_url}/receipts").json() == []


def test_lookup_node_never_executes_a_write(fresh_crm, tmp_path):
    provider = ReplayProvider([
        {"text": "lookup"},
        {"tool_calls": [{"name": "create_receipt", "arguments": {"donation_id": 6, "sent_to": "maria.alvarez@example.org"}}]},
        {"text": "I tried."},
        {"text": "done"},
    ])
    with agent_env(fresh_crm.base_url, tmp_path):
        from mcp_server.server import build_server

        with MCPToolSource(build_server(DonorClient(fresh_crm.base_url))) as tools:
            final = run(build_graph(provider, tools), "Send Maria a receipt right now")
    assert "create_receipt" not in final["tool_calls"]
    assert httpx.get(f"{fresh_crm.base_url}/receipts").json() == []


def test_unknown_route_ends_safely(fresh_crm, tmp_path):
    provider = ReplayProvider([{"text": "launch the nukes"}])
    with agent_env(fresh_crm.base_url, tmp_path):
        from mcp_server.server import build_server

        with MCPToolSource(build_server(DonorClient(fresh_crm.base_url))) as tools:
            final = run(build_graph(provider, tools), "hello")
    assert final["done"] is True and final["tool_calls"] == []
