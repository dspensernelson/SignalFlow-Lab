"""Lesson m4-1: a client for the flaky payment processor, made reliable.

``mock_services/payments.py`` documents the processor: ``POST /confirm`` is
scripted per Idempotency-Key with the ``X-Fail-Sequence`` header (tests use
it; production never would).

Spec (the check asserts this):

- ``PaymentsError(Exception)`` for a final failure (after retries, or a
  non-retryable status) with ``status`` and ``attempts``.
- ``PaymentsClient(base_url, timeout=1.0, sleep=time.sleep)``.
- ``confirm(charge_id, amount_cents, idempotency_key, fail_sequence=None)
  -> dict`` POSTs ``{charge_id, amount_cents}`` with headers
  ``Idempotency-Key`` and (when given) ``X-Fail-Sequence``; it is wrapped
  with ``tools.retry.retry(max_attempts=4, base_delay=0.2, sleep=sleep)``:
  timeouts, connection errors, 429 and 5xx retry; 4xx raise PaymentsError at
  once. Returns the processor's JSON on success and sets
  ``self.last_attempts``.
"""

from __future__ import annotations

import time
from typing import Any, Callable


class PaymentsError(Exception):
    def __init__(self, message: str, status: int | None = None, attempts: int = 0):
        super().__init__(message)
        self.status = status
        self.attempts = attempts


class PaymentsClient:
    def __init__(self, base_url: str, timeout: float = 1.0, sleep: Callable[[float], None] = time.sleep):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.sleep = sleep
        self.last_attempts = 0

    def confirm(self, charge_id: str, amount_cents: int, idempotency_key: str, fail_sequence: str | None = None) -> dict[str, Any]:
        raise NotImplementedError("Lesson m4-1: implement PaymentsClient.confirm in tools/payments.py")
