"""Check m0-3: the golden webhook events map to the golden records, config
comes from the environment, and the secret never reaches the logs."""

from __future__ import annotations

import json
import logging
from pathlib import Path

import pytest

from mock_services.payments import SAMPLE_EVENTS
from tools.transform import DonationRecord, UnsupportedEvent, load_config, webhook_to_donation

GOLDEN = json.loads((Path(__file__).with_name("golden") / "expected_records.json").read_text(encoding="utf-8"))
SECRET = "lsfp_secret_7f3a9c_do_not_log"


@pytest.fixture(autouse=True)
def env(monkeypatch):
    monkeypatch.setenv("CRM_API_KEY", SECRET)
    monkeypatch.setenv("CRM_URL", "http://127.0.0.1:9")


@pytest.mark.parametrize("event", [e for e in SAMPLE_EVENTS if e["type"] == "charge.succeeded"], ids=lambda e: e["id"])
def test_golden_event_maps_to_golden_record(event):
    record = webhook_to_donation(event)
    assert isinstance(record, DonationRecord)
    assert record.model_dump() == GOLDEN[event["id"]]


def test_unsupported_event_type_raises():
    refund = next(e for e in SAMPLE_EVENTS if e["type"] == "charge.refunded")
    with pytest.raises(UnsupportedEvent):
        webhook_to_donation(refund)


def test_config_reads_the_environment():
    cfg = load_config()
    assert cfg.crm_api_key == SECRET
    assert cfg.crm_url == "http://127.0.0.1:9"


def test_missing_secret_is_a_clear_error(monkeypatch, tmp_path):
    # Point at an empty .env so your real one cannot rescue this case.
    monkeypatch.delenv("CRM_API_KEY", raising=False)
    empty = tmp_path / ".env"
    empty.write_text("", encoding="utf-8")
    with pytest.raises(ValueError) as info:
        load_config(dotenv_path=str(empty))
    assert "CRM_API_KEY" in str(info.value)


def test_secret_never_appears_in_logs(caplog):
    caplog.set_level(logging.DEBUG)
    load_config()
    for event in SAMPLE_EVENTS:
        if event["type"] == "charge.succeeded":
            webhook_to_donation(event)
    assert any("transformed" in r.getMessage() for r in caplog.records), "expected one INFO line per event"
    assert SECRET not in caplog.text
