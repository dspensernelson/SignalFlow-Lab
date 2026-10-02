"""Check m4-4: the limiter caps calls per window and refills with the clock;
the breaker opens after N failures, half-opens after recovery, closes on
success and reopens on failure; guarded() wires both around a call."""

from __future__ import annotations

import pytest

from tools.limits import CircuitBreaker, CircuitOpen, RateLimited, RateLimiter, guarded
from tools.retry import RetryableError


class FakeClock:
    def __init__(self):
        self.t = 1000.0

    def __call__(self):
        return self.t

    def advance(self, s):
        self.t += s


def test_rate_limiter_sliding_window():
    clock = FakeClock()
    lim = RateLimiter(3, 10.0, clock=clock)
    assert [lim.acquire() for _ in range(3)] == [True, True, True]
    assert lim.acquire() is False
    assert 9.0 <= lim.wait_time() <= 10.0
    clock.advance(10.01)
    assert lim.wait_time() == 0.0
    assert lim.acquire() is True


def test_breaker_state_machine():
    clock = FakeClock()
    br = CircuitBreaker(failure_threshold=3, recovery_seconds=30.0, clock=clock)
    assert br.state == "closed" and br.allow()
    br.record_failure(); br.record_success(); br.record_failure(); br.record_failure()
    assert br.state == "closed", "a success in between resets the count"
    br.record_failure()
    assert br.state == "open" and br.allow() is False
    clock.advance(29.0)
    assert br.allow() is False
    clock.advance(1.5)
    assert br.allow() is True and br.state == "half_open"
    br.record_failure()
    assert br.state == "open" and br.allow() is False
    clock.advance(31.0)
    assert br.allow() is True
    br.record_success()
    assert br.state == "closed" and br.allow() is True


def test_guarded_decorator():
    clock = FakeClock()
    lim = RateLimiter(2, 60.0, clock=clock)
    br = CircuitBreaker(failure_threshold=2, recovery_seconds=5.0, clock=clock)
    calls = {"n": 0}

    @guarded(lim, br)
    def call(fail=False):
        calls["n"] += 1
        if fail:
            raise RetryableError("upstream", status=503)
        return "ok"

    assert call() == "ok"
    with pytest.raises(RetryableError):
        call(fail=True)
    with pytest.raises(RateLimited) as info:
        call()
    assert info.value.wait_seconds > 0 and calls["n"] == 2
    clock.advance(61)
    with pytest.raises(RetryableError):
        call(fail=True)  # second failure opens the breaker
    assert br.state == "open"
    with pytest.raises(CircuitOpen):
        call()
    assert calls["n"] == 3, "an open breaker must not call through"
    clock.advance(6)
    assert call() == "ok" and br.state == "closed"
