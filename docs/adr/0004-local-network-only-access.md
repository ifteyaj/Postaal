# ADR-0004: Local-network-only access

- Status: Accepted
- Date: 2026-11-13
- Deciders: Project owner
- Constrains: deployment, authentication, OAuth callbacks, media delivery

## Context

Postaal holds the owner's unpublished content, media, and social account tokens. It
is not a multi-tenant service and has no operator to run public infrastructure. The
simplest way to keep that material private is to keep the application off the public
internet.

## Options considered

### Option A — Publicly hosted installation

- Benefits: usable from anywhere, straightforward OAuth redirect URIs, easy to hand
  media URLs to platforms.
- Costs: public attack surface, TLS and domain management, patching expectations,
  and a hosting bill for a single-user tool.
- Risk: a self-hosted app exposed publicly with tokens inside is a high-value target.

### Option B — Local network only (selected)

- Benefits: no public attack surface, no domain or certificate required for the app,
  no hosting cost, private by default.
- Costs: no remote access; some platform flows assume a publicly reachable origin.
- Risk: if LAN access is enabled, other devices on the network are not automatically
  trusted.

## Decision

Postaal binds to loopback by default and is reachable only from the owner's machine.
LAN binding is an explicit, documented opt-in with a clear warning. Postaal never
opens a public tunnel, never configures port forwarding, and never requires a public
domain to operate.

Local-only means *inbound*. Postaal still makes outbound HTTPS calls to platform APIs.

## Implementation rules

- Default bind: `127.0.0.1`. A LAN mode changes the bind address and must be visible
  in settings and documentation.
- Owner authentication is required even on loopback; there is no "trusted network"
  bypass.
- Session cookies are HTTP-only, `SameSite=Lax` or stricter, and marked `Secure`
  when served over HTTPS.
- State-changing requests are protected against CSRF.
- Never surface absolute filesystem paths in API responses or error messages.
- Do not add analytics, telemetry, or remote asset loading by default.

## OAuth callback consequence

Account connection still needs a redirect back into the application. Each provider's
redirect rules must be verified per platform before that adapter is built; the
callback may be loopback-only, or may require a registered HTTPS URL. This is
resolved per adapter and is **not** solved by exposing the whole application.

## Media delivery consequence

Platforms that require media at a public HTTPS URL (Instagram) cannot be served from
a local-only installation without an additional scoped decision. That decision is
tracked as open in `docs/decisions/ARCHITECTURE-DECISIONS.md` and blocks only the
affected adapter.

## Consequences

- No remote publishing management in v1.0. This is an accepted product limit.
- The owner is responsible for host security, OS updates, and disk encryption.
- LAN mode requires documentation covering authentication and trust assumptions.
- Hosted or remote access becomes a v3.0 conversation, not a v1.0 change.

## Validation

- Phase 1: a request from another host on the LAN is refused in default mode.
- Phase 1: unauthenticated requests to application routes and media routes fail.
- Phase 4: each adapter's redirect URI is verified against provider requirements.
- Phase 5: the security checklist confirms no public exposure path is enabled by
  default.
