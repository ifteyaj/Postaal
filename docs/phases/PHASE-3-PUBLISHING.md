# Phase 3 — Publishing Infrastructure

**Status:** Not started
**Depends on:** Phase 2
**Blocks:** Phase 4

## Objective

Build the worker and the publishing orchestration that makes scheduled work real and
durable, proven against a stub adapter. Reliability is the deliverable here; platform
support is Phase 4.

## Requirements

**Worker process**

- Separate Node process with its own entry point; no dependency on an HTTP request.
- Polling loop with a configurable interval and a single worker instance by default.
- Claims a due job with a conditional update inside a transaction.
- Lease with expiry so a crashed worker's job becomes claimable again.
- Graceful shutdown: finish or release the in-flight job.
- Structured logs with job ID, target ID, attempt number, and outcome — no secrets.

**Orchestration**

- One job per target; publish-now and scheduled publishing share one code path.
- Re-check target state, account connection, and content validity before calling an
  adapter.
- Write a `publish_attempts` row before the provider call and complete it after.
- Update the target independently; never let one target's result touch another.
- Recompute post status from targets after each transition.
- Attempt history is append-only and readable in the UI.

**Failure handling**

- Normalized error categories with retryability (`PUBLISHING-LIFECYCLE.md`).
- Bounded exponential backoff with jitter for transient failures only.
- Permanent failures move to `FAILED` with a safe message; retries exhausted or
  ambiguous outcomes move to `NEEDS_ATTENTION`.
- Manual retry for `FAILED` and `NEEDS_ATTENTION`, never for `PUBLISHED`.
- Rate limits respected: reschedule after the stated reset, no hot loop.

**Duplicate prevention**

- No automatic retry after an in-flight attempt with an unknown result.
- Lease recovery distinguishes "crashed before send" from "crashed during send".
- Where the adapter supports reconciliation, query before asking the owner.

**Stub adapter**

- A fake adapter with configurable success, transient failure, permanent failure,
  rate-limit, and timeout-after-send behaviours.
- Available only outside production builds, and never presented as a real platform.

## Implementation steps

1. Adapter interface and normalized result/error types.
2. Job repository: claim, lease, complete, reschedule, recover.
3. Orchestrator with attempt recording and target transitions.
4. Worker entry point, polling loop, logging, shutdown handling.
5. Stub adapter and a test harness that drives every failure category.
6. UI surfaces: per-destination results, attempt history, retry action, and a clear
   "publishing not connected to a real platform yet" state.

## Affected modules

`scheduling`, `publishing`, `adapters/platforms` (stub only), `worker`, plus result and
queue UI.

## Acceptance criteria

- [ ] A job scheduled one minute ahead publishes through the stub with the browser
      closed.
- [ ] Two workers started together produce exactly one publish call per job.
- [ ] Killing the worker mid-job leaves recoverable state; restart does not duplicate a
      completed publish.
- [ ] A timeout after send yields attempt `UNCERTAIN` and target `NEEDS_ATTENTION`, with
      no automatic retry.
- [ ] One target succeeding and one failing yields `PARTIALLY_PUBLISHED` with the success
      intact.
- [ ] Transient failures retry with growing delays and stop at the attempt cap.
- [ ] A permanent failure is not retried.
- [ ] Manual retry is available only where allowed.
- [ ] No log line contains a token, secret, or full provider payload.

## Testing requirements

The reliability scenarios in `docs/engineering/TESTING.md` become automated integration
tests here: double claim, lease recovery, timeout-after-send, partial success, rate
limit, retry cap, cancellation race. Use a controllable clock rather than real waits.

## Out of scope

Real platform adapters, OAuth, app review, media delivery to live endpoints, Docker
packaging.

## Notes

Phase 3 is where the product earns trust. Do not shorten it to reach Phase 4 sooner;
the duplicate-publication behaviour cannot be retrofitted safely.
