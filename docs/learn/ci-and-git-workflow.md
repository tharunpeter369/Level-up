# CI, Git Hooks and the Branch Workflow

Four safety nets catch mistakes at different moments. The earlier one catches a problem, the cheaper it is to fix:

```
 while typing        before commit         before push            on GitHub              weekly
 ─────────────       ──────────────        ────────────           ─────────────          ──────────
 VS Code + ESLint →  lefthook pre-commit → lefthook pre-push →    CI (GitHub Actions) →  Dependabot
 red squiggles       format + lint the     typecheck + unit       everything, on a       update PRs
                     staged files (~1 s)   tests (~5 s)           clean machine          for deps
```

Each layer is fast because it only does what's needed at that moment; CI is the final authority.

## 1. Editor settings (`.vscode/`)

- `settings.json`: format on save with Prettier, ESLint fixes on save, and VS Code uses **the project's** TypeScript version (6.0) instead of its built-in one, so the editor shows the same errors as `pnpm typecheck`.
- `extensions.json`: VS Code suggests the extensions the project expects (Prettier, ESLint, Vitest, EditorConfig).

## 2. Git hooks with lefthook

A **git hook** is a script git runs automatically at certain moments (before a commit, before a push). They live in `.git/hooks/`, which isn't committed, so a tool installs them for everyone: `pnpm install` runs our root `prepare` script, `lefthook install`.

`lefthook.yml`:

- **pre-commit**: Prettier and ESLint run **only on the files you staged** (`{staged_files}`), fix what they can, and re-stage the fixes (`stage_fixed`). Unfixable lint errors block the commit.
- **pre-push**: `pnpm typecheck` and `pnpm test` (unit tests, no Docker). Pushing broken code to GitHub is blocked.

Escape hatch: `git commit --no-verify` skips hooks. Use it rarely (e.g. a work-in-progress commit on your own branch); CI still checks everything.

## 3. CI with GitHub Actions (`.github/workflows/ci.yml`)

**CI (Continuous Integration)** runs the checks on a fresh GitHub machine for every push and pull request. It catches what local hooks can't: a file you forgot to commit, a dependency missing from the lockfile, "works on my machine" differences.

```yaml
on:
  push: { branches: [main] }
  pull_request:
jobs:
  checks: # typecheck, lint, format, unit tests        (~1 min)
  integration: # Testcontainers tests with real Postgres      (~2 min)
```

Key lines explained:

- `runs-on: ubuntu-latest`: a fresh Linux VM, with Docker preinstalled (so Testcontainers works).
- `pnpm/action-setup` + `actions/setup-node` with `node-version-file: .nvmrc`: same Node and pnpm versions as your laptop.
- `pnpm install --frozen-lockfile`: fails if `pnpm-lock.yaml` is out of date instead of silently changing it.
- `concurrency`: a new push to the same branch cancels the older, now pointless run.
- `permissions: contents: read`: the workflow can read the code and nothing else (least privilege).

## 4. Branches, pull requests and branch protection

From now on, `main` always works:

```
git switch -c task-4-nextjs      # 1. branch per task
...work, commit...               # 2. hooks check each commit
git push -u origin task-4-nextjs # 3. push the branch
# 4. open a pull request on GitHub → CI runs → green → merge
git switch main && git pull      # 5. back to an updated main
```

**Branch protection** (a GitHub setting) makes this a rule, not a habit: `main` rejects direct pushes, and a pull request can only merge when CI is green.

Why bother when you're the only developer? It's the same workflow every company uses, CI catches your mistakes before they land, and each PR becomes a written record of a change (great interview material).

## 5. Dependabot (`.github/dependabot.yml`)

Dependencies get bug and security fixes constantly. Dependabot checks weekly and opens a pull request per update group. CI runs on it; if it's green, merge. Small weekly updates are easy; a year of skipped updates is a painful project of its own. We group minor and patch updates to limit noise, and track GitHub Actions and the Docker images in `compose.yaml` too.

## Check yourself

1. Why run Prettier and ESLint only on staged files in the pre-commit hook?
2. Why do we still need CI if every developer has the git hooks?
3. What does `--frozen-lockfile` protect against?
4. What does branch protection prevent?
5. Why are small weekly dependency updates better than one big yearly update?
