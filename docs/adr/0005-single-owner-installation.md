# ADR-0005: One owner per installation

- Status: Accepted
- Date: 2026-11-13
- Deciders: Project owner

## Context

`docs/product/DECISIONS.md` left an open question: should an installation support
multiple independent users, or one owner with invited members? The answer changes
the domain model, authorization rules, and every query that scopes data.

## Options considered

### Option A — Multi-user installation with roles

- Benefits: closer to team products; supports agencies immediately.
- Costs: user tables, invitations, role checks, per-resource ownership checks, and
  test coverage for isolation on every route.
- Risk: significant scope growth before a single connector works.

### Option B — One owner per installation (selected)

- Benefits: no ownership ambiguity, no invitation flow, simpler authorization, and
  a domain model that matches the actual audience for v1.0.
- Costs: a business that wants two operators runs two installations, or shares one
  owner account.
- Risk: retrofitting multi-user later touches authorization everywhere, which is why
  ownership checks must still be written now even though there is one owner.

## Decision

An installation has exactly one owner. There are no teams, invitations, workspaces,
or per-user data isolation in v1.0.

## Implementation rules

- `InstallationSettings` is a single row holding the owner's email, password hash,
  and timezone. It is not a user table.
- Every table that holds owner content is conceptually owner-scoped. Even with one
  owner, server code must authorize the session before touching content rather than
  assuming a trusted caller.
- Never add a `userId` column "for later". Ownership is expressed through the
  installation, and any future multi-user work requires a new ADR.
- Setup runs once. A completed installation must not expose an open registration or
  setup route.
- Password recovery is a documented local procedure, not an emailed link.

## Consequences

- Product language says "the owner", not "users" or "members".
- Team collaboration and approvals stay out of the MVP, consistent with
  `docs/product/MVP-SCOPE.md`.
- The v3.0 hosted, multi-tenant direction will require this decision to be
  superseded, not quietly extended.
- Authorization tests still exist, because "single owner" means one identity, not
  "no authorization".

## Validation

- Phase 1: first-run setup creates exactly one owner and then closes the setup route.
- Phase 1: an unauthenticated request for post or media data is rejected.
- Phase 1: a second setup attempt is refused.
