# CLAUDE.md — API-First Backend Projects

> Author: Melisia Archimedes
> Version: 1.0
> Stack: FastAPI (Python) or Express (Node.js), OpenAPI, JWT, PostgreSQL

## Project Overview

This configuration governs API-first backend services designed to be consumed by multiple clients — web frontends, mobile apps, third-party integrations. The API specification is the contract. Code serves the spec, not the other way around.

## Project Structure (FastAPI)

```
├── app/
│   ├── main.py              # FastAPI app, CORS, lifespan events
│   ├── config.py            # Settings via pydantic-settings
│   ├── dependencies.py      # Shared FastAPI dependencies
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # Login, register, token refresh
│   │   ├── users.py         # User CRUD
│   │   └── resources.py     # Domain resources
│   ├── models/
│   │   ├── database.py      # SQLAlchemy models
│   │   └── schemas.py       # Pydantic request/response models
│   ├── services/            # Business logic (no HTTP awareness)
│   ├── middleware/           # Auth, rate limiting, logging
│   └── utils/               # Helpers, formatters
├── alembic/                  # Database migrations
│   ├── versions/
│   └── env.py
├── tests/
│   ├── conftest.py          # Fixtures, test client, test DB
│   ├── test_auth.py
│   └── test_resources.py
├── alembic.ini
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml        # API + Postgres + Redis
└── .env.example
```

## Project Structure (Express)

```
├── src/
│   ├── index.ts              # Express app setup
│   ├── config.ts             # Environment config with validation
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   └── resources.routes.ts
│   ├── controllers/          # Request handling, response formatting
│   ├── services/             # Business logic
│   ├── models/               # Database models (Prisma/Drizzle)
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rate-limit.ts
│   │   ├── validate.ts       # Zod validation middleware
│   │   └── error-handler.ts
│   ├── schemas/              # Zod schemas for request validation
│   └── utils/
├── prisma/
│   └── schema.prisma
├── tests/
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Naming Conventions

- **Endpoints:** plural nouns, lowercase, kebab-case (`/api/v1/team-members`)
- **HTTP methods:** GET (read), POST (create), PUT (full update), PATCH (partial update), DELETE (remove)
- **URL parameters:** camelCase for query params (`?pageSize=20&sortBy=createdAt`)
- **Response fields:** camelCase in JSON responses
- **Files:** snake_case for Python, kebab-case for TypeScript
- **Database tables:** snake_case, plural (`team_members`)
- **Environment variables:** UPPER_SNAKE_CASE

## API Design Rules

### Versioning
- URL path versioning: `/api/v1/`, `/api/v2/`
- Never break a versioned endpoint — deprecate and migrate
- Sunset header on deprecated endpoints: `Sunset: Sat, 01 Mar 2025 00:00:00 GMT`

### Pagination
- Cursor-based pagination for large datasets (not offset-based)
- Response format: `{ data: [], meta: { cursor: "abc", hasMore: true } }`
- Default page size: 20. Maximum: 100. Client-configurable via `pageSize` param.
- Always include pagination metadata, even on the last page

### Error Handling
Consistent error response shape across all endpoints:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```
- Use appropriate HTTP status codes: 400 (validation), 401 (unauthenticated), 403 (unauthorised), 404 (not found), 409 (conflict), 422 (unprocessable), 429 (rate limited), 500 (server error)
- Never expose stack traces or internal error details in production responses
- Log full error context server-side with correlation IDs

### Input Validation
- Validate every input at the boundary — Pydantic models for FastAPI, Zod schemas for Express
- Reject unknown fields (strict mode) unless explicitly accepting dynamic data
- Validate path parameters, query parameters, headers, and request bodies
- Return all validation errors at once, not one at a time

## Authentication and Authorisation

### JWT Authentication
- Access tokens: short-lived (15 minutes)
- Refresh tokens: longer-lived (7 days), stored httpOnly, rotated on use
- Include `sub` (user ID), `iat`, `exp`, and `roles` in JWT payload
- Verify signature on every request in middleware — never trust client claims without verification
- Revocation: maintain a deny list in Redis for logged-out tokens until expiry

### API Key Authentication
- For service-to-service or third-party integrations
- Hash API keys before storing (bcrypt or SHA-256 with salt)
- Prefix keys with a service identifier: `hd_live_`, `hd_test_`
- Rate limit per API key independently
- Support key rotation: allow multiple active keys per client

### Authorisation
- Role-based access control (RBAC) at minimum
- Check permissions in middleware or decorators, not in business logic
- Principle of least privilege: default deny, explicitly grant

## Testing Requirements

| Type | Tool | Coverage Target | What to Test |
|------|------|----------------|--------------|
| Unit | pytest / Jest | 85% of services | Business logic, validation, transformations |
| Integration | pytest + httpx / supertest | All endpoints | Request → response cycle, auth, error cases |
| Contract | Schemathesis / Dredd | OpenAPI spec | Spec matches implementation |
| Load | Locust / k6 | Key endpoints | P95 latency under expected load |

- Every endpoint has at least: happy path, validation error, auth error, not found tests
- Test database: use transactions that roll back after each test, or a dedicated test database
- Mock external services (payment, email) — never call real services in tests
- CI runs full test suite on every PR

## OpenAPI Specification

- Auto-generate from code (FastAPI does this natively; for Express use `swagger-jsdoc` or `tsoa`)
- Review generated spec in PRs — spec changes are API changes
- Publish spec at `/api/docs` (Swagger UI) and `/api/openapi.json`
- Disable Swagger UI in production if the API is not public
- Use spec to generate client SDKs for frontend teams

## Deployment Workflow

1. **Branch:** Feature branches from `main`, named `feat/`, `fix/`, `chore/`
2. **CI:** Lint, type check, test, build Docker image
3. **Preview:** Deploy to staging environment on PR (Railway preview environments or Fly.io staging)
4. **Review:** PR requires passing CI + one approval
5. **Merge:** Merge to `main` triggers production deployment
6. **Migrations:** Run database migrations as part of deployment (before new code serves traffic)
7. **Health check:** Deployment succeeds only if `/health` returns 200 within 30 seconds

### Deployment Targets
- **Railway:** Connect GitHub repo, auto-deploy on push to `main`, preview environments on PRs
- **Fly.io:** `fly deploy` from CI, use `fly.toml` for config, multi-region if needed
- **Docker:** Build once, deploy anywhere — `Dockerfile` produces a minimal production image

### Database Migrations
- Alembic (Python) or Prisma Migrate (Node.js)
- Migrations are forward-only in production — never edit a deployed migration
- Test migrations against a copy of production data before deploying
- Backwards-compatible migrations only: add columns as nullable, backfill, then add constraints

## Rate Limiting

- Apply rate limits at the middleware level
- Default limits: 100 requests/minute for authenticated, 20 requests/minute for unauthenticated
- Stricter limits on auth endpoints: 5 attempts/minute for login, 3/hour for password reset
- Return `429 Too Many Requests` with `Retry-After` header
- Use Redis-backed sliding window counters for distributed deployments
- Rate limit by API key, user ID, or IP address (in that priority order)

## Security Rules (OWASP API Top 10)

1. **Broken Object Level Authorisation:** Always verify the requesting user has access to the specific resource. Check ownership, not just authentication.
2. **Broken Authentication:** Enforce strong passwords, rate limit login, use constant-time comparison for secrets.
3. **Broken Object Property Level Authorisation:** Use explicit response schemas — never return raw database objects. Filter fields based on user role.
4. **Unrestricted Resource Consumption:** Rate limiting, request size limits (`max_content_length`), pagination limits, query complexity limits.
5. **Broken Function Level Authorisation:** Admin endpoints have role checks. Never rely on "security through obscurity" (hidden URLs).
6. **Server-Side Request Forgery:** Validate and sanitise all URLs. Never fetch arbitrary user-supplied URLs without allowlisting.
7. **Security Misconfiguration:** Disable debug mode in production. Remove default credentials. Set CORS restrictively.
8. **Lack of Protection from Automated Threats:** Bot detection on signup, CAPTCHA on sensitive forms.
9. **Improper Asset Management:** Document all endpoints. Decommission old API versions. No shadow APIs.
10. **Unsafe Consumption of APIs:** Validate responses from third-party APIs. Set timeouts. Handle failures gracefully.

## Common Pitfalls

- **Fat controllers.** Controllers handle HTTP concerns only (parse request, call service, format response). Business logic lives in services. A controller function should be under 20 lines.
- **Missing correlation IDs.** Generate a unique request ID in middleware, propagate it through logs. Without this, debugging production issues across services is blind.
- **N+1 queries.** Use eager loading (joinedload in SQLAlchemy, include in Prisma) or batch queries. Monitor query count per request in development.
- **Inconsistent error formats.** Every error response must match the standard error shape. Middleware catches unhandled exceptions and formats them consistently.
- **Leaking internal details.** Database column names, stack traces, SQL errors — none of these should reach the client. Map internal errors to client-safe messages.
- **Ignoring idempotency.** POST endpoints that create resources should accept an idempotency key. Retried requests must not create duplicates.

## Code Review Checklist

- [ ] All inputs validated with Pydantic/Zod at the boundary
- [ ] Endpoint has appropriate authentication and authorisation checks
- [ ] Response schema is explicitly defined — no raw database objects returned
- [ ] Error cases return consistent error format with correct HTTP status
- [ ] New endpoint documented in OpenAPI (auto-generated or manual)
- [ ] Database queries are efficient — no N+1, appropriate indexes exist
- [ ] Rate limiting applied to new endpoints
- [ ] Migration is backwards-compatible
- [ ] Tests cover happy path, validation errors, auth errors, not found
- [ ] No secrets or credentials in code
- [ ] Logging includes correlation ID, no PII in logs
- [ ] Pagination implemented for list endpoints

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
