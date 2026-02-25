# Active Context

## Current Work Focus

Friend profile page enhancement — showing groups in common and shared hangouts on the friend detail page.

## What Was Just Accomplished

- **Friend profile page enrichment**: Enhanced `friend/[id].tsx` to show complete friend info including:
    - **Stats row**: Friends count, Groups in common count, Hangouts together count
    - **Groups in Common section**: Lists shared groups with emoji, name, member count; tappable to navigate to group detail
    - **Hangouts Together section**: Lists shared hangouts with title, date, location; tappable to navigate to hangout detail
    - Proper empty states for both sections when no data exists
    - Loading indicators while data fetches
    - Sections only shown when friendship status is "accepted"

- **Backend: New API endpoints**: Added two new endpoints to `UsersController`:
    - `GET /api/users/{userId}/common-groups` → Returns groups where both current user and target user are members
    - `GET /api/users/{userId}/common-hangouts` → Returns hangouts where both current user and target user are attendees
    - Implemented via `GetCommonGroupsAsync` in `GroupsService` and `GetCommonHangoutsAsync` in `HangoutsService`
    - Uses Cosmos DB cross-partition queries with `ARRAY_CONTAINS` for member/attendee matching

- **TypeScript API client regenerated**: New `commonGroups(userId)` and `commonHangouts(userId)` methods available in generated client

## Key Decisions Made

- **Reused existing DTOs**: No new response types/DTOs needed — `GroupSummaryResponse` and `HangoutSummaryResponse` work for both endpoints
- **Frontend uses direct API calls**: Instead of new hooks, the friend page directly calls `apiClient.commonGroups()` and `apiClient.commonHangouts()` via `useEffect`
- **Sections conditional on friendship**: Groups in common and Hangouts together sections only render when `friendshipStatus.status === 'accepted'`

## Previous Context

- **Dual-document pattern**: Each friendship creates two mirrored Cosmos DB documents (one per user as partition key) for efficient single-partition reads
- **FriendRequest type**: Uses `displayName`/`avatarUrl` (matching generated DTO), while `Friend` type uses `name`/`avatar` (mapped in frontend)
- **Direction casing**: Backend sends `"Incoming"`/`"Outgoing"` (PascalCase), frontend `useApiFriendshipStatus` normalizes to `"incoming"`/`"outgoing"` (lowercase)

## Remaining Work

- **Testing**: End-to-end testing of friend profile with common groups/hangouts data
- **Error handling polish**: Some screens could benefit from retry logic on API failures

## Important Patterns & Preferences

- **Cosmos enum serialization**: Always add `[JsonConverter(typeof(StringEnumConverter))]` to enum properties in domain models
- Generated client method naming: `friendsAll()`, `friendsPOST(friendId)`, `friendsDELETE(friendId)`, `requestsAll()`, `requestsPOST(friendId)`, `accept(friendId)`, `reject(friendId)`, `status(friendId)`, `count(userId)`, `commonGroups(userId)`, `commonHangouts(userId)`
- Theme colors: Use `colors.card` (not `cardBackground`), `colors.indigo50` (not `primaryLight`), `colors.surfaceTertiary` (not `backgroundSecondary`), `colors.error` (not `danger`), `colors.cardBorder` (not `border`)
- PowerShell shell: Use `;` to chain commands, NOT `&&`; `2>$null` for stderr redirect (not `2>nul`)
