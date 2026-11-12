# Phase 4 — Social Integrations

**Status:** Not started
**Depends on:** Phase 3 (worker reliable)
**Blocks:** Phase 5 (release gate)

## Objective

Publish to real platforms, one adapter at a time, each validated end to end before the
next begins. This phase is deliberately sequential: a partially working adapter is not
shipped as "supported".

## Requirements

**Pre-work (per platform)**

- Complete the feasibility checklist in
  `docs/engineering/SOCIAL-INTEGRATIONS.md` and record it in a per-platform note with a
  research date and links to official docs.
- Confirm account eligibility, required scopes, app review, media rules, rate limits,
  token lifetime, error semantics, and redirect URI rules.
- Confirm a permitted test account exists.

**Account connection**

- OAuth flow with `state` validation and PKCE where supported.
- Tokens encrypted at rest with `TOKEN_ENCRYPTION_KEY`; never sent to the browser.
- Account identity stored for display; multiple accounts per platform only if approved
  in Phase 0.
- Disconnect revokes or deletes credentials and preserves published history.
- `needs_reauth` surfaced when a token expires or is revoked.

**Adapter**

- Implements the contract: `getAccount`, `validate`, `publish`, optional
  `refreshToken`, `normalizeError`.
- Capability model per account type, not per platform.
- Platform-specific media delivery — no shared upload assumption.
- Maps provider errors into Postaal categories with correct retryability.
- Reconciliation where the platform supports checking a post after an ambiguous
  outcome.

**Publishing behaviour**

- Text and image posts within documented platform limits.
- Validation messages name the platform and the rule.
- Unsupported combinations are blocked before a job is created.

## Implementation steps

1. Choose the first platform after the feasibility check; record the choice as an ADR.
2. Implement OAuth and account management for that platform.
3. Implement validation and media delivery.
4. Implement publish, error mapping, and reconciliation.
5. Test every failure category on a permitted test account.
6. Mark the platform supported in the UI and documentation, with known limits.
7. Repeat for the next platform, reusing lessons but not coupling the adapters.

## Affected modules

`social-accounts`, `platforms/<platform>`, `publishing` (reconciliation hooks),
`app/accounts` routes.

## Acceptance criteria

- [ ] Token material never reaches the browser, logs, or error messages.
- [ ] A permitted test account connects, publishes text and an image, and disconnects.
- [ ] Invalid content is blocked before any job is created.
- [ ] Expired or revoked tokens produce `FAILED` with a reconnect action, not a retry
      loop.
- [ ] A rate-limit response reschedules instead of failing the post.
- [ ] A timeout after send results in `NEEDS_ATTENTION`, with reconciliation attempted
      where the platform supports it.
- [ ] No duplicate post is created by retry or restart.
- [ ] Documentation states verified limits, permissions, and known gaps.

## Testing requirements

Integration tests with recorded fixtures for validation, error mapping, and token
refresh. Manual, documented verification against a real test account per platform — this
is required evidence, not optional. Automated tests never post to a real account.

## Out of scope

Platforms that fail the feasibility check. Instagram, until its media-delivery decision
is recorded. Video publishing. Provider-native scheduling.

## Blocking issue

Instagram requires media at a publicly reachable HTTPS URL (ADR-0002, ADR-0004). Do not
start its adapter until an ADR resolves this. Deferring Instagram does not block the
phase.
