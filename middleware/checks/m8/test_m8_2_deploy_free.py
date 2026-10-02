"""Check m8-2: the deployed URL answers server/discover at 2026-07-28 and
refuses unauthenticated tool calls. Runs only with DEPLOY_URL set (and
DEPLOY_TOKEN for the authenticated part)."""

from __future__ import annotations

import os

import pytest

from checks.m2._mcp_helpers import raw_rpc


@pytest.mark.deployed
def test_deployed_server_discover():
    url = os.environ["DEPLOY_URL"].rstrip("/")
    token = os.environ.get("DEPLOY_TOKEN")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    r = raw_rpc(url, "server/discover", headers=headers)
    assert r.status_code == 200, r.text[:200]
    body = r.json()["result"]
    assert "2026-07-28" in body["supportedVersions"]
    assert body["_meta"]["io.modelcontextprotocol/serverInfo"]["name"] == "lakeshore-donor-ops"


@pytest.mark.deployed
def test_deployed_server_requires_a_token():
    url = os.environ["DEPLOY_URL"].rstrip("/")
    r = raw_rpc(url, "tools/list")
    assert r.status_code == 401, "a public deployment must refuse unauthenticated calls"


@pytest.mark.deployed
def test_deployed_health():
    import httpx

    base = os.environ["DEPLOY_URL"].rstrip("/").rsplit("/mcp", 1)[0]
    assert httpx.get(f"{base}/health", timeout=10).status_code == 200
