"""Check m5-1: migrations apply from empty, in order, once; the connection
context manager commits and rolls back; the Module 3/4 stores work on a
migrated file."""

from __future__ import annotations

import sqlite3

import pytest

from tools.db import StateDB

REQUIRED_TABLES = {
    "approvals": {"id", "tool", "arguments", "status", "requested_at", "decided_at", "decided_by", "result"},
    "idempotency": {"key", "result", "created_at"},
    "tasks": {"id", "kind", "params", "status", "created_at", "finished_at", "result", "error"},
    "memory": {"conversation_id", "key", "value", "expires_at"},
}


def _columns(path, table):
    conn = sqlite3.connect(path)
    try:
        return {r[1] for r in conn.execute(f"PRAGMA table_info({table})")}
    finally:
        conn.close()


def test_migrations_apply_from_empty_in_order_and_once(tmp_path):
    db = StateDB(tmp_path / "state.db")
    applied = db.migrate()
    assert len(applied) >= 4 and applied == sorted(applied)
    assert applied[0].startswith("001") and applied[3].startswith("004")
    assert db.schema_version() == len(applied)
    assert REQUIRED_TABLES.keys() <= db.tables()
    for table, cols in REQUIRED_TABLES.items():
        assert cols <= _columns(tmp_path / "state.db", table), f"{table} is missing columns"
    assert db.migrate() == [], "a second run must be a no-op"
    assert db.schema_version() == len(applied)


def test_new_migration_applies_incrementally(tmp_path):
    mig = tmp_path / "migrations"
    mig.mkdir()
    (mig / "001_a.sql").write_text("CREATE TABLE IF NOT EXISTS a (id INTEGER PRIMARY KEY);", encoding="utf-8")
    db = StateDB(tmp_path / "s.db", migrations_dir=mig)
    assert db.migrate() == ["001_a"]
    (mig / "002_b.sql").write_text("CREATE TABLE IF NOT EXISTS b (id INTEGER PRIMARY KEY);\nCREATE INDEX IF NOT EXISTS b_id ON b(id);", encoding="utf-8")
    assert db.migrate() == ["002_b"]
    assert db.tables() == {"a", "b"} and db.schema_version() == 2


def test_broken_migration_is_not_recorded(tmp_path):
    mig = tmp_path / "migrations"
    mig.mkdir()
    (mig / "001_ok.sql").write_text("CREATE TABLE IF NOT EXISTS ok (id INTEGER PRIMARY KEY);", encoding="utf-8")
    (mig / "002_bad.sql").write_text("CREATE TABLE nope (;", encoding="utf-8")
    db = StateDB(tmp_path / "s.db", migrations_dir=mig)
    with pytest.raises(sqlite3.Error):
        db.migrate()
    assert db.schema_version() == 1 and "ok" in db.tables()


def test_connection_commits_and_rolls_back(tmp_path):
    db = StateDB(tmp_path / "state.db")
    db.migrate()
    with db.connection() as conn:
        conn.execute("INSERT INTO idempotency (key, result, created_at) VALUES ('k1', NULL, 'now')")
    with pytest.raises(RuntimeError):
        with db.connection() as conn:
            conn.execute("INSERT INTO idempotency (key, result, created_at) VALUES ('k2', NULL, 'now')")
            raise RuntimeError("abort")
    with db.connection() as conn:
        keys = [r["key"] for r in conn.execute("SELECT key FROM idempotency ORDER BY key")]
    assert keys == ["k1"]


def test_module_3_and_4_stores_work_on_the_migrated_file(tmp_path):
    from tools.approvals import ApprovalStore
    from tools.idempotency import IdempotencyStore
    from tools.tasks import TaskStore

    path = tmp_path / "state.db"
    StateDB(path).migrate()
    aid = ApprovalStore(path).request("create_receipt", {"donation_id": 6})
    assert ApprovalStore(path).get(aid)["status"] == "pending"
    assert IdempotencyStore(path).begin("evt_1") is True
    tid = TaskStore(path).create("reconcile_month", {"year": 2026, "month": 3})
    assert TaskStore(path).get(tid)["status"] == "working"
    assert StateDB(path).migrate() == [], "the stores must not disturb the migration ledger"
