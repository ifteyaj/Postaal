# Postaal

**Create once. Preview everywhere. Publish anywhere.**

Postaal is a self-hosted social media workspace for creators, freelancers,
businesses, and small teams. It brings content composition, realistic platform
previews, scheduling, and publishing into one application.

> **Project status:** v1.0 architecture foundation. A frontend prototype (Next.js
> App Router, TypeScript, Tailwind CSS) implements the Studio, live platform
> previews, Calendar, Queue, Media Library and Accounts with simulated data only —
> no authentication, database, OAuth, or real publishing. The v1.0 backend
> architecture is decided (SQLite, local media, direct platform APIs, local-network
> access); implementation is in Phase 0.

## Product direction

| Decision | Direction |
|---|---|
| Product | Postaal |
| Model | Self-hosted, one owner per installation |
| Audience | Individual creators and businesses |
| Differentiator | Realistic social platform mockups |
| MVP | Studio + scheduling + publishing |
| Architecture direction | Modular monolith, separate publishing worker |
| Deployment direction | Docker Compose |

## Core workflow

1. Complete first-run setup for the installation owner.
2. Connect supported social accounts.
3. Compose a post and add media.
4. Select publishing destinations.
5. Review realistic platform-specific previews.
6. Save as a draft, publish now, or schedule.
7. Track publishing results per destination.

## Frontend prototype

The app shell and Studio are implemented as a browser-only prototype. State lives in
`localStorage`; publishing and AI captions are local simulations and are labelled as
such in the UI.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build + typecheck
npm run lint
npm run typecheck
```

Key source paths: `src/app/(workspace)` (routes), `src/components/studio` (composer),
`src/components/previews` (per-platform preview engine), `src/lib` (domain types,
platform metadata, store).

## Documentation

Product

- [Product requirements](docs/product/PRD.md)
- [MVP scope](docs/product/MVP-SCOPE.md)
- [User journeys](docs/product/USER-JOURNEYS.md)
- [Product decisions](docs/product/DECISIONS.md)

Engineering

- [System architecture](docs/engineering/ARCHITECTURE.md)
- [Domain model](docs/engineering/DOMAIN-MODEL.md)
- [Database schema](docs/engineering/DATABASE-SCHEMA.md)
- [Publishing lifecycle](docs/engineering/PUBLISHING-LIFECYCLE.md)
- [Social integrations](docs/engineering/SOCIAL-INTEGRATIONS.md)
- [Security](docs/engineering/SECURITY.md)
- [Deployment](docs/engineering/DEPLOYMENT.md)
- [Testing strategy](docs/engineering/TESTING.md)

Roadmap and phases

- [Roadmap](docs/roadmap/ROADMAP.md)
- [Development status](docs/roadmap/DEVELOPMENT-STATUS.md)
- [Phase 0 — Architecture foundation](docs/phases/PHASE-0-FOUNDATION.md)
- [Phase 1 — Application foundation](docs/phases/PHASE-1-APP-FOUNDATION.md)
  - [Task 1.1 — SQLite persistence foundation](docs/phases/TASK-1-1-SQLITE-PERSISTENCE.md)
- [Phase 2 — Content management](docs/phases/PHASE-2-CONTENT-MANAGEMENT.md)
- [Phase 3 — Publishing](docs/phases/PHASE-3-PUBLISHING.md)
- [Phase 4 — Integrations](docs/phases/PHASE-4-INTEGRATIONS.md)
- [Phase 5 — Production ready](docs/phases/PHASE-5-PRODUCTION-READY.md)

Decisions and reference

- [Architecture decision register](docs/decisions/ARCHITECTURE-DECISIONS.md)
- [Architecture decision records](docs/adr/README.md)
- [Changelog](docs/decisions/CHANGELOG.md)
- [Glossary](docs/GLOSSARY.md)
- [UI/UX principles](docs/design/UI-UX-PRINCIPLES.md)

## Development status

See [DEVELOPMENT-STATUS.md](docs/roadmap/DEVELOPMENT-STATUS.md) for the current phase,
completed work, and blockers. Do not assume a feature is implemented because it
appears in the requirements.

## Working agreements

- Read `AGENTS.md` before making changes.
- Keep `CLAUDE.md` aligned with `AGENTS.md` if Claude Code-specific instructions change.
- Update relevant docs when product behavior or architecture changes.
- Record consequential technical decisions as ADRs.
- Never claim a social platform integration is supported until its API permissions,
  account eligibility, media rules, and publishing behavior have been verified.
