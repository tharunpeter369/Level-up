-- Enable pgvector (vector column type + similarity search) for "Ask my notes" (Phase 6).
-- infra/postgres/init.sql does this for local Docker only; this migration covers every
-- other database (tests, CI, production). IF NOT EXISTS makes it safe either way.
CREATE EXTENSION IF NOT EXISTS vector;
