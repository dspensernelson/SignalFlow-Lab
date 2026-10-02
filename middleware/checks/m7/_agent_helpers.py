"""Shared fixtures for the Module 7 checks: an in-process MCP server with
local read+write scopes and temp state databases."""

from __future__ import annotations

import os
from contextlib import contextmanager


@contextmanager
def agent_env(crm_url: str, tmp_path):
    saved = {k: os.environ.get(k) for k in ("CRM_URL", "APPROVALS_DB", "TASKS_DB", "MCP_LOCAL_SCOPES", "MCP_TOKENS")}
    os.environ["CRM_URL"] = crm_url
    os.environ["APPROVALS_DB"] = str(tmp_path / "approvals.db")
    os.environ["TASKS_DB"] = str(tmp_path / "tasks.db")
    os.environ["MCP_LOCAL_SCOPES"] = "donors:read,donors:write"
    os.environ.pop("MCP_TOKENS", None)
    try:
        yield
    finally:
        for k, v in saved.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v
