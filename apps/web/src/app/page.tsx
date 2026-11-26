import { loadConfig } from "../config.ts";
import { getApiStatus, type ApiStatus } from "../lib/api.ts";

function describeApi(status: ApiStatus): { label: string; tone: "ok" | "bad" } {
  switch (status.api) {
    case "up":
      return { label: "Up", tone: "ok" };
    case "unreachable":
      return { label: "Unreachable (is `pnpm dev` running?)", tone: "bad" };
    case "invalid-response":
      return { label: "Unexpected response", tone: "bad" };
  }
}

function describeDatabase(status: ApiStatus): { label: string; tone: "ok" | "bad" | "unknown" } {
  if (status.api !== "up") return { label: "Unknown", tone: "unknown" };
  return status.database === "up"
    ? { label: "Up", tone: "ok" }
    : { label: "Down (is `pnpm db:up` running?)", tone: "bad" };
}

// A Server Component: it runs on the server, awaits the API, and sends finished HTML.
export default async function HomePage() {
  const { API_URL } = loadConfig();
  const status = await getApiStatus(API_URL);
  const api = describeApi(status);
  const database = describeDatabase(status);

  return (
    <main className="home">
      <h1>SkillForge</h1>
      <p className="tagline">Daily practice for the Top 1% software engineering syllabus.</p>

      <section aria-labelledby="status-heading" className="status">
        <h2 id="status-heading">System status</h2>
        <dl>
          <div className="status-row">
            <dt>API</dt>
            <dd data-tone={api.tone}>{api.label}</dd>
          </div>
          <div className="status-row">
            <dt>Database</dt>
            <dd data-tone={database.tone}>{database.label}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
