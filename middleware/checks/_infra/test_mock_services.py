"""Self-tests for the mock services and fixtures. These are NOT lesson checks;
they prove the scaffolding every lesson check relies on (and they run in CI).
"""

from __future__ import annotations

import httpx


def test_crm_is_seeded(fresh_crm):
    donors = httpx.get(f"{fresh_crm.base_url}/donors").json()
    assert len(donors) == 12
    assert {"id", "first_name", "last_name", "email", "notes"} <= set(donors[0])


def test_crm_search_is_precise_about_near_duplicates(fresh_crm):
    by_email = httpx.get(f"{fresh_crm.base_url}/donors", params={"q": "MARIA.ALVAREZ@example.org"}).json()
    assert [d["id"] for d in by_email] == [1]
    by_name = httpx.get(f"{fresh_crm.base_url}/donors", params={"q": "alvarez"}).json()
    assert sorted(d["id"] for d in by_name) == [1, 2]


def test_crm_404_shape(fresh_crm):
    r = httpx.get(f"{fresh_crm.base_url}/donors/999")
    assert r.status_code == 404
    assert r.json()["detail"]["error"] == "not_found"


def test_crm_donations_newest_first_and_lapsed_donor(fresh_crm):
    gifts = httpx.get(f"{fresh_crm.base_url}/donors/1/donations").json()
    assert gifts == sorted(gifts, key=lambda g: g["received_at"], reverse=True)
    lapsed = httpx.get(f"{fresh_crm.base_url}/donors/7/donations").json()
    assert lapsed and all(g["received_at"] < "2026" for g in lapsed)


def test_crm_receipts_honor_idempotency_key(fresh_crm):
    body = {"donation_id": 6, "sent_to": "maria.alvarez@example.org", "idempotency_key": "evt_test_1"}
    first = httpx.post(f"{fresh_crm.base_url}/receipts", json=body)
    second = httpx.post(f"{fresh_crm.base_url}/receipts", json=body)
    assert first.status_code == 201 and first.json()["duplicate"] is False
    assert second.status_code == 200 and second.json()["duplicate"] is True
    assert second.json()["id"] == first.json()["id"]
    assert len(httpx.get(f"{fresh_crm.base_url}/receipts").json()) == 1


def test_crm_reset_clears_receipts(fresh_crm):
    httpx.post(f"{fresh_crm.base_url}/receipts", json={"donation_id": 6, "sent_to": "x@example.org"})
    fresh_crm.reset()
    assert httpx.get(f"{fresh_crm.base_url}/receipts").json() == []


def test_email_records_sends(fresh_email):
    r = httpx.post(f"{fresh_email.base_url}/send", json={"to": "a@example.org", "subject": "Hi", "body": "Thanks"})
    assert r.status_code == 202 and r.json()["status"] == "sent"
    assert len(httpx.get(f"{fresh_email.base_url}/_sent").json()) == 1


def test_payments_sample_events_and_fail_sequence(fresh_payments):
    events = httpx.get(f"{fresh_payments.base_url}/events").json()
    assert events[0]["type"] == "charge.succeeded"
    assert events[0]["data"]["object"]["amount"] == 7500

    url = f"{fresh_payments.base_url}/confirm"
    headers = {"Idempotency-Key": "k1", "X-Fail-Sequence": "500,429,ok"}
    body = {"charge_id": "ch_1", "amount_cents": 100}
    assert httpx.post(url, json=body, headers=headers).status_code == 500
    r2 = httpx.post(url, json=body, headers=headers)
    assert r2.status_code == 429 and r2.headers.get("retry-after") == "1"
    r3 = httpx.post(url, json=body, headers=headers)
    assert r3.status_code == 200 and r3.json()["attempt"] == 3
    assert httpx.get(f"{fresh_payments.base_url}/_attempts").json() == {"k1": 3}


def test_payments_timeout_entry_exceeds_a_short_client_timeout(fresh_payments, monkeypatch):
    import mock_services.payments as payments

    monkeypatch.setattr(payments, "TIMEOUT_SLEEP_SECONDS", 1.0)
    url = f"{fresh_payments.base_url}/confirm"
    headers = {"Idempotency-Key": "k2", "X-Fail-Sequence": "timeout,ok"}
    body = {"charge_id": "ch_2", "amount_cents": 100}
    try:
        httpx.post(url, json=body, headers=headers, timeout=0.3)
        raised = False
    except httpx.TimeoutException:
        raised = True
    assert raised
    r = httpx.post(url, json=body, headers=headers, timeout=5)
    assert r.status_code == 200 and r.json()["attempt"] == 2
