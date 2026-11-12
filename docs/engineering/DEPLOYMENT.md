# Self-hosted Deployment

**Status:** v1.0 target. Docker Compose with two services on one host. This replaces
the earlier four-service sketch (web, worker, PostgreSQL, Redis); PostgreSQL and Redis
were removed by ADR-0001.

## Topology

```text
Docker Compose
├── app       Next.js web process  (UI, routes, auth, media serving)
└── worker    Node process         (due jobs, adapters, publishing)

Volumes (host)
├── postaal-data    /data/postaal.db, /data/backups, /data/config
└── postaal-media   /media/originals, processed, thumbnails, temporary
```

Both services mount both volumes. They are the only shared state, which is why the
worker can run in its own container without a queue server.

## Networking

- Publish `app` to the host as `127.0.0.1:3000` by default.
- The worker exposes no port.
- LAN access is opt-in: bind `0.0.0.0` and terminate TLS in front of the app. This is
  a documented choice, not the default (ADR-0004).
- No public port forwarding, no tunnel, no hosted Postaal backend.
- Outbound HTTPS to platform APIs is required and is the only outbound dependency.

## Services

| Service | Command | Health check |
|---|---|---|
| `app` | run migrations, then start the web server | HTTP request to a local `/api/health` route |
| `worker` | run migrations check, then start the polling loop | heartbeat row or `/health` file updated each poll |

Startup order is not enough: the worker must tolerate the app restarting, and the app
must tolerate the worker being down (posts stay `QUEUED`).

## Configuration

Environment variables, documented in `.env.example`:

| Group | Purpose |
|---|---|
| Application | `NODE_ENV`, `APP_URL`, bind host, port |
| Data | database file path, media directory path |
| Secrets | `AUTH_SECRET` (session signing/hashing), `TOKEN_ENCRYPTION_KEY` |
| Media | storage driver (`local` only in v1.0) and root path |
| Localisation | default timezone for a new installation |
| Platform apps | client IDs/secrets, only for adapters being implemented |
| AI (optional) | provider and key, only if the feature is enabled |

Rules:

- `TOKEN_ENCRYPTION_KEY` is required; the app refuses to start without it.
- Never put real values in `.env.example`.
- Changing `TOKEN_ENCRYPTION_KEY` without re-encrypting tokens disconnects every
  account. Document rotation as a maintenance procedure.

## Data directories

```text
/data/postaal.db            SQLite database (WAL files live beside it)
/data/backups/              backup output
/data/config/               non-secret installation config, if any
/media/originals/           uploaded originals
/media/processed/           derived renditions
/media/thumbnails/          grid thumbnails
/media/temporary/           in-flight uploads; safe to purge
```

The database must not live on a network share or a cloud-synced folder.

## Migrations

- Migrations run as an explicit step before the app starts, in the same container.
- A failed migration stops startup and leaves the previous container image runnable.
- The worker verifies the schema version and refuses to run against an unexpected
  version rather than corrupting data.
- Before an upgrade, the release notes state whether a backup is mandatory.

## Backup and restore

A complete backup is three things, and restoring two of them is not a restore:

1. A SQLite-consistent copy (`VACUUM INTO` or the online backup API — not a live file
   copy while WAL is active).
2. The media directory.
3. The encryption key material, stored separately from the backup.

Policy for v1.0:

- Manual backup command available from the CLI.
- Optional scheduled backup with a configurable retention count.
- Restore procedure documented and exercised as part of Phase 5 exit.
- Backups are not encrypted by Postaal by default; the owner is told to store them on
  encrypted media or wrap them. Encrypting them in-app is an open decision.

## Upgrades

1. Read the release notes for migration or backup requirements.
2. Take a backup (mandatory if the migration is destructive).
3. Pull the new image and restart `app`, then `worker`.
4. Verify health, then confirm one previously scheduled job still resolves.

## Operational requirements

- Persistent volumes for both directories.
- Health checks with a readiness probe that touches the database.
- Graceful shutdown for the worker: stop polling, finish or release the current job.
- Structured logs without secrets.
- Disk-space awareness: the app warns when the media volume is low; nothing silently
  drops an upload.
- One installation per database file, one worker per installation.

## Documentation to ship before public release

Installation guide, upgrade guide, backup and restore guide, troubleshooting guide,
security hardening checklist, and the supported deployment matrix (compose on Linux
and macOS first).
