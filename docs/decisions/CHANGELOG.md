# Changelog

Notable changes to Postaal's requirements, architecture, and documentation. Feature
implementation progress lives in
[`../roadmap/DEVELOPMENT-STATUS.md`](../roadmap/DEVELOPMENT-STATUS.md).

Format: newest first. Dates are ISO (`YYYY-MM-DD`).

## Unreleased

### Added

- Task specification for the first Phase 1 step:
  [`docs/phases/TASK-1-1-SQLITE-PERSISTENCE.md`](../phases/TASK-1-1-SQLITE-PERSISTENCE.md)
  — SQLite and Drizzle foundation, initial schema migration, and its tests. Toolchain
  versions were installed and exercised before being specified.
- Documentation foundation: `docs/phases/` phase specifications, `docs/decisions/`
  register and changelog, `docs/engineering/DATABASE-SCHEMA.md`,
  `docs/roadmap/DEVELOPMENT-STATUS.md`.
- ADR-0001 through ADR-0005 recording the accepted v1.0 architecture decisions.

### Changed

- Documentation structure now separates phase specifications (`docs/phases/`) from
  the roadmap, and the decision index (`docs/decisions/`) from the ADRs.
- `docs/roadmap/PHASE-1-IMPLEMENTATION.md` was replaced by
  `docs/phases/PHASE-1-APP-FOUNDATION.md`; the old file is removed so the plan is not
  maintained twice.
- Architecture docs now describe SQLite, local media, a local-only binding, and a
  separate publishing worker. PostgreSQL, Redis/BullMQ, and S3 are no longer
  presented as the intended v1.0 stack.
- Post target states follow the publishing lifecycle (ADR and lifecycle doc), which
  uses `PUBLISHED` rather than the earlier `SUCCESS`.
- Product decisions record one owner per installation, closing the previous open
  question about multi-user support.
- `README.md` and `AGENTS.md` point at the new documentation locations.

### Removed

- PostgreSQL, Redis, BullMQ, and object-storage assumptions from the deployment,
  architecture, and testing documents.

## 2026-11-13

### Added

- Architecture Decision Record covering the four confirmed v1.0 choices (SQLite,
  local filesystem media, direct platform APIs, local-network-only access) plus the
  single-owner model.

### Notes

- Instagram's public media URL requirement was identified as the main conflict
  between local storage and platform publishing. It remains unresolved by design and
  must be decided before the Instagram adapter is built.
- OAuth callback requirements for a local-only installation remain unverified for
  each target platform.

## 2026-11-12

### Added

- `feat: implement Postaal frontend prototype` — Studio, platform previews, Calendar,
  Queue, Media Library, and Accounts screens using simulated data in `localStorage`.
- `chore: initialize Postaal project documentation` — PRD, MVP scope, user journeys,
  product decisions, architecture, domain model, publishing lifecycle, integrations,
  security, deployment, testing, design principles, roadmap, and ADR template.

### Notes

- The prototype is a UI and interaction reference only. It contains no
  authentication, database, file storage, OAuth, or real publishing.
