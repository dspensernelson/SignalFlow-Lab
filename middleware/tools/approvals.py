"""Lesson m3-3: the approval gate. A write is a request until a person says yes.

Read tools answer immediately. Write tools do not execute: they record a
pending approval and return its id. A second tool, callable only with the
``donors:approve`` scope, executes the recorded write. Unapproved writes
never reach the CRM, however confused or manipulated the model is.

Spec (the checks assert this):

- ``ApprovalStore(db_path)`` owns a SQLite table ``approvals``
  (id TEXT primary key, tool TEXT, arguments TEXT json, status TEXT
  pending|approved|rejected, requested_at, decided_at, decided_by,
  result TEXT json). ``__init__`` creates the table if missing.
- ``request(tool, arguments) -> str`` inserts a pending row and returns a
  new id (``uuid4().hex[:12]``).
- ``get(approval_id) -> dict | None``; ``list_pending() -> list[dict]``.
- ``approve(approval_id, decided_by, execute) -> dict`` where ``execute`` is
  ``Callable[[str, dict], dict]`` (the registry's call): runs the write once,
  stores its result, marks the row approved, and returns the result. A
  second approve of the same id returns ``error_result("not_found", ...)``
  with ``details.status = "approved"`` and does NOT execute again.
  An unknown id returns ``not_found``.
- ``reject(approval_id, decided_by) -> dict`` marks it rejected.

Wiring (``mcp_server/server.py``): ``create_receipt`` now calls
``require_scope(WRITE)`` and then ``store.request(...)`` and returns
``error_result("pending_approval", ..., approval_id=...)``; new tools
``list_pending_approvals()`` and ``approve_pending(approval_id, decided_by)``
require ``donors:approve``. The store path comes from ``Settings.approvals_db``
(``APPROVALS_DB``).
"""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any, Callable


class ApprovalStore:
    def __init__(self, db_path: str | Path):
        self.db_path = str(db_path)
        raise NotImplementedError("Lesson m3-3: create the approvals table in ApprovalStore.__init__")

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def request(self, tool: str, arguments: dict[str, Any]) -> str:
        raise NotImplementedError("Lesson m3-3: implement ApprovalStore.request")

    def get(self, approval_id: str) -> dict[str, Any] | None:
        raise NotImplementedError("Lesson m3-3: implement ApprovalStore.get")

    def list_pending(self) -> list[dict[str, Any]]:
        raise NotImplementedError("Lesson m3-3: implement ApprovalStore.list_pending")

    def approve(self, approval_id: str, decided_by: str, execute: Callable[[str, dict[str, Any]], dict[str, Any]]) -> dict[str, Any]:
        raise NotImplementedError("Lesson m3-3: implement ApprovalStore.approve")

    def reject(self, approval_id: str, decided_by: str) -> dict[str, Any]:
        raise NotImplementedError("Lesson m3-3: implement ApprovalStore.reject")
