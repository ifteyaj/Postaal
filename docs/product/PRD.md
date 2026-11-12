# Postaal Product Requirements Document

**Version:** 1.1  
**Status:** Product direction locked. v1.0 architecture accepted (ADR-0001 to ADR-0005).
Implementation is in Phase 0; see [`../roadmap/DEVELOPMENT-STATUS.md`](../roadmap/DEVELOPMENT-STATUS.md).

## 1. Vision

Postaal is a self-hosted social media workspace that helps individuals and businesses create, preview, schedule, and publish content across supported social platforms from one dashboard.

It combines:
1. Create: compose captions and upload media.
2. Preview: inspect realistic platform-specific post simulations.
3. Publish: publish immediately or schedule and track outcomes.

## 2. Positioning

**Category:** Self-hosted social media management workspace.

**Positioning statement:** Postaal gives creators and businesses control over their social media workflow. Create content, see how it will look across platforms, and manage publishing from one self-hosted workspace.

**Tagline:** Create once. Preview everywhere. Publish anywhere.

The tagline is aspirational. Actual publishing coverage depends on supported platform APIs and permissions.

## 3. Audiences

### Individual creators and freelancers
- Content creators and personal brands
- Freelancers and consultants
- Designers and developers

Needs: manage multiple accounts, reduce repetitive work, preview content, maintain a schedule, and optionally use AI for captions.

### Businesses
- Small businesses and startups
- Marketing teams
- Social media managers
- Creative agencies

Needs: manage brand accounts, plan content, adapt captions by platform, and track publishing outcomes.

One installation serves exactly one owner (ADR-0005). A small business can run a single installation under one owner account; multi-user access, invitations, roles, and approval workflows are not part of v1.0.

## 4. Problems

- Social publishing is fragmented across platforms.
- Content often needs different captions and media treatments.
- Users cannot confidently inspect platform presentation before publishing.
- Scheduling is spread across different tools.
- Some users prefer to host and control their own software and data.

## 5. Product principles

1. Visual accuracy: previews should resemble platform interfaces rather than generic cards.
2. User control: installation owners control hosting and configuration.
3. Unified workflow: compose, preview, schedule, and publish are connected.
4. Platform awareness: constraints differ by platform and format.
5. Clear feedback: statuses and failures must be understandable.
6. Progressive complexity: common posting remains simple.

## 6. MVP capabilities

- Self-hosted installation with first-run owner setup.
- Authentication for a private, local-only installation.
- Connect and manage supported social accounts.
- Unified post composer.
- Platform destination selection.
- Platform-specific caption overrides.
- Image upload and media management.
- Realistic previews for initial supported platforms.
- Draft creation and editing.
- AI caption generation and refinement as an optional provider-backed feature.
- Publish now.
- Schedule for a future date/time.
- Calendar and queue views.
- Per-destination publishing status and errors.
- Safe retry behavior.

## 7. Initial platform targets

Initial candidates:
- Instagram
- Facebook
- LinkedIn
- X

These are targets, not a guarantee of API availability. Validate official API access, app review, account eligibility, media rules, and publishing permissions before committing to an integration.

## 8. Functional requirements

### Authentication and installation
- Users can securely access a private installation.
- Installation settings include application URL, timezone, storage, AI provider, and social API configuration.
- Core operation does not depend on a Postaal-operated cloud account.

### Social accounts
- Connect accounts using supported authorization flows.
- Store provider account IDs, display names, handles, avatars, connection status, and token expiry.
- Encrypt tokens at rest and keep them server-side.
- Support disconnect and reconnect.
- Support multiple accounts where platform rules allow.

### Composer
- Create a master post with text and media.
- Select one or more connected destination accounts.
- Show accurate platform-specific counters and validation.
- Allow optional per-destination content overrides.
- Save, reopen, edit, duplicate, and delete drafts.
- Separate warnings from blocking validation errors.

### Media
- Initial image formats: JPEG, PNG, WebP.
- Support file selection, drag-and-drop, multi-upload, removal, and ordering.
- Store filename, storage key, MIME type, size, dimensions, and upload time.
- Validate actual file content, size, dimensions, and platform constraints.
- Warn about cropping and incompatibility; do not silently alter originals.
- Design the media model so video can be added later.

### Mockup engine
- Update as caption, media, destination, or override changes.
- Provide distinct platform preview components.
- Represent relevant profile identity, timestamp, caption, links/hashtags, media, and platform UI elements.
- Represent platform media cropping/presentation.
- Support tabs and side-by-side comparison on wide screens.
- Work without connected social accounts.
- Clearly communicate that previews are simulations, not guaranteed exact platform output.

### AI assistant
- Accept topic, description, keywords, optional reference material, target platform, and tone.
- Initial tones: Professional, Casual, Engaging, Witty.
- Refinements: shorten, expand, add hashtags, make more engaging/professional, rewrite for LinkedIn, make punchier.
- Support configurable providers.
- Require user review; never publish generated content automatically.
- AI unavailability must not break manual composition.

### Scheduling
- Store scheduled instants in UTC.
- Display in the user's configured timezone.
- Support calendar views and chronological queue.
- Edit, reschedule, and cancel scheduled posts.
- Validate destination, account, media, time, and content before scheduling.

### Publishing
- Publish immediately or through scheduled background jobs.
- Track each destination independently.
- Preserve successful results when another destination fails.
- Store provider post IDs and error information.
- Retry transient errors with bounded backoff.
- Do not endlessly retry permanent errors.
- Prevent duplicate publication on retries and worker restarts.

## 9. Post statuses

Post-level:
- DRAFT
- SCHEDULED
- PUBLISHING
- PUBLISHED
- PARTIALLY_PUBLISHED
- FAILED
- CANCELLED

Destination-level:
- PENDING
- QUEUED
- PUBLISHING
- PUBLISHED
- FAILED
- NEEDS_ATTENTION
- CANCELLED

`NEEDS_ATTENTION` covers an unknown publishing outcome or exhausted retries. The full
transition rules are in [`../engineering/PUBLISHING-LIFECYCLE.md`](../engineering/PUBLISHING-LIFECYCLE.md).

The post-level status is derived from or coordinated with destination-level outcomes. Document the exact transition rules before implementation.

## 10. Non-functional requirements

- Responsive desktop/tablet/mobile experience.
- Fast-feeling preview updates.
- Secure credential storage.
- Persistent scheduled jobs processed by a worker independent of the browser.
- Safe worker restarts and restart recovery.
- Modular platform adapters.
- Local-only access by default; no public exposure required to operate.
- Docker Compose deployment with persistent data and media volumes.
- Accessible keyboard navigation and controls.
- Structured logs and useful diagnostics.
- Documented backup and restore process.

## 11. Out of scope for MVP

- Advanced analytics.
- Competitor monitoring and social listening.
- Inbox/comment management and auto-replies.
- Complex team roles and approval workflows.
- Campaign management.
- AI image generation.
- Video editing.
- Template marketplace.
- Native mobile applications.
- Billing/subscription management.
- Multi-user installations, invitations, roles, and approval workflows (ADR-0005).
- Public hosting, remote access, and tunnels (ADR-0004).
- Video publishing.
- Object storage as a required backend (ADR-0002).

## 12. Success criteria

The MVP is successful when a user can install Postaal, securely connect at least one supported social account, compose and preview a post, save a draft, publish immediately, schedule a post, manage it in a calendar/queue, and inspect per-destination success or failure without duplicate publication.

## 13. Risks

- Platform API permissions and review requirements.
- Instagram's public media URL requirement, which conflicts with local-only hosting.
- Self-hosting setup complexity.
- Platform UI changes affecting preview fidelity.
- External publishing failures and rate limits.
- MVP scope becoming too broad.

Mitigations: validate APIs early, provide Docker deployment, maintain platform preview components, use persistent idempotent jobs, and implement one end-to-end connector at a time.
