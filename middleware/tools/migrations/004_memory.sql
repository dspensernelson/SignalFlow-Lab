CREATE TABLE IF NOT EXISTS memory (
  conversation_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, expires_at REAL NOT NULL,
  PRIMARY KEY (conversation_id, key)
);
