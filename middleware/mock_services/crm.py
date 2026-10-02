"""The donor CRM: a small REST API over SQLite.

This is the system of record for the scenario. It has no authentication on
purpose: who may call it, and whether a human approved a write, is the
middleware's job (Module 3), not the CRM's.

Endpoints
---------
GET  /health                      -> {"status": "ok", "service": "crm"}
GET  /donors?q=<text>             -> list of donors; q matches email exactly
                                     (case-insensitive) or first/last name
                                     by substring. Without q, all donors.
GET  /donors/{id}                 -> one donor, or 404 {"error": "not_found"}
GET  /donors/{id}/donations       -> that donor's donations, newest first
GET  /donations/{id}              -> one donation, or 404
POST /receipts                    -> create a receipt for a donation.
                                     Body: {donation_id, sent_to,
                                     idempotency_key?}. A repeated
                                     idempotency_key returns the original
                                     receipt with HTTP 200 instead of a new
                                     one with 201.
GET  /receipts                    -> all receipts (test visibility)
POST /_reset                      -> reload the seed data (tests only)
"""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .seed import seed_database


class ReceiptIn(BaseModel):
    donation_id: int
    sent_to: str = Field(min_length=3)
    idempotency_key: str | None = None


def _rows(cur: sqlite3.Cursor) -> list[dict]:
    cols = [c[0] for c in cur.description]
    return [dict(zip(cols, row)) for row in cur.fetchall()]


def create_crm_app(db_path: str | Path, *, seed: bool = True) -> FastAPI:
    db_path = str(db_path)
    if seed:
        seed_database(db_path)

    app = FastAPI(title="Lakeshore Food Pantry - Donor CRM (mock)")

    def connect() -> sqlite3.Connection:
        conn = sqlite3.connect(db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok", "service": "crm"}

    @app.get("/donors")
    def list_donors(q: str | None = Query(default=None)) -> list[dict]:
        conn = connect()
        try:
            if not q:
                cur = conn.execute("SELECT * FROM donors ORDER BY last_name, first_name")
                return _rows(cur)
            needle = q.strip().lower()
            cur = conn.execute(
                "SELECT * FROM donors WHERE lower(email) = ? "
                "OR lower(first_name) LIKE ? OR lower(last_name) LIKE ? "
                "OR lower(first_name || ' ' || last_name) LIKE ? "
                "ORDER BY last_name, first_name",
                (needle, f"%{needle}%", f"%{needle}%", f"%{needle}%"),
            )
            return _rows(cur)
        finally:
            conn.close()

    @app.get("/donors/{donor_id}")
    def get_donor(donor_id: int) -> dict:
        conn = connect()
        try:
            cur = conn.execute("SELECT * FROM donors WHERE id = ?", (donor_id,))
            rows = _rows(cur)
        finally:
            conn.close()
        if not rows:
            raise HTTPException(status_code=404, detail={"error": "not_found", "donor_id": donor_id})
        return rows[0]

    @app.get("/donors/{donor_id}/donations")
    def donor_donations(donor_id: int) -> list[dict]:
        conn = connect()
        try:
            exists = conn.execute("SELECT 1 FROM donors WHERE id = ?", (donor_id,)).fetchone()
            if not exists:
                raise HTTPException(status_code=404, detail={"error": "not_found", "donor_id": donor_id})
            cur = conn.execute(
                "SELECT * FROM donations WHERE donor_id = ? ORDER BY received_at DESC", (donor_id,)
            )
            return _rows(cur)
        finally:
            conn.close()

    @app.get("/donations/{donation_id}")
    def get_donation(donation_id: int) -> dict:
        conn = connect()
        try:
            rows = _rows(conn.execute("SELECT * FROM donations WHERE id = ?", (donation_id,)))
        finally:
            conn.close()
        if not rows:
            raise HTTPException(status_code=404, detail={"error": "not_found", "donation_id": donation_id})
        return rows[0]

    @app.post("/receipts")
    def create_receipt(body: ReceiptIn) -> JSONResponse:
        conn = connect()
        try:
            donation = conn.execute("SELECT id FROM donations WHERE id = ?", (body.donation_id,)).fetchone()
            if not donation:
                raise HTTPException(
                    status_code=404, detail={"error": "not_found", "donation_id": body.donation_id}
                )
            if body.idempotency_key:
                existing = _rows(
                    conn.execute("SELECT * FROM receipts WHERE idempotency_key = ?", (body.idempotency_key,))
                )
                if existing:
                    return JSONResponse(status_code=200, content={**existing[0], "duplicate": True})
            sent_at = datetime.now(timezone.utc).isoformat()
            cur = conn.execute(
                "INSERT INTO receipts (donation_id, sent_to, sent_at, idempotency_key) VALUES (?,?,?,?)",
                (body.donation_id, body.sent_to, sent_at, body.idempotency_key),
            )
            conn.commit()
            created = _rows(conn.execute("SELECT * FROM receipts WHERE id = ?", (cur.lastrowid,)))[0]
            return JSONResponse(status_code=201, content={**created, "duplicate": False})
        finally:
            conn.close()

    @app.get("/receipts")
    def list_receipts() -> list[dict]:
        conn = connect()
        try:
            return _rows(conn.execute("SELECT * FROM receipts ORDER BY id"))
        finally:
            conn.close()

    @app.post("/_reset")
    def reset() -> dict:
        seed_database(db_path)
        return {"status": "reset"}

    return app
