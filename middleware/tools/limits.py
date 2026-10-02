"""Lesson m4-4: rate limits and a circuit breaker.

Free tiers make this real: Groq allows roughly 30 requests a minute, Gemini
Flash a daily quota, OpenRouter about 50 a day. A limiter keeps you under
the provider's ceiling on purpose instead of discovering it through 429s; a
breaker stops a failing dependency from being hammered (and from stalling
every request behind timeouts) until it has had time to recover.

Spec (the check asserts this; ``clock`` is injectable and defaults to
``time.monotonic``):

- ``RateLimiter(max_calls, per_seconds, clock=time.monotonic)``: a sliding
  window. ``acquire() -> bool`` records the call and returns True when fewer
  than ``max_calls`` calls happened in the last ``per_seconds``; otherwise
  returns False without recording. ``wait_time() -> float`` is how long
  until the next acquire would succeed (0.0 when it would now).
- ``CircuitBreaker(failure_threshold=3, recovery_seconds=30.0,
  clock=time.monotonic)`` with ``state`` in ``closed | open | half_open``:
    * closed: ``allow()`` True; ``record_failure()`` increments; reaching
      the threshold opens it (failure count resets);
    * open: ``allow()`` False until ``recovery_seconds`` have passed, then
      the breaker becomes half_open and ``allow()`` returns True once;
    * half_open: ``record_success()`` closes it; ``record_failure()``
      reopens it (new recovery window).
  ``record_success()`` in closed state resets the failure count.
- ``guarded(limiter, breaker)`` is a decorator: before the call, if the
  breaker does not allow -> raise ``CircuitOpen``; if the limiter does not
  acquire -> raise ``RateLimited(wait_time)``; after the call, a
  RetryableError / httpx timeout / connection error counts as a failure and
  is re-raised; any normal return counts as a success.
"""

from __future__ import annotations

import time
from typing import Callable


class RateLimited(Exception):
    def __init__(self, wait_seconds: float):
        super().__init__(f"rate limited; retry in {wait_seconds:.2f}s")
        self.wait_seconds = wait_seconds


class CircuitOpen(Exception):
    pass


class RateLimiter:
    def __init__(self, max_calls: int, per_seconds: float, clock: Callable[[], float] = time.monotonic):
        self.max_calls = max_calls
        self.per_seconds = per_seconds
        self.clock = clock
        self._calls: list[float] = []

    def acquire(self) -> bool:
        raise NotImplementedError("Lesson m4-4: implement RateLimiter.acquire in tools/limits.py")

    def wait_time(self) -> float:
        raise NotImplementedError("Lesson m4-4: implement RateLimiter.wait_time in tools/limits.py")


class CircuitBreaker:
    def __init__(self, failure_threshold: int = 3, recovery_seconds: float = 30.0, clock: Callable[[], float] = time.monotonic):
        self.failure_threshold = failure_threshold
        self.recovery_seconds = recovery_seconds
        self.clock = clock
        self.state = "closed"
        self.failures = 0
        self.opened_at: float | None = None

    def allow(self) -> bool:
        raise NotImplementedError("Lesson m4-4: implement CircuitBreaker.allow in tools/limits.py")

    def record_success(self) -> None:
        raise NotImplementedError("Lesson m4-4: implement CircuitBreaker.record_success in tools/limits.py")

    def record_failure(self) -> None:
        raise NotImplementedError("Lesson m4-4: implement CircuitBreaker.record_failure in tools/limits.py")


def guarded(limiter: RateLimiter | None = None, breaker: CircuitBreaker | None = None):
    raise NotImplementedError("Lesson m4-4: implement the guarded decorator in tools/limits.py")
