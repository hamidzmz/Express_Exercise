# Secure Express API Capstone

This repository implements a secure, middleware-driven Express API that follows the MVC pattern. It was created as a teaching project for building production-style back ends with routing, per-route rate limiting, JWT authentication, HTTPS, and centralized error handling backed by a MongoDB data store.

## Features

- HTTPS-only server bootstrapped with TLS certificates (`key.pem`, `cert.pem`).
- Environment-driven configuration with `.env` (port, JWT secret/TTL, MongoDB URI, optional TLS paths).
- MVC-inspired structure (`models`, `controllers`, `routes`).
- Middleware pipeline containing request logging, per-route rate limiting, JWT authentication, and global error handling.
- MongoDB-backed user store that supports CRUD operations (`/api/users`).
- Health check endpoint for uptime monitors (`/health`).
- Dockerfile for containerized deployments.

## Prerequisites

- Node.js 18+ (supports `crypto.randomUUID`).
- npm for dependency management.
- MongoDB 6+ (local instance or a hosted service such as Atlas).
- OpenSSL (already used to generate the sample certificates).
- Docker Desktop (optional, but recommended for running the MongoDB container locally).

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   ```bash
   cp .env .env.local
   # Edit .env.local with your secrets, then load it before running the app
   ```
   Required keys:
   - `PORT`: HTTPS port (defaults to `3443`).
   - `JWT_SECRET`: secret used to sign/verify tokens.
   - `JWT_EXPIRES_IN`: token TTL (e.g., `1h`, `30m`).
   - `MONGODB_URI`: connection string (defaults to `mongodb://localhost:27017/express_secure_api`).
   - `SEED_ADMIN_EMAIL`: email for the bootstrap admin account.
   - `SEED_ADMIN_PASSWORD`: password for the bootstrap admin account.
   Optional keys:
   - `SSL_KEY_PATH`, `SSL_CERT_PATH`: custom TLS file locations.
3. **Run the server**
   ```bash
   npm run dev
   # or
   npm start
   ```
4. **Test requests** (example with curl)
   ```bash
   # 1) Authenticate and obtain a JWT
   curl -k -X POST https://localhost:3443/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"ChangeMe123!"}'

   # 2) Use the returned token for CRUD requests
   curl -k https://localhost:3443/api/users \
     -H "Authorization: Bearer <token>"
   ```

> ⚠️ `-k` (insecure) is required for self-signed certificates unless you add the cert to your trust store.
> 🗝️ The default admin credentials come from `SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD`. Change them right away in `.env`.

## Project Structure

```
Express_Exercise/
├── controllers/
│   └── user.js
├── docker-compose.yml
├── config/
│   └── database.js
├── docs/
│   ├── presentation-outline.md
│   └── report-outline.md
├── index.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── logger.js
│   └── rateLimiter.js
├── models/
│   └── user.js
├── routes/
│   ├── auth.js
│   └── user.js
├── utils/
│   ├── jwt.js
│   └── password.js
├── .env
├── Dockerfile
├── cert.pem
├── key.pem
└── README.md
```

## Middleware Chain

1. `logger` – captures method, path, status, and duration for observability.
2. `express.json()` – parses JSON bodies.
3. `globalLimiter` – caps overall traffic.
4. Route-specific limiters – dedicated read/write/login budgets to slow abuse.
5. JWT auth middleware – ensures protected routes include a valid Bearer token.
6. Route handlers / controllers – contain business logic.
7. 404 handler – converts unknown routes to an error object.
8. `errorHandler` – formats and returns the error response.

## API Overview

| Endpoint | Method | Description | Auth |
| --- | --- | --- | --- |
| `/health` | GET | Public heartbeat | No |
| `/api/auth/login` | POST | Issue JWT for valid email/password | No |
| `/api/users` | GET | List users | Yes |
| `/api/users` | POST | Create user (`name`, `email`, `password`, optional `role`) | Yes |
| `/api/users/:id` | GET | Fetch single user | Yes |
| `/api/users/:id` | PUT | Update profile fields/password | Yes |
| `/api/users/:id` | DELETE | Remove user | Yes |

### Example Payload

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "role": "admin"
}
```

## Testing Scenarios

- **Login**: POST `/api/auth/login` with the seeded admin credentials (update `.env`).
- **Missing token**: omit the `Authorization` header and expect `401`.
- **Bad ID**: request `/api/users/unknown` to get `404`.
- **Per-route rate limits**:
  - `/api/auth/login`: >10 requests/min = `429`.
  - `/api/users` GET: >40 requests/minute per IP = `429`.
  - Mutating routes (POST/PUT/DELETE): >15 requests/minute = `429`.
- **HTTPS validation**: use curl/Postman with `-k` (or trust the cert).
- **MongoDB persistence**: restart the server and confirm data remains.

## Docker / Docker Compose

### Launch MongoDB via Docker

If you only want a MongoDB instance for local development, run:

```bash
docker compose up -d mongo
```

This starts the official `mongo:6.0` image on `localhost:27017` with data persisted under the `mongo-data` volume. Update `MONGODB_URI` in `.env` if you use a different address or credentials.

### Run the entire stack

`docker-compose.yml` also wires the Express app container to the Mongo service, mounting your TLS certificates into `/app`. Build and launch both services with:

```bash
docker compose up --build
# or, to rebuild the app image only:
docker compose up --build app
```

> The compose file overrides `MONGODB_URI` to `mongodb://mongo:27017/express_secure_api`, so no additional changes are required when running the stack together. If you prefer to run the app container against an external MongoDB (Atlas, local host, etc.), adjust the `environment` section in `docker-compose.yml`.

## Documentation Deliverables

Drafts for the written report and slide deck live under `docs/`. They outline the minimum sections you should cover (architecture diagram, middleware descriptions, environment configuration, sample responses). Fill them in with your own screenshots or diagrams before submitting the final deliverables.

## Next Steps

- Record sample Postman runs and paste JSON responses into the report template.
- Replace the self-signed cert with one generated inside Codespaces for fewer trust warnings.
- Consider the extension ideas (JWT auth, DB integration, Docker) for extra credit.
