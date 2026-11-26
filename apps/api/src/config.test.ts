import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.ts";

describe("loadConfig", () => {
  it("applies defaults when only DATABASE_URL is set", () => {
    const config = loadConfig({ DATABASE_URL: "postgres://u:p@localhost:5433/db" });

    expect(config).toEqual({
      NODE_ENV: "development",
      API_HOST: "127.0.0.1",
      API_PORT: 3001,
      LOG_LEVEL: "info",
      DATABASE_URL: "postgres://u:p@localhost:5433/db",
    });
  });

  it("converts API_PORT from a string to a number", () => {
    const config = loadConfig({ DATABASE_URL: "postgres://localhost/db", API_PORT: "4000" });

    expect(config.API_PORT).toBe(4000);
  });

  it("throws a readable error when DATABASE_URL is missing", () => {
    expect(() => loadConfig({})).toThrow(/DATABASE_URL/);
  });

  it("rejects an invalid port", () => {
    expect(() =>
      loadConfig({ DATABASE_URL: "postgres://localhost/db", API_PORT: "99999" }),
    ).toThrow(/API_PORT/);
  });
});
