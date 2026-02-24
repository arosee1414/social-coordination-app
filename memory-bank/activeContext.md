# Active Context — Social Coordination App

## Current Work Focus

- Hangout card UI improvements
- Most recent: Made location row always visible on hangout cards with fallback "No location set" text

## Recent Changes

- **Always-visible location on hangout cards**: Removed conditional rendering (`{hangout.location && (...)}`) from all 3 hangout card components so the location icon and text always display. When no location is set, shows italic "No location set" in a lighter color (`colors.textTertiary` for normal cards, `rgba(255,255,255,0.6)` for live cards). Updated in `UpcomingHangoutsSection.tsx`, `HappeningNowSection.tsx`, and `hangouts.tsx`.
- **Edit Hangout Feature**: Created `src/app/edit-hangout/[id].tsx` — full edit screen that fetches existing hangout data and pre-populates form fields (title, date, time, duration, location, description). Includes Save Changes (`api.hangoutsPUT`), Manage Invites navigation, and Delete Hangout with confirmation modal (`api.hangoutsDELETE`). Registered route in `_layout.tsx`. Edit action wired to the ellipsis-vertical icon in hangout detail header — only visible when `user.id === hangout.creatorId`. Hangout detail screen uses `useFocusEffect` to refetch data on focus, ensuring updated info displays after editing. No backend changes or API client regeneration needed.
- Added text truncation with ellipsis to all hangout card views: title limited to 1 line (`numberOfLines={1}`), location limited to 2 lines (`numberOfLines={2}`) with `flex: 1` for proper text wrapping. Applied across `hangouts.tsx`, `UpcomingHangoutsSection.tsx`, and `HappeningNowSection.tsx`.
- Fixed Happening Now card layout bug: when a live event had no location, the avatar stack and Join button shifted up towards the middle of the card. Added `minHeight: 180` to card and `marginTop: 'auto'` to `bottomRow` in `HappeningNowSection.tsx` to pin the bottom row to the card bottom regardless of content.
- Fixed missing notes display on hangout detail page: added `description` field to `Hangout` type, mapped it in `api-mappers.ts`, and rendered it as a "Notes" row in the details card on `hangout/[id].tsx` (conditionally shown when description exists)
- Fixed bug in `hangout/[id].tsx` where the time badge displayed "Starts in Happening now" for live hangouts — now conditionally renders just `timeUntil` for live/past statuses and `"Starts {timeUntil}"` for upcoming
- Previously: Added **Self-Improving Cline Reflection** rule to `.clinerules`
- Previously: Added **Cline's Memory Bank** rule to `.clinerules`
- Previously: Created initial memory bank core files
- Previously: Duration picker feature for create-hangout (8h default, 24h max)
- Previously: Backend Phase 1 implementation (Users, Groups, Hangouts CRUD with Cosmos DB)
- Previously: Frontend connected to real backend API with generated TypeScript client

## Next Steps

- Continue feature development per implementation plans
- Future Phase 2: Friends system, push notifications, activity feed, friend profiles, integration tests

## Active Decisions and Considerations

- API client is auto-generated via NSwag — never manually edit `generatedClient.ts`
- Backend defaults hangout duration to 8 hours when no EndTime is provided
- Frontend `isLive` function uses 8-hour fallback (matching backend default)
- Shell environment is PowerShell — use `;` for command chaining, not `&&`

## Important Patterns and Preferences

- Use `replace_in_file` for surgical changes; `write_to_file` for new files or major rewrites
- Always regenerate API client when backend DTOs/controllers change (see `.clinerules`)
- Implementation plans are documented in markdown files at project root
- Seed data is available via `SeedController` for development testing

## Learnings and Project Insights

- PowerShell's `curl` is an alias for `Invoke-WebRequest`
- `pwsh` is not available on this system; use PowerShell commands directly
- The editor auto-formats markdown (adjusts indentation, converts `*` to `_` for italics, adds blank lines)
