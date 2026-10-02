"""Lesson m2-2: the CRM tools as an MCP server over stdio.

The three tools from Module 1 (``tools/schemas.py``) become MCP tools. The
host (Claude Desktop, Claude Code, MCP Inspector, or the check) launches this
file as a subprocess and speaks JSON-RPC over its stdin/stdout.

Run it by hand::

    uv run python -m mcp_server.server            # waits on stdin: that is normal
    npx @modelcontextprotocol/inspector uv run python -m mcp_server.server

Spec (the check connects with the SDK's Client and asserts this):

- ``build_server(client=None) -> MCPServer`` named "lakeshore-donor-ops",
  version "0.1.0", with ``instructions`` that tell a model to look up before
  writing. ``client`` defaults to ``DonorClient(os.environ["CRM_URL"])``.
- exactly three tools, named like the Module 1 registry: ``find_donor``,
  ``get_donation_history``, ``create_receipt``; typed parameters with the
  same names and defaults as the pydantic inputs; the docstring of each
  function is the description the host shows (reuse the model docstrings);
- every tool returns the registry's dict, so failures come back as
  ``{"error": {...}}`` data (Module 1.3) rather than JSON-RPC errors;
- ``main()`` runs ``build_server().run(transport="stdio")``.

Python you need: decorators. ``@server.tool()`` registers the function it
decorates and returns it unchanged.

Pitfall: this module uses ``from __future__ import annotations``, so type
hints are strings the SDK evaluates against the MODULE's globals. Import
``date`` and ``Literal`` at the top of the file (already done), never inside
``build_server``, or the SDK raises "Unable to evaluate type annotations".
"""

from __future__ import annotations

import os
from datetime import date  # noqa: F401 - tool signatures use it; keep module-level
from typing import Literal  # noqa: F401 - (string annotations resolve against module globals)

from mcp.server import MCPServer

from tools.client import DonorClient
from tools.schemas import ToolRegistry, build_registry

SERVER_NAME = "lakeshore-donor-ops"
SERVER_VERSION = "0.1.0"
INSTRUCTIONS = (
    "Donor operations for Lakeshore Food Pantry. Look a donor up with find_donor before "
    "reading history or sending anything. create_receipt is a write: only when staff asked."
)


def default_client() -> DonorClient:
    return DonorClient(os.environ.get("CRM_URL", "http://127.0.0.1:8001"))


def build_server(client: DonorClient | None = None, **server_kwargs) -> MCPServer:
    """Create the MCPServer and register the three tools on it.

    ``server_kwargs`` are forwarded to ``MCPServer(...)``: lesson m3-2 passes
    ``token_verifier`` and ``auth`` from the HTTP app. Lesson m3-3 adds the
    approval gate (see tools/approvals.py) and two approval tools.
    """
    from mcp_server.resources import register_resources
    from tools.schemas import CreateReceiptInput, FindDonorInput, GetDonationHistoryInput

    client = client or default_client()
    registry: ToolRegistry = build_registry(client)
    server = MCPServer(SERVER_NAME, version=SERVER_VERSION, instructions=INSTRUCTIONS)

    @server.tool(description=FindDonorInput.__doc__)
    def find_donor(query: str) -> dict:
        return registry.call("find_donor", {"query": query})

    @server.tool(description=GetDonationHistoryInput.__doc__)
    def get_donation_history(donor_id: int, since: date | None = None) -> dict:
        return registry.call("get_donation_history", {"donor_id": donor_id, "since": since.isoformat() if since else None})

    @server.tool(description=CreateReceiptInput.__doc__)
    def create_receipt(donation_id: int, sent_to: str, format: Literal["email", "pdf"] = "email") -> dict:
        return registry.call("create_receipt", {"donation_id": donation_id, "sent_to": sent_to, "format": format})

    register_resources(server, client)
    return server


def main() -> None:
    build_server().run(transport="stdio")


if __name__ == "__main__":
    main()
