CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL, params TEXT NOT NULL, status TEXT NOT NULL,
  created_at TEXT NOT NULL, finished_at TEXT, result TEXT, error TEXT
);
