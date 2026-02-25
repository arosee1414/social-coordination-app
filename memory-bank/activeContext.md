# Active Context

## Current Work Focus

Added 20 seed users and fixed self-result bug in find friends search. Ready for next task.

## What Was Just Accomplished

- **Added 20 new seed users to `SeedService.cs`:**
    - Added 20 new user ID constants (`user_seed_*`) and corresponding `UserRecord` entries
    - Users: Emily Chen, Marcus Williams, Sofia Rodriguez, Ryan Patel, Ava Thompson, Noah Kim, Mia Jackson, Ethan Rivera, Chloe Nguyen, Liam O'Brien, Harper Davis, Caleb Martinez, Zoe Anderson, Dylan Scott, Lily Perez, Owen Murphy, Ella Wright, Aiden Brooks, Nora Sullivan, Tyler Hughes
    - Total seed users: 27 (7 original + 20 new) plus Alex who already exists

- **Fixed self-result bug in find friends search:**
    - Bug: Current user appeared in their own search results with an "Add" button
    - Fix: Added `currentUserId` parameter to `SearchUsersAsync` and added `c.id != @currentUserId` filter to the Cosmos DB query
    - Files changed: `IUsersService.cs`, `UsersService.cs`, `UsersController.cs`
    - No API contract change — endpoint signature unchanged, no client regeneration needed

## Key Decisions Made

- **Separate Pending from Maybe**: Pending (hasn't responded) is distinct from Maybe (responded "maybe"). Fixes inflated Maybe counts.
- **No Invited tab on hangout detail**: User prefers keeping the detail page at 3 RSVP tabs only
- **Backend enforcement + frontend gating**: Both layers enforce restrictions — backend returns 403 for unauthorized access, frontend avoids making calls when not friends
- **Stats row stays visible for everyone**: Friend count always shown; Groups and Hangouts stats show `—` for non-friends

## Previous Context

- **Instagram-style friend actions**: "Friends" button opens bottom sheet, incoming requests show "Confirm"/"Delete" buttons, outgoing shows "Requested"
- **Dual-document pattern**: Each friendship creates two mirrored Cosmos DB documents (one per user as partition key) for efficient single-partition reads
- **FriendRequest type**: Uses `displayName`/`avatarUrl` (matching generated DTO), while `Friend` type uses `name`/`avatar` (mapped in frontend)
- **Direction casing**: Backend sends `"Incoming"`/`"Outgoing"` (PascalCase), frontend `useApiFriendshipStatus` normalizes to `"incoming"`/`"outgoing"` (lowercase)
- **Self-navigation fix**: Hangout attendee list `onPress` routes to `/(tabs)/profile` when tapping yourself instead of `/friend/${userId}`

## Remaining Work

- **Testing**: End-to-end testing of cancel friend request on find-friends and friend profile screens
- **Error handling polish**: Some screens could benefit from retry logic on API failures

## Important Patterns & Preferences

- **Cosmos enum serialization**: Always add `[JsonConverter(typeof(StringEnumConverter))]` to enum properties in domain models
- Generated client method naming: `friendsAll()`, `friendsPOST(friendId)`, `friendsDELETE(friendId)`, `requestsAll()`, `requestsPOST(friendId)`, `accept(friendId)`, `cancel(friendId)`, `reject(friendId)`, `status(friendId)`, `count(userId)`, `commonGroups(userId)`, `commonHangouts(userId)`
- Theme colors: Use `colors.card` (not `cardBackground`), `colors.indigo50` (not `primaryLight`), `colors.surfaceTertiary` (not `backgroundSecondary`), `colors.error` (not `danger`), `colors.cardBorder` (not `border`)
- PowerShell shell: Use `;` to chain commands, NOT `&&`; `2>$null` for stderr redirect (not `2>nul`)
