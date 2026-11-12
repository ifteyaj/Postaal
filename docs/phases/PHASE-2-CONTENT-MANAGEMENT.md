# Phase 2 — Content Management

**Status:** Not started (UI prototype exists as a reference only)
**Depends on:** Phase 1
**Blocks:** Phase 3

## Objective

Make composing, previewing, and planning real: posts, targets, drafts, media
attachments, platform previews, calendar, and queue — all persisted. Still no
publishing.

## Requirements

**Posts and targets**

- Create and edit a post with a master caption.
- Select destinations from connected accounts; block duplicates per account.
- Per-destination caption override; clearing it restores inheritance.
- Draft save, reopen, edit, duplicate, delete.
- Platform-aware validation: blocking errors versus warnings, per destination.

**Previews**

- Normalized preview model independent of credentials.
- Preview components for the platforms in scope, driven by real post data and media.
- Live updates as caption, media, order, or override changes.
- Tabs and side-by-side comparison on wide screens; a dedicated preview view on narrow
  ones.
- Previews work with zero connected accounts, labelled as simulations.
- No fabricated engagement metrics.

**Media**

- Upload, list, delete (with reference checks), and reuse within the library if media
  reuse was approved in Phase 0.
- Order media within a post; ordering persists.
- Metadata: dimensions, MIME type, size, original name.
- Clear errors for unsupported formats, oversized files, and dimension limits.

**Planning UI**

- Calendar view for scheduled and draft posts, in the owner's timezone.
- Queue view ordered by intended publication time.
- Reschedule and cancel on `QUEUED` targets; drafts remain editable.
- Scheduling writes real `scheduled_jobs` rows, but nothing executes yet — jobs stay
  `PENDING` until Phase 3 ships the worker. The UI must say so plainly.

## Implementation steps

1. Posts/targets repositories and domain rules, with transition tests.
2. Studio composer wired to persisted posts, reusing prototype components.
3. Preview engine fed by the normalized model; remove hard-coded fixtures from the
   data path.
4. Media library with `PostMedia` ordering, or the approved alternative.
5. Validation layer with per-platform rules sourced from platform metadata.
6. Calendar and queue views over real records.
7. Scheduling commands that create jobs in `PENDING`.

## Affected modules

`posts`, `media`, `scheduling` (create/cancel only), `preview`, plus UI in
`components/studio`, `components/previews`, `components/calendar`,
`components/queue`, `components/media`.

## Acceptance criteria

- [ ] A draft with caption, media order, and overrides survives a server restart.
- [ ] Reopening a draft restores exactly what was saved.
- [ ] A post cannot target the same account twice.
- [ ] Overriding one destination changes only that preview.
- [ ] Previews render with no connected accounts and are labelled as simulations.
- [ ] Invalid content blocks save; warnings do not.
- [ ] Media ordering persists and is reflected in previews.
- [ ] Scheduling stores the correct UTC instant for a chosen local time, including
      across a DST transition.
- [ ] Cancel removes the job and marks the target `CANCELLED`.
- [ ] The UI states that scheduled posts will not publish until the worker exists.

## Testing requirements

Unit tests for validation rules, character counting, and timezone conversion.
Integration tests for draft round-trip, media ordering, duplicate-target rejection, and
job creation. Component tests for preview updates. One end-to-end draft flow.

## Out of scope

Worker execution, retries, real adapters, OAuth, AI captions.
