# ADR-0001: SQLite as the application database

- Status: Accepted
- Date: 2026-11-13
- Deciders: Project owner
- Replaces: the unconfirmed PostgreSQL proposal in `docs/product/DECISIONS.md`

## Context

Postaal v1.0 is a single-owner installation running on the owner's own machine or
local server. Expected concurrency is low: one owner, one web process, and one
publishing worker. A separate database server would add installation steps,
memory overhead, and a second backup target for a workload that does not need it.

## Options considered

### Option A — PostgreSQL

- Benefits: strong concurrent writes, familiar operational tooling, easy path to a
  future hosted multi-tenant version.
- Costs: an extra service in Docker Compose, extra configuration and credentials,
  more memory on small hosts, and a second component the owner must back up.
- Risk: unnecessary operational burden for v1.0.

### Option B — SQLite (selected)

- Benefits: a single file, no server process, transactions, foreign keys, indexes,
  and a well-understood backup story. Removes an entire service from the install.
- Costs: one writer at a time, so long write transactions block other writes.
- Risk: the database file must not live on a network share or cloud-synced folder.

## Decision

SQLite is the only application database for v1.0. The database file lives in the
persistent data directory (`/app/data/postaal.db` by default) and is the canonical
store for all application state.

## Implementation rules

- Enable WAL mode and a non-zero `busy_timeout` during database initialization.
- Do not assume WAL permits concurrent writers; SQLite still serializes writes.
- Keep write transactions short, especially in the publishing worker.
- Enable foreign-key enforcement on every connection.
- Every schema change ships as a versioned, reproducible migration.
- Store all instants in UTC. The owner's timezone lives in `InstallationSettings`.
- Never point the database at an ordinary network share or a synced folder.
- Back up with a SQLite-aware method (online backup or `VACUUM INTO`), not by
  copying the file while WAL is active.
- Run only one Postaal installation against a given database file.

## Consequences

- No PostgreSQL service, connection string, or database credentials in v1.0.
- Backup and restore operate on files, which keeps Phase 5 simple.
- The publishing worker must be single-concurrency by default, with job locking
  expressed in SQL rather than assumed from a queue server.
- A future PostgreSQL migration remains possible but is not planned work.

## Validation

- Phase 0: schema and migration workflow reviewed against
  `docs/engineering/DATABASE-SCHEMA.md`.
- Phase 3: worker tests prove two workers cannot claim the same job, and that a
  restarted worker recovers due work.
- Phase 5: a backup taken under load restores into a working installation.
