# Phase 1 — Application Foundation

**Status:** Not started
**Depends on:** Phase 0 approved
**Blocks:** Phases 2–5

Step specifications:

| Step | Task | Status |
|---|---|---|
| 1 | [SQLite and Drizzle persistence](TASK-1-1-SQLITE-PERSISTENCE.md) | Proposed |

## Objective

Turn the prototype into a real, authenticated application backed by SQLite and the
local filesystem: owner sign-in, persistent storage, the app shell, and the settings
that later phases depend on. No publishing.

## Requirements

**Persistence**

- SQLite database created in the data directory with WAL, foreign keys, and a busy
  timeout.
- Migration workflow in place; the initial schema migration creates the tables in
  `docs/engineering/DATABASE-SCHEMA.md`.
- Repository/domain boundary: domain modules do not import the ORM directly.
- Timestamps stored as UTC; timezone comes from installation settings.

**Owner and session**

- First-run setup creates the single owner, then closes the route (ADR-0005).
- Password hashing, sign-in, sign-out, session expiry, and server-side invalidation.
- Session cookies `HttpOnly`, `SameSite`, `Secure` where applicable.
- CSRF protection on state-changing requests.
- Documented local password-recovery procedure.

**Media foundation**

- Media storage interface plus the local filesystem implementation (ADR-0002).
- Upload path with content validation, size limits, generated names, and a temporary
  directory.
- Authorized media-serving route; no static exposure of the media directory.

**Shell**

- Binding to loopback by default, with an explicit LAN mode (ADR-0004).
- App shell, sidebar, top bar, page header, and responsive layout retained from the
  prototype and re-pointed at real data.
- Settings: timezone, LAN mode warning, storage paths (read-only), connection status.
- Health endpoint for later use by Docker checks.

**Retirement of prototype state**

- Remove `localStorage` as the source of truth. `src/lib/app-store.ts` and
  `src/lib/storage.ts` must not remain in the data path.
- Keep the preview model and platform metadata; they are presentation concerns.

## Implementation steps

1. Add persistence: driver, connection with pragmas, migration runner, initial schema
   migration.
2. Add domain modules and repositories for installation settings and sessions.
3. Implement first-run setup and authentication end to end.
4. Implement the media storage interface and upload validation.
5. Wire the shell and settings to real data.
6. Delete the `localStorage` store from the data path; keep seed data only as a dev
   fixture.
7. Add integration tests for constraints, auth boundaries, and media paths.

## Affected modules

`installation`, `auth`, `media`, `adapters/db`, `adapters/storage`, `app/` shell and
settings routes.

## Acceptance criteria

- [ ] Starting with an empty data directory, setup creates exactly one owner.
- [ ] A second setup attempt is refused.
- [ ] Signing in, signing out, and session expiry behave correctly; logout invalidates
      the session server-side.
- [ ] An unauthenticated request for content or media fails.
- [ ] A request from another host on the LAN is refused in default mode.
- [ ] The initial schema migration applies to an empty database and
      `PRAGMA foreign_key_check` is clean.
- [ ] An oversized, spoofed, or traversal-named upload is rejected.
- [ ] No route returns token material or an absolute path.
- [ ] `localStorage` no longer holds application data.
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build` pass, plus the new tests.

## Testing requirements

Integration tests against a temporary database and media root: migrations, unique and
foreign-key constraints, setup-once, auth boundaries, upload validation, and media
access control. Unit tests for timezone conversion and password/session helpers.

## Out of scope

Posts, drafts, previews, scheduling, worker, platform adapters, Docker packaging.
