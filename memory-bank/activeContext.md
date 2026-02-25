# Active Context

## Current Work Focus

Navigation improvements — connecting orphaned screens to the app's navigation flow.

## What Was Just Accomplished

- **Friends list navigation from profile page:**
    - The "Friends" stat on the profile page (`(tabs)/profile.tsx`) is now tappable and navigates to `/friends-list`
    - Previously the `friends-list.tsx` screen was orphaned — no screen in the app routed to it
    - Wrapped the "Friends" stat item in a `TouchableOpacity` with `router.push('/friends-list')` while keeping other stats as plain views

## Key Decisions Made

- **Backend enforcement + frontend gating**: Both layers enforce the restriction — backend returns 403 for unauthorized access, frontend avoids making the calls entirely when not friends
- **Stats row stays visible for everyone**: Friend count is always shown; Groups and Hangouts stats show `—` for non-friends
- **Reactive fetching**: Using `friendshipStatus.status` as a `useEffect` dependency ensures common data is fetched immediately when friendship is accepted (no page reload needed)

## Previous Context

- **Instagram-style friend actions**: "Friends" button opens bottom sheet, incoming requests show "Confirm"/"Delete" buttons, outgoing shows "Requested"
- **Dual-document pattern**: Each friendship creates two mirrored Cosmos DB documents (one per user as partition key) for efficient single-partition reads
- **FriendRequest type**: Uses `displayName`/`avatarUrl` (matching generated DTO), while `Friend` type uses `name`/`avatar` (mapped in frontend)
- **Direction casing**: Backend sends `"Incoming"`/`"Outgoing"` (PascalCase), frontend `useApiFriendshipStatus` normalizes to `"incoming"`/`"outgoing"` (lowercase)

## Remaining Work

- **Testing**: End-to-end testing of privacy enforcement (non-friend profile view, accept → immediate data load)
- **Error handling polish**: Some screens could benefit from retry logic on API failures

## Important Patterns & Preferences

- **Cosmos enum serialization**: Always add `[JsonConverter(typeof(StringEnumConverter))]` to enum properties in domain models
- Generated client method naming: `friendsAll()`, `friendsPOST(friendId)`, `friendsDELETE(friendId)`, `requestsAll()`, `requestsPOST(friendId)`, `accept(friendId)`, `reject(friendId)`, `status(friendId)`, `count(userId)`, `commonGroups(userId)`, `commonHangouts(userId)`
- Theme colors: Use `colors.card` (not `cardBackground`), `colors.indigo50` (not `primaryLight`), `colors.surfaceTertiary` (not `backgroundSecondary`), `colors.error` (not `danger`), `colors.cardBorder` (not `border`)
- PowerShell shell: Use `;` to chain commands, NOT `&&`; `2>$null` for stderr redirect (not `2>nul`)
