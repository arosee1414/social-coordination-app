# Active Context

## Current State (Feb 26, 2026)

The full-stack notifications system has been implemented and is working end-to-end. The home screen "Recent Activity" section now uses real notifications data instead of mock data.

## Current Work Focus

Post-implementation UX polish and wiring up real data to replace remaining mock data.

## Recent Changes

### Notifications System (Full Stack) — COMPLETED

- **Backend enum**: `NotificationType.cs` — 8 notification types (HangoutCreated, HangoutInvite, Rsvp, GroupCreated, MemberAdded, MemberRemoved, FriendRequest, FriendAccepted)
- **Backend domain model**: `NotificationRecord.cs` — Cosmos DB document with `[JsonProperty]` attributes, partition key `recipientUserId`, 15-day TTL (1296000 seconds)
- **Backend DTOs**: `NotificationResponse.cs`, `PaginatedNotificationsResponse.cs`, `UnreadCountResponse.cs`
- **Cosmos infrastructure**: Updated `ICosmosContext` and `CosmosContext` with `NotificationsContainer`; Updated `SeedService` to create Notifications container with `DefaultTimeToLive = -1` (per-document TTL opt-in) and `/recipientUserId` partition key
- **Notifications service**: `INotificationsService.cs` + `NotificationsService.cs` — CRUD operations, pagination with Cosmos continuation tokens, self-notification prevention
- **Notifications controller**: `NotificationsController.cs` — GET (paginated), GET unread-count, PUT mark-as-read, PUT read-all, DELETE
- **Service integrations**: Added `INotificationsService` injection and notification creation calls to:
    - `HangoutsService` — HangoutInvite on create, Rsvp on RSVP update
    - `GroupsService` — MemberAdded on group create and add members, MemberRemoved on remove member
    - `FriendsService` — FriendRequest on send, FriendAccepted on accept
- **API client regenerated**: NSwag-generated TypeScript client updated with all notification endpoints
- **Frontend types**: Updated `Notification` type in `types/index.ts` with new fields (`recipientUserId`, `actorUserId`, `hangoutId`, `groupId`, `createdAt`) and new type values
- **Frontend mapper**: `mapNotificationResponseToNotification` in `api-mappers.ts`
- **Frontend hook**: `useApiNotifications.ts` — fetches notifications, unread count, pagination, mark read, delete
- **Frontend context**: `NotificationsContext.tsx` rewritten to use API hook with 30-second polling instead of mock data
- **Frontend screen**: `notifications.tsx` updated — new type-based icon/color switches, `formatTimeAgo` helper, updated method names
- **Mock data cleanup**: Removed `mockNotifications` from `mock-data.ts`

## Build Fixes Applied (Latest Session)

- Added `NotificationsContainer` property to `ICosmosContext` interface (was missing)
- Added `NotificationsContainer` property and initialization to `CosmosContext` class (was missing)
- Fixed `HangoutsService` constructor — added missing `INotificationsService notificationsService` parameter
- Fixed `FriendsService` constructor — added missing `INotificationsService notificationsService` parameter
- Rebuilt successfully with 0 errors
- Re-regenerated TypeScript API client with all notification endpoints verified

## Notification Call Wiring Fix (Latest)

The `_notificationsService` was injected into `HangoutsService`, `GroupsService`, and `FriendsService` but **no actual `CreateNotificationAsync()` calls were made**. Fixed by adding notification creation calls:

- **HangoutsService**: `CreateHangoutAsync` → HangoutInvite to each invitee; `UpdateRSVPAsync` → Rsvp to hangout creator; `AddAttendeesAsync` → HangoutInvite to newly added attendees
- **GroupsService**: `CreateGroupAsync` → MemberAdded to each initial member; `AddMemberAsync` → MemberAdded to new member; `RemoveMemberAsync` → MemberRemoved to removed member
- **FriendsService**: `SendFriendRequestAsync` → FriendRequest to recipient; `AcceptFriendRequestAsync` → FriendAccepted to original sender

All calls are wrapped in try/catch to prevent blocking the main operation. Each service has a `GetUserDisplayNameAsync` helper for producing human-readable notification titles.

## Frontend Runtime Fixes (Post-Deployment)

- Fixed method name mismatches in `useApiNotifications.ts`:
    - `apiClient.notifications()` → `apiClient.notificationsGET()`
    - `apiClient.notificationsUnreadCount()` → `apiClient.unreadCount()`
    - `apiClient.notificationsPUT()` → `apiClient.read()`
    - `apiClient.notificationsReadAll()` → `apiClient.readAll()`
    - `response.hasMore` → `!!response.continuationToken` (hasMore doesn't exist on response)
- Updated `Notification` interface in `types/index.ts`:
    - Removed old fields: `icon`, `color`, `unread`, `relatedEntityId`
    - Added new fields: `isRead`, `recipientUserId`, `actorUserId`, `hangoutId`, `groupId`, `createdAt`
    - Changed `type` from union literal to `string` (matches API enum values like `Rsvp`, `HangoutInvite`, etc.)
- Added `mapNotificationResponseToNotification()` mapper function to `api-mappers.ts`
- Updated `notifications.tsx`:
    - Replaced `notification.unread` with `!notification.isRead`
    - Replaced `notification.icon`/`notification.color` with type-based icon/color derivation in `getNotificationIcon()`
    - Updated `handleNotificationPress()` to use `hangoutId`/`groupId`/`actorUserId` instead of `relatedEntityId`, with new backend type names
- Removed `mockNotifications` from `mock-data.ts` (was using old interface fields)

## Recent Fix (Feb 26, 2026)

- **Find Friends swipe-back gesture**: Removed `gestureEnabled: false` from the `find-friends` Stack.Screen in `_layout.tsx`. The screen was previously only navigable back via the header button; now the standard iOS swipe-back gesture works.

## Recent Activity Section — Real Data (Feb 26, 2026)

Replaced mock recent activity on the home screen with real notifications from the API:

- **`RecentActivitySection` component**: Rewritten to accept `Notification[]` instead of `RecentActivity[]`. Uses type-based Ionicons icons with color-coded circles (same mapping as notifications screen). Shows `message` text and relative time via `formatTimeAgo`.
- **Home screen (`index.tsx`)**: Now passes `notifications.slice(0, 10)` from `NotificationsContext` instead of `mockRecentActivity`. Press handler navigates to hangout/group/friend based on notification type. Pull-to-refresh now also refreshes notifications.
- **Cleanup**: Removed `mockRecentActivity`, `findFriendIdByName` from `mock-data.ts`. Removed `RecentActivity` type from `types/index.ts`. Removed corresponding imports from home screen.
- No backend changes needed — reuses existing notifications API.

## Recent Activity UX Improvements (Feb 26, 2026)

- **Text layout redesign**: Changed from horizontal icon+text layout to vertical layout — icon & timestamp in a header row, then title (bold, 2-line max) and message (secondary, 1-line) below. This avoids truncation of longer notification text.
- **Mark as read on tap**: Tapping a recent activity card now calls `markAsRead(notification.id)` before navigating, reducing the unread badge count.

## Next Steps

- Consider adding push notifications via Expo or similar
- Monitor notification volume and consider batching/throttling if needed
- Continue replacing remaining mock data with real API data

## Active Decisions and Considerations

- Each notification targets the single most relevant person (e.g., hangout creator for RSVPs, the added/removed person for groups)
- Self-notifications are prevented in `CreateNotificationAsync`
- Notification creation failures are caught and logged but don't block the main operation (try/catch around each notification call)
- 30-second polling interval for frontend (could be adjusted or replaced with WebSocket/SSE later)
- Entity references use specific `hangoutId` and `groupId` fields (not generic `relatedEntityId`) for future deep-linking

## Important Patterns and Preferences

- Backend uses `Newtonsoft.Json` with `[JsonProperty]` attributes (not `System.Text.Json`)
- All Cosmos queries use `ORDER BY c.createdAt DESC` with ISO 8601 UTC format
- Frontend follows existing hook/context/mapper pattern
- API client regeneration is mandatory after any backend API changes (see .clinerules)
- All notification creation is wrapped in try/catch to prevent blocking the main action

## Learnings and Project Insights

- The SeedService handles Cosmos container creation — new containers should be added there
- SwipeListView has known TypeScript typing issues with keyExtractor (pre-existing)
- The generated client uses `I`-prefixed interface names (e.g., `INotificationResponse`)
- Cosmos continuation tokens work well for cursor pagination in notification feeds
