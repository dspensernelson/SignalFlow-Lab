"""Check m1-1: the three tool contracts are valid JSON Schema with real
descriptions, correct required fields, an enum, and working handlers."""

from __future__ import annotations

import pytest

from tools.client import DonorClient
from tools.schemas import TOOL_NAMES, build_registry, tool_specs

MIN_TOOL_DESCRIPTION = 40
MIN_FIELD_DESCRIPTION = 15


def _props(schema: dict) -> dict:
    return schema.get("properties", {})


def test_three_specs_in_order():
    specs = tool_specs()
    assert [s["name"] for s in specs] == list(TOOL_NAMES)
    for s in specs:
        assert set(s) >= {"name", "description", "input_schema"}
        assert s["input_schema"]["type"] == "object"


@pytest.mark.parametrize("name", TOOL_NAMES)
def test_descriptions_are_written_for_the_model(name):
    spec = next(s for s in tool_specs() if s["name"] == name)
    assert len(spec["description"].strip()) >= MIN_TOOL_DESCRIPTION, f"{name}: describe when to use it and what to pass"
    assert "TODO" not in spec["description"]
    for field, prop in _props(spec["input_schema"]).items():
        desc = prop.get("description") or ""
        # pydantic puts Optional fields under anyOf; description stays at the top level
        assert len(desc.strip()) >= MIN_FIELD_DESCRIPTION, f"{name}.{field} needs a description"


def test_required_fields_and_enum():
    by_name = {s["name"]: s["input_schema"] for s in tool_specs()}
    assert by_name["find_donor"]["required"] == ["query"]
    assert by_name["find_donor"]["properties"]["query"].get("minLength") == 2
    assert by_name["get_donation_history"]["required"] == ["donor_id"]
    assert "since" in by_name["get_donation_history"]["properties"]
    assert sorted(by_name["create_receipt"]["required"]) == ["donation_id", "sent_to"]
    fmt = by_name["create_receipt"]["properties"]["format"]
    assert fmt.get("enum") == ["email", "pdf"] and fmt.get("default") == "email"


def test_handlers_work_against_the_crm(fresh_crm):
    registry = build_registry(DonorClient(fresh_crm.base_url))
    assert set(registry.tools) == set(TOOL_NAMES)
    found = registry.tools["find_donor"].handler(registry.tools["find_donor"].input_model(query="alvarez"))
    assert found["matches"] == 2 and {d["id"] for d in found["donors"]} == {1, 2}
    history = registry.tools["get_donation_history"].handler(
        registry.tools["get_donation_history"].input_model(donor_id=1, since="2025-04-01")
    )
    assert history["donor_id"] == 1
    assert history["donations"] and all(g["received_at"] >= "2025-04-01" for g in history["donations"])
    receipt = registry.tools["create_receipt"].handler(
        registry.tools["create_receipt"].input_model(donation_id=6, sent_to="maria.alvarez@example.org")
    )
    assert receipt["status"] == "sent" and receipt["receipt_id"] and receipt["duplicate"] is False
    assert registry.tools["create_receipt"].writes is True
