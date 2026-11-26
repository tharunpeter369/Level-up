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

## 2026-11-26 — Phase 0, Task 3: Fastify API + Drizzle + first migration

- `apps/api`: Fastify 5 + `fastify-type-provider-zod` (shared Zod schemas validate routes), Drizzle 0.45 + `pg` pool, config validated with Zod at startup, graceful shutdown. Runs directly on Node 24 (`node --watch src/server.ts`), no tsx/build.
- Routes: `GET /health` (liveness, never touches DB) and `GET /health/ready` (readiness, `select 1`; 503 when DB is down).
- First migration `0000_enable_pgvector.sql` (custom). Applied with our own `runMigrations()` so dev, tests, CI and prod share one code path.
- Tests: 6 unit (`app.inject()`, config) + 3 integration (Testcontainers, `pgvector/pgvector:pg18`, ~7 s).
- Hit: pnpm blocked install scripts → allowed only `esbuild` (drizzle-kit needs it) in `pnpm-workspace.yaml`. Turned off `require-await` (noise for async Fastify plugins; `no-floating-promises` still catches forgotten awaits). Chose Drizzle stable 0.45 over the 1.0 RC; revisit when 1.0 ships.
- Numbers: stopping Postgres → `/health/ready` returned 503 in 8 ms (5 s connection timeout as the worst case); recovered to 200 without restarting the API.
- Review fixes: readiness now logs _why_ the DB is down (`checkDatabase` rejects with the error; the route logs it and returns a generic 503). The log carries the driver cause, e.g. `caused by: AggregateError [ECONNREFUSED]`. Added `statement_timeout: 10s` to the pool. The idempotency test now runs migrations twice itself (it used to rely on test order) and checks one row in `drizzle.__drizzle_migrations`.

## 2026-11-26 — Dev workflow foundations (before Task 4)

- CI (`.github/workflows/ci.yml`): `checks` job (typecheck, lint, format, unit) + `integration` job (Testcontainers on GitHub's Docker). Actions pinned to current majors (checkout v7, setup-node v7, pnpm/action-setup v6).
- lefthook: pre-commit = Prettier + ESLint on staged files (fixes re-staged); pre-push = typecheck + unit tests. Hook install via root `prepare` script; lefthook's own postinstall denied in `allowBuilds`.
- Hit: git hooks run in a bare shell (default Node 20/18, no pnpm) → `pnpm: command not found`. Fixed with `.lefthook-rc.sh` (lefthook `rc:`) that loads nvm and uses `.nvmrc`. Verified in a throwaway repo copy from a minimal env: `any` blocked, bad formatting auto-fixed in the commit, push ran checks in ~3 s.
- Dependabot weekly (Saturday): npm (grouped minor/patch; TS and @types/node majors ignored on purpose), GitHub Actions, docker-compose images. `.vscode/` settings + recommended extensions. MIT license.
