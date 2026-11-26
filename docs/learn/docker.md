# Docker and Docker Compose

## What problem does it solve?

To develop SkillForge you need Postgres 18 with the pgvector extension, plus Redis. Without Docker you'd install each one on your Mac, fight version conflicts with your other projects (you already have a Postgres 18 and a Redis from Homebrew), and your CI server and production would each be set up slightly differently.

Docker lets you say **"run exactly this version of Postgres, configured like this"** in a file, and get the same result on any machine, in seconds, isolated from everything else.

## The four core ideas

| Concept          | Analogy                                                                                   | In SkillForge                                 |
| ---------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Image**        | A recipe or installer: read-only, someone else built it                                   | `pgvector/pgvector:pg18`, `redis:8-alpine`    |
| **Container**    | A running app made from that recipe; you can have many from one image                     | `skillforge-postgres-1`, `skillforge-redis-1` |
| **Volume**       | An external hard drive plugged into the container; survives when the container is deleted | `postgres-data`, `redis-data`                 |
| **Port mapping** | A door from your Mac into the container                                                   | Mac `5433` → container `5432`                 |

**Key insight:** containers are disposable. You can delete and recreate them any time; your data survives because it lives in the **volume**, not the container.

### Image vs container in one sentence

An image is like a class; a container is like an instance (`new Postgres()`).

### Tags

`redis:8-alpine` means image `redis`, tag `8-alpine` (Redis version 8, built on the tiny Alpine Linux). Tags like `8-alpine` move forward when new patch versions come out; that's why Docker Desktop showed "Created 3 days ago": that's when the Redis team built it, not when you downloaded it.

## How it works under the hood

Containers are **not** virtual machines. On Linux, a container is just a normal process that the kernel isolates using:

- **namespaces**: the process gets its own view of files, network, and process IDs (it thinks it's alone on the machine)
- **cgroups**: limits on how much CPU and memory it can use

The catch: containers need a **Linux** kernel. macOS isn't Linux, so **Docker Desktop runs one small Linux virtual machine** in the background, and all your containers run inside it. That VM is why Docker uses memory even with no containers running, and why quitting Docker Desktop frees it.

```
 Your Mac (macOS)
 └── Docker Desktop
     └── Linux VM  (limited by Settings → Resources)
         ├── container: skillforge-postgres-1   (port 5432 inside)
         └── container: skillforge-redis-1      (port 6379 inside)
                ▲
 localhost:5433 ┘ and localhost:6380 → mapped in from your Mac
```

**Layers:** an image is built from stacked, cached layers (base OS → install Postgres → add pgvector). Two images sharing a base layer store it only once. That's why pulls after the first are fast.

## Docker Compose

Running containers by hand means long commands (`docker run -p ... -v ... -e ...`). **Compose** puts all of that in a YAML file and starts everything together with one command. Our file is `compose.yaml` at the repo root.

### Our `compose.yaml`, line by line

```yaml
name: skillforge                    # prefix for containers/volumes: skillforge-postgres-1

services:
  postgres:
    image: pgvector/pgvector:pg18   # Postgres 18 with pgvector preinstalled
    environment:                     # settings passed into the container
      POSTGRES_USER: ${POSTGRES_USER:-skillforge}   # read from .env, default "skillforge"
      ...
    ports:
      - "127.0.0.1:${POSTGRES_PORT:-5433}:5432"
      #  ▲ only your Mac   ▲ Mac port      ▲ container port
    volumes:
      - postgres-data:/var/lib/postgresql             # named volume = where the data lives
      - ./infra/postgres/init.sql:/docker-entrypoint-initdb.d/001-init.sql:ro
      #  ▲ a file from your repo, mounted read-only; Postgres runs it on first start
    healthcheck:
      test: ["CMD-SHELL", "pg_isready ..."]           # "are you ready?" every 5s
```

Things worth noticing:

- **`127.0.0.1:` in ports** means only your laptop can connect. Without it, anyone on the office Wi-Fi could reach the database.
- **5433, not 5432**, because your Homebrew Postgres already uses 5432. Inside the container it's still 5432; the mapping translates.
- **No `restart:` policy**, so containers only start when you run `pnpm db:up`, never on their own.
- **`healthcheck`** lets `docker compose up --wait` (our `pnpm db:up`) wait until Postgres actually accepts connections, not just until the process started.
- **`${VAR:-default}`** reads from your `.env` file, falling back to the default.

## Commands you'll use

| Command                                           | What it does                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `pnpm db:up`                                      | Start Postgres + Redis and wait until healthy                                   |
| `pnpm db:down`                                    | Stop and remove the containers (**data is kept** in volumes)                    |
| `pnpm db:reset`                                   | Remove containers **and volumes**, so all local data is wiped, then start fresh |
| `docker compose ps`                               | List this project's containers and their health                                 |
| `docker compose logs -f postgres`                 | Follow Postgres's logs (Ctrl+C to stop)                                         |
| `docker compose exec postgres psql -U skillforge` | Open a SQL shell **inside** the container                                       |
| `docker compose exec redis redis-cli`             | Open a Redis shell inside the container                                         |
| `docker compose pull`                             | Download newer builds of the images                                             |
| `docker system df`                                | How much disk Docker uses                                                       |

**`down` vs `stop`:** `stop` pauses containers; `down` removes them. Both keep volumes. Only `down --volumes` (our `db:reset`) deletes data.

## Try it yourself

1. Run `docker compose ps`. Which ports are mapped?
2. Run `docker compose exec postgres sh`, then `ps aux`. Postgres is basically the only process, because the container thinks it's alone (namespaces). Type `exit`.
3. Run `docker compose down`, then `docker compose ps` (empty), then `pnpm db:up`. Is your data still there? Why?
4. Open Docker Desktop → **Volumes**. Find `skillforge_postgres-data`.

## Common mistakes

- **"Port is already allocated"**: something else uses that port. Change `POSTGRES_PORT` in `.env`.
- **Editing `init.sql` and nothing happens**: it only runs when the data volume is empty. Use `pnpm db:reset` (wipes data).
- **Closing the Docker window ≠ quitting.** Quit from the whale icon or the Dock.

## How this shows up in interviews

- "What's the difference between a container and a VM?" (shared kernel + namespaces/cgroups vs a full guest OS)
- "How do you get the same environment in dev, CI and prod?"
- Phase 9: you'll write a **Dockerfile** for the API, building your own image instead of using someone else's.

## Check yourself

1. What's the difference between an image and a container?
2. Why does Docker on a Mac use memory even when no containers are running?
3. If you delete the Postgres container, why is your data still there?
4. What does `127.0.0.1:5433:5432` mean, piece by piece?
