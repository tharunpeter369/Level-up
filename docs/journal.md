# Build Journal

A few lines every weekend: what you built, what broke, how you fixed it, and any numbers.

## 2026-11-26

- Cleaned up docs, wrote Tier 1 docs (CLAUDE.md, architecture, data model, conventions, Definition of Done).
- Decisions: Fastify for the API, Drizzle for DB access, start Phase 0 with only web, api, shared.

## 2026-11-26 — Phase 0, Task 1: workspace + tooling

- pnpm workspace, strict TS base config, ESLint (typescript-eslint strictTypeChecked), Prettier, Vitest; `packages/shared` with a Zod `HealthResponseSchema` and 2 tests.
- Hit: `pnpm add typescript` installed TS 7.0, but typescript-eslint 8.74 only supports TS < 6.1. Pinned `typescript@~6.0.0`. Revisit when typescript-eslint supports TS 7 (the Go-native compiler — big typecheck speedup).
- Node 24 via nvm (`.nvmrc`); pnpm 12 via corepack.

## 2026-11-26 — Phase 0, Task 2: local Postgres + Redis

- `compose.yaml` at the root: `pgvector/pgvector:pg18` (Postgres 18.7, pgvector 0.8.7) and `redis:8-alpine`, both with health checks and named volumes. `pnpm db:up` waits until both are healthy.
- Hit: a Homebrew Postgres and Redis already use 5432/6379 → mapped to 5433/6380. Postgres 18 images store data in a versioned subfolder, so the volume mounts `/var/lib/postgresql`, not `/data`.
- Work-laptop safety: ports bound to 127.0.0.1 only, no restart policy (containers start only via `pnpm db:up`).
- Verified: both healthy, `vector` extension present, Redis PONG, data survives `down` + `up`, host connects via `DATABASE_URL`.
- Note for Task 3: the first migration must also `CREATE EXTENSION IF NOT EXISTS vector` (init.sql only runs in local Docker).

## 2026-11-26 — Full project review fixes

- **Shared package didn't run under plain Node** (`ERR_MODULE_NOT_FOUND: .../health.js`): Node 24 strips types but doesn't rename imports. Switched to `.ts` import extensions + `allowImportingTsExtensions`, `rewriteRelativeImportExtensions`, `erasableSyntaxOnly`. Now `node` runs the source directly, and `tsc` still emits correct `.js` imports. No `tsx` needed.
- `pnpm lint` now fails on warnings (`--max-warnings 0`); before, a `console.log` passed.
- Compose requires `POSTGRES_*` from `.env` (`${VAR:?}`); a missing `.env` used to silently create the DB with a different password.
- Added root README, ignored `.claude/settings.local.json`, synced the plan (Fastify chosen, Phase 0 "done when", simple timer in Phase 1), vitest 5.1.2.
