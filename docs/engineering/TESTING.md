# Testing Strategy

Tests target the things that break in a self-hosted publishing tool: state
transitions, duplicate publication, media handling, and timezone mistakes. The stack
these run against is decided in ADR-0001 to ADR-0005.

## Layers

### Unit tests

- Post status derivation from target statuses.
- Target transitions, including illegal-transition rejection.
- Platform content validation and character counting.
- Timezone conversion and DST edges when saving a schedule.
- Retry eligibility, backoff, and attempt caps.
- Provider error normalization.
- Upload validation: magic bytes, size, dimensions, traversal attempts.

### Integration tests

Run against a temporary SQLite file and a temporary media directory.

- Migrations apply to an empty database and produce the documented schema.
- Foreign keys and unique constraints reject the invalid cases in the schema doc.
- Repositories round-trip entities, including encrypted token fields.
- Media write, read, and delete within the temp root; path escapes are refused.
- Job claiming: two concurrent claims, exactly one wins.
- Worker recovery: a `CLAIMED` job with an expired lease is re-claimable; one with a
  started attempt is not.
- Session boundaries: unauthenticated content and media requests fail.
- Provider adapters against mocks or official sandboxes.

### End-to-end tests

- First-run setup, then a second setup attempt is refused.
- Compose, preview, save draft, reopen.
- Upload, validate, reorder media.
- Per-destination caption override changes only that preview.
- Schedule, reschedule, cancel.
- Publish "now" through the same path as a scheduled job.
- Partial success: one target `PUBLISHED`, one `FAILED`, post `PARTIALLY_PUBLISHED`.
- Retry an eligible failure without creating a duplicate.

## Critical reliability scenarios

| Scenario | Expected |
|---|---|
| Worker killed mid-poll | Job remains claimable after lease expiry |
| Two workers poll at once | One claim wins; the other does nothing |
| Provider accepts, response lost | Attempt `UNCERTAIN`, target `NEEDS_ATTENTION`, no auto-retry |
| One destination succeeds, one fails | Success preserved, post `PARTIALLY_PUBLISHED` |
| Token expires before publish | Target `FAILED` with a reconnect message, no retry loop |
| Post cancelled as worker polls | Either cancelled or published; never both claimed silently |
| Rate limit returned | Job rescheduled after reset, not retried in a loop |
| Invalid or oversized media | Rejected before any platform call |
| Owner timezone changes after scheduling | Stored UTC instant unchanged; display shifts |
| Disk full during upload | Upload fails cleanly, no partial asset row |

## Rules

- Never publish to a real account in automated tests. Mocks, sandboxes, or a dedicated
  test account only.
- Never put real credentials or tokens in fixtures.
- Assert that retries cannot duplicate a post; this is the highest-value test in the
  suite.
- Test authorization failure paths, not only happy paths.
- A phase is not complete until its acceptance criteria have an automated check or a
  documented manual verification.

## Commands

Existing prototype scripts:

```bash
npm run lint
npm run typecheck
npm run build
```

Test tooling is not installed yet. The runner choice belongs to Phase 1 and should be
recorded as part of the tooling decision, not added ad hoc per phase.
