# ADR-0002: Local filesystem media storage

- Status: Accepted
- Date: 2026-11-13
- Deciders: Project owner
- Replaces: the unconfirmed S3-compatible storage proposal in `docs/product/DECISIONS.md`

## Context

The owner uploads images while composing. Those files are private until published,
and the owner already controls the host. Adding object storage would mean a
subscription, credentials, and an external dependency for an ordinary editing
workflow.

## Options considered

### Option A — S3-compatible object storage

- Benefits: scales past local disk, ready-made signed URLs, survives host loss.
- Costs: a subscription or a self-hosted MinIO service, plus credentials and
  network configuration in every environment.
- Risk: contradicts the "no mandatory cloud infrastructure" principle.

### Option B — Local filesystem (selected)

- Benefits: no subscription, media stays under the owner's control, backups are
  ordinary files, works offline while composing.
- Costs: the owner owns disk space, retention, and backup coverage.
- Risk: some platforms cannot fetch media from a private machine (see below).

## Decision

Original and derived media files are stored on the local filesystem. The database
stores media metadata and relative paths only — never file contents and never
absolute machine-specific paths.

```text
/app/data/            postaal.db, backups/, config/
/app/media/originals/ uploaded originals, content-addressed internal names
/app/media/processed/ derived renditions
/app/media/thumbnails/ grid thumbnails
/app/media/temporary/ uploads awaiting validation; safe to purge
```

## Implementation rules

- Generate internal filenames; never trust a client-supplied name or path.
- Validate file content (magic bytes / decoded image), not extensions or declared
  MIME types alone.
- Reject path traversal and never join user input into a filesystem path unchecked.
- Store relative paths in the database so the data directory stays relocatable.
- Never expose `/app/media` as a public static directory. Serve media only through
  an authorized application route that checks the owner session.
- Adapters upload media through their own platform workflow; they must not assume a
  local path is reachable by the platform.
- Clean up `temporary/` on failure and on a schedule.

## Critical constraint: platforms cannot read the local disk

Local storage does not mean a platform can fetch a local file. Each adapter owns
its media delivery mechanism:

| Platform | Media delivery |
|---|---|
| LinkedIn | Initialize upload, receive an upload URL, transfer bytes there |
| X | Upload media through the platform's media endpoint, then reference it |
| Facebook | Upload through the Page media endpoint |
| Instagram | Requires media reachable at a **public HTTPS URL** at publish time |

Instagram therefore cannot be published from a machine with no inbound path. This
does not change the storage decision, but it blocks the Instagram adapter until a
separate, narrowly scoped media-delivery decision is recorded (see
`docs/decisions/ARCHITECTURE-DECISIONS.md`). A solution must never expose the
application, the media directory, or the filesystem generally.

## Consequences

- Disk capacity, file retention, and deletion policy are now product concerns.
- Backups must include media, not only the database; a database-only restore is
  incomplete.
- Instagram support is gated on a future ADR, not on this one.
- An optional S3-compatible adapter may be added later behind the same storage
  interface; it is not v1.0 work.

## Validation

- Phase 1: upload tests cover oversized files, spoofed extensions, and traversal
  attempts.
- Phase 2: media survives an application restart and appears in the library.
- Phase 5: a restore containing database and media reproduces working posts.
