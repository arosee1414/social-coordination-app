# Active Context

## Current Work Focus

Navigation restructuring — Notifications tab → Search tab, notification bell on Home.

## What Was Just Accomplished

- **Moved Notifications from tab to stack route**: Notifications is no longer a bottom tab; it's a full-screen stack route (`/notifications`) accessible via a bell icon button in the Home tab header.
- **Added notification bell to Home header**: Bell icon with red unread badge dot in top-right of Home screen header, navigates to `/notifications` stack screen. Uses `useNotifications()` for `unreadCount`.
- **Replaced Notifications tab with Search tab**: The bottom tab bar now shows: Home, Hangouts, Groups, **Search**, Profile (replacing Notifications).
- **Created new Search tab screen** (`src/app/(tabs)/search.tsx`): Adapted from Figma `SearchScreen` template:
    - Header with "Search" title and "Find and manage friends" subtitle
    - Search bar with search icon, clear button, pill-shaped input
    - Segmented control tabs: "My Friends" (count) / "Discover"
    - My Friends tab: Uses `useApiFriends()` for real friend data, filterable via search, each row navigates to `/friend/[id]`
    - Discover tab: Uses `useApiUserSearch()` for user search API, "Find More Friends" CTA card linking to `/find-friends`
    - Full theme support (light/dark), `useScrollToTop` for tab re-tap, consistent shared styles
- **Notifications stack screen**: Has back button header (arrow-back + centered title + "Mark all read" link), slides in from right

## Key Decisions Made

- **Notifications as stack, not tab**: Notifications moved from bottom tab to a stack screen accessible via bell icon on Home header. This frees up a tab slot for Search.
- **Search tab replaces Notifications tab**: Tab order is Home, Hangouts, Groups, Search, Profile
- **Explicit light/dark toggle** (not three-way system/light/dark): The toggle switches between explicit `light` and `dark` preferences. When set to `system`, it follows the OS setting, but the toggle itself resolves to on/off for dark mode.
- **expo-secure-store persistence**: Theme preference survives app restarts via `expo-secure-store` (not AsyncStorage — the legacy native module was null)
- **Preferences section placement**: Renders after Account/Support sections, before Sign Out
- **Native switch thumb**: Removed `thumbColor` prop — let iOS handle thumb rendering natively to avoid color transition lag
- **Separate Pending from Maybe**: Pending (hasn't responded) is distinct from Maybe (responded "maybe"). Fixes inflated Maybe counts.
- **No Invited tab on hangout detail**: User prefers keeping the detail page at 3 RSVP tabs only
- **Backend enforcement + frontend gating**: Both layers enforce restrictions — backend returns 403 for unauthorized access, frontend avoids making calls when not friends
- **Stats row stays visible for everyone**: Friend count always shown; Groups and Hangouts stats show `—` for non-friends

## Previous Context

- **Scroll-to-top on tab re-tap**: Added `useScrollToTop` from `@react-navigation/native` to all 5 tab screens
- **Friends list uses popover menu**: Ellipsis button on friend rows opens a small context menu (not a bottom sheet) for the "Remove Friend" action
- **Instagram-style friend actions on detail page**: "Friends" button opens bottom sheet, incoming requests show "Confirm"/"Delete" buttons, outgoing shows "Requested"
- **Dual-document pattern**: Each friendship creates two mirrored Cosmos DB documents (one per user as partition key) for efficient single-partition reads
- **FriendRequest type**: Uses `displayName`/`avatarUrl` (matching generated DTO), while `Friend` type uses `name`/`avatar` (mapped in frontend)
- **Direction casing**: Backend sends `"Incoming"`/`"Outgoing"` (PascalCase), frontend `useApiFriendshipStatus` normalizes to `"incoming"`/`"outgoing"` (lowercase)
- **Self-navigation fix**: Hangout attendee list `onPress` routes to `/(tabs)/profile` when tapping yourself instead of `/friend/${userId}`

## Remaining Work

- **Testing**: End-to-end testing of dark mode toggle persistence and visual correctness across all screens
- **Error handling polish**: Some screens could benefit from retry logic on API failures

## Important Patterns & Preferences

- **Theme context pattern**: `ThemeProvider` wraps the entire app in `_layout.tsx`. Use `useThemeContext()` for theme preference/switching, `useThemeColors()` for color palette access.
- **Cosmos enum serialization**: Always add `[JsonConverter(typeof(StringEnumConverter))]` to enum properties in domain models
- Generated client method naming: `friendsAll()`, `friendsPOST(friendId)`, `friendsDELETE(friendId)`, `requestsAll()`, `requestsPOST(friendId)`, `accept(friendId)`, `cancel(friendId)`, `reject(friendId)`, `status(friendId)`, `count(userId)`, `commonGroups(userId)`, `commonHangouts(userId)`
- Theme colors: Use `colors.card` (not `cardBackground`), `colors.indigo50` (not `primaryLight`), `colors.surfaceTertiary` (not `backgroundSecondary`), `colors.error` (not `danger`), `colors.cardBorder` (not `border`), `colors.toggleTrackOn`/`colors.toggleTrackOff` for switch tracks
- PowerShell shell: Use `;` to chain commands, NOT `&&`; `2>$null` for stderr redirect (not `2>nul`)
