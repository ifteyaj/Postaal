# Database Schema

**Status:** Target schema for v1.0. Physical details marked *Proposed* need approval
in Phase 0 before the first migration is written. The decisions behind the engine
choice are in [ADR-0001](../adr/0001-sqlite-database.md).

This document is the physical counterpart to
[`DOMAIN-MODEL.md`](DOMAIN-MODEL.md), which owns the meaning and invariants. If they
disagree, the domain model wins and this file is corrected.

## Conventions

| Concern | Rule |
|---|---|
| Engine | SQLite, single file at `<data>/postaal.db` |
| Pragma | `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout` configured on connect |
| Table names | `snake_case`, plural (`post_targets`) |
| Column names | `snake_case` |
| Primary keys | `id TEXT PRIMARY KEY` holding a UUIDv7 / ULID *(Proposed)* |
| Timestamps | `created_at`, `updated_at` as `INTEGER` Unix epoch milliseconds, UTC *(Proposed)* |
| Enumerations | `TEXT` plus a `CHECK` constraint; no SQLite `ENUM` |
| Booleans | `INTEGER` 0/1 |
| JSON | `TEXT` holding serialized JSON, only for provider payloads and metadata |
| Deletes | Explicit. No `ON DELETE CASCADE` on published history |

Absolute time is stored; the owner's display timezone comes from
`installation_settings.timezone` and is applied only when rendering.

## Tables

### installation_settings

Exactly one row. Not a user table (ADR-0005).

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK, fixed value `"installation"` *(Proposed)* |
| `owner_email` | TEXT | NOT NULL, UNIQUE |
| `password_hash` | TEXT | NOT NULL |
| `timezone` | TEXT | NOT NULL, IANA identifier |
| `created_at` | INTEGER | NOT NULL |
| `updated_at` | INTEGER | NOT NULL |

Invariant: the row count is 0 (not yet set up) or 1. A second insert must fail.

### social_accounts

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `platform` | TEXT | NOT NULL, CHECK in (`x`, `instagram`, `facebook`, `linkedin`) |
| `platform_account_id` | TEXT | NOT NULL |
| `account_name` | TEXT | NOT NULL |
| `account_handle` | TEXT | NULL |
| `account_avatar_url` | TEXT | NULL |
| `access_token_encrypted` | TEXT | NOT NULL |
| `refresh_token_encrypted` | TEXT | NULL |
| `token_expires_at` | INTEGER | NULL |
| `connection_status` | TEXT | NOT NULL, CHECK in (`connected`, `needs_reauth`, `revoked`, `error`) |
| `created_at` | INTEGER | NOT NULL |
| `updated_at` | INTEGER | NOT NULL |

- Unique: `(platform, platform_account_id)`.
- Index: `(platform)` for the accounts screen.
- Token columns are ciphertext. Plaintext tokens never appear in a query result that
  reaches the UI, a log, or an error message.

### posts

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `master_content` | TEXT | NOT NULL, default `''` |
| `status` | TEXT | NOT NULL, CHECK in (`DRAFT`, `SCHEDULED`, `PUBLISHING`, `PUBLISHED`, `PARTIALLY_PUBLISHED`, `FAILED`, `CANCELLED`) |
| `scheduled_at` | INTEGER | NULL |
| `published_at` | INTEGER | NULL |
| `created_at` | INTEGER | NOT NULL |
| `updated_at` | INTEGER | NOT NULL |

- Index: `(status, scheduled_at)` for calendar and queue queries.
- `status` is derived from its targets once any target leaves `PENDING`
  (`PUBLISHING`), so it is written by the domain, not by each adapter.

### post_targets

One destination. Independent lifecycle per row.

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `post_id` | TEXT | NOT NULL, FK → `posts(id)` ON DELETE CASCADE |
| `social_account_id` | TEXT | NOT NULL, FK → `social_accounts(id)` ON DELETE RESTRICT |
| `platform_content` | TEXT | NULL — destination override; NULL means inherit master |
| `status` | TEXT | NOT NULL, CHECK in (`PENDING`, `QUEUED`, `PUBLISHING`, `PUBLISHED`, `FAILED`, `CANCELLED`, `NEEDS_ATTENTION`) |
| `platform_post_id` | TEXT | NULL |
| `published_at` | INTEGER | NULL |
| `last_error` | TEXT | NULL — normalized, secret-free summary |
| `created_at` | INTEGER | NOT NULL |
| `updated_at` | INTEGER | NOT NULL |

- Unique: `(post_id, social_account_id)` — a post cannot target the same account
  twice.
- Index: `(status)` for worker eligibility and the queue view.

The cascade from `posts` is intentional: deleting a draft removes its targets.
Published outcomes are still protected by not deleting published posts by default
(see `DOMAIN-MODEL.md`).

### media_assets

Metadata only. File contents live under the media directory (ADR-0002).

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `original_filename` | TEXT | NOT NULL — display only, never used as a path |
| `storage_path` | TEXT | NOT NULL, UNIQUE, relative to the media root |
| `mime_type` | TEXT | NOT NULL |
| `file_size` | INTEGER | NOT NULL, CHECK > 0 |
| `width` | INTEGER | NULL |
| `height` | INTEGER | NULL |
| `created_at` | INTEGER | NOT NULL |

### post_media — *Proposed, needs approval*

The ADR domain sketch attaches media to a post. Ordering and library reuse require a
join table. This is a proposal to approve in Phase 0, not a settled decision.

| Column | Type | Constraints |
|---|---|---|
| `post_id` | TEXT | NOT NULL, FK → `posts(id)` ON DELETE CASCADE |
| `media_asset_id` | TEXT | NOT NULL, FK → `media_assets(id)` ON DELETE RESTRICT |
| `order_index` | INTEGER | NOT NULL, CHECK >= 0 |

- PK: `(post_id, media_asset_id)`.
- Unique: `(post_id, order_index)`.

If reuse is dropped from v1.0, `media_assets` gains a nullable `post_id` instead and
this table is not created. Decide once, before the initial schema migration.

### publish_attempts

Append-only history. One row per attempt, never updated after completion.

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `post_target_id` | TEXT | NOT NULL, FK → `post_targets(id)` ON DELETE RESTRICT |
| `attempt_number` | INTEGER | NOT NULL, CHECK >= 1 |
| `started_at` | INTEGER | NOT NULL |
| `finished_at` | INTEGER | NULL — NULL while in flight |
| `outcome` | TEXT | NOT NULL, CHECK in (`PUBLISHED`, `FAILED`, `UNCERTAIN`) |
| `platform_response` | TEXT | NULL — JSON, redacted |
| `error_code` | TEXT | NULL |
| `error_message` | TEXT | NULL |

- Unique: `(post_target_id, attempt_number)`.
- `platform_response` must be sanitized before insert: no tokens, no headers, no
  authorization codes.

### scheduled_jobs

Durable work. The worker's only queue.

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `post_target_id` | TEXT | NOT NULL, FK → `post_targets(id)` ON DELETE CASCADE |
| `run_at` | INTEGER | NOT NULL |
| `status` | TEXT | NOT NULL, CHECK in (`PENDING`, `CLAIMED`, `DONE`, `FAILED`, `CANCELLED`) *(Proposed)* |
| `attempt_count` | INTEGER | NOT NULL, default 0, CHECK >= 0 |
| `locked_at` | INTEGER | NULL |
| `locked_by` | TEXT | NULL |
| `last_error` | TEXT | NULL |
| `created_at` | INTEGER | NOT NULL |
| `updated_at` | INTEGER | NOT NULL |

- Index: `(status, run_at)` — the claim query.
- Unique: `(post_target_id)` for the active job. A target may be rescheduled, in
  which case the existing row is updated rather than duplicated.

Claim pattern (single writer, so a conditional update is enough):

```sql
UPDATE scheduled_jobs
   SET status = 'CLAIMED', locked_at = :now, locked_by = :worker_id
 WHERE id = :id AND status = 'PENDING';
-- rowcount 1 means the claim was won
```

### sessions — *pending authentication decision*

Column shape depends on the auth ADR that is still open. Expected: `id`, `token_hash`
(never the raw token), `expires_at`, `created_at`, `last_seen_at`. Do not write this
migration before that decision is recorded.

## Relationships

```text
installation_settings (1 row, no foreign keys)

social_accounts 1 ---- n post_targets
posts           1 ---- n post_targets
posts           1 ---- n post_media ---- 1 media_assets
post_targets    1 ---- n publish_attempts
post_targets    1 ---- 1 scheduled_jobs (active)
```

## Migration rules

- Drizzle numbers migrations from `0000`; the first one is
  `drizzle/0000_initial_schema.sql`. See
  [`../phases/TASK-1-1-SQLITE-PERSISTENCE.md`](../phases/TASK-1-1-SQLITE-PERSISTENCE.md).
- Migrations are numbered, ordered, and committed with the code that needs them.
- Schema changes go through a migration file; no manual edits to a live database.
- The migration step runs before the app and worker start, and fails startup on error.
- Migrations are forward-only in v1.0. A corrective migration replaces a rollback.
- A destructive migration requires a documented backup step and a restore test.
- SQLite cannot drop or alter every column in place; where it cannot, the migration
  creates a new table, copies rows, and swaps — verified by a test.
- `PRAGMA foreign_key_check` runs after migration.

## Backup interface

The schema must remain restorable from: the database file plus the media directory
plus the encryption key. Nothing else. See
[`DEPLOYMENT.md`](DEPLOYMENT.md#backup-and-restore).

## Open questions

- Confirm the ORM and migration tool (Drizzle recommended, not decided).
- Confirm ID and timestamp representation before the initial schema migration.
- Approve or reject `post_media` (media reuse in v1.0).
- Decide whether `publish_attempts` needs a provider-side status column for
  reconciliation after an uncertain outcome.
- Decide retention for `publish_attempts`, `platform_response`, and deleted media.
