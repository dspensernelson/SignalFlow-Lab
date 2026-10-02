"""Lesson m5-1: one state database, owned by migrations.

Stateless means no per-connection memory, not no database. Modules 3 and 4
each created their own table on the fly. This lesson consolidates them into
one schema that is created and evolved by numbered migration files, so
every copy of the server, and every laptop the client runs it on, has the
same tables with the same columns, and a change to the schema is a file in
git with a number, not a surprise.

Spec (the check asserts this):

- Migration files live in ``tools/migrations/NNN_<name>.sql`` (NNN = 001,
  002, ...). Each is plain SQL (several statements are fine). You write:
      001_approvals.sql    the approvals table from Module 3.3
      002_idempotency.sql  the idempotency table from Module 4.2
      003_tasks.sql        the tasks table from Module 4.3
      004_memory.sql       the memory table for Module 5.2 (see tools/memory.py)
  Use ``CREATE TABLE IF NOT EXISTS`` with exactly the columns the stores
  expect, so the Module 3/4 stores keep working on a migrated file.
- ``StateDB(db_path, migrations_dir=None)``; ``migrations_dir`` defaults to
  the directory above.
- ``migrate() -> list[str]`` applies every migration not yet recorded in
  ``schema_migrations`` (version TEXT primary key, applied_at TEXT), in
  numeric order, each in its own transaction; returns the names applied
  (empty when nothing was pending). Running it twice is a no-op.
- ``schema_version() -> int``: the number of applied migrations.
- ``tables() -> set[str]``: user table names (excluding sqlite_* and
  schema_migrations).
- ``connection()`` is a context manager yielding a ``sqlite3.Connection``
  with ``row_factory = sqlite3.Row`` that COMMITS on normal exit and
  ROLLS BACK when an exception escapes, then closes.

Python you need: context managers (``@contextmanager`` or ``__enter__`` /
``__exit__``).
"""

from __future__ import annotations

import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

MIGRATIONS_DIR = Path(__file__).with_name("migrations")


class StateDB:
    def __init__(self, db_path: str | Path, migrations_dir: str | Path | None = None):
        self.db_path = str(db_path)
        self.migrations_dir = Path(migrations_dir) if migrations_dir else MIGRATIONS_DIR

    @contextmanager
    def connection(self) -> Iterator[sqlite3.Connection]:
        raise NotImplementedError("Lesson m5-1: implement StateDB.connection as a context manager")

    def migrate(self) -> list[str]:
        raise NotImplementedError("Lesson m5-1: implement StateDB.migrate")

    def schema_version(self) -> int:
        raise NotImplementedError("Lesson m5-1: implement StateDB.schema_version")

    def tables(self) -> set[str]:
        raise NotImplementedError("Lesson m5-1: implement StateDB.tables")
