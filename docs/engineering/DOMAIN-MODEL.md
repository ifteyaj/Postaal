# Domain Model

Logical model for v1.0. Physical tables, types, and constraints are in
[`DATABASE-SCHEMA.md`](DATABASE-SCHEMA.md). Decisions behind the shape are in
[ADR-0001](../adr/0001-sqlite-database.md) to
[ADR-0005](../adr/0005-single-owner-installation.md).

## Scope

One installation, one owner, many posts, and one publication per destination. There
are no organizations, teams, or per-user isolation.

## Entities

### InstallationSettings

Installation-level configuration and the single owner identity.

| Field | Meaning |
|---|---|
| `id` | Fixed single row |
| `ownerEmail` | Owner's sign-in identity |
| `passwordHash` | Argon2id or bcrypt hash; never a raw password |
| `timezone` | IANA zone used for all display and schedule input |
| `createdAt`, `updatedAt` | Audit instants |

Owns: nothing. There is no `users` table and no `userId` on content.

### SocialAccount

One authorized provider account.

| Field | Meaning |
|---|---|
| `platform` | `x`, `instagram`, `facebook`, `linkedin` |
| `platformAccountId` | Provider's stable account identifier |
| `accountName`, `accountHandle`, `accountAvatarUrl` | Display identity |
| `accessTokenEncrypted`, `refreshTokenEncrypted` | Ciphertext at rest |
| `tokenExpiresAt` | Drives `needs_reauth` before publishing |
| `connectionStatus` | `connected`, `needs_reauth`, `revoked`, `error` |

### Post

The shared composition and scheduling container.

| Field | Meaning |
|---|---|
| `masterContent` | Base caption used by every destination without an override |
| `status` | Derived publication state (see `PUBLISHING-LIFECYCLE.md`) |
| `scheduledAt` | Intended UTC instant, or null |
| `publishedAt` | First successful destination publication, or null |

### PostTarget

One post going to one connected account. The unit of publishing.

| Field | Meaning |
|---|---|
| `platformContent` | Optional override; null means inherit `masterContent` |
| `status` | Independent lifecycle state |
| `platformPostId` | Provider's post identifier once published |
| `publishedAt` | Instant this destination succeeded |
| `lastError` | Normalized, secret-free summary |

### MediaAsset

A stored file and its metadata. Contents are on the local filesystem
(ADR-0002); this entity holds only metadata and a relative path.

Attaches to posts through `PostMedia` (`postId`, `mediaAssetId`, `orderIndex`).

### PublishAttempt

An immutable record of one call to a platform for one target: when it started, when
it finished, the outcome (`PUBLISHED`, `FAILED`, `UNCERTAIN`), the redacted provider
response, and a normalized error.

### ScheduledJob

Durable work for one target: `runAt`, status, attempt count, and a lease
(`lockedAt`, `lockedBy`). The worker's only source of truth for what to do next.

## Relationships

```text
InstallationSettings (1)

Post 1 --- n PostTarget n --- 1 SocialAccount
Post 1 --- n PostMedia  n --- 1 MediaAsset
PostTarget 1 --- n PublishAttempt
PostTarget 1 --- 1 ScheduledJob
```

## Invariants

These are domain rules. Tests must assert them; adapters may not work around them.

1. A `PostTarget` belongs to exactly one post and one social account.
2. A post cannot target the same account twice.
3. A target's outcome never overwrites another target's outcome.
4. A published target keeps its `platformPostId` when the provider supplies one.
5. Every scheduled instant is stored in UTC; display converts to
   `InstallationSettings.timezone`.
6. Token material never appears in an ordinary API response, log, or error message.
7. A retry of the same logical publication reuses a stable identity; a retry must not
   create a second post on the platform.
8. Post status is derived from target statuses, never set independently by an adapter.
9. A published target is never silently re-queued by a scheduler or a restart.
10. `UNCERTAIN` is a first-class outcome, not a failure to be retried blindly.

## State ownership

| State | Written by |
|---|---|
| `Post.status`, `Post.scheduledAt` | `posts` module, from target results and owner actions |
| `PostTarget.status`, `platformPostId` | `publishing` module only |
| `ScheduledJob.*` | `scheduling` module creates; worker claims and completes |
| `SocialAccount.connectionStatus` | `social-accounts` module after auth or a 401/403 |
| `MediaAsset.*` | `media` module on upload |

Adapters return results. They do not write to the database.

## Deletion policy

- Deleting a draft removes its targets and their pending jobs.
- Deleting a scheduled post cancels its jobs first; the post remains until no job is
  in flight.
- Published posts and their attempts are not deleted by default. A discard action
  that hides a published post is a UI concern, not row deletion.
- Media referenced by a published target is not deleted by the library's delete
  action; mark it unused instead.

## Deliberately absent

- Users, teams, roles, permissions, invitations.
- Workspaces, projects, campaigns, labels.
- Comment or inbox entities.
- Analytics or engagement metrics.
- Post revision history (revisit only if drafts need undo across sessions).

## Open questions

- Is media reuse across posts in v1.0? (Decides `PostMedia` vs `postId` on the asset.)
- Do drafts need revision history, or is last-write-wins enough for one owner?
- Should a published post be editable, duplicated, or both?
- What retention applies to attempts and provider responses?
