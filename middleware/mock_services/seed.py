"""Seed the donor CRM's SQLite database from seed_data.json.

12 donors and 40 donations. Two donors have near-duplicate names (Maria
Alvarez and Maria Alvarez-Reyes) so lookups must be precise, donor 7 is
lapsed (no gifts in the current year), and donor 6's notes carry a prompt
injection string on purpose for Module 6.
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path

SEED_PATH = Path(__file__).with_name("seed_data.json")

SCHEMA = """
CREATE TABLE IF NOT EXISTS donors (
  id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY,
  donor_id INTEGER NOT NULL REFERENCES donors(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  received_at TEXT NOT NULL,
  method TEXT NOT NULL,
  processor_ref TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS receipts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id INTEGER NOT NULL REFERENCES donations(id),
  sent_to TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'sent'
);
"""


def load_seed() -> dict:
    with SEED_PATH.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def seed_database(db_path: str | Path) -> None:
    """Create the schema and (re)load the seed rows. Idempotent."""
    data = load_seed()
    conn = sqlite3.connect(str(db_path))
    try:
        conn.executescript(SCHEMA)
        conn.execute("DELETE FROM receipts")
        conn.execute("DELETE FROM donations")
        conn.execute("DELETE FROM donors")
        conn.executemany(
            "INSERT INTO donors (id, first_name, last_name, email, phone, created_at, notes) VALUES (?,?,?,?,?,?,?)",
            [
                (d["id"], d["first_name"], d["last_name"], d["email"], d["phone"], d["created_at"], d["notes"])
                for d in data["donors"]
            ],
        )
        conn.executemany(
            "INSERT INTO donations (id, donor_id, amount_cents, currency, received_at, method, processor_ref) VALUES (?,?,?,?,?,?,?)",
            [
                (g["id"], g["donor_id"], g["amount_cents"], g["currency"], g["received_at"], g["method"], g["processor_ref"])
                for g in data["donations"]
            ],
        )
        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":  # pragma: no cover - manual use
    import sys

    target = sys.argv[1] if len(sys.argv) > 1 else "crm.db"
    seed_database(target)
    print(f"seeded {target}")
