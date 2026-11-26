# SkillForge

A gamified, AI-powered learning platform that turns the Top 1% SWE syllabus into a daily practice system (spaced repetition, active recall, interview simulation).
Primary user: the author. Built on weekends; the project also exists to make the author a better engineer and give them interview stories.

## Stack

- **Monorepo:** pnpm workspaces, Node 24 LTS, strict TypeScript everywhere
- **Web:** Next.js (App Router) in `apps/web`
- **API:** Fastify in `apps/api`, layered (routes → controllers → services → repositories)
- **DB:** PostgreSQL + pgvector, accessed with Drizzle ORM; analytics queries in raw SQL
- **Cache / queues:** Redis + BullMQ (worker added in Phase 5)
- **Validation:** Zod schemas in `packages/shared`, used by both web and api
- **Tests:** Vitest (unit), Supertest + Testcontainers (integration), Playwright (e2e)

## Commands

These are set up in Phase 0. Run from the repo root.

- `pnpm dev` start web + api
- `pnpm test` run all tests · `pnpm test --filter api` one package
- `pnpm lint` · `pnpm typecheck` · `pnpm format`
- `pnpm db:generate` create a migration from schema changes · `pnpm db:migrate` apply migrations
- `docker compose up -d` start Postgres and Redis

## Layout

```
apps/web        Next.js frontend (PWA)
apps/api        Fastify API
packages/shared Zod schemas, types, constants
packages/syllabus  Markdown parser + seed data
infra/          docker-compose, Dockerfiles
docs/           plan, architecture, specs, ADRs, journal
```

`apps/worker` and `packages/ai` are added when a phase needs them, not before.

## Rules

- Read the relevant spec in `docs/specs/` before starting a feature. If none exists, ask for one instead of guessing.
- Follow `docs/conventions.md`. A task is finished only when `docs/definition-of-done.md` is satisfied.
- Never add a dependency without asking first.
- Never edit a migration that has already been applied; create a new one.
- No `any`. No secrets in code or logs; use env vars and update `.env.example`.
- Keep changes small: one task per session. Stop and ask if scope grows.

## Learning mode

In these areas the author writes the code. **Do not write the implementation.** Explain approaches, give hints in increasing detail when asked, write or review tests, and review the author's code line by line.

- Syllabus Markdown parser
- Session/auth handling (cookie sessions)
- XP ledger, streaks, quests, and the mastery formula
- FSRS integration (scheduling logic around `ts-fsrs`)
- Code-runner sandbox (Web Worker)
- Rate limiter (Redis token bucket)
- AI provider adapter, fallback chain, circuit breaker
- RAG pipeline: chunking, hybrid search, ranking
- Agent loop for the coach
- SQL analytics and dashboard queries

If unsure whether something falls in these areas, ask.

## Docs

- Plan and roadmap: `docs/skillforge-project-plan.md`
- Architecture: `docs/architecture.md` · Data model and API: `docs/data-model.md`
- Conventions: `docs/conventions.md` · Definition of Done: `docs/definition-of-done.md`
- Feature specs: `docs/specs/` · Decisions: `docs/adr/` · Build journal: `docs/journal.md`
