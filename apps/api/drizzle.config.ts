import { defineConfig } from "drizzle-kit";

// Used by drizzle-kit (`pnpm db:generate`) to diff src/db/schema.ts and write SQL into ./drizzle.
// Applying migrations is done by our own script (src/db/run-migrations.ts), not drizzle-kit.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
});
