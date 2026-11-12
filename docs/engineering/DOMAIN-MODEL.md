# Domain Model

This document describes the logical model, not a finalized ORM schema.

## Entities

### User
Owns preferences, social accounts, posts, and installation-level user data.

Potential fields: `id`, `email`, `name`, `passwordHash` (if applicable), `timezone`, `createdAt`, `updatedAt`.

### SocialAccount
Represents one connected provider account.

Potential fields: `id`, `userId`, `platform`, `platformAccountId`, `accountName`, `accountHandle`, `accountAvatar`, encrypted token references/values, `tokenExpiresAt`, `connectionStatus`, timestamps.

### Post
Represents the shared composition and scheduling container.

Potential fields: `id`, `userId`, `masterContent`, `status`, `scheduledAt`, `publishedAt`, timestamps.

### PostTarget
Represents one post's publication to one connected social account.

Potential fields: `id`, `postId`, `socialAccountId`, `platformContent`, `status`, `platformPostId`, `errorCode`, `errorMessage`, `publishedAt`, timestamps.

### PostMedia
Represents media attached to a post.

Potential fields: `id`, `postId`, `storageKey`, `originalFilename`, `mimeType`, `fileSize`, `width`, `height`, `orderIndex`, timestamps.

### PublishingJob
Represents durable work for one destination publication attempt.

Potential fields: `id`, `postTargetId`, `scheduledAt`, `status`, `attemptCount`, `nextAttemptAt`, `lockedAt`, `lastError`, `idempotencyKey`, timestamps.

### Optional supporting entities
- `Session` or auth-provider records.
- `SystemSetting`.
- `AIUsageLog`.
- `AuditLog`.

## Relationships

- User 1 -> many SocialAccounts.
- User 1 -> many Posts.
- Post 1 -> many PostTargets.
- Post 1 -> many PostMedia.
- SocialAccount 1 -> many PostTargets.
- PostTarget 1 -> many PublishingJob attempts.

## Important invariants

- A PostTarget belongs to exactly one Post and one SocialAccount.
- A post cannot target the same account twice.
- A destination result must not overwrite another destination's result.
- A published destination should retain its provider post ID when available.
- A scheduled instant is stored as UTC.
- Token material must never be exposed in ordinary API responses.
- A retry must reuse a stable idempotency strategy for the logical publication operation.

## Questions before schema finalization

- Single-user installation or multi-user installation?
- Are media assets reusable independently of a post? If yes, introduce a first-class MediaAsset entity and join table.
- Should post content revisions be stored?
- Should publishing jobs be created at schedule time or derived from PostTarget state?
- What is the retention policy for logs and deleted posts?
