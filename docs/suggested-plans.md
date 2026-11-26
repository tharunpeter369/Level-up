Good choice. With Claude Code, the quality of your docs largely decides the quality of the code you get, because each session starts fresh and the docs are how it understands your project. Your project plan already covers the "what" and "why." What you still need are docs that tell Claude Code exactly how to build each piece and when it's done.
Tier 1: Write these before Phase 0
1. CLAUDE.md (most important). This is the file Claude Code reads at the start of every session. Keep it limited to facts Claude should hold in every session, like build commands, conventions, project layout, and "always do X" rules. Multi-step procedures, or rules that only apply to one part of the codebase, belong in skills or path-scoped rules instead. Keep it short, because longer files consume more context and reduce how well Claude follows them; you can split them using imports or .claude/rules/ files. It should contain a two-line project summary, the stack, commands (dev, test, lint, migrate), the repo layout, key rules (such as "don't add dependencies without asking" or "never edit an applied migration"), and links to the docs below.
2. Feature specs with acceptance criteria. One file per phase or feature in docs/specs/, each with user stories, exact acceptance criteria, edge cases, and what's out of scope. This is the doc that matters most for good output. "Build a review queue" gets you generic code; "the queue shows cards where due_at ≤ now, capped at 30 on weekdays, ordered by due date, and rating a card updates its FSRS state and emits CardReviewed" gets you exactly what you want.
3. Architecture and data model. Split sections 5 to 7 of your plan into docs/architecture.md and docs/data-model.md, so Claude Code can load just what it needs.
4. Coding conventions. Folder structure for each layer (route, controller, service, repository), error handling pattern, API response format, validation with Zod, logging, naming, and "no any types." Without this, every session invents its own style.
5. Testing strategy and Definition of Done. What gets unit, integration, and end-to-end tests, where test files live, and a checklist such as "typecheck passes, tests pass, no lint errors, spec's acceptance criteria all met." Claude Code works much better when "done" is verifiable.
6. README and .env.example. Setup steps and every environment variable, with placeholder values only.
Tier 2: Write each just before the phase that needs it
Gamification rules spec (before Phase 2): exact XP, streak, quest, and mastery rules, plus tricky edge cases like timezones, midnight boundaries, and streak freezes. Pure logic like this is perfect for test-first development.
UI/UX docs (before Phase 1): a small design system (colors, typography, spacing, dark mode, core components), a list of screens, and rough wireframes. Without these, Claude Code produces generic-looking UI. You can sketch in Excalidraw and give Claude Code the screenshots.
API contract (before Phase 1): shared Zod schemas in packages/shared as the single source of truth, or an OpenAPI file.
AI feature specs (before Phase 4): for each AI feature, its purpose, input and output schema, prompt file location, eval cases, what happens on failure, and which model it uses.
Security and privacy doc (before Phase 4 and Phase 9): auth flow, how user API keys are encrypted, and a short threat list.
ADRs and build journal: already in your plan; keep them going.
Writing specs just in time keeps them accurate. If you write everything upfront, half of it will be stale by Month 5.
Claude Code setup (the .claude/ folder)
Path-scoped rules in .claude/rules/ for frontend-only or API-only conventions.
Hooks for things that must always happen. Claude treats CLAUDE.md and memory as context, not enforced configuration, so use hooks for anything non-negotiable, such as auto-formatting after edits or blocking edits to applied migrations.
Custom skills or commands for repeated workflows, such as /new-feature (read the spec, plan, write tests, implement) or /adr (draft a decision record).
Subagents for focused roles, such as a code reviewer or security reviewer.
Workflow habits: start each feature in plan mode and review the plan before any code is written, work one small task per session, ask for tests first, and commit often. You can also run /init to generate a starter CLAUDE.md from your codebase, then refine it with instructions Claude wouldn't discover on its own.
The most important part: decide what you write yourself
This project exists to make you a better engineer and give you interview stories. If Claude Code writes everything, you'll have a great app and nothing to say when an interviewer asks "how did you implement the rate limiter?"
So split the work:
Let Claude Code handle: project setup, config, CRUD endpoints, UI components, boilerplate tests, deployment scripts.
Write yourself, or design it and review every line: the XP and mastery engine, FSRS integration, rate limiter, AI provider adapter with fallbacks, RAG pipeline, and the SQL analytics queries.
You can even add a "learning mode" section to CLAUDE.md that lists those areas and tells Claude to explain approaches, give hints, and review your code there instead of writing it. A simple rule to follow: if you can't explain a piece of code in an interview, you don't really own it yet.
Would you like me to create the Tier 1 starter pack (CLAUDE.md with a learning-mode section, conventions, Definition of Done, and the Phase 1 spec) as files you can drop into your repo?

