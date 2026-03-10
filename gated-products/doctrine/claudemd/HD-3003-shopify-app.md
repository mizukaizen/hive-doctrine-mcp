# CLAUDE.md — Shopify App Development

> Author: Melisia Archimedes
> Version: 1.0
> Stack: Shopify CLI, Remix, Polaris, App Bridge, GraphQL Admin API, Prisma

## Project Overview

This configuration governs Shopify app development using the official Remix template. Shopify apps run within the Shopify Admin and must follow strict patterns for authentication, billing, and data access. The Shopify ecosystem has sharp edges — this file keeps you off them.

## Project Structure

```
├── app/
│   ├── routes/
│   │   ├── app._index.tsx          # Main app page (embedded in Admin)
│   │   ├── app.settings.tsx        # App settings page
│   │   ├── app.products.tsx        # Product management features
│   │   ├── auth.$.tsx              # OAuth callback handler
│   │   ├── auth.login/
│   │   │   └── route.tsx           # Login page
│   │   └── webhooks.tsx            # Webhook receiver
│   ├── components/
│   │   ├── ui/                     # App-specific UI components
│   │   └── providers/              # Context providers
│   ├── models/                     # Data models and DB operations
│   ├── services/
│   │   ├── shopify.server.ts       # Shopify API helpers
│   │   ├── billing.server.ts       # Billing plan management
│   │   └── webhooks.server.ts      # Webhook processing logic
│   ├── utils/
│   └── shopify.server.ts           # Shopify app configuration
├── prisma/
│   ├── schema.prisma               # Session storage + app data
│   └── migrations/
├── extensions/                      # Shopify extensions (theme, checkout, etc.)
│   └── my-extension/
├── shopify.app.toml                 # App configuration
├── shopify.web.toml                 # Web component configuration
├── .env                             # Local dev secrets
└── package.json
```

## Naming Conventions

- **Routes:** Remix flat-route convention — `app.resource-name.tsx` for nested routes under the app shell
- **Components:** PascalCase files and exports, Polaris component naming patterns
- **Server files:** Suffix with `.server.ts` to prevent client bundling — this is critical in Remix
- **GraphQL operations:** descriptive names matching Shopify conventions (`ProductsQuery`, `OrderFulfillMutation`)
- **Webhook topics:** exact Shopify topic names in SCREAMING_SNAKE_CASE (`PRODUCTS_UPDATE`, `ORDERS_CREATE`)
- **Database tables:** snake_case, singular where Prisma conventions allow
- **Environment variables:** `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SCOPES`

## Authentication and Sessions

Shopify uses OAuth for app installation and session tokens for embedded app requests. Never roll custom auth.

- Use `@shopify/shopify-app-remix` for authentication — it handles OAuth, token exchange, and session management
- Session storage: Prisma session storage adapter. Store sessions in the database, not in memory.
- Every loader and action in app routes must call `authenticate.admin(request)` to verify the session
- Offline access tokens: stored for background jobs (webhooks, cron). Online tokens: for admin UI requests.
- Never trust `shop` parameter from query strings without verifying the session

```typescript
// CORRECT — every route loader authenticates
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  // Now safe to use admin API client
};

// WRONG — no authentication check
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const shop = new URL(request.url).searchParams.get("shop");
  // Trusting unverified shop parameter — security vulnerability
};
```

## Webhook Handling

Webhooks are the backbone of Shopify app data synchronisation. Handle them correctly or face data inconsistency.

- Register webhooks in `shopify.server.ts` configuration — the library handles registration during OAuth
- Always verify HMAC signatures — `authenticate.webhook(request)` does this automatically
- Respond with 200 status within 5 seconds — offload heavy processing to a background queue
- Webhooks are not guaranteed to arrive in order or exactly once — make handlers idempotent
- Mandatory webhooks: `APP_UNINSTALLED` (clean up shop data), `CUSTOMERS_DATA_REQUEST`, `CUSTOMERS_REDACT`, `SHOP_REDACT` (GDPR compliance — these are required for app store approval)

```typescript
// Webhook handler pattern
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      await cleanupShopData(shop);
      break;
    case "PRODUCTS_UPDATE":
      await syncProduct(shop, payload);
      break;
  }

  return new Response(null, { status: 200 });
};
```

## Billing (Recurring Charges)

- Use Shopify's Billing API, not Stripe — Shopify takes a revenue share and handles merchant billing
- Define plans in `billing.server.ts` with clear feature gates
- Check billing status on every authenticated request — use middleware or a helper in loaders
- Support both recurring charges and usage-based billing if needed
- Test billing with development stores (no real charges)
- Handle `BILLING_FAILURE` status gracefully — restrict features, show upgrade prompt, never break the app

## GraphQL Admin API

- Use the authenticated `admin` client from session authentication — never construct API calls manually
- Prefer GraphQL over REST — Shopify is deprecating REST endpoints
- Use bulk operations for large data sets (more than 250 items)
- Respect rate limits: GraphQL uses a cost-based system (1000 points per second, restore rate 50/s)
- Paginate with cursors, not page numbers
- Always request only the fields you need — over-fetching costs points

```typescript
// Efficient query — only fetch needed fields
const response = await admin.graphql(`
  query ProductsQuery($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          status
          variants(first: 10) {
            edges {
              node {
                id
                price
                inventoryQuantity
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`, { variables: { first: 50, after: cursor } });
```

## Polaris and App Bridge

- Use Polaris components for all UI — custom styling breaks the embedded admin experience
- Import from `@shopify/polaris` — do not copy-paste Polaris HTML/CSS
- Use App Bridge for navigation, toast notifications, modals, and resource pickers within the admin
- Do not use `window.location` for navigation in embedded apps — use App Bridge navigation
- Responsive design: Polaris handles this. Do not override Polaris breakpoints.
- Dark mode: Polaris supports it natively. Test your app in both light and dark mode.

## Testing Requirements

| Type | Tool | Coverage Target | What to Test |
|------|------|----------------|--------------|
| Unit | Vitest | 80% of services | Webhook handlers, billing logic, data transformations |
| Integration | Vitest + MSW | All routes | Loader/action with mocked Shopify API responses |
| E2E | Playwright | Installation flow | Install → configure → use feature → uninstall |
| Webhook | Manual + automated | All registered topics | Trigger via Shopify CLI: `shopify app webhook trigger` |

- Mock the Shopify Admin API in tests — use MSW (Mock Service Worker) for consistent responses
- Test with development stores, not production shops
- Verify GDPR webhook handlers work — these are checked during app review

## Deployment Workflow

1. **Local dev:** `shopify app dev` starts the app with ngrok tunnel and hot reload
2. **Branch:** Feature branches from `main`
3. **CI:** Run linting, type checks, and tests on every PR
4. **Preview:** Deploy preview to Railway/Fly.io for team review
5. **Production:** Merge to `main` deploys to production hosting
6. **Extensions:** `shopify app deploy` pushes extension changes to Shopify

### Hosting Requirements
- The app web server runs outside Shopify (Railway, Fly.io, Render, etc.)
- Extensions (theme, checkout UI, etc.) are hosted by Shopify after `shopify app deploy`
- Database: managed PostgreSQL (Railway, Neon, PlanetScale)
- Ensure the app URL and redirect URLs in the Partner Dashboard match the deployed URL

## Security Rules

1. **OAuth verification:** Never skip HMAC verification on OAuth callbacks. The library handles this — do not bypass it.
2. **Webhook HMAC:** Every incoming webhook must have its HMAC verified before processing. Never process unverified webhooks.
3. **Session validation:** Every admin request must be authenticated. No public routes under `/app/`.
4. **API secret protection:** `SHOPIFY_API_SECRET` must never appear in client-side code or logs.
5. **CSP headers:** Shopify requires specific Content-Security-Policy headers for embedded apps — the Remix template sets these correctly.
6. **GDPR compliance:** Implement all mandatory webhooks. Respond to data requests within 30 days.
7. **Scope minimisation:** Request only the API scopes your app actually needs. Over-scoping triggers app review scrutiny.
8. **Data retention:** Delete merchant data when the app is uninstalled (handle `APP_UNINSTALLED` webhook).

## Common Pitfalls

- **Forgetting `.server.ts` suffix.** Server-only code (API calls, database queries, secrets) must be in `.server.ts` files. Without the suffix, Remix may bundle it for the client, leaking secrets.
- **Ignoring rate limits.** Shopify throttles aggressively. Use the `admin` client's built-in retry logic. For bulk operations, use the Bulk Operations API.
- **Navigation breaks in embedded mode.** Using `<a href>` or `window.location` breaks the embedded app experience. Use App Bridge `navigate` or Remix `<Link>` components.
- **Not handling app reinstallation.** Merchants uninstall and reinstall apps. Your OAuth flow must handle re-authentication and data recovery gracefully.
- **Hardcoding URLs.** The app URL changes between dev, preview, and production. Use environment variables and the `HOST` configuration.
- **Skipping app review preparation.** Shopify's app review checks GDPR endpoints, security headers, and proper OAuth flow. Build these from day one, not as a last-minute addition.

## Code Review Checklist

- [ ] All routes under `app/` authenticate with `authenticate.admin(request)`
- [ ] Webhook handlers verify HMAC and respond within 5 seconds
- [ ] GDPR webhooks implemented (data request, customer redact, shop redact)
- [ ] Billing status checked before accessing paid features
- [ ] GraphQL queries request only required fields
- [ ] Server-only code is in `.server.ts` files
- [ ] Polaris components used for all UI (no custom HTML/CSS replacing Polaris)
- [ ] App Bridge used for navigation and UI interactions in embedded mode
- [ ] No hardcoded shop domains or API keys
- [ ] Database migrations are backwards-compatible
- [ ] Tests mock Shopify API responses (no live API calls in tests)
- [ ] API scopes in `shopify.app.toml` are minimal and justified

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
