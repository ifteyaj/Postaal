# Product Decisions

Confirmed product direction. Architecture decisions live in
[`../decisions/ARCHITECTURE-DECISIONS.md`](../decisions/ARCHITECTURE-DECISIONS.md) and
the ADRs under [`../adr/`](../adr/README.md); this file does not restate them.

## Locked

| ID | Decision | Value |
|---|---|---|
| PD-001 | Product name | Postaal |
| PD-002 | Business model | Self-hosted |
| PD-003 | Target audience | Individual creators and businesses |
| PD-004 | Mockup engine | Realistic platform-specific previews |
| PD-005 | First version | Studio + scheduling + publishing |
| PD-006 | Product direction | Social media workspace, not only a scheduler |
| PD-007 | Architecture direction | Modular monolith |
| PD-008 | Deployment direction | Docker-based self-hosting |
| PD-009 | Installation ownership | One owner per installation (ADR-0005) |
| PD-010 | Access model | Local network only in v1.0 (ADR-0004) |

## Open product questions

- Which platform is the first real publishing connector?
- Which platform previews are required in the first shippable release?
- Is media library reuse (assets independent of one post) a v1.0 must or a
  should-have?
- Should Postaal support multiple accounts on the same platform in v1.0, where the
  platform permits it?
- Is AI caption generation in v1.0, or deferred until the manual workflow is stable?

## Resolved

- ~~Should a single installation support multiple independent users, or one owner
  with invited members?~~ One owner per installation (PD-009).
- ~~Is registration open, invite-only, or disabled by default?~~ There is no
  registration. First-run setup creates the single owner and then closes; see
  ADR-0005.
- ~~Should local media storage be enabled by default, with S3-compatible storage
  optional?~~ Local filesystem storage is the only v1.0 media backend (ADR-0002).

## Not product decisions

Technology choices are not recorded here. The stack as it stands is in
[`../engineering/ARCHITECTURE.md`](../engineering/ARCHITECTURE.md), with confirmed
decisions in ADRs and everything else marked as a recommendation or open item.
