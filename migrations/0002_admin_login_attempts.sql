CREATE TABLE IF NOT EXISTS admin_login_attempts (
    id TEXT PRIMARY KEY,
    attempt_key TEXT NOT NULL,
    attempted_at INTEGER NOT NULL,
    successful INTEGER NOT NULL DEFAULT 0
        CHECK (successful IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_key_time
    ON admin_login_attempts(attempt_key, attempted_at);
