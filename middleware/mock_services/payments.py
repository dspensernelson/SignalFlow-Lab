"""The payment processor: flaky on purpose.

Two jobs:

1. It delivers webhook events (the payloads Module 0 transforms and Module
   4 deduplicates). ``GET /events`` lists sample events; the same event can
   be delivered more than once, which is how real processors behave
   ("at-least-once delivery").

2. Its ``POST /confirm`` endpoint is the thing the middleware must call
   reliably in Module 4. Its behavior is scripted per request with the
   ``X-Fail-Sequence`` header (or the ``PAYMENTS_FAIL_SEQUENCE`` env var):
   a comma-separated list consumed one entry per attempt, keyed by the
   request's ``Idempotency-Key`` header (or the charge id when absent).

       X-Fail-Sequence: timeout,500,ok

   means: attempt 1 hangs (longer than any sane client timeout), attempt 2
   returns HTTP 500, attempt 3 succeeds, and every later attempt succeeds.
   Entries: ``timeout`` | ``500`` | ``503`` | ``429`` | ``400`` | ``ok``.

Endpoints
---------
GET  /health                 -> {"status": "ok", "service": "payments"}
GET  /events                 -> sample webhook events (list)
GET  /events/{event_id}      -> one event, or 404
POST /confirm                -> scripted; body {charge_id, amount_cents}
GET  /_attempts              -> attempts seen per key (test visibility)
POST /_reset                 -> forget attempt counters
"""

from __future__ import annotations

import os
import time
from collections import defaultdict

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# How long a "timeout" entry sleeps. Clients in this track use 1-2 s timeouts.
TIMEOUT_SLEEP_SECONDS = float(os.environ.get("PAYMENTS_TIMEOUT_SLEEP", "3"))

SAMPLE_EVENTS: list[dict] = [
    {
        "id": "evt_01HZX4Q0001",
        "type": "charge.succeeded",
        "created": 1769347200,
        "livemode": False,
        "data": {
            "object": {
                "id": "ch_338804917",
                "amount": 7500,
                "currency": "usd",
                "status": "succeeded",
                "payment_method_details": {"type": "ach_debit"},
                "billing_details": {
                    "name": "Maria Alvarez",
                    "email": "maria.alvarez@example.org",
                },
                "metadata": {"campaign": "spring-appeal", "donor_id": "1"},
            }
        },
    },
    {
        "id": "evt_01HZX4Q0002",
        "type": "charge.succeeded",
        "created": 1769433600,
        "livemode": False,
        "data": {
            "object": {
                "id": "ch_990011223",
                "amount": 12000,
                "currency": "usd",
                "status": "succeeded",
                "payment_method_details": {"type": "card"},
                "billing_details": {
                    "name": "Priya Natarajan",
                    "email": "PRIYA.N@EXAMPLE.ORG",
                },
                "metadata": {"campaign": "spring-appeal"},
            }
        },
    },
    {
        "id": "evt_01HZX4Q0003",
        "type": "charge.refunded",
        "created": 1769520000,
        "livemode": False,
        "data": {
            "object": {
                "id": "ch_156942688",
                "amount": 3000,
                "amount_refunded": 3000,
                "currency": "usd",
                "status": "succeeded",
                "payment_method_details": {"type": "card"},
                "billing_details": {"name": "Maria Alvarez", "email": "maria.alvarez@example.org"},
                "metadata": {},
            }
        },
    },
]


class ConfirmIn(BaseModel):
    charge_id: str
    amount_cents: int


def create_payments_app() -> FastAPI:
    app = FastAPI(title="Payment processor (mock, flaky)")
    attempts: dict[str, int] = defaultdict(int)

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok", "service": "payments"}

    @app.get("/events")
    def events() -> list[dict]:
        return SAMPLE_EVENTS

    @app.get("/events/{event_id}")
    def event(event_id: str) -> dict:
        for e in SAMPLE_EVENTS:
            if e["id"] == event_id:
                return e
        raise HTTPException(status_code=404, detail={"error": "not_found", "event_id": event_id})

    @app.post("/confirm")
    def confirm(
        body: ConfirmIn,
        request: Request,
        idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
        fail_sequence: str | None = Header(default=None, alias="X-Fail-Sequence"),
    ) -> JSONResponse:
        key = idempotency_key or body.charge_id
        attempts[key] += 1
        attempt = attempts[key]
        script = (fail_sequence or os.environ.get("PAYMENTS_FAIL_SEQUENCE", "") or "ok").split(",")
        script = [s.strip().lower() for s in script if s.strip()]
        entry = script[attempt - 1] if attempt - 1 < len(script) else "ok"
        if entry == "timeout":
            time.sleep(TIMEOUT_SLEEP_SECONDS)
            entry = "ok"  # a client that waited long enough gets a success
        if entry in {"500", "503"}:
            return JSONResponse(status_code=int(entry), content={"error": "upstream_unavailable", "attempt": attempt})
        if entry == "429":
            return JSONResponse(
                status_code=429,
                content={"error": "rate_limited", "attempt": attempt},
                headers={"Retry-After": "1"},
            )
        if entry == "400":
            return JSONResponse(status_code=400, content={"error": "bad_request", "attempt": attempt})
        return JSONResponse(
            status_code=200,
            content={
                "confirmed": True,
                "charge_id": body.charge_id,
                "amount_cents": body.amount_cents,
                "attempt": attempt,
                "idempotency_key": idempotency_key,
            },
        )

    @app.get("/_attempts")
    def list_attempts() -> dict:
        return dict(attempts)

    @app.post("/_reset")
    def reset() -> dict:
        attempts.clear()
        return {"status": "reset"}

    return app
