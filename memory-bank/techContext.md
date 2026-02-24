# Tech Context — Social Coordination App

## Technologies Used

### Frontend

- **React Native** 0.81.5 with **Expo SDK 54**
- **TypeScript** ~5.9.2
- **Expo Router** ~6.0.23 (file-based routing)
- **Clerk** (`@clerk/clerk-expo` ^2.19.26) — Authentication (Google OAuth, email)
- **Axios** ^1.13.5 — HTTP client (used by generated API client)
- **React Navigation** — Bottom tabs, native stack
- **React Native Reanimated** ~4.1.1 — Animations
- **React Native Gesture Handler** ~2.28.0
- **DateTimePicker** (`@react-native-community/datetimepicker` ^8.6.0)
- **Picker** (`@react-native-picker/picker` ^2.11.4)
- **Expo Image**, **Expo Haptics**, **Expo Secure Store**, **Expo Clipboard**

### Backend

- **C# .NET 8** Web API
- **Azure Cosmos DB** (via `Microsoft.Azure.Cosmos` 3.47.2)
- **Clerk JWT Authentication** (via `Microsoft.AspNetCore.Authentication.JwtBearer` 8.0.14)
- **Swashbuckle** 6.4.0 — Swagger/OpenAPI generation
- **Newtonsoft.Json** 13.0.3
- **Application Insights** 2.23.0

### Tooling

- **NSwag** — Generates TypeScript API client from Swagger spec
- **Git** — Version control (GitHub: `arosee1414/social-coordination-app`)
- **Visual Studio Code** — IDE

## Development Setup

### Backend

- Project path: `Backend/SocialCoordinationApp/`
- Run: `cd Backend\SocialCoordinationApp; dotnet run`
- Listens on: `http://0.0.0.0:5219`
- Swagger UI: `http://localhost:5219/swagger`
- Config: `appsettings.json` / `appsettings.Development.json`
- Launch profiles: `Properties/launchSettings.json`

### Frontend

- Project path: `social-coordination-app-ux/`
- Run: `cd social-coordination-app-ux; npm start` (Expo)
- Entry: `expo-router/entry` → `src/app/_layout.tsx`
- Source code in `src/` directory

### API Client Regeneration

1. Start backend: `cd Backend\SocialCoordinationApp; dotnet run`
2. Download spec: `curl -o social-coordination-app-ux\swagger\apiSpec.json http://localhost:5219/swagger/v1/swagger.json`
3. Generate client: `cd social-coordination-app-ux; nswag openapi2tsclient /input:"swagger\apiSpec.json" /output:"src\clients\generatedClient.ts" /className:SocialCoordinationApiClient /template:Axios /generateClientInterfaces:true`
4. Update mappers/hooks as needed

## Technical Constraints

- **PowerShell** is the default shell — use `;` to chain commands, not `&&`
- `pwsh` is NOT available
- PowerShell `curl` is an alias for `Invoke-WebRequest`
- `generatedClient.ts` must NEVER be manually edited
- Cosmos DB partition keys: Users `/id`, Groups `/createdByUserId`, Hangouts `/createdByUserId`
- Hangout duration max 24 hours, default 8 hours when EndTime not provided

## Dependencies

### Key Frontend Dependencies

- `@clerk/clerk-expo` — Auth
- `axios` — HTTP
- `expo-router` — Routing
- `expo-secure-store` — Secure token storage
- `react-native-dialog` — Dialogs

### Key Backend NuGet Packages

- `Microsoft.Azure.Cosmos` — Database
- `Microsoft.AspNetCore.Authentication.JwtBearer` — Auth
- `Swashbuckle.AspNetCore` — Swagger
- `Microsoft.ApplicationInsights.AspNetCore` — Telemetry

## Tool Usage Patterns

- Use `replace_in_file` for targeted surgical edits
- Use `write_to_file` for new files or complete rewrites
- Use `search_files` to verify API client regeneration results
- Use `list_code_definition_names` to understand file structure before editing
- Figma MCP server available for design reference (`figma-developer-mcp`)
