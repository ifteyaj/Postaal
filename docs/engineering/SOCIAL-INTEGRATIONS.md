# Social Integrations

## Initial targets

- Instagram
- Facebook
- LinkedIn
- X

These are target platforms only. The first connector must be selected after current API feasibility research.

## Required feasibility checklist

For each platform and account type, verify:

- Official API product and endpoint.
- Developer account and app requirements.
- App review / business verification requirements.
- Required scopes and permissions.
- Personal, creator, business, or page account eligibility.
- Supported post types.
- Media upload flow and media URL requirements.
- Image/video size, aspect ratio, duration, and count restrictions.
- Caption and character counting rules.
- Rate limits and publishing quotas.
- Token expiration and refresh rules.
- Webhook or status polling support.
- Error codes and retry guidance.
- Test account availability and test strategy.

## Adapter boundary

Keep provider code behind an internal interface. The rest of Postaal should work with normalized account, validation, media, publish-result, and error objects.

Do not expose provider-specific response objects throughout the application.

## Capability model

Capabilities should be explicit and account-aware. A platform may support different operations for different account types or permissions.

Potential capabilities:
- Text-only post.
- Single image.
- Multiple images.
- Video.
- Link post.
- Scheduled publication through Postaal.
- Provider-side scheduling (not assumed).
- Retrieve published post status.

## Important distinction

Postaal scheduling means Postaal's own worker triggers publication at a selected time. It does not imply that every social platform provides native scheduled-post APIs.

## Research policy

Use official platform documentation as the primary source. Record the research date and link the exact documentation in a platform-specific integration note before implementation.
