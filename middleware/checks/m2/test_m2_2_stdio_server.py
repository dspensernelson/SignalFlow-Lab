"""Check m2-2: the stdio server launches as a subprocess, lists three tools
with descriptions, and answers find_donor with CRM data."""

from __future__ import annotations

import pytest

from checks.m2._mcp_helpers import result_json, stdio_client

EXPECTED = {"find_donor", "get_donation_history", "create_receipt"}


async def test_server_identity_and_tool_list(mock_crm):
    async with stdio_client({"CRM_URL": mock_crm.base_url}) as client:
        assert client.server_info is not None and client.server_info.name == "lakeshore-donor-ops"
        assert client.protocol_version == "2026-07-28"
        assert client.instructions and "find_donor" in client.instructions
        tools = (await client.list_tools()).tools
        # Later lessons add tools (approvals in 3.3); the three CRM tools must always be there.
        assert EXPECTED <= {t.name for t in tools}
        for t in tools:
            assert t.description and len(t.description) >= 40, f"{t.name} needs its description"
        find = next(t for t in tools if t.name == "find_donor")
        assert find.input_schema["required"] == ["query"]


async def test_find_donor_returns_crm_data(fresh_crm):
    async with stdio_client({"CRM_URL": fresh_crm.base_url}) as client:
        result = await client.call_tool("find_donor", {"query": "alvarez"})
        assert result.is_error is False
        data = result_json(result)
        assert data["matches"] == 2
        assert {d["id"] for d in data["donors"]} == {1, 2}


async def test_history_with_since_and_error_as_data(fresh_crm):
    async with stdio_client({"CRM_URL": fresh_crm.base_url}) as client:
        ok = result_json(await client.call_tool("get_donation_history", {"donor_id": 1, "since": "2025-04-01"}))
        assert ok["donor_id"] == 1 and all(g["received_at"] >= "2025-04-01" for g in ok["donations"])
        bad = await client.call_tool("get_donation_history", {"donor_id": 999})
        data = result_json(bad)
        assert isinstance(data, dict) and data.get("error", {}).get("code") == "not_found", (
            "a missing donor must come back as error data the model can read, not a protocol error"
        )


@pytest.mark.parametrize("name", sorted(EXPECTED))
async def test_each_tool_has_typed_parameters(mock_crm, name):
    async with stdio_client({"CRM_URL": mock_crm.base_url}) as client:
        tool = next(t for t in (await client.list_tools()).tools if t.name == name)
        props = tool.input_schema.get("properties", {})
        assert props, f"{name} must declare typed parameters"
        if name == "create_receipt":
            assert props["format"].get("enum") == ["email", "pdf"]
