# Active Context — Social Coordination App

## Current Work Focus

- Setting up Cline memory bank and self-improving reflection rules in `.clinerules`
- Most recent feature work: Adding optional duration field to create-hangout flow (see `implementation_plan.md`)

## Recent Changes

- Added **Self-Improving Cline Reflection** rule to `.clinerules`
- Added **Cline's Memory Bank** rule to `.clinerules`
- Created initial memory bank core files
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
