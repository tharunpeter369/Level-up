# packages/shared: contracts shared by web and api

Zod schemas and their inferred types: the single source of truth for API request/response shapes. Package name `@skillforge/shared`, imported as source (no build).

## File map

```
src/
  index.ts        re-exports every module (add new files here)
  health.ts       HealthResponseSchema (/health), ReadinessResponseSchema (/health/ready)
  health.test.ts
```

## Rules

- Export the schema and its type together: `export const XSchema = z.object(...)`, `export type X = z.infer<typeof XSchema>`.
- Platform-neutral: no Node or browser APIs (there are no `@types/node` or DOM types here, so `console`/`process` won't even typecheck).
- One file per API area (`problems.ts`, `reviews.ts`…), mirroring `apps/api/src/modules/`.
- Changing a schema changes the contract for both apps: run `pnpm typecheck` at the root to see every affected place.
