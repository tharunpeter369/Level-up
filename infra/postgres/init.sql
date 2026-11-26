-- Runs once, on first start of an empty data volume (local dev only).
-- Migrations must also create this extension so production databases get it too.
CREATE EXTENSION IF NOT EXISTS vector;
