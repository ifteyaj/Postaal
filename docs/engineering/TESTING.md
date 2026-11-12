# Testing Strategy

## Testing layers

### Unit tests
- Post status transition rules.
- Platform content validation.
- Character counting helpers.
- Timezone conversion.
- Retry eligibility and backoff calculation.
- Idempotency-key generation.
- Provider error normalization.

### Integration tests
- Database repositories.
- Authentication and authorization boundaries.
- Media storage adapters.
- Queue persistence and worker claiming.
- Token encryption/decryption.
- Provider adapters using mocks or official sandbox/test accounts.

### End-to-end tests
- Compose and save draft.
- Edit platform-specific caption.
- Upload and reorder media.
- Preview selected destinations.
- Schedule and reschedule.
- Cancel before execution.
- Publish to a test destination.
- Inspect partial success and failure.
- Retry eligible failures.

## Critical reliability scenarios

- Worker restarts while jobs are queued.
- Two workers attempt to claim the same job.
- Provider accepts a post but the network response times out.
- One destination succeeds and another fails.
- Token expires before publication.
- User cancels a scheduled post near execution time.
- Platform rate limit is returned.
- Invalid media is submitted.
- User timezone changes after scheduling.

## Test rules

- Do not publish to real user accounts in automated tests.
- Use provider mocks, sandboxes, or dedicated test accounts.
- Never use real credentials in fixtures.
- Assert that retries cannot create duplicate posts.
- Test authorization failures, not only happy paths.
