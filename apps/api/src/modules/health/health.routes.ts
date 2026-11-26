import { HealthResponseSchema, ReadinessResponseSchema } from "@skillforge/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export interface HealthRoutesOptions {
  /**
   * Resolves when the database is reachable; rejects with the reason when it isn't.
   * Injected so tests can simulate "database up/down" without a real database.
   */
  checkDatabase: () => Promise<void>;
}

// Health checks are deliberately tiny, so they skip the controller/service layers.
export const healthRoutes: FastifyPluginAsyncZod<HealthRoutesOptions> = async (app, options) => {
  // Liveness: is the process running? Never depends on other systems,
  // otherwise a database outage would make the platform restart healthy API servers.
  app.get("/health", { schema: { response: { 200: HealthResponseSchema } } }, () => ({
    status: "ok" as const,
    uptimeSec: Math.round(process.uptime()),
  }));

  // Readiness: can this instance serve real requests? 503 tells a load balancer to wait.
  app.get(
    "/health/ready",
    { schema: { response: { 200: ReadinessResponseSchema, 503: ReadinessResponseSchema } } },
    async (request, reply) => {
      try {
        await options.checkDatabase();
      } catch (error) {
        // Log the reason (wrong password, timeout, DB not started…); the response stays generic.
        request.log.warn({ err: error }, "Readiness check failed: database");
        return reply.code(503).send({ status: "not_ready", checks: { database: "down" } });
      }
      return { status: "ready" as const, checks: { database: "up" as const } };
    },
  );
};
