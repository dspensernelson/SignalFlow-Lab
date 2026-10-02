"""Check m3-2: bearer tokens with scopes. A read token can look up but not
write; a write token can write; no token or a bogus token is rejected
everywhere; a local stdio host is read-only by default."""

from __future__ import annotations

import os

import pytest

from checks.m2._mcp_helpers import HttpAppHandle, raw_rpc, result_json, stdio_client
from tools.auth import StaticTokenVerifier, current_scopes, parse_token_table, require_scope

TOKENS = "read-tok-1:donors:read;write-tok-1:donors:read,donors:write"


@pytest.fixture(scope="module")
def auth_app(mock_crm, tmp_path_factory):
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


async def _client(url: str, token: str | None):
    import httpx2
    from mcp import Client
    from mcp.client.streamable_http import streamable_http_client

    headers = {"Authorization": f"Bearer {token}"} if token else {}
    return Client(streamable_http_client(url, http_client=httpx2.AsyncClient(headers=headers)))


def test_parse_token_table():
    table = parse_token_table(" read-tok-1 : donors:read ; write-tok-1:donors:read, donors:write ")
    assert table == {"read-tok-1": ["donors:read"], "write-tok-1": ["donors:read", "donors:write"]}
    assert parse_token_table("") == {}


async def test_static_verifier():
    v = StaticTokenVerifier(parse_token_table(TOKENS))
    ok = await v.verify_token("write-tok-1")
    assert ok is not None and ok.scopes == ["donors:read", "donors:write"]
    assert await v.verify_token("nope") is None


def test_local_scopes_default_to_read_only(monkeypatch):
    monkeypatch.delenv("MCP_LOCAL_SCOPES", raising=False)
    assert current_scopes() == ["donors:read"]
    assert require_scope("donors:read") is None
    denied = require_scope("donors:write")
    assert denied["error"]["code"] == "permission_denied" and denied["error"]["details"]["required"] == "donors:write"
    monkeypatch.setenv("MCP_LOCAL_SCOPES", "donors:read,donors:write")
    assert require_scope("donors:write") is None


def test_no_token_is_rejected_everywhere(auth_app):
    for method in ("server/discover", "tools/list", "tools/call"):
        params = {"name": "find_donor", "arguments": {"query": "maria"}} if method == "tools/call" else None
        r = raw_rpc(auth_app.url, method, params)
        assert r.status_code == 401, f"{method}: {r.status_code} {r.text[:120]}"
        assert "bearer" in r.headers.get("www-authenticate", "").lower()


def test_bogus_token_is_rejected(auth_app):
    r = raw_rpc(auth_app.url, "tools/list", headers={"Authorization": "Bearer not-a-real-token"})
    assert r.status_code == 401


async def test_read_token_can_look_up_but_not_write(auth_app, fresh_crm):
    import httpx

    async with await _client(auth_app.url, "read-tok-1") as client:
        found = result_json(await client.call_tool("find_donor", {"query": "okafor"}))
        assert found["matches"] == 1
        denied = result_json(await client.call_tool("create_receipt", {"donation_id": 6, "sent_to": "maria.alvarez@example.org"}))
        assert denied["error"]["code"] == "permission_denied"
        assert denied["error"]["details"]["required"] == "donors:write"
    assert httpx.get(f"{fresh_crm.base_url}/receipts").json() == []


async def test_write_token_is_not_denied(auth_app, fresh_crm):
    async with await _client(auth_app.url, "write-tok-1") as client:
        result = result_json(await client.call_tool("create_receipt", {"donation_id": 6, "sent_to": "maria.alvarez@example.org"}))
        code = (result.get("error") or {}).get("code") if isinstance(result, dict) else None
        # Before lesson 3.3 the receipt is sent; after it, the write is queued for approval. Both are correct here.
        assert code in (None, "pending_approval"), result


async def test_stdio_host_is_read_only_by_default(fresh_crm):
    async with stdio_client({"CRM_URL": fresh_crm.base_url, "MCP_LOCAL_SCOPES": ""}) as client:
        ok = result_json(await client.call_tool("find_donor", {"query": "okafor"}))
        assert ok["matches"] == 1
        denied = result_json(await client.call_tool("create_receipt", {"donation_id": 6, "sent_to": "x@example.org"}))
        assert denied["error"]["code"] == "permission_denied"
