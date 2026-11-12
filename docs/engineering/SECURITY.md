# Security Requirements

Security is part of the v1.0 architecture, not a later hardening phase. The bounds
behind these requirements are in [ADR-0004](../adr/0004-local-network-only-access.md)
and [ADR-0002](../adr/0002-local-filesystem-media.md).

## Threat model

The installation holds four sensitive things: the owner's password hash, social
platform tokens, unpublished content, and private media. Access is local only, so the
realistic threats are:

| Threat | Mitigation |
|---|---|
| Another device on the same LAN reaching the app | Loopback bind by default; auth required even on loopback; LAN mode is explicit |
| Tokens leaking through logs, errors, or the browser | Encryption at rest, server-only access, redaction |
| Malicious uploaded file | Content-based validation, generated filenames, no execution path |
| Path traversal into the data directory | Relative paths only, no user input in path joins |
| Duplicate publication after a retry | Attempt history, `UNCERTAIN` outcome, reconciliation |
| Stolen backup copy | Documented encryption of backups and separate key handling |
| Compromised host | Out of scope; owner responsibility, documented |

Not in scope: defending against a local administrator who already controls the host.

## Secrets and credentials

- Secrets come from environment variables or a protected config file, never from the
  database and never from the repository.
- `TOKEN_ENCRYPTION_KEY` encrypts platform tokens. It lives outside the SQLite file,
  in `.env` or a secret file, and is required for the app to start.
- `.env` files are gitignored; `.env.example` holds names and comments, never values.
- Record key generation, rotation, and recovery. A backup without the key is an
  unreadable backup — state this in the restore guide.
- Never log tokens, client secrets, authorization codes, or sensitive headers. Log a
  request ID and a normalized error instead.

## Authentication

- First-run setup creates the single owner, then closes the setup route permanently
  (ADR-0005).
- Passwords are hashed with Argon2id (or bcrypt at a documented cost factor). Never
  store or log a plaintext password.
- Sessions use an opaque random token; only its hash is stored in `sessions`.
- Cookies are `HttpOnly`, `SameSite=Lax` (stricter where possible), and `Secure` when
  served over HTTPS, with a bounded lifetime and server-side expiry.
- Logout invalidates the session server-side, not only the cookie.
- Password recovery is a documented local procedure using host access. There is no
  emailed reset link in v1.0.
- Rate-limit sign-in attempts and add a small delay on failure.

## Authorization

- Every server action and route that reads or writes content verifies the session
  first. "Single owner" means one identity, not "no checks".
- Media is served only through an authorized route that resolves the asset by ID,
  not by joining user input into a filesystem path.
- Never rely on an obscured ID for access. There is no public share URL in v1.0.

## CSRF and request handling

- State-changing requests are POST/PUT/DELETE via server actions or route handlers
  protected against cross-site requests (origin check plus a token where the framework
  does not provide one).
- Validate every input at the boundary: lengths, enum membership, timestamp format,
  media count, and target ownership.
- Reject requests with an unexpected `Host` or `Origin` in LAN mode especially.

## File uploads

- Validate decoded content and magic bytes; a `.png` that is not an image is rejected.
- Enforce a maximum file size before reading the whole body, and dimension limits
  after decoding.
- Supported formats in v1.0: JPEG, PNG, WebP.
- Generate internal filenames; never use the client's name as a path component.
- Resolve the final path and confirm it stays inside the media root.
- Write to `temporary/`, validate, then move into `originals/`; purge failures.
- Never serve the media directory as static files, and never execute uploaded content.
- Files are private by default. A published post's media may leave the machine only
  through a platform adapter's upload, and only for that publication.

## SSRF

If AI context fetching or link previews accept URLs: allow only `http`/`https`, block
loopback, private, link-local, and metadata ranges, re-check redirects, cap response
size, and apply timeouts. Do not fetch arbitrary URLs from the worker.

## Publishing

- Validate target ownership and connection state before every call.
- Store provider errors redacted; keep raw payloads only if they contain no secrets.
- Treat an ambiguous timeout as `UNCERTAIN`, never as a retryable failure.
- Do not put tokens in URLs, query strings, or error messages.

## Local-network mode

- Default bind is loopback. Enabling LAN access is a deliberate setting with a warning
  in the UI and in the docs.
- HTTPS is expected when LAN mode is used; the owner terminates TLS on the host or a
  reverse proxy they control.
- Other devices on the network are untrusted. No IP allowlist replaces authentication.

## Logging and diagnostics

- Log: request ID, route, duration, normalized error category, job ID, target ID.
- Do not log: tokens, password material, full provider responses, media contents,
  absolute host paths.
- Provide a diagnostics view that shows connection status and recent failures without
  exposing credentials.

## Owner responsibilities

Document these for the owner: keeping the host patched, disk encryption, backup
storage and key separation, TLS for LAN mode, and not exposing the port publicly.
Postaal must never open the port or create a tunnel on its own.

## Review checklist

Used at Phase 1 exit and again in Phase 5:

- [ ] No route returns token material or an absolute path.
- [ ] Setup cannot be repeated after completion.
- [ ] Unauthenticated content and media requests fail.
- [ ] Cookies carry `HttpOnly`, `SameSite`, and `Secure` where applicable.
- [ ] Upload validation rejects wrong content types and traversal attempts.
- [ ] Media is not reachable as static files.
- [ ] Logs contain no secrets.
- [ ] Default bind is loopback; LAN mode is opt-in.
- [ ] Backup docs state that the encryption key is required for restore.
