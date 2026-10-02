"""Lesson m4-3: long-running work as a task: a durable handle, polled.

The 2026-07-28 spec moved tasks into an official extension
(``io.modelcontextprotocol/tasks``): a tool may return a task handle at once
and the client polls ``tasks/get`` until it is done. SDK support for the
extension is still settling, so this lesson implements the same pattern as
two ordinary tools, which every host can already call:

    reconcile_month(year, month)  -> {"task_id": ..., "status": "working"}
    get_task(task_id)             -> {"task_id", "status", "result"?, "error"?}

The work runs in a background thread inside the server process and its
state lives in SQLite, so a client that disconnects and comes back (or a
second client) can finish the poll. Statuses: ``working`` ->
``completed`` | ``failed``.

Spec (the check asserts this):

- ``TaskStore(db_path)`` owns table ``tasks`` (id TEXT primary key, kind
  TEXT, params TEXT json, status TEXT, created_at, finished_at, result TEXT
  json, error TEXT).
- ``create(kind, params) -> task_id`` (uuid4 hex[:12], status working).
- ``get(task_id) -> dict | None`` with ``params`` and ``result`` parsed.
- ``complete(task_id, result)`` / ``fail(task_id, error)``.
- ``run_in_background(task_id, fn, *args) -> threading.Thread`` starts a
  daemon thread that calls ``fn(*args)`` and records complete/fail.
- ``reconcile_month(client, year, month, *, per_donor_delay=0.05) -> dict``
  walks every donor's donations for that month and returns
  ``{"year", "month", "donation_count", "total_cents", "by_donor":
  [{"donor_id", "name", "count", "total_cents"}], "durationMs"}``,
  sleeping ``per_donor_delay`` per donor so the task visibly takes time.

Wiring (``mcp_server/server.py``): tools ``reconcile_month(year: int,
month: int)`` (requires donors:read) and ``get_task(task_id: str)``; the
store path is ``TASKS_DB`` (default ``tasks.db``).
"""

from __future__ import annotations

import sqlite3
import threading
from pathlib import Path
from typing import Any, Callable

from tools.client import DonorClient


class TaskStore:
    def __init__(self, db_path: str | Path):
        self.db_path = str(db_path)
        raise NotImplementedError("Lesson m4-3: create the tasks table in TaskStore.__init__")

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def create(self, kind: str, params: dict[str, Any]) -> str:
        raise NotImplementedError("Lesson m4-3: implement TaskStore.create")

    def get(self, task_id: str) -> dict[str, Any] | None:
        raise NotImplementedError("Lesson m4-3: implement TaskStore.get")

    def complete(self, task_id: str, result: dict[str, Any]) -> None:
        raise NotImplementedError("Lesson m4-3: implement TaskStore.complete")

    def fail(self, task_id: str, error: str) -> None:
        raise NotImplementedError("Lesson m4-3: implement TaskStore.fail")

    def run_in_background(self, task_id: str, fn: Callable[..., dict[str, Any]], *args: Any) -> threading.Thread:
        raise NotImplementedError("Lesson m4-3: implement TaskStore.run_in_background")


def reconcile_month(client: DonorClient, year: int, month: int, *, per_donor_delay: float = 0.05) -> dict[str, Any]:
    raise NotImplementedError("Lesson m4-3: implement reconcile_month in tools/tasks.py")
