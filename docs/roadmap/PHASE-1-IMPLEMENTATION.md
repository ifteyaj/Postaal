# Phase 1: Foundation and Studio Implementation Plan

## Objective

Deliver a working Studio where a user can compose, edit, save, reopen, and realistically preview a post. Publishing integrations are not required for the Phase 1 exit.

## Workstream 0: Decisions and repository foundation

- Confirm application framework and package manager.
- Confirm database and ORM.
- Confirm authentication approach.
- Confirm local development services.
- Define code style, lint, formatting, typecheck, and test commands.
- Create environment example and setup guide.
- Add CI checks.

## Workstream 1: Application shell

- Application layout and navigation.
- Authentication boundary.
- User preferences and timezone.
- Settings structure.
- Responsive behavior.

## Workstream 2: Domain and persistence

- User.
- SocialAccount placeholder/connection model.
- Post.
- PostTarget.
- PostMedia or MediaAsset.
- Database migrations.
- Repository and application service boundaries.

Do not store credentials in plaintext. Decide encryption implementation before real OAuth credentials are persisted.

## Workstream 3: Studio UI

- Composer shell.
- Master caption editor.
- Destination selector.
- Platform-specific overrides.
- Character counter abstraction.
- Validation message system.
- Draft save and reopen.

## Workstream 4: Preview engine

- Normalized preview model.
- Preview fixture data.
- Instagram preview.
- Facebook preview.
- LinkedIn preview.
- X preview.
- Tab and comparison modes.
- Media crop presentation.
- Responsive preview layout.

Previews must be explicitly labeled as simulations where ambiguity is possible.

## Workstream 5: Media

- Upload endpoint/action.
- File content validation.
- Storage adapter.
- Metadata extraction.
- Media attachment and ordering.
- Error and progress states.

## Workstream 6: Quality

- Unit tests for domain rules.
- Integration tests for persistence and upload.
- E2E test for draft creation and preview.
- Accessibility pass.
- Responsive pass.
- Documentation updates.

## Phase 1 exit criteria

- User can access the app securely.
- User can compose a post.
- User can attach valid images.
- User can select preview destinations.
- Previews update as content changes.
- User can add destination-specific caption overrides.
- Drafts persist and can be reopened.
- No publishing API is falsely represented as implemented.
