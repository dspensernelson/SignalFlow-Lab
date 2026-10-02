"""Lesson m4-1: retry with exponential backoff and jitter, and when not to.

Failure taxonomy (what the processor can do to you):

    timeout         no answer in time            -> retry
    429             rate limited                 -> retry (respect Retry-After if present)
    500 / 503       the other side broke         -> retry
    connection err  nothing listening            -> retry
    400 / 401 / 403 / 404 / 422                  -> do NOT retry; the answer will not change
    schema error    their JSON changed           -> do NOT retry; fix the mapping

Spec (the check asserts this):

- ``is_retryable_status(status: int) -> bool``: True for 429 and 500-599.
- ``class RetryableError(Exception)`` with ``status: int | None``; raise it
  (or let httpx.TimeoutException / httpx.ConnectError propagate) to ask
  for a retry; any other exception stops immediately.
- ``retry(max_attempts=4, base_delay=0.2, max_delay=2.0, jitter=True,
  sleep=time.sleep)`` is a decorator factory. Delay before attempt n (n>=2)
  is ``min(max_delay, base_delay * 2**(n-2))``, multiplied by a random
  factor in [0.5, 1.5] when jitter is on. It calls ``sleep(delay)``
  (injectable so tests run instantly and can record the delays). After the
  last failed attempt it re-raises the last exception. It records
  ``wrapper.last_attempts`` (how many attempts the last call used).
- Retry-After: when a RetryableError carries ``retry_after`` seconds, use
  max(retry_after, computed delay).
"""

from __future__ import annotations

import time
from typing import Callable


class RetryableError(Exception):
    def __init__(self, message: str, status: int | None = None, retry_after: float | None = None):
        super().__init__(message)
        self.status = status
        self.retry_after = retry_after


def is_retryable_status(status: int) -> bool:
    raise NotImplementedError("Lesson m4-1: implement is_retryable_status in tools/retry.py")


def retry(
    max_attempts: int = 4,
    base_delay: float = 0.2,
    max_delay: float = 2.0,
    jitter: bool = True,
    sleep: Callable[[float], None] = time.sleep,
):
    raise NotImplementedError("Lesson m4-1: implement the retry decorator in tools/retry.py")
