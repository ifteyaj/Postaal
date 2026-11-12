# Development Status

**Updated:** 2026-11-13
**Current phase:** Phase 0 — Architecture foundation (in progress, near exit)
**Next task:** Close Phase 0 (see [Next task](#next-task))

Update this file whenever implementation progress changes.

## Where the project actually is

Postaal has a finished documentation set, a decided v1.0 architecture, and a
clickable frontend prototype. It has **no backend**: no authentication, no database,
no file storage, no OAuth, and no publishing. The prototype stores everything in
`localStorage` and simulates publishing.

The prototype was built before the phase sequence was locked, so it sits ahead of
Phases 1 and 2 in UI terms while those phases are otherwise unstarted. Treat it as
reusable presentation code, not as completed phase work.

## Completed

| Item | Evidence |
|---|---|
| Product direction and boundaries | `docs/product/PRD.md`, `MVP-SCOPE.md`, `USER-JOURNEYS.md` |
| v1.0 architecture decisions | ADR-0001 to ADR-0005 in `docs/adr/` |
| Decision register with open items | `docs/decisions/ARCHITECTURE-DECISIONS.md` |
| Logical domain model | `docs/engineering/DOMAIN-MODEL.md` |
| Target database schema | `docs/engineering/DATABASE-SCHEMA.md` |
| Publishing lifecycle and failure model | `docs/engineering/PUBLISHING-LIFECYCLE.md` |
| Security requirements | `docs/engineering/SECURITY.md` |
| Deployment and backup target | `docs/engineering/DEPLOYMENT.md` |
| Phase specifications 0–5 | `docs/phases/` |
| Frontend prototype (UI reference) | `src/app/(workspace)`, `src/components`, `src/lib` |

## In progress — Phase 0

Phase 0 is documentation and decisions only. Remaining items:

| Item | State |
|---|---|
| Phase specs reviewed and approved | Awaiting review |
| ORM and migration tool decided | Open — Drizzle recommended |
| Owner authentication approach decided | Open |
| ID and timestamp representation confirmed | Open — UUID/epoch ms proposed |
| Media reuse decided (`post_media` vs `postId`) | Open |
| `.env.example` aligned with decided stack | Pending — still lists `REDIS_URL` and S3 keys |
| Module boundaries and worker contract confirmed | Proposed in `ARCHITECTURE.md` |
| Instagram media-delivery approach | Deferred — must close before Phase 4 |

## Not started

Phases 1–5. No application code, migration, test, or Docker configuration exists yet.

The prototype introduces two things that must be deliberately retired in Phase 1:
`src/lib/app-store.ts` and `src/lib/storage.ts` (the `localStorage` store). The preview
model and platform metadata in `src/lib/` are intended to survive.

## Blockers and risks

- **Platform approvals are external.** Phase 4 timing depends on app review and
  permission grants the project cannot schedule.
- **Instagram is blocked by design** until its public-media-URL requirement is
  resolved. It does not block Phases 0–3 or other platforms.
- **Prototype drift.** If the prototype evolves while the backend is built, the two
  divergent data models will slow Phase 2. Freeze UI features until they are
  re-pointed at real persistence.
- **No test runner installed.** The tooling choice is part of Phase 1, not a per-phase
  improvisation.

## Next task

**Close Phase 0** — a decisions-and-config task with no application features:

1. Record the ORM/migration ADR (Drizzle recommended) and the single-owner auth ADR.
2. Confirm ID and timestamp representation and the `post_media` decision, then freeze
   `DATABASE-SCHEMA.md` as the initial schema migration target.
3. Rewrite `.env.example` to match ADR-0001/0002/0004: drop `REDIS_URL` and the S3
   variables, add data-directory and bind-host settings, keep `TOKEN_ENCRYPTION_KEY`
   and `AUTH_SECRET`.
4. Get these phase specifications reviewed and approved.

**Then:** Phase 1, step 1 — install the persistence foundation (SQLite with WAL and
foreign keys, Drizzle migrations, the initial schema migration covering the tables in
the schema document, and integration tests proving the constraints hold). No UI work in
that step. Specification:
[`../phases/TASK-1-1-SQLITE-PERSISTENCE.md`](../phases/TASK-1-1-SQLITE-PERSISTENCE.md).

## Definition of done for any task

Requested behaviour implemented, checks run, failure paths considered, relevant docs
updated, and the summary states what changed and what remains incomplete.
