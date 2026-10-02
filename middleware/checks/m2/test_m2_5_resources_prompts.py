"""Check m2-5: a donor record is readable as a resource, and the draft-thank-you
prompt renders with the donor's name and most recent gift."""

from __future__ import annotations

import json

from checks.m2._mcp_helpers import stdio_client


async def test_donor_resource_returns_the_record(fresh_crm):
    async with stdio_client({"CRM_URL": fresh_crm.base_url}) as client:
        templates = await client.list_resource_templates()
        assert any(t.uri_template == "donor://{donor_id}" for t in templates.resource_templates)
        res = await client.read_resource("donor://1")
        content = res.contents[0]
        assert content.mime_type == "application/json"
        record = json.loads(content.text)
        assert record["email"] == "maria.alvarez@example.org"


async def test_unknown_donor_resource_is_error_data(fresh_crm):
    async with stdio_client({"CRM_URL": fresh_crm.base_url}) as client:
        res = await client.read_resource("donor://999")
        record = json.loads(res.contents[0].text)
        assert record["error"]["code"] == "not_found"


async def test_draft_thank_you_prompt_knows_the_donor(fresh_crm):
    async with stdio_client({"CRM_URL": fresh_crm.base_url}) as client:
        prompts = (await client.list_prompts()).prompts
        draft = next(p for p in prompts if p.name == "draft-thank-you")
        assert [a.name for a in draft.arguments] == ["donor_id"]
        result = await client.get_prompt("draft-thank-you", {"donor_id": "1"})
        text = "\n".join(m.content.text for m in result.messages if hasattr(m.content, "text"))
        assert "Maria Alvarez" in text
        # donor 1's newest gift: 2026-xx or 2025-04-02 $30.00 depending on seed; the amount must be present
        import httpx

        newest = httpx.get(f"{fresh_crm.base_url}/donors/1/donations").json()[0]
        assert newest["received_at"][:10] in text
        assert f"{newest['amount_cents'] / 100:.2f}" in text
        assert "email receipts" in text.lower() or "prefers email" in text.lower(), "respect the donor's notes"
