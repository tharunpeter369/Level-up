# Monorepo and Tooling (pnpm, TypeScript, ESLint, Prettier, Vitest)

## The monorepo

SkillForge has several pieces (web, api, shared code, later a worker) that change together. A **monorepo** keeps them in **one Git repo**, so one commit can change the API and the website at the same time, and shared code like Zod schemas is imported directly instead of being published to npm.

```
package.json            root: scripts that run across everything
pnpm-workspace.yaml     says "packages live in apps/* and packages/*"
apps/web, apps/api      runnable apps
packages/shared         library code imported as "@skillforge/shared"
```

## pnpm

pnpm is an npm alternative. Why it's used here:

- **Workspaces:** understands monorepos. `pnpm --filter @skillforge/shared test` runs one package; `pnpm -r test` runs all.
- **Fast and disk-efficient:** every package version is stored once on your Mac and **linked** into projects instead of copied.
- **Strict:** a package can only import dependencies it actually declares. npm lets you accidentally import "phantom" dependencies that break later.
- **`pnpm-lock.yaml`:** records exact versions so everyone (and CI) installs the same thing. Always commit it.

`corepack` (ships with Node) installs the exact pnpm version in `package.json` → `"packageManager"`.
`.nvmrc` says "Node 24", so `nvm use` switches to it.

| Command                                    | Meaning                                                  |
| ------------------------------------------ | -------------------------------------------------------- |
| `pnpm install`                             | Install everything for all packages                      |
| `pnpm add -D x -w`                         | Add a dev dependency to the root (`-w` = workspace root) |
| `pnpm --filter @skillforge/shared add zod` | Add a dependency to one package                          |
| `pnpm -r <script>`                         | Run a script in every package that has it                |

## TypeScript (strict)

TypeScript checks types **before** the code runs. `tsconfig.base.json` is the shared config every package extends. The settings that matter most:

| Setting                    | What it catches                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `strict`                   | `null`/`undefined` mistakes, implicit `any`, and more                              |
| `noUncheckedIndexedAccess` | `arr[0]` is typed `T \| undefined`, so you must handle "maybe missing"             |
| `verbatimModuleSyntax`     | Forces `import type` for types, which keeps compiled output predictable            |
| `module: NodeNext`         | Node's real ES-module rules, which is why imports end in `.js` even in `.ts` files |

```ts
const scores = [10, 20];
const first = scores[0]; // type: number | undefined  (noUncheckedIndexedAccess)
first.toFixed(); // ❌ error: might be undefined
first?.toFixed(); // ✅
```

**Why imports say `./health.js` in a `.ts` file:** Node runs the compiled `.js` files, and TypeScript doesn't rewrite import paths, so you write the path that will exist at runtime.

**Version note:** we pinned TypeScript 6.0 because typescript-eslint doesn't support TypeScript 7 yet (see `journal.md`).

## Three different checkers (people mix these up)

| Tool                   | Question it answers                                                    | Command                             |
| ---------------------- | ---------------------------------------------------------------------- | ----------------------------------- |
| **TypeScript** (`tsc`) | "Are the types correct?"                                               | `pnpm typecheck`                    |
| **ESLint**             | "Is this code risky or bad practice?" (e.g. `any`, unhandled promises) | `pnpm lint`                         |
| **Prettier**           | "Is it formatted consistently?" (spaces, quotes, line breaks)          | `pnpm format` / `pnpm format:check` |

We use typescript-eslint's **strictTypeChecked** rules, which use type information, so ESLint catches things like a forgotten `await`. `eslint-config-prettier` switches off ESLint's formatting rules so the two tools never fight.

## Vitest

The test runner (Jest-compatible API, but fast and native to ES modules and TypeScript).

```ts
describe("HealthResponseSchema", () => {
  it("rejects a negative uptime", () => {
    expect(HealthResponseSchema.safeParse({ status: "ok", uptimeSec: -1 }).success).toBe(false);
  });
});
```

- Test files sit next to the code: `health.ts` → `health.test.ts`.
- Run all: `pnpm test`. Watch mode in one package: `pnpm --filter @skillforge/shared exec vitest`.

## Try it yourself

1. In `packages/shared/src/health.ts`, change `uptimeSec: z.number()` to `z.string()`. Run `pnpm typecheck` and `pnpm test`. Which one fails and why? Then undo it.
2. Add `const x: any = 1;` to a file and run `pnpm lint`. Then remove it.
3. Mess up the indentation of a file, run `pnpm format:check`, then `pnpm format`.

## Check yourself

1. What's the difference between what `tsc`, ESLint and Prettier check?
2. Why should `pnpm-lock.yaml` be committed?
3. What does `noUncheckedIndexedAccess` change about `arr[0]`?
4. Why does a monorepo make sharing Zod schemas between web and api easy?
