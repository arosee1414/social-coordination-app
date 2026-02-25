# Active Context

## Current Work Focus

Bug fixes and polish — fixing navigation issues after destructive actions (e.g., group deletion).

## What Was Just Accomplished

- **Fixed group deletion navigation bug**: After deleting a group from `edit-group/[id].tsx`, the app was routing to the Home tab instead of the Groups tab. Root cause: `router.replace('/(tabs)/groups')` from a stack screen doesn't reliably activate the correct tab — the tab navigator defaults to its initial route (Home). Fix: Added `router.dismissAll()` before `router.replace('/(tabs)/groups')` to first pop all stacked screens back to the tab navigator, then navigate to the Groups tab.

## Key Decisions Made

- **Frontend-only changes**: No backend changes were needed — `GET /api/friends` already returns only accepted friends, `GET /api/groups` already returns only user's groups
- **Client-side filtering**: Since the friends list is typically small, all filtering is done client-side instead of API-side search. This is simpler and more responsive.
- **Consistent empty states**: All three screens now show proper empty states with "Find Friends" CTA when user has no friends, following existing design patterns

## Previous Context

- **Dual-document pattern**: Each friendship creates two mirrored Cosmos DB documents (one per user as partition key) for efficient single-partition reads
- **FriendRequest type**: Uses `displayName`/`avatarUrl` (matching generated DTO), while `Friend` type uses `name`/`avatar` (mapped in frontend)
- **Direction casing**: Backend sends `"Incoming"`/`"Outgoing"` (PascalCase), frontend `useApiFriendshipStatus` normalizes to `"incoming"`/`"outgoing"` (lowercase)

## Remaining Work

- **Testing**: End-to-end testing of invite flow with friends-only restriction
- **Error handling polish**: Some screens could benefit from retry logic on API failures

## Important Patterns & Preferences

- **Cosmos enum serialization**: Always add `[JsonConverter(typeof(StringEnumConverter))]` to enum properties in domain models
- Generated client method naming: `friendsAll()`, `friendsPOST(friendId)`, `friendsDELETE(friendId)`, `requestsAll()`, `requestsPOST(friendId)`, `accept(friendId)`, `reject(friendId)`, `status(friendId)`, `count(userId)`
- Theme colors: Use `colors.card` (not `cardBackground`), `colors.indigo50` (not `primaryLight`), `colors.surfaceTertiary` (not `backgroundSecondary`), `colors.error` (not `danger`), `colors.cardBorder` (not `border`)
- PowerShell shell: Use `;` to chain commands, NOT `&&`; `2>$null` for stderr redirect (not `2>nul`)
