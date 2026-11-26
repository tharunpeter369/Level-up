# Next.js (App Router)

## From React to Next.js

You know React: components, props, state, hooks. In a plain React app (Create React App, Vite), **everything runs in the browser**:

```
browser downloads JS → React renders an empty shell → useEffect fetches data → spinner → content
```

**Next.js** is a framework around React that adds a **server**. Components can run on the server, fetch data there, and send finished HTML to the browser:

```
browser asks for /  →  server runs the components, awaits data, renders HTML  →  browser shows content immediately
```

It also gives you routing from folders, an optimized bundler (**Turbopack**), image and font optimization, and a production server. Version used here: **Next.js 16 with React 19**.

## The big idea: Server Components vs Client Components

|                                           | Server Component (default)          | Client Component (`"use client"`)                         |
| ----------------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| Runs                                      | On the server only                  | On the server for the first HTML, then **in the browser** |
| Can be `async` and `await` data           | ✅                                  | ❌                                                        |
| `useState`, `useEffect`, `onClick`        | ❌                                  | ✅                                                        |
| Can read secrets / call internal services | ✅ (code never reaches the browser) | ❌ (it's shipped to the browser)                          |
| JavaScript sent to the browser            | None                                | Its code + React                                          |

```tsx
// app/page.tsx: a Server Component (no directive needed)
export default async function HomePage() {
  const status = await getReadiness(); // runs on the server; no useEffect, no spinner
  return <p>API: {status.status}</p>;
}
```

```tsx
// components/Counter.tsx: a Client Component
"use client";
import { useState } from "react";
export function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

**Rule of thumb:** start with Server Components; add `"use client"` only to the small interactive pieces (a button, a form, the review screen's keyboard shortcuts). A Server Component can render a Client Component, passing serializable props.

## App Router: folders are URLs

```
src/app/
  layout.tsx        wraps every page (<html>, <body>, shared header)
  page.tsx          → /
  problems/
    page.tsx        → /problems                 (Phase 1)
    [id]/page.tsx   → /problems/123             ([id] = dynamic segment)
  globals.css       global styles, imported once in layout.tsx
```

Special file names: `page.tsx` (the route), `layout.tsx` (shared wrapper that stays mounted), `loading.tsx` (shown while a page awaits data), `error.tsx` (error boundary), `not-found.tsx`.

`page.tsx` and `layout.tsx` use **default exports**: Next.js requires it (our conventions allow this exception).

## Fetching data and caching

In a Server Component you call `fetch` (or any async function) directly. You choose freshness per request:

- `fetch(url, { cache: "no-store" })`: fetch on every request (live data, like our API status).
- Cached/static data is possible too; Next decides at build time whether a page can be pre-rendered. Calling `no-store` makes the page **dynamic** (rendered per request).

Because the fetch runs **server-to-server** (Next.js server → our Fastify API), the browser never calls the API directly: no CORS setup, and the API URL isn't exposed. When a Client Component needs live data later, we'll add CORS to the API or proxy through Next.js.

## Environment variables

- Server-side code reads `process.env.X` normally. We load the **root** `.env` with Node's `--env-file-if-exists` (same as the API) and validate it with Zod in `src/config.ts`.
- Only variables prefixed **`NEXT_PUBLIC_`** are embedded into browser code. Never put secrets in a `NEXT_PUBLIC_` variable.

## Monorepo detail: `transpilePackages`

`@skillforge/shared` is TypeScript source, not compiled JavaScript. `transpilePackages: ["@skillforge/shared"]` in `next.config.ts` tells Next.js to compile it like the app's own code.

## Commands

| Command                               | What it does                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm dev`                            | Runs web (`http://127.0.0.1:3000`) and API (`:3001`) together, with hot reload              |
| `pnpm build`                          | Production build (`next build`): compiles, type-checks route types, pre-renders what it can |
| `pnpm --filter @skillforge/web start` | Runs the production build                                                                   |

`next build` catches mistakes the type checker can't, like using `useState` in a Server Component, which is why CI runs it.

## Try it yourself

1. `pnpm dev`, open `http://127.0.0.1:3000`. The badge shows the database status.
2. `docker compose stop postgres`, refresh: the badge changes. `docker compose start postgres`, refresh again.
3. Stop only the API (Ctrl+C in its output, or run just `pnpm --filter @skillforge/web dev`) and refresh. The page still renders, with "API unreachable".
4. View the page source in the browser (Cmd+Option+U): the status text is already in the HTML. That's server rendering.
5. Open DevTools → Network: no request to port 3001 from the browser. The fetch happened on the server.

## Common mistakes

- **Adding `"use client"` everywhere**: you lose server rendering and ship more JavaScript.
- **Using hooks in a Server Component**: `useState`/`useEffect` only work in Client Components (`next build` will tell you).
- **Secrets in `NEXT_PUBLIC_` variables**: they end up in the browser bundle.
- **Passing functions or class instances from Server to Client Components**: props must be serializable (plain data).

## Check yourself

1. Where does a Server Component run, and what does the browser receive?
2. When do you need `"use client"`?
3. Why doesn't our page need CORS on the API?
4. What does `cache: "no-store"` change?
5. Why must you never put a secret in a `NEXT_PUBLIC_` variable?
