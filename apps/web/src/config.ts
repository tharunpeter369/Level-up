import { z } from "zod";

// Server-side settings for the web app, validated once. Never expose these to the browser:
// only variables prefixed NEXT_PUBLIC_ are embedded in client bundles.
const ConfigSchema = z.object({
  /** Where the Next.js server reaches the Fastify API (server-to-server). */
  API_URL: z.url().default("http://127.0.0.1:3001"),
});

export type WebConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): WebConfig {
  const result = ConfigSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
