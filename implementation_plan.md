# Implementation Plan

[Overview]
Implement a full-stack, backend-persisted notifications system that generates notifications when key actions occur in the app.

Notifications will be stored in a new Cosmos DB "Notifications" container, partitioned by `recipientUserId` for efficient single-partition reads. Notifications are created synchronously during the same API call that triggers the action (e.g., RSVP, friend request, hangout creation). Each notification targets the most relevant single user (e.g., the hangout creator for RSVPs, the added/removed person for group membership changes). The frontend will replace its current mock-data-driven `NotificationsContext` with real API calls — fetching, marking as read, and deleting notifications via new backend endpoints. The existing notifications UI (swipeable list, unread badge on home bell icon) is already well-built and will be preserved, just wired to real data.

**Notification types and their recipients:**
| Action | Notification Type | Recipient |
|---|---|---|
| Hangout created | `hangout_created` | Each invited attendee (not the creator) |
| Hangout invite (attendees added later) | `hangout_invite` | Each newly added attendee |
| RSVP to hangout | `rsvp` | Hangout creator |
| Group created | `group_created` | Each group member (not the creator) |
| Group member added | `member_added` | The person who was added |
| Group member removed | `member_removed` | The person who was removed |
| Friend request sent | `friend_request` | The person receiving the request |
| Friend request accepted | `friend_accepted` | The person whose request was accepted (the original sender) |

[Types]
New backend domain model, enums, DTOs, and updated frontend TypeScript types for the notification system.

### Backend Enum: `NotificationType`

**File:** `Backend/SocialCoordinationApp/Models/Enums/NotificationType.cs`

```csharp
public enum NotificationType
{
    HangoutCreated,
    HangoutInvite,
    Rsvp,
    GroupCreated,
    MemberAdded,
    MemberRemoved,
    FriendRequest,
    FriendAccepted
}
```

### Backend Domain Model: `NotificationRecord`

**File:** `Backend/SocialCoordinationApp/Models/Domain/NotificationRecord.cs`

```csharp
public class NotificationRecord
{
    [JsonPropertyName("id")] public string Id { get; set; }
    [JsonPropertyName("recipientUserId")] public string RecipientUserId { get; set; }
    [JsonPropertyName("type")] public NotificationType Type { get; set; }  // with StringEnumConverter
    [JsonPropertyName("actorUserId")] public string ActorUserId { get; set; }
    [JsonPropertyName("actorDisplayName")] public string ActorDisplayName { get; set; }
    [JsonPropertyName("actorAvatarUrl")] public string? ActorAvatarUrl { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; }
    [JsonPropertyName("message")] public string Message { get; set; }
    [JsonPropertyName("relatedEntityId")] public string? RelatedEntityId { get; set; }  // hangout ID, group ID, or user ID
    [JsonPropertyName("isRead")] public bool IsRead { get; set; } = false;
    [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; set; }
}
```

### Backend DTO: `NotificationResponse`

**File:** `Backend/SocialCoordinationApp/Models/DTOs/Responses/NotificationResponse.cs`

```csharp
public class NotificationResponse
{
    public string Id { get; set; }
    public string Type { get; set; }  // string representation of NotificationType
    public string ActorUserId { get; set; }
    public string ActorDisplayName { get; set; }
    public string? ActorAvatarUrl { get; set; }
    public string Title { get; set; }
    public string Message { get; set; }
    public string? RelatedEntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### Backend DTO: `UnreadCountResponse`

**File:** `Backend/SocialCoordinationApp/Models/DTOs/Responses/UnreadCountResponse.cs`

```csharp
public class UnreadCountResponse
{
    public int Count { get; set; }
}
```

### Frontend Type: Updated `Notification`

**File:** `social-coordination-app-ux/src/types/index.ts`
Update the existing `Notification` interface:

```typescript
export interface Notification {
    id: string;
    type:
        | 'hangout_created'
        | 'hangout_invite'
        | 'rsvp'
        | 'group_created'
        | 'member_added'
        | 'member_removed'
        | 'friend_request'
        | 'friend_accepted';
    actorUserId?: string;
    actorDisplayName?: string;
    actorAvatarUrl?: string | null;
    title: string;
    message: string;
    time: string; // computed from createdAt on frontend
    unread: boolean; // mapped from !isRead
    relatedEntityId?: string;
    createdAt?: string; // ISO date string from backend
}
```

Remove the `icon` and `color` fields — the frontend will derive icon/color from the `type` field instead.

[Files]
Complete list of files to create, modify, or delete across backend and frontend.

### New Files to Create

**Backend:**

1. `Backend/SocialCoordinationApp/Models/Enums/NotificationType.cs` — New enum
2. `Backend/SocialCoordinationApp/Models/Domain/NotificationRecord.cs` — New domain model
3. `Backend/SocialCoordinationApp/Models/DTOs/Responses/NotificationResponse.cs` — New DTO
4. `Backend/SocialCoordinationApp/Models/DTOs/Responses/UnreadCountResponse.cs` — New DTO
5. `Backend/SocialCoordinationApp/Services/INotificationsService.cs` — New service interface
6. `Backend/SocialCoordinationApp/Services/NotificationsService.cs` — New service implementation
7. `Backend/SocialCoordinationApp/Controllers/NotificationsController.cs` — New controller

**Frontend:** 8. `social-coordination-app-ux/src/hooks/useApiNotifications.ts` — New hook for fetching/managing notifications

### Existing Files to Modify

**Backend:** 9. `Backend/SocialCoordinationApp/Infrastructure/ICosmosContext.cs` — Add `NotificationsContainer` property 10. `Backend/SocialCoordinationApp/Infrastructure/CosmosContext.cs` — Add `NotificationsContainer` initialization 11. `Backend/SocialCoordinationApp/Extensions/ServiceCollectionExtensions.cs` — Register `INotificationsService` 12. `Backend/SocialCoordinationApp/Services/HangoutsService.cs` — Inject `INotificationsService`, create notifications on hangout create, RSVP, and add attendees 13. `Backend/SocialCoordinationApp/Services/IHangoutsService.cs` — No interface change needed (notifications are internal) 14. `Backend/SocialCoordinationApp/Services/GroupsService.cs` — Inject `INotificationsService`, create notifications on group create, member add, member remove 15. `Backend/SocialCoordinationApp/Services/FriendsService.cs` — Inject `INotificationsService`, create notifications on friend request sent and accepted

**Frontend:** 16. `social-coordination-app-ux/src/types/index.ts` — Update `Notification` interface 17. `social-coordination-app-ux/src/contexts/NotificationsContext.tsx` — Replace mock data with API-driven state, add fetch/poll logic 18. `social-coordination-app-ux/src/app/notifications.tsx` — Update to use new notification type fields (derive icon/color from type instead of `icon`/`color` props) 19. `social-coordination-app-ux/src/utils/api-mappers.ts` — Add `mapNotificationResponseToNotification()` mapper 20. `social-coordination-app-ux/src/data/mock-data.ts` — Remove `mockNotifications` export (no longer needed)

### Files NOT Modified

- `social-coordination-app-ux/src/app/(tabs)/index.tsx` — Already reads from `NotificationsContext`; no changes needed since context interface stays the same
- `social-coordination-app-ux/src/app/_layout.tsx` — Already wraps with `NotificationsProvider`; no changes needed

[Functions]
New and modified functions across the backend services and frontend hooks/mappers.

### New Functions

**`INotificationsService` / `NotificationsService`:**

- `CreateNotificationAsync(string recipientUserId, NotificationType type, string actorUserId, string actorDisplayName, string? actorAvatarUrl, string title, string message, string? relatedEntityId)` — Creates a single NotificationRecord in Cosmos DB
- `CreateBulkNotificationsAsync(List<NotificationRecord> notifications)` — Creates multiple notifications (for hangout/group creation where multiple recipients exist)
- `GetNotificationsAsync(string userId)` — Returns all notifications for a user, ordered by `createdAt` descending
- `GetUnreadCountAsync(string userId)` — Returns count of unread notifications
- `MarkAsReadAsync(string userId, string notificationId)` — Sets `isRead = true` on a single notification
- `MarkAllAsReadAsync(string userId)` — Sets `isRead = true` on all of a user's notifications
- `DeleteNotificationAsync(string userId, string notificationId)` — Deletes a single notification

**`NotificationsController`:**

- `GET api/notifications` → `GetNotifications()` — Returns `List<NotificationResponse>`
- `GET api/notifications/unread-count` → `GetUnreadCount()` — Returns `UnreadCountResponse`
- `POST api/notifications/{id}/read` → `MarkAsRead(string id)` — Returns `NoContent`
- `POST api/notifications/read-all` → `MarkAllAsRead()` — Returns `NoContent`
- `DELETE api/notifications/{id}` → `DeleteNotification(string id)` — Returns `NoContent`

**Frontend `useApiNotifications` hook:**

- `fetchNotifications(limit?, continuationToken?)` — Calls `GET api/notifications`, maps to frontend `Notification[]`, returns continuation token for load-more
- `fetchUnreadCount()` — Calls `GET api/notifications/unread-count`
- `markAsRead(id)` — Calls `POST api/notifications/{id}/read`
- `markAllAsRead()` — Calls `POST api/notifications/read-all`
- `deleteNotification(id)` — Calls `DELETE api/notifications/{id}`

**Frontend mapper (`api-mappers.ts`):**

- `mapNotificationResponseToNotification(response: NotificationResponse): Notification` — Maps backend DTO to frontend type, computing relative `time` from `createdAt`

### Modified Functions

**`HangoutsService.CreateHangoutAsync()`:**

- After creating the hangout, call `INotificationsService.CreateBulkNotificationsAsync()` to notify all initial attendees (excluding the creator) with type `HangoutCreated`

**`HangoutsService.UpdateRSVPAsync()`:**

- After updating the RSVP, call `INotificationsService.CreateNotificationAsync()` to notify the hangout creator with type `Rsvp`. Include the RSVP status in the message (e.g., "John is going to 'Movie Night'")

**`HangoutsService.AddAttendeesAsync()`:**

- After adding attendees, call `INotificationsService.CreateBulkNotificationsAsync()` to notify each newly added attendee with type `HangoutInvite`

**`GroupsService.CreateGroupAsync()`:**

- After creating the group, call `INotificationsService.CreateBulkNotificationsAsync()` to notify all initial members (excluding the creator) with type `GroupCreated`

**`GroupsService.AddMemberAsync()`:**

- After adding the member, call `INotificationsService.CreateNotificationAsync()` to notify the added member with type `MemberAdded`

**`GroupsService.RemoveMemberAsync()`:**

- After removing the member, call `INotificationsService.CreateNotificationAsync()` to notify the removed member with type `MemberRemoved`

**`FriendsService.SendFriendRequestAsync()`:**

- After creating the friendship records, call `INotificationsService.CreateNotificationAsync()` to notify the recipient with type `FriendRequest`

**`FriendsService.AcceptFriendRequestAsync()`:**

- After accepting, call `INotificationsService.CreateNotificationAsync()` to notify the original sender with type `FriendAccepted`

**`NotificationsContext` (frontend):**

- Replace `useState(() => [...mockNotifications])` with `useState<Notification[]>([])`
- Add `useEffect` to call `fetchNotifications()` on mount
- Add periodic polling (every 30 seconds) or refetch-on-focus to keep notifications fresh
- Wire `markAsRead`, `markAllAsRead`, `deleteNotification` to call API then update local state optimistically

[Classes]
New service classes and controller, plus modifications to existing service classes.

### New Classes

1. **`NotificationsService`** (`Backend/SocialCoordinationApp/Services/NotificationsService.cs`)
    - Implements `INotificationsService`
    - Injected dependencies: `ICosmosContext`, `ILogger<NotificationsService>`
    - Handles all CRUD operations against the Notifications Cosmos container
    - Uses `recipientUserId` as partition key for all queries

2. **`NotificationsController`** (`Backend/SocialCoordinationApp/Controllers/NotificationsController.cs`)
    - Inherits from `BaseApiController`
    - Route: `api/notifications`
    - 5 endpoints: list, unread count, mark read, mark all read, delete

### Modified Classes

3. **`HangoutsService`** — Add `INotificationsService` to constructor injection. Add notification creation calls in `CreateHangoutAsync`, `UpdateRSVPAsync`, `AddAttendeesAsync`.

4. **`GroupsService`** — Add `INotificationsService` to constructor injection. Add notification creation calls in `CreateGroupAsync`, `AddMemberAsync`, `RemoveMemberAsync`.

5. **`FriendsService`** — Add `INotificationsService` to constructor injection. Add notification creation calls in `SendFriendRequestAsync`, `AcceptFriendRequestAsync`.

6. **`CosmosContext`** — Add `NotificationsContainer` property and initialize it in `InitializeAsync()` with partition key `/recipientUserId`.

7. **`ICosmosContext`** — Add `Container NotificationsContainer { get; }` property.

[Dependencies]
No new NuGet packages or npm packages are required.

The implementation uses only existing dependencies:

- Backend: `Microsoft.Azure.Cosmos` (already installed), `Newtonsoft.Json` (already installed)
- Frontend: `axios` (already used via generated client), `expo-router` (already installed)

The NSwag-generated TypeScript client will be regenerated to include the new `NotificationsController` endpoints, producing new methods on `SocialCoordinationApiClient`.

[Testing]
Manual end-to-end testing approach with verification steps.

### Backend Verification

1. Start backend and verify Swagger UI shows the new `/api/notifications` endpoints
2. Use Swagger or curl to verify:
    - `GET /api/notifications` returns empty array initially
    - Create a hangout → verify notification appears for invited attendees
    - Send a friend request → verify notification appears for recipient
    - `POST /api/notifications/{id}/read` marks notification as read
    - `POST /api/notifications/read-all` marks all as read
    - `DELETE /api/notifications/{id}` removes notification

### Frontend Verification

1. Open notifications page — should show real notifications from API (empty if no actions taken)
2. Perform actions (RSVP, send friend request, create group) and verify notifications appear
3. Tap a notification — verify it navigates to the correct entity and marks as read
4. Swipe to delete — verify it calls the API and removes from list
5. "Mark all read" — verify all unread dots disappear and API is called
6. Home screen bell icon badge — verify unread count reflects real data

### Seed Data

- Optionally add notification seed data to `SeedService` to pre-populate test notifications for seed users

[Implementation Order]
Step-by-step implementation sequence to minimize conflicts and ensure each layer builds on the previous one.

1. **Create backend enum and domain model** — `NotificationType.cs` and `NotificationRecord.cs`
2. **Create backend DTOs** — `NotificationResponse.cs` and `UnreadCountResponse.cs`
3. **Update Cosmos infrastructure** — Add `NotificationsContainer` to `ICosmosContext` and `CosmosContext` (with `DefaultTimeToLive = -1` for per-document TTL)
4. **Create notifications service** — `INotificationsService.cs` and `NotificationsService.cs`
5. **Register service in DI** — Update `ServiceCollectionExtensions.cs`
6. **Create notifications controller** — `NotificationsController.cs` with all 5 endpoints
7. **Integrate notifications into HangoutsService** — Add notification creation calls for hangout create, RSVP, add attendees
8. **Integrate notifications into GroupsService** — Add notification creation calls for group create, member add, member remove
9. **Integrate notifications into FriendsService** — Add notification creation calls for friend request send and accept
10. **Regenerate TypeScript API client** — Start backend, download swagger spec, run NSwag
11. **Update frontend types** — Update `Notification` interface in `types/index.ts`
12. **Add notification mapper** — Add `mapNotificationResponseToNotification()` to `api-mappers.ts`
13. **Create `useApiNotifications` hook** — New hook wrapping generated client methods
14. **Rewrite `NotificationsContext`** — Replace mock data with real API calls, add polling
15. **Update notifications screen** — Derive icon/color from notification type instead of `icon`/`color` props
16. **Remove mock notifications** — Clean up `mockNotifications` from `mock-data.ts`
17. **Update memory bank** — Update activeContext.md and progress.md
