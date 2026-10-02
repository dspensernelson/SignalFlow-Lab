# Migrations (lesson m5-1)

Numbered SQL files, applied in order by `tools/db.py` and recorded in
`schema_migrations`. Write these four:

| File | Table | Columns the stores expect |
|---|---|---|
| `001_approvals.sql` | `approvals` | id TEXT PK, tool TEXT, arguments TEXT, status TEXT, requested_at TEXT, decided_at TEXT, decided_by TEXT, result TEXT |
| `002_idempotency.sql` | `idempotency` | key TEXT PK, result TEXT, created_at TEXT |
| `003_tasks.sql` | `tasks` | id TEXT PK, kind TEXT, params TEXT, status TEXT, created_at TEXT, finished_at TEXT, result TEXT, error TEXT |
| `004_memory.sql` | `memory` | conversation_id TEXT, key TEXT, value TEXT, expires_at REAL, PRIMARY KEY (conversation_id, key) |

Rules: `CREATE TABLE IF NOT EXISTS`, one concern per file, never edit a file
that has been applied anywhere (add `005_...` instead).
