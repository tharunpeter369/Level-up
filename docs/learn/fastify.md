# Fastify

## What is it?

Fastify is a web framework for Node.js, in the same family as **Express**, which you know. You register routes, write handlers, and send JSON back. The differences are what make it a good fit for SkillForge:

|               | Express                           | Fastify                                                                                |
| ------------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| Route handler | `(req, res, next) => res.json(x)` | `async (request, reply) => x` (just **return** the value)                              |
| Async errors  | Need `next(err)` or a wrapper     | A thrown error in an `async` handler is caught automatically                           |
| Validation    | Bring your own (middleware)       | **Built in:** each route declares a schema for body, query, params and response        |
| Response      | Sends whatever you give it        | Can **validate and serialize** the response, so internal fields never leak by accident |
| Extending     | Middleware (`app.use`)            | **Plugins** (`app.register`) with their own scope                                      |
| Logging       | Add morgan/winston yourself       | **pino** built in, with a request ID on every log line                                 |
| Speed         | Fine                              | One of the fastest Node frameworks (precompiled serializers)                           |

## Key ideas

### 1. Routes return values

```ts
app.get("/health", async () => {
  return { status: "ok", uptimeSec: process.uptime() };
});
```

Returning from an `async` handler sends the response. `reply.code(201)` sets the status when needed.

### 2. Schemas on every route

A route declares the shape of what comes in and what goes out. We write those schemas with **Zod** (see [zod.md](zod.md)), connected by `fastify-type-provider-zod`:

```ts
app
  .withTypeProvider<ZodTypeProvider>()
  .get("/health", { schema: { response: { 200: HealthResponseSchema } } }, async () => ({
    status: "ok",
    uptimeSec: process.uptime(),
  }));
```

- **Incoming** (`body`, `querystring`, `params`): invalid data gets a **400** before your handler runs. Inside the handler, `request.body` is fully typed.
- **Outgoing** (`response`): the return value is checked against the schema. TypeScript errors if you return the wrong shape.
- The same schemas can generate **OpenAPI docs** later via `@fastify/swagger` (a `/docs` page for free).

### 3. Plugins and encapsulation

Everything is a plugin: a function that receives the app and adds routes, hooks or helpers.

```ts
export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", ...);
}
// in app.ts
await app.register(healthRoutes);
```

Each plugin gets its own **scope**: hooks and decorators added inside it don't leak to siblings. This is how SkillForge keeps each feature module (`reviews`, `problems`…) self-contained.

### 4. Hooks: the request lifecycle

Instead of one middleware chain, Fastify has named stages you can hook into:

```
request → onRequest → preParsing → preValidation → (validate) → preHandler → handler
        → preSerialization → (serialize) → onSend → onResponse
```

Example: auth will be an `onRequest` hook (Phase 1). `onClose` runs when the server shuts down, which is where we close the database pool.

### 5. Build the app, then listen (testability)

We split the code into two files:

- `app.ts` → `buildApp()` creates and configures Fastify but **doesn't start a server**.
- `server.ts` → calls `buildApp()` and then `app.listen()`.

Tests call `buildApp()` and use **`app.inject()`**, which simulates an HTTP request in memory: no port, no network, very fast.

```ts
const res = await app.inject({ method: "GET", url: "/health" });
expect(res.statusCode).toBe(200);
```

### 6. Logging with pino

`Fastify({ logger: true })` logs every request as **JSON**, one line each, with a `reqId`. JSON is ideal for log tools in production; in development we pipe it through **pino-pretty** to make it readable. Use `request.log.info(...)` inside handlers so the log line carries the request ID (never `console.log`).

### 7. Graceful shutdown

When you press Ctrl+C (or the platform stops the container), the server should stop taking new requests, finish the current ones, close the database pool, then exit. We listen for `SIGINT`/`SIGTERM` and call `app.close()`, which runs every `onClose` hook.

## How SkillForge uses it

```
apps/api/src/
  server.ts            start + graceful shutdown
  app.ts               buildApp(): logger, Zod compilers, register modules
  config.ts            environment variables, validated with Zod
  modules/<feature>/   one plugin per feature (routes → controller → service → repository)
```

## Try it yourself

1. `pnpm dev`, then open `http://localhost:3001/health` in the browser.
2. Watch the terminal: each request logs a line with a `reqId`.
3. Visit `http://localhost:3001/nope`. What status and body does Fastify return by default?
4. Press Ctrl+C and watch the shutdown log lines.

## Common mistakes

- **Mixing `return` and `reply.send()`** in one handler: pick one (we return values).
- **Forgetting `await app.register(...)`** before `listen`, or registering routes after the server started.
- **Using `console.log`**: it has no request ID and bypasses log levels; use `request.log`/`app.log`.
- **Putting business logic in route handlers**: handlers call services (see `docs/conventions.md`).

## Check yourself

1. How does a Fastify handler send a response, compared to Express?
2. What happens when a request body doesn't match the route's schema?
3. Why do we separate `buildApp()` from `listen()`?
4. What is `app.inject()` and why is it faster than a real HTTP request?
5. Why should the server close the database pool on shutdown?
