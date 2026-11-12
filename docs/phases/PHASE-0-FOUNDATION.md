# Phase 0 — Architecture Foundation

**Status:** In progress (documentation complete, decisions partly open)
**Depends on:** nothing
**Blocks:** every other phase

## Objective

Settle the decisions, structure, and conventions that later phases build on, so no
phase has to invent architecture mid-implementation. Phase 0 writes documents and
configuration, not features.

## Requirements

**Decisions**

- Four confirmed choices are recorded as ADRs: SQLite, local media, direct platform
  APIs, local-network-only access. **Done** (ADR-0001 to ADR-0004).
- Single-owner installation is recorded as a decision. **Done** (ADR-0005).
- ORM and migration tool are decided and recorded.
- Single-owner authentication approach is decided and recorded.
- ID and timestamp representation are confirmed.
- The `post_media` question (media reuse in v1.0) is answered.

**Structure**

- Module boundaries and dependency direction are agreed
  (`docs/engineering/ARCHITECTURE.md`).
- The `src/server` split (domain modules, adapters, worker) is confirmed.
- Physical schema is frozen as the initial schema migration target
  (`docs/engineering/DATABASE-SCHEMA.md`).
- Worker contract is agreed: claim, lease, attempt, retry, recovery
  (`docs/engineering/PUBLISHING-LIFECYCLE.md`).

**Configuration and conventions**

- `.env.example` matches the decided stack — no `REDIS_URL`, no S3 variables unless a
  future adapter is planned, plus data-directory and bind settings.
- Data directory layout is documented and reflected in `.gitignore`.
- Lint, typecheck, build, and test commands are defined; test tooling is chosen.
- Commit and branch conventions, and the "one small change at a time" workflow, are
  agreed.
- Documentation structure is agreed: product, engineering, design, roadmap, phases,
  decisions, ADRs.

## Implementation steps

1. Review this documentation set; resolve comments and contradictions.
2. Write the ORM/migration ADR.
3. Write the auth ADR (hashing, sessions, CSRF, recovery).
4. Confirm schema conventions; update `DATABASE-SCHEMA.md` from *Proposed* to settled.
5. Confirm module layout in `ARCHITECTURE.md`.
6. Update `.env.example` and any config documentation.
7. Record the Phase 0 closeout in `docs/decisions/CHANGELOG.md` and
   `DEVELOPMENT-STATUS.md`.

## Affected modules

None. Files touched are documentation and `.env.example` only.

## Acceptance criteria

- [ ] Every "Awaiting approval" row in
      `docs/decisions/ARCHITECTURE-DECISIONS.md` is closed or has a dated owner and a
      phase by which it must close.
- [ ] ADRs exist for the ORM and authentication choices.
- [ ] `DATABASE-SCHEMA.md` contains no unresolved *Proposed* item needed by
      the initial schema migration.
- [ ] `.env.example` lists only variables the decided architecture uses.
- [ ] Phase specifications 0–5 are reviewed and approved.
- [ ] No application feature code was written during Phase 0.

## Testing requirements

Documentation review only. Verification is:

- Every internal documentation link resolves.
- No document contradicts an accepted ADR; `grep` for the retired stack terms
  (PostgreSQL, Redis, BullMQ, S3) returns only historical or explicitly-excluded
  references.
- Each phase document has testable acceptance criteria.

## Out of scope

Anything that runs: database creation, migrations, authentication code, worker,
Docker files.
