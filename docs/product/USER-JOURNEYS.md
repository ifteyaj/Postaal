# Core User Journeys

Journeys describe v1.0 behaviour. Anything requiring a platform adapter is only real
once that adapter has passed its validation (see
[`../engineering/SOCIAL-INTEGRATIONS.md`](../engineering/SOCIAL-INTEGRATIONS.md)).

## 0. First run (installation setup)

1. Owner starts the app and opens it on loopback.
2. Setup asks for an email, a password, and a timezone.
3. The owner account is created and the setup route closes permanently.
4. The owner lands in the workspace with an empty Studio, queue, and media library.
5. Nothing is reachable without signing in, including from later visits.

Edge cases: a second setup attempt is refused; an incorrect password does not reveal
whether the email exists; a forgotten password uses the documented local recovery
procedure rather than an email link.

## A. Compose and publish now

1. Open Studio.
2. Enter a caption.
3. Select connected destinations.
4. Attach media.
5. Review per-platform validation warnings and errors.
6. Inspect each preview.
7. Optionally override the caption for one destination.
8. Select Publish now.
9. The server validates, creates one job per destination, and the worker runs them.
10. Results appear per destination, not as a single pass/fail.

## B. Compose and schedule

1. Compose content in Studio and choose destinations.
2. Review previews and validation.
3. Select Schedule and choose a local date and time.
4. The server converts the instant to UTC and persists it.
5. The post appears in Calendar and Queue.
6. The owner may reschedule or cancel while it is still `QUEUED`.
7. The worker publishes at the due time, with the browser closed.
8. Final per-destination results are shown.

Edge case: a post scheduled across a DST boundary must fire at the intended instant,
and the UI must show the same wall-clock time the owner picked.

## C. Platform-specific overrides

1. Create a master caption.
2. Select several destinations.
3. Open one destination's editor.
4. Customize that caption.
5. Only that destination's preview changes.
6. Clearing the override restores inheritance from the master caption.

## D. Recover from a failed destination

1. One destination fails; the others remain `PUBLISHED`.
2. The post shows `PARTIALLY_PUBLISHED`.
3. The failure shows a category and a safe message, plus whether retry is possible.
4. The owner fixes the cause (reconnects an account, shortens a caption, replaces media).
5. The owner retries only the failed destination.
6. No already-published destination is published again.

Special case: an unknown outcome (`NEEDS_ATTENTION`) tells the owner to check the
platform before retrying, because the post may already exist.

## E. Preview before connecting accounts

1. Open Studio and compose text.
2. Attach a sample image.
3. Pick a platform preview.
4. Inspect the simulated result.
5. Save a draft.
6. Connect an account later to make publishing possible.

## F. Connect an account

1. Open Accounts and choose a platform.
2. Complete the provider's authorization flow in the browser.
3. Return to the app; the account appears as connected with its identity.
4. A later token failure flips it to `needs_reauth` with a visible warning and a
   reconnect action.
5. Disconnecting removes credentials and keeps published history.

## Key UX rules

- The preview is a simulation. It never proves a platform will accept or render a post
  exactly as shown.
- No fake success states. If nothing was published, the UI must not imply it was.
- Publishing status is per destination, always.
