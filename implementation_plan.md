# Implementation Plan

[Overview]
Add an optional duration field to the create-hangout flow, with a max of 24 hours and an 8-hour default when unset.

The create-hangout screen currently collects title, date, time, location, and note. A new "Duration (Optional)" picker field will be added between the Date & Time row and the Location field. The backend already has an optional `EndTime` field on `CreateHangoutRequest` — rather than adding a new `DurationHours` field, the frontend will compute `EndTime = StartTime + selectedDuration` and send it via the existing field. If no duration is selected, the backend will default to `StartTime + 8 hours`. The backend will also validate that `EndTime - StartTime` does not exceed 24 hours.

Since the API contract (DTOs, request/response models) does not change, **no API client regeneration is required**. The generated TypeScript client already supports the `endTime` field.

**CRITICAL**: The `create-hangout.tsx` file has been reverted to its original committed version. All changes must be **surgical additions only** — do NOT rewrite existing styles, imports, layout patterns, or component structure. Use `replace_in_file` with targeted SEARCH/REPLACE blocks.

[Types]
No new types or type changes are needed.

The existing backend `CreateHangoutRequest.EndTime` (nullable `DateTime?`) and `UpdateHangoutRequest.EndTime` (nullable `DateTime?`) already support this feature. The frontend `Hangout` type in `src/types/index.ts` does not need modification. The generated client already has `endTime` on all hangout-related request/response classes.

[Files]
Three files need modification; no new files or deletions.

### Files to modify:

1. **`Backend/SocialCoordinationApp/Services/HangoutsService.cs`**
    - Add 8-hour default EndTime logic in `CreateHangoutAsync`
    - Add 24-hour max duration validation in `CreateHangoutAsync`
    - Add 24-hour max duration validation in `UpdateHangoutAsync`

2. **`social-coordination-app-ux/src/app/create-hangout.tsx`** (SURGICAL changes only)
    - Add `FlatList` to existing imports from `react-native`
    - Add duration state variables (`selectedDuration`, `showDurationPicker`, `tempDuration`)
    - Add duration options constant array (outside component, above the component function)
    - Add `formatDuration` helper function (outside component)
    - Add duration picker handlers (`openDurationPicker`, `confirmDuration`, `cancelDuration`)
    - Add `computeEndTime` function inside component
    - Insert Duration picker button + helper text in JSX between Date & Time section and Location section
    - Insert Duration picker Modal in JSX after the existing iOS time picker modal
    - Add duration-related styles to the existing `StyleSheet.create` block

3. **`social-coordination-app-ux/src/utils/api-mappers.ts`**
    - Update `isLive` function fallback from 2 hours to 8 hours to match the new backend default

[Functions]
Three existing functions need modification; several new inline additions.

### Modified functions:

1. **`CreateHangoutAsync`** in `Backend/SocialCoordinationApp/Services/HangoutsService.cs`
    - **Current behavior**: Maps `request.EndTime` directly to `hangout.EndTime` (null if not provided)
    - **New behavior**: If `request.EndTime` is null, set `hangout.EndTime = request.StartTime.AddHours(8)`. Before mapping, validate that if `request.EndTime` is provided, `(request.EndTime.Value - request.StartTime).TotalHours <= 24` — throw `ArgumentException` if exceeded. Also validate `EndTime > StartTime`.

2. **`UpdateHangoutAsync`** in `Backend/SocialCoordinationApp/Services/HangoutsService.cs`
    - **Current behavior**: Maps `request.EndTime` directly if provided
    - **New behavior**: If both `StartTime` and `EndTime` are being updated, validate the 24-hour max. If only `EndTime` is updated, validate against the existing `hangout.StartTime`. If `EndTime` is not provided and `StartTime` changes, recompute `EndTime = newStartTime + 8 hours`.

3. **`isLive`** in `social-coordination-app-ux/src/utils/api-mappers.ts`
    - **Current behavior**: Falls back to `start + 2 hours` when no endTime
    - **New behavior**: Falls back to `start + 8 hours` when no endTime

### New additions in `create-hangout.tsx`:

- **`DURATION_OPTIONS` constant** (outside component): Array of `{ value: number | null; label: string }` with 49 options from 15min to 24h in 30-min increments, plus "No set duration" with `value: null`
- **`formatDuration(value)`** (outside component): Converts hours to display string (e.g., 0.25 → "15 min", 1.5 → "1h 30m")
- **`openDurationPicker()`** (inside component): Sets tempDuration and shows modal
- **`confirmDuration()`** (inside component): Commits tempDuration to selectedDuration
- **`cancelDuration()`** (inside component): Closes modal without committing
- **`computeEndTime()`** (inside component): Returns `Date | null` — null when no duration (backend defaults to 8h), or `startDateTime + duration` when set

[Classes]
No class additions, removals, or structural modifications.

[Dependencies]
No new dependencies required.

All UI components (`Modal`, `FlatList`, `TouchableOpacity`, `Ionicons`) are already available in the project. The duration picker will be built from existing React Native primitives.

[Testing]
Manual testing approach.

1. **Create hangout with duration set**: Select a duration (e.g., 2 hours), verify the API request includes the correct `endTime` computed as `startTime + 2 hours`
2. **Create hangout without duration**: Leave duration as "No set duration", verify the backend returns `endTime = startTime + 8 hours`
3. **Duration validation**: Attempt to send an EndTime that exceeds 24 hours from StartTime via API — verify 400 Bad Request
4. **Duration picker UX**: Test the picker modal opens/closes correctly on both iOS and Android, scrolls through options, and shows the selected value
5. **Live status**: Verify that hangouts without explicit EndTime still show "Happening now" correctly with the 8-hour window
6. **Existing styles preserved**: Verify the create-hangout screen looks identical to before (same fonts, spacing, colors, layout) except for the new duration field

[Implementation Order]
Four sequential steps to minimize risk and maintain a working app at each stage.

1. **Backend: Add EndTime default and validation in `HangoutsService.cs`**
    - In `CreateHangoutAsync`: add 8-hour default when `EndTime` is null, add 24-hour max validation
    - In `UpdateHangoutAsync`: add 24-hour max validation
    - This is backward-compatible — existing clients that don't send duration will now get an 8-hour default EndTime instead of null

2. **Frontend: Update `isLive` fallback in `api-mappers.ts`**
    - Change the 2-hour fallback to 8 hours in the `isLive` function

3. **Frontend: Add duration picker to `create-hangout.tsx` (SURGICAL additions only)**
    - Use `replace_in_file` with targeted SEARCH/REPLACE blocks to:
      a. Add `FlatList` to the existing `react-native` import
      b. Add `DURATION_OPTIONS` and `formatDuration` above the component function
      c. Add `selectedDuration`, `showDurationPicker`, `tempDuration` state declarations
      d. Add `openDurationPicker`, `confirmDuration`, `cancelDuration`, `computeEndTime` handlers
      e. Insert the Duration picker button + helper text in JSX between the android date/time pickers section and the Location section
      f. Insert the Duration picker Modal in JSX after the iOS time picker modal rendering
      g. Add `durationItem`, `durationItemSelected`, `durationItemText`, `durationItemTextSelected`, `durationPickerBtn`, `durationHelperText` styles to the existing `StyleSheet.create` block
    - **DO NOT** change any existing imports, styles, layout patterns, labels, or component structure

4. **Verify no regressions**
    - Ensure the file still compiles (TypeScript check)
    - Visually confirm all original elements are unchanged
