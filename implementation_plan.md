# Implementation Plan

[Overview]
Add a Friend Profile screen to the React Native Expo Router app, accessible by tapping friend avatars throughout the app.

This feature implements a dedicated profile page for friends, inspired by the Figma `FriendProfileScreen` component. The screen displays a friend's avatar, name, bio, social stats (hangouts together, mutual friends, last hangout), groups in common, upcoming shared hangouts, recent activity, and action buttons (Invite to Hangout, Invite to Group). A "Remove Friend" bottom sheet modal is accessible via a 3-dot menu. Navigation to this screen will be enabled from three existing locations: the hangout detail attendee list, the group detail member list, and the home screen recent activity section. The app uses Expo Router file-based routing, React Native with TypeScript, the `useThemeColors` hook for dark/light mode theming, and `createSharedStyles` for reusable styled components.

[Types]
Add new interfaces for friend profile data, groups in common, upcoming hangouts, and recent activity.

New types to add in `social-coordination-app-ux/src/types/index.ts`:

```typescript
export interface FriendProfile {
    id: string;
    name: string;
    avatar: string;
    friendsSince: string;
    mutualGroups: number;
    mutualFriends: number;
    bio?: string;
    hangoutsTogether: number;
    lastHangout: string;
}

export interface FriendGroupInCommon {
    id: string;
    name: string;
    icon: string;
    memberCount: number;
}

export interface FriendUpcomingHangout {
    id: string;
    title: string;
    time: string;
    date: string;
    groupName: string;
}

export interface FriendRecentActivity {
    id: string;
    text: string;
    time: string;
    icon: string;
}
```

No existing types need modification. The existing `Friend` interface (`id`, `name`, `avatar`, `phone?`) remains unchanged — `FriendProfile` is a separate, richer type used specifically for the friend profile screen.

[Files]
Create one new route file and modify several existing files to add mock data, types, route registration, and navigation entry points.

**New files:**

- `social-coordination-app-ux/src/app/friend/[id].tsx` — Friend Profile screen (new Expo Router route)

**Modified files:**

- `social-coordination-app-ux/src/types/index.ts` — Add `FriendProfile`, `FriendGroupInCommon`, `FriendUpcomingHangout`, `FriendRecentActivity` interfaces
- `social-coordination-app-ux/src/data/mock-data.ts` — Add `mockFriendProfiles`, `mockFriendGroupsInCommon`, `mockFriendUpcomingHangouts`, `mockFriendRecentActivities`, and a `findFriendIdByName()` helper function
- `social-coordination-app-ux/src/app/_layout.tsx` — Register `friend/[id]` Stack.Screen
- `social-coordination-app-ux/src/app/hangout/[id].tsx` — Wrap attendee list items in `TouchableOpacity` to navigate to friend profile
- `social-coordination-app-ux/src/app/group/[id].tsx` — Wrap member list items in `TouchableOpacity` to navigate to friend profile
- `social-coordination-app-ux/src/components/home/RecentActivitySection.tsx` — Add `onActivityPress` callback prop; wrap activity cards in `TouchableOpacity`
- `social-coordination-app-ux/src/app/(tabs)/index.tsx` — Pass `onActivityPress` handler to `RecentActivitySection` that navigates to friend profile

**No files deleted or moved.**

[Functions]
Add a helper function and modify component signatures to support navigation.

**New functions:**

- `findFriendIdByName(name: string): string | undefined` in `social-coordination-app-ux/src/data/mock-data.ts` — Looks up a friend ID from `mockFriends` by matching name. Used to resolve attendee/member names to navigable friend IDs.

**Modified functions/components:**

- `RecentActivitySection` component in `social-coordination-app-ux/src/components/home/RecentActivitySection.tsx`:
    - Add optional `onActivityPress?: (activityId: string) => void` prop to `RecentActivitySectionProps` interface
    - Wrap each activity card `View` in a `TouchableOpacity` when `onActivityPress` is provided
- `HomeScreen` default export in `social-coordination-app-ux/src/app/(tabs)/index.tsx`:
    - Add `handleActivityPress` function that extracts the friend name from the activity text, resolves to friend ID via `findFriendIdByName`, and navigates to `/friend/[id]`
    - Pass `onActivityPress={handleActivityPress}` to `<RecentActivitySection>`
- `HangoutDetailScreen` default export in `social-coordination-app-ux/src/app/hangout/[id].tsx`:
    - Wrap each attendee `View` in a `TouchableOpacity` with `onPress` that calls `findFriendIdByName(attendee.name)` and navigates to `/friend/[id]`
- `GroupDetailScreen` default export in `social-coordination-app-ux/src/app/group/[id].tsx`:
    - Wrap each member `View` in a `TouchableOpacity` with `onPress` that calls `findFriendIdByName(member.name)` and navigates to `/friend/[id]`

**No functions removed.**

[Classes]
No class modifications — the project uses functional components exclusively.

N/A — all components are React functional components. No class-based components exist or need to be created.

[Dependencies]
No new dependencies required.

All necessary packages are already installed: `expo-router`, `react-native-safe-area-context`, `@expo/vector-icons`, `react-native-gesture-handler`. The `Ionicons` icon set (from `@expo/vector-icons`) provides all needed icons (arrow-back, ellipsis-vertical, people-outline, calendar-outline, time-outline, person-remove-outline).

[Testing]
Manual testing approach since no test framework is configured.

The project has no automated test setup (no Jest, no testing-library). Testing will be manual:

1. **Friend Profile Screen** — Navigate to `/friend/1` and verify all sections render correctly (profile header, stats, groups in common, upcoming hangouts, recent activity, bottom CTAs, remove friend modal)
2. **Dark mode** — Toggle device dark mode and verify all colors adapt correctly using theme tokens
3. **Navigation from Hangout Detail** — Tap an attendee name on the hangout detail screen → should navigate to that friend's profile
4. **Navigation from Group Detail** — Tap a member name on the group detail screen → should navigate to that friend's profile
5. **Navigation from Home Recent Activity** — Tap a recent activity card on the home screen → should navigate to the corresponding friend's profile
6. **Back navigation** — On the friend profile screen, tap the back arrow → should return to the previous screen
7. **Remove Friend modal** — Tap the 3-dot menu → modal slides up with "Remove Friend" and "Cancel" options; tapping Cancel dismisses it

[Implementation Order]
Follow this sequence to minimize conflicts and ensure dependencies are available at each step.

1. **Add types** — Add `FriendProfile`, `FriendGroupInCommon`, `FriendUpcomingHangout`, `FriendRecentActivity` to `social-coordination-app-ux/src/types/index.ts`
2. **Add mock data** — Add `mockFriendProfiles`, `mockFriendGroupsInCommon`, `mockFriendUpcomingHangouts`, `mockFriendRecentActivities`, and `findFriendIdByName()` to `social-coordination-app-ux/src/data/mock-data.ts`
3. **Create Friend Profile screen** — Create `social-coordination-app-ux/src/app/friend/[id].tsx` with all sections matching the Figma design (profile header, stats grid, groups in common horizontal scroll, upcoming hangouts cards, recent activity list, fixed bottom CTAs, remove friend bottom sheet)
4. **Register route** — Add `friend/[id]` Stack.Screen entry in `social-coordination-app-ux/src/app/_layout.tsx` with `slide_from_right` animation
5. **Hangout detail navigation** — Modify `social-coordination-app-ux/src/app/hangout/[id].tsx` to wrap attendee list items in `TouchableOpacity` that navigates to `/friend/[friendId]`
6. **Group detail navigation** — Modify `social-coordination-app-ux/src/app/group/[id].tsx` to wrap member list items in `TouchableOpacity` that navigates to `/friend/[friendId]`
7. **Recent activity navigation** — Modify `social-coordination-app-ux/src/components/home/RecentActivitySection.tsx` to accept and use `onActivityPress` prop; modify `social-coordination-app-ux/src/app/(tabs)/index.tsx` to pass the handler
