# Phase 5 — Production Readiness

**Status:** Not started
**Depends on:** Phase 4
**Blocks:** v1.0 release

## Objective

Make Postaal installable, upgradeable, backupable, and diagnosable by someone who did
not build it — on their own machine, with no public exposure.

## Requirements

**Packaging**

- Docker Compose with `app` and `worker`, sharing the data and media volumes.
- Loopback port publication by default; LAN mode documented and explicit.
- Migrations run as a startup step; a failed migration stops startup.
- Health checks for both services; worker heartbeat visible.
- Graceful worker shutdown on container stop.
- Image works without network access beyond platform APIs.

**Backup and restore**

- CLI backup producing a SQLite-consistent database copy plus media, with retention.
- Documented encryption guidance and separate key storage.
- Restore procedure, exercised end to end, restoring a working installation.
- Clear warning that a backup without the encryption key cannot restore accounts.

**Configuration and secrets**

- `.env.example` final and complete; every variable documented.
- Startup refuses missing `TOKEN_ENCRYPTION_KEY` or `AUTH_SECRET`.
- Key rotation procedure documented, including re-encrypting tokens.

**Diagnostics**

- Structured logs with levels and no secrets.
- A diagnostics view: schema version, worker last poll, connected account health,
  recent failures, disk usage.
- Error messages tell the owner what to do next.

**Security and hardening**

- Full review against `docs/engineering/SECURITY.md`.
- Dependency and image vulnerability scan.
- Confirm no route exposes the filesystem, tokens, or media without authorization.
- Confirm no tunnel, telemetry, or remote asset loading is enabled by default.

**Documentation**

- Installation guide, upgrade guide, backup/restore guide, troubleshooting guide,
  security checklist, supported deployment matrix.
- Known limitations, including platform coverage and Instagram status.

## Implementation steps

1. Author and build the Compose configuration.
2. Add startup migration step and health checks.
3. Implement backup and restore CLI; test restore from a copied volume.
4. Build the diagnostics view and log configuration.
5. Run the security review and fix findings.
6. Write the operational documentation.
7. Full clean install on a fresh machine, following only the guide.

## Affected modules

`worker` (shutdown, heartbeat), `app` (health, diagnostics), `adapters/db`
(migration runner), packaging and docs.

## Acceptance criteria

- [ ] A clean machine can install from the guide without asking a question the guide
      does not answer.
- [ ] `docker compose up` starts both services; both report healthy.
- [ ] Data and media survive `docker compose down` and a container rebuild.
- [ ] An upgrade with a migration runs and keeps existing posts and media intact.
- [ ] A backup taken under load restores and the app works, signatures included.
- [ ] Restoring without the encryption key fails loudly and explains why.
- [ ] Stopping the worker mid-job does not lose or duplicate a publication.
- [ ] No secret appears in logs, and the security checklist is signed off.
- [ ] LAN mode is off by default and warns when enabled.

## Testing requirements

Install, upgrade, backup, restore, and recovery tests run against real containers, not
mocks. One documented end-to-end run: install → setup → connect → schedule → publish →
backup → restore → verify history.

## Out of scope

Hosted deployment, multi-user, PostgreSQL or object storage migration, desktop
packaging (v2.0), auto-update.
