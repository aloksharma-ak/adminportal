# Admin Portal Architecture & Conventions

## API Integration
- **Centralized Client:** All backend API calls must use `apiPost` from `src/lib/api-client.ts`. Do not use raw `fetch` or `axios` directly in components or server actions.
- **Request Metadata:** Use `reqMeta` from `src/lib/api-client.ts` to attach standard request metadata (like `requestGuid` and `requestTime`) to every API payload. When called on the server, `reqMeta` will automatically fetch the user's `profileId` from the NextAuth session if the `userId` parameter is omitted.
- **Error Handling:** The `parseError` utility in the API client automatically handles `ValidationProblemDetails` returned by the ASP.NET backend.

## Authentication
- **NextAuth:** The application uses NextAuth.js with a custom `CredentialsProvider`.
- **Protected Routes:** Routes starting with `/dashboard`, `/user`, and `/admin` are protected by `middleware.ts` and require an active session. Unauthenticated users will be redirected to `/auth/login`.

## Environment Variables
- `API_URL`: Base URL for core organisation and user management endpoints.
- `ADMISSION_API_URL`: Base URL for admission-related endpoints.
