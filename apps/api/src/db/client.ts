import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

/**
 * Creates one connection pool and a Drizzle instance on top of it.
 * Call once at startup and close the pool on shutdown; never create a pool per request.
 */
export function createDb(databaseUrl: string) {
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 10,
    // Fail fast instead of hanging forever when the database is unreachable.
    connectionTimeoutMillis: 5_000,
    // Postgres cancels any statement running longer than this, so a stuck query can't hang a
    // request forever. Long analytics queries (Phase 5) can raise it per transaction.
    statement_timeout: 10_000,
  });
  const db = drizzle({ client: pool });
  return { db, pool };
}

export type Db = ReturnType<typeof createDb>["db"];
