"""Check m4-3: reconcile_month returns a task id at once; polling get_task
reaches completed after the client disconnected and reconnected."""

from __future__ import annotations

import os
import time

import pytest

from checks.m2._mcp_helpers import HttpAppHandle, result_json
from tools.client import DonorClient
from tools.tasks import TaskStore, reconcile_month


@pytest.fixture(scope="module")
def task_app(mock_crm, tmp_path_factory):
    saved = {k: os.environ.get(k) for k in ("CRM_URL", "TASKS_DB", "APPROVALS_DB", "MCP_TOKENS")}
    os.environ["CRM_URL"] = mock_crm.base_url
    os.environ["TASKS_DB"] = str(tmp_path_factory.mktemp("tasks") / "tasks.db")
    os.environ["APPROVALS_DB"] = str(tmp_path_factory.mktemp("approvals") / "approvals.db")
    os.environ.pop("MCP_TOKENS", None)
    from mcp_server.http_server import build_app

    handle = HttpAppHandle(build_app(DonorClient(mock_crm.base_url))).start()
    yield handle
    handle.stop()
    for k, v in saved.items():
        if v is None:
            os.environ.pop(k, None)
        else:
            os.environ[k] = v


def test_store_lifecycle_and_persistence(tmp_path):
    path = tmp_path / "t.db"
    store = TaskStore(path)
    tid = store.create("reconcile", {"year": 2026, "month": 3})
    row = TaskStore(path).get(tid)
    assert row["status"] == "working" and row["params"] == {"year": 2026, "month": 3}
    store.complete(tid, {"total_cents": 5})
    assert store.get(tid)["status"] == "completed" and store.get(tid)["result"] == {"total_cents": 5}
    t2 = store.create("reconcile", {})
    store.fail(t2, "boom")
    assert store.get(t2)["status"] == "failed" and "boom" in store.get(t2)["error"]
    assert store.get("nope") is None


def test_run_in_background_records_completion_and_failure(tmp_path):
    store = TaskStore(tmp_path / "t.db")
    tid = store.create("x", {})
    store.run_in_background(tid, lambda: {"ok": True}).join(timeout=5)
    assert store.get(tid)["status"] == "completed" and store.get(tid)["result"] == {"ok": True}
    t2 = store.create("y", {})

    def explode():
        raise RuntimeError("nope")

    store.run_in_background(t2, explode).join(timeout=5)
    assert store.get(t2)["status"] == "failed" and "nope" in store.get(t2)["error"]


def test_reconcile_month_totals(fresh_crm):
    import httpx

    client = DonorClient(fresh_crm.base_url)
    all_gifts = [g for d in httpx.get(f"{fresh_crm.base_url}/donors").json() for g in httpx.get(f"{fresh_crm.base_url}/donors/{d['id']}/donations").json()]
    year, month = 2026, 3
    expected = [g for g in all_gifts if g["received_at"].startswith(f"{year}-{month:02d}")]
    summary = reconcile_month(client, year, month, per_donor_delay=0.0)
    assert summary["donation_count"] == len(expected)
    assert summary["total_cents"] == sum(g["amount_cents"] for g in expected)
    assert sum(d["count"] for d in summary["by_donor"]) == len(expected)
    assert all({"donor_id", "name", "count", "total_cents"} <= set(d) for d in summary["by_donor"])


async def test_task_survives_a_disconnect(task_app):
    from mcp import Client

    async with Client(task_app.url) as client:
        started = result_json(await client.call_tool("reconcile_month", {"year": 2026, "month": 3}))
        assert started["status"] == "working" and started["task_id"]
        task_id = started["task_id"]
    # connection dropped here; the work carries on in the server

    deadline = time.time() + 15
    final = None
    while time.time() < deadline:
        async with Client(task_app.url) as client:  # a fresh connection each poll
            status = result_json(await client.call_tool("get_task", {"task_id": task_id}))
        if status["status"] in ("completed", "failed"):
            final = status
            break
        time.sleep(0.2)
    assert final is not None, "task never finished"
    assert final["status"] == "completed", final
    assert final["result"]["year"] == 2026 and "total_cents" in final["result"]

    async with Client(task_app.url) as client:
        missing = result_json(await client.call_tool("get_task", {"task_id": "nope"}))
        assert missing["error"]["code"] == "not_found"
