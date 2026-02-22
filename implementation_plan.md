# Implementation Plan

[Overview]
Implement the Figma-designed social coordination app UI into the existing Expo Router + Clerk React Native application, rebranding to "Hangout" and converting all Figma web-based (Tailwind/React Router) screens into native React Native screens with StyleSheet-based styling.

The existing app is an Expo SDK 54 project using file-based routing (expo-router), Clerk for authentication (email/password + Google SSO), and a theme system with light/dark mode support via `useThemeColors` and `createSharedStyles`. The current app has a basic 2-tab layout (Home/Explore) with placeholder content and a working auth flow (login, sign-in, sign-up).

The Figma design introduces 13 new screens across 5 bottom tabs (Home, Hangouts, Groups, Notifications, Profile) plus stack screens for creating hangouts, viewing hangout details, creating groups, adding members, group details, invite selection, find friends, and a group-created confirmation. The primary brand color shifts from blue (#007AFF) to indigo (#4F46E5), and the app name changes from "Meet up" to "Hangout".

All new screens will use mock/hardcoded data. The existing Clerk auth flow will be preserved and restyled to match the Figma design. Both light and dark mode will be supported across all screens.

[Types]
Define TypeScript types and interfaces for the data models used across screens (hangouts, groups, friends, notifications, RSVP statuses).

All types will be centralized in a new file `src/types/index.ts`. These are UI-only types for mock data — no API integration yet.

```typescript
// src/types/index.ts

export type RSVPStatus = 'going' | 'maybe' | 'not-going' | null;

export interface Hangout {
  id: string;
  title: string;
  time: string;           // Display string e.g. "Tonight at 7:00 PM"
  timeUntil: string;      // Countdown string e.g. "4h 30m"
  location: string | null;
  locationDetail?: string; // e.g. "123 Main St, Downtown"
  creator: string;
  going: number;
  maybe: number;
  userStatus: RSVPStatus;
  attendeesPreview: string[]; // Emoji avatars
}

export interface Attendee {
  name: string;
  avatar: string;         // Emoji avatar
  time?: string;          // e.g. "RSVP 2h ago"
  fromGroup?: string | null;
}

export interface AttendeesByStatus {
  going: Attendee[];
  maybe: Attendee[];
  notGoing: Attendee[];
}

export interface InvitedGroup {
  id: string;
  name: string;
  icon: string;           // Emoji icon
  memberCount: number;
  membersPreview: string[]; // Emoji avatars
}

export interface Group {
  id: string;
  name: string;
  icon: string;           // Emoji icon
  memberCount: number;
}

export interface GroupMember {
  name: string;
  avatar: string;
  role: 'Admin' | 'Member';
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;         // Emoji avatar
  phone?: string;
}

export interface Notification {
  id: string;
  type: 'rsvp' | 'invite' | 'reminder' | 'group' | 'friend' | 'group_created';
  icon?: string;          // Emoji or null
  title: string;
  message: string;
  time: string;
  unread: boolean;
  color?: string;         // For gradient icon backgrounds (not emoji)
}

export interface ProfileStat {
  label: string;
  value: string;
}

export interface SettingsItem {
  iconName: string;       // Ionicons name
  label: string;
  badge?: string | null;
}

export interface SettingsSection {
  title: string;
  items: SettingsItem[];
}
```

[Files]
Create new screen files, a types file, a mock data file, and modify existing files for the new tab structure, theme, and auth restyling.

### New Files to Create

1. **`src/types/index.ts`** — Centralized TypeScript type definitions (as described in [Types])
2. **`src/data/mock-data.ts`** — All mock/hardcoded data for hangouts, groups, friends, notifications, profile stats, and settings sections
3. **`src/app/(tabs)/hangouts.tsx`** — Hangouts list tab screen
4. **`src/app/(tabs)/groups.tsx`** — Groups list tab screen
5. **`src/app/(tabs)/notifications.tsx`** — Notifications tab screen
6. **`src/app/(tabs)/profile.tsx`** — Profile tab screen
7. **`src/app/hangout/[id].tsx`** — Hangout detail screen (dynamic route)
8. **`src/app/create-hangout.tsx`** — Create hangout screen (step 1: details)
9. **`src/app/invite-selection.tsx`** — Invite selection screen (step 2: pick friends/groups)
10. **`src/app/group/[id].tsx`** — Group detail screen (dynamic route)
11. **`src/app/create-group.tsx`** — Create group screen (step 1: name/icon)
12. **`src/app/add-members.tsx`** — Add members screen (step 2: select friends)
13. **`src/app/group-created.tsx`** — Group created confirmation screen
14. **`src/app/find-friends.tsx`** — Find friends screen (post-auth onboarding)

### Existing Files to Modify

15. **`src/constants/theme.ts`** — Update color palette: change `primary` from `#007AFF`/`#0A84FF` to `#4F46E5`/`#6366F1`, add new color tokens (indigo variants, status colors for going/maybe/not-going, gradient colors, badge colors, subtitle text color)
16. **`src/constants/shared-styles.ts`** — Add new shared styles for: rounded cards with borders, section headers, screen headers, bottom CTA containers, member/friend list items, RSVP status badges, tab-segmented controls, search inputs, gradient card styles, info card styles
17. **`src/app/(tabs)/_layout.tsx`** — Restructure from 2 tabs (Home/Explore) to 5 tabs (Home, Hangouts, Groups, Alerts, Profile) with appropriate icons
18. **`src/app/(tabs)/index.tsx`** — Replace placeholder content with the Figma Home screen design (upcoming hangouts list with cards)
19. **`src/app/_layout.tsx`** — Add new Stack.Screen entries for all new stack screens (hangout/[id], create-hangout, invite-selection, group/[id], create-group, add-members, group-created, find-friends)
20. **`src/app/(auth)/login.tsx`** — Restyle to match Figma design: change app title from "Meet up" to "Hangout", update primary color usage, update button and card styling to use indigo theme
21. **`src/app/(auth)/sign-in.tsx`** — Minor restyle to match Figma indigo theme
22. **`src/app/(auth)/sign-up.tsx`** — Minor restyle to match Figma indigo theme
23. **`src/components/ui/icon-symbol.tsx`** — Add new icon mappings for: calendar, people/users, notifications/bell, person/user, add/plus, arrow-back, share, more-vert, search, settings, chevron-right, map-pin, clock, message, help, log-out, user-plus, check, copy

### Files to Delete

24. **`src/app/(tabs)/explore.tsx`** — Remove the Explore tab (replaced by new tabs)
25. **`src/app/modal.tsx`** — Remove the placeholder modal screen (no longer needed)

### Files That Remain Unchanged

- `src/app/index.tsx` — Auth redirect logic stays the same
- `src/app/(auth)/_layout.tsx` — Auth layout structure stays the same (may update header back button color)
- `src/hooks/useThemeColors.ts` — No changes needed
- `src/hooks/use-color-scheme.ts` — No changes needed
- `src/app/utils/tokenCache.ts` — No changes needed
- `src/components/haptic-tab.tsx` — No changes needed

[Functions]
Describe new and modified functions/components across the codebase.

### New Functions/Components

Each new screen file exports a default React functional component:

1. **`HangoutsScreen`** in `src/app/(tabs)/hangouts.tsx`
   - Renders a scrollable list of hangout cards with time-until badges, RSVP counts, and user status indicators
   - Includes a FAB-style "+" button to navigate to create-hangout
   - Includes empty state UI when no hangouts exist

2. **`GroupsScreen`** in `src/app/(tabs)/groups.tsx`
   - Renders a list of group cards with gradient backgrounds, emoji icons, and member counts
   - Includes a "+" button to navigate to create-group
   - Includes empty state UI

3. **`NotificationsScreen`** in `src/app/(tabs)/notifications.tsx`
   - Renders a list of notification items with type-specific icons (emoji avatars, gradient icons)
   - Unread notifications have a highlighted background
   - "Mark all read" button in header

4. **`ProfileScreen`** in `src/app/(tabs)/profile.tsx`
   - Renders a gradient profile card with user avatar and stats
   - Settings sections with labeled groups of items
   - Logout button using Clerk's `signOut` method + router redirect
   - Integrates with `useUser()` from Clerk to display actual user email

5. **`HangoutDetailScreen`** in `src/app/hangout/[id].tsx`
   - Uses `useLocalSearchParams()` to get hangout ID
   - Shows hangout details (time, location, countdown timer)
   - RSVP buttons (Going/Maybe/Can't Go) with active state
   - Invited groups section
   - Individual invitees section
   - RSVP list grouped by status (going, maybe, not going)

6. **`CreateHangoutScreen`** in `src/app/create-hangout.tsx`
   - Form with: title (TextInput), date (TextInput or DatePicker placeholder), time (TextInput), location (optional TextInput with icon)
   - Info card explaining next step (invite friends)
   - "Continue to Invite" button navigating to invite-selection
   - Button disabled until required fields filled

7. **`InviteSelectionScreen`** in `src/app/invite-selection.tsx`
   - Segmented tab control to switch between "Friends" and "Groups" lists
   - Search input for filtering
   - Selectable list items with checkmark indicators
   - Bottom CTA showing selected count + "Create Hangout" button

8. **`GroupDetailScreen`** in `src/app/group/[id].tsx`
   - Uses `useLocalSearchParams()` to get group ID
   - Gradient header with group icon, name, member count
   - Quick action buttons: "Invite to Hangout", "Add Member"
   - Members list with avatar, name, role
   - Info card about groups
   - "Edit Group" bottom button

9. **`CreateGroupScreen`** in `src/app/create-group.tsx`
   - Emoji icon selector (grid of emoji options)
   - Group name TextInput
   - Info card explaining what groups are
   - "Continue to Add Members" button

10. **`AddMembersScreen`** in `src/app/add-members.tsx`
    - Search input for filtering friends
    - Selectable friend list with checkmark indicators
    - Bottom CTA showing selected count + "Create Group" button

11. **`GroupCreatedScreen`** in `src/app/group-created.tsx`
    - Success animation/icon (green checkmark circle)
    - Group preview card with emoji, name, member count, avatar row
    - Two CTAs: "Create a Hangout" and "View All Groups"

12. **`FindFriendsScreen`** in `src/app/find-friends.tsx`
    - Invite link card with copy-to-clipboard functionality
    - Search input for contacts
    - Contact list with "Invite" buttons
    - "Skip for Now" bottom button

### Modified Functions/Components

13. **`TabLayout`** in `src/app/(tabs)/_layout.tsx`
    - Change from 2 Tabs.Screen entries to 5
    - Update icon mappings for each tab (home, calendar, people, bell, person)
    - Add new icon mappings to IconSymbol or switch to using Ionicons directly in tab config

14. **`HomeScreen`** in `src/app/(tabs)/index.tsx`
    - Complete rewrite: remove parallax scroll view, replace with flat ScrollView
    - Add "Home" header with subtitle "Your upcoming hangouts"
    - Render hangout cards from mock data with: title, time with clock icon, location with pin icon, time-until badge, attendee avatars, going/maybe counts, user RSVP status badge
    - FAB-style "+" button to navigate to create-hangout

15. **`LoginPage`** in `src/app/(auth)/login.tsx`
    - Change app title text from "Meet up" to "Hangout"
    - Update subtitle text
    - Colors will automatically update via theme changes

16. **`RootLayoutNav`** in `src/app/_layout.tsx`
    - Add Stack.Screen entries for: `hangout/[id]`, `create-hangout`, `invite-selection`, `group/[id]`, `create-group`, `add-members`, `group-created`, `find-friends`
    - Remove `modal` Stack.Screen entry

17. **`IconSymbol`** component and its `MAPPING` in `src/components/ui/icon-symbol.tsx`
    - Add mappings for new icons needed across the app: `calendar`, `people`, `notifications`, `person`, `add`, `arrow-back`, `share`, `more-vert`, `search`, `settings`, `chevron-right`, `place`, `schedule`, `chat`, `help`, `logout`, `person-add`, `check`, `content-copy`

[Classes]
No class-based components are used in this codebase. All components are functional React components. No class modifications needed.

N/A — The project uses exclusively functional components with hooks.

[Dependencies]
No new npm packages are required.

The existing dependencies already cover all needs:
- `@expo/vector-icons` (Ionicons, MaterialIcons) — for all icons
- `react-native-safe-area-context` — for safe area handling
- `expo-router` — for navigation (file-based routing, Link, useRouter, useLocalSearchParams)
- `@clerk/clerk-expo` — for auth (useAuth, useUser, useSignIn, useSignUp, useSSO)
- `react-native-reanimated` — available if animations desired
- `expo-haptics` — available for haptic feedback on buttons
- `@expo-google-fonts/pacifico` — keep for branded "Hangout" title on login

No packages to remove. The Figma code uses `lucide-react` for icons but we'll use `@expo/vector-icons` (Ionicons/MaterialIcons) which are already installed. The Figma code uses Tailwind CSS but we'll use React Native StyleSheet objects following the existing `createSharedStyles` pattern.

[Testing]
Manual testing approach using Expo development server.

Since there are no existing automated tests in the project, testing will be manual:

1. **Auth flow**: Verify login screen shows "Hangout" branding, sign-up and sign-in still work correctly with Clerk, Google SSO still works
2. **Tab navigation**: Verify all 5 tabs render correctly and tab icons/labels are correct
3. **Home screen**: Verify hangout cards render with mock data, "+" button navigates to create-hangout
4. **Hangouts tab**: Verify list renders, cards are tappable and navigate to hangout detail
5. **Hangout detail**: Verify all sections render (details, countdown, RSVP buttons, invited groups, attendee list)
6. **Create hangout flow**: Verify form → invite selection → navigation back to home
7. **Groups tab**: Verify group cards render, tapping navigates to group detail
8. **Group detail**: Verify member list, action buttons render
9. **Create group flow**: Verify emoji picker → name input → add members → group-created confirmation
10. **Notifications tab**: Verify notification list renders with unread highlighting
11. **Profile tab**: Verify profile card, stats, settings sections, logout button works
12. **Dark mode**: Toggle device dark mode and verify all screens render correctly with dark theme colors
13. **Find friends**: Verify invite link card, contact list, skip button

Test on both iOS simulator and Android emulator if possible. Test web rendering as well since the project supports it.

[Implementation Order]
Implement changes in a bottom-up order: types and data first, then theme/styles, then navigation structure, then individual screens.

1. **Create types file** (`src/types/index.ts`) — Define all TypeScript interfaces and types
2. **Create mock data file** (`src/data/mock-data.ts`) — Define all mock data for hangouts, groups, friends, notifications, profile
3. **Update theme** (`src/constants/theme.ts`) — Change primary color to indigo, add new color tokens for both light and dark mode (status colors, gradients, badge colors, subtitle text, etc.)
4. **Update shared styles** (`src/constants/shared-styles.ts`) — Add new reusable style definitions for cards, headers, bottom CTAs, list items, badges, search inputs, etc.
5. **Update icon mappings** (`src/components/ui/icon-symbol.tsx`) — Add all new SF Symbol → Material Icon mappings needed by the new screens
6. **Delete removed files** — Remove `src/app/(tabs)/explore.tsx` and `src/app/modal.tsx`
7. **Update tab layout** (`src/app/(tabs)/_layout.tsx`) — Restructure to 5 tabs with correct icons and labels
8. **Update root layout** (`src/app/_layout.tsx`) — Add Stack.Screen entries for all new stack screens, remove modal entry
9. **Restyle auth screens** — Update `login.tsx` (rebrand to "Hangout"), `sign-in.tsx`, and `sign-up.tsx` to use new indigo theme
10. **Build Home tab** (`src/app/(tabs)/index.tsx`) — Complete rewrite with hangout cards from mock data
11. **Build Hangouts tab** (`src/app/(tabs)/hangouts.tsx`) — Hangout list screen
12. **Build Groups tab** (`src/app/(tabs)/groups.tsx`) — Groups list screen
13. **Build Notifications tab** (`src/app/(tabs)/notifications.tsx`) — Notifications list screen
14. **Build Profile tab** (`src/app/(tabs)/profile.tsx`) — Profile screen with Clerk integration for logout
15. **Build Hangout Detail** (`src/app/hangout/[id].tsx`) — Hangout detail with RSVP buttons
16. **Build Create Hangout** (`src/app/create-hangout.tsx`) — Create hangout form
17. **Build Invite Selection** (`src/app/invite-selection.tsx`) — Friend/group selection screen
18. **Build Group Detail** (`src/app/group/[id].tsx`) — Group detail screen
19. **Build Create Group** (`src/app/create-group.tsx`) — Create group form with emoji picker
20. **Build Add Members** (`src/app/add-members.tsx`) — Member selection screen
21. **Build Group Created** (`src/app/group-created.tsx`) — Confirmation screen
22. **Build Find Friends** (`src/app/find-friends.tsx`) — Find friends/onboarding screen
23. **Test all flows** — Manual testing of all screens, navigation, dark mode, and auth