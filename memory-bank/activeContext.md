# Active Context

## Current Work Focus

Dark mode UI refinement for friends screens.

## What Was Just Accomplished

- **Removed card background from friend list rows in dark mode** (`friends-list.tsx`, `find-friends.tsx`):
    - Removed `backgroundColor: colors.card` from list item rows on both screens
    - In dark mode, `colors.card` (`#1C1C1E`) was visibly different from `colors.background` (`#151718`), creating an unwanted card effect around each person row
    - In light mode, both colors were `#fff` so this change has no visual impact there
    - Affected: `renderFriendItem`, `renderIncomingRequestItem`, `renderOutgoingRequestItem` in friends-list; `renderUserItem` in find-friends

## Key Decisions Made

- **Separate Pending from Maybe**: Pending (hasn't responded) is distinct from Maybe (responded "maybe"). Fixes inflated Maybe counts.
- **No Invited tab on hangout detail**: User prefers keeping the detail page at 3 RSVP tabs only
- **Backend enforcement + frontend gating**: Both layers enforce restrictions — backend returns 403 for unauthorized access, frontend avoids making calls when not friends
- **Stats row stays visible for everyone**: Friend count always shown; Groups and Hangouts stats show `—` for non-friends

## Previous Context

- **Friends list uses popover menu**: Ellipsis button on friend rows opens a small context menu (not a bottom sheet) for the "Remove Friend" action. Friend detail page still uses bottom sheets for remove/cancel actions.
- **Instagram-style friend actions on detail page**: "Friends" button opens bottom sheet, incoming requests show "Confirm"/"Delete" buttons, outgoing shows "Requested"
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
