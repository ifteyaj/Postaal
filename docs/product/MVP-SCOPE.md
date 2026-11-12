# MVP Scope

**Version:** v1.0 — single-owner, locally installed.
**Status:** Scope agreed at the feature level; sequencing is in
[`../roadmap/ROADMAP.md`](../roadmap/ROADMAP.md). Confirmed technical boundaries are in
[`../decisions/ARCHITECTURE-DECISIONS.md`](../decisions/ARCHITECTURE-DECISIONS.md).

## MVP promise

One owner installs Postaal on their own machine, creates a post, previews it for the
platforms they use, saves it, publishes it now or schedules it, and sees a truthful
per-destination result — including when a destination fails.

## In v1.0

**Installation and access**

- Docker Compose installation with a persistent data directory and media directory.
- First-run setup that creates the single owner, then closes.
- Owner sign-in, sign-out, and session handling.
- Loopback binding by default; LAN access as an explicit opt-in.
- No cloud service, subscription, or Postaal account required.

**Content**

- Studio composer with a master caption.
- Destination selection across connected accounts.
- Per-destination caption overrides.
- Image uploads: JPEG, PNG, WebP, with content validation.
- Media library for uploaded assets.
- Draft save, reopen, edit, duplicate, delete.

**Previews**

- Platform-specific preview components for the platforms in scope.
- Live updates as content, media, or destinations change.
- Works with no connected account.
- Clearly labelled as a simulation.

**Scheduling**

- Publish now and schedule for a future instant.
- UTC storage, owner-timezone display.
- Calendar and queue views.
- Reschedule and cancel before execution.

**Publishing**

- Durable jobs processed by a separate worker.
- Independent per-destination state and attempt history.
- Bounded retry for transient failures only.
- No duplicate publication after retries or restarts.
- At least one real platform adapter, fully validated.

**Operations**

- Backup and restore procedure.
- Upgrade path with migrations.
- Health checks and structured logs.

## Explicitly excluded from v1.0

- Multiple users, invitations, roles, approvals, or per-user isolation.
- Public hosting, remote access, tunnels, or a hosted Postaal service.
- Analytics, engagement metrics, social listening, or inbox/comment management.
- Campaign management, content templates, or a template marketplace.
- Video publishing or editing.
- AI image generation.
- Billing or subscription management.
- Native mobile applications.
- S3-compatible storage as a required backend (an optional adapter may come later).

## Deferred, not excluded

- AI caption generation: optional capability, kept outside the publishing path, and
  scheduled only after the manual workflow is stable.
- Instagram publishing: blocked until the public-media-URL conflict is decided
  (ADR-0002, ADR-0004).
- Additional platforms beyond the first validated adapter.

## Release gates

Do not describe Postaal as publish-capable until all of these are true:

1. One platform has passed authorization, validation, media, publishing, token-expiry,
   rate-limit, and duplicate-prevention tests on a permitted test account.
2. Partial failure preserves successful destinations.
3. A worker restart mid-job does not produce a duplicate post.
4. A backup restores into a working installation with media intact.

Do not describe the preview engine as proof of platform rendering. It is a simulation.
