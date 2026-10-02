"""Lesson m3-2: who is calling, and what may they do.

Internal tools use API keys (bearer tokens we issue ourselves); public
deployments use OAuth 2.1 with an authorization server issuing JWTs that
the resource server (this MCP server) validates: issuer, audience, expiry,
scopes. The SDK gives you the plumbing for both through one interface,
``TokenVerifier``: hand it a token, get back an ``AccessToken`` with scopes,
or None. This lesson implements the API-key version and wires it into the
HTTP server; the OAuth version swaps the verifier and nothing else.

Spec (the checks assert this):

- ``parse_token_table(spec: str) -> dict[str, list[str]]`` parses
  ``MCP_TOKENS`` of the form ``"tokenA:donors:read;tokenB:donors:read,donors:write"``
  into ``{"tokenA": ["donors:read"], "tokenB": ["donors:read", "donors:write"]}``
  (the first ``:`` separates token from scopes; scopes are comma-separated;
  entries are ``;``-separated; whitespace is ignored);
- ``StaticTokenVerifier(table)`` is a ``TokenVerifier`` whose
  ``verify_token(token)`` returns ``AccessToken(token=..., client_id="static",
  scopes=[...])`` for a known token and None otherwise;
- ``current_scopes() -> list[str]`` returns the scopes of the HTTP caller
  (``get_access_token()``), or, when there is no HTTP auth context (stdio,
  a trusted local host), the scopes in ``MCP_LOCAL_SCOPES`` (unset or
  empty means ``donors:read``): a local server is read-only unless
  configured;
- ``require_scope(scope) -> dict | None`` returns None when the caller has
  the scope, else the ``permission_denied`` error dict (``tools/errors.py``)
  naming the missing scope in ``details.required``;
- ``auth_settings(resource_url) -> AuthSettings`` builds the SDK settings
  the HTTP app needs (issuer_url = resource_url's origin, resource_server_url
  = resource_url, validate_token_resource=False because the static verifier
  owns the whole decision; a JWT verifier would set it True); ``mcp_server/http_server.build_app`` passes a
  ``StaticTokenVerifier`` built from ``MCP_TOKENS`` and these settings to
  ``build_server`` so every HTTP request is authenticated (401 otherwise).

Scopes used in this track: ``donors:read``, ``donors:write``,
``donors:approve`` (Module 3.3).
"""

from __future__ import annotations

from mcp.server.auth.provider import AccessToken, TokenVerifier
from mcp.server.auth.settings import AuthSettings

READ = "donors:read"
WRITE = "donors:write"
APPROVE = "donors:approve"


def parse_token_table(spec: str) -> dict[str, list[str]]:
    raise NotImplementedError("Lesson m3-2: implement parse_token_table in tools/auth.py")


class StaticTokenVerifier(TokenVerifier):
    def __init__(self, table: dict[str, list[str]]):
        self.table = table

    async def verify_token(self, token: str) -> AccessToken | None:
        raise NotImplementedError("Lesson m3-2: implement StaticTokenVerifier.verify_token")


def current_scopes() -> list[str]:
    raise NotImplementedError("Lesson m3-2: implement current_scopes in tools/auth.py")


def require_scope(scope: str) -> dict | None:
    raise NotImplementedError("Lesson m3-2: implement require_scope in tools/auth.py")


def auth_settings(resource_url: str) -> AuthSettings:
    raise NotImplementedError("Lesson m3-2: implement auth_settings in tools/auth.py")
