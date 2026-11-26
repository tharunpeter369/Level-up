# Definition of Done

A task is done only when every applicable box is checked. Claude Code should run these checks and report the results, not assume them.

## Every task

- [ ] Every acceptance criterion in the spec (`docs/specs/`) is met, and each one is checked off explicitly
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] No `any`, no `console.log`, no commented-out code, no TODOs without a linked note in the spec
- [ ] New env vars are added to `.env.example` with placeholder values
- [ ] No new dependencies unless approved
- [ ] Codebase map (`<package>/CLAUDE.md`) updated if key files were added, moved or removed, or behavior changed

## When it applies

- [ ] **Business logic** (XP, streaks, mastery, scheduling, parser, rate limiter): unit tests cover the normal cases and every edge case listed in the spec
- [ ] **New endpoint:** Zod-validated input, auth required (or marked public on purpose), integration test for success, validation error and unauthorized
- [ ] **Schema change:** new migration generated and applied; `docs/data-model.md` updated
- [ ] **UI change:** checked manually in the browser, works with keyboard, works at phone width, works in dark mode
- [ ] **Architecture decision:** ADR written in `docs/adr/`
- [ ] **New technology:** guide written in `docs/learn/` and listed in `docs/learn/README.md`
- [ ] **Teaching:** "What you learned" recap and check-yourself questions given to the author
- [ ] **AI feature (Phase 4+):** output validated with Zod, prompt versioned, eval cases added and passing

## Before closing the session

- [ ] Committed with a clear message
- [ ] A few lines added to `docs/journal.md` (what was built, what broke, numbers if any)

## What to test where

| Kind        | Tool                                    | Covers                                                            |
| ----------- | --------------------------------------- | ----------------------------------------------------------------- |
| Unit        | Vitest                                  | Pure logic: XP rules, mastery, FSRS wrapper, parser, rate limiter |
| Integration | Vitest + Testcontainers (real Postgres) | Endpoints, repositories, transactions                             |
| End-to-end  | Playwright (from Phase 3)               | Login, review, solve flows                                        |
| AI evals    | Custom eval runner (from Phase 4)       | Hint leaks, grading quality, retrieval recall                     |
