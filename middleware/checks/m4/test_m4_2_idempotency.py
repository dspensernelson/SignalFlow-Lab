"""Check m4-2: the same webhook delivered three times produces one receipt;
the store persists; unmatched and ignored events are remembered too."""

from __future__ import annotations

import copy

import httpx

from mock_services.payments import SAMPLE_EVENTS
from tools.client import DonorClient
from tools.idempotency import IdempotencyStore
from tools.webhook import handle_webhook


def test_store_claims_and_remembers(tmp_path):
    store = IdempotencyStore(tmp_path / "idem.db")
    assert store.get("evt_1") is None
    assert store.begin("evt_1") is True
    assert store.begin("evt_1") is False
    store.remember("evt_1", {"status": "processed", "receipt_id": 7})
    assert store.get("evt_1") == {"status": "processed", "receipt_id": 7}
    assert IdempotencyStore(tmp_path / "idem.db").get("evt_1")["receipt_id"] == 7


def test_same_webhook_three_times_is_one_receipt(fresh_crm, tmp_path):
    store = IdempotencyStore(tmp_path / "idem.db")
    client = DonorClient(fresh_crm.base_url)
    event = copy.deepcopy(SAMPLE_EVENTS[0])  # Maria Alvarez, ch_338804917

    first = handle_webhook(event, store, client)
    assert first["status"] == "processed" and first["receipt_id"] and first["donor_id"] == 1
    second = handle_webhook(event, store, client)
    third = handle_webhook(event, store, client)
    assert second["status"] == "duplicate" and third["status"] == "duplicate"
    assert second["receipt_id"] == first["receipt_id"] == third["receipt_id"]

    receipts = httpx.get(f"{fresh_crm.base_url}/receipts").json()
    assert len(receipts) == 1
    assert receipts[0]["idempotency_key"] == event["id"]


def test_crm_level_key_protects_a_crash_between_steps(fresh_crm, tmp_path):
    """Even if the local store forgot (a crash after the POST), the CRM key dedupes."""
    client = DonorClient(fresh_crm.base_url)
    event = copy.deepcopy(SAMPLE_EVENTS[0])  # Maria, ch_338804917 (seeded)
    first = handle_webhook(event, IdempotencyStore(tmp_path / "a.db"), client)
    assert first["status"] == "processed"
    again = handle_webhook(event, IdempotencyStore(tmp_path / "b.db"), client)  # fresh store, same event
    assert again["status"] in ("processed", "duplicate")
    assert len(httpx.get(f"{fresh_crm.base_url}/receipts").json()) == 1


def test_unmatched_and_ignored_events_are_remembered(fresh_crm, tmp_path):
    store = IdempotencyStore(tmp_path / "idem.db")
    client = DonorClient(fresh_crm.base_url)
    stranger = copy.deepcopy(SAMPLE_EVENTS[0])
    stranger["id"] = "evt_stranger"
    stranger["data"]["object"]["billing_details"]["email"] = "nobody@example.org"
    stranger["data"]["object"]["id"] = "ch_stranger"
    r = handle_webhook(stranger, store, client)
    assert r["status"] == "unmatched" and r["donor_email"] == "nobody@example.org"
    assert handle_webhook(stranger, store, client)["status"] == "duplicate"

    refund = copy.deepcopy(SAMPLE_EVENTS[2])
    assert handle_webhook(refund, store, client)["status"] == "ignored"
    assert handle_webhook(refund, store, client)["status"] == "duplicate"
    assert httpx.get(f"{fresh_crm.base_url}/receipts").json() == []
