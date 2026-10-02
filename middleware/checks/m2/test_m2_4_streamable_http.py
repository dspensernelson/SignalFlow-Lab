"""Check m2-4: the same tools over stateless Streamable HTTP. The SDK Client
can list and call tools, raw 2026-07-28 requests are self-contained (no
session id), and server/discover answers."""

from __future__ import annotations

import pytest

from checks.m2._mcp_helpers import HttpAppHandle, raw_rpc, result_json


@pytest.fixture(scope="module")
def http_app(mock_crm):
    import os

    os.environ["CRM_URL"] = mock_crm.base_url
    from mcp_server.http_server import build_app
    from tools.client import DonorClient

    handle = HttpAppHandle(build_app(DonorClient(mock_crm.base_url))).start()
    yield handle
    handle.stop()


async def test_sdk_client_lists_and_calls_tools_over_http(http_app, fresh_crm):
    from mcp import Client

    async with Client(http_app.url) as client:
        assert client.protocol_version == "2026-07-28"
        names = {t.name for t in (await client.list_tools()).tools}
        assert names == {"find_donor", "get_donation_history", "create_receipt"}
        data = result_json(await client.call_tool("find_donor", {"query": "okafor"}))
        assert data["matches"] == 1 and data["donors"][0]["id"] == 3


def test_server_discover_is_answered(http_app):
    r = raw_rpc(http_app.url, "server/discover")
    assert r.status_code == 200, r.text
    body = r.json()
    assert "result" in body, body
    assert "2026-07-28" in body["result"]["supportedVersions"]
    assert body["result"]["_meta"]["io.modelcontextprotocol/serverInfo"]["name"] == "lakeshore-donor-ops"
    assert "tools" in body["result"]["capabilities"]


def test_every_request_is_self_contained_no_session(http_app):
    first = raw_rpc(http_app.url, "tools/list", rid=1)
    second = raw_rpc(http_app.url, "tools/list", rid=2)
    assert first.status_code == 200 and second.status_code == 200
    assert "mcp-session-id" not in {k.lower() for k in first.headers}, "stateless: the server must not issue a session id"
    assert [t["name"] for t in second.json()["result"]["tools"]].count("find_donor") == 1


def test_raw_tools_call_carries_the_envelope(http_app, fresh_crm):
    r = raw_rpc(http_app.url, "tools/call", {"name": "find_donor", "arguments": {"query": "priya"}}, rid=3)
    assert r.status_code == 200, r.text
    result = r.json()["result"]
    assert result["isError"] is False
    text = result["content"][0]["text"]
    assert "priya.n@example.org" in text
