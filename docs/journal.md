# Build Journal

A few lines every weekend: what you built, what broke, how you fixed it, and any numbers.

## 2026-11-26

- Cleaned up docs, wrote Tier 1 docs (CLAUDE.md, architecture, data model, conventions, Definition of Done).
- Decisions: Fastify for the API, Drizzle for DB access, start Phase 0 with only web, api, shared.

## 2026-11-26 — Phase 0, Task 1: workspace + tooling
- pnpm workspace, strict TS base config, ESLint (typescript-eslint strictTypeChecked), Prettier, Vitest; `packages/shared` with a Zod `HealthResponseSchema` and 2 tests.
- Hit: `pnpm add typescript` installed TS 7.0, but typescript-eslint 8.74 only supports TS < 6.1. Pinned `typescript@~6.0.0`. Revisit when typescript-eslint supports TS 7 (the Go-native compiler — big typecheck speedup).
- Node 24 via nvm (`.nvmrc`); pnpm 12 via corepack.
