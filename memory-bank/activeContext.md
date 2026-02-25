# Active Context

## Current Work Focus

Hangout stats accuracy fix completed. Ready for next task.

## What Was Just Accomplished

- **Fixed hangout Going/Maybe stats inaccuracy:** `Pending` RSVP attendees were incorrectly counted as "Maybe" on both backend summary and frontend mapper.

### Backend Changes

- Added `MaybeCount` property to `HangoutSummaryResponse` DTO
- Updated `HangoutsService.GetUserHangoutsAsync()` and `GetCommonHangoutsAsync()` to compute `MaybeCount` from attendees with `RSVPStatus.Maybe` (not Pending)
- Regenerated frontend TypeScript API client

### Frontend Changes

- `api-mappers.ts` — `mapRsvpStatus()`: separated `Pending` from `Maybe` (Pending now returns `'pending'`, not `'maybe'`)
- `api-mappers.ts` — `mapHangoutSummaryToHangout()`: uses `response.goingCount` (was `attendeeCount`) and `response.maybeCount` (was hardcoded 0)
- `api-mappers.ts` — `mapAttendeesToRsvpGroups()`: Pending attendees go to `pending[]` array, not `maybe[]`
- `hangouts.tsx` — RSVP "pending" filter now includes `userStatus === 'pending'`
- `hangout/[id].tsx` — Kept 3 tabs (Going/Maybe/Can't Go), no Invited tab per user preference

## Key Decisions Made

- **Separate Pending from Maybe**: Pending (hasn't responded) is distinct from Maybe (responded "maybe"). Fixes inflated Maybe counts.
- **No Invited tab on hangout detail**: User prefers keeping the detail page at 3 RSVP tabs only
- **Backend enforcement + frontend gating**: Both layers enforce restrictions — backend returns 403 for unauthorized access, frontend avoids making calls when not friends
- **Stats row stays visible for everyone**: Friend count always shown; Groups and Hangouts stats show `—` for non-friends

## Previous Context

- **Instagram-style friend actions**: "Friends" button opens bottom sheet, incoming requests show "Confirm"/"Delete" buttons, outgoing shows "Requested"
- **Dual-document pattern**: Each friendship creates two mirrored Cosmos DB documents (one per user as partition key) for efficient single-partition reads
- **FriendRequest type**: Uses `displayName`/`avatarUrl` (matching generated DTO), while `Friend` type uses `name`/`avatar` (mapped in frontend)
- **Direction casing**: Backend sends `"Incoming"`/`"Outgoing"` (PascalCase), frontend `useApiFriendshipStatus` normalizes to `"incoming"`/`"outgoing"` (lowercase)
- **Self-navigation fix**: Hangout attendee list `onPress` routes to `/(tabs)/profile` when tapping yourself instead of `/friend/${userId}`

## Remaining Work

- **Testing**: End-to-end testing of stats accuracy with various RSVP combinations
- **Error handling polish**: Some screens could benefit from retry logic on API failures

## Important Patterns & Preferences

- **Cosmos enum serialization**: Always add `[JsonConverter(typeof(StringEnumConverter))]` to enum properties in domain models
- Generated client method naming: `friendsAll()`, `friendsPOST(friendId)`, `friendsDELETE(friendId)`, `requestsAll()`, `requestsPOST(friendId)`, `accept(friendId)`, `reject(friendId)`, `status(friendId)`, `count(userId)`, `commonGroups(userId)`, `commonHangouts(userId)`
- Theme colors: Use `colors.card` (not `cardBackground`), `colors.indigo50` (not `primaryLight`), `colors.surfaceTertiary` (not `backgroundSecondary`), `colors.error` (not `danger`), `colors.cardBorder` (not `border`)
- PowerShell shell: Use `;` to chain commands, NOT `&&`; `2>$null` for stderr redirect (not `2>nul`)
