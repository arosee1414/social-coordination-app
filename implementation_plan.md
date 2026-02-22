# Implementation Plan

[Overview]
Redesign the Home screen to match the new Figma reference design with a modern iOS-style layout featuring Happening Now carousel, Upcoming Hangouts list, Recent Activity carousel, Reminder Banner, and a Floating Action Button with animated bottom sheet modal.

The current Home screen (`social-coordination-app-ux/src/app/(tabs)/index.tsx`) is a simple vertical list of upcoming hangouts with a small FAB in the section header. The new design transforms it into a rich, multi-section home experience with:

- A **Happening Now** horizontal carousel for live/active hangouts (conditionally visible)
- A **Reminder Banner** for time-sensitive RSVP alerts
- An **Upcoming Hangouts** vertical list (capped at 3 items) with group pills and inline RSVP status/buttons
- A **Recent Activity** horizontal carousel showing lightweight social activity
- A prominent **Floating Action Button** (fixed bottom-right) that opens an animated bottom sheet with "Create Hangout", "Invite Group", and "Cancel" actions

This requires updates to the type system (adding `status`, `group`, `attendeeCount` to `Hangout`; adding new `RecentActivity` and `ReminderBanner` types), new mock data, new shared styles, and a complete rewrite of the Home screen component with extracted sub-components.

[Types]
Add hangout status enum, group field, attendeeCount to the Hangout interface; create new RecentActivity and ReminderBanner interfaces.

### Updated `Hangout` interface

```typescript
export type HangoutStatus = 'live' | 'upcoming' | 'past' | 'cancelled';

export interface Hangout {
    id: string;
    title: string;
    time: string;
    timeUntil: string;
    location: string | null;
    locationDetail?: string;
    creator: string;
    going: number;
    maybe: number;
    userStatus: RSVPStatus;
    attendeesPreview: string[];
    // NEW FIELDS:
    status: HangoutStatus; // 'live' | 'upcoming' | 'past' | 'cancelled'
    attendeeCount?: number; // Total attendee count (for live hangouts badge)
    date?: string; // Display date string (e.g. "Sat, Feb 22")
}
```

### New `RecentActivity` interface

```typescript
export interface RecentActivity {
    id: string;
    text: string;
    avatar: string; // emoji avatar or icon
}
```

### New `ReminderBanner` interface

```typescript
export interface ReminderBanner {
    id: string;
    title: string;
    subtitle: string;
}
```

[Files]
Modify existing files and create new component files for the redesigned Home screen.

### New Files

1. **`social-coordination-app-ux/src/components/home/HappeningNowSection.tsx`**
    - Horizontal ScrollView carousel of live hangout cards
    - Blue gradient cards with LIVE badge, title, time, location, attendee avatars, Join button
    - Receives `hangouts` array (filtered to `status === 'live'`) as prop

2. **`social-coordination-app-ux/src/components/home/ReminderBannerCard.tsx`**
    - Amber/warning-styled inline banner card
    - Clock icon, title text, subtitle text
    - Receives `reminder: ReminderBanner` as prop

3. **`social-coordination-app-ux/src/components/home/UpcomingHangoutsSection.tsx`**
    - Section header with "Upcoming" title and "See All" link
    - Vertical list of up to 3 hangout cards
    - Each card: title, time, location, attendee avatars, RSVP status/buttons
    - Receives `hangouts` array (filtered to `status === 'upcoming'`), `onSeeAll`, `onHangoutPress` as props

4. **`social-coordination-app-ux/src/components/home/RecentActivitySection.tsx`**
    - Horizontal ScrollView carousel of small activity cards
    - Each card: avatar/icon circle + text
    - Receives `activities: RecentActivity[]` as prop

5. **`social-coordination-app-ux/src/components/home/FABBottomSheet.tsx`**
    - Floating Action Button (fixed position, bottom-right, circular, accent color, plus icon)
    - Animated bottom sheet modal using `react-native-reanimated` + `react-native-gesture-handler`
    - Bottom sheet contains: drag handle, "Create New" title, "Create Hangout" row, "Invite Group" row, "Cancel" button
    - Backdrop overlay with fade animation
    - Sheet slides in from bottom with spring animation
    - Receives `onCreateHangout`, `onInviteGroup` callbacks as props

### Modified Files

1. **`social-coordination-app-ux/src/types/index.ts`**
    - Add `HangoutStatus` type alias
    - Add `status`, `attendeeCount?`, `date?` fields to `Hangout` interface
    - Add `RecentActivity` interface
    - Add `ReminderBanner` interface

2. **`social-coordination-app-ux/src/data/mock-data.ts`**
    - Add `status`, `attendeeCount`, `date` fields to existing `mockHangouts` entries
    - Add new live hangout entries to `mockHangouts` with `status: 'live'`
    - Add `mockRecentActivity: RecentActivity[]` array
    - Add `mockReminderBanner: ReminderBanner` object

3. **`social-coordination-app-ux/src/app/(tabs)/index.tsx`**
    - Complete rewrite: replace current simple list with new multi-section layout
    - Import and compose all new sub-components
    - Filter hangouts by status for each section
    - Add FABBottomSheet component

4. **`social-coordination-app-ux/src/constants/shared-styles.ts`**
    - Add new shared styles: `liveBadge`, `liveBadgeText`, `joinButton`, `joinButtonText`, `reminderBanner`, `fabLarge`, `fabLargeIcon`, `bottomSheetOverlay`, `bottomSheetContainer`, `bottomSheetHandle`, `bottomSheetActionRow`, `bottomSheetActionIcon`, `seeAllLink`

5. **`social-coordination-app-ux/src/constants/theme.ts`**
    - Add new color tokens for both light and dark themes:
        - `liveBadgeBg` (white with opacity for live badge background)
        - `livePulse` (red for pulse indicator)
        - `reminderBg`, `reminderBorder`, `reminderText`, `reminderSubtext` (amber tones)
        - `fabShadow` (shadow color for FAB)
        - `overlayBg` (black with 40% opacity for modal backdrop)
        - `bottomSheetBg` (white/dark surface for bottom sheet)
        - `bottomSheetHandle` (gray indicator bar)

[Functions]
Describe the new functions and modifications needed.

### New Functions

1. **`HappeningNowSection` component** — `social-coordination-app-ux/src/components/home/HappeningNowSection.tsx`
    - `HappeningNowSection({ hangouts, onJoin, onPress }): JSX.Element`
    - Renders section title "Happening Now" and horizontal ScrollView of live cards
    - Each card renders LIVE badge (pulsing red dot + "LIVE" text), title, time with clock icon, optional location with pin icon, attendee avatar stack, Join button
    - `onJoin(hangoutId)` fires when Join tapped
    - `onPress(hangoutId)` fires when card tapped

2. **`ReminderBannerCard` component** — `social-coordination-app-ux/src/components/home/ReminderBannerCard.tsx`
    - `ReminderBannerCard({ reminder }): JSX.Element`
    - Renders amber-tinted banner with clock icon, title, subtitle

3. **`UpcomingHangoutsSection` component** — `social-coordination-app-ux/src/components/home/UpcomingHangoutsSection.tsx`
    - `UpcomingHangoutsSection({ hangouts, onSeeAll, onHangoutPress, onRSVP }): JSX.Element`
    - Renders section header row ("Upcoming" + "See All" link)
    - Maps over hangouts (max 3) to render compact cards
    - Each card: title, time (clock icon), location (pin icon), attendee avatar stack, RSVP status badge or Going/Maybe buttons
    - `onRSVP(hangoutId, status)` fires when RSVP button tapped

4. **`RecentActivitySection` component** — `social-coordination-app-ux/src/components/home/RecentActivitySection.tsx`
    - `RecentActivitySection({ activities }): JSX.Element`
    - Renders section title "Recent Activity" and horizontal ScrollView
    - Each card: 36px avatar circle + descriptive text

5. **`FABBottomSheet` component** — `social-coordination-app-ux/src/components/home/FABBottomSheet.tsx`
    - Uses `useState` for open/close state
    - Uses `useSharedValue` and `useAnimatedStyle` from `react-native-reanimated` for sheet translate-Y animation
    - Uses `withSpring` for smooth open/close transitions
    - `Animated.View` for backdrop (fade) and sheet (slide)
    - Renders: FAB button (always visible), overlay + bottom sheet (when open)
    - Bottom sheet content: drag handle bar, "Create New" header, action rows with icon circles and labels, Cancel button

### Modified Functions

1. **`HomeScreen` default export** — `social-coordination-app-ux/src/app/(tabs)/index.tsx`
    - Completely rewritten to compose new sub-components
    - Derives `liveHangouts = mockHangouts.filter(h => h.status === 'live')`
    - Derives `upcomingHangouts = mockHangouts.filter(h => h.status === 'upcoming')`
    - Renders in order: Header → ScrollView containing [HappeningNowSection (conditional), ReminderBannerCard, UpcomingHangoutsSection, RecentActivitySection] → FABBottomSheet (outside ScrollView, fixed position)

[Classes]
No class-based components are used; all components are functional React components. No class modifications needed.

No new classes will be created. The project uses functional components with hooks throughout.

[Dependencies]
No new package dependencies are needed.

The project already has all required packages:

- `react-native-reanimated` (~4.1.1) — for bottom sheet animations
- `react-native-gesture-handler` (~2.28.0) — for gesture-based interactions
- `@expo/vector-icons` (^15.0.3) — for Ionicons used throughout
- `react-native-safe-area-context` (~5.6.0) — for safe area handling
- `expo-router` (~6.0.23) — for navigation
- `expo-haptics` (~15.0.8) — optional haptic feedback on FAB press

No additional npm packages need to be installed. The `@gorhom/bottom-sheet` library is NOT needed; we will build a custom animated bottom sheet using `react-native-reanimated` and `react-native-gesture-handler` which are already installed.

[Testing]
Manual visual testing against the Figma reference design.

Since this project has no existing test infrastructure (no test runner, no test files), testing will be manual:

1. **Visual verification**: Run the app with `expo start` and compare each section against the Figma `HomeScreen.tsx` reference
2. **Sections to verify**:
    - Happening Now carousel scrolls horizontally, LIVE badge pulses, Join button is tappable
    - Reminder Banner displays with amber styling
    - Upcoming Hangouts shows max 3 items, RSVP buttons/status render correctly
    - Recent Activity carousel scrolls horizontally
    - FAB is visible and positioned bottom-right above tab bar
    - FAB tap opens bottom sheet with slide animation
    - Bottom sheet backdrop dismisses on tap
    - Bottom sheet actions navigate correctly (Create Hangout → `/create-hangout`, Invite Group → `/groups`)
3. **Dark mode**: Toggle device to dark mode and verify all sections use correct dark theme colors
4. **Edge cases**: Verify empty state (no live hangouts hides Happening Now section), hangouts without `location` don't show location row

[Implementation Order]
Sequential implementation steps to minimize conflicts and ensure each piece builds on the previous one.

1. **Update types** (`src/types/index.ts`) — Add `HangoutStatus` type, new fields to `Hangout`, add `RecentActivity` and `ReminderBanner` interfaces. This must come first as all other changes depend on these types.

2. **Update theme colors** (`src/constants/theme.ts`) — Add new color tokens for live badges, reminder banner, FAB shadow, overlay, and bottom sheet. Both light and dark themes.

3. **Update shared styles** (`src/constants/shared-styles.ts`) — Add new reusable styles for live badges, group pills, join buttons, reminder banner, FAB, bottom sheet elements, and see-all link.

4. **Update mock data** (`src/data/mock-data.ts`) — Add `status`, `attendeeCount`, `date` to existing hangouts, add new live hangout entries, add `mockRecentActivity` array, add `mockReminderBanner` object.

5. **Create HappeningNowSection component** (`src/components/home/HappeningNowSection.tsx`) — Build the horizontal carousel for live hangouts with gradient cards, LIVE badges, and Join buttons.

6. **Create ReminderBannerCard component** (`src/components/home/ReminderBannerCard.tsx`) — Build the amber reminder banner card.

7. **Create UpcomingHangoutsSection component** (`src/components/home/UpcomingHangoutsSection.tsx`) — Build the vertical list of upcoming hangout cards with RSVP indicators.

8. **Create RecentActivitySection component** (`src/components/home/RecentActivitySection.tsx`) — Build the horizontal carousel for recent activity items.

9. **Create FABBottomSheet component** (`src/components/home/FABBottomSheet.tsx`) — Build the floating action button and animated bottom sheet modal with reanimated.

10. **Rewrite Home screen** (`src/app/(tabs)/index.tsx`) — Compose all new sub-components into the final Home screen layout, replacing the current implementation entirely.

11. **Visual QA** — Run the app and verify against Figma reference, test dark mode, test edge cases, verify navigation from FAB actions and See All link.
