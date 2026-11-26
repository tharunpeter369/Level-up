# Learn: How SkillForge Works

This folder is your textbook for the project. Every technology gets a guide written in plain language: **what it is, how it works, how SkillForge uses it, and things to try yourself.** A new guide is added whenever a new technology enters the project.

Read a guide **before** the task that introduces its technology, then read it again after building it.

---

## 1. The project in one paragraph

SkillForge is a web app that helps you study the Top 1% SWE syllabus every day. You track topics and problems, review flashcards on a smart schedule (so you remember things long term), earn XP for real learning, and practice interviews with AI. It has three running pieces: a **website** (what you click), an **API server** (the brain that applies rules and talks to the databases), and later a **background worker** (does slow jobs like AI calls and nightly calculations).

## 2. The big picture

```
   You (browser / phone)
          │
          ▼
 ┌──────────────────┐   HTTP + JSON    ┌──────────────────┐
 │  apps/web        │ ───────────────▶ │  apps/api        │
 │  Next.js (React) │ ◀─────────────── │  Fastify (Node)  │
 └──────────────────┘                  └────────┬─────────┘
                                                │
                     ┌──────────────────────────┼──────────────────┐
                     ▼                          ▼                  ▼
            ┌────────────────┐        ┌────────────────┐   ┌───────────────┐
            │  PostgreSQL    │        │  Redis         │   │ AI providers  │
            │  (+ pgvector)  │        │  cache, limits,│   │ (Phase 4)     │
            │  all real data │        │  job queues    │   └───────────────┘
            └────────────────┘        └───────┬────────┘
                                              ▼
                                      ┌────────────────┐
                                      │ apps/worker    │
                                      │ BullMQ jobs    │
                                      │ (Phase 5)      │
                                      └────────────────┘

 In development, Postgres and Redis run inside Docker on your laptop.
```

**A request, step by step** (example: you rate a flashcard "Good"):

1. The **web app** sends `POST /reviews/:cardId` with `{ rating: "good" }` to the API.
2. The **API** checks you're logged in (session cookie) and validates the body with **Zod**.
3. The **service** layer calculates the card's next due date with **FSRS** and records XP.
4. The **repository** layer saves both changes to **Postgres** in one transaction.
5. The API replies with JSON; the web app shows the next card.

## 3. The stack at a glance

| Layer           | Technology                                            | One-line job                                                         | Guide                                              | Introduced |
| --------------- | ----------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------- | ---------- |
| Tooling         | pnpm workspaces, TypeScript, ESLint, Prettier, Vitest | One repo, many packages, type-safe and tested                        | [monorepo-and-tooling.md](monorepo-and-tooling.md) | Phase 0 ✅ |
| Validation      | Zod                                                   | Checks data at runtime and gives TypeScript types                    | [zod.md](zod.md)                                   | Phase 0 ✅ |
| Containers      | Docker, Docker Compose                                | Runs Postgres and Redis on your laptop without installing them       | [docker.md](docker.md)                             | Phase 0 ✅ |
| Database        | PostgreSQL + pgvector                                 | Stores all real data; pgvector adds AI search                        | [postgres.md](postgres.md)                         | Phase 0 ✅ |
| Cache / queues  | Redis                                                 | Super-fast in-memory store: cache, rate limits, job queues           | [redis.md](redis.md)                               | Phase 0 ✅ |
| API             | Fastify                                               | The Node.js web server                                               | [fastify.md](fastify.md)                           | Phase 0 ✅ |
| DB access       | Drizzle ORM + `pg`                                    | Type-safe SQL and migrations from TypeScript                         | [drizzle.md](drizzle.md)                           | Phase 0 ✅ |
| Testing         | Vitest, `app.inject()`, Testcontainers                | Unit tests in memory, integration tests on a real throwaway Postgres | [testing.md](testing.md)                           | Phase 0 ✅ |
| Frontend        | Next.js (App Router)                                  | React framework with server rendering and routing                    | _coming in Task 4_                                 | Phase 0    |
| CI              | GitHub Actions                                        | Runs lint, typecheck and tests on every push                         | [ci-and-git-workflow.md](ci-and-git-workflow.md)   | Phase 0 ✅ |
| Auth            | GitHub OAuth + cookie sessions                        | Log in with GitHub                                                   | _Phase 1_                                          | Phase 1    |
| Memory          | FSRS (`ts-fsrs`)                                      | Decides when you should review each card                             | _Phase 2_                                          | Phase 2    |
| E2E tests       | Playwright                                            | Tests the app by clicking through a real browser                     | _Phase 3_                                          | Phase 3    |
| Background jobs | BullMQ                                                | Job queues on top of Redis                                           | _Phase 4–5_                                        | Phase 4    |
| AI              | Gemini / Groq / OpenRouter / Ollama                   | Hints, grading, interviewers                                         | _Phase 4_                                          | Phase 4    |
| Search / RAG    | Postgres full-text + pgvector                         | "Ask my notes"                                                       | _Phase 6_                                          | Phase 6    |

## 4. Where things live

```
apps/web            the website (Next.js)
apps/api            the API server (Fastify)
packages/shared     Zod schemas + types shared by web and api
packages/syllabus   parses the syllabus Markdown into data
compose.yaml        local Postgres + Redis
infra/              Docker-related files
docs/learn/         ← you are here
```

## 5. How to learn with this project

- **Before a task:** read the guide for any new technology (Claude writes it first).
- **During:** ask "why" whenever something is unclear. There are no stupid questions; that's the point of this project.
- **After:** answer the check-yourself questions at the end of each task. Later, turn them into SkillForge flashcards, so the app helps you remember how it was built.
- **Learning-mode areas** (see `CLAUDE.md`): you write that code yourself, with hints and reviews.

## 6. Glossary

| Term          | Meaning                                                                       |
| ------------- | ----------------------------------------------------------------------------- |
| **API**       | A server that other programs talk to over HTTP, usually with JSON             |
| **Container** | A running, isolated program started from an image (see Docker guide)          |
| **Image**     | A packaged, read-only template for a container (see Docker guide)             |
| **Migration** | A versioned file that changes the database structure (add a table, a column…) |
| **ORM**       | A library that lets you work with database tables from code                   |
| **Monorepo**  | One Git repo containing several related packages/apps                         |
| **Schema**    | A description of the shape of data (database schema, or a Zod schema)         |
| **Cache**     | A fast copy of data kept so you don't recompute or re-fetch it                |
| **Queue**     | A list of jobs waiting to be processed by a worker                            |
| **Session**   | How the server remembers who you are between requests (via a cookie)          |
| **CI**        | Continuous Integration: automatic checks on every push                        |

## 7. How Claude remembers the codebase

Each AI session starts with no memory of the code. Instead of searching the whole tree every time (slow, and it costs tokens), Claude reads **codebase maps**: `CLAUDE.md` files written for it.

| File                        | Loaded                                 | Contains                                              |
| --------------------------- | -------------------------------------- | ----------------------------------------------------- |
| `CLAUDE.md` (root)          | Every session                          | Rules, stack, top-level layout with links to the maps |
| `apps/api/CLAUDE.md`        | Only when working in `apps/api`        | API file map, how to add a feature module, gotchas    |
| `apps/web/CLAUDE.md`        | Only when working in `apps/web`        | Frontend map (from Task 4)                            |
| `packages/shared/CLAUDE.md` | Only when working in `packages/shared` | Schema map and rules                                  |

Splitting per package means backend work never pays for frontend context and vice versa. The maps hold **structure and intent** (where things are, why, how to add more), not every file, so they stay short and don't go stale. Keeping them current is part of the Definition of Done. They're useful for humans too: read `apps/api/CLAUDE.md` for a one-page tour of the API.
