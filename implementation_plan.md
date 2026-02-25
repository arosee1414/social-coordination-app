# Implementation Plan

[Overview]
Implement a full-stack Friends system with two-way friend requests, friend lists, and real data integration across the app.

The Friends feature is a Phase 2 capability that adds social connections between users. Currently, the app has no concept of friendships — the friend profile page (`friend/[id].tsx`) uses mock data, the profile page shows a hardcoded `'Friends': '0'` stat, and the `find-friends.tsx` screen only has a superficial "Invite" button that doesn't persist anything.

This implementation introduces:

- A new `Friendships` Cosmos DB container with a dual-document pattern for efficient querying
- A `FriendsController` with endpoints for sending/accepting/declining requests and managing friends
- Frontend hooks, updated screens, and a new friends list screen
- Seed data for development testing
- Real data replacing all mock friend data throughout the app

The dual-document pattern stores two mirrored documents per friendship (one per user as partition key), enabling single-partition reads for "my friends" queries while requiring two writes per mutation.

[Types]
New backend domain models, enums, DTOs, and frontend TypeScript types for the friends system.

### Backend Enums

**New file: `Backend/SocialCoordinationApp/Models/Enums/FriendshipStatus.cs`**

```csharp
namespace SocialCoordinationApp.Models.Enums;

public enum FriendshipStatus
{
    Pending,
    Accepted
}
```

**New file: `Backend/SocialCoordinationApp/Models/Enums/FriendshipDirection.cs`**

```csharp
namespace SocialCoordinationApp.Models.Enums;

public enum FriendshipDirection
{
    Incoming,
    Outgoing
}
```

### Backend Domain Model

**New file: `Backend/SocialCoordinationApp/Models/Domain/FriendshipRecord.cs`**

```csharp
using System.Text.Json.Serialization;

namespace SocialCoordinationApp.Models.Domain;

public class FriendshipRecord
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;       // partition key — the owner of this doc

    [JsonPropertyName("friendId")]
    public string FriendId { get; set; } = string.Empty;     // the other user

    [JsonPropertyName("status")]
    public string Status { get; set; } = "Pending";          // "Pending" | "Accepted"

    [JsonPropertyName("direction")]
    public string Direction { get; set; } = "Outgoing";      // "Incoming" | "Outgoing" (only relevant when Pending)

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}
```

The `Id` field uses a composite key: `"{userId}_{friendId}"` to enforce uniqueness within a partition. The `UserId` field is the Cosmos partition key.

### Backend DTOs — Responses

**New file: `Backend/SocialCoordinationApp/Models/DTOs/Responses/FriendResponse.cs`**

```csharp
namespace SocialCoordinationApp.Models.DTOs.Responses;

public class FriendResponse
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public DateTime FriendsSince { get; set; }
}
```

**New file: `Backend/SocialCoordinationApp/Models/DTOs/Responses/FriendRequestResponse.cs`**

```csharp
namespace SocialCoordinationApp.Models.DTOs.Responses;

public class FriendRequestResponse
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public DateTime RequestedAt { get; set; }
}
```

**New file: `Backend/SocialCoordinationApp/Models/DTOs/Responses/FriendshipStatusResponse.cs`**

```csharp
namespace SocialCoordinationApp.Models.DTOs.Responses;

public class FriendshipStatusResponse
{
    /// <summary>
    /// One of: "none", "pending_incoming", "pending_outgoing", "accepted"
    /// </summary>
    public string Status { get; set; } = "none";
}
```

**New file: `Backend/SocialCoordinationApp/Models/DTOs/Responses/FriendCountResponse.cs`**

```csharp
namespace SocialCoordinationApp.Models.DTOs.Responses;

public class FriendCountResponse
{
    public int Count { get; set; }
}
```

### Frontend Types

**Modified file: `social-coordination-app-ux/src/types/index.ts`**

Add these new types:

```typescript
export type FriendshipStatusType =
    | 'none'
    | 'pending_incoming'
    | 'pending_outgoing'
    | 'accepted';

export interface FriendSummary {
    userId: string;
    displayName: string;
    profileImageUrl: string | null;
    friendsSince: string; // formatted date string
}

export interface FriendRequest {
    userId: string;
    displayName: string;
    profileImageUrl: string | null;
    requestedAt: string; // formatted date string
}
```

Update the existing `FriendProfile` interface to align with real API data:

```typescript
export interface FriendProfile {
    id: string;
    name: string;
    profileImageUrl: string | null;
    friendsSince: string;
    mutualGroups: number;
    mutualFriends: number;
    bio?: string;
    hangoutsTogether: number;
    friendshipStatus: FriendshipStatusType;
}
```

[Files]
Complete listing of all files to be created, modified, or deleted.

### New Files — Backend

1. `Backend/SocialCoordinationApp/Models/Enums/FriendshipStatus.cs` — Friendship status enum
2. `Backend/SocialCoordinationApp/Models/Enums/FriendshipDirection.cs` — Friendship direction enum
3. `Backend/SocialCoordinationApp/Models/Domain/FriendshipRecord.cs` — Cosmos document model
4. `Backend/SocialCoordinationApp/Models/DTOs/Responses/FriendResponse.cs` — Accepted friend DTO
5. `Backend/SocialCoordinationApp/Models/DTOs/Responses/FriendRequestResponse.cs` — Pending request DTO
6. `Backend/SocialCoordinationApp/Models/DTOs/Responses/FriendshipStatusResponse.cs` — Status check DTO
7. `Backend/SocialCoordinationApp/Models/DTOs/Responses/FriendCountResponse.cs` — Friend count DTO
8. `Backend/SocialCoordinationApp/Services/IFriendsService.cs` — Service interface
9. `Backend/SocialCoordinationApp/Services/FriendsService.cs` — Service implementation
10. `Backend/SocialCoordinationApp/Controllers/FriendsController.cs` — API controller

### New Files — Frontend

11. `social-coordination-app-ux/src/hooks/useApiFriends.ts` — Hook for friends list + count
12. `social-coordination-app-ux/src/hooks/useApiFriendRequests.ts` — Hook for friend request actions
13. `social-coordination-app-ux/src/hooks/useApiFriendshipStatus.ts` — Hook for checking friendship status
14. `social-coordination-app-ux/src/app/friends-list.tsx` — Friends list screen (manage friends, view requests, search)

### Modified Files — Backend

15. `Backend/SocialCoordinationApp/Infrastructure/ICosmosContext.cs` — Add `FriendshipsContainer` property
16. `Backend/SocialCoordinationApp/Infrastructure/CosmosContext.cs` — Initialize `Friendships` container with partition key `/userId`
17. `Backend/SocialCoordinationApp/Extensions/ServiceCollectionExtensions.cs` — Register `IFriendsService`/`FriendsService`
18. `Backend/SocialCoordinationApp/Services/SeedService.cs` — Add friendship seed data between existing seed users

### Modified Files — Frontend

19. `social-coordination-app-ux/src/types/index.ts` — Add `FriendshipStatusType`, `FriendSummary`, `FriendRequest` types; update `FriendProfile`
20. `social-coordination-app-ux/src/utils/api-mappers.ts` — Add `mapFriendResponseToFriendSummary`, `mapFriendRequestResponseToFriendRequest` mappers
21. `social-coordination-app-ux/src/app/(tabs)/profile.tsx` — Replace hardcoded `'Friends': '0'` with real friend count from `useApiFriends`
22. `social-coordination-app-ux/src/app/friend/[id].tsx` — Replace all mock data with real API data; add friendship action buttons (send/accept/decline/remove)
23. `social-coordination-app-ux/src/app/find-friends.tsx` — Replace "Invite" button with "Add Friend" (send friend request); show friendship status per search result
24. `social-coordination-app-ux/src/app/_layout.tsx` — Register `friends-list` route
25. `social-coordination-app-ux/src/data/mock-data.ts` — Wire "Manage Friends" settings item to navigate to friends-list screen (update `settingsSections`)

### Auto-generated (Do Not Manually Edit)

26. `social-coordination-app-ux/src/clients/generatedClient.ts` — Regenerated via NSwag after backend changes

[Functions]
Detailed breakdown of all new and modified functions.

### New Functions — `FriendsService.cs`

1. **`SendFriendRequestAsync(string userId, string friendId)`** → `Task`
    - Validates `userId != friendId`
    - Validates friend user exists (reads from Users container)
    - Checks no existing friendship/request between the two users
    - Creates two `FriendshipRecord` documents: one with `Direction = Outgoing` (partition: userId) and one with `Direction = Incoming` (partition: friendId), both with `Status = Pending`

2. **`AcceptFriendRequestAsync(string userId, string friendId)`** → `Task`
    - Reads the incoming request doc (partition: userId, friendId: friendId)
    - Validates it's Pending + Incoming
    - Updates both docs to `Status = Accepted`, clears direction relevance

3. **`DeclineFriendRequestAsync(string userId, string friendId)`** → `Task`
    - Reads the incoming request doc
    - Validates it's Pending + Incoming
    - Deletes both docs

4. **`RemoveFriendAsync(string userId, string friendId)`** → `Task`
    - Reads the friendship doc (partition: userId)
    - Validates it exists and is Accepted
    - Deletes both docs

5. **`GetFriendsAsync(string userId)`** → `Task<List<FriendResponse>>`
    - Queries Friendships container: `WHERE c.userId = @userId AND c.status = 'Accepted'`
    - Batch looks up user records for display names and profile images
    - Returns list of `FriendResponse`

6. **`GetFriendRequestsAsync(string userId)`** → `Task<List<FriendRequestResponse>>`
    - Queries: `WHERE c.userId = @userId AND c.status = 'Pending' AND c.direction = 'Incoming'`
    - Looks up user details for each requester
    - Returns list of `FriendRequestResponse`

7. **`GetOutgoingRequestsAsync(string userId)`** → `Task<List<FriendRequestResponse>>`
    - Queries: `WHERE c.userId = @userId AND c.status = 'Pending' AND c.direction = 'Outgoing'`
    - Looks up user details
    - Returns list of `FriendRequestResponse`

8. **`GetFriendshipStatusAsync(string userId, string friendId)`** → `Task<FriendshipStatusResponse>`
    - Point read: doc id `"{userId}_{friendId}"` in partition `userId`
    - Returns "none" if not found, "accepted" if accepted, "pending_incoming" or "pending_outgoing" based on direction

9. **`GetFriendCountAsync(string userId)`** → `Task<FriendCountResponse>`
    - Queries: `SELECT VALUE COUNT(1) FROM c WHERE c.userId = @userId AND c.status = 'Accepted'`
    - Returns `FriendCountResponse`

### New Functions — `FriendsController.cs`

1. `POST /api/friends/request/{friendId}` → calls `SendFriendRequestAsync`
2. `POST /api/friends/accept/{friendId}` → calls `AcceptFriendRequestAsync`
3. `POST /api/friends/decline/{friendId}` → calls `DeclineFriendRequestAsync`
4. `DELETE /api/friends/{friendId}` → calls `RemoveFriendAsync`
5. `GET /api/friends` → calls `GetFriendsAsync`
6. `GET /api/friends/requests` → calls `GetFriendRequestsAsync`
7. `GET /api/friends/requests/outgoing` → calls `GetOutgoingRequestsAsync`
8. `GET /api/friends/status/{userId}` → calls `GetFriendshipStatusAsync`
9. `GET /api/friends/count` → calls `GetFriendCountAsync`

### New Functions — Frontend Hooks

**`useApiFriends.ts`**:

- `fetchFriends()` — calls `api.friendsAll()` (GET /api/friends), maps response
- `fetchFriendCount()` — calls `api.count()` (GET /api/friends/count)
- `removeFriend(friendId)` — calls `api.friendsDELETE(friendId)`, refreshes list

**`useApiFriendRequests.ts`**:

- `fetchIncomingRequests()` — calls `api.requests()` (GET /api/friends/requests)
- `fetchOutgoingRequests()` — calls `api.outgoing()` (GET /api/friends/requests/outgoing)
- `sendFriendRequest(friendId)` — calls `api.request(friendId)` (POST /api/friends/request/{friendId})
- `acceptFriendRequest(friendId)` — calls `api.accept(friendId)` (POST /api/friends/accept/{friendId})
- `declineFriendRequest(friendId)` — calls `api.decline(friendId)` (POST /api/friends/decline/{friendId})

**`useApiFriendshipStatus.ts`**:

- `fetchStatus(targetUserId)` — calls `api.status(targetUserId)` (GET /api/friends/status/{userId})
- Returns `FriendshipStatusType`

### New Functions — API Mappers (`api-mappers.ts`)

- `mapFriendResponseToFriendSummary(response: FriendResponse): FriendSummary` — maps API response to frontend type with formatted date
- `mapFriendRequestResponseToFriendRequest(response: FriendRequestResponse): FriendRequest` — maps API response with formatted date

### Modified Functions

**`SeedService.cs` — `SeedAsync()`**: Add call to `SeedFriendshipsAsync()`.

**`SeedService.cs` — new `SeedFriendshipsAsync()`**: Creates friendship records between seed users:

- Alex ↔ Lacey (Accepted)
- Alex ↔ Jordan (Accepted)
- Alex ↔ Matt (Accepted)
- Alex ↔ Luke (Accepted)
- Alex ↔ Jake (Accepted)
- Matt → Alex pending request from Pietro (Pending: Pietro incoming, Matt outgoing — wait, let's use: Pietro sends to Alex, so Pietro=Outgoing, Alex=Incoming)
- Pietro → Alex (Pending)

**`profile.tsx`**: Replace `{ label: 'Friends', value: '0' }` with value from `useApiFriends().friendCount`.

**`friend/[id].tsx`**:

- Remove all imports from `mock-data.ts` (mockFriendProfiles, mockFriendGroupsInCommon, etc.)
- Add `useApiFriendshipStatus` hook to fetch relationship status
- Add `useApiFriends` or direct API calls for friend data
- Fetch real user data via API (`api.status(friendId)`, friend's user profile, mutual groups via comparing groups)
- Show conditional action buttons based on friendship status: "Add Friend" (none), "Pending" (outgoing), "Accept/Decline" (incoming), "Remove Friend" (accepted)

**`find-friends.tsx`**:

- Replace "Invite" button per search result with friendship-aware button
- Track friendship statuses for displayed users
- "Add Friend" sends friend request via `useApiFriendRequests().sendFriendRequest()`
- Show "Pending" badge if request already sent, "Friends" badge if already friends

[Classes]
No new classes beyond the service and controller already described. All new backend types are simple POCOs/DTOs. The frontend uses functional components and hooks, not classes.

### New Service Class: `FriendsService`

- **File**: `Backend/SocialCoordinationApp/Services/FriendsService.cs`
- **Implements**: `IFriendsService`
- **Constructor dependencies**: `ICosmosContext`, `ILogger<FriendsService>`
- **Methods**: See [Functions] section above

### New Controller Class: `FriendsController`

- **File**: `Backend/SocialCoordinationApp/Controllers/FriendsController.cs`
- **Extends**: `BaseApiController`
- **Route**: `api/friends`
- **Constructor dependencies**: `IFriendsService`

[Dependencies]
No new NuGet packages or npm packages are required.

All necessary dependencies are already present:

- Backend: `Microsoft.Azure.Cosmos`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `Swashbuckle` — all already installed
- Frontend: `axios`, `expo-router`, `@clerk/clerk-expo` — all already installed
- Tooling: `nswag` — already available for API client regeneration

The only infrastructure change is creating a new Cosmos DB container (`Friendships`) which is handled automatically by `CosmosContext.InitializeAsync()`.

[Testing]
Manual testing via Swagger UI and the mobile app. No automated tests in current scope.

### Backend Testing Strategy

1. Seed friendship data via `POST /api/seed` endpoint
2. Verify endpoints via Swagger UI at `http://localhost:5219/swagger`:
    - `GET /api/friends` — should return seeded friends list
    - `GET /api/friends/count` — should return correct count
    - `GET /api/friends/requests` — should return pending incoming requests
    - `GET /api/friends/status/{userId}` — should return correct status per user
    - `POST /api/friends/request/{friendId}` — send a new request
    - `POST /api/friends/accept/{friendId}` — accept a pending request
    - `DELETE /api/friends/{friendId}` — remove a friend

### Frontend Testing Strategy

1. Profile page: Verify "Friends" stat shows real count (not "0")
2. Friends list screen: Verify friends appear, incoming requests show accept/decline buttons
3. Find friends screen: Verify "Add Friend" button sends request, status updates
4. Friend profile screen: Verify real data displayed, action buttons work based on friendship status

### Verification After API Client Regeneration

- Search `generatedClient.ts` for `friends`, `FriendResponse`, `FriendRequestResponse`, `FriendshipStatusResponse`, `FriendCountResponse` to confirm all endpoints were generated

[Implementation Order]
Step-by-step implementation sequence to minimize conflicts and ensure each step builds on the previous.

1. **Backend enums** — Create `FriendshipStatus.cs` and `FriendshipDirection.cs` in `Models/Enums/`
2. **Backend domain model** — Create `FriendshipRecord.cs` in `Models/Domain/`
3. **Backend DTOs** — Create `FriendResponse.cs`, `FriendRequestResponse.cs`, `FriendshipStatusResponse.cs`, `FriendCountResponse.cs` in `Models/DTOs/Responses/`
4. **Cosmos infrastructure** — Add `FriendshipsContainer` to `ICosmosContext` and `CosmosContext` (partition key `/userId`)
5. **Backend service** — Create `IFriendsService.cs` and `FriendsService.cs` in `Services/`
6. **Backend controller** — Create `FriendsController.cs` in `Controllers/`
7. **DI registration** — Add `IFriendsService`/`FriendsService` to `ServiceCollectionExtensions.cs`
8. **Seed data** — Add `SeedFriendshipsAsync()` to `SeedService.cs`
9. **API client regeneration** — Start backend, download swagger spec, regenerate TypeScript client, verify
10. **Frontend types** — Update `types/index.ts` with new friend types
11. **Frontend mappers** — Add friend mapper functions to `api-mappers.ts`
12. **Frontend hooks** — Create `useApiFriends.ts`, `useApiFriendRequests.ts`, `useApiFriendshipStatus.ts`
13. **Profile page** — Update `profile.tsx` to show real friend count
14. **Friends list screen** — Create `friends-list.tsx` with friends list, incoming requests, search
15. **Route registration** — Add `friends-list` to `_layout.tsx`
16. **Profile navigation** — Wire "Manage Friends" settings item to navigate to friends-list
17. **Friend profile screen** — Update `friend/[id].tsx` to use real API data and friendship action buttons
18. **Find friends screen** — Update `find-friends.tsx` with friend request buttons and status display
19. **Memory bank update** — Update activeContext.md, progress.md, systemPatterns.md
