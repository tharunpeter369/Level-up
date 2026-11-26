# Testing: Unit, Integration and Testcontainers

## The testing pyramid

```
        ▲  few, slow      End-to-end (Playwright, Phase 3): click through a real browser
       ▲▲▲                Integration: real Postgres, real SQL, real migrations
     ▲▲▲▲▲▲▲  many, fast  Unit: pure logic, no database, no network
```

Most tests should be **unit tests** (milliseconds each). Fewer **integration tests** check the parts that touch real infrastructure, where mocks would lie.

| Kind        | Command         | Needs Docker | Example                                                        |
| ----------- | --------------- | ------------ | -------------------------------------------------------------- |
| Unit        | `pnpm test`     | No           | Zod schemas, XP rules, `/health` via `app.inject()`            |
| Integration | `pnpm test:int` | **Yes**      | Migrations apply to a real Postgres; repositories run real SQL |

File naming tells them apart: `foo.test.ts` is a unit test, `foo.int.test.ts` is an integration test.

## Testing routes without a network: `app.inject()`

Fastify can process a fake request entirely in memory. You get the real routing, validation, handler and serialization, but no port and no HTTP stack, so tests are fast and can't clash over ports.

```ts
const app = await buildApp({ logger: false });
const res = await app.inject({ method: "GET", url: "/health" });
expect(res.statusCode).toBe(200);
expect(res.json()).toMatchObject({ status: "ok" });
```

## Testcontainers: a throwaway database per test run

**The problem:** testing SQL against a mock tests nothing. Testing against your dev database is fragile: leftover data, and tests can wipe your real work.

**Testcontainers** starts a **brand new Postgres in Docker** from inside the test, gives you its connection URL, and deletes it afterwards. Every run starts from a clean, identical database.

```ts
import { PostgreSqlContainer } from "@testcontainers/postgresql";

const container = await new PostgreSqlContainer("pgvector/pgvector:pg18").start();
const url = container.getConnectionUri(); // random free port, new database
// ... run migrations, run queries, assert ...
await container.stop();
```

- It uses the **same image** as `compose.yaml`, so tests match development.
- It picks a **random port**, so it never clashes with your dev database on 5433.
- A helper container called **Ryuk** cleans up leftovers even if a test crashes.
- The first run also downloads the small Ryuk image; after that, startup takes a few seconds. That delay is why these tests live in `test:int`, not `test`.

## Try it yourself

1. Run `pnpm test:int` and watch Docker Desktop → Containers: a new Postgres appears, then disappears.
2. Break the migration on purpose (add `SELECT 1/0;` to the SQL file in a scratch copy) and see the integration test fail. Undo it.

## Check yourself

1. Why should most tests be unit tests?
2. What does `app.inject()` skip compared to a real HTTP request, and what does it still test?
3. Why test SQL against a real Postgres rather than a mock?
4. Why does Testcontainers use a random port?
