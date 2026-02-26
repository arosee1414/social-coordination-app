# System Patterns

## System Architecture

- **Backend**: C# .NET 8 Web API with Azure Cosmos DB
- **Frontend**: React Native (Expo) with TypeScript
- **Auth**: Clerk authentication with Google OAuth
- **API Client**: Auto-generated TypeScript client via NSwag from OpenAPI/Swagger spec

## Backend Patterns

### Cosmos DB Structure

- **Users Container** (partition key: `/userId`) — UserRecord documents
- **Groups Container** (partition key: `/id`) — GroupRecord documents with embedded GroupMember arrays
- **Hangouts Container** (partition key: `/groupId`) — HangoutRecord documents with embedded HangoutAttendee arrays
- **Friendships Container** (partition key: `/userId`) — FriendshipRecord documents using dual-document pattern

### Dual-Document Friendship Pattern

Each friendship creates **two** mirrored Cosmos DB documents, one in each user's partition:

- Document ID format: `"{userId}_{friendId}"`
- **Pending state**: Each doc has `Direction` (Incoming/Outgoing) to track who initiated
- **Accepted state**: `Direction` is set to `null` since both sides are equal
- Benefits: Single-partition reads for any user's friend list (no cross-partition queries)
- Cost: Two writes per mutation (create, accept, reject, remove)

### Service Layer Pattern

- Interface + Implementation (`IFriendsService` / `FriendsService`)
- Services inject `ICosmosContext` for container access
- Services handle business logic and data access
- Use `QueryAsync<T>` extension method for parameterized Cosmos queries
- Registered in DI via `ServiceCollectionExtensions.AddApplicationServices()`

### Controller Pattern

- Inherit from `BaseApiController` (provides `GetCurrentUserId()`, logging)
- Route: `api/[controller]`
- Use `ProducesResponseType` attributes for Swagger documentation
- Return `IActionResult` (Ok, NoContent, BadRequest, NotFound)
- Wrap `InvalidOperationException` in BadRequest responses

### Seed Data Pattern

- `SeedService` with individual `Seed{Entity}Async()` methods
- Check if already seeded via COUNT query before inserting
- Called from `SeedController` endpoint
- Seed users: `user_alice`, `user_bob`, `user_charlie`, `user_diana`, `user_eve`

## Frontend Patterns

### Hook Pattern

- Custom hooks encapsulate API calls and state management
- Pattern: `useApi{Resource}` naming convention
- Return `{ data, loading, error, refetch, ...actions }`
- Use `useApiClient()` to get the typed API client instance
- Use `useCallback` for memoized fetch/action functions
- Use `useEffect` for initial data fetching

### Type Mapping Pattern

- Generated client DTOs → Frontend domain types via mapper functions
- Mappers in `src/utils/api-mappers.ts`
- Pattern: `map{DtoName}To{DomainType}(dto: DtoType): DomainType`
- Handle nullable fields with `??` defaults
- Convert date strings to `Date` objects

### Screen Structure Pattern

- `SafeAreaView` with `edges={["top"]}` as root
- Header with back button, title, optional action button
- Content area with `ScrollView` or `FlatList`
- Loading state: centered `ActivityIndicator`
- Empty state: icon + title + subtitle (+ optional action button)
- Error handling via `Alert.alert()`

### Theme / Dark Mode Pattern

- `ThemeContext` (`src/contexts/ThemeContext.tsx`) wraps the entire app in `_layout.tsx`
- Manages `themePreference` (`system` | `light` | `dark`) with AsyncStorage persistence
- Resolves `effectiveScheme` (`light` | `dark`) by combining preference with system setting
- `useThemeColors()` hook reads from `ThemeContext` to return the correct color palette
- `useThemeContext()` hook gives access to `effectiveScheme`, `themePreference`, and `setThemePreference`
- Dark mode toggle lives in the Profile tab's "Preferences" section

### Style Consistency

- Shared constants: `src/constants/theme.ts` (colors, spacing, typography, border radius)
- Shared styles: `src/constants/shared-styles.ts` (common layout patterns)
- Avatar pattern: 44px (list items), 96px (profile), with fallback showing first initial
- Card/list items: `cardBackground` color, `borderRadius.lg`, consistent padding
- Theme colors accessed via `useThemeColors()` hook

### Navigation Pattern

- Expo Router file-based routing
- Stack screens registered in `src/app/_layout.tsx`
- Dynamic routes: `[id].tsx` pattern (e.g., `friend/[id].tsx`)
- Navigation: `router.push()`, `router.back()`, `router.replace()`

## API Client Regeneration (CRITICAL)

After any backend API contract change:

1. Start backend: `cd Backend\SocialCoordinationApp; dotnet run`
2. Download swagger: `curl -o social-coordination-app-ux\swagger\apiSpec.json http://localhost:5219/swagger/v1/swagger.json`
3. Regenerate client: `cd social-coordination-app-ux; nswag openapi2tsclient /input:"swagger\apiSpec.json" /output:"src\clients\generatedClient.ts" /className:SocialCoordinationApiClient /template:Axios /generateClientInterfaces:true`
4. Verify new methods in generated client
5. Stop backend server

## Notifications Architecture

- **Storage**: Cosmos DB container `Notifications` with partition key `/recipientUserId`
- **TTL**: Per-document TTL of 15 days (1296000 seconds), container has `DefaultTimeToLive = -1`
- **Notification types**: HangoutCreated, HangoutInvite, Rsvp, GroupCreated, MemberAdded, MemberRemoved, FriendRequest, FriendAccepted
- **Creation**: Synchronous, inline with service operations (HangoutsService, GroupsService, FriendsService)
- **Error handling**: Try/catch around each notification creation — failures logged but don't block main operations
- **Self-notification prevention**: `CreateNotificationAsync` skips if recipientUserId == actorUserId
- **Pagination**: Cosmos DB continuation tokens, `ORDER BY c.createdAt DESC`
- **Frontend polling**: 30-second interval for notifications + unread count
- **Entity references**: Specific `hangoutId` and `groupId` fields (not generic) for future deep-linking

## Key Technical Decisions

- PowerShell is the shell — use `;` not `&&` to chain commands
- `dotnet run` is blocking — run curl/nswag in separate terminals
- Generated TypeScript client has pre-existing TS errors (62) that don't affect runtime
- Never manually edit `generatedClient.ts`
