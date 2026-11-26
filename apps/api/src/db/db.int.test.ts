import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { buildApp } from "../app.ts";
import { pingDatabase } from "../modules/health/health.repository.ts";
import { createDb } from "./client.ts";
import { runMigrations } from "./migrate.ts";

// Same image as compose.yaml, so tests match local development.
const POSTGRES_IMAGE = "pgvector/pgvector:pg18";

describe("database (real Postgres via Testcontainers)", () => {
  let container: StartedPostgreSqlContainer | undefined;
  let databaseUrl: string;

  beforeAll(async () => {
    const started = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
    container = started;
    databaseUrl = started.getConnectionUri();
  }, 120_000);

  afterAll(async () => {
    // `?.` so a failed start (e.g. Docker not running) shows its real error, not a crash here.
    await container?.stop();
  });

  it("enables the pgvector extension", async () => {
    await runMigrations(databaseUrl);

    const { db, pool } = createDb(databaseUrl);
    try {
      const result = await db.execute<{ extname: string }>(
        sql`select extname from pg_extension where extname = 'vector'`,
      );
      expect(result.rows).toEqual([{ extname: "vector" }]);
    } finally {
      await pool.end();
    }
  });

  it("records each migration once, even when run twice", async () => {
    await runMigrations(databaseUrl);
    await runMigrations(databaseUrl);

    const { db, pool } = createDb(databaseUrl);
    try {
      const result = await db.execute<{ count: string }>(
        sql`select count(*) from drizzle.__drizzle_migrations`,
      );
      // Postgres returns count(*) as a string (bigint can exceed JS's safe integers).
      expect(result.rows[0]?.count).toBe("1");
    } finally {
      await pool.end();
    }
  });

  it("survives Postgres dropping an idle pooled connection, then reconnects", async () => {
    const idleErrors: Error[] = [];
    const { db, pool } = createDb(databaseUrl, { onIdleClientError: (e) => idleErrors.push(e) });
    const admin = createDb(databaseUrl);
    try {
      await pingDatabase(db); // leaves one idle connection in the pool

      // What a Postgres restart does: kill every other session. Without the pool's 'error'
      // listener, this crashed the whole API process (found in Task 4's end-to-end check).
      await admin.db.execute(
        sql`select pg_terminate_backend(pid) from pg_stat_activity
            where datname = current_database() and pid <> pg_backend_pid()`,
      );

      await vi.waitFor(() => {
        expect(idleErrors).toHaveLength(1);
      });
      await expect(pingDatabase(db)).resolves.toBeUndefined(); // pool opened a new connection
    } finally {
      await pool.end();
      await admin.pool.end();
    }
  });

  it("GET /health/ready reports the real database as up", async () => {
    const { db, pool } = createDb(databaseUrl);
    const app = await buildApp({ checkDatabase: () => pingDatabase(db) });
    try {
      const res = await app.inject({ method: "GET", url: "/health/ready" });
      expect(res.statusCode).toBe(200);
    } finally {
      await app.close();
      await pool.end();
    }
  });
});
