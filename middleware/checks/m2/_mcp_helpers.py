"""Shared helpers for the Module 2+ checks: spawn the learner's stdio server
as a subprocess, or serve the HTTP app in a thread, and talk to it with the
SDK's Client."""

from __future__ import annotations

import json
import os
import socket
import sys
import threading
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import httpx

ROOT = Path(__file__).resolve().parents[2]


def stdio_params(module: str = "mcp_server.server", extra_env: dict[str, str] | None = None):
    from mcp import StdioServerParameters

    env = {**os.environ, **(extra_env or {})}
    return StdioServerParameters(command=sys.executable, args=["-m", module], env=env, cwd=str(ROOT))


@asynccontextmanager
async def stdio_client(extra_env: dict[str, str] | None = None, module: str = "mcp_server.server"):
    from mcp import Client

    async with Client(stdio_params(module, extra_env)) as client:
        yield client


def result_json(result: Any) -> Any:
    """A tool result as plain data: structured_content when present, else the
    first text block parsed as JSON (or returned as a string)."""
    if getattr(result, "structured_content", None) is not None:
        return result.structured_content
    for block in getattr(result, "content", []) or []:
        text = getattr(block, "text", None)
        if text is not None:
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                return text
    return None


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class HttpAppHandle:
    """Serve a Starlette app on a free port in a background thread."""

    def __init__(self, app, path: str = "/mcp"):
        import uvicorn

        self.port = free_port()
        self.url = f"http://127.0.0.1:{self.port}{path}"
        self.server = uvicorn.Server(uvicorn.Config(app, host="127.0.0.1", port=self.port, log_level="error"))
        self.thread = threading.Thread(target=self.server.run, daemon=True)

    def start(self, timeout: float = 10.0) -> "HttpAppHandle":
        self.thread.start()
        deadline = time.time() + timeout
        while time.time() < deadline:
            if self.server.started:
                return self
            time.sleep(0.05)
        raise RuntimeError("HTTP app did not start")

    def stop(self) -> None:
        self.server.should_exit = True
        self.thread.join(timeout=5)


META = {
    "io.modelcontextprotocol/protocolVersion": "2026-07-28",
    "io.modelcontextprotocol/clientCapabilities": {},
    "io.modelcontextprotocol/clientInfo": {"name": "signalflow-check", "version": "1"},
}


def raw_rpc(url: str, method: str, params: dict[str, Any] | None = None, *, rid: int = 1, headers: dict[str, str] | None = None) -> httpx.Response:
    """One self-contained 2026-07-28 JSON-RPC request over Streamable HTTP."""
    body = {"jsonrpc": "2.0", "id": rid, "method": method, "params": {**(params or {}), "_meta": META}}
    h = {
        "Accept": "application/json, text/event-stream",
        "Content-Type": "application/json",
        "MCP-Protocol-Version": "2026-07-28",
        "mcp-method": method,
        **(headers or {}),
    }
    if method == "tools/call" and params and "name" in params:
        h["mcp-name"] = params["name"]
    return httpx.post(url, json=body, headers=h, timeout=10)
