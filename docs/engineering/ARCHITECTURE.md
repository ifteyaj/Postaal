# System Architecture

## Status

Architecture direction: modular monolith. Concrete framework and infrastructure choices remain proposals until recorded in ADRs.

## High-level shape

```text
Browser
  |
  v
Web Application
  |-- Authentication
  |-- Studio / Composer
  |-- Preview Engine
  |-- Media Management
  |-- Calendar / Queue UI
  |-- Settings
  |
  v
Application / Domain Modules
  |-- Accounts
  |-- Posts
  |-- Media
  |-- Scheduling
  |-- Publishing
  |-- AI
  |
  +------> PostgreSQL
  +------> Object Storage
  +------> Queue / Redis
  +------> Social Provider Adapters
  +------> AI Provider Adapters

Background Worker
  |-- Claims due jobs
  |-- Loads destination and media
  |-- Validates publishability
  |-- Calls provider adapter
  |-- Persists outcome
  |-- Schedules eligible retry
```

## Architectural principles

1. Begin with a modular monolith, not microservices.
2. Keep domain rules independent of framework request handlers.
3. Keep provider-specific API logic behind adapters.
4. Keep preview rendering independent of connected accounts.
5. Keep each destination's publication lifecycle independent.
6. Use durable job records and queue coordination.
7. Store timestamps as UTC instants.
8. Keep secrets on the server.
9. Make external operations observable and retry-safe.

## Suggested modules

- `auth`
- `users`
- `social-accounts`
- `posts`
- `media`
- `preview` (frontend/domain presentation)
- `ai`
- `calendar`
- `scheduling`
- `publishing`
- `platforms`
- `settings`
- `audit`

## Suggested dependency direction

UI -> application services -> domain contracts.

Infrastructure adapters implement domain-facing interfaces. Domain logic must not import a concrete social provider SDK directly.

## Preview contract

A normalized preview view model should contain:
- Platform identifier.
- Account identity (optional).
- Caption.
- Ordered media metadata and preview URLs.
- Link/hashtag parsing data where needed.
- Preview context such as simulated timestamp.

The preview component must not require an access token or call a publishing API.

## Publishing contract

A platform adapter should expose capability-aware operations such as:
- Get account/profile information.
- Validate a destination payload.
- Upload or prepare media.
- Publish supported content.
- Retrieve status if the platform supports it.
- Normalize provider errors.

Exact method signatures should be designed after selecting the first connector.

## Avoid

- One giant post API handler containing all platform logic.
- Provider-specific conditionals spread throughout the UI.
- Treating a multi-destination post as one indivisible network request.
- Using an in-memory timer as the only scheduler.
- Coupling preview rendering to OAuth state.
