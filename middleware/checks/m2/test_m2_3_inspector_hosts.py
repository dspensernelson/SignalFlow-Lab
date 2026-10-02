"""Check m2-3: the host configuration snippets in mcp_server/README.md are
valid JSON and point at this server with uv."""

from __future__ import annotations

import json
import re
from pathlib import Path

README = Path(__file__).resolve().parents[2] / "mcp_server" / "README.md"
FENCE = re.compile(r"```json\s*\n(.*?)```", re.S)


def _blocks() -> list[dict]:
    text = README.read_text(encoding="utf-8")
    blocks = []
    for raw in FENCE.findall(text):
        blocks.append(json.loads(raw))
    return blocks


def test_readme_has_no_todos_left():
    assert "TODO" not in README.read_text(encoding="utf-8")


def test_json_snippets_parse_and_are_not_placeholders():
    blocks = _blocks()
    assert len(blocks) >= 2, "expected a Claude Desktop snippet and a Claude Code snippet"
    assert all(block != {} for block in blocks), "replace the {} placeholders"


def test_claude_desktop_snippet_launches_this_server_with_uv():
    blocks = _blocks()
    desktop = [b for b in blocks if "mcpServers" in b]
    assert desktop, "Claude Desktop config needs a top-level mcpServers object"
    servers = desktop[0]["mcpServers"]
    assert servers, "mcpServers must contain at least one server"
    entry = next(iter(servers.values()))
    assert entry.get("command") in {"uv", "uv.exe"}, "launch with uv so it works from any directory"
    args = " ".join(entry.get("args", []))
    assert "--directory" in args and "mcp_server.server" in args


def test_readme_names_inspector_and_describes_a_description_change():
    text = README.read_text(encoding="utf-8")
    assert "@modelcontextprotocol/inspector" in text
    section = text.split("## What changed when the description changed", 1)
    assert len(section) == 2 and len(section[1].strip()) >= 200, "write up what the model did differently"
