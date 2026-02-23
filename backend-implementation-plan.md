# Implementation Plan

[Overview]
Build a C# .NET 8 Web API backend for the Social Coordination App ("Hangout"), hosted in Azure with Cosmos DB, Clerk JWT authentication, and clean architecture patterns.

This backend serves the React Native Expo frontend that currently uses mock data for all screens. The initial scope covers the foundational infrastructure and three core domain entities: **Users**, **Groups**, and **Hangouts**. The architecture improves upon the workout-tracker backend by introducing interface-based dependency injection, a generic repository pattern, global exception handling middleware, RFC 7807 Problem Details error responses, clean DI registration via extension methods, and a base controller with common helpers. The project will be created at `social-coordination-app/Backend/SocialCoordinationApp/` mirroring the workout-tracker's folder structure convention. Future phases will add Friends, Notifications, Activity Feed, and Friend Profiles.

[Types]
Define domain models (Cosmos documents), DTOs (request/response), and enums for the three core entities plus the user profile.

### Enums

**`RSVPStatus`** — `Going`, `Maybe`, `NotGoing` (maps to frontend `'going' | 'maybe' | 'not-going'`)

**`HangoutStatus`** — `Live`, `Upcoming`, `Past`, `Cancelled` (maps to frontend `'live' | 'upcoming' | 'past' | 'cancelled'`)

**`GroupMemberRole`** — `Admin`, `Member`

### Domain Models (Cosmos Documents)

**`UserRecord`** (Container: `Users`, PartitionKey: `/id`)

```csharp
string Id               // Clerk user ID (from JWT sub claim)
string Email
string DisplayName
string? AvatarEmoji     // e.g. "👤"
string? Bio
DateTime CreatedAt
DateTime UpdatedAt
```

**`GroupRecord`** (Container: `Groups`, PartitionKey: `/createdByUserId`)

```csharp
string Id               // GUID
string CreatedByUserId  // Partition key — the user who created the group
string Name
string Icon             // Emoji icon e.g. "💜"
List<GroupMemberRecord> Members
DateTime CreatedAt
DateTime UpdatedAt
```

**`GroupMemberRecord`** (nested object, not a separate document)

```csharp
string UserId
string DisplayName
string? AvatarEmoji
GroupMemberRole Role
DateTime JoinedAt
```

**`HangoutRecord`** (Container: `Hangouts`, PartitionKey: `/createdByUserId`)

```csharp
string Id               // GUID
string CreatedByUserId  // Partition key
string Title
string? Description
string? Location
string? LocationDetail
DateTime? ScheduledAt
HangoutStatus Status
List<HangoutAttendeeRecord> Attendees
List<HangoutInvitedGroupRecord> InvitedGroups
DateTime CreatedAt
DateTime UpdatedAt
```

**`HangoutAttendeeRecord`** (nested object)

```csharp
string UserId
string DisplayName
string? AvatarEmoji
RSVPStatus RSVPStatus
string? FromGroupName   // which group invite they came from, if any
DateTime RSVPAt
```

**`HangoutInvitedGroupRecord`** (nested object)

```csharp
string GroupId
string GroupName
string GroupIcon
int MemberCount
```

### Request DTOs

**`CreateUserRequest`**

```csharp
[Required] string DisplayName
string? AvatarEmoji
string? Bio
```

**`UpdateUserRequest`**

```csharp
string? DisplayName
string? AvatarEmoji
string? Bio
```

**`CreateGroupRequest`**

```csharp
[Required][MaxLength(50)] string Name
[Required] string Icon
List<string>? InitialMemberUserIds   // optional list of user IDs to add
```

**`UpdateGroupRequest`**

```csharp
string? Name
string? Icon
```

**`AddGroupMemberRequest`**

```csharp
[Required] string UserId
```

**`CreateHangoutRequest`**

```csharp
[Required][MaxLength(100)] string Title
string? Description
string? Location
string? LocationDetail
DateTime? ScheduledAt
List<string>? InvitedGroupIds
List<string>? InvitedUserIds
```

**`UpdateHangoutRequest`**

```csharp
string? Title
string? Description
string? Location
string? LocationDetail
DateTime? ScheduledAt
HangoutStatus? Status
```

**`RSVPRequest`**

```csharp
[Required] RSVPStatus Status
```

### Response DTOs

**`UserResponse`**

```csharp
string Id
string Email
string DisplayName
string? AvatarEmoji
string? Bio
DateTime CreatedAt
```

**`GroupResponse`**

```csharp
string Id
string Name
string Icon
int MemberCount
List<GroupMemberResponse> Members
DateTime CreatedAt
```

**`GroupMemberResponse`**

```csharp
string UserId
string DisplayName
string? AvatarEmoji
string Role   // "Admin" or "Member"
```

**`GroupSummaryResponse`** (for list endpoints, no members array)

```csharp
string Id
string Name
string Icon
int MemberCount
```

**`HangoutResponse`**

```csharp
string Id
string Title
string? Description
string? Location
string? LocationDetail
DateTime? ScheduledAt
string Status
string CreatorDisplayName
int GoingCount
int MaybeCount
string? UserRSVPStatus    // the requesting user's RSVP, null if not RSVP'd
List<HangoutAttendeeResponse> Attendees
List<HangoutInvitedGroupResponse> InvitedGroups
DateTime CreatedAt
```

**`HangoutAttendeeResponse`**

```csharp
string UserId
string DisplayName
string? AvatarEmoji
string RSVPStatus
string? FromGroupName
```

**`HangoutInvitedGroupResponse`**

```csharp
string GroupId
string GroupName
string GroupIcon
int MemberCount
```

**`HangoutSummaryResponse`** (for list endpoints)

```csharp
string Id
string Title
string Status
DateTime? ScheduledAt
string? Location
int GoingCount
int MaybeCount
int AttendeeCount
string? UserRSVPStatus
List<string> AttendeesPreview  // first 5 avatar emojis
```

[Files]
Create a new .NET 8 Web API project under the social-coordination-app repo with clean architecture folder structure.

### Project Root

- `social-coordination-app/Backend/SocialCoordinationApp/SocialCoordinationApp.sln` — Solution file
- `social-coordination-app/Backend/SocialCoordinationApp/SocialCoordinationApp.csproj` — Project file
- `social-coordination-app/Backend/SocialCoordinationApp/Program.cs` — App entry point with clean DI registration
- `social-coordination-app/Backend/SocialCoordinationApp/appsettings.json` — Default config
- `social-coordination-app/Backend/SocialCoordinationApp/appsettings.Development.json` — Dev config overrides

### Controllers (6 files)

- `Controllers/BaseApiController.cs` — Abstract base with `GetUserId()` helper, `[ApiController]`, `[Authorize]`, route prefix
- `Controllers/HealthController.cs` — Unauthenticated health check (`GET /api/v1/health/ping`)
- `Controllers/UsersController.cs` — User profile CRUD
- `Controllers/GroupsController.cs` — Group CRUD + member management
- `Controllers/HangoutsController.cs` — Hangout CRUD + RSVP
- _(No notifications controller in Phase 1)_

### Models (organized by domain, 15+ files)

- `Models/Enums/RSVPStatus.cs`
- `Models/Enums/HangoutStatus.cs`
- `Models/Enums/GroupMemberRole.cs`
- `Models/Users/UserRecord.cs`
- `Models/Users/CreateUserRequest.cs`
- `Models/Users/UpdateUserRequest.cs`
- `Models/Users/UserResponse.cs`
- `Models/Groups/GroupRecord.cs`
- `Models/Groups/GroupMemberRecord.cs`
- `Models/Groups/CreateGroupRequest.cs`
- `Models/Groups/UpdateGroupRequest.cs`
- `Models/Groups/AddGroupMemberRequest.cs`
- `Models/Groups/GroupResponse.cs`
- `Models/Groups/GroupMemberResponse.cs`
- `Models/Groups/GroupSummaryResponse.cs`
- `Models/Hangouts/HangoutRecord.cs`
- `Models/Hangouts/HangoutAttendeeRecord.cs`
- `Models/Hangouts/HangoutInvitedGroupRecord.cs`
- `Models/Hangouts/CreateHangoutRequest.cs`
- `Models/Hangouts/UpdateHangoutRequest.cs`
- `Models/Hangouts/RSVPRequest.cs`
- `Models/Hangouts/HangoutResponse.cs`
- `Models/Hangouts/HangoutAttendeeResponse.cs`
- `Models/Hangouts/HangoutInvitedGroupResponse.cs`
- `Models/Hangouts/HangoutSummaryResponse.cs`

### Services (6 files)

- `Services/Interfaces/IUsersService.cs`
- `Services/Interfaces/IGroupsService.cs`
- `Services/Interfaces/IHangoutsService.cs`
- `Services/UsersService.cs`
- `Services/GroupsService.cs`
- `Services/HangoutsService.cs`

### Infrastructure (8 files)

- `Infrastructure/Configuration/CosmosConfiguration.cs` — Cosmos connection settings POCO
- `Infrastructure/Configuration/ClerkConfiguration.cs` — Clerk authority POCO
- `Infrastructure/Persistence/CosmosContext.cs` — Initializes and exposes Cosmos containers
- `Infrastructure/Persistence/ICosmosContext.cs` — Interface for CosmosContext (testability)
- `Infrastructure/Extensions/CosmosExtensions.cs` — Generic Cosmos helpers (`ToListAsync`, `InsertItem`, etc.)
- `Infrastructure/Extensions/ServiceCollectionExtensions.cs` — `AddInfrastructure()`, `AddApplicationServices()` DI helpers
- `Infrastructure/Middleware/ExceptionHandlingMiddleware.cs` — Global exception handler returning Problem Details
- `Infrastructure/Middleware/CorrelationIdMiddleware.cs` — Auto-generates and propagates correlation IDs

### Properties

- `Properties/launchSettings.json` — Dev launch profiles

### No files are deleted or moved.

[Functions]
Define all public methods for controllers and services.

### BaseApiController (abstract)

- `GetUserId(): string` — Extracts userId from JWT `sub` claim; throws `UnauthorizedAccessException` if absent
- `GetCorrelationId(): string` — Returns correlation ID from `HttpContext.Items` (set by middleware)

### HealthController

- `Ping(): ActionResult<string>` — `GET /api/v1/health/ping` — Returns `"pong"`, no auth required

### UsersController (route: `api/v1/users`)

- `GetCurrentUser(): ActionResult<UserResponse>` — `GET /api/v1/users/me` — Gets the authenticated user's profile
- `CreateOrUpdateUser(CreateUserRequest): ActionResult<UserResponse>` — `POST /api/v1/users` — Upserts user on first login / profile update
- `UpdateUser(UpdateUserRequest): ActionResult<UserResponse>` — `PUT /api/v1/users/me` — Updates current user's profile fields

### GroupsController (route: `api/v1/groups`)

- `CreateGroup(CreateGroupRequest): ActionResult<GroupResponse>` — `POST /api/v1/groups`
- `GetMyGroups(): ActionResult<IEnumerable<GroupSummaryResponse>>` — `GET /api/v1/groups` — All groups the user is a member of
- `GetGroupById(string id): ActionResult<GroupResponse>` — `GET /api/v1/groups/{id}`
- `UpdateGroup(string id, UpdateGroupRequest): ActionResult<GroupResponse>` — `PUT /api/v1/groups/{id}` — Only admin can update
- `DeleteGroup(string id): ActionResult` — `DELETE /api/v1/groups/{id}` — Only admin/creator can delete
- `AddMember(string groupId, AddGroupMemberRequest): ActionResult<GroupResponse>` — `POST /api/v1/groups/{id}/members`
- `RemoveMember(string groupId, string userId): ActionResult` — `DELETE /api/v1/groups/{id}/members/{userId}`

### HangoutsController (route: `api/v1/hangouts`)

- `CreateHangout(CreateHangoutRequest): ActionResult<HangoutResponse>` — `POST /api/v1/hangouts`
- `GetMyHangouts(): ActionResult<IEnumerable<HangoutSummaryResponse>>` — `GET /api/v1/hangouts` — Hangouts the user created or was invited to
- `GetHangoutById(string id): ActionResult<HangoutResponse>` — `GET /api/v1/hangouts/{id}`
- `UpdateHangout(string id, UpdateHangoutRequest): ActionResult<HangoutResponse>` — `PUT /api/v1/hangouts/{id}` — Only creator can update
- `DeleteHangout(string id): ActionResult` — `DELETE /api/v1/hangouts/{id}` — Only creator can delete
- `RSVP(string hangoutId, RSVPRequest): ActionResult<HangoutResponse>` — `POST /api/v1/hangouts/{id}/rsvp` — Authenticated user RSVPs

### IUsersService / UsersService

- `GetUserById(string userId, string correlationId): Task<UserRecord?>`
- `CreateOrUpdateUser(string userId, string email, CreateUserRequest request, string correlationId): Task<UserRecord>`
- `UpdateUser(string userId, UpdateUserRequest request, string correlationId): Task<UserRecord>`

### IGroupsService / GroupsService

- `CreateGroup(string userId, CreateGroupRequest request, string correlationId): Task<GroupRecord>`
- `GetGroupsByUserId(string userId, string correlationId): Task<IEnumerable<GroupRecord>>`
- `GetGroupById(string groupId, string correlationId): Task<GroupRecord?>`
- `UpdateGroup(string userId, string groupId, UpdateGroupRequest request, string correlationId): Task<GroupRecord>`
- `DeleteGroup(string userId, string groupId, string correlationId): Task<bool>`
- `AddMember(string userId, string groupId, AddGroupMemberRequest request, string correlationId): Task<GroupRecord>`
- `RemoveMember(string userId, string groupId, string memberUserId, string correlationId): Task<bool>`

### IHangoutsService / HangoutsService

- `CreateHangout(string userId, CreateHangoutRequest request, string correlationId): Task<HangoutRecord>`
- `GetHangoutsByUserId(string userId, string correlationId): Task<IEnumerable<HangoutRecord>>`
- `GetHangoutById(string hangoutId, string correlationId): Task<HangoutRecord?>`
- `UpdateHangout(string userId, string hangoutId, UpdateHangoutRequest request, string correlationId): Task<HangoutRecord>`
- `DeleteHangout(string userId, string hangoutId, string correlationId): Task<bool>`
- `RSVP(string userId, string hangoutId, RSVPRequest request, string correlationId): Task<HangoutRecord>`

### ExceptionHandlingMiddleware

- `InvokeAsync(HttpContext context): Task` — Wraps pipeline in try/catch, returns RFC 7807 Problem Details JSON for unhandled exceptions

### CorrelationIdMiddleware

- `InvokeAsync(HttpContext context): Task` — Generates GUID correlation ID, stores in `HttpContext.Items["CorrelationId"]`, adds to response headers

### ServiceCollectionExtensions (static)

- `AddInfrastructure(this IServiceCollection, IConfiguration): IServiceCollection` — Registers Cosmos client, CosmosContext, configuration POCOs
- `AddApplicationServices(this IServiceCollection): IServiceCollection` — Registers all services with their interfaces

### CosmosExtensions (static, carried over and improved from workout-tracker)

- `ToListAsync<T>(this IQueryable<T>): Task<List<T>>`
- `ToListAsync<T>(this FeedIterator<T>): Task<List<T>>`
- `InsertItem<T>(this Container, T): Task<T>`

[Classes]
Define all classes, their file locations, key methods, and relationships.

### Controllers

- **`BaseApiController`** — `Controllers/BaseApiController.cs` — Abstract class, inherits `ControllerBase`. Decorated with `[ApiController]`, `[Authorize]`, `[Route("api/v1/[controller]")]`. Provides `GetUserId()` and `GetCorrelationId()` methods.
- **`HealthController`** — `Controllers/HealthController.cs` — Inherits `ControllerBase` directly (NOT BaseApiController, since it's unauthenticated). `[AllowAnonymous]`, `[Route("api/v1/health")]`.
- **`UsersController`** — `Controllers/UsersController.cs` — Inherits `BaseApiController`. Depends on `IUsersService`.
- **`GroupsController`** — `Controllers/GroupsController.cs` — Inherits `BaseApiController`. Depends on `IGroupsService`, `IUsersService` (to resolve member display names).
- **`HangoutsController`** — `Controllers/HangoutsController.cs` — Inherits `BaseApiController`. Depends on `IHangoutsService`, `IGroupsService` (to resolve invited group members), `IUsersService`.

### Services

- **`UsersService`** — `Services/UsersService.cs` — Implements `IUsersService`. Depends on `ICosmosContext`, `ILogger<UsersService>`.
- **`GroupsService`** — `Services/GroupsService.cs` — Implements `IGroupsService`. Depends on `ICosmosContext`, `ILogger<GroupsService>`.
- **`HangoutsService`** — `Services/HangoutsService.cs` — Implements `IHangoutsService`. Depends on `ICosmosContext`, `ILogger<HangoutsService>`.

### Infrastructure

- **`CosmosContext`** — `Infrastructure/Persistence/CosmosContext.cs` — Implements `ICosmosContext`. Exposes `Container` properties: `UsersContainer`, `GroupsContainer`, `HangoutsContainer`. Constructor takes `CosmosClient` and `CosmosConfiguration`.
- **`CosmosConfiguration`** — `Infrastructure/Configuration/CosmosConfiguration.cs` — POCO with `ConnectionString`, `DatabaseName`, `UsersContainerName`, `GroupsContainerName`, `HangoutsContainerName`.
- **`ClerkConfiguration`** — `Infrastructure/Configuration/ClerkConfiguration.cs` — POCO with `Authority` string.
- **`ExceptionHandlingMiddleware`** — `Infrastructure/Middleware/ExceptionHandlingMiddleware.cs` — Constructor takes `RequestDelegate` and `ILogger`. Maps exception types to HTTP status codes.
- **`CorrelationIdMiddleware`** — `Infrastructure/Middleware/CorrelationIdMiddleware.cs` — Constructor takes `RequestDelegate`.
- **`ServiceCollectionExtensions`** — `Infrastructure/Extensions/ServiceCollectionExtensions.cs` — Static class with extension methods for clean DI in `Program.cs`.
- **`CosmosExtensions`** — `Infrastructure/Extensions/CosmosExtensions.cs` — Static class with Cosmos helper extensions.

### No classes are removed. No class inheritance changes to existing code.

[Dependencies]
NuGet packages required for the new project, matching the proven stack from workout-tracker with minimal additions.

### NuGet Packages (SocialCoordinationApp.csproj)

```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.14" />
<PackageReference Include="Microsoft.Azure.Cosmos" Version="3.47.2" />
<PackageReference Include="Microsoft.ApplicationInsights.AspNetCore" Version="2.23.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.4.0" />
<PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
```

### Packages intentionally NOT included in Phase 1:

- `Azure.Storage.Queues` — not needed until async processing is added
- `Microsoft.Azure.NotificationHubs` — deferred to Phase 2 (push notifications)
- `NSwag.AspNetCore` — Swashbuckle is sufficient; NSwag can be added later if client generation is needed
- `Google.Apis.Auth` — Clerk handles OAuth; no direct Google auth needed on backend
- `JWT` — JwtBearer middleware handles token validation

### No existing dependencies are modified (this is a new project).

[Testing]
Manual testing approach initially, with optional integration test project structure for future use.

### Phase 1 Testing Strategy (Manual)

Since the workout-tracker project had no automated tests, we'll follow the same pattern initially but with a structured Swagger testing approach:

1. **Health Check** — `GET /api/v1/health/ping` → expect `200 "pong"`
2. **User Creation** — `POST /api/v1/users` with Bearer token → expect `200` with user record
3. **Get Current User** — `GET /api/v1/users/me` → expect created user data
4. **Create Group** — `POST /api/v1/groups` → expect group with creator as Admin member
5. **Get My Groups** — `GET /api/v1/groups` → expect list containing created group
6. **Get Group by ID** — `GET /api/v1/groups/{id}` → expect full group with members
7. **Add Member to Group** — `POST /api/v1/groups/{id}/members` → expect updated group
8. **Remove Member from Group** — `DELETE /api/v1/groups/{id}/members/{userId}` → expect `204`
9. **Create Hangout** — `POST /api/v1/hangouts` → expect hangout with creator in attendees
10. **Get My Hangouts** — `GET /api/v1/hangouts` → expect list containing created hangout
11. **Get Hangout by ID** — `GET /api/v1/hangouts/{id}` → expect full hangout details
12. **RSVP to Hangout** — `POST /api/v1/hangouts/{id}/rsvp` → expect updated RSVP in attendees
13. **Update Hangout** — `PUT /api/v1/hangouts/{id}` → expect updated fields
14. **Delete Hangout** — `DELETE /api/v1/hangouts/{id}` → expect `204`
15. **Auth rejection** — Any endpoint without Bearer token → expect `401`
16. **Correlation ID** — All responses should include `X-Correlation-Id` header

### Future: Test Project

A `SocialCoordinationApp.Tests` xUnit project can be added in Phase 2 with:

- Unit tests for services using mocked `ICosmosContext`
- Integration tests with Cosmos DB emulator

[Implementation Order]
Implement in this sequence to ensure each step builds on available dependencies and the project is runnable at each major checkpoint.

1. **Scaffold the .NET project** — Run `dotnet new webapi`, create solution file, set up folder structure, add NuGet packages, configure `.csproj` with correct target framework and root namespace.

2. **Create configuration classes** — `CosmosConfiguration.cs`, `ClerkConfiguration.cs` in `Infrastructure/Configuration/`. These are data POCOs with no dependencies.

3. **Create all enum types** — `RSVPStatus.cs`, `HangoutStatus.cs`, `GroupMemberRole.cs` in `Models/Enums/`.

4. **Create all domain models** — `UserRecord`, `GroupRecord`, `GroupMemberRecord`, `HangoutRecord`, `HangoutAttendeeRecord`, `HangoutInvitedGroupRecord` in their respective `Models/` subdirectories.

5. **Create all request DTOs** — `CreateUserRequest`, `UpdateUserRequest`, `CreateGroupRequest`, `UpdateGroupRequest`, `AddGroupMemberRequest`, `CreateHangoutRequest`, `UpdateHangoutRequest`, `RSVPRequest`.

6. **Create all response DTOs** — `UserResponse`, `GroupResponse`, `GroupMemberResponse`, `GroupSummaryResponse`, `HangoutResponse`, `HangoutAttendeeResponse`, `HangoutInvitedGroupResponse`, `HangoutSummaryResponse`.

7. **Create Cosmos infrastructure** — `ICosmosContext`, `CosmosContext`, `CosmosExtensions`. This establishes the data access layer.

8. **Create middleware** — `ExceptionHandlingMiddleware`, `CorrelationIdMiddleware`.

9. **Create DI extension methods** — `ServiceCollectionExtensions` with `AddInfrastructure()` and `AddApplicationServices()`.

10. **Create service interfaces** — `IUsersService`, `IGroupsService`, `IHangoutsService`.

11. **Implement UsersService** — CRUD operations against Users Cosmos container.

12. **Implement GroupsService** — CRUD + member management against Groups Cosmos container.

13. **Implement HangoutsService** — CRUD + RSVP against Hangouts Cosmos container.

14. **Create BaseApiController** — Abstract controller with `GetUserId()` and `GetCorrelationId()`.

15. **Create HealthController** — Simple ping endpoint, no auth.

16. **Create UsersController** — Wire up user endpoints to `IUsersService`.

17. **Create GroupsController** — Wire up group endpoints to `IGroupsService`.

18. **Create HangoutsController** — Wire up hangout endpoints to `IHangoutsService`.

19. **Configure Program.cs** — Wire up all DI, middleware, auth (Clerk JWT), CORS, Swagger, Application Insights.

20. **Create appsettings.json and launchSettings.json** — Cosmos connection strings (empty for secrets), Clerk authority, local dev URLs.

21. **Build and verify** — `dotnet build` to ensure zero errors, then `dotnet run` to verify Swagger UI loads and health check responds.
