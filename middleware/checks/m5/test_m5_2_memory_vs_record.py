"""Check m5-2: memory is per conversation, expires, refuses system-of-record
keys, and never touches the CRM."""

from __future__ import annotations

import httpx
import pytest

from tools.db import StateDB
from tools.memory import ALLOWED_KEYS, ConversationMemory, MemoryPolicyError


class FakeClock:
    def __init__(self):
        self.t = 1_700_000_000.0

    def __call__(self):
        return self.t


@pytest.fixture
def memory(tmp_path):
    db = StateDB(tmp_path / "state.db")
    db.migrate()
    clock = FakeClock()
    return ConversationMemory(db, ttl_seconds=60.0, clock=clock), clock


def test_remember_and_recall_per_conversation(memory):
    mem, _ = memory
    mem.remember("conv-a", "active_donor_id", "1")
    mem.remember("conv-a", "last_intent", "thank the donor")
    mem.remember("conv-b", "active_donor_id", "2")
    assert mem.recall("conv-a") == {"active_donor_id": "1", "last_intent": "thank the donor"}
    assert mem.recall("conv-b") == {"active_donor_id": "2"}
    mem.remember("conv-a", "active_donor_id", "3")  # upsert
    assert mem.recall("conv-a")["active_donor_id"] == "3"
    assert mem.forget("conv-a") == 2 and mem.recall("conv-a") == {}


def test_expired_memory_is_gone(memory):
    mem, clock = memory
    mem.remember("conv-a", "draft", "Dear Maria...")
    clock.t += 59
    assert mem.recall("conv-a") == {"draft": "Dear Maria..."}
    clock.t += 2
    assert mem.recall("conv-a") == {}
    mem.remember("conv-b", "draft", "x")
    clock.t += 100
    assert mem.forget_expired() >= 2


def test_system_of_record_keys_are_refused(memory):
    mem, _ = memory
    for key in ("donor_email", "amount_cents", "donation_history", "receipts"):
        with pytest.raises(MemoryPolicyError):
            mem.remember("conv-a", key, "nope")
    assert "active_donor_id" in ALLOWED_KEYS and "donor_email" not in ALLOWED_KEYS


def test_memory_writes_leave_the_crm_untouched(memory, fresh_crm):
    mem, _ = memory
    before_donors = httpx.get(f"{fresh_crm.base_url}/donors").json()
    before_receipts = httpx.get(f"{fresh_crm.base_url}/receipts").json()
    mem.remember("conv-a", "active_donor_id", "1")
    mem.remember("conv-a", "pending_approval_id", "abc")
    mem.forget("conv-a")
    assert httpx.get(f"{fresh_crm.base_url}/donors").json() == before_donors
    assert httpx.get(f"{fresh_crm.base_url}/receipts").json() == before_receipts
