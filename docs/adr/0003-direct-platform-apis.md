# ADR-0003: Direct social platform API integrations

- Status: Accepted
- Date: 2026-11-13
- Deciders: Project owner
- Replaces: any assumption that a unified publishing provider is required

## Context

Postaal could publish through a unified third-party publishing API or by talking to
each platform directly. A unified provider would reduce integration work but adds a
recurring cost, an external dependency in the critical path, and a vendor limit on
which content types and account types are supported. The product principle is that
one installation is self-contained.

## Options considered

### Option A — Unified publishing provider

- Benefits: one integration, one OAuth surface, provider handles platform drift.
- Costs: subscription or per-post pricing, a third party holding tokens, coverage
  limited to that vendor's supported platforms and features.
- Risk: the product's differentiator (platform-accurate control) becomes someone
  else's roadmap.

### Option B — Direct platform APIs (selected)

- Benefits: no subscription, full control over payloads and error handling, tokens
  never leave the installation.
- Costs: one adapter per platform, each with its own OAuth, media, and error flow.
- Risk: platform API changes, app review requirements, and permission limits are
  ongoing maintenance work.

## Decision

Postaal integrates directly with each supported platform. Each platform is an
independent adapter behind a common internal contract. There is no unified
publishing provider in the critical path.

## Implementation rules

- The domain and UI depend on Postaal's own types, never on provider SDK objects.
- Adapters own: authorization, callback handling, token refresh, account identity,
  content validation, media delivery, publish call, response mapping, rate-limit
  handling, and error normalization.
- Media delivery is platform-specific. There is no shared "upload file" helper that
  pretends every platform accepts the same flow.
- Tokens are encrypted at rest, kept server-side, and never returned to the browser.
- Feasibility for a platform is verified and documented before its adapter is
  written; a platform is not "supported" until an end-to-end publish succeeds on a
  permitted test account.
- Adapters are added one at a time. A partially working adapter is not merged as
  "supported".

## Consequences

- Phase 4 is the largest and least predictable phase; it must not start until the
  worker from Phase 3 is reliable.
- Application review and permission approval are external dependencies the project
  cannot schedule.
- Platform API changes are expected maintenance, not defects.
- Preview fidelity and publishing capability are separate concerns; a preview can
  exist for a platform with no adapter.

## Validation

- Phase 4: each adapter passes authorization, validation, media, publish, token
  expiry, rate-limit, and failure tests before being marked supported.
- `docs/engineering/SOCIAL-INTEGRATIONS.md` records the verified API surface and
  research date for each platform.
