# Active Context

## Current Work Focus

Instagram-style redesign of friend action buttons (remove friend, accept/decline requests).

## What Was Just Accomplished

- **Instagram-style friend actions redesign** across two screens:

    **Friend Profile Page (`friend/[id].tsx`):**
    - "Friends" status now shows as a single muted button (gray bg) with people icon + chevron-down, tapping opens a bottom sheet
    - Bottom sheet has "Remove Friend" (red destructive row with icon) and full-width "Cancel" button
    - Incoming requests now show side-by-side "Confirm" (filled primary blue) + "Delete" (outlined muted) text buttons — Instagram style
    - Outgoing requests show a single "Requested" muted button
    - "Add Friend" button remains as filled primary
    - Button border radius changed from 24 (pill) to 10 (rounded rectangle) to match Instagram's style

    **Friends List Page (`friends-list.tsx`):**
    - `•••` ellipsis on friend rows now opens a **bottom sheet** (with friend avatar + name header) instead of a direct Alert.alert
    - Bottom sheet shows "Remove Friend" (red destructive) and full-width "Cancel" button
    - Incoming request rows now have compact **"Confirm" + "Delete" text-labeled buttons** instead of small icon-only circles

- **Bottom sheet consistency across all screens:**
    - Both friend bottom sheets now use **Reanimated animated slide-up/down** (matching FABBottomSheet and HangoutFilterSheet)
    - **Swipe-down-to-dismiss** gesture via `Gesture.Pan()` with 50px threshold (same as FABBottomSheet)
    - **Cancel button** is now a full-width, 56px tall, rounded-12 button with `surfaceTertiary` bg and `textSecondary` text (matching FABBottomSheet's `cancelBtn` style)
    - Replaced React Native `Modal` with conditionally-rendered absolute-fill `Animated.View` pattern

## Key Decisions Made

- **Bottom sheet pattern**: All bottom sheets now use Reanimated + GestureDetector (not Modal) for consistent animated slide + swipe-to-dismiss
- **Cancel button style**: Full-width muted button (cancelBtn: width 100%, height 56, borderRadius 12, surfaceTertiary bg) — consistent across FABBottomSheet, friend/[id].tsx, friends-list.tsx
- **Instagram naming**: Used "Confirm" and "Delete" (Instagram's terminology) instead of "Accept" and "Decline/Reject"
- **Friend list bottom sheet includes avatar**: Shows the friend's avatar and name in the sheet header for context before destructive action

## Previous Context

- **Dual-document pattern**: Each friendship creates two mirrored Cosmos DB documents (one per user as partition key) for efficient single-partition reads
- **FriendRequest type**: Uses `displayName`/`avatarUrl` (matching generated DTO), while `Friend` type uses `name`/`avatar` (mapped in frontend)
- **Direction casing**: Backend sends `"Incoming"`/`"Outgoing"` (PascalCase), frontend `useApiFriendshipStatus` normalizes to `"incoming"`/`"outgoing"` (lowercase)

## Remaining Work

- **Testing**: End-to-end testing of redesigned friend actions and bottom sheet animations on both screens
- **Error handling polish**: Some screens could benefit from retry logic on API failures

## Important Patterns & Preferences

- **Cosmos enum serialization**: Always add `[JsonConverter(typeof(StringEnumConverter))]` to enum properties in domain models
- Generated client method naming: `friendsAll()`, `friendsPOST(friendId)`, `friendsDELETE(friendId)`, `requestsAll()`, `requestsPOST(friendId)`, `accept(friendId)`, `reject(friendId)`, `status(friendId)`, `count(userId)`, `commonGroups(userId)`, `commonHangouts(userId)`
- Theme colors: Use `colors.card` (not `cardBackground`), `colors.indigo50` (not `primaryLight`), `colors.surfaceTertiary` (not `backgroundSecondary`), `colors.error` (not `danger`), `colors.cardBorder` (not `border`)
- PowerShell shell: Use `;` to chain commands, NOT `&&`; `2>$null` for stderr redirect (not `2>nul`)
