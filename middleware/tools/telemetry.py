"""Lesson m6-1: structured logs and a trace span around every tool call.

A trace answers "what did the assistant touch, in what order, and how long
did each hop take" for one request. A span is one hop. Structured (JSON)
logs are the lines inside the hops, each carrying the same correlation id,
so a log line and a span can be joined later.

Spec (the check asserts this):

- ``configure_tracing(exporter=None) -> TracerProvider`` installs a
  provider with ``SimpleSpanProcessor(exporter or ConsoleSpanExporter())``
  as the global tracer provider (``trace.set_tracer_provider``) and returns
  it. Calling it again replaces the processor on the provider it created
  (keep a module-level reference) rather than failing.
- ``get_tracer()`` returns ``trace.get_tracer("middleware")``.
- ``correlation_id`` is a ``contextvars.ContextVar``; ``set_correlation_id(
  value=None) -> str`` sets it (a new uuid4 hex when None) and
  ``get_correlation_id() -> str | None`` reads it.
- ``trace_tool_call(name, arguments)`` is a context manager that opens a
  span named ``tool.<name>`` with attributes ``tool.name``,
  ``correlation_id`` (when set) and ``tool.arguments`` (JSON, with every
  known secret value redacted via ``tools.redact.RedactingFilter``-style
  replacement using ``secrets()`` below). It yields a small ``Outcome``
  object; set ``outcome.result = <dict>`` inside the block. On exit it sets
  ``tool.outcome`` to ``"ok"`` or ``"error:<code>"`` (from an
  ``{"error": {"code": ...}}`` result) and ``tool.duration_ms`` (float >= 0).
  An exception inside the block records ``tool.outcome = "exception:<Type>"``
  and re-raises.
- ``JsonFormatter(logging.Formatter)`` formats each record as one JSON
  object per line: ``ts`` (ISO 8601 UTC), ``level``, ``logger``, ``message``,
  ``correlation_id`` (or null), ``trace_id`` and ``span_id`` (hex, or null)
  from the current span.
- ``configure_logging(level=logging.INFO) -> logging.Handler`` installs one
  stream handler with JsonFormatter on the root logger (replacing an
  earlier one it installed) and returns it.
- ``secrets() -> list[str]`` returns ``load_settings().secret_values()`` or
  ``[]`` when settings cannot load.

Wiring: every MCP tool body runs inside ``trace_tool_call``; the server
calls ``configure_logging()`` and ``configure_tracing()`` at startup, with
``OTEL_CONSOLE=1`` printing spans to stderr.
"""

from __future__ import annotations

import contextvars
import logging
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SpanExporter

correlation_id: contextvars.ContextVar[str | None] = contextvars.ContextVar("correlation_id", default=None)


class Outcome:
    result: dict[str, Any] | None = None


def secrets() -> list[str]:
    try:
        from tools.settings import load_settings

        return load_settings().secret_values()
    except Exception:  # noqa: BLE001 - no settings means nothing to redact
        return []


def configure_tracing(exporter: SpanExporter | None = None) -> TracerProvider:
    raise NotImplementedError("Lesson m6-1: implement configure_tracing in tools/telemetry.py")


def get_tracer():
    return trace.get_tracer("middleware")


def set_correlation_id(value: str | None = None) -> str:
    raise NotImplementedError("Lesson m6-1: implement set_correlation_id in tools/telemetry.py")


def get_correlation_id() -> str | None:
    return correlation_id.get()


@contextmanager
def trace_tool_call(name: str, arguments: dict[str, Any]) -> Iterator[Outcome]:
    raise NotImplementedError("Lesson m6-1: implement trace_tool_call in tools/telemetry.py")


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        raise NotImplementedError("Lesson m6-1: implement JsonFormatter.format in tools/telemetry.py")


def configure_logging(level: int = logging.INFO) -> logging.Handler:
    raise NotImplementedError("Lesson m6-1: implement configure_logging in tools/telemetry.py")
