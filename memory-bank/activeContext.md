# Active Context

## Current Work Focus

Light mode UI polish — improving visibility/contrast of borders and outlines.

## What Was Just Accomplished

- **Fixed light mode card border visibility:**
    - `cardBorder` in light mode was `#F3F4F6` (nearly invisible on white `#fff` backgrounds) — changed to `#E5E7EB`
    - `cardBorderHeavy` shifted from `#E5E7EB` to `#D1D5DB` to maintain the two-tier distinction
    - This globally fixes border visibility for settings cards on the profile page (Manage Friends, Notifications, etc.) and ~48 other usages across the app
    - Dark mode values unchanged (already had adequate contrast)

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
