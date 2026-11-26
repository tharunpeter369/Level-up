# Drizzle ORM and Migrations

## What is an ORM, and what is Drizzle?

An **ORM** (Object-Relational Mapper) lets you work with database tables from code. You know **Mongoose**: you define a schema, get a model, and call `User.find()`. Drizzle plays the same role for SQL databases, with a different philosophy:

|                   | Mongoose (MongoDB)               | Drizzle (Postgres)                                     |
| ----------------- | -------------------------------- | ------------------------------------------------------ |
| Define structure  | `new Schema({ ... })`            | `pgTable("users", { ... })` in TypeScript              |
| Query style       | Its own API (`find`, `populate`) | **Looks like SQL** (`select().from(users).where(...)`) |
| Types             | Partly inferred                  | **Fully inferred** from the table definition           |
| Structure changes | Schema-less DB, no migrations    | **Migrations**: versioned SQL files                    |
| Escape hatch      | Raw Mongo queries                | `` sql`...` `` template for raw SQL                    |

Why Drizzle for this project: it's **thin** (close to real SQL, so you actually learn SQL), fully type-safe, and fast. Heavier ORMs (Prisma, TypeORM) hide the SQL; Drizzle shows it.

## Key pieces

### 1. The driver: `pg`

Drizzle doesn't talk to Postgres itself; a **driver** does. We use **`pg`** (node-postgres), the most widely used one. It gives us a **connection pool**: a set of open connections the app reuses, because opening a new connection per query is slow (~20–50 ms each).

```ts
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new pg.Pool({ connectionString: config.DATABASE_URL });
export const db = drizzle({ client: pool });
```

### 2. Schema in TypeScript (from Phase 1)

```ts
export const problems = pgTable("problems", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  difficulty: text("difficulty").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

And queries are typed from it:

```ts
const hard = await db.select().from(problems).where(eq(problems.difficulty, "hard"));
//    ^? { id: string; title: string; difficulty: string; createdAt: Date }[]
```

### 3. Migrations: git commits for your database

The database structure must change over time (add a table, add a column). A **migration** is a numbered SQL file describing one change:

```
apps/api/drizzle/
  0000_enable_pgvector.sql     CREATE EXTENSION IF NOT EXISTS vector;
  0001_create_problems.sql     CREATE TABLE problems (...);   ← Phase 1
  meta/_journal.json           the ordered list of migrations
```

The workflow:

1. Edit `src/db/schema.ts` (add a table).
2. `pnpm db:generate`: **drizzle-kit** compares your schema to the last snapshot and **writes the SQL** for the difference. Read it before applying!
3. `pnpm db:migrate`: applies new migrations, in order, to the database.

How does it know what's already applied? It keeps a table, `drizzle.__drizzle_migrations`, recording each applied migration's hash. Running `migrate` twice is safe: already-applied files are skipped.

**The golden rule** (also in `CLAUDE.md`): **never edit a migration that was already applied.** Other databases (CI, production, a teammate's laptop) have already run the old version, and they'd never see your edit. Write a new migration instead.

**Custom migrations**: some changes aren't table definitions, like enabling an extension. `drizzle-kit generate --custom` creates an empty SQL file you write yourself. That's our first migration.

### 4. Two tools, two jobs

| Package       | When it runs               | Job                                                                                     |
| ------------- | -------------------------- | --------------------------------------------------------------------------------------- |
| `drizzle-orm` | Inside the app, at runtime | Queries, plus `migrate()` to apply migrations                                           |
| `drizzle-kit` | On your laptop, as a CLI   | Generates migration files from schema changes (also `drizzle-kit studio`, a DB browser) |

We apply migrations with **our own script** (`src/db/migrate.ts`, which calls `drizzle-orm`'s `migrate()`), so the exact same code runs on your laptop, in tests, in CI and in production.

## Try it yourself

1. `pnpm db:migrate`, then `docker compose exec postgres psql -U skillforge -c '\dt drizzle.*'`. Find the migrations table and look inside: `select * from drizzle.__drizzle_migrations;`
2. Run `pnpm db:migrate` again. Nothing new is applied. Why?
3. Read `apps/api/drizzle/0000_enable_pgvector.sql` and `meta/_journal.json`.

## Common mistakes

- **Editing an applied migration** instead of adding a new one.
- **Not reading generated SQL**: renames can be generated as "drop column + add column", which **deletes data**.
- **Creating a new pool per request**: create one pool at startup, close it at shutdown.
- **Forgetting the migrations in production**: the deploy must run `db:migrate` before starting the new code.

## Check yourself

1. How is Drizzle similar to Mongoose, and how is it different?
2. What is a connection pool and why does it matter?
3. What does `pnpm db:generate` do, and what does `pnpm db:migrate` do?
4. How does Drizzle know which migrations were already applied?
5. Why must you never edit an applied migration?
