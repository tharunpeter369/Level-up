import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

export interface CreateDbOptions {
  /**
   * Called when an idle pooled connection fails (e.g. Postgres restarts and drops it).
   * The pool discards that connection and opens a new one on the next query.
   */
  onIdleClientError?: (error: Error) => void;
}

/**
 * Creates one connection pool and a Drizzle instance on top of it.
 * Call once at startup and close the pool on shutdown; never create a pool per request.
 */
export function createDb(databaseUrl: string, options: CreateDbOptions = {}) {
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 10,
    // Fail fast instead of hanging forever when the database is unreachable.
    connectionTimeoutMillis: 5_000,
    // Postgres cancels any statement running longer than this, so a stuck query can't hang a
    // request forever. Long analytics queries (Phase 5) can raise it per transaction.
    statement_timeout: 10_000,
  });

  // Required: the pool emits 'error' when an *idle* connection dies, and in Node an 'error'
  // event without a listener crashes the whole process. Log it instead.
  pool.on("error", (error) => {
    if (options.onIdleClientError) {
      options.onIdleClientError(error);
    } else {
      process.stderr.write(`Idle database connection error: ${error.message}\n`);
    }
  });

  const db = drizzle({ client: pool });
  return { db, pool };
}

export type Db = ReturnType<typeof createDb>["db"];
