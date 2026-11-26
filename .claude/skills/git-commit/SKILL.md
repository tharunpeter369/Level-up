---
name: git-commit
description: Analyze the working-tree changes, propose how to group them into commits with short messages, and stage and commit them after the user approves. Never pushes.
argument-hint: "[optional hint, e.g. 'one commit' or 'docs only']"
disable-model-invocation: true
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git restore --staged:*), AskUserQuestion
---

# /git-commit

The user runs this to get help committing. They push themselves. **Never run `git push`.**

User hint (may be empty): $ARGUMENTS

## 1. Look at the changes

Run these together:

- `git status --short --branch`
- `git diff --stat` and `git diff --cached --stat`
- `git log --oneline -8` (match the repo's message style)

Then read the actual diffs (`git diff`, `git diff --cached`) for the files that matter. For new untracked files, read enough to know what they are. Skip lockfile contents; just note that the lockfile changed.

## 2. Safety checks (stop and warn if any fail)

- **Secrets:** never stage `.env`, `.env.*` (except `.env.example`), `*.pem`, `*.key`, credentials files, or anything that looks like a token or password in the diff.
- **Junk:** `node_modules/`, build output, `.DS_Store`, logs, large binaries. Suggest adding them to `.gitignore` instead.
- **Unintended changes:** debug leftovers (`console.log`, `.only(` in tests, commented-out code). Mention them; don't fix them silently.
- If nothing has changed, say so and stop.

## 3. Propose commits

Group changes into **logical commits**: one idea per commit. Keep together files that change for the same reason (e.g. a feature and its test, a dependency and the lockfile). Split unrelated changes (e.g. tooling vs docs). If the user's hint says "one commit", make one.

For each commit, write a message:

- **Subject:** imperative mood, capitalized, no period, **≤ 60 characters**. Example: `Add Docker Compose for Postgres and Redis`.
- **Body:** usually none. Add at most 2 short bullet lines only if the _why_ isn't obvious from the subject.
- No type prefixes like `feat:` (this repo doesn't use them), no emojis, no file lists.
- End with a blank line and the attribution line from the session instructions, if one was given.

Show the plan compactly:

```
Commit 1: Add Docker Compose for Postgres and Redis
  compose.yaml, infra/postgres/init.sql, .env.example, package.json

Commit 2: Add learning guides for the stack
  docs/learn/*, CLAUDE.md
```

Then ask with AskUserQuestion: **Commit as proposed** / **Make it one commit** / **Edit messages** (they'll type changes in "Other").

## 4. Commit (only after approval)

For each commit, in order:

1. `git add -- <explicit file paths>`. Never use `git add -A` or `git add .`, so nothing unexpected sneaks in.
2. `git commit -m "<subject>"` (add `-m "<body>"` and the attribution as extra `-m` arguments when present).
3. If a pre-commit hook fails, show the error, fix nothing on your own, and ask what to do. Never use `--no-verify`.

If something was already staged before you started, include it in the plan and mention it.

## 5. Finish

Show `git log --oneline -<number of commits made>` and `git status --short`. End with one line: `Ready to push: git push`. Do not push.
