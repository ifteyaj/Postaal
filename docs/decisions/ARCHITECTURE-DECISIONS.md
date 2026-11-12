# Architecture Decisions

**Status:** v1.0 architecture foundation
**Updated:** 2026-11-13

This register lists decisions that are settled for v1.0 and the items that are
still open. Each settled decision has an ADR in `docs/adr/` that holds the context,
the alternatives, and the implementation rules. This file is an index — if the two
ever disagree, the ADR wins.

## Settled

| ID | Decision | ADR | What it constrains |
|---|---|---|---|
| AD-001 | Database: SQLite | [ADR-0001](../adr/0001-sqlite-database.md) | Persistence, migrations, worker locking, backups |
| AD-002 | Media: local filesystem | [ADR-0002](../adr/0002-local-filesystem-media.md) | Uploads, media serving, backups, Instagram gating |
| AD-003 | Publishing: direct platform APIs | [ADR-0003](../adr/0003-direct-platform-apis.md) | Adapter boundaries, OAuth ownership, Phase 4 scope |
| AD-004 | Access: local network only | [ADR-0004](../adr/0004-local-network-only-access.md) | Binding, sessions, OAuth callbacks, media delivery |
| AD-005 | Ownership: one owner per installation | [ADR-0005](../adr/0005-single-owner-installation.md) | Domain model, authorization, setup flow |

These are product constraints for v1.0, not temporary defaults. Changing one needs a
new ADR that supersedes the old one — never a silent edit.

## Consequences carried forward

- **Two processes, one data directory.** A web process and a publishing worker share
  `postaal.db` and `/app/media`. The worker is a separate process, not a service.
- **No queue server.** Scheduled work is a SQLite table claimed inside a transaction.
  Job locking is SQL, and default worker concurrency is one.
- **No object storage, no Redis, no external database** in v1.0.
- **Media is private by default.** Files are served only through an authorized route.
- **Publishing coverage is uneven by nature.** Instagram needs media at a public
  URL; the other target platforms accept uploads initiated by the adapter.

## Awaiting approval

| Open item | Why it matters | Proposed next step |
|---|---|---|
| ORM and migration tooling | Every later phase builds on the schema and migration workflow | Record an ADR; Drizzle ORM is the recommendation, not yet a decision |
| Owner authentication mechanism | Sessions, hashing, CSRF, and password recovery all depend on it | Record an ADR for a single-owner, self-hosted session approach |
| Instagram media delivery | Blocks the Instagram adapter entirely (AD-002, AD-004) | Decide before Phase 4 starts: scoped temporary relay, or delay Instagram |
| OAuth callback strategy per platform | A local-only install may not satisfy every provider's redirect rules | Verify per provider, starting with the first connector |
| First platform to implement | Determines adapter contract detail and test accounts | Choose after a feasibility check of API access and review requirements |
| Worker polling, locking, and retry parameters | Affects duplicate prevention and recovery behavior | Specify in Phase 3 against the lifecycle doc, then implement |
| Backup encryption and key handling | A backup without the token encryption key is incomplete | Specify in Phase 5 alongside the restore procedure |
| AI caption provider | Optional capability; must not sit in the publishing path | Keep out of scope until Phase 2 content work is stable |

## Explicitly not decided by this register

Direct API publishing (AD-003) does not guarantee that a platform approves access,
grants the needed permissions, or permits every content type. Account eligibility,
app review, and API costs must be verified per platform and recorded in
`docs/engineering/SOCIAL-INTEGRATIONS.md`.
