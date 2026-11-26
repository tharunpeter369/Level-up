---
name: git-commit
description: Analyze the working-tree changes and print ready-to-copy git add / git commit commands with short messages. Read-only; never stages, commits or pushes.
argument-hint: "[optional hint, e.g. 'one commit' or 'docs only']"
disable-model-invocation: true
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git ls-files:*), Bash(git check-ignore:*)
---

# /git-commit

The user wants **instructions only**. They review the commands, then copy and run them themselves.

**Never run `git add`, `git commit`, `git push`, `git restore`, `git reset` or any other command that changes the repo.** Only read.

User hint (may be empty): $ARGUMENTS

## 1. Look at the changes

Run these together:

- `git status --short --branch`
- `git diff --stat` and `git diff --cached --stat`
- `git ls-files --others --exclude-standard` (new files)
- `git log --oneline -8` (match the repo's message style)

Then read the actual diffs (`git diff`, `git diff --cached`) for the files that matter. For new files, read enough to know what they are. Skip lockfile contents; just note that the lockfile changed.

## 2. Safety checks (warn clearly if any fail)

- **Secrets:** `.env`, `.env.*` (except `.env.example`), `*.pem`, `*.key`, credentials files, or anything that looks like a token or password in the diff. Tell the user not to commit these.
- **Junk:** `node_modules/`, build output, `.DS_Store`, logs, large binaries. Suggest adding them to `.gitignore`.
- **Leftovers:** `console.log`, `.only(` in tests, commented-out code. Point them out.
- If nothing has changed, say so and stop.

## 3. Write the instructions

Group changes into **logical commits**: one idea per commit. Keep together files that change for the same reason; split unrelated changes. If the hint says "one commit", make one. If one file belongs to two ideas, put it in the closer commit and say so in one line.

Message rules:

- **Subject:** imperative mood, capitalized, no period, **≤ 60 characters**. Example: `Add Docker Compose for Postgres and Redis`.
- **Body:** usually none. At most 2 short lines, and only if the _why_ isn't obvious.
- No `feat:`-style prefixes, no emojis, no file lists, no attribution lines.

Output format: a one-line summary of what changed, any warnings, then one copyable block per commit, staging files by explicit path (never `git add .` or `-A`):

````
**1. Add Docker Compose for local Postgres and Redis**
```bash
git add compose.yaml infra/postgres/init.sql .env.example package.json
git commit -m "Add Docker Compose for local Postgres and Redis"
```
````

If something is already staged, say so first and include `git restore --staged <file>` in the instructions if it belongs in a different commit.

End with: `Then: git push`. Nothing else; don't run anything.
