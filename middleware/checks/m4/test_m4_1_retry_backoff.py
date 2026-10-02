"""Check m4-1: a scripted failure sequence results in exactly one success
with the expected number of attempts and growing backoff; a 4xx is never
retried."""

from __future__ import annotations

import httpx
import pytest

from tools.payments import PaymentsClient, PaymentsError
from tools.retry import RetryableError, is_retryable_status, retry


def test_retryable_statuses():
    assert is_retryable_status(429) and is_retryable_status(500) and is_retryable_status(503)
    assert not is_retryable_status(400) and not is_retryable_status(404) and not is_retryable_status(200)


def test_decorator_backs_off_exponentially_with_jitter():
    delays: list[float] = []
    calls = {"n": 0}

    @retry(max_attempts=4, base_delay=0.2, max_delay=2.0, jitter=True, sleep=delays.append)
    def flaky():
        calls["n"] += 1
        if calls["n"] < 3:
            raise RetryableError("boom", status=503)
        return "ok"

    assert flaky() == "ok"
    assert calls["n"] == 3 and flaky.last_attempts == 3
    assert len(delays) == 2
    assert 0.1 <= delays[0] <= 0.3 and 0.2 <= delays[1] <= 0.6, delays
    assert delays[1] > delays[0] * 0.9


def test_decorator_gives_up_after_max_attempts_and_reraises():
    delays: list[float] = []

    @retry(max_attempts=3, base_delay=0.1, jitter=False, sleep=delays.append)
    def always():
        raise RetryableError("down", status=500)

    with pytest.raises(RetryableError):
        always()
    assert always.last_attempts == 3 and delays == [0.1, 0.2]


def test_decorator_does_not_retry_other_exceptions():
    delays: list[float] = []

    @retry(max_attempts=4, sleep=delays.append)
    def bad():
        raise ValueError("schema changed")

    with pytest.raises(ValueError):
        bad()
    assert bad.last_attempts == 1 and delays == []


def test_retry_after_is_honored():
    delays: list[float] = []
    n = {"n": 0}

    @retry(max_attempts=3, base_delay=0.1, jitter=False, sleep=delays.append)
    def limited():
        n["n"] += 1
        if n["n"] == 1:
            raise RetryableError("slow down", status=429, retry_after=1.5)
        return 1

    assert limited() == 1 and delays == [1.5]


def test_timeout_then_500_then_ok_succeeds_on_third_attempt(fresh_payments, monkeypatch):
    import mock_services.payments as payments

    monkeypatch.setattr(payments, "TIMEOUT_SLEEP_SECONDS", 1.0)
    delays: list[float] = []
    client = PaymentsClient(fresh_payments.base_url, timeout=0.3, sleep=delays.append)
    result = client.confirm("ch_1", 7500, "evt_retry_1", fail_sequence="timeout,500,ok")
    assert result["confirmed"] is True and result["attempt"] == 3
    assert client.last_attempts == 3
    assert httpx.get(f"{fresh_payments.base_url}/_attempts").json()["evt_retry_1"] == 3
    assert len(delays) == 2 and delays[1] >= delays[0] * 0.9


def test_bad_request_is_not_retried(fresh_payments):
    client = PaymentsClient(fresh_payments.base_url, timeout=1.0, sleep=lambda s: None)
    with pytest.raises(PaymentsError) as info:
        client.confirm("ch_2", 100, "evt_bad_1", fail_sequence="400,ok")
    assert info.value.status == 400 and info.value.attempts == 1
    assert httpx.get(f"{fresh_payments.base_url}/_attempts").json()["evt_bad_1"] == 1


def test_persistent_outage_raises_after_four_attempts(fresh_payments):
    client = PaymentsClient(fresh_payments.base_url, timeout=1.0, sleep=lambda s: None)
    with pytest.raises(PaymentsError) as info:
        client.confirm("ch_3", 100, "evt_down_1", fail_sequence="503,503,503,503,503")
    assert info.value.attempts == 4
    assert httpx.get(f"{fresh_payments.base_url}/_attempts").json()["evt_down_1"] == 4
