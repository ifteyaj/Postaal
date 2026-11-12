# Architecture Decision Records

Use an ADR for decisions that materially affect architecture, security, deployment,
data ownership, or long-term maintainability.

## Status vocabulary

- Proposed
- Accepted
- Superseded
- Rejected

## Naming

`NNNN-short-decision-title.md`

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-sqlite-database.md) | SQLite as the application database | Accepted |
| [0002](0002-local-filesystem-media.md) | Local filesystem media storage | Accepted |
| [0003](0003-direct-platform-apis.md) | Direct social platform API integrations | Accepted |
| [0004](0004-local-network-only-access.md) | Local-network-only access | Accepted |
| [0005](0005-single-owner-installation.md) | One owner per installation | Accepted |

A one-line register of these decisions, with the items still awaiting approval,
lives in [`docs/decisions/ARCHITECTURE-DECISIONS.md`](../decisions/ARCHITECTURE-DECISIONS.md).
The ADRs are the authoritative record; the register is an index and must not restate
ADR detail in a way that could drift.

## Template

Copy [`0000-template.md`](0000-template.md) for each new decision.

Do not edit an accepted ADR to rewrite history. Create a new ADR that supersedes it.
