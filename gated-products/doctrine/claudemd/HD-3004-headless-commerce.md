# CLAUDE.md — Headless Commerce Projects

> Author: Melisia Archimedes
> Version: 1.0
> Stack: Medusa.js (backend), Next.js (storefront), Stripe, PostgreSQL, Redis

## Project Overview

This configuration governs headless commerce systems where the commerce engine (Medusa.js or Saleor) is decoupled from the storefront (Next.js). This architecture provides full control over the shopping experience while leveraging battle-tested commerce primitives. The tradeoff is complexity — every integration point is your responsibility.

## Project Structure

```
├── backend/                          # Medusa.js commerce engine
│   ├── src/
│   │   ├── api/
│   │   │   ├── store/               # Customer-facing API extensions
│   │   │   └── admin/               # Admin API extensions
│   │   ├── subscribers/             # Event handlers
│   │   ├── services/                # Custom business logic services
│   │   ├── models/                  # Custom database entities
│   │   ├── repositories/            # Custom TypeORM repositories
│   │   ├── migrations/              # Database migrations
│   │   └── loaders/                 # Custom startup loaders
│   ├── medusa-config.js
│   ├── Dockerfile
│   └── package.json
├── storefront/                       # Next.js storefront
│   ├── app/
│   │   ├── (shop)/
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx         # Product listing
│   │   │   │   └── [handle]/
│   │   │   │       └── page.tsx     # Product detail
│   │   │   ├── cart/
│   │   │   │   └── page.tsx         # Cart page
│   │   │   └── checkout/
│   │   │       └── page.tsx         # Checkout flow
│   │   ├── (account)/               # Customer account pages
│   │   └── api/                     # BFF API routes
│   ├── lib/
│   │   ├── medusa-client.ts         # Medusa JS client setup
│   │   ├── stripe.ts                # Stripe Elements setup
│   │   └── cart.ts                  # Cart state management
│   ├── components/
│   │   ├── product/                 # Product card, gallery, variants
│   │   ├── cart/                    # Cart drawer, line items
│   │   ├── checkout/                # Checkout steps, payment form
│   │   └── ui/                      # Shared UI primitives
│   ├── Dockerfile
│   └── package.json
├── admin/                            # Medusa admin dashboard (optional custom)
├── docker-compose.yml                # Full stack: backend, storefront, postgres, redis
└── .env.example
```

## Naming Conventions

- **Products:** use `handle` (URL slug), not `id`, in storefront URLs (`/products/blue-widget`)
- **API extensions:** follow Medusa conventions — `src/api/store/custom/route.ts` maps to `/store/custom`
- **Services:** PascalCase class name, camelCase methods (`ProductSyncService.syncInventory()`)
- **Storefront components:** PascalCase, grouped by domain (`ProductCard`, `CartDrawer`, `CheckoutPayment`)
- **Environment variables:** prefix by service (`MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_STRIPE_KEY`, `DATABASE_URL`)
- **Regions:** use ISO codes (`us`, `eu`, `au`) — never free-text region names

## Commerce Architecture Rules

### Product Data Flow
- Products, variants, and pricing are managed in Medusa (source of truth)
- Storefront fetches product data via Medusa Store API
- Use Next.js ISR (Incremental Static Regeneration) for product pages — revalidate every 60 seconds
- Never cache prices without region context — prices vary by currency and tax inclusion

### Variant and Option Modelling
- Options define the axes (Size, Colour). Variants are the specific combinations (M/Blue, L/Red).
- Every variant must have a unique SKU, price, and inventory count
- Variant selection in the storefront must disable out-of-stock combinations
- Price display must account for tax inclusion (varies by region — AU includes GST, US excludes sales tax)

### Inventory Management
- Track inventory at the variant level, not the product level
- Use Medusa's stock location support for multi-warehouse setups
- Reserve inventory at checkout creation, release on abandonment (timeout: 30 minutes)
- Never oversell: check inventory availability before confirming payment

## Checkout Flow

The checkout is the most critical user journey. It must be reliable, fast, and secure.

### Checkout Steps
1. **Cart review** — line items, quantities, subtotal
2. **Customer information** — email, shipping address (guest or logged-in)
3. **Shipping method** — calculated rates from configured providers
4. **Payment** — Stripe Elements (card, Apple Pay, Google Pay)
5. **Confirmation** — order summary, estimated delivery

### Checkout Rules
- Create a Medusa cart on first item add. Persist the cart ID in a cookie (httpOnly, secure).
- Never store payment details — Stripe handles PCI compliance via Elements
- Calculate shipping rates server-side from the backend — never hardcode shipping prices in the storefront
- Apply discount codes server-side — never validate discounts client-side only
- Tax calculation must happen server-side based on shipping address and region
- Idempotency: payment completion must use an idempotency key to prevent double charges on retry
- Order confirmation must show even if the customer closes the browser — use webhooks, not client-side state

### Payment Integration (Stripe)
- Use Stripe Payment Intents (not Charges API)
- Create Payment Intent server-side when the customer reaches the payment step
- Confirm payment client-side with Stripe Elements
- Handle 3D Secure (SCA) — Stripe Elements manages this automatically
- Webhook `payment_intent.succeeded` triggers order completion in Medusa
- Never trust client-side payment confirmation alone — always verify via webhook

## Testing Requirements

| Type | Tool | Coverage Target | What to Test |
|------|------|----------------|--------------|
| Unit | Jest/Vitest | 80% of services | Price calculation, tax logic, discount rules, inventory checks |
| Integration | Jest + Medusa test utils | All API extensions | Custom endpoints with mocked database |
| E2E (checkout) | Playwright | Full checkout flow | Add to cart → checkout → payment → confirmation |
| E2E (admin) | Playwright | Product CRUD | Create product → add variants → set pricing → publish |
| Visual | Playwright screenshots | Product pages, cart | Layout regression on storefront |
| Payment | Stripe test mode | All payment methods | Card success, card decline, 3DS challenge, refund |

- Use Stripe test cards: `4242424242424242` (success), `4000000000000002` (decline), `4000002500003155` (3DS)
- E2E tests must run against a seeded test database — never share data between test runs
- Test the full checkout flow on every PR — this is the revenue-critical path

## Deployment Workflow

### Backend (Medusa) — Railway
1. Push to `main` triggers deployment on Railway
2. Migrations run automatically via `medusa migrations run` in the start command
3. Health check: `GET /health` must return 200
4. Environment: `DATABASE_URL`, `REDIS_URL`, `STRIPE_API_KEY`, `COOKIE_SECRET`

### Storefront (Next.js) — Vercel
1. Push to `main` triggers deployment on Vercel
2. Preview deployments on every PR branch
3. Environment: `MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_STRIPE_KEY`, `REVALIDATE_SECRET`
4. ISR revalidation: on-demand via Medusa webhook or time-based (60s default)

### Deployment Order
- Database migrations first, then backend, then storefront
- Backend must be healthy before storefront deploys (storefront depends on API availability)
- Use health check dependencies in CI/CD pipeline

## Security Rules

1. **PCI compliance:** Never handle raw card numbers. Stripe Elements handles all payment data. Your servers never see card details.
2. **Cart tampering:** All price calculations happen server-side. The client sends product IDs and quantities, never prices.
3. **Discount abuse:** Validate discount code eligibility server-side. Check usage limits, date ranges, and minimum order values.
4. **Rate limiting:** Rate limit the checkout creation endpoint (prevent cart enumeration), login endpoint, and discount validation.
5. **CORS:** Backend CORS must whitelist only the storefront domain(s). Never use `*` in production.
6. **Cookie security:** Cart cookies are httpOnly, Secure, SameSite=Lax. Session cookies are httpOnly, Secure, SameSite=Strict.
7. **Inventory manipulation:** Never trust client-reported inventory. Recheck stock at payment confirmation.
8. **Admin access:** Medusa admin API requires authentication. Admin dashboard must be on a separate domain or path with additional access controls.

## Common Pitfalls

- **Price display without region context.** Prices vary by region (currency, tax inclusion). Always resolve the customer's region before displaying prices. A product showing "$29.99" in the US should show "$32.99 incl. GST" in Australia.
- **Cart state out of sync.** The cart in the storefront can drift from the backend (items go out of stock, prices change). Re-fetch cart data on every checkout step, not just on page load.
- **Ignoring shipping calculation edge cases.** Free shipping thresholds, weight-based rates, address validation failures. Test with realistic scenarios: heavy items, remote addresses, international shipping.
- **Client-side-only discount validation.** Customers can bypass client-side checks. All discount logic must be server-side with Medusa's built-in discount engine.
- **Caching stale prices.** ISR caches product pages. If you change a price in the admin, it may take up to the revalidation period to appear. Use on-demand revalidation for price changes.
- **Not handling payment failures gracefully.** Card declines, insufficient funds, 3DS failures — the checkout must recover without losing the customer's progress.

## Code Review Checklist

- [ ] All prices calculated server-side — no client-side price calculations
- [ ] Cart operations go through Medusa API — no local price manipulation
- [ ] Stripe Payment Intent created server-side with correct amount and currency
- [ ] Inventory checked at payment confirmation, not just at add-to-cart
- [ ] Discount codes validated server-side with usage limits enforced
- [ ] Tax calculation uses correct region and shipping address
- [ ] Checkout flow handles payment failures and retries gracefully
- [ ] Product pages use ISR with appropriate revalidation period
- [ ] CORS configured to whitelist only the storefront domain
- [ ] No raw card data touches application servers (Stripe Elements only)
- [ ] E2E checkout test passes with test payment method
- [ ] Order confirmation works via webhook (not client-side payment confirmation alone)

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
