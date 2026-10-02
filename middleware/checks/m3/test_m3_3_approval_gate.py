"""Check m3-3: writes are held until a person approves. An unapproved write
never reaches the CRM; approval executes it exactly once."""

from __future__ import annotations

import os

import httpx
import pytest

from checks.m2._mcp_helpers import HttpAppHandle, result_json
from tools.approvals import ApprovalStore

TOKENS = "read-tok:donors:read;write-tok:donors:read,donors:write;approve-tok:donors:read,donors:write,donors:approve"


@pytest.fixture(scope="module")
def gate_app(mock_crm, tmp_path_factory):
    saved = {k: os.environ.get(k) for k in ("MCP_TOKENS", "CRM_URL", "APPROVALS_DB")}
    os.environ["MCP_TOKENS"] = TOKENS
    os.environ["CRM_URL"] = mock_crm.base_url
    os.environ["APPROVALS_DB"] = str(tmp_path_factory.mktemp("approvals") / "approvals.db")
    from mcp_server.http_server import build_app
    from tools.client import DonorClient

    handle = HttpAppHandle(build_app(DonorClient(mock_crm.base_url), resource_url="http://127.0.0.1:0/mcp")).start()
    yield handle
    handle.stop()
    for k, v in saved.items():
        if v is None:
            os.environ.pop(k, None)
        else:
            os.environ[k] = v


async def _client(url: str, token: str):
    import httpx2
    from mcp import Client
    from mcp.client.streamable_http import streamable_http_client

    return Client(streamable_http_client(url, http_client=httpx2.AsyncClient(headers={"Authorization": f"Bearer {token}"})))


def test_store_persists_and_lists(tmp_path):
    path = tmp_path / "a.db"
    store = ApprovalStore(path)
    aid = store.request("create_receipt", {"donation_id": 6, "sent_to": "x@example.org"})
    assert isinstance(aid, str) and len(aid) >= 8
    again = ApprovalStore(path)  # a new process sees the same row
    row = again.get(aid)
    assert row["status"] == "pending" and row["tool"] == "create_receipt" and row["arguments"]["donation_id"] == 6
    assert [r["id"] for r in again.list_pending()] == [aid]
    assert again.reject(aid, "director")["status"] == "rejected"
    assert again.list_pending() == []
    assert store.get("nope") is None


def test_store_approve_executes_exactly_once(tmp_path):
    store = ApprovalStore(tmp_path / "b.db")
    calls = []

    def execute(tool, arguments):
        calls.append((tool, arguments))
        return {"receipt_id": 1, "status": "sent"}

    aid = store.request("create_receipt", {"donation_id": 6, "sent_to": "x@example.org"})
    first = store.approve(aid, "director", execute)
    assert first == {"receipt_id": 1, "status": "sent"}
    second = store.approve(aid, "director", execute)
    assert second["error"]["code"] == "not_found" and second["error"]["details"]["status"] == "approved"
    assert len(calls) == 1
    assert store.approve("missing", "director", execute)["error"]["code"] == "not_found"
    assert store.get(aid)["decided_by"] == "director" and store.get(aid)["result"]["receipt_id"] == 1


async def test_write_is_held_then_approved_once(gate_app, fresh_crm):
    async with await _client(gate_app.url, "write-tok") as client:
        held = result_json(await client.call_tool("create_receipt", {"donation_id": 6, "sent_to": "maria.alvarez@example.org"}))
        assert held["error"]["code"] == "pending_approval"
        approval_id = held["error"]["details"]["approval_id"]
    assert httpx.get(f"{fresh_crm.base_url}/receipts").json() == [], "an unapproved write must never reach the CRM"

    async with await _client(gate_app.url, "read-tok") as client:
        tools = {t.name for t in (await client.list_tools()).tools}
        assert {"list_pending_approvals", "approve_pending"} <= tools
        denied = result_json(await client.call_tool("approve_pending", {"approval_id": approval_id, "decided_by": "intern"}))
        assert denied["error"]["code"] == "permission_denied" and denied["error"]["details"]["required"] == "donors:approve"
        denied = result_json(await client.call_tool("list_pending_approvals", {}))
        assert denied["error"]["code"] == "permission_denied"
    assert httpx.get(f"{fresh_crm.base_url}/receipts").json() == []

    async with await _client(gate_app.url, "approve-tok") as client:
        pending = result_json(await client.call_tool("list_pending_approvals", {}))
        assert any(p["id"] == approval_id and p["tool"] == "create_receipt" for p in pending["pending"])
        done = result_json(await client.call_tool("approve_pending", {"approval_id": approval_id, "decided_by": "director"}))
        assert done.get("status") == "sent" and done.get("receipt_id")
        again = result_json(await client.call_tool("approve_pending", {"approval_id": approval_id, "decided_by": "director"}))
        assert again["error"]["code"] == "not_found"
        missing = result_json(await client.call_tool("approve_pending", {"approval_id": "zzz", "decided_by": "director"}))
        assert missing["error"]["code"] == "not_found"
    receipts = httpx.get(f"{fresh_crm.base_url}/receipts").json()
    assert len(receipts) == 1 and receipts[0]["donation_id"] == 6
