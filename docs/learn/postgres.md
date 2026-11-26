# PostgreSQL and pgvector

## What is it?

PostgreSQL ("Postgres") is a **relational database**: data lives in **tables** with fixed columns, tables link to each other with **foreign keys**, and you ask questions in **SQL**. It's the source of truth for everything in SkillForge.

You know MongoDB, so here's the mapping:

| MongoDB            | Postgres                                                          |
| ------------------ | ----------------------------------------------------------------- |
| Database           | Database                                                          |
| Collection         | Table                                                             |
| Document           | Row                                                               |
| Field              | Column (with a fixed type)                                        |
| `$lookup`          | `JOIN` (fast, everyday operation)                                 |
| Schema is optional | Schema is enforced by the database                                |
| Embedded documents | Separate tables + foreign keys (or a `jsonb` column when it fits) |

## Why Postgres for SkillForge (ADR 0001)

1. **Our data is relational.** A user has progress on topics, topics belong to modules, attempts point to problems. JOINs are natural here.
2. **Transactions (ACID).** Rating a card must update the card's schedule **and** add an XP event together, or neither. Postgres guarantees that.
3. **Analytics in SQL.** Window functions and CTEs answer "my weakest patterns this month" in one query (Phase 5).
4. **pgvector**: one database also handles AI vector search (Phase 6), so there's no separate vector database to run.
5. **Interview value:** SQL, indexes and transactions come up in almost every backend interview.

## Key ideas you'll use

- **Types are enforced.** Put text in an `integer` column and Postgres refuses it.
- **Primary key:** a unique ID for each row (we use UUIDs).
- **Foreign key:** "this `topic_id` must exist in `topics`." The database protects you from broken links.
- **Index:** like a book's index. Without one, Postgres scans every row. Example: `card_states (user_id, due_at)` makes "what's due for me today?" instant.
- **Transaction:** `BEGIN; ...several changes...; COMMIT;` Either all of them happen or none do.
- **Migration:** a versioned SQL file that changes the structure (add a table, add a column). Applied in order, never edited once applied (that's a rule in `CLAUDE.md`).
- **`jsonb`:** a column that stores JSON, for flexible data like settings, so you get some MongoDB-style flexibility when you need it.

## Extensions and pgvector

Postgres can be extended with plugins. **pgvector** adds a `vector` column type and fast similarity search:

- An AI model turns text into an **embedding**: a list of numbers (for example 768 of them) that captures its meaning.
- Similar meaning means nearby vectors. "What is a hash map?" lands close to your note about hash tables, even if the words differ.
- pgvector finds the closest vectors quickly using an **HNSW index**.

That's the core of "Ask my notes" (RAG) in Phase 6. Our `infra/postgres/init.sql` enables it locally with `CREATE EXTENSION IF NOT EXISTS vector;`.

## Try it yourself

Open a SQL shell: `docker compose exec postgres psql -U skillforge`

```sql
\dx                                  -- list extensions (you'll see vector)
CREATE TABLE fruits (id serial PRIMARY KEY, name text NOT NULL, price numeric);
INSERT INTO fruits (name, price) VALUES ('apple', 1.2), ('mango', 2.5);
SELECT * FROM fruits WHERE price > 2;
INSERT INTO fruits (name, price) VALUES (NULL, 1);   -- fails: NOT NULL is enforced
-- vectors:
CREATE TABLE items (id serial, embedding vector(3));
INSERT INTO items (embedding) VALUES ('[1,0,0]'), ('[0.9,0.1,0]'), ('[0,0,1]');
SELECT id, embedding <-> '[1,0,0]' AS distance FROM items ORDER BY distance;
DROP TABLE fruits; DROP TABLE items;
\q                                   -- quit
```

## Check yourself

1. Why must "rate a card" and "add XP" happen in one transaction?
2. What does an index on `(user_id, due_at)` speed up, and what does it cost?
3. What is an embedding, and why does pgvector need a special index?
4. Name two things Postgres enforces that MongoDB doesn't by default.
