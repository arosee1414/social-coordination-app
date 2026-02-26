# Progress

## What Works

- **Authentication**: Clerk-based auth with sign-in/sign-up flows
- **User profiles**: User creation, search, profile display
- **Friends system**: Send/accept/decline friend requests, friend list, suggested friends, friendship status
- **Groups system**: Create groups, add/remove members, edit groups, group detail views
- **Hangouts system**: Create hangouts, RSVP, edit hangouts, hangout detail views, invite selection, filtering
- **Notifications system (NEW)**: Full-stack implementation
    - Backend: Cosmos DB persisted notifications with TTL, paginated API, mark read/unread, delete
    - Automatic notifications: Hangout invites, RSVPs, group member additions/removals, friend requests/acceptances
    - Frontend: Real-time display with 30s polling, swipe-to-delete, mark-as-read, unread badge on home screen
- **Theming**: Dark/light mode support with theme constants
- **Seed data**: SeedController for development data population

## Recently Completed

### Notifications System (Full Stack) — Feb 25, 2026

- Backend: NotificationType enum, NotificationRecord domain model, DTOs, NotificationsService, NotificationsController
- Cosmos DB: Notifications container with partition key `/recipientUserId` and per-document TTL (15 days)
- Service integrations: HangoutsService, GroupsService, FriendsService all create notifications
- Seed data: 7 seed notifications for Alex (mix of unread/read, various types)
- Frontend: Updated types, mapper, useApiNotifications hook, NotificationsContext with 30-second polling, notifications screen
- API client regenerated and verified
- Build: 0 errors, 0 warnings

## What's Left to Build

- Notification deep-linking (tap to navigate to related hangout/group/friend)
- Push notifications (Expo push notifications or similar)
- Hangout reminders (scheduled notifications before hangout start time)
- Notification preferences/settings (user can choose which notifications to receive)
- Real-time updates (WebSocket/SSE instead of polling)
- Group notifications for hangout creation (HangoutCreated type exists but not yet triggered)

## Current Status

**Notifications system is complete and ready for testing.** All backend services, controller, and frontend UI have been implemented. The TypeScript API client has been regenerated. Frontend type mismatches and method name issues have been resolved — all TS compilation errors fixed.

## Known Issues

- `generatedClient.ts` has a pre-existing TypeScript error about `AxiosInstance` type
- Notification creation is fire-and-forget (failures logged but not retried)
- No notification batching — rapid actions (e.g., adding 10 group members) create 10 separate notifications
- NSwag-generated method names don't match intuitive names (e.g., `notificationsGET()` instead of `notifications()`, `read()` instead of `markAsRead()`) — this is a generated client quirk

## Evolution of Project Decisions

- Chose synchronous notification creation (not event-driven) for simplicity
- Chose per-document TTL (15 days) instead of a cleanup job
- Chose cursor pagination (Cosmos continuation tokens) over offset pagination
- Chose polling (30s) over WebSocket for initial implementation simplicity
- Chose specific entity reference fields (`hangoutId`, `groupId`) over generic `relatedEntityId` for type safety
- Each notification targets the single most relevant person rather than broadcasting to all group/hangout members
