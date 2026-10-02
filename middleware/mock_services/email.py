"""The email / receipt service: records what it was asked to send.

Endpoints
---------
GET  /health         -> {"status": "ok", "service": "email"}
POST /send           -> body {to, subject, body}; returns {id, status: "sent"}
GET  /_sent          -> every message sent so far (test visibility)
POST /_reset         -> forget everything
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import FastAPI
from pydantic import BaseModel, Field


class MessageIn(BaseModel):
    to: str = Field(min_length=3)
    subject: str = Field(min_length=1)
    body: str = Field(min_length=1)


def create_email_app() -> FastAPI:
    app = FastAPI(title="Email / receipt service (mock)")
    sent: list[dict] = []

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok", "service": "email"}

    @app.post("/send", status_code=202)
    def send(msg: MessageIn) -> dict:
        record = {
            "id": len(sent) + 1,
            "to": msg.to,
            "subject": msg.subject,
            "body": msg.body,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "status": "sent",
        }
        sent.append(record)
        return record

    @app.get("/_sent")
    def list_sent() -> list[dict]:
        return list(sent)

    @app.post("/_reset")
    def reset() -> dict:
        sent.clear()
        return {"status": "reset"}

    return app
