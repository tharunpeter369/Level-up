# apps/api: Fastify API

Node 24 runs the TypeScript source directly (type stripping): no build step, no tsx. Package name `@skillforge/api`.

## Commands (from repo root)

- `pnpm dev`: `node --watch` on `src/server.ts`, port 3001, pretty logs. Needs `pnpm db:up`.
- `pnpm --filter @skillforge/api test`: unit tests (no Docker) · `pnpm test:int`: Testcontainers tests (Docker)
- `pnpm db:generate`: diff `src/db/schema.ts` → new SQL in `drizzle/` · `pnpm db:migrate`: apply pending migrations

## File map

```
src/
  server.ts          entry: loadConfig → createDb → buildApp → listen; SIGINT/SIGTERM graceful shutdown; closes pool onClose
  app.ts             buildApp(deps): Fastify + Zod type provider, registers route plugins. No listen → tests use app.inject()
  config.ts          Zod-validated env (NODE_ENV, API_HOST, API_PORT, LOG_LEVEL, DATABASE_URL). New env var: add here + .env.example
  config.test.ts
  db/
    client.ts        createDb(url, { onIdleClientError }) → { db, pool }: pg.Pool (max 10, connect timeout 5s,
                     statement_timeout 10s) + Drizzle. Always has a pool 'error' listener (see Gotchas)
    schema.ts        Drizzle table definitions (empty until Phase 1)
    migrate.ts       runMigrations(url): the only migration code path (CLI, tests, CI, prod)
    run-migrations.ts  CLI entry for `pnpm db:migrate`
    db.int.test.ts   Testcontainers: pgvector enabled, idempotent migrations, survives dropped idle connection,
                     /health/ready against real DB
  modules/
    health/          GET /health (liveness, never touches DB), GET /health/ready (select 1 → 200 or 503 + warn log)
      health.routes.ts  health.repository.ts (pingDatabase)  health.test.ts
drizzle/
  0000_enable_pgvector.sql   custom migration; meta/ = drizzle-kit journal + snapshots (generated, don't hand-edit)
drizzle.config.ts    drizzle-kit config (generate only)
```

## Adding a feature module (e.g. `problems`)

1. `src/modules/problems/`: `problems.routes.ts` (FastifyPluginAsyncZod, Zod schemas from `@skillforge/shared`), `problems.controller.ts`, `problems.service.ts` (pure logic, no Fastify/Drizzle imports), `problems.repository.ts` (Drizzle), tests next to each.
2. Pass dependencies in through `buildApp()` / plugin options (like `checkDatabase`) so unit tests can use fakes.
3. Register the plugin in `app.ts`. Add request/response schemas to `packages/shared`.
4. Tables: edit `src/db/schema.ts` → `pnpm db:generate` → read the SQL → `pnpm db:migrate`; update `docs/data-model.md`.

## Gotchas

- Relative imports end in `.ts`. No `enum`/`namespace`/parameter properties (`erasableSyntaxOnly`).
- Env comes from the root `.env` via `--env-file-if-exists=../../.env`; `loadConfig()` fails fast on bad values.
- Log with `request.log` / `app.log` (pino), never `console`. Errors: log the cause server-side, return a generic body.
- Every `pg.Pool` needs an `'error'` listener: when Postgres drops an idle connection the pool emits 'error', and an
  unhandled 'error' event crashes Node. `createDb()` always attaches one; never create a raw `pg.Pool` elsewhere.
- Unit tests must not need Docker; anything touching Postgres is `*.int.test.ts`.
- Not built yet (Phase 1): error handler + `{ error: { code, message } }` format, auth/sessions. Fastify's default 404/500 bodies are used until then.
