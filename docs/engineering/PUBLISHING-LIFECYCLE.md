# Publishing Lifecycle

A post sent to several accounts is a set of independent destination publications.
One destination can succeed while another fails, and a successful destination is
never repeated because a sibling failed.

## Post states

| State | Meaning |
|---|---|
| `DRAFT` | Never scheduled; editable |
| `SCHEDULED` | At least one future job exists |
| `PUBLISHING` | At least one target is in flight and none has finished |
| `PUBLISHED` | Every non-cancelled target is `PUBLISHED` |
| `PARTIALLY_PUBLISHED` | At least one `PUBLISHED` and at least one `FAILED`/`NEEDS_ATTENTION` |
| `FAILED` | No target succeeded and at least one failed |
| `CANCELLED` | Cancelled before any target began |

## Target states

| State | Meaning |
|---|---|
| `PENDING` | Created, not yet queued |
| `QUEUED` | A job exists with a future `runAt` |
| `PUBLISHING` | Claimed and in flight |
| `PUBLISHED` | Provider accepted the post; `platformPostId` stored when available |
| `FAILED` | Terminal error that retrying will not fix without owner action |
| `NEEDS_ATTENTION` | Outcome unknown, or retries exhausted — owner must decide |
| `CANCELLED` | Cancelled before the provider call began |

`NEEDS_ATTENTION` exists because some failures require a human: expired credentials,
missing permission, rejected media, or an ambiguous timeout where the post may exist.

## Transitions

```text
PENDING --schedule--> QUEUED --cancel--> CANCELLED
QUEUED  --claim-----> PUBLISHING
PUBLISHING --ok-----> PUBLISHED
PUBLISHING --transient error, attempts remaining--> QUEUED (future runAt)
PUBLISHING --permanent error--> FAILED
PUBLISHING --ambiguous outcome or attempts exhausted--> NEEDS_ATTENTION
FAILED / NEEDS_ATTENTION --owner retry--> QUEUED
```

Rules:

- Only `publishing` writes target state.
- `PUBLISHED` is terminal. No code path moves a published target back to `QUEUED`.
- A transition is applied with a conditional write on the expected previous state, so
  a duplicate worker cannot double-apply.
- Post status is recomputed after each target transition, from all of its targets.

## Scheduling flow

1. Owner selects destination accounts.
2. The web process validates content per destination and checks session ownership.
3. Post and targets are persisted.
4. One `scheduled_jobs` row per target is created with `runAt` in UTC.
5. The worker polls for due `PENDING` jobs.
6. It claims one by conditional update (see `DATABASE-SCHEMA.md`).
7. It re-checks target state, account connection, and content validity.
8. It calls the adapter.
9. It writes a `publish_attempts` row and the target transition.
10. It completes the job and, if retryable, creates the next `runAt` with backoff.

Publishing "now" uses the same path with `runAt` at the current instant. There is one
code path, not two.

## Worker requirements

- Runs as its own process, independent of any browser session.
- Recovers `CLAIMED` jobs whose lease expired after a crash.
- Default concurrency of one, because SQLite serializes writes anyway.
- Honors platform rate limits and stops on 429 rather than hammering.
- Bounded retries with exponential backoff and jitter; bounded attempt count.
- Full attempt history for every try.
- Manual retry available for `FAILED` and `NEEDS_ATTENTION`.
- Graceful shutdown: finish or release the current job, never abandon it silently.

## Error categories

| Category | Retry? | Typical target state |
|---|---|---|
| Authentication / authorization expired | No — owner reconnects | `FAILED` |
| Missing permission or ineligible account | No | `FAILED` |
| Invalid content (length, hashtags, format) | No | `FAILED` |
| Unsupported or invalid media | No | `FAILED` |
| Rate limited | Yes, after the stated reset | `QUEUED` |
| Provider 5xx / network failure before send | Yes, bounded | `QUEUED` |
| Timeout or connection loss after send | Not blind — reconcile or ask | `NEEDS_ATTENTION` |
| Unknown provider error | Once, then stop | `NEEDS_ATTENTION` |

Each normalized error carries a stable category, a safe user-facing message, a
retryability flag, and diagnostic metadata with no secrets.

## Duplicate prevention

The hard case is a provider accepting a post while Postaal loses the response.

- Every attempt records `started_at` before the provider call.
- On an ambiguous outcome, the attempt is stored as `UNCERTAIN`, and the target moves
  to `NEEDS_ATTENTION` rather than back to `QUEUED`.
- Where the provider exposes a reliable way to check whether the post exists (recent
  posts by the account, an idempotency key, a status endpoint), the worker reconciles
  before asking the owner.
- A restart never re-runs a `CLAIMED` job whose attempt already started; the lease
  expiry check must distinguish "crashed before send" from "crashed during send".
- Postaal does not promise exactly-once delivery. It promises never to retry blindly.

## Cancellation

Cancellation is guaranteed only before the provider call begins. Once a request is in
flight, the UI reports the real outcome instead of claiming the post was cancelled.
Cancelling a post cancels every `PENDING`/`QUEUED` job for it and marks those targets
`CANCELLED`.

## Verification before "supported"

A platform is only publish-capable when these have been exercised against a permitted
test account: success, invalid content, oversized media, expired token, rate limit,
provider error, and ambiguous timeout. See
[`SOCIAL-INTEGRATIONS.md`](SOCIAL-INTEGRATIONS.md).
