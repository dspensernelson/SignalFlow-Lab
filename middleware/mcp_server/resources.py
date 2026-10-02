"""Lesson m2-5: a donor record as a resource, a thank-you draft as a prompt.

Tools are things a model DOES. Resources are things a host can READ into
context (a donor record, a policy document). Prompts are reusable, server-
owned templates the host offers the user (a draft thank-you that already
knows the donor's name and last gift).

Spec (the check connects over stdio and asserts this):

- ``register_resources(server, client)`` adds to an existing MCPServer:

  * resource ``donor://{donor_id}`` (mime_type ``application/json``) that
    returns the donor record as a JSON string, or a JSON error object
    ``{"error": {"code": "not_found", ...}}`` for an unknown id;
  * prompt ``draft-thank-you`` with one argument ``donor_id`` (a string, as
    MCP prompt arguments are) whose single user message asks the model to
    draft a short thank-you naming the donor and their most recent gift
    (amount and date), and, when the donor has notes, respects them.

- ``build_server`` in ``mcp_server/server.py`` calls ``register_resources``
  so both transports expose them.
"""

from __future__ import annotations

from mcp.server import MCPServer

from tools.client import DonorClient


def register_resources(server: MCPServer, client: DonorClient) -> None:
    raise NotImplementedError("Lesson m2-5: implement register_resources in mcp_server/resources.py")
