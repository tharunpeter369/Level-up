import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { NextConfig } from "next";

// Load the monorepo's root .env (Next.js only reads .env files from apps/web itself).
// Uses Node's built-in loader; variables already set in the environment win.
// Not done with `node --env-file` like the API: Next forwards Node flags to its worker
// processes via NODE_OPTIONS, where --env-file isn't allowed.
const rootEnvFile = resolve(process.cwd(), "../../.env");
if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

const nextConfig: NextConfig = {
  // @skillforge/shared ships TypeScript source (no build step); compile it like app code.
  transpilePackages: ["@skillforge/shared"],
  reactStrictMode: true,
  // Don't advertise the framework in an `X-Powered-By` response header.
  poweredByHeader: false,
};

export default nextConfig;
