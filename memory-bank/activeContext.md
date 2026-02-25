# Active Context

## Current Work Focus

Friends list UX polish completed. Ready for next task.

## What Was Just Accomplished

- **friends-list.tsx UX improvements:**
    - Made outgoing "Requested" badge non-interactive (changed from `TouchableOpacity` to `View`, removed `handleCancelRequest` and `cancelRequest` from hook destructuring) — cancel is only done from find-friends or friend profile screens
    - Added `useFocusEffect` to refetch friends and requests when the screen regains focus (e.g. returning from friend profile after accepting/canceling)
    - Added `refetch: refetchRequests` from `useApiFriendRequests` hook
- **find-friends.tsx keyboard fix:**
    - Added `keyboardShouldPersistTaps="handled"` to FlatList so taps on buttons and profile rows pass through even when the keyboard is open

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
