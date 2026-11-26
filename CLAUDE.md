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
- **Tests:** Vitest (unit, routes via Fastify `app.inject()`), Testcontainers (integration, real Postgres), Playwright (e2e)

## Commands

These are set up in Phase 0. Run from the repo root.

- `pnpm dev` start web + api
- `pnpm test` unit tests (no Docker) · `pnpm test:int` integration tests (needs Docker) · `pnpm --filter @skillforge/api test` one package
- `pnpm lint` · `pnpm typecheck` · `pnpm format`
- `pnpm db:generate` create a migration from schema changes · `pnpm db:migrate` apply migrations
- `pnpm db:up` / `pnpm db:down` start / stop Postgres (host port 5433) and Redis (host port 6380) · `pnpm db:reset` wipes their data

## Layout

```
apps/web           Next.js frontend (PWA)                 (Task 4)
apps/api           Fastify API                            → map: apps/api/CLAUDE.md
packages/shared    Zod schemas + types for web and api    → map: packages/shared/CLAUDE.md
packages/syllabus  Markdown parser + seed data            (Phase 1)
compose.yaml       local Postgres + Redis (Docker Compose)
infra/             Postgres init script, (later) Dockerfiles
docs/              plan, architecture, specs, ADRs, journal, learn/
.claude/skills/    /git-commit, /review-changes
.github/           CI workflow (ci.yml), Dependabot
lefthook.yml       git hooks: pre-commit format+lint staged files, pre-push typecheck+unit tests
```

`apps/worker` and `packages/ai` are added when a phase needs them, not before.

## Codebase maps

Each app/package has its own `CLAUDE.md`: a file map (one line per key file), how to add things, and gotchas. Claude Code loads it automatically when working in that folder, so this root file stays short.

- Use the map to go straight to the right file instead of searching the tree.
- **Keep it current:** when a change adds, moves, renames or removes a key file, or changes how something works, update that package's map in the same change.
- A new app/package gets its own `CLAUDE.md` and a `→ map:` entry above.
- Maps describe structure and intent, not every file; never paste code or full file lists into them.

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

## Teaching (every task)

The author is a full-stack developer (knows React, Node, MongoDB) but is new to much of this stack (Docker, Redis, Postgres, Next.js, Fastify, Drizzle…). The goal is understanding, not just a working app. In every task:

1. **Before coding:** explain the concepts the task needs, why we're doing it this way, and the alternatives we're not using. Keep it short and concrete.
2. **New technology:** before first use, write `docs/learn/<tech>.md` (what it is, how it works, how SkillForge uses it, try-it exercises, common mistakes, check-yourself questions) and add it to the table in `docs/learn/README.md`.
3. **While coding:** explain non-obvious lines; connect them to the docs/learn guides.
4. **After the task:** give a short "What you learned" recap, 3–5 check-yourself questions, and one hands-on thing to try.
5. Assume no prior knowledge of the new tech; relate it to what the author knows (React, Node, MongoDB).

## Docs

- Plan and roadmap: `docs/skillforge-project-plan.md`
- Architecture: `docs/architecture.md` · Data model and API: `docs/data-model.md`
- Conventions: `docs/conventions.md` · Definition of Done: `docs/definition-of-done.md`
- Feature specs: `docs/specs/` · Decisions: `docs/adr/` · Build journal: `docs/journal.md`
- Learning guides (project overview + one per technology): `docs/learn/`
