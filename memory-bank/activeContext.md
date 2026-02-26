# Active Context

## Current Work Focus

Added Account section with Security page (change password) to the profile screen.

## What Was Just Accomplished

- **Added SECURITY section to profile page**: New section between Preferences and Support with a "Change Password" button (lock-closed icon + chevron) that navigates to `/security`. Only shown when `clerkUser.passwordEnabled` is true (hides for Google OAuth-only users).
- **Created `security.tsx` stack screen**: Full change password page with:
    - Current password, new password, and confirm new password fields
    - Eye toggle icons for showing/hiding each password field
    - Client-side validation (empty fields, min 8 chars, password match)
    - Clerk `user.updatePassword()` integration for actual password change
    - Success alert navigates back, errors displayed inline
    - Keyboard-aware layout with scroll and dismiss
    - Consistent styling using shared styles and theme colors
- **Registered `/security` route** in `_layout.tsx` with `slide_from_right` animation
- **OAuth-aware**: Security section conditionally rendered — Google-only users never see it

## Key Decisions Made

- **Friends tab replaces Search tab**: Tab order is Home, Hangouts, Groups, Friends, Profile. Friends tab has full friend management (list, remove, accept/reject requests).
- **Notifications as stack, not tab**: Notifications moved from bottom tab to a stack screen accessible via bell icon on Home header.
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

- **`friends-list.tsx` cleanup**: The old stack screen `friends-list.tsx` still exists but is no longer referenced by any navigation. Can be removed in a future cleanup pass.
- **Calendar Sync implementation**: The Calendar Sync button is in the UI but has no `onPress` handler yet — needs actual calendar sync functionality.
- **Testing**: End-to-end testing of dark mode toggle persistence and visual correctness across all screens
- **Error handling polish**: Some screens could benefit from retry logic on API failures

## Important Patterns & Preferences

- **Theme context pattern**: `ThemeProvider` wraps the entire app in `_layout.tsx`. Use `useThemeContext()` for theme preference/switching, `useThemeColors()` for color palette access.
- **Cosmos enum serialization**: Always add `[JsonConverter(typeof(StringEnumConverter))]` to enum properties in domain models
- Generated client method naming: `friendsAll()`, `friendsPOST(friendId)`, `friendsDELETE(friendId)`, `requestsAll()`, `requestsPOST(friendId)`, `accept(friendId)`, `cancel(friendId)`, `reject(friendId)`, `status(friendId)`, `count(userId)`, `commonGroups(userId)`, `commonHangouts(userId)`
- Theme colors: Use `colors.card` (not `cardBackground`), `colors.indigo50` (not `primaryLight`), `colors.surfaceTertiary` (not `backgroundSecondary`), `colors.error` (not `danger`), `colors.cardBorder` (not `border`), `colors.toggleTrackOn`/`colors.toggleTrackOff` for switch tracks
- PowerShell shell: Use `;` to chain commands, NOT `&&`; `2>$null` for stderr redirect (not `2>nul`)
