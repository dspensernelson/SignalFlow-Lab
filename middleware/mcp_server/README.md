# Lakeshore donor-ops MCP server

Lesson m2-3 fills this file in. The check parses every fenced ```json block
below, so keep the snippets valid JSON (no comments inside the fences).

## Run

- stdio: `uv run python -m mcp_server.server` (from `middleware/`)
- Streamable HTTP: `uv run python -m mcp_server.http_server` (lesson 2.4)

## MCP Inspector

TODO (m2-3): the command that opens Inspector against the stdio server,
and two sentences on what you looked at (tool list, a call, the raw JSON-RPC).

## Claude Desktop

TODO (m2-3): the `mcpServers` entry for `claude_desktop_config.json`. Use
`uv` with `--directory` pointing at this folder so it works from anywhere.

```json
{}
```

## Claude Code

TODO (m2-3): the `.mcp.json` entry (or the `claude mcp add` command).

```json
{}
```

## What changed when the description changed

TODO (m2-3): one description you edited, the request you tried before and
after, and what the model did differently. This feeds the module explain-it.
