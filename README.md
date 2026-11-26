# SkillForge

A gamified, AI-powered learning platform that turns a software engineering syllabus into a daily practice system: spaced-repetition flashcards, a problem log, XP for real learning (not clicks), and AI interview practice.

> 🚧 **Status:** early development (Phase 0: foundations). Built on weekends; follow progress in [`docs/journal.md`](docs/journal.md).

## Stack

| Layer             | Technology                                   |
| ----------------- | -------------------------------------------- |
| Frontend          | Next.js (App Router), React, TypeScript      |
| API               | Fastify (Node.js 24), layered architecture   |
| Database          | PostgreSQL 18 + pgvector, Drizzle ORM        |
| Cache / queues    | Redis 8, BullMQ                              |
| Validation        | Zod (schemas shared by web and API)          |
| Spaced repetition | FSRS (`ts-fsrs`)                             |
| Testing           | Vitest, Testcontainers, Playwright, AI evals |
| Tooling           | pnpm workspaces, ESLint, Prettier, Docker    |

## Architecture

```
 Browser (Next.js PWA) ──HTTP/SSE──▶ Fastify API ──┬──▶ PostgreSQL + pgvector
                                                   ├──▶ Redis (cache, rate limits, queues)
                                                   └──▶ AI providers (with fallback)
                                    BullMQ worker ◀─┘   (background jobs)
```

More: [architecture](docs/architecture.md) · [data model](docs/data-model.md) · [project plan](docs/skillforge-project-plan.md)

## Getting started

**Requirements:** [nvm](https://github.com/nvm-sh/nvm), Docker Desktop (or another Docker engine).

```bash
nvm install && nvm use          # Node 24, from .nvmrc
corepack enable pnpm            # pnpm, pinned in package.json
pnpm install
cp .env.example .env            # local settings; edit the password if you like
pnpm db:up                      # Postgres (localhost:5433) + Redis (localhost:6380)
```

Check everything works:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm test:int
pnpm db:migrate                 # apply database migrations
pnpm dev                        # API on http://localhost:3001/health
```

## Scripts

| Command                  | What it does                                   |
| ------------------------ | ---------------------------------------------- |
| `pnpm db:up` / `db:down` | Start / stop Postgres and Redis (data is kept) |
| `pnpm db:reset`          | Wipe local database data and start fresh       |
| `pnpm typecheck`         | TypeScript checks across all packages          |
| `pnpm lint`              | ESLint (warnings fail too)                     |
| `pnpm dev`               | Run the API with auto-restart on file changes  |
| `pnpm test`              | Unit tests (Vitest, no Docker needed)          |
| `pnpm test:int`          | Integration tests (real Postgres via Docker)   |
| `pnpm db:generate`       | Create a migration from schema changes         |
| `pnpm db:migrate`        | Apply pending migrations                       |
| `pnpm format`            | Format everything with Prettier                |

## Repository layout

```
apps/api         Fastify API (health checks, Drizzle, migrations)
apps/web         Next.js frontend, coming next
packages/shared  Zod schemas and types shared by web and API
compose.yaml     local Postgres + Redis
infra/           Postgres init script, later Dockerfiles
docs/            plan, architecture, specs, ADRs, journal
docs/learn/      plain-language guides to every technology used
```

## Development workflow

Each change goes on a branch and is merged into `main` through a pull request once [CI](.github/workflows/ci.yml) passes. Git hooks ([lefthook](lefthook.yml)) format and lint on commit, and typecheck and test on push. Details: [CI and git workflow](docs/learn/ci-and-git-workflow.md).

## Docs

- [Learning guides](docs/learn/README.md): how each technology works and how SkillForge uses it
- [Architecture decisions](docs/adr/) · [Coding conventions](docs/conventions.md) · [Definition of Done](docs/definition-of-done.md)

## License

[MIT](LICENSE)
