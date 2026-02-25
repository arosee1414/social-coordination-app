# Active Context

## Current Work Focus

Friends feature full-stack implementation is **complete** — backend and frontend are wired up with real API data.

## What Was Just Accomplished

- **Full backend Friends system**: Cosmos Friendships container, FriendshipRecord domain model, enums (FriendshipStatus, FriendshipDirection), DTOs (FriendResponse, FriendRequestResponse, FriendshipStatusResponse, FriendCountResponse), FriendsService with full CRUD, FriendsController with 8 endpoints, seed data for friendships
- **API client regeneration**: Swagger spec downloaded, TypeScript client regenerated via NSwag — all friend endpoints available as generated methods
- **Frontend types & mappers**: Added Friend, FriendRequest, FriendshipStatus types to `types/index.ts`; added mapper functions in `api-mappers.ts`
- **Frontend hooks**: Created `useApiFriends`, `useApiFriendRequests`, `useApiFriendshipStatus`, `useApiFriendCount` — all wired to real API via generated client
- **Updated screens**: `friends-list.tsx` (new full screen with tabs for friends/requests), `friend/[id].tsx` (friend profile with real data, friendship actions), `find-friends.tsx` (add friend / pending state buttons instead of invite)
- **Fixed all TypeScript build errors**: Corrected color names (e.g., `cardBackground` → `card`, `primaryLight` → `indigo50`, `backgroundSecondary` → `surfaceTertiary`, `danger` → `error`), fixed property names to match `Friend`/`FriendRequest` types, fixed generated client method names

## Key Decisions Made

- **Dual-document pattern**: Each friendship creates two mirrored Cosmos DB documents (one per user as partition key) for efficient single-partition reads
- **No user-by-id endpoint**: Friend profile screen fetches user info from friends list first, falls back to search API
- **FriendRequest type**: Uses `displayName`/`avatarUrl` (matching generated DTO), while `Friend` type uses `name`/`avatar` (mapped in frontend)
- **Direction casing**: Backend sends `"Incoming"`/`"Outgoing"` (PascalCase), frontend `useApiFriendshipStatus` normalizes to `"incoming"`/`"outgoing"` (lowercase)

## Remaining Work

- **Profile page integration**: `profile.tsx` still needs to import `useApiFriendCount` to show real friend count and link to `/friends-list`
- **Seed data**: Need to verify `SeedFriendshipsAsync` is called from the seed controller (it was added to SeedService but may need wiring)
- **Testing**: End-to-end testing of friend request flow (send, accept, reject, remove)
- **Error handling polish**: Some screens could benefit from retry logic on API failures

## Important Patterns & Preferences

- Generated client method naming: `friendsAll()`, `friendsPOST(friendId)`, `friendsDELETE(friendId)`, `requestsAll()`, `requestsPOST(friendId)`, `accept(friendId)`, `reject(friendId)`, `status(friendId)`, `count(userId)`
- Theme colors: Use `colors.card` (not `cardBackground`), `colors.indigo50` (not `primaryLight`), `colors.surfaceTertiary` (not `backgroundSecondary`), `colors.error` (not `danger`), `colors.cardBorder` (not `border`)
- PowerShell shell: Use `;` to chain commands, NOT `&&`; `2>$null` for stderr redirect (not `2>nul`)
