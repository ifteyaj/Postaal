# Task 1.1 — SQLite and Drizzle persistence foundation

**Status:** Proposed — awaiting review. Do not implement until approved.
**Phase:** 1 (Application foundation), step 1 of 7
**Depends on:** Phase 0 exit (see prerequisites)
**Blocks:** every later step in Phases 1–4
**Estimated size:** ~10 files, ~450 lines of code and ~350 lines of tests. One review.

## Why this task first

Nothing else in the product can be built without a place to store it. This task
creates the database, the schema from
[`../engineering/DATABASE-SCHEMA.md`](../engineering/DATABASE-SCHEMA.md), the
migration workflow, and the tests that prove the constraints are real. It adds **no
UI, no routes, no domains, and no queries used by the app** — the app still runs on
the prototype until step 2.

Doing it first is what makes the rest reviewable: every later step can assume
constraints are enforced by the database rather than by hopeful code.

## What "done" looks like

A developer clones the repository, runs `npm install`, and gets a `postaal.db` created
and migrated in the data directory on first boot. `npm test` proves the schema rejects
invalid rows, that migrations are idempotent, and that WAL and foreign keys are on.
Nothing in the running app behaves differently yet.

## Prerequisites (blocking)

| # | Prerequisite | State |
|---|---|---|
| 1 | ORM decision accepted as an ADR (Drizzle recommended) | Open — this task assumes it |
| 2 | ID and timestamp representation confirmed | Open — proposed below |
| 3 | `post_media` decision (media reuse in v1.0) | Open — changes the table set |
| 4 | Test runner and tooling accepted | Open — proposed below |

If items 1, 2, or 4 are not approved, stop: this task's deliverable is a chosen
toolchain, and changing it afterwards means rewriting the migration.

## Decisions this task settles

| Decision | Choice | Why |
|---|---|---|
| Driver | `better-sqlite3` | Synchronous, no connection pool, matches one-process/low-concurrency use |
| ORM | `drizzle-orm` + `drizzle-kit` | Typed schema and generated SQL migrations; SQL-first output stays readable |
| Migration runner | In-code `migrate()` at startup | The app and the worker both need the same guarantee before serving |
| ID | `crypto.randomUUID()` behind `newId()` | No dependency; one helper makes a later ULID/UUIDv7 switch a one-line change |
| Timestamps | `INTEGER` Unix epoch **milliseconds**, UTC | Integer compares and sorts cheaply; no timezone ambiguity in storage |
| Schema location | `src/server/adapters/db/schema.ts` | Matches the module layout in `ARCHITECTURE.md` |
| Test runner | `vitest` | Runs TypeScript directly; verified against the native driver |

Constraint and index names are pinned below so a reviewer can diff the generated SQL
against a contract instead of guessing.

## Verified toolchain

Checked on 2026-11-12 in a scratch directory on the same Node version the app runs
under, so these are measurements rather than impressions:

| Package | Version | Evidence |
|---|---|---|
| Node | 26.13.0 | Prebuilt `better-sqlite3` binary loads without compiling |
| `better-sqlite3` | 13.1.1 | Install in ~8 s; `PRAGMA journal_mode=WAL`, FK and CHECK enforced |
| `drizzle-orm` | 0.45.4 | Installs alongside the driver |
| `drizzle-kit` | 0.31.11 | `generate` produced SQL, `migrate` applied it, journal table created |
| `vitest` | 5.1.0 | Ran a TypeScript test opening a temp SQLite file: 1 passed |

Two things the spike caught, both addressed below: `drizzle-kit generate` numbers the
first migration `0000` (not `0001`), and generated SQL must be regenerated rather than
hand-edited or later migrations drift.

## Deliverables

```text
drizzle.config.ts                          drizzle-kit config: sqlite, schema, out, db path
drizzle/0000_initial_schema.sql            generated, committed, reviewed
drizzle/meta/                              generated journal + snapshot, committed
src/server/config/paths.ts                 data directory resolution + creation
src/server/adapters/db/client.ts           openDatabase(path): driver with pragmas
src/server/adapters/db/migrate.ts          runMigrations(db): drizzle migrator
src/server/adapters/db/schema.ts           all tables, checks, indexes, relations
src/server/adapters/db/index.ts            server-only db accessor used by app and worker
src/server/adapters/db/__tests__/schema.test.ts    constraint tests
src/server/adapters/db/__tests__/migrate.test.ts   migration and pragma tests
vitest.config.ts                           node environment, test file glob
package.json                               deps + scripts (db:generate, db:migrate, test)
next.config.ts                             serverExternalPackages: ["better-sqlite3"]
```

No other file should change. In particular `src/lib/*` and every component stay
untouched — the prototype keeps running until step 2 replaces its store.

## Migration scope

**Included in `0000_initial_schema`:**

- `installation_settings`
- `social_accounts`
- `posts`
- `post_targets`
- `media_assets`
- `publish_attempts`
- `scheduled_jobs`
- `post_media` **only if prerequisite 3 is approved**

**Excluded, deliberately:**

- `sessions` — its shape depends on the auth decision (prerequisite not met by this
  task). It ships as `0001_sessions.sql` in step 2.
- Any table for AI, analytics, or audit. Those are not v1.0.

Column-level detail lives in
[`../engineering/DATABASE-SCHEMA.md`](../engineering/DATABASE-SCHEMA.md) and is the
source of truth. This task must not introduce a column that document does not have;
if one turns out to be necessary, amend the document first, in the same pull request.

### Pinned names

```text
CHECK   posts_status_check
CHECK   post_targets_status_check
CHECK   post_targets_attempt_positive        (attempt_number >= 1, on publish_attempts)
CHECK   social_accounts_platform_check
CHECK   social_accounts_connection_status_check
CHECK   media_assets_file_size_positive
CHECK   scheduled_jobs_attempt_count_non_negative
CHECK   publish_attempts_outcome_check
UNIQUE  social_accounts_platform_account     (platform, platform_account_id)
UNIQUE  post_targets_post_account            (post_id, social_account_id)
UNIQUE  media_assets_storage_path            (storage_path)
UNIQUE  publish_attempts_target_attempt      (post_target_id, attempt_number)
UNIQUE  scheduled_jobs_target_active         (post_target_id)
INDEX   posts_status_scheduled_at            (status, scheduled_at)
INDEX   post_targets_status                  (status)
INDEX   post_targets_post_id                 (post_id)
INDEX   scheduled_jobs_claim                 (status, run_at)
INDEX   publish_attempts_target              (post_target_id, attempt_number)
INDEX   social_accounts_platform             (platform)
```

Foreign keys and delete rules:

| From | To | On delete |
|---|---|---|
| `post_targets.post_id` | `posts.id` | CASCADE |
| `post_targets.social_account_id` | `social_accounts.id` | RESTRICT |
| `publish_attempts.post_target_id` | `post_targets.id` | RESTRICT |
| `scheduled_jobs.post_target_id` | `post_targets.id` | CASCADE |
| `post_media.post_id` | `posts.id` | CASCADE |
| `post_media.media_asset_id` | `media_assets.id` | RESTRICT |

## Runtime behaviour

**Data directory.** Resolve in this order: `POSTAAL_DATA_DIR`, then `./data`. Create it
if missing (`recursive: true`). The database is `<data>/postaal.db`. Log the resolved
path once at startup — a path, never a secret.

**Connection.** One module opens a connection with these pragmas, applied in this
order, every time:

```sql
PRAGMA journal_mode = WAL;      -- file databases only; skip for :memory:
PRAGMA foreign_keys = ON;       -- per connection: this is why every open goes through client.ts
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = NORMAL;
```

`foreign_keys` defaults to **off** in SQLite. If a second code path opens the file
directly, constraints silently stop applying — which is why `client.ts` is the only
place allowed to construct the driver, and why a test asserts it.

**Startup.** Both entry points call `runMigrations(db)` before doing work:

- Web: fails startup with a non-zero exit and a readable message if migration fails.
- Worker: same. A worker must never run against an unexpected schema version.

`drizzle-kit migrate` remains available for manual operations and for the Docker
entrypoint in Phase 5; it is not the normal path.

**Singleton.** `src/server/adapters/db/index.ts` exports a lazily created connection
and imports `server-only`, so a client component that imports it fails at build time
rather than bundling a native module into the browser.

**Next.js.** Add `serverExternalPackages: ["better-sqlite3"]` to `next.config.ts` so
the native module is not bundled by Turbopack. Confirm with `npm run build` after the
change, not before.

## Implementation steps

1. Install dev/prod dependencies at the versions above and commit the updated
   `package-lock.json`. Do not upgrade unrelated packages.
2. Write `paths.ts`; add `POSTAAL_DATA_DIR` to `.env.example` if it is not there yet
   (it is part of the Phase 0 env rewrite — do not duplicate that task).
3. Write `schema.ts` table by table, in the order listed in the schema document.
   Keep it a single file; split only past ~400 lines.
4. Run `npx drizzle-kit generate --name initial_schema`, then **read the generated
   SQL** against the pinned names above before committing it.
5. Write `client.ts`, `migrate.ts`, and `index.ts`.
6. Add scripts: `db:generate`, `db:migrate`, `test`, `test:watch`.
7. Add `vitest.config.ts` (node environment) and the two test files.
8. Run migrations against a temp directory, then run the full check set.
9. Update `DATABASE-SCHEMA.md` from *Proposed* to settled for anything this task
   pinned, and record the ORM decision reference at the top.

## Tests

Each test gets its own temporary database via `mkdtemp`, and deletes it afterwards.
None of them touch `./data`.

| ID | Test | Assertion |
|---|---|---|
| T1 | Migration on empty database | All expected tables exist; `__drizzle_migrations` has exactly one row |
| T2 | Migration is idempotent | Running twice succeeds; journal still has one row; no duplicate-object error |
| T3 | Foreign keys are on | `PRAGMA foreign_keys` returns 1 through the app's open path |
| T4 | WAL is on | `PRAGMA journal_mode` returns `wal` for a file database |
| T5 | Unknown parent rejected | `post_targets` insert with a nonexistent `post_id` throws `SQLITE_CONSTRAINT_FOREIGNKEY` |
| T6 | Duplicate destination rejected | Second row with the same `(post_id, social_account_id)` throws a uniqueness error |
| T7 | Duplicate platform account rejected | Second row with the same `(platform, platform_account_id)` throws |
| T8 | Invalid post status rejected | `'BOGUS'` in `posts.status` throws `SQLITE_CONSTRAINT_CHECK` |
| T9 | Invalid target status rejected | `'SUCCESS'` (the retired state) throws — this is the regression test for the state rename |
| T10 | Negative numeric fields rejected | `attempt_count = -1`, `file_size = 0`, `attempt_number = 0` each throw |
| T11 | Cascade removes drafts' children | Deleting a draft post removes its `post_targets` and `scheduled_jobs` rows |
| T12 | Published history is protected | Deleting a `post_targets` row that has a `publish_attempt` throws (RESTRICT) |
| T13 | Single installation row | A second `installation_settings` insert throws a primary-key error |
| T14 | Encrypted fields round-trip | Ciphertext stored in `access_token_encrypted` reads back byte-identical |
| T15 | No absolute paths schema-wide | No column named `path` stores an absolute prefix in any fixture used by tests |

T11–T12 are the ones that encode a product rule rather than a SQL rule; they are worth
reading twice in review.

## Commands

```bash
npm install                 # after dependency changes
npx drizzle-kit generate --name initial_schema
npm run db:migrate          # manual apply against ./data
npm test
npm run lint
npm run typecheck
npm run build               # confirms the native module is externalised
```

## Acceptance criteria

- [ ] `npm test` passes, including T1–T14.
- [ ] `npm run typecheck` and `npm run lint` pass.
- [ ] `npm run build` passes with `serverExternalPackages` set.
- [ ] A fresh clone with no `./data` directory creates and migrates the database on
      first run, and the log states where it went.
- [ ] Committed SQL matches the pinned constraint and index names exactly.
- [ ] Committed SQL contains no table or column absent from `DATABASE-SCHEMA.md`.
- [ ] `sessions` and any unapproved table are absent.
- [ ] No file outside the deliverable list changed, except `.env.example`,
      `package.json`, `next.config.ts`, and docs.
- [ ] `src/lib/app-store.ts` still works untouched; the prototype still runs.
- [ ] Deleting `./data` and re-running reproduces an identical schema (diff the
      generated SQL, not just the tables).

## Reviewer checklist

1. Does any table or column in the migration contradict `DATABASE-SCHEMA.md`?
2. Are the delete rules the intended ones — history protected, drafts cleanable?
3. Is `foreign_keys = ON` applied on every connection path? Search for
   `new Database(` and confirm it appears only in `client.ts`.
4. Do the tests assert failure modes rather than only happy paths?
5. Are timestamps integers in milliseconds, with no local-time arithmetic anywhere?
6. Does anything import the driver outside `src/server`?
7. Is the lockfile change limited to the new dependencies?

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Native module fails to install on the owner's host | Verified prebuilt binary for Node 26; document the supported Node version and that a compiler is only needed if prebuilds are unavailable |
| A future route imports the driver and breaks the client bundle | `server-only` import plus `serverExternalPackages`; build check in acceptance criteria |
| Second connection opened without pragmas | Single constructor rule, enforced by review and T3 |
| Generated SQL hand-edited, causing drift | Regenerate instead of editing; committed snapshot in `drizzle/meta` makes drift visible in diffs |
| WAL on a network share or synced folder corrupts data | Documented in ADR-0001; startup warns if the data path looks like a network mount (best effort, not a guarantee) |
| `drizzle-kit` version drift changes generated SQL | Pin exact versions; upgrades are their own task with a migration diff review |
| Node version newer than Next's tested range | If `npm run build` misbehaves, pin Node 24 LTS in `.nvmrc` and CI before continuing |

## Out of scope

Repositories and domain mapping, sessions and auth, media storage implementation,
routes and UI, worker, Docker, seed data, query optimisations, and any change to the
prototype's `localStorage` store.

## Rollback

The task is additive. Reverting the commit removes the schema and the dependency; no
migration has run against an owner installation yet, so no data is lost. Once this
ships to a real installation, rollback becomes "restore from backup".

## Compatibility note (important for step 2)

`src/lib/types.ts` uses lowercase literals (`"draft"`, `"partial"`, `"pending"`) while
the database stores uppercase (`DRAFT`, `PARTIALLY_PUBLISHED`, `PENDING`). Do **not**
change `src/lib/types.ts` in this task. Record the mapping when the first repository
is written: the database is canonical, and the UI layer adapts. Two different casing
conventions in one codebase is acceptable only if exactly one module does the
translation, and only after it is tested.
