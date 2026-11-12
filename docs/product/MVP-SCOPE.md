# MVP Scope

## MVP promise

A self-hosted user can create a post, preview it on selected supported platforms, save it, publish it now, or schedule it and track the outcome.

## Must have

- Private installation access and user authentication.
- Social account connection for at least one validated platform.
- Unified composer and destination selection.
- Platform-aware validation and character counters.
- Image uploads for validated formats.
- Realistic previews for initial target platforms.
- Draft save/edit/delete.
- Platform-specific caption overrides.
- Optional AI caption generation.
- Publish now.
- Schedule and persistent background processing.
- Calendar and queue.
- Per-destination status and error detail.
- Retry-safe publishing.
- Docker-based deployment documentation.

## Should have

- Multiple accounts per platform where permitted.
- Side-by-side previews.
- Media library reuse.
- Duplicate post action.
- Reschedule and cancel actions.
- Local storage and S3-compatible storage options.
- Configurable AI provider.

## Not in MVP

- Analytics dashboards.
- Team approvals and complex roles.
- Social inbox and comment management.
- Video editing.
- AI image generation.
- Billing.
- Mobile apps.
- Public template marketplace.

## Release gate

Do not call the MVP publish-capable until a real connector has passed authorization, media, publishing, failure, token-expiry, and duplicate-prevention tests against a permitted test account.
