# Product Roadmap

Phases are sequential. Each phase has a specification in `docs/phases/` with its own
acceptance criteria; this file only shows order, dependencies, and version direction.
Current progress lives in [`DEVELOPMENT-STATUS.md`](DEVELOPMENT-STATUS.md).

## Phase ladder

| Phase | Name | Spec | Depends on | Exit in one line |
|---|---|---|---|---|
| 0 | Architecture foundation | [PHASE-0](../phases/PHASE-0-FOUNDATION.md) | — | No blocking decision left open; schema and boundaries agreed |
| 1 | Application foundation | [PHASE-1](../phases/PHASE-1-APP-FOUNDATION.md) | 0 | Owner can sign in to a shell backed by SQLite |
| 2 | Content management | [PHASE-2](../phases/PHASE-2-CONTENT-MANAGEMENT.md) | 1 | A draft with media and previews persists across restarts |
| 3 | Publishing infrastructure | [PHASE-3](../phases/PHASE-3-PUBLISHING.md) | 2 | A scheduled job publishes reliably through a test adapter |
| 4 | Social integrations | [PHASE-4](../phases/PHASE-4-INTEGRATIONS.md) | 3 | One real platform publishes end to end, safely |
| 5 | Production readiness | [PHASE-5](../phases/PHASE-5-PRODUCTION-READY.md) | 4 | Install, upgrade, backup, and restore are documented and tested |

```text
Phase 0  decisions, schema, boundaries
   |
Phase 1  auth + database + shell
   |
Phase 2  Studio, previews, media, drafts, calendar, queue
   |
Phase 3  worker, jobs, retries, duplicate prevention
   |
Phase 4  adapters, one platform at a time
   |
Phase 5  packaging, backup, hardening
```

## Dependencies that can block progress

- **Instagram:** blocked until the public-media-URL problem is decided. Does not block
  Phases 0–3, or any other adapter.
- **Platform app review:** external. Phase 4 work on a given platform starts only when
  the owner can obtain the credentials and permissions that platform requires.
- **OAuth redirect rules:** must be verified per platform before adapter design.
- **Test accounts:** required before any adapter can be called validated.

## Milestones

| Milestone | Phase | Meaning |
|---|---|---|
| M0 — Foundation agreed | 0 | Reviews complete; initial schema migration ready to write |
| M1 — Private workspace | 1 | Real sign-in, real storage, no simulated state |
| M2 — Authoring complete | 2 | Composition, previews, media, drafts, scheduling UI |
| M3 — Reliable publishing | 3 | Worker proven against a stub adapter |
| M4 — First live platform | 4 | Real publishing on one platform, safely |
| M5 — v1.0 release | 5 | Installable, backed up, documented |

## Version direction

These are directions, not commitments, and none of them change v1.0 decisions.

- **v1.0:** single-owner, locally installed, SQLite, local media, direct APIs.
- **v1.x:** publishing reliability, additional validated platforms, preview coverage,
  optional AI captions, optional media-library improvements.
- **v2.0:** desktop distribution for Windows, macOS, Linux with install and update
  workflows.
- **v3.0:** optional remote or hosted deployment, PostgreSQL, object storage, remote
  access — each requiring a superseding ADR.
- **Later:** a hosted, multi-tenant service with real user isolation.

## Out of the roadmap

Analytics, social listening, inbox management, campaign tools, template marketplace,
billing, native mobile apps. See [`../product/MVP-SCOPE.md`](../product/MVP-SCOPE.md).
