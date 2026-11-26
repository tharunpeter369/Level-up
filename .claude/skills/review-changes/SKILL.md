---
name: review-changes
description: Review the current uncommitted changes (or a given commit range) against SkillForge's rules, conventions and Definition of Done. Runs the checks, reports findings by severity, and explains each one so the author learns. Read-only; never edits files.
argument-hint: "[optional: file/folder, 'staged', or a range like 'main..HEAD' / 'HEAD~3']"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git show:*), Bash(git ls-files:*), Bash(source ~/.nvm/nvm.sh:*), Bash(nvm use:*), Bash(pnpm typecheck:*), Bash(pnpm lint:*), Bash(pnpm test:*), Bash(pnpm format:check:*)
---

# /review-changes

Act as a senior reviewer **and** a teacher. The author wants to learn, not just get a list of problems.

**Read-only: never edit files, stage, commit, or run anything that changes the repo.** Suggest fixes; the author applies them.

Target (may be empty): $ARGUMENTS

- empty → all uncommitted changes (staged + unstaged + new files)
- `staged` → only `git diff --cached`
- a path → uncommitted changes under that path
- a range (`main..HEAD`, `HEAD~3`) → `git diff <range>`

## 1. Gather context

1. `git status --short --branch`, then the diff for the target. Read new files in full.
2. Read `CLAUDE.md`, `docs/conventions.md` and `docs/definition-of-done.md`.
3. If the change touches a feature, read its spec in `docs/specs/` (note it if missing). If it touches the schema, read `docs/data-model.md`.
4. For each changed file, read enough surrounding code to judge it. Don't review a diff line in isolation.

## 2. Run the checks

The project needs Node 24, but the shell's default may be an older Node without pnpm, and each Bash call starts fresh. So load nvm and switch Node **in the same command** as each check, for example:

```bash
source ~/.nvm/nvm.sh && nvm use >/dev/null && pnpm typecheck
```

Run the four checks this way: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm format:check` (independent, so run them in parallel). Don't change the user's default Node version. Report pass/fail with the relevant error lines. If a script doesn't exist yet, say so and move on. If Docker-dependent tests fail because Docker isn't running, say that rather than calling it a bug.

## 3. Review

Check, in this order:

1. **Correctness:** logic bugs, edge cases (null/empty, timezones and midnight for streaks/quests, off-by-one), unhandled promises, race conditions, wrong transaction boundaries.
2. **Security:** unvalidated input (every body/query/params needs a Zod schema), queries not scoped by the session's `user_id`, secrets in code or logs, missing auth on routes, SQL built from strings.
3. **Project rules (`CLAUDE.md`):** no `any`; no unapproved new dependencies (check `package.json` diffs); never edit an applied migration; `.env.example` updated for new env vars; learning-mode areas written by the author, not generated.
4. **Conventions (`docs/conventions.md`):** layer boundaries (routes → controllers → services → repositories; services import no Fastify/Drizzle), error and response format, naming, file locations, `now` passed in rather than `new Date()` inside logic.
5. **Tests:** behavior and spec edge cases covered, test names describe behavior, no `.only`/`.skip` left.
6. **Docs:** `docs/data-model.md` matches schema changes; new technology has a `docs/learn/` guide; ADR for big decisions; journal entry.
7. **Simplicity:** dead code, duplication, over-engineering, unclear names.

Only report real issues you can point to. No vague "consider…" padding. If unsure, mark it as a question.

## 4. Report

Keep it scannable:

```
## Review: <what changed, one line>

Checks: typecheck ✅ · lint ✅ · test ❌ (1 failing) · format ✅

### 🔴 Must fix
1. `apps/api/src/modules/reviews/reviews.service.ts:42`: <problem in one sentence>
   **Why it matters:** <the concept, in plain words, related to React/Node/MongoDB when it helps>
   **Fix:** <what to change; a short snippet only if it's not a learning-mode area>

### 🟡 Should fix
### 🔵 Nice to have / questions

### ✅ Done well
- <1–3 specific things worth repeating>

### Definition of Done
- [x] typecheck · [ ] spec criteria checked · [ ] journal updated · …  (only the items that apply)

### What to learn from this
<1–3 bullets: the underlying concepts behind the findings, with links to `docs/learn/` guides when relevant>
```

Rules for the report:

- Always give `file:line`.
- **Learning-mode areas** (listed in `CLAUDE.md`): explain the problem and give a **hint**, not the finished code, unless the author asks for the solution.
- Omit empty sections, except "Checks" and "Definition of Done".
- If everything is clean, say so plainly in one line before the checks.
- End with one line: the next step (e.g. "Fix the 🔴 items, then run `/git-commit`").
