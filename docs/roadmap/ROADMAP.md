# Product Roadmap

## Phase 0: Product definition
**Status: Prepared**

- Product direction.
- PRD and MVP boundaries.
- User journeys.
- Domain model.
- Architecture direction.
- Risks and acceptance criteria.

## Phase 1: Foundation and Studio
**Next**

- Finalize stack and architecture decisions.
- Create application foundation.
- Configure linting, formatting, type checking, and tests.
- Implement authentication and installation settings.
- Implement core data model.
- Build Studio layout and composer.
- Build platform preview components with fixture data.
- Add media upload and validation.
- Implement draft persistence.

Exit: a user can create, save, reopen, and realistically preview a draft without needing a publishing integration.

## Phase 2: Scheduling foundation
- Add timezone-aware scheduling.
- Add calendar and queue UI.
- Add persistent job records and worker.
- Add cancellation and rescheduling.
- Test worker restart and duplicate prevention.

Exit: scheduled jobs are durable and observable, even before a production connector is enabled.

## Phase 3: First social connector
- Select connector based on API feasibility.
- Implement OAuth and account management.
- Implement capability-aware validation.
- Implement media upload and publishing.
- Add per-destination status and normalized errors.
- Test retries, token expiry, and partial failure.

Exit: one real supported platform can publish safely through Postaal.

## Phase 4: Additional connectors and AI
- Add further validated platform adapters.
- Add configurable AI provider.
- Add caption generation and refinement.
- Expand preview coverage and validation.

## Phase 5: Self-hosted release hardening
- Docker deployment.
- Setup and upgrade documentation.
- Backup/restore.
- Security review.
- Observability and operational diagnostics.
- Release checklist.

## Later
- Analytics.
- Team collaboration and approvals.
- Video workflows.
- Content templates.
- Advanced media library.
- More platforms.
