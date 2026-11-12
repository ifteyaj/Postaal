# Publishing Lifecycle

## Principle

A post sent to several social accounts is a collection of independent destination publications. One destination can succeed while another fails.

## Suggested post-level states

- `DRAFT`
- `SCHEDULED`
- `PUBLISHING`
- `PUBLISHED`
- `PARTIALLY_PUBLISHED`
- `FAILED`
- `CANCELLED`

## Suggested destination states

- `PENDING`
- `PUBLISHING`
- `SUCCESS`
- `FAILED`
- `CANCELLED`

## Conceptual flow

```text
DRAFT
  | schedule
  v
SCHEDULED
  | worker claims due destination jobs
  v
PUBLISHING
  |-- all destinations succeed ------> PUBLISHED
  |-- some succeed, some fail -------> PARTIALLY_PUBLISHED
  |-- all fail ----------------------> FAILED
  |-- user cancels before execution -> CANCELLED
```

Exact transition rules must be implemented as explicit domain logic and covered by tests.

## Worker expectations

1. Claim due work atomically.
2. Acquire a lease/lock to prevent concurrent processing.
3. Re-check that the destination is still eligible.
4. Confirm account authorization and content validity.
5. Call the provider adapter.
6. Persist provider response and normalized outcome.
7. Release the lock.
8. Retry only eligible transient failures with bounded backoff.

## Error categories

- Authentication/authorization.
- Permission or account eligibility.
- Invalid content.
- Unsupported media.
- Rate limit.
- Provider outage or network timeout.
- Unknown provider error.

Each normalized error should include a stable category, safe user-facing message, retryability, and diagnostic metadata that excludes secrets.

## Duplicate prevention

- Use a stable logical publication ID/idempotency key.
- Persist attempts and provider identifiers.
- Treat ambiguous timeouts carefully: the provider may have accepted the post even if the client did not receive the response.
- Where supported, query provider state before retrying an ambiguous operation.
- Never assume that retrying a network request is harmless.

## Cancellation

Cancellation is only guaranteed before a provider operation has begun. Once a request is in flight, report the actual outcome rather than promising cancellation.
