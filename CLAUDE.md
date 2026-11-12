# Claude Code Project Guide

Read `AGENTS.md` first. It contains the repository-wide instructions and is the source of truth.

## How to work in Postaal

- Start by understanding the current implementation and the relevant docs.
- Work in small, independently verifiable steps.
- Do not scaffold the entire product in one pass.
- Do not add a social connector until its current official API requirements have been checked.
- Do not assume that all platforms support the same content formats or publishing operations.
- Keep the mockup engine usable without connected social accounts.
- Keep publishing state separate for every destination.
- Ask before making a decision that changes product scope, deployment model, data ownership, or security boundaries.

## Preferred implementation behavior

- TypeScript-first.
- Strict types at API and provider boundaries.
- Explicit validation and error handling.
- Tests for domain logic and critical workflows.
- Accessible, responsive UI.
- No fake success states for publishing.
- No placeholder integrations presented as working integrations.

## Definition of done

A task is not complete until:
- The requested behavior is implemented.
- Relevant tests or checks pass.
- Failure paths are considered.
- Documentation is updated when needed.
- The final summary states what changed and what remains incomplete.
