# Progress — Social Coordination App

## What Works

- **Edit Hangout** — Creator can edit their hangouts (title, date/time, duration, location, notes) via `edit-hangout/[id]` screen; delete hangout with confirmation; conditional edit button on detail page (only for creator)

### Backend (Phase 1 — Complete)

- .NET 8 Web API project scaffolded and running
- Cosmos DB integration with Users, Groups, Hangouts containers
- Clerk JWT authentication
- Full CRUD for Users, Groups, and Hangouts
- RSVP functionality
- Group member management (add/remove)
- Seed data controller for development testing
- Global exception handling with RFC 7807 Problem Details
- Correlation ID middleware
- Swagger/OpenAPI documentation
- Hangout duration: 8-hour default, 24-hour max validation

### Frontend

- React Native Expo app with file-based routing
- Clerk authentication (Google OAuth, email sign-up/sign-in)
- Home dashboard with Happening Now, Upcoming Hangouts, Recent Activity, Reminder Banners
- Hangouts tab with filtering (live, upcoming, past, my hangouts)
- Groups tab with group list
- Notifications tab
- Profile tab
- Create Hangout screen with duration picker
- Create Group screen
- Hangout detail screen
- Group detail screen
- Friend profile screen
- Find friends / user search
- Invite selection screen
- Auto-generated TypeScript API client (NSwag)
- API mappers transforming backend responses to frontend types
- Context providers (ApiClient, Hangouts, Notifications)

### DevOps / Tooling

- `.clinerules` with API client regeneration rules
- Self-improving Cline reflection rule
- Cline memory bank rule and initial documentation
- Figma MCP server for design reference

## What's Left to Build

### Phase 2 (Future)

- Friends system (send/accept friend requests, friend list)
- Push notifications (Azure Notification Hubs)
- Activity feed
- Friend profiles with shared hangout history
- Integration tests (xUnit with mocked Cosmos)
- `Azure.Storage.Queues` for async processing

### Potential Improvements

- Offline support / caching
- Image upload for user avatars (replace emoji-only)
- Group chat / messaging
- Recurring hangouts
- Location-based features / maps integration

## Current Status

The app is functional end-to-end with real backend API integration. Users can authenticate, create/manage groups, create/manage hangouts with optional duration, and RSVP. The home dashboard shows live and upcoming events. Cline rules and memory bank are now set up for consistent development across sessions.

## Known Issues

- No automated tests (manual testing via Swagger and app)
- No push notifications yet
- Friends system not implemented (friend profiles use mock data fallbacks)

## Evolution of Project Decisions

1. **Started with mock data** → Migrated to real Cosmos DB backend
2. **Manual API client** → Auto-generated via NSwag from Swagger spec
3. **No duration on hangouts** → Added optional duration with 8h default, 24h max
4. **`isLive` used 2-hour fallback** → Updated to 8-hour fallback to match backend default
5. **Flat file structure** → Organized into `Models/Domain/`, `Models/DTOs/Requests/`, `Models/DTOs/Responses/`, `Models/Enums/`
6. **No development tooling rules** → Added `.clinerules` for API regeneration, reflection, and memory bank
