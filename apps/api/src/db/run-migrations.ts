// CLI entry point for `pnpm db:migrate`.
import { loadConfig } from "../config.ts";
import { runMigrations } from "./migrate.ts";

const { DATABASE_URL } = loadConfig();

try {
  await runMigrations(DATABASE_URL);
  process.stdout.write("Migrations applied.\n");
} catch (error) {
  process.stderr.write(`Migration failed: ${String(error)}\n`);
  process.exitCode = 1;
}
