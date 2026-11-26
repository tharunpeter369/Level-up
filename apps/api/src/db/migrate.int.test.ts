import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.ts";
import { pingDatabase } from "../modules/health/health.repository.ts";
import { createDb } from "./client.ts";
import { runMigrations } from "./migrate.ts";

// Same image as compose.yaml, so tests match local development.
const POSTGRES_IMAGE = "pgvector/pgvector:pg18";

describe("database migrations (real Postgres via Testcontainers)", () => {
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
