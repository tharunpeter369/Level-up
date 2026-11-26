import type { FastifyServerOptions } from "fastify";
import { buildApp } from "./app.ts";
import { loadConfig } from "./config.ts";
import { createDb } from "./db/client.ts";
import { pingDatabase } from "./modules/health/health.repository.ts";

const config = loadConfig();

const logger: FastifyServerOptions["logger"] =
  config.NODE_ENV === "development"
    ? { level: config.LOG_LEVEL, transport: { target: "pino-pretty" } }
    : { level: config.LOG_LEVEL };

const { db, pool } = createDb(config.DATABASE_URL, {
  // `app` is defined below; this only runs later, when a pooled connection dies.
  onIdleClientError: (error) => {
    app.log.warn({ err: error }, "Idle database connection error");
  },
});
const app = await buildApp({ checkDatabase: () => pingDatabase(db), logger });

// Runs during app.close(): release database connections before the process exits.
app.addHook("onClose", async () => {
  await pool.end();
});

// Graceful shutdown: stop accepting requests, let in-flight ones finish, close the pool.
async function shutdown(signal: NodeJS.Signals): Promise<void> {
  app.log.info({ signal }, "Shutting down");
  try {
    await app.close();
  } catch (error) {
    app.log.error(error, "Error during shutdown");
    process.exitCode = 1;
  }
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => void shutdown(signal));
}

try {
  await app.listen({ host: config.API_HOST, port: config.API_PORT });
} catch (error) {
  app.log.error(error, "Failed to start server");
  await pool.end();
  process.exitCode = 1;
}
