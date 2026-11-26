import Fastify, { type FastifyServerOptions } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { healthRoutes } from "./modules/health/health.routes.ts";

export interface AppDependencies {
  checkDatabase: () => Promise<void>;
  logger?: FastifyServerOptions["logger"];
}

/**
 * Creates and configures the Fastify app without starting a server.
 * `server.ts` calls `listen()`; tests call `app.inject()` instead.
 */
export async function buildApp({ checkDatabase, logger = false }: AppDependencies) {
  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();

  // Route schemas are Zod schemas: these compile them into validators and serializers.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(healthRoutes, { checkDatabase });

  return app;
}
