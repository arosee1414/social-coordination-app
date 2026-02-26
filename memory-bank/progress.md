# Progress

## What Works

- **Authentication**: Clerk-based auth with Google OAuth, sign-in/sign-up flows
- **User Management**: User creation, profile retrieval, profile updates via Cosmos DB
- **Groups**: Full CRUD — create (with optional members), list, detail, edit, member management
- **Hangouts**: Full CRUD — create, list, detail, edit, RSVP, attendee management
- **Friends System**: Full backend + frontend implementation
    - Backend: Cosmos Friendships container, FriendshipRecord model, FriendsService, FriendsController (8 endpoints)
    - Frontend: hooks (useApiFriends, useApiFriendRequests, useApiFriendshipStatus, useApiFriendCount), screens (friends-list, friend profile, find-friends with add friend)
    - API client regenerated with all friend endpoints
- **Friend Profile Page**: Rich friend detail page showing stats (friends count, groups in common, hangouts together), Groups in Common section, and Hangouts Together section with tappable cards. Backend endpoints: `GET /api/users/{userId}/common-groups` and `GET /api/users/{userId}/common-hangouts`
- **Friend Profile Privacy**: Common groups and hangouts data restricted to accepted friends only — backend returns 403 if not friends, frontend only fetches when friendship is accepted. Stats row shows `—` for non-friends. Data loads immediately upon accepting a friend request.
- **User Search**: Search users by name via Cosmos DB cross-partition query
- **Invite/Search Restriction**: All invite and member-selection screens (hangout invite, group add members, manage group members) now only allow selecting accepted friends and groups the user is a member of — no general user search
- **Seed Data**: Comprehensive seed data for users, groups, hangouts, and friendships
- **API Client**: Auto-generated TypeScript client via NSwag from Swagger spec
- **Theme System**: Light/dark mode with comprehensive color tokens, user-controlled dark mode toggle on Profile tab (persisted via AsyncStorage through ThemeContext)
- **Navigation**: Expo Router file-based routing with tabs, modals, and deep linking

## Recently Completed

- **Dynamic reminder banner**: Replaced the hardcoded `mockReminderBanner` on the Home screen with a real, dynamically computed banner. It only shows when the user has an upcoming hangout they haven't RSVP'd to (`userStatus === 'pending'`), displays the real hangout title and date/time, and is tappable (navigates to the hangout detail). Hidden entirely when all upcoming hangouts have been responded to.
- **Mutual friend suggestions**: Full-stack feature that suggests people the user shares groups or hangouts with but isn't friends with. Backend `GET /api/users/suggested` returns `SuggestedFriendResponse` with mutual group/hangout counts and names. Frontend `find-friends.tsx` shows a "People You May Know" section with suggestion cards when no search is active. New `useApiSuggestedFriends` hook handles data fetching with optimistic removal on friend request send.
- **Friends tab replaces Search tab**: Replaced the Search tab with a Friends tab featuring friend management (list, remove, accept/reject requests). Profile's "Manage Friends" button and Friends stat now navigate to the Friends tab.
- **Navigation restructuring**: Moved Notifications from bottom tab to stack route (accessible via bell icon on Home header).

## What's Left to Build

- **`friends-list.tsx` cleanup**: Old stack screen still exists but is no longer referenced — can be removed
- **Seed controller wiring**: Verify `SeedFriendshipsAsync` is called from SeedController
- **Notifications**: Currently mock data — needs real backend
- **Home feed**: Activity feed still uses mock data
- **Push notifications**: Not implemented
- **Image upload**: Avatar/profile photo upload not implemented
- **Offline support**: No offline caching strategy
- **Pagination**: API endpoints return all results (no cursor/page support)

## Current Status

Friends feature is functionally complete, including mutual friend suggestions based on shared groups and hangouts. Hangout stats (Going/Maybe counts) now display accurately — backend returns separate `GoingCount` and `MaybeCount` on `HangoutSummaryResponse`, and frontend correctly distinguishes Pending (no response) from Maybe (responded "maybe"). The hangout detail page uses 3 response tabs: Going, Maybe, Can't Go.

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
