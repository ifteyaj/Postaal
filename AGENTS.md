# Agent Instructions

These instructions apply to AI coding agents working in this repository.

## Before starting

1. Read `README.md`.
2. Read the relevant product and engineering documents under `docs/`.
3. Inspect the existing codebase before proposing changes.
4. Identify assumptions and unresolved decisions. Do not silently turn proposals into locked decisions.

## Product context

Postaal is a self-hosted social media workspace. The MVP direction is:
- Studio for composing posts and uploading media.
- Realistic previews for supported social platforms.
- Draft management.
- Scheduling and calendar/queue management.
- Publishing through supported social integrations.
- AI caption assistance as an optional capability.

The target audience includes individual creators and businesses. Advanced enterprise collaboration, analytics, social listening, inbox management, and billing are outside the initial MVP.

## Engineering principles

- Prefer a modular monolith. Do not introduce microservices without an explicit decision.
- Keep domain logic independent of specific social API vendors.
- Keep preview rendering independent from OAuth credentials and publishing APIs.
- Model publication outcomes per destination. A partial failure must not erase successful results.
- Make background jobs persistent, retry-safe, observable, and idempotent.
- Store scheduled instants in UTC; display them using the user's configured timezone.
- Validate all external input at system boundaries.
- Keep secrets and OAuth tokens server-side only.
- Use strong TypeScript types and explicit error handling.
- Prefer small, reviewable changes over broad rewrites.
- Avoid unnecessary abstractions and speculative frameworks.

## Platform integration rules

Before implementing a connector:
1. Verify current official platform documentation.
2. Confirm supported account types and required permissions.
3. Confirm app review or approval requirements.
4. Confirm supported media types, sizes, aspect ratios, and publishing formats.
5. Confirm rate limits, token lifetime, refresh behavior, and error semantics.
6. Document limitations and test cases.

Never invent API capabilities or imply that a preview guarantees exact rendering on every device.

## Data and security rules

- Never commit `.env` files, credentials, access tokens, or private keys.
- Never expose provider tokens to browser code.
- Encrypt provider credentials at rest using a documented key-management approach.
- Do not log secrets, authorization codes, or full tokens.
- Validate actual uploaded file content, not just extensions or client-provided MIME types.
- Protect OAuth flows against CSRF/state tampering.
- Use authorization checks on every user-owned resource.
- Make retries safe against duplicate publication.

## Change workflow

For each task:
1. State the intended outcome and scope.
2. Inspect relevant files and conventions.
3. Implement the smallest complete change.
4. Add or update tests.
5. Run relevant checks.
6. Summarize changed files, validation performed, and known limitations.
7. Update documentation if behavior, architecture, setup, or decisions changed.

## Documentation maintenance

- Product behavior belongs in `docs/product/`.
- Architecture and technical contracts belong in `docs/engineering/`.
- UI rules belong in `docs/design/`.
- Sequencing belongs in `docs/roadmap/`; per-phase specifications belong in
  `docs/phases/`. Do not maintain a phase plan in both places.
- Consequential decisions belong in `docs/adr/`. The register in
  `docs/decisions/ARCHITECTURE-DECISIONS.md` indexes them and lists what is still
  unapproved; it must not restate ADR detail.
- Update `docs/roadmap/DEVELOPMENT-STATUS.md` whenever implementation progress
  changes, and add an entry to `docs/decisions/CHANGELOG.md` for notable changes.
- Keep `README.md` concise and navigational.
- Never silently change an accepted decision. Supersede it with a new ADR.
- Mark uncertain items as `Proposed`, `Open`, or `Needs validation`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
