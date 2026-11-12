# Security Requirements

## Secrets and credentials

- Keep secrets in environment variables or an appropriate secret store.
- Never commit real `.env` files.
- Never expose provider tokens to browser code.
- Encrypt OAuth tokens at rest.
- Document encryption key generation, rotation, backup, and recovery.
- Do not log tokens, client secrets, authorization codes, or sensitive headers.

## Authentication and authorization

- Protect private routes and server actions.
- Enforce ownership checks for every user-owned resource.
- Protect OAuth callbacks with state/CSRF validation.
- Use secure, HTTP-only, appropriately configured cookies.
- Apply rate limits to authentication and sensitive operations.
- Do not assume obscured IDs are authorization.

## File uploads

- Validate file signature/content as well as declared MIME type.
- Enforce size and dimension limits.
- Generate storage keys; do not trust user-provided paths.
- Prevent path traversal.
- Consider malware scanning where deployment context warrants it.
- Avoid serving untrusted uploads from the application origin without appropriate controls.

## External URLs and SSRF

If users can submit URLs for AI context or link previews:
- Restrict schemes.
- Block private, loopback, link-local, and metadata IP ranges.
- Re-check redirect destinations.
- Apply response size and timeout limits.
- Do not fetch arbitrary URLs from privileged internal network contexts.

## Publishing

- Validate destination ownership and connection state.
- Avoid duplicate publication.
- Sanitize provider error details before displaying them.
- Ensure logs and audit trails do not contain secrets.

## Self-hosted threat model

Document which security responsibilities belong to Postaal and which belong to the installation owner, including TLS, host updates, backups, firewalling, and secret protection.
