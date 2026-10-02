"""Lesson m4-2: the webhook handler, end to end and exactly-once in effect.

A ``charge.succeeded`` event arrives (possibly three times). The handler:

1. ``store.get(event["id"])`` -> if present, return it with
   ``status: "duplicate"`` (no network at all);
2. ``store.begin(event["id"])`` -> if False (another worker has it), return
   ``{"status": "in_progress"}``;
3. transform it with ``tools.transform.webhook_to_donation`` (Module 0);
4. find the donor by the record's email with ``client.find_donors``; no
   match -> result ``{"status": "unmatched", "donor_email": ...}`` (still
   remembered: a replay must not re-run the search either);
5. create the receipt at the CRM with ``POST {crm}/receipts`` using
   ``idempotency_key = event["id"]`` (the CRM honors it);
6. ``store.remember(event id, result)`` and return
   ``{"status": "processed", "receipt_id": ..., "donor_id": ...,
   "processor_ref": ...}``.

Unsupported event types return ``{"status": "ignored", "type": ...}`` and
are remembered too.

Spec: ``handle_webhook(event: dict, store: IdempotencyStore,
client: DonorClient) -> dict``.
"""

from __future__ import annotations

from typing import Any

from tools.client import DonorClient
from tools.idempotency import IdempotencyStore


def handle_webhook(event: dict[str, Any], store: IdempotencyStore, client: DonorClient) -> dict[str, Any]:
    raise NotImplementedError("Lesson m4-2: implement handle_webhook in tools/webhook.py")
