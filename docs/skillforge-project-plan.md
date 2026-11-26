# SkillForge: Project Plan

**Working name:** SkillForge (rename it to whatever you like)
**One-liner:** A gamified, AI-powered learning platform that turns the Top 1% Software Engineer Syllabus into a daily practice system, built on spaced repetition, active recall, and interview simulation.
**Primary user:** You. **Secondary users:** Other developers preparing for top-company interviews (from Month 9).
**Time budget:** Weekends only, about 4 to 5 hours per week (roughly 200 hours over 12 months). Weekdays stay reserved for studying.

---

## 1. Vision and Goals

### Three goals, in priority order
1. **Learning tool:** Become your single daily study hub and measurably improve how much you remember.
2. **Learning by building:** Every feature makes you practice a syllabus module (SQL, system design, LLD, AI engineering, DevOps).
3. **Portfolio project:** Show full-stack, system design, and AI engineering depth that holds up in a senior-level interview.

### Non-goals (what we deliberately won't build)
- **A LeetCode clone.** No large problem bank with copied problem statements. Store links plus your own short summaries.
- **A social network.** Social features come late and stay small (friend groups only).
- **A native mobile app.** A Progressive Web App (PWA) is enough for reviewing cards on your phone.
- **Support for every programming language at launch.** JavaScript/TypeScript first, others later.

### Core principles
- **Reward learning, not activity.** XP comes from correct recall and solving without help, never from clicks or time spent.
- **Use it daily.** Every phase must end with something you actually use the next day.
- **Depth over breadth.** Five deep features beat thirty shallow ones.
- **Study comes first.** If the project ever eats into study time, cut project scope, not study.
- **Build the system design problems you study.** The app naturally contains a rate limiter, notification system, job scheduler, leaderboard, and search autocomplete. Build them for real.

---

## 2. Design Review: Key Decisions

These are the decisions I'd make after reviewing the plan, and why. Each one is also an interview talking point.

| Area | Decision | Why |
|---|---|---|
| Main database | **PostgreSQL + pgvector** | Forces you to practice SQL (Module 1.3). One database handles both relational data and vector search, so no separate vector DB to manage. You already know MongoDB, so this adds a new skill. |
| Frontend | **Next.js (App Router) + TypeScript** | Practice Server Components and modern React (Module 5.4). |
| Backend | **Separate Node.js API (Express or Fastify) in TypeScript, layered architecture** | Node depth (Module 5.3), clean LLD (Module 4), and a clear "independent scaling" story. |
| Cache, queues, rate limits | **Redis + BullMQ** | Core system design building blocks (Module 3.1). |
| Spaced repetition | **FSRS algorithm via the `ts-fsrs` library** | Modern, proven scheduler (the one Anki uses). Better than older SM-2. |
| XP system | **Append-only event ledger** | Auditable, easy to recompute, and a real example of event sourcing (Module 3.2). |
| AI | **Provider adapter with fallback chain** | Free tiers change often. Practices the Strategy and Adapter patterns (Module 4) and retries/circuit breakers (Module 3.2). |
| Code execution | **Sandboxed browser Web Worker for JS/TS first; self-hosted Judge0 later** | Safe and free. Teaches workers and sandboxing. |
| Problem content | **Links plus your own summaries only** | Avoids copying copyrighted problem statements. |
| Skill tree | **Soft locks** (locked topics can still be opened) | Keeps structure without blocking you when you need flexibility. |
| Leaderboards | **Later, friend groups only** | Public leaderboards often hurt motivation. |
| Mobile | **PWA** | Review cards on your commute without building a second app. |
| Weekday load | **"Workday mode" for daily quests** | Lighter quests Monday to Friday so the app fits around a full-time job. |

---

## 3. Syllabus Alignment Matrix

Every feature maps to syllabus modules, and many mirror the system design problems you'll practice.

| Feature | Syllabus modules practiced | System design problem it mirrors |
|---|---|---|
| GitHub login + cookie sessions | 1.2 (cookies, CORS), 3.2 (auth), 6 (security) | — |
| Syllabus and topic tracker | 1.3 (schema design, SQL) | — |
| FSRS review queue | 2 (algorithms), 1.3 (indexes on due dates) | Distributed job scheduler (lite) |
| XP ledger and streaks | 3.2 (event sourcing), 1.3 (transactions) | — |
| Daily reminders and weekly reports | 6 (background jobs) | Notification system |
| Per-user AI quotas | 3.1 (rate limiting), Redis | Rate limiter |
| Search over topics, problems, notes | 1.3 (indexes, trigram search) | Search autocomplete |
| Friends leaderboard (later) | Redis sorted sets | Real-time leaderboard |
| Code runner | 1.1 (processes/threads), 5.5 (web workers), 6 (sandboxing) | — |
| Streaming AI responses | 1.2 (Server-Sent Events) | Chat system (lite) |
| "Ask my notes" (RAG) | 7.2 (RAG), 3.1 (search, inverted index) | Search system |
| AI provider adapter | 4 (Strategy/Adapter), 3.2 (retries, circuit breaker) | — |
| Analytics and weakness detector | 1.3 (window functions, CTEs) | Metrics system (lite) |
| Observability | 6 (logs, metrics, tracing) | Monitoring system |
| Load testing and caching | 3 (caching), 5.3 (profiling) | — |
| Coach agent and MCP server | 7.2 (agents, tool use, MCP) | — |

---

## 4. Feature Specification

### 4.1 Learning Core
- **Syllabus engine:** Modules → topics → subtopics, each tagged Core or Adv, with prerequisites and each module's "Done when" checks. Seeded from the syllabus Markdown file by a parser script you write (with unit tests).
- **Topic pages:** Status (not started, learning, done, needs revision), Markdown notes, and the module's "Done when" checklist.
- **Problem log:** Link, your own one-line summary, patterns, difficulty, solved alone or not, hints used, time taken, and your code.
- **Study session timer:** Logs time against topics automatically.
- **Dashboard:** Progress per module, problems by pattern, hours this week, today's queue.

### 4.2 Memory Engine
- **Card types:**
  - Concept Q&A ("What is consistent hashing and why use it?")
  - Pattern recognition (short problem summary → which pattern?)
  - Complexity ("Time complexity of building a heap from n elements?")
  - Predict the output (JavaScript event loop and closure snippets)
  - Cloze deletions (fill in the blank)
- **FSRS scheduling** with Again / Hard / Good / Easy ratings and keyboard shortcuts for fast reviews.
- **Problems as re-solve items:** Solved problems re-enter the queue on a spaced schedule so you re-solve them from scratch.
- **Daily cap:** For example, at most 30 cards and 2 re-solves on workdays, so the queue never becomes overwhelming after work.

### 4.3 Gamification

**XP rules** (learning-based only):

| Action | XP |
|---|---|
| Card rated Good or Easy | 2 |
| Card rated Hard | 1 |
| Card rated Again | 0 (still counts toward quests) |
| Problem solved: Easy / Medium / Hard | 10 / 25 / 50 |
| Hint multiplier | No hints ×1.0, hint level 1 ×0.8, level 2 ×0.6, level 3 ×0.4, solution viewed ×0.1 |
| Re-solve without hints after 7+ days | +50% bonus |
| "Explain it" scored 7/10 or higher by AI | 15 |
| All daily quests completed | 30 |
| Module "Done when" check passed | 40 |
| Boss battle cleared | 200 + badge |
| Time spent, marking topics done, logging in | 0 |

**Levels:** Simple curve, such as total XP needed for level n = 50 × n². Tune it after a month of real use.

**Topic mastery (0 to 5), separate from XP.** A starting formula to tune later:
- 50% from the average current recall probability (FSRS "retrievability") of the topic's cards
- 30% from recent problems in that topic solved without hints (recent attempts weighted more)
- 20% from "Done when" checks passed

Because FSRS retrievability drops over time, mastery **fades naturally** when you stop reviewing. That's the core memorization mechanic.

**Skill tree:** The syllabus shown as a visual graph (using React Flow). Topics unlock when their prerequisites reach mastery 2+. Locks are soft, so you can still open anything. Fading topics are visually highlighted.

**Streaks:** A day counts if you complete at least one daily quest. You earn 1 streak freeze for every 7-day streak, can hold up to 2, and they're applied automatically.

**Daily quests:**
- *Workday mode (Mon to Fri, about 45 to 60 min):* Clear due reviews, solve 1 problem, explain 1 concept.
- *Weekend mode:* Solve 2 problems (at least one medium), do 1 system design or LLD practice, re-solve 2 due problems.

**Boss battles** at the end of each module, for example:
- *Sliding window boss:* 2 unseen mediums in 50 minutes, at most 1 hint.
- *System design boss:* A 45-minute AI interviewer session scoring at least 3/4 on every rubric line.

**Badges:** Tied to real milestones only (first boss cleared, 100 problems without hints, 30-day streak, module mastered).

### 4.4 Practice Panels
- **Code panel:** Monaco editor, test cases, timer, and JS/TS execution in a sandboxed Web Worker with time limits. Self-hosted Judge0 later for Python or Java.
- **Pattern recognition drill:** Rapid-fire problem summaries; pick the pattern in 30 seconds. Track accuracy per pattern.
- **"Explain it" panel (Feynman technique):** Type (later, speak) an explanation of a concept. The AI grades it and points out gaps.
- **System design studio:** Embedded Excalidraw canvas, the interview framework as a checklist, and an AI interviewer.
- **Behavioral studio:** Your STAR story bank, mapped to company principles (like Amazon's Leadership Principles), with AI follow-up questions.
- **Mock mode:** Timed, mixed sessions that simulate a real interview loop.

### 4.5 AI Features
- **Hint ladder:** Never gives the answer first. Level 1 is a nudge, level 2 names the pattern, level 3 outlines the approach, level 4 shows the solution.
- **Code review:** After you solve a problem, checks complexity, missed edge cases, and code clarity.
- **Card and quiz generator:** Creates cards from a topic or from your notes. You approve them before they enter your deck.
- **"Explain it" grader:** Scores explanations against a rubric and lists what's missing.
- **AI interviewer:** System design and behavioral sessions with follow-up questions and rubric scores.
- **"Ask my notes":** RAG over your notes, with citations pointing to the exact note sections.
- **Coach agent:** Uses tools to read your progress, find weak areas, and plan your week. It asks for confirmation before changing anything.
- **MCP server:** Exposes your progress and card creation as tools so you can use your app from other AI assistants.

### 4.6 AI Engineering Standards (apply to every AI feature)
- **Provider adapter and fallback chain:** Gemini, Groq, OpenRouter, and local Ollama behind one interface. Most use the OpenAI-compatible format, so switching is mostly a config change. Automatic fallback when a provider is rate-limited or down.
- **Per-feature model routing:** A small, fast model for grading cards; a stronger model for the interviewer.
- **Structured outputs:** Every AI response that feeds the app is validated with Zod, with a retry on invalid output.
- **Versioned prompts:** Prompts live as files in the repo, and every request logs which prompt version it used.
- **Request logging:** Provider, model, tokens, latency, estimated cost, and success or failure, shown on an internal dashboard.
- **Caching** for repeatable generations, and **per-user quotas** using a Redis token bucket.
- **Evals:** A small "golden" test set for each feature (for example, "does the hint ladder ever reveal the solution at level 1 or 2?"). Run a small sample in CI whenever prompts change.
- **Safety:** Treat notes and user content as data, not instructions (prompt injection defense). Never run AI-generated code on the server.
- **Privacy:** Encrypt users' own API keys at rest (AES-256-GCM) and never log them. Clearly tell users that some free AI tiers may use data for model training, and offer local Ollama for private notes.

---

## 5. Architecture

Moved to [`architecture.md`](architecture.md).

---

## 6. Data Model (PostgreSQL)

Moved to [`data-model.md`](data-model.md).

---

## 7. Key API Endpoints (starting set)

Moved to [`data-model.md`](data-model.md#key-api-endpoints-starting-set).

---

## 8. Phased Roadmap

### 8.1 Alignment With Your 12-Month Study Plan

The project phases are timed so you build each feature right when you're studying the related topic.

| Month | Study focus (from syllabus roadmap) | Project phase | Approx. hours |
|---|---|---|---|
| 1 | DSA topics 1 to 9, JS/Node deep dive, OS and networking | Phase 0 + Phase 1: Setup and MVP tracker | 20 |
| 2 | (continued) | Phase 2: Memory engine and gamification | 16 |
| 3 | (continued) + AI fundamentals | Phase 3: Practice panels | 18 |
| 4 | DSA 10 to 17, system design building blocks | Phase 4: AI foundation | 18 |
| 5 | Database internals, LLD | Phase 5: Skill tree, mastery, SQL analytics | 16 |
| 6 | System design practice problems | Phase 6: Notes and RAG | 18 |
| 7 | DSA advanced, system design, LLD problems | Phase 7: Interview simulators | 18 |
| 8 | Cloud and DevOps | Phase 8: Coach agent and MCP server | 16 |
| 9 | Cloud and DevOps, AI project | Phase 9: Production hardening and launch | 20 |
| 10 to 12 | Interview mode | Phase 10: Maintain and tell the story | ≤ 2 per week |

### 8.2 Phase Details

#### Phase 0: Foundations and Design (Week 1, about 5 hours)
- Write a 2-page design doc: problem, users, goals, non-goals, architecture, data model.
- Set up the monorepo with strict TypeScript, ESLint, and Prettier.
- Docker Compose for Postgres and Redis.
- GitHub Actions CI: lint, typecheck, test.
- Write your first ADR: "PostgreSQL + pgvector over MongoDB."

**Done when:** `docker compose up` runs web, API, and database locally, and CI is green.

#### Phase 1: MVP Tracker (Weeks 2 to 4, about 15 hours)
- GitHub OAuth login with secure, httpOnly cookie sessions.
- Syllabus parser (Markdown → JSON) with unit tests, plus seed script.
- Topic pages with status, Markdown notes, and "Done when" checklists.
- Problem log.
- Basic dashboard: progress per module and problems by pattern.

**Done when:** You log every study session and problem in the app daily.

#### Phase 2: Memory Engine and Gamification (Month 2, about 16 hours)
- Card CRUD with all card types, FSRS scheduling using `ts-fsrs`, and a fast keyboard-driven review screen.
- Solved problems enter the queue as re-solve items.
- XP event ledger with the rules from section 4.3, plus levels.
- Streaks with freezes, daily quests with workday and weekend modes.
- PWA install so you can review on your phone.

**Done when:** The daily queue drives all your revision, and you've held a 14-day streak.

#### Phase 3: Practice Panels (Month 3, about 18 hours)
- Code panel: Monaco editor, test cases, timer, sandboxed Web Worker runner with time limits.
- Pattern recognition drill with your own summaries for about 100 problems.
- Study session timer linked to topics.
- Playwright end-to-end tests for the review and solve flows.

**Done when:** You solve your daily DSA problems inside the app.

#### Phase 4: AI Foundation (Month 4, about 18 hours)
- `packages/ai`: provider adapter for Gemini, Groq, OpenRouter, and Ollama; fallback chain with retries, exponential backoff, and a circuit breaker; per-feature model routing.
- Zod-validated structured outputs, versioned prompts, and request logging.
- SSE streaming endpoint.
- Redis token-bucket rate limiter per user.
- Features: hint ladder, code review, card generator.
- Eval suite v1: a hint-leak test and a card quality test.

**Done when:** Your evals show hints never leak solutions at levels 1 and 2, and you can switch AI providers through config alone.

#### Phase 5: Skill Tree, Mastery, and Analytics (Month 5, about 16 hours)
- Mastery calculation with a nightly recompute job (BullMQ).
- Skill tree with React Flow, soft locks, and fading highlights.
- Badges.
- Analytics page written in raw SQL using window functions and CTEs: weekly trends, weakest patterns, retention curve.
- "Explain it" panel with the AI grader.

**Done when:** The dashboard shows which topics are fading, and it matches how you actually feel about them.

#### Phase 6: Notes and RAG (Month 6, about 18 hours)
- Notes editor; split notes into chunks by heading; background embedding jobs; pgvector HNSW index.
- Hybrid search combining Postgres full-text search and vector search (reranking optional).
- "Ask my notes" with citations to note sections, streamed.
- Typeahead search over topics, problems, and notes (trigram index).
- Retrieval evals: measure recall@5 on a set of 30 questions about your own notes.

**Done when:** You trust "Ask my notes" enough to use it before every revision session.

#### Phase 7: Interview Simulators (Month 7, about 18 hours)
- System design studio: Excalidraw canvas, framework checklist, and AI interviewer with follow-ups and rubric scores (requirements, estimation, API, data model, scalability, trade-offs).
- Behavioral studio: STAR story bank, AI follow-up questions, rubric scoring, and mapping to company principles.
- Boss battles for each module.
- Mock history with score trends.

**Done when:** You've completed 5+ full AI mocks, and the scores track your real improvement.

#### Phase 8: Coach Agent and MCP Server (Month 8, about 16 hours)
- Coach agent with tools: `get_progress`, `get_weak_areas`, `schedule_review`, `create_cards`, `plan_week`. It must ask for confirmation before any write action and has a step limit.
- Weekly coach report sent by a scheduled job (email or web push). This is your notification system.
- MCP server exposing progress and card creation as tools.
- Agent evals: success rate on 15 realistic scenarios.

**Done when:** The coach's weekly plan is good enough that you actually follow it.

#### Phase 9: Production Hardening and Launch (Month 9, about 20 hours)
- Observability: structured logs with request IDs, OpenTelemetry traces, error tracking, and dashboards for latency, errors, and AI cost.
- Security review against the OWASP Top 10, encrypted BYOK keys, data export and account deletion.
- Caching, a k6 load test on the review endpoint, bottleneck fixes, and a Lighthouse performance pass.
- Production deployment. Optionally move the API to AWS to practice Module 6.
- Onboarding flow, landing page, and short demo video. Private beta with 10 to 20 developers, then a public launch.

**Done when:** Real users are active, and you have dashboards for latency, errors, and AI cost per user.

#### Phase 10: Maintain and Tell the Story (Months 10 to 12, at most 2 hours per week)
- **Feature freeze.** Bug fixes and small, user-requested improvements only. Your focus now is interviews.
- Write 2 or 3 blog posts or case studies (for example, "How I built a multi-provider LLM layer with fallbacks on free tiers").
- Update your resume with real numbers from the app.
- Optional extras if you have spare time: friends leaderboard (Redis sorted sets) and voice "Explain it" (speech-to-text).

---

## 9. Engineering Standards

- **Code quality:** Strict TypeScript, ESLint, Prettier, and small pull requests even when working alone (practice writing clear PR descriptions).
- **Testing:**
  - Unit tests (Vitest) for XP rules, mastery formula, FSRS integration, the syllabus parser, and the rate limiter
  - Integration tests (Supertest + Testcontainers with a real Postgres)
  - End-to-end tests (Playwright) for login, review, and solve flows
  - AI evals for each AI feature
- **CI/CD:** Lint, typecheck, test, and build on every push. Run a small eval sample when prompts change. Preview deployments for the frontend.
- **Architecture Decision Records:** Write a short ADR for every major decision in `docs/adr/`. These become excellent interview material.
- **Security checklist:** Input validation with Zod, Helmet headers, CSRF protection for cookie sessions, rate limiting, secrets in environment variables (never in the repo), Dependabot for dependency updates.
- **Observability:** Structured logging (pino) with request IDs, OpenTelemetry tracing, error tracking, and alerts on error spikes.
- **Performance budgets:** p95 API latency targets for key endpoints and a Lighthouse score target for main pages.

---

## 10. Hosting (Low Cost)

- **Development:** Everything runs locally in Docker Compose. Use Ollama for unlimited local AI testing.
- **Production (start simple):** Frontend on Vercel; API and worker on a container-friendly platform such as Render, Fly.io, or Railway; Postgres on Neon or Supabase; Redis on Upstash. Many of these have free or cheap tiers, but **check current limits before choosing**, since they change.
- **Optional, Month 9:** Move the API and worker to AWS (ECS Fargate or EC2 with Docker) to get hands-on cloud experience. Set a billing alarm first.
- **AI costs:** Use free tiers during development, enforce per-user quotas, and let beta users bring their own keys.

---

## 11. Metrics to Track (Your Resume Numbers)

Start tracking these from Phase 2. Real numbers make this project credible in interviews.

| Category | Metrics |
|---|---|
| Your learning | Review retention rate, cards reviewed, % of problems solved without hints, mastery trend per module, current and longest streak |
| Product (after launch) | Signups, weekly active users, day-7 and day-30 retention, reviews per user per week |
| Engineering | p95 API latency, error rate, uptime, AI cost per active user per month, eval pass rates, test coverage on core logic |

---

## 12. Launch Plan (Month 9)

- **Build in public from Month 3.** Post progress on LinkedIn every 2 weeks: what you built, a problem you solved, a number you improved. This builds an audience before launch and gets recruiters' attention.
- **Private beta:** 10 to 20 developers (colleagues, friends, LinkedIn connections).
- **Onboarding:** Ask for target companies and weekly available hours, then generate a starting plan.
- **AI access:** A default free provider with a small quota, plus "bring your own key."
- **Landing page, 2-minute demo video, and public changelog.**
- **Feedback loop:** In-app feedback widget and a weekly review of what users actually use.
- **Trust basics:** Privacy policy, data export, and account deletion.

---

## 13. Turning It Into Interview Material

### Resume bullet templates (fill in real numbers)
- Built SkillForge, a gamified, AI-powered learning platform (Next.js, Node.js, PostgreSQL/pgvector, Redis) used by **[N]** developers, with FSRS-based spaced repetition achieving **[X]%** review retention.
- Designed a multi-provider LLM layer with automatic fallback, structured outputs, and an eval suite of **[N]** cases, keeping AI cost under **[$X]** per active user per month.
- Implemented hybrid (full-text + vector) RAG search over user notes, improving recall@5 from **[X]%** to **[Y]%**.
- Moved event processing to BullMQ queues with Redis-based rate limiting, keeping p95 API latency under **[X] ms** in **[N] RPS** load tests.

### STAR stories this project will give you
- **Technical decision:** Choosing PostgreSQL + pgvector over MongoDB plus a separate vector database.
- **Failure and learning:** For example, the hint ladder leaking solutions, and how evals caught and fixed it.
- **Scaling and evolution:** Moving from an in-process event bus to queues, with before-and-after numbers.
- **User-driven change:** A feature you changed or removed because of real user feedback.

### System design talking points
Your app contains working versions of a rate limiter, notification system, job scheduler, search autocomplete, and (optionally) a leaderboard. When an interviewer asks you to design one of these, you can say "I built a version of this" and discuss real trade-offs.

### Keep a build journal
Write a few lines in `docs/journal.md` every weekend: what you built, what broke, how you fixed it, and any numbers. Six months later, this is where your best interview stories will come from.

---

## 14. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Project eats into study time | Weekends only, timeboxed phases, feature freeze from Month 10 |
| Free AI tiers change or disappear | Provider adapter with fallback chain, local Ollama backup |
| AI gives wrong feedback or leaks answers | Evals, rubric-based grading, citations in RAG answers |
| Burnout from working a full-time job | Workday mode, streak freezes, daily caps on reviews |
| Copyright problems | Problem links and your own summaries only, no copied statements |
| User data or key leaks | Encryption at rest, OWASP review, no keys in logs, data export and deletion |
| Few users sign up | Build in public from Month 3, beta with colleagues. Even with few users, the engineering story stands on its own |
| Hosting or AI costs grow | Free tiers, billing alarms, per-user quotas, bring-your-own-key |

---

## 15. Rules of Engagement

1. **Weekdays are for studying.** The project gets weekends only, about 4 to 5 hours.
2. **If a phase runs more than 2 weekends over, cut scope**, never study time.
3. **Every phase ends with something you use daily.** Your own usage decides what's worth building next.
4. **Write it down.** Design doc, ADRs, and build journal. The writing is as valuable for interviews as the code.
5. **Feature freeze from Month 10.** At that point the project's job is done: it has made you better and given you a story to tell.
