# System Patterns — Social Coordination App

## System Architecture

```
┌─────────────────────────┐     ┌──────────────────────────────┐
│  React Native (Expo)    │     │  .NET 8 Web API              │
│  - Expo Router          │────▶│  - Controllers               │
│  - Clerk Auth           │     │  - Services (Interface DI)   │
│  - Generated API Client │◀────│  - Cosmos DB                 │
│  (NSwag / Axios)        │     │  - Clerk JWT Auth            │
└─────────────────────────┘     └──────────────────────────────┘
```

## Key Technical Decisions

1. **Auto-generated API client** — NSwag generates `generatedClient.ts` from Swagger spec; never manually edited. Regeneration is mandatory when backend DTOs/controllers change.
2. **Interface-based DI** — All services registered via interfaces (`IUsersService`, `IGroupsService`, `IHangoutsService`) for testability.
3. **Cosmos DB with partition keys** — `Users` partitioned by `/id`, `Groups` and `Hangouts` by `/createdByUserId`.
4. **Clerk JWT authentication** — Frontend gets tokens from Clerk; backend validates via JwtBearer middleware.
5. **RFC 7807 Problem Details** — Global exception handling returns standardized error responses.
6. **Correlation IDs** — Auto-generated per request, propagated via middleware, included in response headers.

## Design Patterns in Use

### Backend

- **Controller → Service → Cosmos** — Clean separation of concerns
- **Base API Controller** — Abstract `BaseApiController` provides `GetUserId()` and `GetCorrelationId()` helpers
- **Extension methods for DI** — `AddInfrastructure()` and `AddApplicationServices()` keep `Program.cs` clean
- **Generic Cosmos helpers** — `CosmosExtensions` with `ToListAsync<T>`, `InsertItem<T>`
- **Global exception middleware** — Maps exception types to HTTP status codes
- **Nested documents** — Group members and hangout attendees stored as nested arrays (not separate containers)

### Frontend

- **Expo Router** — File-based routing with `(tabs)` layout group and `(auth)` layout group
- **Context providers** — `ApiClientContext`, `HangoutsContext`, `NotificationsContext`
- **Custom hooks** — `useApiClient`, `useApiUser`, `useApiGroups`, `useApiHangoutDetail`, `useApiGroupDetail`, `useApiUserSearch`
- **API mappers** — `src/utils/api-mappers.ts` transforms backend responses to frontend types
- **Theme constants** — Centralized in `src/constants/theme.ts` and `src/constants/shared-styles.ts`
- **Generated client wrapper** — `src/clients/api-client.ts` wraps the generated client with auth token injection

## Component Relationships

### Backend Dependency Chain

```
Controllers → Services (via interfaces) → CosmosContext → Cosmos DB
                                        → ILogger
Program.cs → ServiceCollectionExtensions → registers all above
           → Middleware pipeline (Correlation → Exception → Auth → Controllers)
```

### Frontend Dependency Chain

```
_layout.tsx → ClerkProvider → ApiClientContext → App screens
App screens → Custom hooks → API client (generated) → Backend API
           → Contexts (Hangouts, Notifications)
           → Components → Theme constants
```

## Critical Implementation Paths

1. **Creating a hangout**: `create-hangout.tsx` → `useApiClient` → `generatedClient.createHangout()` → `HangoutsController.CreateHangout` → `HangoutsService.CreateHangoutAsync` → Cosmos DB
2. **RSVP flow**: Hangout detail screen → `generatedClient.rsvp()` → `HangoutsController.RSVP` → `HangoutsService.RSVP` → Updates attendee array in Cosmos document
3. **API client regeneration**: Backend change → `dotnet run` → download swagger.json → `nswag openapi2tsclient` → update mappers/hooks
4. **Auth flow**: Clerk sign-in → JWT token → `tokenCache.ts` → `api-client.ts` injects Bearer header → Backend validates via JwtBearer
