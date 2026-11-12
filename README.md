# Postaal

**Create once. Preview everywhere. Publish anywhere.**

Postaal is a self-hosted social media workspace for creators, freelancers, businesses, and small teams. It brings content composition, realistic platform previews, scheduling, and publishing into one application.

> Project status: Product direction locked. A **frontend prototype** (Next.js App Router, TypeScript, Tailwind CSS) now implements the Studio, live platform previews, Calendar, Queue, Media Library and Accounts with simulated data only — no authentication, database, OAuth or real publishing. Engineering decisions for the backend remain to be finalized.

## Product direction

| Decision | Direction |
|---|---|
| Product | Postaal |
| Model | Self-hosted |
| Audience | Individual creators and businesses |
| Differentiator | Realistic social platform mockups |
| MVP | Studio + scheduling + publishing |
| Architecture direction | Modular monolith |
| Deployment direction | Docker-based |

## Core workflow

1. Connect supported social accounts.
2. Compose a post and add media.
3. Select publishing destinations.
4. Review realistic platform-specific previews.
5. Save as a draft, publish now, or schedule.
6. Track publishing results per destination.

## Frontend prototype

The app shell and Studio are implemented as a browser-only prototype. State lives in `localStorage`; publishing and AI captions are local simulations and are labelled as such in the UI.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build + typecheck
npm run lint
npm run typecheck
```

Key source paths: `src/app/(workspace)` (routes), `src/components/studio` (composer), `src/components/previews` (per-platform preview engine), `src/lib` (domain types, platform metadata, store).

## Documentation

- [Product requirements](docs/product/PRD.md)
- [MVP scope](docs/product/MVP-SCOPE.md)
- [User journeys](docs/product/USER-JOURNEYS.md)
- [Product decisions](docs/product/DECISIONS.md)
- [System architecture](docs/engineering/ARCHITECTURE.md)
- [Domain model](docs/engineering/DOMAIN-MODEL.md)
- [Publishing lifecycle](docs/engineering/PUBLISHING-LIFECYCLE.md)
- [Social integrations](docs/engineering/SOCIAL-INTEGRATIONS.md)
- [Security](docs/engineering/SECURITY.md)
- [Deployment](docs/engineering/DEPLOYMENT.md)
- [Testing strategy](docs/engineering/TESTING.md)
- [UI/UX principles](docs/design/UI-UX-PRINCIPLES.md)
- [Roadmap](docs/roadmap/ROADMAP.md)
- [Implementation plan](docs/roadmap/PHASE-1-IMPLEMENTATION.md)
- [Architecture decision records](docs/adr/README.md)

## Development status

See [ROADMAP.md](docs/roadmap/ROADMAP.md). Do not assume a feature is implemented because it appears in the requirements.

## Working agreements

- Read `AGENTS.md` before making changes.
- Keep `CLAUDE.md` aligned with `AGENTS.md` if Claude Code-specific instructions change.
- Update relevant docs when product behavior or architecture changes.
- Record consequential technical decisions as ADRs.
- Never claim a social platform integration is supported until its API permissions, account eligibility, media rules, and publishing behavior have been verified.
