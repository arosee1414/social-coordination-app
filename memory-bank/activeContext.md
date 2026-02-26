# Active Context

## Current Work Focus

Fixed authentication flows — sign-in and sign-up pages.

## What Was Just Accomplished

- **Fixed sign-in flow in `sign-in.tsx`**: Rewrote `onSignInPress` to use the proper two-step Clerk sign-in flow:
    1. First calls `signIn.create({ identifier })` to identify the user
    2. Then calls `attemptFirstFactor({ strategy: 'password', password })` to authenticate
    - Previously the code passed both `identifier` and `password` to `signIn.create()` which was failing silently with a generic error
- **Improved sign-in error handling**: Added specific Clerk error code handling (`form_password_incorrect`, `form_password_pwned`, `session_exists`), default fallback now shows Clerk's own `longMessage`
- **Fixed sign-up verification dialog in `sign-up.tsx`**:
    - Added `Cancel` button so users can dismiss the dialog
    - Added `verificationError` state displayed inside the dialog (errors were previously hidden behind it)
    - Added `isVerifying` loading state to prevent double-taps
    - Verify button disabled until 6-digit code is entered
    - Shows Clerk's actual error messages on verification failure
    - Used `useCallback` to avoid stale closure issues with the code state
- **Added confirm password field to sign-up**: New "Confirm password" input with validation that passwords match before submitting
- **Added password length validation**: Minimum 8 characters required on sign-up
- **Better error messages everywhere**: Falls back to Clerk's `longMessage` instead of generic strings

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
