"""Lesson m7-1: the MCP server as the agent's tool source.

The agent framework (LangGraph) runs synchronous node functions; the MCP
SDK's Client is async. This adapter owns one event loop on a background
thread, keeps one Client connected for the life of a ``with`` block, and
exposes two synchronous calls the graph nodes use. It is small on purpose:
an adapter you can read is an adapter you can debug at a client's site.

Spec (the check asserts this):

- ``MCPToolSource(target, headers=None)`` where ``target`` is an
  ``MCPServer`` instance (in-process, used by the checks), a URL string
  (Streamable HTTP; ``headers`` carries the bearer token), or
  ``StdioServerParameters``.
- ``__enter__`` starts the loop thread and connects; ``__exit__``
  disconnects and stops the thread. Use it as ``with MCPToolSource(...) as
  tools:``.
- ``tools(names=None) -> list[dict]``: provider-agnostic specs
  ``{"name", "description", "input_schema"}`` for every server tool, or
  only ``names`` when given (keeps the agent's tool list small).
- ``call(name, arguments) -> dict`` runs the tool and returns plain data
  (structured content, else the first text block parsed as JSON), so the
  Module 1 error-as-data dicts come through unchanged.
- ``read_tools()`` / ``write_tools()``: names split by the server's
  convention (``create_``, ``approve_`` and ``remember_`` prefixes are
  writes).
"""

from __future__ import annotations

from typing import Any


class MCPToolSource:
    def __init__(self, target: Any, headers: dict[str, str] | None = None):
        self.target = target
        self.headers = headers or {}

    def __enter__(self) -> "MCPToolSource":
        raise NotImplementedError("Lesson m7-1: implement MCPToolSource.__enter__ in agent/mcp_tools.py")

    def __exit__(self, exc_type, exc, tb) -> None:
        raise NotImplementedError("Lesson m7-1: implement MCPToolSource.__exit__ in agent/mcp_tools.py")

    def tools(self, names: list[str] | None = None) -> list[dict[str, Any]]:
        raise NotImplementedError("Lesson m7-1: implement MCPToolSource.tools in agent/mcp_tools.py")

    def call(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("Lesson m7-1: implement MCPToolSource.call in agent/mcp_tools.py")

    def read_tools(self) -> list[str]:
        return [t["name"] for t in self.tools() if not t["name"].startswith(("create_", "approve_", "remember_"))]

    def write_tools(self) -> list[str]:
        return [t["name"] for t in self.tools() if t["name"].startswith(("create_", "approve_", "remember_"))]
