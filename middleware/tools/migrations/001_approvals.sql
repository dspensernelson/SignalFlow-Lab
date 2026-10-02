CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY, tool TEXT NOT NULL, arguments TEXT NOT NULL, status TEXT NOT NULL,
  requested_at TEXT NOT NULL, decided_at TEXT, decided_by TEXT, result TEXT
);
