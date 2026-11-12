# Social Integrations

Platforms are integrated directly, one adapter at a time, behind a common contract
(ADR-0003). A platform is not "supported" until it has published end to end on a
permitted test account.

## Targets

| Platform | Status | Notes |
|---|---|---|
| LinkedIn | Candidate | Documented image flow: initialize upload, transfer to the returned URL, create the post |
| X | Candidate | Media upload endpoint, then create the post |
| Facebook | Candidate | Page publishing endpoints; page-level permissions required |
| Instagram | **Blocked** | Requires media at a public HTTPS URL; a local-only install cannot provide one without a separate decision |

Order is not fixed. The first connector is chosen after the feasibility checklist
below, and the choice should favour a platform whose approval process the owner can
actually complete.

## Feasibility checklist

Complete this before writing adapter code, and record the result and research date in
a per-platform note (`docs/engineering/platforms/<platform>.md` when the first
connector starts):

- Official API product, endpoints, and current version.
- Developer app creation and review/verification requirements.
- Required scopes and what each one grants.
- Which account types are eligible (personal, creator, business, page).
- Supported post types and content combinations.
- Media upload flow and whether a public URL is required.
- Image rules: formats, size, aspect ratio, count.
- Caption rules and how characters are counted.
- Rate limits, quotas, and the shape of a 429.
- Token lifetime, refresh behaviour, and revocation semantics.
- Whether post status can be queried after an ambiguous timeout.
- Error codes and which are retryable.
- Redirect URI rules for a local-only installation.
- Availability of a test account.

## Adapter contract

```ts
interface SocialPlatformAdapter {
  platform: PlatformId;

  getAccount(): Promise<ConnectedAccount>;
  validate(post: Post, target: PostTarget): Promise<ValidationResult>;
  publish(post: Post, target: PostTarget): Promise<PublishResult>;
  refreshToken?(): Promise<TokenRefreshResult>;
  normalizeError(error: unknown): NormalizedError;
}
```

Rules:

- Adapters return Postaal types. Provider response objects do not leave the adapter.
- Adapters do not write to the database; they return a result and `publishing` records
  it.
- Capability checks are per account, not per platform: the same platform may permit
  more for one account type than another.
- Capabilities: text-only post, single image, multiple images, video (not v1.0),
  link post, Postaal-side scheduling (always), provider-side scheduling (not assumed),
  status lookup.
- Media delivery is implemented per adapter. There is no shared upload helper that
  pretends every platform behaves the same.

## Media delivery per platform

| Platform | Flow | Local-only compatible |
|---|---|---|
| LinkedIn | Initialize upload, receive upload URL, PUT bytes, publish with asset URN | Yes |
| X | Upload media, receive media ID, publish with ID | Yes |
| Facebook | Upload to the Page media endpoint, publish | Yes |
| Instagram | Create container with a publicly reachable `image_url`, poll processing, publish container | No — blocked |

Instagram's requirement is a platform constraint, not an implementation detail. Options
when it is addressed: a narrowly scoped temporary HTTPS relay that serves only files
explicitly queued for publication (unguessable, expiring URLs, never the filesystem),
or deferring Instagram until a hosted v3.0 direction exists. Either way it needs an
ADR before code.

## OAuth in a local-only install

- Verify each provider's redirect rules before designing the callback route.
- Loopback redirects may be allowed for development apps but not for production apps.
- Never solve a redirect problem by making the application publicly reachable.
- Validate `state`, use PKCE where supported, and store tokens encrypted.
- Disconnecting an account deletes or revokes credentials and keeps published history.

## Explicit non-claims

- A preview does not prove a platform will accept or render a post exactly as shown.
- Postaal-side scheduling is not provider-native scheduling.
- Passing a unit test with a mock is not evidence that a platform integration works.
