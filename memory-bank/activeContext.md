# Active Context

## Current Work Focus

Invite/search restriction feature is **complete** — all invite and member-selection screens now only allow friends (accepted friendships) and groups the user is a member of.

## What Was Just Accomplished

- **Restricted invite-selection.tsx (hangout invite)**: Replaced `useApiUserSearch` (general user search) and `api.suggested()` (suggested users) with `useApiFriends` hook. Friends tab now shows only accepted friends, filtered client-side by search query. Added empty state with "Find Friends" CTA when user has no friends.
- **Restricted add-members.tsx (group creation)**: Replaced `mockFriends` (mock data) with `useApiFriends` hook. Now uses real friend data with proper avatar images and client-side search filtering. Added empty state with "Find Friends" CTA.
- **Restricted manage-group-members/[id].tsx (manage group members)**: Replaced `useApiUserSearch` (general user search) with `useApiFriends` hook. Friends are filtered to exclude existing group members, then filtered by search query client-side. No more debounced API search — instant client-side filtering.
- **Groups tab already correct**: `useApiGroups` hook returns only groups the user is a member of — no changes needed.

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
