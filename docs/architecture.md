# Architecture

Moved from sections 5 and 2 of `skillforge-project-plan.md`. This file is now the source of truth.

## System overview

```
 Browser (Next.js PWA)
   |  - Web Worker sandbox runs JS/TS code against test cases
   |
   |  HTTPS + Server-Sent Events (streaming AI)
   v
 Node.js API (Fastify, TypeScript)
   |-- PostgreSQL + pgvector   (all app data, embeddings, full-text search)
   |-- Redis                   (cache, rate limits, queues, streaks, leaderboards)
   |-- AI Provider Adapter --> Gemini | Groq | OpenRouter | Ollama (local)
   |
   v
 Worker process (BullMQ)        <- added in Phase 5
   - AI jobs (card generation, code review)
   - Embedding jobs for notes
   - Nightly mastery recompute
   - Daily reminders and weekly coach reports

 Later: Judge0 (Docker) for Python/Java execution
```

## Key decisions

| Area              | Decision                                                        | ADR      |
| ----------------- | --------------------------------------------------------------- | -------- |
| Database          | PostgreSQL + pgvector (one DB for relational + vector)          | 0001     |
| DB access         | Drizzle ORM for schema and migrations; raw SQL for analytics    | to write |
| API framework     | Fastify (TypeScript-friendly, built-in schema validation, fast) | to write |
| Frontend          | Next.js App Router                                              | —        |
| Cache / queues    | Redis + BullMQ                                                  | —        |
| Spaced repetition | FSRS via `ts-fsrs`                                              | —        |
| XP                | Append-only event ledger                                        | —        |
| Auth              | GitHub OAuth + httpOnly cookie sessions stored in Postgres      | to write |
| AI                | Provider adapter with fallback chain                            | —        |
| Code execution    | Browser Web Worker for JS/TS; Judge0 later                      | —        |

## API design: layered and event-driven

- **Layers:** routes → controllers → services → repositories. Business rules (XP, mastery, scheduling) live in services and are unit-tested without a database. See `conventions.md`.
- **Domain events:** actions emit events such as `ProblemSolved`, `CardReviewed`, `QuestCompleted`. XP, mastery, quest and badge services subscribe to them.
- **Planned evolution:** start with an in-process event bus. Later, move heavy handlers onto BullMQ queues and measure the latency difference (interview story with numbers).

## Repository structure

Grow into this; only create a package when a phase needs it.

```
apps/
  web/        Next.js frontend (PWA)             Phase 0
  api/        Fastify API                        Phase 0
  worker/     BullMQ background jobs             Phase 5
packages/
  shared/     Zod schemas, types, constants      Phase 0
  syllabus/   Markdown parser and seed data      Phase 1
  ai/         Provider adapter, prompts, evals   Phase 4
infra/        docker-compose, Dockerfiles
docs/
  adr/        Architecture Decision Records
  specs/      Feature specs with acceptance criteria
  journal.md  Build journal
```

Turborepo is optional; add it only when builds get slow.

## Hosting

- **Dev:** Docker Compose for Postgres and Redis; Ollama for local AI.
- **Prod (Phase 9):** Vercel (web); Render / Fly.io / Railway (api + worker); Neon or Supabase (Postgres); Upstash (Redis). Check current free-tier limits before choosing.
