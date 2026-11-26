# apps/web: Next.js frontend

Next.js 16 (App Router, Turbopack) + React 19. Package name `@skillforge/web`. Guide: `docs/learn/nextjs.md`.

## Commands (from repo root)

- `pnpm dev`: web on http://127.0.0.1:3000 and API on :3001 together. Web alone: `pnpm --filter @skillforge/web dev`.
- `pnpm --filter @skillforge/web test`: Vitest unit tests (node environment, no DOM yet)
- `pnpm build`: `next build` (CI runs it; catches Server/Client Component mistakes)
- `typecheck` runs `next typegen` first (route types into `.next/types`, referenced by the generated `next-env.d.ts`, which is gitignored)

## File map

```
next.config.ts        loads the ROOT .env (process.loadEnvFile), transpilePackages: ["@skillforge/shared"]
src/
  config.ts           server-only env, Zod-validated (API_URL, default http://127.0.0.1:3001)
  lib/
    api.ts            getApiStatus(apiUrl, fetchFn): GET /health/ready, validated with shared ReadinessResponseSchema; never throws
    api.test.ts       fake fetch: ready, 503, wrong URL path, unreachable, non-JSON, contract violation
  app/
    layout.tsx        <html>/<body>, metadata, imports globals.css
    page.tsx          "/" Server Component: awaits getApiStatus, renders the System status list
    globals.css       placeholder tokens (light/dark); real design system comes before Phase 1 screens
```

## Patterns

- **Server Components by default**; `"use client"` only for interactive leaves (state, effects, event handlers).
- Data: fetch in Server Components, server-to-server to `API_URL` (no CORS, URL never reaches the browser). Use `cache: "no-store"` for live data. Validate every response with a schema from `@skillforge/shared`.
- API helpers in `src/lib/` take an injectable `fetchFn` so tests don't need a running API.
- New page: `src/app/<route>/page.tsx` (default export, required by Next). Shared UI goes in `src/components/` (create when needed).
- Status/meaning is never conveyed by color alone (text + `data-tone`).

## Gotchas

- Next.js 16 differs from older versions you may remember. Before using a Next API, check the docs bundled with this exact version: `apps/web/node_modules/next/dist/docs/` (e.g. `01-app/02-guides/upgrading/version-16.md`).
- `AGENTS.md` is generated and re-added by `next dev` (same advice, for other AI tools). Commit it as-is; don't edit it.
- Env: don't use `node --env-file` for Next (it forwards flags via NODE_OPTIONS, where that flag isn't allowed); the root `.env` is loaded in `next.config.ts`.
- Only `NEXT_PUBLIC_*` variables reach the browser; never put secrets there.
- Relative imports use `.ts`/`.tsx` extensions like the rest of the repo.
- Lint: `@next/eslint-plugin-next` (core-web-vitals) + `eslint-plugin-react-hooks`; warnings fail lint.
- Not built yet: Tailwind/design system, component tests (Testing Library), browser→API calls (CORS), PWA (Phase 2).
