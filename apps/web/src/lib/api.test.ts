import { describe, expect, it } from "vitest";
import { getApiStatus } from "./api.ts";

const API_URL = "http://api.test";

function respondWith(body: unknown, status = 200): typeof fetch {
  return () => Promise.resolve(new Response(JSON.stringify(body), { status }));
}

describe("getApiStatus", () => {
  it("reports API and database up when the API is ready", async () => {
    const fetchFn = respondWith({ status: "ready", checks: { database: "up" } });

    await expect(getApiStatus(API_URL, fetchFn)).resolves.toEqual({ api: "up", database: "up" });
  });

  it("reports the database down when the API answers 503", async () => {
    const fetchFn = respondWith({ status: "not_ready", checks: { database: "down" } }, 503);

    await expect(getApiStatus(API_URL, fetchFn)).resolves.toEqual({
      api: "up",
      database: "down",
    });
  });

  it("calls the readiness endpoint on the configured API URL", async () => {
    let requested = "";
    const fetchFn: typeof fetch = (input) => {
      requested = input instanceof Request ? input.url : input instanceof URL ? input.href : input;
      return Promise.resolve(
        new Response(JSON.stringify({ status: "ready", checks: { database: "up" } })),
      );
    };

    await getApiStatus(API_URL, fetchFn);

    expect(requested).toBe("http://api.test/health/ready");
  });

  it("reports unreachable when the request fails", async () => {
    const fetchFn: typeof fetch = () => Promise.reject(new TypeError("fetch failed"));

    await expect(getApiStatus(API_URL, fetchFn)).resolves.toEqual({ api: "unreachable" });
  });

  it("reports an invalid response when the body isn't JSON", async () => {
    const fetchFn: typeof fetch = () => Promise.resolve(new Response("<html>oops</html>"));

    await expect(getApiStatus(API_URL, fetchFn)).resolves.toEqual({ api: "invalid-response" });
  });

  it("reports an invalid response when the JSON breaks the shared contract", async () => {
    const fetchFn = respondWith({ status: "ready", checks: { database: "maybe" } });

    await expect(getApiStatus(API_URL, fetchFn)).resolves.toEqual({ api: "invalid-response" });
  });
});
