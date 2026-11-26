import { z } from "zod";

/** `GET /health`: liveness. "Is the process up?" Never touches the database. */
export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  uptimeSec: z.number().nonnegative(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

/** `GET /health/ready`: readiness. "Can this instance serve real traffic?" Checks dependencies. */
export const ReadinessResponseSchema = z.object({
  status: z.enum(["ready", "not_ready"]),
  checks: z.object({
    database: z.enum(["up", "down"]),
  }),
});

export type ReadinessResponse = z.infer<typeof ReadinessResponseSchema>;
