# System Architecture

**Status:** v1.0 architecture decided. The four confirmed choices and the
single-owner model are recorded in ADR-0001 to ADR-0005. Anything in this document
labelled *Proposed* is not yet approved.

## Shape

A modular monolith with two runtime processes that share one data directory.

```text
Owner's browser (loopback or LAN, authenticated)
        |
        v
+-----------------------------+        +------------------------------+
| Web application             |        | Publishing worker            |
| - UI and server routes      |        | - Polls due jobs             |
| - Owner auth and sessions   |        | - Claims a job in a txn      |
| - Studio, previews          |        | - Validates target           |
| - Media upload and serving  |        | - Calls platform adapter     |
| - Scheduling commands       |        | - Records attempt + outcome  |
+-------------+---------------+        +--------------+---------------+
              |                                       |
              +------------------+--------------------+
                                 |
                     +-----------v-----------+
                     | SQLite (postaal.db)   |
                     +-----------+-----------+
                                 |
                     +-----------v-----------+
                     | Local media directory |
                     +-----------+-----------+
                                 |
                                 | outbound HTTPS only
                                 v
                     Social platform APIs (X, LinkedIn,
                     Facebook, Instagram)
```

Inbound is local only (ADR-0004). Outbound is ordinary HTTPS. There is no queue
server, no object storage, and no hosted Postaal service in v1.0.

## Responsibilities

| Component | Owns | Must not |
|---|---|---|
| Web application | UI, server routes, authentication, validation at the boundary, scheduling commands, media upload and serving | Publish directly from a request handler, or hold platform tokens in browser code |
| Publishing worker | Due-job discovery, locking, adapter invocation, attempt history, retry scheduling | Serve UI, accept user input, or assume a browser session exists |
| Domain modules | Entities, state transitions, validation rules, capability rules | Import a provider SDK, a framework request object, or a filesystem API |
| Adapters | Everything platform-specific: OAuth, tokens, media delivery, publish calls, error mapping | Leak provider response shapes into the domain or UI |

## Modules

```text
src/
  app/                     routes (existing prototype shell to be re-pointed)
  components/              UI, including platform preview components
  lib/                     shared client-safe helpers and preview model
  server/                  server-only code (never imported by client components)
    modules/               domain modules — no framework or provider imports
      installation/        owner, settings, timezone
      auth/                sessions, password hashing, CSRF
      social-accounts/     connection state, token lifecycle, revocation
      posts/               posts, targets, overrides, status derivation
      media/               asset records, validation, storage interface
      scheduling/          due-job creation, cancellation, worker contract
      publishing/          orchestration, retries, attempt history, results
      ai/                  optional caption assistance
    adapters/
      db/                  Drizzle schema, migrations, repositories
      storage/             local filesystem media storage
      platforms/           one directory per platform
  worker/                  worker entry point and polling loop
```

*Proposed:* this layout is the Phase 0 output to be confirmed before code lands.
It keeps `src/server` out of the client bundle and keeps each domain module free of
framework imports.

## Dependency direction

```text
UI / routes  ->  domain modules  ->  domain contracts (interfaces)
                       ^
                       |
              infrastructure adapters
```

Domain modules define the interfaces they need. Adapters implement them. A domain
module never imports a concrete adapter, a Next.js request type, or a platform SDK.

## Provider interfaces

Each of these exists so v1.0 choices stay replaceable without touching domain logic.

| Interface | v1.0 implementation | Future (not planned work) |
|---|---|---|
| Persistence | SQLite via Drizzle repositories | PostgreSQL |
| Media storage | Local filesystem | S3-compatible object storage |
| Job scheduling | SQLite `scheduled_jobs` claimed in a transaction | External queue |
| Authentication | Single-owner local sessions | OAuth/SSO for hosted version |
| Social platform | One adapter per platform (ADR-0003) | More platforms |

Interfaces are introduced only where a real second implementation is plausible.
There is no generic repository layer over every table, and no abstraction for its own
sake.

## Preview contract

A normalized preview view model contains: platform identifier, optional account
identity, caption, ordered media metadata with preview URLs, parsed links/hashtags,
and a clearly simulated timestamp.

Previews render from that model alone. They must not require an access token, call a
platform API, or depend on a connected account.

## Publishing contract

A platform adapter exposes capability-aware operations:

- `getAccount()` — identity and status for display.
- `validate(post, target)` — platform rules, returns warnings and blocking errors.
- `publish(post, target)` — performs media delivery and publication.
- `refreshToken?()` — where the platform supports it.
- `normalizeError(err)` — maps provider errors to the internal error model.

Exact signatures are confirmed with the first adapter (Phase 4), not guessed now.

## Data flow: schedule a post

1. Studio submits content and selected destinations to a server action.
2. The web process validates content and the owner session.
3. `posts` persists the post and one `post_targets` row per destination.
4. `scheduling` creates one `scheduled_jobs` row per target.
5. The worker polls for due jobs and claims one inside a transaction.
6. It re-checks the target state and account connection.
7. The platform adapter publishes and returns a normalized result.
8. `publishing` writes a `publish_attempts` row and updates the target.
9. The post's status is derived from its targets.

Every step after 4 assumes the browser may be closed.

## Non-goals for v1.0

- Multi-user accounts, roles, invitations, or per-user isolation (ADR-0005).
- Public hosting, tunnels, or remote access (ADR-0004).
- Microservices, a message broker, or a container per adapter.
- Server-side rendering of a public marketing site.
- Native mobile apps.

## Avoid

- One post handler containing all platform logic.
- Platform conditionals spread across the UI; capability checks belong in adapters.
- Treating a multi-destination post as one indivisible network request.
- Using browser timers as the scheduler.
- Coupling preview rendering to OAuth state.
- Assuming a retry is harmless because it "just calls the API again".
