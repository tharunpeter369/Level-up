# Coding Conventions

## General

- Strict TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`). No `any`; use `unknown` and narrow.
- ES modules everywhere. Named exports only (except where Next.js requires default exports).
- Prefer pure functions for business logic; pass time in (`now: Date`) instead of calling `new Date()` inside logic, so tests are deterministic.
- No commented-out code. Comments explain _why_, not _what_.

## Naming

| Thing                       | Style                   | Example                          |
| --------------------------- | ----------------------- | -------------------------------- |
| Files                       | `kebab-case`            | `review-queue.service.ts`        |
| Types, classes, Zod schemas | `PascalCase`            | `CardReview`, `CardReviewSchema` |
| Functions, variables        | `camelCase`             | `getDueCards`                    |
| Constants                   | `SCREAMING_SNAKE_CASE`  | `MAX_DAILY_CARDS`                |
| DB tables / columns         | `snake_case`            | `card_states.due_at`             |
| Domain events               | Past-tense `PascalCase` | `CardReviewed`                   |

## API (`apps/api`)

Each feature is a folder under `src/modules/<feature>/`:

```
src/modules/reviews/
  reviews.routes.ts       registers routes, attaches Zod schemas
  reviews.controller.ts   reads request, calls service, shapes response
  reviews.service.ts      business rules; no Fastify or DB imports
  reviews.repository.ts   all DB access for this feature (Drizzle)
  reviews.service.test.ts unit tests (repository mocked or faked)
```

- **Routes** only wire things up. **Controllers** have no business logic. **Services** never import Fastify or Drizzle directly; they receive repositories as parameters. **Repositories** never contain business rules.
- **Validation:** every request body, query and params is validated with a Zod schema from `packages/shared`. Never trust unvalidated input.
- **Response format:**
  - Success: the resource itself, e.g. `{ "id": "...", "title": "..." }` or `{ "items": [...], "nextCursor": "..." }` for lists.
  - Error: `{ "error": { "code": "NOT_FOUND", "message": "Card not found" } }` with the matching HTTP status.
- **Errors:** services throw typed errors (`NotFoundError`, `ValidationError`, `ForbiddenError`, `ConflictError`) from `src/lib/errors.ts`. One Fastify error handler maps them to the response format. Unknown errors become 500 with a generic message; details go to logs only.
- **Auth:** every route requires a session unless explicitly marked public. Always scope queries by `user_id` from the session, never from the request body.
- **Logging:** pino via Fastify's logger. Structured fields, include the request ID. Never log secrets, tokens, cookies or API keys.
- **Pagination:** cursor-based for lists that can grow.

## Shared (`packages/shared`)

- Zod schemas are the single source of truth for API contracts. Export the schema and the inferred type: `export type Card = z.infer<typeof CardSchema>`.

## Web (`apps/web`)

- Server Components by default; add `"use client"` only when needed (state, effects, browser APIs).
- Components: `PascalCase.tsx`, one component per file, colocated with their route when used only there; shared ones in `src/components/`.
- Fetch data through a typed API client in `src/lib/api.ts` that parses responses with the shared Zod schemas.
- Every interactive element is keyboard accessible (reviews must work keyboard-only).

## Database

- Schema changes only through Drizzle migrations (`pnpm db:generate`). Never edit an applied migration.
- Multi-step writes (e.g. review + XP event) run in one transaction.
- `docs/data-model.md` is updated in the same change as the schema.

## Tests

- Test files sit next to the code: `foo.ts` → `foo.test.ts`. Integration tests: `*.int.test.ts`. E2E: `apps/web/e2e/`.
- Test names describe behavior: `it("caps the queue at 30 cards on weekdays")`.

## Git

- Small commits, imperative mood: `Add review queue endpoint`.
- One feature per branch once CI exists; PR description says what changed, why, and how it was tested.
