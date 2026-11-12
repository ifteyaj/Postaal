# Glossary

- **Installation:** One deployed instance of Postaal, with one database and one media
  directory.
- **Owner:** The single person who owns an installation. There are no other accounts
  (ADR-0005).
- **Installation settings:** The single row holding the owner's email, password hash,
  and timezone.
- **Data directory:** The persistent folder holding the SQLite database, backups, and
  config (`/data` by default).
- **Media directory:** The persistent folder holding originals, processed files,
  thumbnails, and temporary uploads.
- **Social account:** A provider account connected through authorization.
- **Platform:** A social network/provider such as Instagram or LinkedIn.
- **Post:** The shared content composition and scheduling container.
- **Post target:** One destination account selected for a post; the unit of publishing.
- **Master content:** The base caption shared across destinations unless overridden.
- **Platform override:** Destination-specific caption for one target.
- **Preview:** A simulated rendering of how content may appear on a platform.
- **Publishing job:** A durable `scheduled_jobs` row for one target.
- **Worker:** The separate process that claims due jobs and publishes, independent of
  the browser.
- **Queue:** The ordered set of pending or scheduled jobs shown in the UI, backed by
  `scheduled_jobs`.
- **Claim / lease:** The conditional update that makes one worker responsible for a job
  for a period of time.
- **Provider adapter:** The integration boundary around one social platform API.
- **Media delivery:** How an adapter gets bytes to a platform (upload URL, media
  endpoint, or, for Instagram, a public URL).
- **Partial publication:** At least one destination succeeded and at least one failed.
- **Uncertain outcome:** The provider may have accepted a post but Postaal did not
  receive the response; recorded as `UNCERTAIN`, surfaced as `NEEDS_ATTENTION`.
- **Loopback:** `127.0.0.1`, the default bind address; only the local machine can reach
  it.
- **LAN mode:** Explicit opt-in that binds to the local network; requires
  authentication and owner-managed TLS.
- **UTC:** Canonical timezone for all persisted instants.
