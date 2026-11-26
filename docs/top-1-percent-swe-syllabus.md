# Top 1% Software Engineer Syllabus

**For:** A MERN developer with ~4 years of experience
**Goal:** Become genuinely job-ready for top-tier product companies (FAANG/MAANG, top AI companies, high-paying startups) and a strong engineer in the AI era.

---

## How to Use This Syllabus

**An honest note first.** No syllabus is truly bulletproof. Interviews involve some luck, and the bar shifts over time. But this covers essentially everything top companies test, plus the skills that make you strong on the job after you get in.

**What top companies actually evaluate:**

| Signal                     | Where it's tested              | Module |
| -------------------------- | ------------------------------ | ------ |
| Problem solving            | DSA coding rounds              | 2      |
| Designing at scale         | System design round            | 1, 3   |
| Code quality and structure | LLD / machine coding           | 4      |
| Depth in your domain       | Domain / tech deep-dive rounds | 5, 6   |
| Modern relevance           | AI-focused roles and projects  | 7      |
| Ownership and maturity     | Behavioral round               | 8      |
| Communication              | Every round                    | 8      |

**How to work through it:**

- Don't do the modules one after another. Run 2 or 3 in parallel (see the Roadmap section). DSA should run continuously throughout.
- Topics marked **[Core]** are must-know. Topics marked **[Adv]** are what move you from "passed" to "strong hire" or senior level.
- Every module ends with a **"Done when"** test. Don't move on to maintenance mode for a module until you pass it honestly.

---

## Module 1: CS Fundamentals

These are what separate engineers who understand systems from those who only know frameworks. They also power your system design answers.

### 1.1 Operating Systems

- [Core] Processes vs threads, context switching, CPU scheduling basics
- [Core] Concurrency: race conditions, mutexes, semaphores, deadlocks and how to prevent them
- [Core] Memory: stack vs heap, virtual memory, paging, garbage collection basics
- [Core] Blocking vs non-blocking I/O, async I/O, and how epoll/kqueue enable Node's model
- [Adv] File systems, page cache, system calls

### 1.2 Networking

- [Core] TCP/IP model, TCP vs UDP, the TCP handshake
- [Core] HTTP/1.1 vs HTTP/2 vs HTTP/3, status codes, headers, caching headers
- [Core] HTTPS and the TLS handshake, certificates
- [Core] DNS resolution step by step
- [Core] WebSockets vs Server-Sent Events vs long polling
- [Core] CORS, cookies, same-origin policy
- [Core] "What happens when you type a URL and press Enter", end to end
- [Adv] Proxies, reverse proxies, CDNs at the network level, TCP congestion control basics

### 1.3 Database Internals

- [Core] SQL fluency: joins, GROUP BY, subqueries, window functions, CTEs (learn PostgreSQL properly, not just MongoDB)
- [Core] Indexes: B-trees, composite and covering indexes, when an index doesn't help
- [Core] Transactions and ACID, isolation levels and their anomalies (dirty reads, phantom reads, etc.)
- [Core] Normalization vs denormalization
- [Adv] B-trees vs LSM trees, write-ahead logs, MVCC vs locking
- [Adv] Query planners and reading EXPLAIN output

### 1.4 Distributed Systems Basics

- [Core] CAP theorem and PACELC, consistency models (strong, eventual, read-your-writes)
- [Core] Replication and partitioning concepts
- [Core] Idempotency, retries, and why "exactly-once" delivery is hard
- [Adv] Consensus (Raft at a conceptual level), clocks and ordering, leader election

### 1.5 Computer Architecture (light)

- [Core] "Latency numbers every programmer should know"
- [Adv] CPU caches and memory locality and why they affect performance

**Done when:** You can explain end to end what happens when you open a website; explain why an index speeds up a query and when it won't; and explain how a single-threaded Node server handles 10,000 concurrent connections.

---

## Module 2: Data Structures & Algorithms

This is the main filter at top companies. Run it continuously, 1 to 2 problems a day.

**Language:** Python, Java, or C++ is easiest in interviews. JavaScript or TypeScript is acceptable, but you must be able to write your own min-heap quickly.

### 2.1 Foundations

- [Core] Big-O time and space complexity, amortized analysis
- [Core] Reading constraints to infer the target complexity (for example, n ≤ 10^5 usually means O(n log n) or better)

### 2.2 Topics in Learning Order

1. [Core] Arrays and hashing
2. [Core] Two pointers
3. [Core] Sliding window (fixed and variable)
4. [Core] Prefix sums
5. [Core] Stacks and monotonic stacks
6. [Core] Binary search, including rotated arrays and "binary search on the answer"
7. [Core] Linked lists: reversal, fast/slow pointers, merging
8. [Core] Recursion and backtracking: subsets, permutations, combinations, N-Queens
9. [Core] Trees: DFS/BFS traversals, BST operations, lowest common ancestor, diameter, serialization
10. [Core] Heaps and priority queues: top-k, merge k sorted lists, two-heap median
11. [Core] Intervals: merge, insert, meeting rooms
12. [Core] Greedy algorithms
13. [Core] Graphs: BFS/DFS, grid problems, connected components, cycle detection, topological sort, Union-Find, Dijkstra
14. [Core] Dynamic programming: 1D, 2D/grid, 0/1 and unbounded knapsack, LIS/LCS, edit distance, stock problems (state machine)
15. [Core] Tries
16. [Core] Bit manipulation
17. [Core] Design problems: LRU cache, LFU cache, min stack, data stream problems
18. [Adv] Interval DP, DP on trees, bitmask DP
19. [Adv] Bellman-Ford, MST (Prim's and Kruskal's), strongly connected components
20. [Adv] Segment trees and Fenwick trees, string algorithms (KMP, rolling hash)

### 2.3 Practice Method

- Learn each topic by pattern, then solve problems in that pattern. Don't solve randomly.
- Use a 20 to 30 minute "stuck rule": if you're stuck, study the solution, then re-solve it yourself 2 to 3 days later.
- Track every problem in a spreadsheet: pattern, date, solved alone or not, re-solve date.
- Practice explaining out loud, writing clean code with good names, and testing edge cases yourself.
- From the midpoint onward, do LeetCode weekly contests for timed pressure.

### 2.4 Milestones

- NeetCode 150 completed
- 250 to 350 total problems, including about 50 hards
- Weak patterns re-solved until they feel easy

**Done when:** You can solve an unseen medium in 20 to 25 minutes with an optimal solution while explaining your thinking, identify the pattern of a new problem within about 5 minutes, and make real progress on hards.

---

## Module 3: High-Level System Design

This round usually decides your level (mid vs senior), which strongly affects your pay.

### 3.1 Building Blocks

- [Core] Load balancers (L4 vs L7, balancing algorithms), reverse proxies, API gateways
- [Core] Caching: cache-aside, write-through, write-back, eviction policies, invalidation, Redis
- [Core] CDNs
- [Core] Database types: relational, key-value, document, wide-column, graph, and when to use each
- [Core] Replication: leader-follower, multi-leader, leaderless
- [Core] Sharding: hash vs range partitioning, consistent hashing, hot keys
- [Core] Message queues and event streams: Kafka, RabbitMQ, SQS, pub/sub
- [Core] Object storage (S3) and blob handling
- [Core] Search with Elasticsearch and inverted indexes
- [Core] Rate limiting algorithms: token bucket, leaky bucket, sliding window
- [Adv] Unique ID generation (Snowflake), Bloom filters, geohashing and quadtrees

### 3.2 Concepts and Trade-offs

- [Core] Vertical vs horizontal scaling, stateless services
- [Core] Availability, SLAs, SLOs, "nines"
- [Core] Latency vs throughput
- [Core] Back-of-the-envelope estimation (QPS, storage, bandwidth)
- [Core] API design: REST, GraphQL, gRPC, pagination, versioning, idempotency keys
- [Core] Authentication and authorization: sessions, JWT, OAuth 2.0
- [Core] Retries with exponential backoff, timeouts, circuit breakers
- [Core] Monolith vs microservices, and when each is right
- [Adv] Distributed transactions: two-phase commit, sagas
- [Adv] Event-driven architecture, CQRS, event sourcing

### 3.3 Interview Framework (use it every time)

1. Clarify functional and non-functional requirements
2. Estimate scale
3. Define the API
4. Design the data model
5. Draw the high-level architecture
6. Deep dive into 2 or 3 critical components
7. Discuss bottlenecks, failure modes, and trade-offs

### 3.4 Practice Problems

1. URL shortener
2. Rate limiter
3. Distributed key-value store
4. Unique ID generator
5. Notification system
6. Chat application (WhatsApp)
7. News feed (Facebook/Twitter)
8. Photo sharing (Instagram)
9. Video streaming (YouTube/Netflix)
10. File storage and sync (Google Drive/Dropbox)
11. Ride sharing (Uber)
12. Search autocomplete / typeahead
13. Web crawler
14. Ticket booking (BookMyShow/Ticketmaster)
15. Payment system
16. Distributed job scheduler
17. Real-time leaderboard
18. Collaborative editor (Google Docs)
19. Metrics and monitoring system
20. Ad click aggregation

### 3.5 Frontend System Design (your full-stack edge)

- [Core] Rendering strategies: CSR, SSR, SSG, ISR, streaming
- [Core] State management architecture, client-side caching, data fetching
- [Core] Performance budgets and Core Web Vitals
- [Core] Practice: autocomplete, infinite-scroll feed, image carousel, chat UI, design system
- [Adv] Offline support, real-time collaboration, micro-frontends

**Done when:** You can drive a 45-minute design without prompting, back every choice with trade-offs, do quick estimations, and go deep on any component the interviewer picks.

---

## Module 4: Low-Level Design, OOP & Clean Code

Common at Amazon, Microsoft, Uber, and many Indian product companies, often as a "machine coding" round.

### 4.1 Principles

- [Core] The four OOP pillars, composition over inheritance
- [Core] SOLID, DRY, KISS, YAGNI
- [Core] Basic UML class diagrams

### 4.2 Design Patterns

- [Core] Creational: Factory, Builder, Singleton
- [Core] Structural: Adapter, Decorator, Facade, Proxy
- [Core] Behavioral: Strategy, Observer, Command, State, Chain of Responsibility

### 4.3 Practice Problems

1. Parking lot
2. Elevator system
3. Movie ticket booking (BookMyShow)
4. Expense sharing (Splitwise)
5. LRU cache (with thread safety)
6. Vending machine
7. Snake and ladder or chess
8. Library management system
9. Logger / logging framework
10. Pub-sub system
11. In-memory file system
12. Rate limiter (LLD version)

### 4.4 Clean Code

- [Core] Naming, small functions, error handling, writing testable code
- [Core] Refactoring techniques and code smells
- [Adv] Thread-safe designs and concurrency in LLD

**Done when:** You can design and code a working, extensible solution to an LLD problem in 60 to 90 minutes in a typed language (TypeScript or Java), and explain how it would handle new requirements.

---

## Module 5: Deep Stack Mastery (Your MERN Edge)

Your 4 years of MERN experience is an asset. Turn it from "can build with it" into "understands it under the hood".

### 5.1 JavaScript

- [Core] Execution context, hoisting, scope chain, closures
- [Core] `this` binding rules, prototypes and prototypal inheritance
- [Core] The event loop: call stack, microtasks vs macrotasks
- [Core] Promises, async/await, error handling in async code
- [Core] ES modules vs CommonJS
- [Adv] Generators and iterators, memory leaks and garbage collection, WeakMap/WeakRef

**Write these from scratch:** debounce, throttle, `Promise.all` / `allSettled` / `race` / `any`, `bind` / `call` / `apply`, deep clone, array flatten, curry, memoize, an EventEmitter, and `map` / `filter` / `reduce` polyfills.

### 5.2 TypeScript

- [Core] Generics, utility types, type narrowing, discriminated unions
- [Adv] Conditional types, mapped types, `infer`

### 5.3 Node.js

- [Core] Event loop phases, libuv and the thread pool
- [Core] Streams and backpressure, buffers
- [Core] Error handling patterns, graceful shutdown
- [Core] Security: OWASP Top 10 applied to Node APIs, input validation
- [Adv] Cluster mode and worker threads, profiling CPU and memory, finding memory leaks

### 5.4 React

- [Core] Reconciliation and how rendering actually works (when and why components re-render)
- [Core] Hooks in depth: stale closures, `useEffect` pitfalls, custom hooks
- [Core] Memoization (`memo`, `useMemo`, `useCallback`) and when it's worth it
- [Core] State management: Context, Redux Toolkit or Zustand, TanStack Query for server state
- [Core] Accessibility basics
- [Adv] Fiber architecture, concurrent features, Suspense
- [Adv] Server Components and the Next.js App Router

### 5.5 Browser and Web Performance

- [Core] Critical rendering path, reflow and repaint
- [Core] Core Web Vitals (LCP, INP, CLS) and how to improve them
- [Core] Code splitting, lazy loading, bundle analysis, caching strategies
- [Adv] Service workers, web workers

### 5.6 MongoDB

- [Core] Schema design: embedding vs referencing, common schema patterns
- [Core] Indexing strategies and reading `explain()` output
- [Core] Aggregation pipeline
- [Adv] Transactions, replica sets, sharding

**Done when:** You can explain how every layer of your stack works internally, and confidently debug a slow page, a slow API, or a memory leak in production.

---

## Module 6: Engineering Craft

These are the skills that make you trusted with production systems, and they come up in deep-dive and behavioral rounds.

- [Core] **Git in depth:** interactive rebase, bisect, resolving complex conflicts
- [Core] **Testing:** unit, integration, and end-to-end (Jest/Vitest, Playwright), the test pyramid, mocking strategy
- [Core] **Cloud (AWS or GCP):** compute (EC2, Lambda), storage (S3), databases (RDS, DynamoDB), queues (SQS), IAM, VPC basics
- [Core] **Containers:** Docker in depth, Kubernetes fundamentals
- [Core] **CI/CD:** GitHub Actions, deployment strategies (blue-green, canary, feature flags)
- [Core] **Observability:** structured logging, metrics, distributed tracing (OpenTelemetry), alerts, SLOs
- [Core] **Security:** authentication and authorization, secrets management, hashing vs encryption, encryption at rest and in transit
- [Core] **Linux and shell** fluency
- [Core] **Writing:** design docs/RFCs, clear PR descriptions, incident postmortems
- [Adv] Infrastructure as code (Terraform)
- [Adv] Incident response and on-call practices

**Done when:** You can take a service from code to a tested, monitored, secure production deployment on your own.

---

## Module 7: AI Engineering

This is your biggest opportunity right now. Full-stack developers who can ship real AI products are in high demand.

### 7.1 Foundations

- [Core] How LLMs work at a high level: tokens, context windows, temperature, transformers, embeddings
- [Adv] ML fundamentals (supervised learning, loss, training vs inference)

### 7.2 Building With LLMs

- [Core] Calling model APIs (Claude, OpenAI, Gemini) from Node: streaming, tool/function calling, structured outputs, vision inputs
- [Core] Prompt engineering and context engineering
- [Core] Retrieval-Augmented Generation (RAG): chunking, embeddings, vector databases (MongoDB Atlas Vector Search, pgvector), hybrid search, reranking
- [Core] Agents: agent loops, tool use, Model Context Protocol (MCP), multi-step workflows, guardrails
- [Adv] Fine-tuning basics and when it's worth it vs RAG

### 7.3 Production AI

- [Core] Evaluation: building eval datasets, LLM-as-judge, regression testing for prompts
- [Core] Cost and latency optimization, caching, rate limits
- [Core] Hallucination mitigation, prompt injection and AI security
- [Core] LLM observability and tracing
- [Adv] AI system design ("design ChatGPT", "design a RAG system for 10M documents")

### 7.4 Working With AI Coding Tools

- [Core] Use tools like Claude Code and Cursor daily to move faster
- [Core] Review AI-generated code critically: correctness, security, performance
- [Core] **Rule:** while learning (especially DSA), solve problems yourself first and use AI only to review afterward

### 7.5 Projects (build 2 to 3, production-grade)

1. **RAG assistant:** chat over a large document set, with citations, auth, evals, and cost tracking
2. **AI agent:** automates a real multi-step workflow using tools/MCP, with guardrails and logging
3. **AI feature in a full product:** a complete MERN/Next.js app where AI is one well-integrated part

**Done when:** You've shipped at least one AI feature end to end with evals, monitoring, and cost controls, and can explain its design trade-offs in an interview.

---

## Module 8: Behavioral, Communication & Interview Execution

Strong candidates fail here more often than you'd expect.

### 8.1 Story Bank

Prepare 10 to 12 stories in **STAR format** (Situation, Task, Action, Result), each with numbers where possible:

1. Your highest-impact project
2. A conflict with a teammate
3. A disagreement with your manager or a senior engineer
4. A failure and what you learned
5. Working through ambiguity
6. Ownership beyond your role
7. A tight deadline
8. Mentoring or helping someone grow
9. Prioritizing competing demands
10. A difficult technical decision and its trade-offs
11. Learning something new quickly
12. Going above and beyond for a user or customer

### 8.2 Company Frameworks

- Amazon: the 16 Leadership Principles (map each story to 2 or 3 principles)
- Google: "Googleyness", collaboration, and handling ambiguity
- Meta: impact, moving fast, and direct communication

### 8.3 Communication in Technical Rounds

- Always clarify the problem before coding
- Think out loud, state trade-offs, and say when you're making an assumption
- Test your own code before the interviewer asks

### 8.4 Interview Execution

- **Resume:** one page, impact-focused bullets ("Did X, which improved Y by Z%"), with metrics
- **Mock interviews:** at least 10 to 15 across DSA, system design, and behavioral (Pramp, interviewing.io, or peers)
- **Referrals:** reach out on LinkedIn; referrals greatly improve shortlisting
- **Warm-ups:** interview at companies you care less about first
- **Negotiation:** research compensation by level on levels.fyi before you get an offer
- **Visibility (bonus):** clean GitHub, technical blog posts, open-source contributions

---

## Roadmap

Assumes you're working full-time and can give about **12 to 15 hours a week**. With more time, you can compress this to 6 to 8 months.

### Phase 1: Foundations (Months 1 to 3)

- DSA topics 1 to 9
- JavaScript and Node.js deep dive (Module 5.1 to 5.3)
- OS and networking (Module 1.1, 1.2)
- Start AI fundamentals and the first AI project

### Phase 2: Building Depth (Months 4 to 6)

- DSA topics 10 to 17
- System design building blocks and the first 8 practice problems
- Database internals (Module 1.3) and MongoDB/Postgres depth
- Start LLD principles and patterns
- Ship AI project 1

### Phase 3: Advanced and Breadth (Months 7 to 9)

- DSA advanced topics, hards, and weekly contests
- Remaining system design problems, plus frontend system design
- LLD practice problems
- Cloud, Docker, CI/CD, and observability (Module 6)
- AI project 2 with RAG or agents, plus evals

### Phase 4: Interview Mode (Months 10 to 12)

- Mock interviews every week
- Behavioral story bank finalized
- Company-tagged LeetCode questions for your targets
- Resume polished, referrals requested, applications sent
- Everything else in maintenance mode (light daily revision)

### Weekly Rhythm

| Day        | Focus                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------- |
| Mon to Fri | 1 hour DSA + 45 to 60 minutes rotating between fundamentals, system design, and stack depth |
| Saturday   | 3 to 4 hours of project building                                                            |
| Sunday     | 2 hours of system design or LLD practice + revision of the week's DSA                       |

---

## Resources

### DSA

- NeetCode 150 and roadmap (neetcode.io)
- Striver's A2Z DSA Sheet (takeuforward.org)
- LeetCode (practice, contests, and company-tagged lists)
- Abdul Bari's algorithm videos (YouTube) for theory

### CS Fundamentals

- _Operating Systems: Three Easy Pieces_ (free online)
- _Computer Networking: A Top-Down Approach_ by Kurose and Ross
- _High Performance Browser Networking_ by Ilya Grigorik (free online)
- CMU Database Systems course by Andy Pavlo (YouTube)

### System Design

- _Designing Data-Intensive Applications_ by Martin Kleppmann (the most important book on this list)
- _System Design Interview_, Vol 1 and 2, by Alex Xu
- System Design Primer (GitHub)
- ByteByteGo and Hello Interview
- Engineering blogs: Netflix, Uber, Discord, Stripe, Cloudflare

### LLD and Clean Code

- _Head First Design Patterns_
- refactoring.guru
- _Refactoring_ by Martin Fowler

### JavaScript, React, Node

- _You Don't Know JS Yet_ by Kyle Simpson
- javascript.info
- react.dev (official docs)
- _Node.js Design Patterns_ by Mario Casciaro and Luciano Mammino
- GreatFrontEnd and BFE.dev for frontend interview practice

### AI Engineering

- Official developer docs and courses from Anthropic and OpenAI
- DeepLearning.AI short courses
- Andrej Karpathy's "Neural Networks: Zero to Hero" (YouTube)
- _AI Engineering_ by Chip Huyen

### Interviews and Career

- _Cracking the Coding Interview_ by Gayle Laakmann McDowell
- Pramp and interviewing.io for mock interviews
- levels.fyi for leveling and compensation data

---

## Final Readiness Checklist

You're ready to interview at top companies when you can honestly tick all of these:

- [ ] 250+ DSA problems solved by pattern, with weak ones re-solved
- [ ] Can solve an unseen medium in about 25 minutes while explaining clearly
- [ ] 15+ system design problems practiced out loud, with estimations and trade-offs
- [ ] 8+ LLD problems designed and coded end to end
- [ ] Can explain the event loop, React rendering, database indexes, TLS, and caching without notes
- [ ] 2 to 3 production-grade projects deployed, at least one involving AI
- [ ] 10 to 12 STAR stories with measurable results
- [ ] 10+ mock interviews completed, with feedback applied
- [ ] One-page, impact-focused resume reviewed by someone else
- [ ] Referrals lined up for your target companies

**Remember:** consistency beats intensity. One focused hour every day for a year will take you further than any crash course.
