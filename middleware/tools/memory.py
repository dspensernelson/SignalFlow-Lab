"""Lesson m5-2: conversation memory versus the system of record.

An assistant should remember, for a little while, what this conversation
is about: which donor the staff member means, what they asked for, the
approval id that is pending. It must never become a second copy of the
CRM. So memory is (1) short-term, with a TTL, (2) keyed by conversation,
(3) restricted to an allow-list of conversational keys, and (4) write-only
to its own table: nothing in this module ever calls the CRM.

Spec (the check asserts this):

- ``ALLOWED_KEYS = {"active_donor_id", "active_donor_name", "last_intent",
  "pending_approval_id", "draft", "last_task_id"}``.
- ``MemoryPolicyError(ValueError)`` raised by ``remember`` for any other key
  (donor emails, amounts, histories belong to the CRM).
- ``ConversationMemory(db: StateDB, ttl_seconds=1800.0, clock=time.time)``
  using the ``memory`` table from migration 004.
- ``remember(conversation_id, key, value: str) -> None`` upserts with
  ``expires_at = clock() + ttl_seconds``.
- ``recall(conversation_id) -> dict[str, str]`` returns only unexpired
  entries for that conversation.
- ``forget(conversation_id) -> int`` deletes that conversation's rows.
- ``forget_expired() -> int`` deletes every expired row (any conversation)
  and returns the count.
"""

from __future__ import annotations

import time
from typing import Callable

from tools.db import StateDB

ALLOWED_KEYS = frozenset({"active_donor_id", "active_donor_name", "last_intent", "pending_approval_id", "draft", "last_task_id"})


class MemoryPolicyError(ValueError):
    pass


class ConversationMemory:
    def __init__(self, db: StateDB, ttl_seconds: float = 1800.0, clock: Callable[[], float] = time.time):
        self.db = db
        self.ttl_seconds = ttl_seconds
        self.clock = clock

    def remember(self, conversation_id: str, key: str, value: str) -> None:
        raise NotImplementedError("Lesson m5-2: implement ConversationMemory.remember")

    def recall(self, conversation_id: str) -> dict[str, str]:
        raise NotImplementedError("Lesson m5-2: implement ConversationMemory.recall")

    def forget(self, conversation_id: str) -> int:
        raise NotImplementedError("Lesson m5-2: implement ConversationMemory.forget")

    def forget_expired(self) -> int:
        raise NotImplementedError("Lesson m5-2: implement ConversationMemory.forget_expired")
