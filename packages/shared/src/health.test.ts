import { describe, expect, it } from "vitest";
import { HealthResponseSchema } from "./health.js";

describe("HealthResponseSchema", () => {
  it("accepts a valid health response", () => {
    expect(HealthResponseSchema.parse({ status: "ok", uptimeSec: 12 })).toEqual({
      status: "ok",
      uptimeSec: 12,
    });
  });

  it("rejects a negative uptime", () => {
    expect(HealthResponseSchema.safeParse({ status: "ok", uptimeSec: -1 }).success).toBe(false);
  });
});
