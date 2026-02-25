# Active Context

## Current Work Focus

Edit hangout page guard — preventing invite management after hangout ends.

## What Was Just Accomplished

- **Disabled "Manage Invites" on ended hangouts:** In `edit-hangout/[id].tsx`, added `hangoutStatus` and `hangoutEndTime` state variables populated from the API response. Derived an `isHangoutEnded` boolean that is `true` when `status` is `Cancelled` or `Completed`, or when `endTime` is in the past. The "Manage Invites" button is now disabled (opacity 0.5 + `disabled` prop) with a helper text explaining why when the hangout has ended.

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
