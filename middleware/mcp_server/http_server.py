"""Lesson m2-4: the same tools over Streamable HTTP, stateless.

The 2026-07-28 spec made every request self-contained: no initialize
handshake, no session to remember. The protocol version, the client's
capabilities and identity ride in each request's ``_meta`` (and the
``MCP-Protocol-Version`` / ``mcp-method`` headers), and a server MUST answer
``server/discover`` with the versions it speaks. A stateless server can be
restarted, duplicated behind a free host, or hit by a client that
reconnected, and every request still works.

Run it by hand::

    uv run python -m mcp_server.http_server          # http://127.0.0.1:8080/mcp
    PORT=9000 uv run python -m mcp_server.http_server

Spec (the check asserts this):

- ``build_app(client=None) -> Starlette`` returns
  ``build_server(client).streamable_http_app(stateless_http=True,
  json_response=True)`` (stateless: no MCP-Session-Id is issued or required);
- ``main()`` serves it with uvicorn on ``127.0.0.1:$PORT`` (default 8080).

Python you need: ``async``/``await``. The SDK's HTTP transport is async; your
tool functions may stay plain ``def`` (the SDK runs them on a worker
thread), but read the lesson's block so you can follow the SDK's code.
"""

from __future__ import annotations

import os

from starlette.applications import Starlette

from mcp_server.server import build_server
from tools.client import DonorClient


def build_app(client: DonorClient | None = None) -> Starlette:
    server = build_server(client)  # noqa: F841 - wrap it as a stateless HTTP app
    raise NotImplementedError("Lesson m2-4: implement build_app in mcp_server/http_server.py")


def main() -> None:
    import uvicorn

    uvicorn.run(build_app(), host="127.0.0.1", port=int(os.environ.get("PORT", "8080")), log_level="info")


if __name__ == "__main__":
    main()
