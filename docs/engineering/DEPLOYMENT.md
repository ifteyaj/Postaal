# Self-hosted Deployment

## Direction

Docker-based deployment is the intended direction. Exact image, framework, and service choices remain subject to architecture decisions.

## Expected service roles

- `web`: application UI and server endpoints.
- `worker`: scheduled and asynchronous publishing jobs.
- `db`: persistent relational database.
- `redis`: queue coordination.
- Storage: persistent local volume or configured S3-compatible object storage.

## Deployment requirements

- Persistent database volume.
- Persistent media volume when local storage is used.
- Health checks.
- Database migrations.
- Worker process supervision/restart.
- Structured logs.
- Documented backup and restore.
- TLS termination through a reverse proxy.
- Environment-based configuration.
- Least-privilege service credentials.

## Configuration categories

- Application URL and environment.
- Authentication/session secrets.
- Database connection.
- Queue connection.
- Token encryption key.
- Media storage mode and credentials.
- AI provider and API key.
- Social provider app credentials.
- Default timezone and operational settings.

Do not place real secrets in `.env.example`.

## Operational documentation to add before public release

- Installation guide.
- Upgrade guide.
- Backup and restore guide.
- Troubleshooting guide.
- Security hardening checklist.
- Supported deployment matrix.
