---
title: "Subdomain Testing Architecture — Cheat Sheet"
hive_doctrine_id: HD-0082
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0082
full_product_price: 49
---

# Subdomain Testing Architecture — Cheat Sheet

## What It Is

Run 40 experiments in 14 days using subdomains as test containers. Test ICP, messaging, and pricing in parallel instead of sequentially.

## 3 Testing Layers

| Layer | Tests | Duration | Budget |
|-------|-------|----------|--------|
| **1. ICP Targeting** | 3-5 subdomains (different audiences) | Days 5-7 | ~$2,200 |
| **2. Packaging Variants** | 5-6 messaging angles per winning ICP | Days 8-10 | ~$1,000 |
| **3. Price Sensitivity** | 3 price points on winning variant | Days 11-14 | ~$1,500 |

## Layer 1: ICP Targeting

Each subdomain targets a different customer:
```
founders.yourproduct.com
freelancers.yourproduct.com
enterprise.yourproduct.com
agencies.yourproduct.com
```
Same product, different positioning.

**Decision thresholds:**
- >5% conversion: Hot. Advance to Layer 2.
- 2-5%: Lukewarm. Optional.
- <2%: Cold. Discard.

## Layer 2: Packaging Variants

For each winning ICP, test 5-6 messaging angles:
- Speed/relief: "Cut busywork by 80%"
- Simplicity: "One less thing to manage"
- Collaboration: "Keep your team aligned"

**Decision:** Pick the variant with highest conversion. If one is 2x the others, that's your positioning.

## Layer 3: Price Sensitivity

Test 3 price points on the winning ICP + messaging combo:
- $99, $199, $299

**Decision:** Highest price that maintains >2% conversion.

## Technical Setup (Node.js)

```javascript
const subdomain = req.hostname.split('.')[0];
const config = configBySubdomain[subdomain];
res.render('landing', { ...config });
```

## 14-Day Timeline

| Days | Activity |
|------|----------|
| 1-2 | Subdomain setup, DNS, analytics, landing pages |
| 3-4 | Ad accounts, landing page variants |
| 5-7 | Run Layer 1 traffic |
| 8-10 | Run Layer 2 (packaging variants) |
| 11-14 | Run Layer 3 (price sensitivity) |

## Total Budget: $8-9K

After 14 days you know: which ICP, which messaging, which price point, and expected conversion rate on cold traffic.

---

*This is the condensed version. The full guide (HD-0082, $49) covers the complete 3-layer architecture with budget allocation, decision thresholds, Node.js routing code, and analytics tracking setup. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
