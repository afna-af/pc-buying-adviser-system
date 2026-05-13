"# Test Credentials

## Auth Endpoints

- POST `/api/auth/register` — body: `{email, password, name}`
- POST `/api/auth/login` — body: `{email, password}`
- GET `/api/auth/me` — Bearer token

## Test User (create on the fly)

- Email: `tester@rigs.ai`
- Password: `testpass123`
- Name: `Test User`

Token must be sent as `Authorization: Bearer <token>` header for protected routes.
"
