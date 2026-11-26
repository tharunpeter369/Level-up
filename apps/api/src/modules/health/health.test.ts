import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../../app.ts";

type App = Awaited<ReturnType<typeof buildApp>>;

describe("health routes", () => {
  let app: App | undefined;

  afterEach(async () => {
    await app?.close();
  });

  it("GET /health reports the process is alive without touching the database", async () => {
    let databaseChecked = false;
    app = await buildApp({
      checkDatabase: () => {
        databaseChecked = true;
        return Promise.resolve();
      },
    });

    const res = await app.inject({ method: "GET", url: "/health" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: "ok" });
    expect(databaseChecked).toBe(false);
  });

  it("GET /health/ready returns 200 when the database is up", async () => {
    app = await buildApp({ checkDatabase: () => Promise.resolve() });

    const res = await app.inject({ method: "GET", url: "/health/ready" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ready", checks: { database: "up" } });
  });

  it("GET /health/ready returns 503 and logs the reason when the database is down", async () => {
    const logLines: string[] = [];
    app = await buildApp({
      checkDatabase: () => Promise.reject(new Error("connection refused")),
      logger: { level: "warn", stream: { write: (line: string) => logLines.push(line) } },
    });

    const res = await app.inject({ method: "GET", url: "/health/ready" });

    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ status: "not_ready", checks: { database: "down" } });
    // The client gets a generic body; the real reason goes to the logs only.
    expect(res.body).not.toContain("connection refused");
    expect(logLines.join("")).toContain("connection refused");
  });

  it("returns 404 for unknown routes", async () => {
    app = await buildApp({ checkDatabase: () => Promise.resolve() });

    const res = await app.inject({ method: "GET", url: "/nope" });

    expect(res.statusCode).toBe(404);
  });
});
