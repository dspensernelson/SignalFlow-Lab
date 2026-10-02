"""Check m6-1: a traced tool call emits a span with the tool name, duration
and outcome; JSON logs carry the correlation id; secrets are absent."""

from __future__ import annotations

import io
import json
import logging

import pytest
from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter

from tools import telemetry
from tools.client import DonorClient
from tools.schemas import build_registry

SECRET = "lsfp_trace_secret_42_never_log"


@pytest.fixture
def exporter(monkeypatch):
    monkeypatch.setenv("CRM_API_KEY", SECRET)
    exp = InMemorySpanExporter()
    telemetry.configure_tracing(exp)
    yield exp
    exp.clear()


def test_tool_span_has_name_duration_and_outcome(exporter, fresh_crm):
    registry = build_registry(DonorClient(fresh_crm.base_url))
    cid = telemetry.set_correlation_id()
    with telemetry.trace_tool_call("find_donor", {"query": "okafor"}) as outcome:
        outcome.result = registry.call("find_donor", {"query": "okafor"})
    spans = exporter.get_finished_spans()
    assert [s.name for s in spans] == ["tool.find_donor"]
    attrs = dict(spans[0].attributes)
    assert attrs["tool.name"] == "find_donor" and attrs["tool.outcome"] == "ok"
    assert attrs["tool.duration_ms"] >= 0 and attrs["correlation_id"] == cid
    assert "okafor" in attrs["tool.arguments"]


def test_error_result_and_exception_are_recorded(exporter, fresh_crm):
    registry = build_registry(DonorClient(fresh_crm.base_url))
    with telemetry.trace_tool_call("get_donation_history", {"donor_id": 999}) as outcome:
        outcome.result = registry.call("get_donation_history", {"donor_id": 999})
    with pytest.raises(RuntimeError):
        with telemetry.trace_tool_call("boom", {}):
            raise RuntimeError("nope")
    outcomes = {s.name: dict(s.attributes)["tool.outcome"] for s in exporter.get_finished_spans()}
    assert outcomes["tool.get_donation_history"] == "error:not_found"
    assert outcomes["tool.boom"] == "exception:RuntimeError"


def test_secrets_never_reach_span_attributes(exporter):
    with telemetry.trace_tool_call("create_receipt", {"sent_to": "x@example.org", "api_key": SECRET}) as outcome:
        outcome.result = {"ok": True}
    attrs = dict(exporter.get_finished_spans()[0].attributes)
    assert SECRET not in json.dumps(attrs, default=str)


def test_json_logs_carry_correlation_and_span_ids(exporter):
    handler = telemetry.configure_logging(logging.DEBUG)
    stream = io.StringIO()
    handler.setStream(stream)
    cid = telemetry.set_correlation_id("corr-123")
    with telemetry.trace_tool_call("find_donor", {"query": "x"}) as outcome:
        logging.getLogger("middleware.tools").info("looking up %s", "x")
        outcome.result = {"matches": 0}
    logging.getLogger().removeHandler(handler)
    lines = [json.loads(line) for line in stream.getvalue().splitlines() if line.strip()]
    assert lines, "expected JSON log lines"
    rec = lines[-1]
    assert rec["message"] == "looking up x" and rec["level"] == "INFO" and rec["logger"] == "middleware.tools"
    assert rec["correlation_id"] == cid == "corr-123"
    assert rec["trace_id"] and rec["span_id"]
    assert rec["ts"].endswith("Z") or "+00:00" in rec["ts"]


async def test_mcp_tools_are_traced_in_process(exporter, fresh_crm, monkeypatch, tmp_path):
    monkeypatch.setenv("APPROVALS_DB", str(tmp_path / "a.db"))
    monkeypatch.setenv("TASKS_DB", str(tmp_path / "t.db"))
    from mcp import Client
    from mcp_server.server import build_server

    server = build_server(DonorClient(fresh_crm.base_url))
    async with Client(server) as client:
        await client.call_tool("find_donor", {"query": "alvarez"})
    names = [s.name for s in exporter.get_finished_spans()]
    assert "tool.find_donor" in names
