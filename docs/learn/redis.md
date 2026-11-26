# Redis

## What is it?

Redis is a **database that keeps everything in memory (RAM)**. Reading from RAM takes about 100 nanoseconds; reading from disk is thousands of times slower. So Redis answers most commands in **well under a millisecond**.

Think of it as a giant, shared, super-fast JavaScript `Map` that lives outside your app, survives app restarts, and many servers can use at once.

**Postgres vs Redis in SkillForge:**

- **Postgres** is the source of truth. Anything you can't afford to lose lives there (users, cards, XP history).
- **Redis** handles speed and coordination: things that are temporary, recomputable, or need to be very fast (caches, rate-limit counters, job queues).

Rule of thumb: **if Redis were wiped, SkillForge should still work**, just slower for a moment.

## How it works

- **Key → value.** Every piece of data has a key, like `ratelimit:user:42`.
- **Values have types**, and that's what makes Redis powerful:

| Type       | Like…          | Example command              | SkillForge use                     |
| ---------- | -------------- | ---------------------------- | ---------------------------------- |
| String     | a variable     | `SET k v`, `GET k`, `INCR k` | Counters, cached JSON              |
| Hash       | an object      | `HSET user:1 name Ana`       | Rate-limit bucket state            |
| List       | an array/queue | `LPUSH`, `RPOP`              | (BullMQ uses these internally)     |
| Set        | a `Set`        | `SADD`, `SISMEMBER`          | Unique items                       |
| Sorted set | a ranked list  | `ZADD`, `ZRANGE`             | **Friends leaderboard** (Phase 10) |
| Stream     | an event log   | `XADD`                       | (BullMQ events)                    |

- **Expiry (TTL):** any key can delete itself after N seconds: `SET k v EX 60`. Perfect for caches and rate-limit windows.
- **Single-threaded command execution:** Redis runs commands one at a time, so each single command is **atomic** (no two clients can interleave inside it). `INCR` is safe even with thousands of clients at once, with no locks needed. For multi-step logic you use transactions or **Lua scripts** (you'll write one for the rate limiter).
- **Persistence:** RAM is lost on restart, so Redis can save to disk. We enabled **AOF** (`--appendonly yes` in `compose.yaml`), which logs every write so data comes back after a restart.

## How SkillForge will use it

| Feature                                                 | Redis feature                                 | Phase | System design topic       |
| ------------------------------------------------------- | --------------------------------------------- | ----- | ------------------------- |
| Per-user AI quotas                                      | Token bucket in a hash + Lua script           | 4     | **Rate limiter**          |
| Background jobs (AI calls, embeddings, nightly mastery) | BullMQ (built on lists, sorted sets, streams) | 4–5   | **Job scheduler / queue** |
| Caching repeat AI generations                           | Strings with TTL                              | 4     | **Caching**               |
| Friends leaderboard                                     | Sorted sets                                   | 10    | **Real-time leaderboard** |

Each of these is a classic system design interview question, and you'll have built a real one.

## Try it yourself

Open a Redis shell: `docker compose exec redis redis-cli`

```
SET greeting "hello"           → OK
GET greeting                   → "hello"
INCR visits                    → 1
INCR visits                    → 2        (atomic counter)
SET temp "bye" EX 10           → expires in 10 seconds
TTL temp                       → seconds remaining
ZADD board 120 ana 95 ben 210 cara      (a leaderboard!)
ZREVRANGE board 0 2 WITHSCORES          → cara, ana, ben (highest first)
KEYS *                         → list keys (fine locally; never in production)
DEL greeting visits board
```

## Common mistakes

- **Treating Redis as the only copy of important data.** Keep the truth in Postgres.
- **Forgetting TTLs** on cache keys, so memory fills up forever.
- **Using `KEYS *` in production.** It blocks Redis while it scans everything; use `SCAN`.
- **Read-then-write races:** `GET` a counter, add 1 in Node, `SET` it back. Two requests can overwrite each other. Use `INCR` or a Lua script instead.

## Check yourself

1. Why is Redis so much faster than Postgres for simple lookups?
2. Why is `INCR` safe with many clients at once?
3. What should happen to SkillForge if Redis loses all its data?
4. Which Redis type would you use for a leaderboard, and why?
