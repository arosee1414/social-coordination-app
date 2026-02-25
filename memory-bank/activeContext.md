# Active Context

## Current Work Focus

Group creation enhancement — adding member selection during group creation.

## What Was Just Accomplished

- **Add members during group creation**: Added an "Add Members" / "Manage Members" button to `create-group.tsx` (matching the same button pattern from `edit-group/[id].tsx`). Uses a shared state module (`pendingGroupMembers.ts`) + `useFocusEffect` + `router.back()` pattern to pass selected member IDs between screens without stack buildup. The `CreateGroupRequest` now includes `memberUserIds` when members are selected. The backend already supported `MemberUserIds` on `CreateGroupRequest` — this was a frontend-only change.
- **Shared state for cross-screen data**: Created `src/utils/pendingGroupMembers.ts` — a simple mutable object that `create-group` writes to before pushing `add-members`, and `add-members` writes to before calling `router.back()`. `create-group` re-reads via `useFocusEffect`. This avoids `router.navigate`/`router.replace` which caused duplicate screen entries in the stack.

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
