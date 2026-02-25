# Progress

## What Works

- **Authentication**: Clerk-based auth with Google OAuth, sign-in/sign-up flows
- **User Management**: User creation, profile retrieval, profile updates via Cosmos DB
- **Groups**: Full CRUD — create, list, detail, edit, member management
- **Hangouts**: Full CRUD — create, list, detail, edit, RSVP, attendee management
- **Friends System (NEW)**: Full backend + frontend implementation
    - Backend: Cosmos Friendships container, FriendshipRecord model, FriendsService, FriendsController (8 endpoints)
    - Frontend: hooks (useApiFriends, useApiFriendRequests, useApiFriendshipStatus, useApiFriendCount), screens (friends-list, friend profile, find-friends with add friend)
    - API client regenerated with all friend endpoints
- **User Search**: Search users by name via Cosmos DB cross-partition query
- **Invite/Search Restriction**: All invite and member-selection screens (hangout invite, group add members, manage group members) now only allow selecting accepted friends and groups the user is a member of — no general user search
- **Seed Data**: Comprehensive seed data for users, groups, hangouts, and friendships
- **API Client**: Auto-generated TypeScript client via NSwag from Swagger spec
- **Theme System**: Light/dark mode with comprehensive color tokens
- **Navigation**: Expo Router file-based routing with tabs, modals, and deep linking

## What's Left to Build

- **Profile page friend count**: `profile.tsx` needs `useApiFriendCount` integration and link to `/friends-list`
- **Seed controller wiring**: Verify `SeedFriendshipsAsync` is called from SeedController
- **Notifications**: Currently mock data — needs real backend
- **Home feed**: Activity feed still uses mock data
- **Push notifications**: Not implemented
- **Image upload**: Avatar/profile photo upload not implemented
- **Offline support**: No offline caching strategy
- **Pagination**: API endpoints return all results (no cursor/page support)

## Current Status

Friends feature is functionally complete with all build errors resolved. The feature follows the dual-document pattern in Cosmos DB for efficient reads. Frontend screens are wired to real API data. Invite/search screens restricted to friends-only. Minor integration work remains (profile page friend count display).

## Known Issues

- PowerShell `2>nul` redirect doesn't work — must use `2>$null`
- Generated client uses NSwag naming conventions: `friendsAll()`, `friendsPOST()`, etc. — not customizable without config changes
- No user-by-id endpoint — friend profile uses friends list + search as fallback

## Evolution of Project Decisions

1. **Cosmos DB chosen** over SQL for flexible document model and partition-based scaling
2. **Dual-document pattern** for friendships — two writes per mutation, but fast single-partition reads
3. **Separate Friendships container** — keeps UserRecord clean, avoids unbounded growth
4. **NSwag for API client generation** — auto-generates TypeScript from Swagger, reducing manual API layer maintenance
5. **Expo Router file-based routing** — screens auto-registered by file location, no manual route config needed
