# Core User Journeys

## A. Compose and publish now

1. Open Studio.
2. Enter caption.
3. Select connected destinations.
4. Upload media.
5. Review platform-specific validation.
6. Inspect each preview.
7. Optionally edit destination-specific captions.
8. Select Publish Now.
9. Server validates and creates one publishing operation per destination.
10. User sees independent results for each destination.

## B. Compose and schedule

1. Open Studio and compose content.
2. Select destinations and media.
3. Review previews and validation.
4. Select Schedule.
5. Choose local date and time.
6. Server converts the intended instant to UTC and persists it.
7. Post appears in Calendar and Queue.
8. Worker claims the due job and publishes.
9. User sees final destination results.

## C. Platform-specific overrides

1. Create master caption.
2. Select multiple destinations.
3. Open destination editor.
4. Customize one destination.
5. Preview changes only for that destination.
6. Master caption and other overrides remain unchanged.

## D. Recover from a failed destination

1. One destination fails.
2. Successful destinations remain successful.
3. Error code/message and retryability are recorded.
4. User inspects the failure.
5. User reconnects or fixes content if required.
6. User retries only the eligible failed destination.
7. Idempotency controls prevent accidental duplicate publishing.

## E. Preview before connecting accounts

1. Open Studio.
2. Compose text and add sample media.
3. Select a platform preview.
4. Inspect simulated presentation.
5. Save a local draft if authentication and draft persistence are available.
6. Connect an account later to enable publishing.

## Key UX rule

The preview is a simulation. It must never be presented as proof that a platform will accept or render a post exactly as shown.
