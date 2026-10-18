# Postgres cutover

App currently uses **SQLite WAL** (`data/wordstat.db`) with full SaaS tables (users, subscriptions, keys, plans, usage).

`docker-compose.yml` starts Postgres 16 on `127.0.0.1:5433` and Redis on `127.0.0.1:6380`.

## When to cut over

- Anticipated concurrent writers > SQLite comfort zone
- Need managed backups / replicas

## Steps

1. `docker compose up -d postgres`
2. Export SQLite → SQL dump (custom script TBD) or re-seed catalogs + migrate users
3. Point `DATABASE_URL=postgresql://wordstat:wordstat@127.0.0.1:5433/wordstat`
4. Switch Drizzle client to `drizzle-orm/node-postgres`
5. Restart `wordstat` service

Until cutover, Redis can still be used for rate limits later; usage caps already work via `usage_events` in SQLite.
