# Active Context

## Current Work Focus

RSVP improvements complete: face stack updates, Pending→Maybe merge, stats show "going/invited".

## What Was Just Accomplished

- **Optimistic face stack update on RSVP** (`HangoutsContext.tsx`):
    - `updateRSVP` now optimistically updates `attendeesPreview` (face stack), `goingCount`, `going`, and `maybe` counts — not just `userStatus`
    - When user RSVPs "going": their avatar (from `useUser().imageUrl` via Clerk) is prepended to `attendeesPreview`, going/goingCount incremented
    - When user leaves "going": avatar removed from preview, going/goingCount decremented
    - Maybe count also adjusted on transitions to/from "maybe"

- **Quick action buttons changed from "Going/Maybe" to "Going/Can't Go"** (`UpcomingHangoutsSection.tsx`):
    - Second button now sends `'not-going'` instead of `'maybe'`
    - Button label changed from "Maybe" to "Can't Go"

- **Pending attendees merged into Maybe** (`api-mappers.ts` + `HangoutsService.cs`):
    - Frontend: `mapAttendeesToRsvpGroups` routes `Pending` RSVP status into `maybe` array (detail page tabs)
    - Backend: `MaybeCount` in `GetUserHangoutsAsync` and `GetCommonHangoutsAsync` now includes both `Maybe` and `Pending` attendees

- **Hangouts tab stats changed** (`hangouts.tsx`):
    - Status row now shows "{going} going" and "{attendeeCount} invited" instead of "{going} going" and "{maybe} maybe"

## Key Decisions Made

- **Separate Pending from Maybe**: Pending (hasn't responded) is distinct from Maybe (responded "maybe"). Fixes inflated Maybe counts.
- **No Invited tab on hangout detail**: User prefers keeping the detail page at 3 RSVP tabs only
- **Backend enforcement + frontend gating**: Both layers enforce restrictions — backend returns 403 for unauthorized access, frontend avoids making calls when not friends
- **Stats row stays visible for everyone**: Friend count always shown; Groups and Hangouts stats show `—` for non-friends

## Previous Context

- **Friends list uses popover menu**: Ellipsis button on friend rows opens a small context menu (not a bottom sheet) for the "Remove Friend" action. Friend detail page still uses bottom sheets for remove/cancel actions.
- **Instagram-style friend actions on detail page**: "Friends" button opens bottom sheet, incoming requests show "Confirm"/"Delete" buttons, outgoing shows "Requested"
- **Dual-document pattern**: Each friendship creates two mirrored Cosmos DB documents (one per user as partition key) for efficient single-partition reads
- **FriendRequest type**: Uses `displayName`/`avatarUrl` (matching generated DTO), while `Friend` type uses `name`/`avatar` (mapped in frontend)
- **Direction casing**: Backend sends `"Incoming"`/`"Outgoing"` (PascalCase), frontend `useApiFriendshipStatus` normalizes to `"incoming"`/`"outgoing"` (lowercase)
- **Self-navigation fix**: Hangout attendee list `onPress` routes to `/(tabs)/profile` when tapping yourself instead of `/friend/${userId}`

## Remaining Work

- **Testing**: End-to-end testing of cancel friend request on find-friends and friend profile screens
- **Error handling polish**: Some screens could benefit from retry logic on API failures

## Important Patterns & Preferences

- **Cosmos enum serialization**: Always add `[JsonConverter(typeof(StringEnumConverter))]` to enum properties in domain models
- Generated client method naming: `friendsAll()`, `friendsPOST(friendId)`, `friendsDELETE(friendId)`, `requestsAll()`, `requestsPOST(friendId)`, `accept(friendId)`, `cancel(friendId)`, `reject(friendId)`, `status(friendId)`, `count(userId)`, `commonGroups(userId)`, `commonHangouts(userId)`
- Theme colors: Use `colors.card` (not `cardBackground`), `colors.indigo50` (not `primaryLight`), `colors.surfaceTertiary` (not `backgroundSecondary`), `colors.error` (not `danger`), `colors.cardBorder` (not `border`)
- PowerShell shell: Use `;` to chain commands, NOT `&&`; `2>$null` for stderr redirect (not `2>nul`)
