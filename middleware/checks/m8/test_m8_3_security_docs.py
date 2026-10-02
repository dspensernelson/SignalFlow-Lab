"""Check m8-3: the threat model, runbook and host-configuration docs exist
with the required sections and no placeholders; the Copilot Studio and
Claude Desktop snippets parse."""

from __future__ import annotations

import json
import re
from pathlib import Path

DOCS = Path(__file__).resolve().parents[2] / "deploy" / "docs"

REQUIRED = {
    "threat-model.md": ["# Threat model", "## Assets", "## Threats", "## Controls", "## Out of scope"],
    "runbook.md": ["# Runbook", "## Start", "## Stop", "## Rotate a secret", "## Restore state", "## When the CRM is down"],
    "host-config.md": ["# Host configuration", "## Claude Desktop", "## Copilot Studio", "## MCP Inspector"],
}


def _headings(text: str) -> list[str]:
    return [line.strip() for line in text.splitlines() if line.startswith("#")]


def test_docs_have_required_sections_and_no_placeholders():
    for name, sections in REQUIRED.items():
        text = (DOCS / name).read_text(encoding="utf-8")
        assert "TODO" not in text, f"{name} still has a TODO"
        heads = _headings(text)
        for s in sections:
            assert any(h.lower().startswith(s.lower()) for h in heads), f"{name} lacks section {s!r}"
        assert len(text) >= 1200, f"{name} is too short to be useful"


def test_threat_model_names_the_controls_you_built():
    text = (DOCS / "threat-model.md").read_text(encoding="utf-8").lower()
    for control in ("scope", "approval", "sanitiz", "redact", "idempoten", "trace"):
        assert control in text, f"threat model does not mention {control}"


def test_host_config_snippets_parse():
    text = (DOCS / "host-config.md").read_text(encoding="utf-8")
    blocks = re.findall(r"```json\s*\n(.*?)```", text, re.S)
    assert len(blocks) >= 2, "a Claude Desktop snippet and a Copilot Studio snippet"
    parsed = [json.loads(b) for b in blocks]
    assert any("mcpServers" in b for b in parsed)
    assert "Authorization" in text or "bearer" in text.lower(), "say how the host presents the token"
