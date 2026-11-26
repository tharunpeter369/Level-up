# Zod

## The problem

TypeScript types **disappear when your code runs**. If the API declares `body: { rating: "good" | "hard" }`, nothing stops a client from actually sending `{ rating: 42 }`. TypeScript trusted a promise that the outside world never made.

**Zod checks data at runtime** and gives you the TypeScript type from the same definition, so you write the shape once and get both.

```ts
import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  uptimeSec: z.number().nonnegative(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
// → { status: "ok"; uptimeSec: number }   (generated, never hand-written)
```

## Two ways to check

| Method                   | On bad data                         | Use when                                                                 |
| ------------------------ | ----------------------------------- | ------------------------------------------------------------------------ |
| `Schema.parse(data)`     | Throws an error                     | You want to stop immediately (our API error handler turns it into a 400) |
| `Schema.safeParse(data)` | Returns `{ success: false, error }` | You want to handle the failure yourself                                  |

## Where SkillForge uses it

```
packages/shared  ── defines schemas (single source of truth)
     │
     ├── apps/api  validates every request body, query and params
     ├── apps/web  validates API responses before using them
     └── packages/ai (Phase 4) validates AI output; LLMs often return broken JSON
```

Because both sides import the **same** schema from `@skillforge/shared`, the frontend and backend can't silently disagree about a data shape: change the schema and TypeScript shows every place that needs updating.

## Try it yourself

In `packages/shared/src/health.test.ts`, add a test that `{ status: "down", uptimeSec: 5 }` is rejected. Run `pnpm test`.

## Check yourself

1. Why isn't a TypeScript type enough to validate a request body?
2. What does `z.infer` do?
3. Why do the schemas live in `packages/shared` and not in `apps/api`?
