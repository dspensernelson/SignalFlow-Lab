"""Lesson m4-2: an idempotency store. Same key, same result, no second effect.

Processors deliver webhooks at least once. The middleware must make the
business effect happen at most once. Two layers do that: a local store that
remembers every event id it has fully handled (and the result), and the
idempotency key passed to the CRM so a crash between the two cannot
duplicate either.

Spec (the check asserts this):

- ``IdempotencyStore(db_path)`` owns a SQLite table ``idempotency``
  (key TEXT primary key, result TEXT json, created_at TEXT).
- ``get(key) -> dict | None`` returns the stored result or None.
- ``remember(key, result) -> None`` stores it (INSERT OR REPLACE).
- ``begin(key) -> bool`` claims a key atomically: True the first time
  (inserts a row with result NULL), False if the key exists already in any
  state. Use it before doing the work, then ``remember`` after.
- Persistence: a new IdempotencyStore on the same path sees earlier keys.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any


class IdempotencyStore:
    def __init__(self, db_path: str | Path):
        self.db_path = str(db_path)
        raise NotImplementedError("Lesson m4-2: create the idempotency table in IdempotencyStore.__init__")

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def get(self, key: str) -> dict[str, Any] | None:
        raise NotImplementedError("Lesson m4-2: implement IdempotencyStore.get")

    def begin(self, key: str) -> bool:
        raise NotImplementedError("Lesson m4-2: implement IdempotencyStore.begin")

    def remember(self, key: str, result: dict[str, Any]) -> None:
        raise NotImplementedError("Lesson m4-2: implement IdempotencyStore.remember")
