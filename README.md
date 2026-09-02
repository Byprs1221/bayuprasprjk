# Auth Fullstack Monorepo

Take-home test: a minimal but complete authentication app.

- **Frontend:** React + Vite (JavaScript)
- **Backend:** Express + SQLite (JavaScript, ESM)
- **Auth:** register, login, JWT-protected routes
- **Monorepo:** npm workspaces

Users can register, log in, and view a protected dashboard. The JWT is stored in
`localStorage` and validated against the backend on load.

---

## Tech stack

| Layer    | Tools                                                              |
| -------- | ----------------------------------------------------------------- |
| Frontend | React 18, React Router 6, Vite 5                                  |
| Backend  | Express 4, better-sqlite3, jsonwebtoken, bcryptjs, zod, dotenv    |
| Tooling  | npm workspaces, concurrently                                       |

---

## Project structure

```
auth-fe/
├── package.json              # root: workspaces + dev scripts
├── packages/
│   ├── backend/
│   │   ├── .env.example       # copy to .env
│   │   ├── data/             # SQLite file lives here (gitignored)
│   │   └── src/
│   │       ├── config.js      # env loader
│   │       ├── db.js          # DB connection + migrations (run on import)
│   │       ├── app.js         # express app factory
│   │       ├── server.js      # entry point
│   │       ├── models/user.model.js
│   │       ├── controllers/auth.controller.js
│   │       ├── routes/auth.routes.js
│   │       ├── middleware/authenticate.js
│   │       ├── validators/auth.schema.js
│   │       └── utils/jwt.js
│   └── frontend/
│       ├── vite.config.js     # dev proxy /api -> :4000
│       └── src/
│           ├── main.jsx
│           ├── App.jsx         # routing
│           ├── api/client.js   # fetch wrapper (+ JWT)
│           ├── context/AuthContext.jsx
│           ├── components/ProtectedRoute.jsx
│           └── pages/{Login,Register,Dashboard}.jsx
```

---

## Prerequisites

- Node.js >= 18 (built and tested on Node 24)
- npm >= 9

---

## Setup

From the repository root:

```bash
# 1. Install all workspace dependencies
npm install

# 2. Configure backend environment
cp packages/backend/.env.example packages/backend/.env
# then edit packages/backend/.env and set a strong JWT_SECRET
```

### Backend environment variables (`packages/backend/.env`)

| Variable        | Default                      | Description                          |
| --------------- | ---------------------------- | ------------------------------------ |
| `PORT`          | `4000`                       | Backend port                         |
| `JWT_SECRET`    | —                            | Secret used to sign JWTs (set this!) |
| `JWT_EXPIRES_IN`| `7d`                         | Token lifetime                       |
| `DATABASE_FILE` | `./data/auth.sqlite`         | SQLite file path (relative to backend) |
| `CORS_ORIGIN`   | `http://localhost:5173`      | Allowed frontend origin              |

---

## Running

### Both at once (recommended)

```bash
npm run dev
```

Runs backend on <http://localhost:4000> and frontend on <http://localhost:5173>
concurrently. The Vite dev server proxies `/api/*` to the backend, so there are
no CORS issues in development.

### Individually

```bash
npm run dev:backend    # http://localhost:4000
npm run dev:frontend   # http://localhost:5173
```

### Production build (frontend)

```bash
npm run build          # outputs packages/frontend/dist
```

Open <http://localhost:5173>, register an account, and you'll be redirected to the
protected dashboard.

---

## API documentation

Base URL: `http://localhost:4000/api`

All request/response bodies are JSON.

### `GET /health`

Health check.

```json
200 OK
{ "status": "ok", "timestamp": "2026-01-01T00:00:00.000Z" }
```

### `POST /auth/register`

Create a new account. Returns the user and a JWT.

Request:

```json
{ "name": "Alice", "email": "alice@example.com", "password": "secret123" }
```

Validation: `name` >= 2 chars, valid `email`, `password` >= 6 chars.

```json
201 Created
{
  "user": { "id": 1, "name": "Alice", "email": "alice@example.com", "createdAt": "2026-01-01 00:00:00" },
  "token": "<jwt>"
}
```

Errors: `400` validation failed (includes `details`), `409` email already registered.

### `POST /auth/login`

Authenticate and receive a JWT.

Request:

```json
{ "email": "alice@example.com", "password": "secret123" }
```

```json
200 OK
{
  "user": { "id": 1, "name": "Alice", "email": "alice@example.com", "createdAt": "..." },
  "token": "<jwt>"
}
```

Errors: `400` validation failed, `401` invalid email or password (generic message
to avoid leaking which field was wrong).

### `GET /auth/me` 🔒

Return the currently authenticated user. Requires a Bearer token.

Request header:

```
Authorization: Bearer <jwt>
```

```json
200 OK
{ "user": { "id": 1, "name": "Alice", "email": "alice@example.com", "createdAt": "..." } }
```

Errors: `401` missing/malformed header or invalid/expired token.

---

## Curl example

```bash
# register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'

# login (grab the token from the response)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'

# protected route
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## Design & security notes

- **Password hashing:** bcrypt (`bcryptjs`) with 10 salt rounds. Plaintext
  passwords are never stored or logged.
- **JWT:** signed with `JWT_SECRET`; the payload holds only the user id (`sub`)
  and email. Expiry is configurable via `JWT_EXPIRES_IN`.
- **SQL injection:** every query uses parameterized prepared statements
  (better-sqlite3).
- **Input validation:** zod schemas validate and normalize all auth input
  (trim, lowercase email) before it reaches the database.
- **Migrations:** run automatically when `db.js` is imported, so the schema
  always exists before any model prepares its statements.
- **Frontend session:** the token is kept in `localStorage` and re-validated via
  `GET /auth/me` on app load; an invalid/expired token clears the session and
  redirects to `/login`.
- **Protected routing:** `ProtectedRoute` guards `/dashboard`; `PublicOnly`
  redirects already-authenticated users away from `/login` and `/register`.

### Possible next steps

- Refresh tokens / token rotation, or HttpOnly cookie storage instead of
  `localStorage` to mitigate XSS token theft.
- Rate limiting on auth endpoints.
- Automated test suite (Vitest / Supertest).
```
