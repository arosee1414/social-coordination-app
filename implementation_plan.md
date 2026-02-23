# Implementation Plan

[Overview]
Wire the React Native frontend to the .NET backend API using the generated NSwag client, replacing mock data with real API calls where endpoints exist, and create a dev-only seed endpoint to populate the Cosmos DB with test data.

The app currently uses hardcoded mock data throughout all screens (hangouts, groups, profile, friends, notifications). A full NSwag-generated TypeScript client exists at `src/clients/generatedClient.ts` with methods for Users, Groups, Hangouts, and Health endpoints. An Axios-based API client factory exists at `src/clients/api-client.ts` that injects Clerk auth tokens. The goal is to:

1. Create an `ApiClientProvider` React context that instantiates the generated client with auth
2. Build custom data-fetching hooks for each domain (users, groups, hangouts)
3. Refactor existing contexts (`HangoutsContext`) and screens to use API data
4. Create adapter/mapper functions to convert API response types to frontend display types
5. Add a dev-only seed endpoint on the backend to populate test data
6. Keep mock data in place for screens/features that have no backend endpoint yet

**Clerk User ID for seed data:** `user_3A2C64uTqFecw5hrDfTAugiid0s`

**What gets wired to API (has backend endpoints):**

- Profile screen → `meGET()` for current user
- Groups tab → `groupsAll()` for groups list
- Group detail → `groupsGET(id)` for single group with members
- Hangouts tab + Home screen → `hangoutsAll()` for hangouts list
- Hangout detail → `hangoutsGET(id)` for single hangout with attendees
- RSVP → `rsvp(id, body)` for updating RSVP status
- Create hangout → `hangoutsPOST(body)`
- Create group → `groupsPOST(body)`
- User search (find-friends) → `search(query)`
- User registration → `mePOST(body)` after Clerk sign-up

**What stays as mock data (no backend endpoint):**

- `mockRecentActivity`, `mockReminderBanner` (home screen widgets)
- `mockNotifications` (NotificationsContext)
- `mockFriendProfiles`, `mockFriendGroupsInCommon`, `mockFriendUpcomingHangouts`, `mockFriendRecentActivities` (friend detail screen)
- `mockSuggestedFriends` (find-friends suggested section)
- `profileStats`, `settingsSections` (profile screen static UI)
- `emojiOptions`, `groupBgColors` (UI constants)
- `mockInvitedGroups`, `mockInvitedFriends` (hangout detail — partially; attendees come from API but invited groups/friends stay mock)

[Types]
Minimal type changes needed since the generated client already provides response types. Adapter functions bridge API types to existing frontend types.

**No new TypeScript types need to be created.** The existing frontend types in `src/types/index.ts` (`Hangout`, `Notification`, etc.) will continue to be used for UI rendering. Adapter/mapper functions will convert from the generated client response types (`HangoutSummaryResponse`, `GroupSummaryResponse`, `UserResponse`, etc.) to the frontend types.

**Key type mappings needed:**

- `HangoutSummaryResponse` → `Hangout` (for list views)
- `HangoutResponse` → Extended hangout detail (for detail view, includes attendees)
- `GroupSummaryResponse` → `{ id, name, icon, memberCount }` (for groups list)
- `GroupResponse` → Extended group detail (includes members array)
- `UserResponse` → Profile display data (name, email, avatar)
- `HangoutAttendeeResponse` → Attendee display data with RSVP status

**API response types from generated client (already exist in `generatedClient.ts`):**

- `UserResponse`: id, clerkUserId, displayName, email, avatarUrl, phoneNumber, createdAt, updatedAt
- `GroupSummaryResponse`: id, name, icon, memberCount, createdAt
- `GroupResponse`: id, name, icon, createdByUserId, members (GroupMemberResponse[]), createdAt, updatedAt
- `GroupMemberResponse`: userId, displayName, avatarUrl, role, joinedAt
- `HangoutSummaryResponse`: id, title, scheduledAt, location, status, attendeeCount, userRsvpStatus, createdByDisplayName
- `HangoutResponse`: id, title, description, scheduledAt, location, locationDetail, status, createdByUserId, createdByDisplayName, groupId, attendees (HangoutAttendeeResponse[]), createdAt, updatedAt
- `HangoutAttendeeResponse`: userId, displayName, avatarUrl, rsvpStatus, respondedAt

[Files]
New files to create and existing files to modify across both frontend and backend.

**New files to create:**

1. `social-coordination-app/social-coordination-app-ux/src/contexts/ApiClientContext.tsx`
    - React context that creates and provides the `SocialCoordinationApiClient` instance
    - Uses `useAuth().getToken` from Clerk to inject auth tokens via the Axios instance from `api-client.ts`

2. `social-coordination-app/social-coordination-app-ux/src/hooks/useApiClient.ts`
    - Simple hook to access the API client from context

3. `social-coordination-app/social-coordination-app-ux/src/hooks/useApiUser.ts`
    - Hook for current user operations: fetch profile (`meGET`), create user (`mePOST`), update user (`mePUT`)
    - Returns `{ user, loading, error, refetch, createUser, updateUser }`

4. `social-coordination-app/social-coordination-app-ux/src/hooks/useApiGroups.ts`
    - Hook for groups list: fetch all (`groupsAll`)
    - Returns `{ groups, loading, error, refetch, createGroup }`

5. `social-coordination-app/social-coordination-app-ux/src/hooks/useApiGroupDetail.ts`
    - Hook for single group: fetch by id (`groupsGET`)
    - Returns `{ group, members, loading, error, refetch }`

6. `social-coordination-app/social-coordination-app-ux/src/hooks/useApiHangouts.ts`
    - Hook for hangouts list: fetch all (`hangoutsAll`)
    - Returns `{ hangouts, loading, error, refetch }`

7. `social-coordination-app/social-coordination-app-ux/src/hooks/useApiHangoutDetail.ts`
    - Hook for single hangout: fetch by id (`hangoutsGET`), update RSVP (`rsvp`)
    - Returns `{ hangout, attendees, loading, error, refetch, updateRSVP }`

8. `social-coordination-app/social-coordination-app-ux/src/hooks/useApiUserSearch.ts`
    - Hook for user search: search users (`search`)
    - Returns `{ results, loading, error, searchUsers }`

9. `social-coordination-app/social-coordination-app-ux/src/utils/api-mappers.ts`
    - Adapter functions to convert API response types to frontend display types
    - `mapHangoutSummaryToHangout(response: HangoutSummaryResponse): Hangout`
    - `mapGroupSummaryToGroup(response: GroupSummaryResponse): GroupDisplayData`
    - `mapAttendeeResponseToAttendee(response: HangoutAttendeeResponse): AttendeeDisplayData`
    - `formatTimeUntil(scheduledAt: Date): string`

10. `social-coordination-app/Backend/SocialCoordinationApp/Controllers/SeedController.cs`
    - Dev-only controller with `POST /api/seed` endpoint
    - Only registered when `ASPNETCORE_ENVIRONMENT=Development`
    - Seeds users, groups, hangouts with test data tied to Clerk user ID `user_3A2C64uTqFecw5hrDfTAugiid0s`

11. `social-coordination-app/Backend/SocialCoordinationApp/Services/SeedService.cs`
    - Service containing seed data definitions and Cosmos DB insertion logic
    - Creates: 1 real user (tied to Clerk ID), 5 fake friend users, 3 groups with members, 4 hangouts with attendees

**Existing files to modify:**

12. `social-coordination-app/social-coordination-app-ux/src/app/_layout.tsx`
    - Wrap app with `ApiClientProvider` inside the `ClerkLoaded` block

13. `social-coordination-app/social-coordination-app-ux/src/contexts/HangoutsContext.tsx`
    - Replace `mockHangouts` initialization with API fetch via `useApiHangouts`
    - Replace local `updateRSVP` with API call via `useApiHangoutDetail`
    - Keep the context interface the same so consuming screens don't break

14. `social-coordination-app/social-coordination-app-ux/src/app/(tabs)/index.tsx` (Home screen)
    - Use `HangoutsContext` (which now fetches from API) — no direct changes needed since it already uses context
    - Keep `mockRecentActivity` and `mockReminderBanner` as-is

15. `social-coordination-app/social-coordination-app-ux/src/app/(tabs)/hangouts.tsx`
    - Already uses `HangoutsContext` — no direct changes needed since context will fetch from API

16. `social-coordination-app/social-coordination-app-ux/src/app/(tabs)/groups.tsx`
    - Replace `mockGroups` with `useApiGroups` hook
    - Add loading and error states
    - Keep `groupBgColors` for UI styling

17. `social-coordination-app/social-coordination-app-ux/src/app/(tabs)/profile.tsx`
    - Replace hardcoded "Your Name" / "user@example.com" with `useApiUser` data
    - Keep `profileStats`, `settingsSections` as mock

18. `social-coordination-app/social-coordination-app-ux/src/app/hangout/[id].tsx`
    - Replace `useHangouts` hangout lookup with `useApiHangoutDetail(id)`
    - Replace `mockAttendees` with API attendees data mapped by RSVP status
    - Wire RSVP buttons to API `updateRSVP` method
    - Keep `mockInvitedGroups`, `mockInvitedFriends` as mock

19. `social-coordination-app/social-coordination-app-ux/src/app/group/[id].tsx`
    - Replace `mockGroups` lookup with `useApiGroupDetail(id)`
    - Replace `mockGroupMembers` with API members data
    - Add loading/error states
    - Keep `groupBgColors` for UI styling

20. `social-coordination-app/social-coordination-app-ux/src/app/create-hangout.tsx`
    - Wire "Continue to Invite" button to actually create hangout via `hangoutsPOST`
    - Pass created hangout ID to invite-selection screen

21. `social-coordination-app/social-coordination-app-ux/src/app/create-group.tsx`
    - Wire "Continue to Add Members" to create group via `groupsPOST`
    - Pass created group ID to add-members screen

22. `social-coordination-app/social-coordination-app-ux/src/app/find-friends.tsx`
    - Replace `mockFriends` contact filtering with `useApiUserSearch` hook
    - Keep the invite link copy functionality as-is

23. `social-coordination-app/Backend/SocialCoordinationApp/Program.cs`
    - Conditionally register `SeedService` and map seed endpoint only in Development environment

**Files that require NO changes (keep using mock data):**

- `src/app/(tabs)/notifications.tsx` — uses NotificationsContext (no API)
- `src/contexts/NotificationsContext.tsx` — keeps using mockNotifications
- `src/app/friend/[id].tsx` — keeps using mockFriendProfiles
- `src/app/invite-selection.tsx` — keeps using mock data
- `src/app/add-members.tsx` — keeps using mock data
- `src/data/mock-data.ts` — remains for screens still using mock data

[Functions]
New functions and modifications to existing functions.

**New functions:**

1. `createApiClientContext()` — in `ApiClientContext.tsx`
    - Creates React context for `SocialCoordinationApiClient`
    - Signature: `function ApiClientProvider({ children }: { children: React.ReactNode }): JSX.Element`

2. `useApiClient()` — in `useApiClient.ts`
    - Signature: `function useApiClient(): SocialCoordinationApiClient`
    - Throws if used outside provider

3. `useApiUser()` — in `useApiUser.ts`
    - Signature: `function useApiUser(): { user: UserResponse | null; loading: boolean; error: string | null; refetch: () => Promise<void>; createUser: (req: CreateUserRequest) => Promise<void>; updateUser: (req: UpdateUserRequest) => Promise<void> }`
    - Fetches current user profile via `meGET()` on mount

4. `useApiGroups()` — in `useApiGroups.ts`
    - Signature: `function useApiGroups(): { groups: GroupSummaryResponse[]; loading: boolean; error: string | null; refetch: () => Promise<void>; createGroup: (req: CreateGroupRequest) => Promise<GroupResponse> }`
    - Fetches all groups via `groupsAll()` on mount

5. `useApiGroupDetail(groupId: string)` — in `useApiGroupDetail.ts`
    - Signature: `function useApiGroupDetail(groupId: string): { group: GroupResponse | null; loading: boolean; error: string | null; refetch: () => Promise<void> }`
    - Fetches single group via `groupsGET(groupId)` on mount

6. `useApiHangouts()` — in `useApiHangouts.ts`
    - Signature: `function useApiHangouts(): { hangouts: HangoutSummaryResponse[]; loading: boolean; error: string | null; refetch: () => Promise<void> }`
    - Fetches all hangouts via `hangoutsAll()` on mount

7. `useApiHangoutDetail(hangoutId: string)` — in `useApiHangoutDetail.ts`
    - Signature: `function useApiHangoutDetail(hangoutId: string): { hangout: HangoutResponse | null; loading: boolean; error: string | null; refetch: () => Promise<void>; updateRSVP: (status: string) => Promise<void> }`
    - Fetches single hangout via `hangoutsGET(hangoutId)`, RSVP via `rsvp(hangoutId, body)`

8. `useApiUserSearch()` — in `useApiUserSearch.ts`
    - Signature: `function useApiUserSearch(): { results: UserResponse[]; loading: boolean; searchUsers: (query: string) => Promise<void> }`
    - Calls `search(query)` on demand

9. `mapHangoutSummaryToHangout(response: HangoutSummaryResponse): Hangout` — in `api-mappers.ts`
    - Maps API response fields to the frontend `Hangout` type used by UI components
    - Computes `timeUntil` from `scheduledAt`, maps `status`, `userRsvpStatus`

10. `mapGroupSummaryToDisplayData(response: GroupSummaryResponse): { id, name, icon, memberCount }` — in `api-mappers.ts`

11. `mapAttendeesToRsvpGroups(attendees: HangoutAttendeeResponse[]): { going, maybe, notGoing }` — in `api-mappers.ts`
    - Groups attendees by RSVP status for the hangout detail tabs

12. `formatTimeUntil(scheduledAt: Date): string` — in `api-mappers.ts`
    - Returns human-readable "in 2 hours", "Tomorrow at 3 PM", etc.

**Modified functions:**

13. `HangoutsProvider` in `src/contexts/HangoutsContext.tsx`
    - Currently: initializes state from `mockHangouts`
    - Change: Initialize empty, fetch from `hangoutsAll()` via `useApiHangouts` on mount, map results to `Hangout[]`
    - `updateRSVP` function: Currently updates local state only → Change to call API's `rsvp()` then update local state on success

14. `GroupsScreen` in `src/app/(tabs)/groups.tsx`
    - Currently: reads `mockGroups` directly
    - Change: call `useApiGroups()`, show loading spinner, render from API data

15. `ProfileScreen` in `src/app/(tabs)/profile.tsx`
    - Currently: hardcoded "Your Name" / "user@example.com"
    - Change: call `useApiUser()`, display `user.displayName` and `user.email`

16. `HangoutDetailScreen` in `src/app/hangout/[id].tsx`
    - Currently: finds hangout from HangoutsContext, uses `mockAttendees`
    - Change: call `useApiHangoutDetail(id)`, map attendees from API, wire RSVP to API

17. `GroupDetailScreen` in `src/app/group/[id].tsx`
    - Currently: reads `mockGroups` and `mockGroupMembers`
    - Change: call `useApiGroupDetail(id)`, render group and members from API

18. `CreateHangoutScreen` in `src/app/create-hangout.tsx`
    - Currently: navigates to invite-selection on submit
    - Change: call `hangoutsPOST()` to create hangout, then navigate with hangout ID

19. `CreateGroupScreen` in `src/app/create-group.tsx`
    - Currently: navigates to add-members on submit
    - Change: call `groupsPOST()` to create group, then navigate with group ID

20. `FindFriendsScreen` in `src/app/find-friends.tsx`
    - Currently: filters `mockFriends` by search text
    - Change: call `useApiUserSearch()` to search via API with debounce

**New backend functions:**

21. `SeedController.Seed()` — `POST /api/seed`
    - Checks environment is Development
    - Calls `SeedService.SeedAsync()`
    - Returns 200 with summary of created records

22. `SeedService.SeedAsync()` — creates all test data in Cosmos DB
    - Creates 6 users (1 real + 5 fake friends)
    - Creates 3 groups with members
    - Creates 4 hangouts with attendees and RSVP statuses

[Classes]
Class additions and modifications.

**New classes (Backend):**

1. `SeedController` — `social-coordination-app/Backend/SocialCoordinationApp/Controllers/SeedController.cs`
    - Inherits from `BaseApiController`
    - Route: `api/seed`
    - Methods: `[HttpPost] Seed()` — calls SeedService to populate DB
    - Only registered in Development environment

2. `SeedService` — `social-coordination-app/Backend/SocialCoordinationApp/Services/SeedService.cs`
    - Constructor injection: `ICosmosContext cosmosContext`
    - Methods: `Task<SeedResult> SeedAsync()` — inserts seed data into Cosmos containers
    - Contains hardcoded test data matching the mock data patterns from the frontend

3. `ISeedService` — `social-coordination-app/Backend/SocialCoordinationApp/Services/ISeedService.cs`
    - Interface: `Task<SeedResult> SeedAsync()`

4. `SeedResult` — inline class or record in SeedService
    - Properties: `int UsersCreated`, `int GroupsCreated`, `int HangoutsCreated`

**New classes (Frontend — React contexts/providers):**

5. `ApiClientProvider` — `src/contexts/ApiClientContext.tsx`
    - React context provider component
    - Creates `SocialCoordinationApiClient` instance using `createApiClient(getToken)` from `api-client.ts`
    - Memoizes client to prevent re-creation on re-renders

**Modified classes:**

6. `HangoutsProvider` in `src/contexts/HangoutsContext.tsx`
    - Add `useApiClient()` dependency
    - Add `useEffect` to fetch hangouts on mount via `hangoutsAll()`
    - Modify `updateRSVP` to call API before updating local state

**No classes to delete.**

[Dependencies]
No new npm packages required. No new NuGet packages required.

**Frontend:**

- No new dependencies needed. The existing `axios` package and `@clerk/clerk-expo` provide everything needed for the API client.
- The generated client (`generatedClient.ts`) already exists and provides all API method wrappers.

**Backend:**

- No new NuGet packages needed. The existing `Microsoft.Azure.Cosmos` SDK and ASP.NET Core middleware are sufficient.
- The seed endpoint uses only existing infrastructure (`ICosmosContext`).

[Testing]
Manual testing approach through the seed endpoint and app UI verification.

**Backend seed endpoint testing:**

1. Start backend in Development mode
2. Call `POST http://localhost:5065/api/seed` (no auth required for seed endpoint)
3. Verify response contains counts of created records
4. Verify data exists in Cosmos DB via Azure Data Explorer or subsequent API calls

**Frontend integration testing:**

1. After seeding, sign in with the Clerk test user (`user_3A2C64uTqFecw5hrDfTAugiid0s`)
2. Verify Profile screen shows real user name/email from API
3. Verify Groups tab loads groups from API
4. Verify Group detail shows members from API
5. Verify Hangouts tab loads hangouts from API
6. Verify Hangout detail shows attendees from API
7. Verify RSVP buttons update via API and reflect changes
8. Verify Create Hangout submits to API
9. Verify Create Group submits to API
10. Verify Find Friends search calls API

**Error handling verification:**

- Test with backend offline — verify loading states and error messages display properly
- Test with no data — verify empty states still render correctly

**No automated test files to create at this stage** — the focus is on wiring up the integration. Unit tests can be added in a follow-up task.

[Implementation Order]
Sequential implementation steps to minimize conflicts and ensure each step can be verified before proceeding.

1. **Backend: Create seed endpoint and service** — Create `ISeedService`, `SeedService`, and `SeedController`. Register in `Program.cs` for Development only. Test by calling the endpoint and verifying data in Cosmos DB.

2. **Frontend: Create ApiClientProvider context** — Create `ApiClientContext.tsx` and `useApiClient.ts`. Wire into `_layout.tsx` inside `ClerkLoaded`. This is the foundation all hooks depend on.

3. **Frontend: Create API mapper utilities** — Create `api-mappers.ts` with all mapping functions. These are pure functions with no dependencies, so they can be built and tested independently.

4. **Frontend: Create useApiUser hook and wire Profile screen** — Create `useApiUser.ts`. Update `profile.tsx` to show real user data. This is the simplest screen to verify the API pipeline works end-to-end.

5. **Frontend: Create useApiGroups hook and wire Groups tab** — Create `useApiGroups.ts`. Update `groups.tsx` to fetch from API with loading/error states.

6. **Frontend: Create useApiGroupDetail hook and wire Group detail** — Create `useApiGroupDetail.ts`. Update `group/[id].tsx` to fetch from API.

7. **Frontend: Create useApiHangouts hook and refactor HangoutsContext** — Create `useApiHangouts.ts`. Refactor `HangoutsContext.tsx` to fetch from API on mount. This automatically updates Home screen and Hangouts tab since they consume the context.

8. **Frontend: Create useApiHangoutDetail hook and wire Hangout detail** — Create `useApiHangoutDetail.ts`. Update `hangout/[id].tsx` to fetch from API, map attendees, wire RSVP.

9. **Frontend: Wire Create Hangout and Create Group forms** — Update `create-hangout.tsx` and `create-group.tsx` to submit to API on form completion.

10. **Frontend: Create useApiUserSearch hook and wire Find Friends** — Create `useApiUserSearch.ts`. Update `find-friends.tsx` to search via API.

11. **Verify end-to-end** — Run backend, call seed endpoint, launch app, verify all screens work with real data. Confirm mock data still displays where no API endpoint exists.
