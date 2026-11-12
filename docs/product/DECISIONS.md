# Product Decisions

This file records confirmed product direction. Technical proposals are tracked separately until explicitly approved.

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

## Open product questions

- Should a single installation support multiple independent users at launch, or one owner with invited members?
- Is registration open, invite-only, or disabled by default?
- Which platform is the first real publishing connector?
- Which platform preview components are required for the first visual prototype?
- Should local media storage be enabled by default, with S3-compatible storage optional?

## Proposed, not locked

- PostgreSQL.
- Prisma or Drizzle.
- Auth.js or another self-hostable authentication solution.
- Redis + BullMQ.
- Next.js App Router, React, TypeScript, Tailwind, shadcn/ui.
- Local and S3-compatible storage adapters.
- Configurable AI provider adapters.

Do not treat the proposed list as an approved final stack until an architecture decision is recorded.
