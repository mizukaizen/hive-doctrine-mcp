# CLAUDE.md — Next.js SaaS Projects

> Author: Melisia Archimedes
> Version: 1.0
> Stack: Next.js 14+ (App Router), Prisma, NextAuth/Clerk, Stripe, Vercel

## Project Overview

This configuration governs Next.js SaaS applications with multi-tenant architecture, subscription billing, and authentication. Every decision here serves one goal: ship production SaaS that scales without rewriting.

## Project Structure

```
├── app/
│   ├── (auth)/           # Auth routes: login, signup, callback
│   ├── (dashboard)/      # Authenticated tenant routes
│   ├── (marketing)/      # Public pages: landing, pricing, blog
│   ├── api/
│   │   ├── webhooks/     # Stripe, auth provider webhooks
│   │   └── trpc/         # tRPC router (if used)
│   ├── layout.tsx        # Root layout with providers
│   └── globals.css
├── components/
│   ├── ui/               # Primitives (shadcn/ui or custom)
│   ├── forms/            # Form components with validation
│   ├── layouts/          # Shell, sidebar, nav
│   └── billing/          # Subscription, pricing, usage
├── lib/
│   ├── auth.ts           # Auth config (NextAuth options or Clerk setup)
│   ├── db.ts             # Prisma client singleton
│   ├── stripe.ts         # Stripe client + helpers
│   ├── tenant.ts         # Tenant resolution logic
│   └── utils.ts          # Shared utilities
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── middleware.ts          # Auth + tenant routing middleware
├── .env.local            # Local secrets (NEVER committed)
└── .env.example          # Template with all required vars
```

## Naming Conventions

- **Files:** kebab-case for all files (`user-profile.tsx`, `billing-utils.ts`)
- **Components:** PascalCase exports (`export function UserProfile()`)
- **Server Actions:** prefix with action verb (`createTeam`, `updateSubscription`)
- **API routes:** RESTful naming in route handlers (`app/api/teams/[teamId]/route.ts`)
- **Database models:** PascalCase in Prisma schema, singular (`model Team`, not `Teams`)
- **Environment variables:** UPPER_SNAKE_CASE, prefixed by service (`STRIPE_SECRET_KEY`, `DATABASE_URL`)
- **Types:** suffix with purpose (`TeamCreateInput`, `SubscriptionResponse`)

## Multi-Tenant Architecture

Tenant isolation is non-negotiable. Every database query must be scoped to the current tenant.

```typescript
// CORRECT — tenant-scoped query
const projects = await db.project.findMany({
  where: { teamId: currentTeam.id },
});

// WRONG — unscoped query leaks data across tenants
const projects = await db.project.findMany();
```

- Resolve tenant from subdomain or path segment in middleware
- Store `teamId` on every user-created resource
- Use Prisma middleware or a query wrapper to enforce tenant scoping automatically
- Row-level security is preferred over application-level filtering for critical data

## Authentication Rules

- Use NextAuth.js v5 (Auth.js) or Clerk — never roll custom auth
- Session strategy: JWT for edge compatibility, database sessions for audit trails
- Protect all `/dashboard` routes in middleware, not in individual pages
- Middleware must run on edge runtime — keep it lightweight, no heavy imports
- Store provider tokens encrypted if you need API access on behalf of users
- Implement proper CSRF protection on all mutation endpoints

## Billing (Stripe) Rules

- Stripe is the source of truth for subscription state — never store subscription status only in your database
- Sync via webhooks: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
- Verify webhook signatures with `stripe.webhooks.constructEvent()` — never skip this
- Use Stripe Customer Portal for self-service management
- Price IDs belong in environment variables, not hardcoded
- Handle failed payments gracefully: grace period, then restrict access, never delete data
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Server Actions and Data Fetching

- Use Server Actions for mutations (form submissions, state changes)
- Use `fetch` in Server Components for reads — leverage Next.js caching
- Always validate inputs with Zod in Server Actions before processing
- Return structured results from actions: `{ success: boolean, error?: string, data?: T }`
- Never expose internal error messages to the client
- Use `revalidatePath` or `revalidateTag` after mutations — do not rely on client-side cache invalidation

## Testing Requirements

| Type | Tool | Coverage Target | What to Test |
|------|------|----------------|--------------|
| Unit | Vitest | 80% of `/lib` | Utility functions, validation, business logic |
| Component | Vitest + Testing Library | Key UI flows | Forms, billing components, auth gates |
| Integration | Vitest | All API routes | Webhook handlers, tRPC procedures |
| E2E | Playwright | Critical paths | Signup → subscribe → use feature → cancel |
| Visual | Playwright screenshots | Landing + dashboard | Layout regression on major changes |

- Run `vitest` on every PR via GitHub Actions
- Run Playwright against preview deployments on Vercel
- Mock Stripe with `stripe-mock` in CI — never hit live Stripe in tests
- Seed test database with deterministic data via Prisma seed script

## Deployment Workflow

1. **Branch:** Feature branches from `main`, named `feat/`, `fix/`, `chore/`
2. **Preview:** Every push creates a Vercel preview deployment automatically
3. **Review:** PR requires at least one approval + passing CI
4. **Merge:** Squash merge to `main` triggers production deployment
5. **Migrations:** Run `prisma migrate deploy` in Vercel build command before app starts
6. **Rollback:** Vercel instant rollback to previous deployment — database rollback requires manual migration

### Environment Management

| Environment | Database | Stripe | Purpose |
|-------------|----------|--------|---------|
| Local | SQLite or Docker Postgres | Test mode | Development |
| Preview | Branch database (Neon/PlanetScale) | Test mode | PR review |
| Production | Production database | Live mode | Real users |

- Never use production database credentials in local or preview environments
- Vercel environment variables: set per-environment, not globally

## Security Rules

1. **CSRF protection:** Enabled by default in Server Actions — do not disable. For API routes, validate Origin header.
2. **Rate limiting:** Apply to auth endpoints (login, signup, password reset) and API routes. Use Upstash Ratelimit or similar.
3. **Input validation:** Every Server Action and API route validates input with Zod. No exceptions.
4. **SQL injection:** Prisma parameterises queries by default — never use `$queryRawUnsafe` with user input.
5. **XSS:** React escapes by default. Never use `dangerouslySetInnerHTML` with user-generated content.
6. **Tenant isolation:** Every database query is scoped. Audit quarterly.
7. **Secrets:** All secrets in environment variables. `.env.local` is gitignored. `.env.example` contains only variable names.
8. **Headers:** Set security headers in `next.config.js`: CSP, X-Frame-Options, Referrer-Policy.
9. **Dependencies:** Run `npm audit` weekly. Pin major versions. Renovate or Dependabot for updates.

## Common Pitfalls

- **Client component bloat.** Default to Server Components. Only add `"use client"` when you need interactivity, hooks, or browser APIs. Most pages should be server-rendered.
- **Middleware doing too much.** Middleware runs on every request at the edge. Keep it fast: auth check, tenant resolution, redirect. No database queries in middleware.
- **Missing webhook idempotency.** Stripe sends webhooks multiple times. Use `event.id` to deduplicate. Process each event exactly once.
- **Prisma client instantiation.** Create a singleton in `lib/db.ts` — do not instantiate `new PrismaClient()` in multiple files. In development, store on `globalThis` to survive hot reload.
- **Ignoring edge runtime constraints.** Middleware and edge routes cannot use Node.js APIs (`fs`, `crypto.subtle` differs). Test middleware logic separately.
- **Subscription state mismatch.** If your local database says "active" but Stripe says "past_due," Stripe wins. Always re-check Stripe state for access-gating decisions.

## Code Review Checklist

- [ ] Server Actions validate all inputs with Zod
- [ ] Database queries are tenant-scoped
- [ ] No secrets or API keys in client-side code
- [ ] New API routes have rate limiting
- [ ] Stripe webhook handler verifies signature
- [ ] New pages use Server Components unless interactivity is required
- [ ] Prisma migrations are backwards-compatible (no destructive changes without a migration plan)
- [ ] Error states are handled in the UI (loading, error, empty)
- [ ] `"use client"` directive is only where necessary
- [ ] Tests cover the new/changed functionality
- [ ] No `console.log` left in production code — use structured logging
- [ ] Environment variables documented in `.env.example`

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
