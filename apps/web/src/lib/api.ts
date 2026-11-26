import { ReadinessResponseSchema } from "@skillforge/shared";

export type ApiStatus =
  | { api: "up"; database: "up" | "down" }
  /** No answer at all: API not running, wrong URL, or timed out. */
  | { api: "unreachable" }
  /** The API answered, but not in the shape our shared schema promises. */
  | { api: "invalid-response" };

const TIMEOUT_MS = 3_000;

/**
 * Asks the API whether it can serve traffic. Never throws: the page should render
 * a helpful status even when the API is down.
 * `fetchFn` is injectable so tests don't need a running API.
 */
export async function getApiStatus(
  apiUrl: string,
  fetchFn: typeof fetch = fetch,
): Promise<ApiStatus> {
  let body: unknown;
  try {
    const res = await fetchFn(new URL("/health/ready", apiUrl), {
      cache: "no-store", // live status on every request, never a cached copy
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    body = await res.json(); // 200 and 503 both carry a readiness body
  } catch (error) {
    if (error instanceof SyntaxError) return { api: "invalid-response" }; // not JSON
    return { api: "unreachable" };
  }

  // Trust nothing from the network until it's validated against the shared contract.
  const parsed = ReadinessResponseSchema.safeParse(body);
  if (!parsed.success) return { api: "invalid-response" };
  return { api: "up", database: parsed.data.checks.database };
}
