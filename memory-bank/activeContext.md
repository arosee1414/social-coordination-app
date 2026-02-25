# Active Context — Social Coordination App

## Current Work Focus

- General UI refinements and feature improvements
- Profile page improvements (real data instead of mock)

## Recent Changes

- **Profile page now shows real data instead of mock stats**: Replaced hardcoded mock `profileStats` (24 plans, 5 groups, 32 friends) with real API data. Avatar now renders the user's `profileImageUrl` from the API (with Ionicons `person` fallback). "Plans Created" count is computed by filtering hangouts where `creatorId === user.id`. "Groups" count uses `groups.length` from `useApiGroups()`. Removed "Friends" stat (not yet implemented — Phase 2). Pull-to-refresh now refetches user, hangouts, and groups data. Added `Image` import, `useHangouts`, and `useApiGroups` hooks to the profile screen.

- **"Invite to Hangout" from group page now associates the group with the hangout (frontend-only)**: When tapping "Invite to Hangout" on the group detail page, the `groupId` is now passed through the entire create-hangout flow so the group is added to the hangout's `invitedGroupIds`.
    - `group/[id].tsx`: "Invite to Hangout" button now passes `{ groupId }` as a route param to `/create-hangout`.
    - `create-hangout.tsx`: Reads `groupId` from `useLocalSearchParams`. In direct create mode (`handleCreateHangout`), sets `req.invitedGroupIds = [groupId]`. In invite-first mode (`handleContinue`), forwards `groupId` as a param to `/invite-selection`.
    - `invite-selection.tsx`: Accepts optional `groupId` param. When present, defaults the active tab to "groups" and pre-selects that group in `selectedGroups` state. No backend changes needed — `CreateHangoutRequest.InvitedGroupIds` already existed.

- **Suggested users in invite selection (full-stack)**: The invite-selection Friends tab now shows suggested users immediately on load, without requiring the user to search. Suggested users are people from the current user's groups.
    - **Backend**: Added `GetSuggestedUsersAsync` to `IUsersService`/`UsersService` — queries all groups where the user is a member, collects unique member user IDs (excluding self), batch looks up their UserRecords, and returns as `List<UserResponse>`. Added `GET /api/users/suggested` endpoint to `UsersController`. Regenerated TypeScript API client.
    - **Frontend**: Updated `invite-selection.tsx` — fetches suggested users on mount via `api.suggested()`. When no search query is entered, displays suggested users under a "Suggested" section header. When the user types ≥2 characters, switches to search results as before. Empty state message updated to explain how to get suggested friends.

- **Fixed RSVP selection not updating on hangout detail page**: The hangout detail page read `userStatus` from `useApiHangoutDetail` but `updateRSVP` (from `HangoutsContext`) only optimistically updated the hangouts _list_ state — never the separate detail hook state. Fixed by adding a local `rsvpOverride` state in `hangout/[id].tsx` for instant visual feedback, then awaiting `updateRSVP` and calling `refetch()` on the detail hook to sync server data. Also changed `updateRSVP` return type from `void` to `Promise<void>` in `HangoutsContext`.
- **Remove invitees from invite-selection screen**: Added ability to remove existing attendees from a hangout directly in the "Add People" (invite-selection) screen.
    - When in add mode (`hangoutId` param present), the Friends tab now shows an "Already Invited" section at the top listing all current attendees with their avatar/name and a red close-circle remove button.
    - Tapping remove shows a confirmation `Alert.alert` dialog. On confirm, calls `api.attendeesDELETE(hangoutId, userId)`, optimistically removes from local state, and refetches hangouts context.
    - Loading spinner shown on the remove button while the delete request is in flight.
    - No backend changes needed — `DELETE /api/hangouts/{id}/attendees/{userId}` endpoint already existed.
- **Fixed "Can't add people to active hangouts" bug**: After adding the `DELETE /api/hangouts/{id}/attendees/{userId}` endpoint, NSwag renamed the existing POST method from `attendees` to `attendeesPOST` (and the DELETE became `attendeesDELETE`). The `invite-selection.tsx` was still calling `api.attendees(...)` which no longer existed — updated to `api.attendeesPOST(...)`. Also added `userId` field to the frontend `Attendee` type and mapper to support future remove-attendee functionality.
    - **Backend**: Added `RemoveAttendeeAsync` to `IHangoutsService`/`HangoutsService` and `DELETE /api/hangouts/{id}/attendees/{userId}` endpoint to `HangoutsController`.
    - **Frontend**: Fixed `invite-selection.tsx` call from `api.attendees()` → `api.attendeesPOST()`. Added `userId` to `Attendee` type in `types/index.ts`. Updated `mapAttendeeToDisplayAttendee` in `api-mappers.ts` to include `userId`. Updated mock data with `userId` fields. Regenerated TypeScript API client.
- **Add People to Active Hangouts (full-stack)**: Implemented ability for hangout creators to add more people (groups and individual users) to existing hangouts.
    - **Backend**: Created `AddHangoutAttendeesRequest` DTO with `InvitedGroupIds` and `InviteeUserIds`. Added `AddAttendeesAsync` to `IHangoutsService`/`HangoutsService` — expands group members into attendees, adds individual invitees, merges `InvitedGroupIds` on the hangout record, and avoids duplicates. Added `POST /api/hangouts/{id}/attendees` endpoint to `HangoutsController`.
    - **Frontend**: Updated `invite-selection.tsx` to support dual mode — when `hangoutId` query param is present, it fetches existing attendees/groups and shows them as "Already invited" (disabled), then calls the new `attendeesPOST` API endpoint instead of creating a new hangout. Added "Invite More People" button on `hangout/[id].tsx` detail page (visible to creator only, hidden for past hangouts). Regenerated TypeScript API client.
- **Avatar stacks for Going attendees on hangout cards (full-stack)**: Hangout cards now show avatar piles only for attendees who RSVP'd "Going" (previously showed any attendees). The overflow "+N" count also reflects the Going count.
    - **Backend**: Added `GoingCount` field to `HangoutSummaryResponse`. Updated `HangoutsService.GetUserHangoutsAsync` to filter `AttendeeAvatarUrls` to only Going attendees and populate `GoingCount`. Also filtered the avatar ID lookup query to only Going attendees.
    - **Frontend**: Updated `Hangout` type to include `goingCount` and allow nullable avatar URLs `(string | null)[]`. Updated `api-mappers.ts` to map `goingCount` and stop filtering out null URLs. Updated `UpcomingHangoutsSection.tsx` and `HappeningNowSection.tsx` to use `goingCount` for the overflow "+N" calculation instead of `attendeeCount`. Regenerated TypeScript API client.
- **FAB "Invite Group" → "Create Group"**: Replaced the "Invite Group" action in the home screen FAB bottom sheet with "Create Group". Updated `FABBottomSheet.tsx` (prop renamed `onInviteGroup` → `onCreateGroup`, label/subtitle changed) and `(tabs)/index.tsx` (handler now navigates to `/create-group` instead of `/(tabs)/groups`).
- **Group Admin/Creator permission enforcement (full-stack)**:
    - **Backend**: `GroupsService.AddMemberAsync` now requires Admin role (was: any member could add). `UpdateGroupAsync` and `RemoveMemberAsync` already had proper Admin checks. `DeleteGroupAsync` remains creator-only.
    - **Frontend `group/[id].tsx`**: Changed `isCreator` to `isCreatorOrAdmin` — checks if user is the creator OR has Admin role in the members list. Edit button (ellipsis icon) and "+ Add" members link are now gated behind `isCreatorOrAdmin`.
    - **Frontend `edit-group/[id].tsx`**: Updated authorization check from creator-only to creator-or-admin (checks member role from API response).
    - **Frontend `manage-group-members/[id].tsx`**: Added authorization check — fetches group data, verifies user has Admin role, redirects with alert if not.
- **Merged Pending + Maybe into unified "Maybe" status**: Users with no response (Pending) and users who explicitly chose "Maybe" now both appear in the same "Maybe" bucket throughout the app. This means invited users who haven't responded yet show up in the "Maybe" tab on the hangout detail page instead of being invisible.
    - `api-mappers.ts`: `mapRsvpStatus` now maps both `ApiRSVPStatus.Pending` and `ApiRSVPStatus.Maybe` → `'maybe'`. `mapAttendeesToRsvpGroups` puts both Pending and Maybe attendees into the `maybe` array.
    - `hangout/[id].tsx`: Renamed "Not Going" tab label to "Can't Go" for consistency with the RSVP button text.
    - `HangoutFilterSheet.tsx`: Renamed RSVP filter labels from "Pending/Accepted/Declined" to "Maybe/Going/Can't Go" for consistency.
    - `hangouts.tsx`: Updated filter logic so "Maybe" filter matches `userStatus === 'maybe' || null`, "Going" filter matches only `'going'`.
- **Hangout Invitations (full-stack)**: Implemented end-to-end invite flow for hangouts:
    - **Backend**: Added `InvitedGroupIds` and `InviteeUserIds` to `CreateHangoutRequest` and `HangoutRecord`. Created `InvitedGroupInfoResponse` DTO. Updated `HangoutResponse` to include `InvitedGroups` list. Updated `HangoutsService.CreateHangoutAsync` to expand group members into individual attendees with Pending RSVP status, and to store invited group IDs on the record. Updated `GetHangoutByIdAsync` to populate `InvitedGroups` from stored group IDs.
    - **Frontend**: Updated `invite-selection.tsx` to send selected group IDs and individual user IDs to the API. Updated `useApiHangoutDetail` hook to expose `invitedGroups`. Updated `api-mappers.ts` with `mapInvitedGroupInfoToInvitedGroup` and added Pending status to RSVP grouping. Updated `hangout/[id].tsx` to show real invited groups (tappable, navigates to group detail) and a "Pending" tab in the RSVP responses section. Removed mock data dependencies (`mockInvitedGroups`, `mockInvitedFriends`). Added `pending` field to `AttendeesByStatus` type and all usages.
    - Regenerated TypeScript API client via NSwag.
- **Fixed "+ Add" members navigation on group detail page**: The "+ Add" button in the members section of `group/[id].tsx` was navigating to `/add-members` (a create-group-flow screen with "Create Group" button and mock data). Changed it to navigate to `/manage-group-members/${groupId}` which is the proper API-backed screen for adding/removing members on an existing group, with a "Done" button.
- **Edit Group Feature**: Created `src/app/edit-group/[id].tsx` — full edit screen that fetches existing group data and pre-populates form fields (name, emoji). Includes Save Changes (`api.groupsPUT`), Manage Members navigation, and Delete Group with confirmation modal (`api.groupsDELETE`). Created `src/app/manage-group-members/[id].tsx` — screen showing current members with remove ability, and search-to-add-members functionality using `useApiUserSearch`. Registered both routes in `_layout.tsx`. Edit action wired to the `create-outline` icon in group detail header — only visible when `user.id === createdByUserId`. Group detail screen uses `useFocusEffect` to refetch data on focus, ensuring updated info displays after editing. No backend changes or API client regeneration needed (all endpoints already existed).
- **Group member display names & avatars (full-stack)**: Added `DisplayName` and `ProfileImageUrl` fields to `GroupMemberResponse` DTO. Updated `GroupsService.GetGroupByIdAsync` to look up each member's `UserRecord` from Cosmos DB and populate display name (firstName + lastName, falling back to email) and profile image URL. Regenerated TypeScript API client. Updated `mapGroupMemberToDisplayMember` in `api-mappers.ts` to use new fields. Added `userId` field to `GroupMember` type for proper navigation. Updated `group/[id].tsx` to render real avatar images (with Ionicons person fallback when no image). Navigation now uses `member.userId` instead of display name.
- **Always-visible location & notes on hangout detail**: Removed conditional rendering from location and description sections in `hangout/[id].tsx`. Now always shows "Where" row with "No location set" fallback and "Notes" row with "No notes added" fallback, both in italic lighter style when empty.
- **Always-visible location on hangout cards**: Removed conditional rendering (`{hangout.location && (...)}`) from all 3 hangout card components so the location icon and text always display. When no location is set, shows italic "No location set" in a lighter color (`colors.textTertiary` for normal cards, `rgba(255,255,255,0.6)` for live cards). Updated in `UpcomingHangoutsSection.tsx`, `HappeningNowSection.tsx`, and `hangouts.tsx`.
- **Edit Hangout Feature**: Created `src/app/edit-hangout/[id].tsx` — full edit screen that fetches existing hangout data and pre-populates form fields (title, date, time, duration, location, description). Includes Save Changes (`api.hangoutsPUT`), Manage Invites navigation, and Delete Hangout with confirmation modal (`api.hangoutsDELETE`). Registered route in `_layout.tsx`. Edit action wired to the ellipsis-vertical icon in hangout detail header — only visible when `user.id === hangout.creatorId`. Hangout detail screen uses `useFocusEffect` to refetch data on focus, ensuring updated info displays after editing. No backend changes or API client regeneration needed.
- Added text truncation with ellipsis to all hangout card views: title limited to 1 line (`numberOfLines={1}`), location limited to 2 lines (`numberOfLines={2}`) with `flex: 1` for proper text wrapping. Applied across `hangouts.tsx`, `UpcomingHangoutsSection.tsx`, and `HappeningNowSection.tsx`.
- Fixed Happening Now card layout bug: when a live event had no location, the avatar stack and Join button shifted up towards the middle of the card. Added `minHeight: 180` to card and `marginTop: 'auto'` to `bottomRow` in `HappeningNowSection.tsx` to pin the bottom row to the card bottom regardless of content.
- Fixed missing notes display on hangout detail page: added `description` field to `Hangout` type, mapped it in `api-mappers.ts`, and rendered it as a "Notes" row in the details card on `hangout/[id].tsx` (conditionally shown when description exists)
- Fixed bug in `hangout/[id].tsx` where the time badge displayed "Starts in Happening now" for live hangouts — now conditionally renders just `timeUntil` for live/past statuses and `"Starts {timeUntil}"` for upcoming
- Previously: Added **Self-Improving Cline Reflection** rule to `.clinerules`
- Previously: Added **Cline's Memory Bank** rule to `.clinerules`
- Previously: Created initial memory bank core files
- Previously: Duration picker feature for create-hangout (8h default, 24h max)
- Previously: Backend Phase 1 implementation (Users, Groups, Hangouts CRUD with Cosmos DB)
- Previously: Frontend connected to real backend API with generated TypeScript client

## Next Steps

- Test hangout invite flow end-to-end (create hangout → invite groups/friends → verify on detail page)
- Continue feature development per implementation plans
- Future Phase 2: Friends system, push notifications, activity feed, friend profiles, integration tests

## Active Decisions and Considerations

- API client is auto-generated via NSwag — never manually edit `generatedClient.ts`
- Backend defaults hangout duration to 8 hours when no EndTime is provided
- Frontend `isLive` function uses 8-hour fallback (matching backend default)
- Shell environment is PowerShell — use `;` for command chaining, not `&&`
- `dotnet run` is a blocking/long-running command — when regenerating the API client, steps 2–4 (curl swagger, nswag generate, verify) must run in separate terminals while the backend server stays running in the background

## Important Patterns and Preferences

- Use `replace_in_file` for surgical changes; `write_to_file` for new files or major rewrites
- Always regenerate API client when backend DTOs/controllers change (see `.clinerules`)
- Implementation plans are documented in markdown files at project root
- Seed data is available via `SeedController` for development testing

## Learnings and Project Insights

- PowerShell's `curl` is an alias for `Invoke-WebRequest`
- `pwsh` is not available on this system; use PowerShell commands directly
- The editor auto-formats markdown (adjusts indentation, converts `*` to `_` for italics, adds blank lines)
