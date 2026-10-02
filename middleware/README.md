# SignalFlow Lab: Middleware - build workspace

This directory is where the Middleware track's builds live. The React app
(run `npm run dev` in the repo root, then pick the Middleware track) tells
you what to build in each lesson; this workspace is where you build it,
with Claude Code as the pair programmer, and where the acceptance checks
run.

## Setup (once)

```powershell
# from the repo root
cd middleware
uv sync                 # Module 0: core dependencies only
uv sync --extra mcp     # from Module 2 on (add --extra otel / rag / graph later)
copy .env.example .env  # then fill in a free-tier model key when Module 1 asks
```

`uv` installs Python 3.11 for you if the machine does not have it.

## The loop for every lesson

1. Read the lesson in the app: Concept, then the Workbench (simulate,
   build spec, check).
2. Build the target files the lesson names. Each ships as a stub with a
   docstring spec and `raise NotImplementedError("Lesson ...")`.
3. Run the check and let the app read the result:

   ```powershell
   uv run --directory middleware python checks/run.py m0-1-environment
   ```

   The result lands in `checks/results/<lesson-id>.json`. Click
   "Refresh checks" in the app; a pass unlocks the next lesson.

Run every check at once with `--all`. Run the raw tests with
`uv run pytest checks/m0 -q`.

## Layout

| Path | What it is |
|---|---|
| `mock_services/` | The donor CRM, email service and flaky payment processor (complete, read as examples). |
| `hello/`, `tools/`, `mcp_server/`, `evals/`, `agent/`, `deploy/` | Your build areas. Stubs arrive per lesson. |
| `checks/<module>/test_<lesson>.py` | The acceptance checks. They test behavior, never file presence. |
| `checks/_infra/` | Self-tests for the scaffolding above (run in CI). |
| `checks/run.py` | Runs one lesson's check and writes the result the app reads. |
| `checks/results/` | Git-ignored result files. |

## Extras per module

| From lesson | Install | What it adds |
|---|---|---|
| 0.1 | `uv sync` | httpx, pydantic, typer, pytest, the mock services |
| 2.2 | `uv sync --extra mcp` | the MCP Python SDK (2.x, 2026-07-28 spec) |
| 5.3 | `uv sync --extra rag` | fastembed (CPU embeddings) and sqlite-vec |
| 6.1 | `uv sync --extra otel` | OpenTelemetry API and SDK |
| 7.1 | `uv sync --extra graph` | LangGraph and langchain-core |
| any | `uv sync --all-extras` | everything (what CI installs) |

## Markers the checks use

- `live`: needs `LLM_PROVIDER` and its key; skipped otherwise.
- `docker`: needs `DOCKER_AVAILABLE=1` and a daemon (lesson 8.1).
- `deployed`: needs `DEPLOY_URL` (and `DEPLOY_TOKEN`) (lesson 8.2).

## Secrets and free tiers

Keys live in `.env` (git-ignored) and are read through the settings module
you build in Module 3. The model behind the tool-call loop is whatever
`LLM_PROVIDER` says: `gemini`, `groq`, `openrouter`, `ollama`, or `replay`
(recorded responses, no key, used by every deterministic check). Free tiers
change without notice; swapping providers is a one-line change.
