---
title: "Subdomain-Based Testing Architecture — Run 40 Experiments in 14 Days"
author: Melisia Archimedes
collection: C12-validation-engine
tier: honey
price: 49
version: 1.0
last_updated: 2026-03-09
audience: founders
hive_doctrine_id: HD-0082
---

# Subdomain-Based Testing Architecture — Run 40 Experiments in 14 Days

## The Core Idea

Most founders test one thing at a time.

They build a landing page. They run ads. They measure conversion. They iterate. They run ads again.

This takes months.

The subdomain testing architecture compresses months into 14 days by testing 40 combinations simultaneously.

The mechanism is simple: instead of one landing page, you run 5–10 subdomains, each with different messaging, targeting different ideal customer profiles (ICPs), each supporting multiple pricing variants.

All subdomains serve the *same underlying product*. They're just different packaging, different positioning, different target audiences.

The result: you identify the highest-converting ICP, messaging, and price point *in parallel* instead of sequentially.

## The Three Testing Layers

The architecture operates across three layers:

### Layer 1: ICP Targeting (3–5 subdomains)

Each subdomain targets a different ideal customer profile:

- **founders.yourproduct.com** → Bootstrapped SaaS founders
- **freelancers.yourproduct.com** → Freelance product managers
- **enterprise.yourproduct.com** → Enterprise product teams
- **agencies.yourproduct.com** → Design/dev agencies
- **legal.yourproduct.com** → In-house legal teams

Same product, different positioning, different problems solved, different benefits highlighted.

Layer 1 answers: **Which ICP has the highest purchase intent?**

### Layer 2: Packaging Variants (5–10 per ICP)

Each ICP subdomain has 5–10 variant landing pages with different messaging angles:

On **founders.yourproduct.com**:

- **Variant A:** "Cut roadmap updates by 80%. Ship faster."
- **Variant B:** "One less thing to manage. Automate your roadmap."
- **Variant C:** "Keep your team aligned without status meetings."

Layer 2 answers: **Which messaging angle converts highest for each ICP?**

### Layer 3: Price Sensitivity (3–4 price points per variant)

Each variant tests 3–4 price points:

- **founders-variant-a-49.yourproduct.com** → $49/month
- **founders-variant-a-99.yourproduct.com** → $99/month
- **founders-variant-a-199.yourproduct.com** → $199/month

Layer 3 answers: **At what price does this ICP + messaging combination optimise conversion?**

## The Math

- **5 ICPs × 6 messaging variants × 3 price points = 90 combinations**

You won't test all 90. You'll test:

- **Layer 1:** 5 subdomains (ICP targeting)
- **Layer 2:** 30 variant landing pages (6 variants × 5 ICPs)
- **Layer 3:** 20–30 price-point variants (selected winners from Layer 2)

That's ~50–55 unique URLs, all running in parallel, all driving back to a single test server.

## The 14-Day Timeline

### Days 1–2: Architecture Setup

Set up subdomain infrastructure:

```
yourproduct.com           (main marketing site)
founders.yourproduct.com  (ICP 1)
freelancers.yourproduct.com (ICP 2)
enterprise.yourproduct.com (ICP 3)
agencies.yourproduct.com   (ICP 4)
legal.yourproduct.com      (ICP 5)
```

Each subdomain serves the same codebase with environment-based switching:

```javascript
// app.js
const subdomain = req.hostname.split('.')[0];
const config = configBySubdomain[subdomain];

// Render landing page with config
res.render('landing', {
  headline: config.headline,
  subheading: config.subheading,
  cta: config.cta,
  pricing: config.pricing
});
```

Set up tracking (Segment, Mixpanel, or custom analytics):

```javascript
// Track which subdomain/variant drove the conversion
analytics.track('conversion', {
  subdomain: subdomain,
  variant: variantId,
  price: pricing,
  timestamp: new Date()
});
```

**Tools needed:**
- Subdomain DNS management (any registrar)
- Web server (Node.js, Rails, or static site generator)
- Analytics (Mixpanel, Segment, or custom)
- Payment processor (Stripe, Gumroad)

### Days 3–4: Landing Pages & Ad Setup

Create landing page templates. Each ICP gets one base template, with 5–6 variants:

**Founders variant:**
- Headline: "Cut your roadmap busywork by 80%. Ship faster."
- Problem: "You're spending 4 hours/week updating spreadsheets."
- Solution: "Automated roadmap syncs. One config, done."

**Enterprise variant:**
- Headline: "Roadmap alignment without the meetings."
- Problem: "Your distributed team is always out of sync."
- Solution: "Real-time roadmap visibility. Fewer status calls."

Keep landing pages minimal: 1 headline, 1 subheading, 1 problem statement, 1 solution statement, 1 CTA, 1 image. No fluff. Text only.

Set up ad accounts (Google Ads, LinkedIn Ads, or both):

- **Budget allocation:** $2,000–$3,000 total across all subdomains
- **CPC target:** Keep spend under $1 per click (adjust keywords/bids to stay there)
- **Duration:** 5 days of continuous spend

### Days 5–7: Run Traffic & Measure Layer 1

Run ads to all 5 primary subdomains simultaneously. Measure:

| Subdomain | Clicks | Signups/Payments | Conversion Rate | CAC (Cost per Acquisition) |
|-----------|--------|------------------|-----------------|---------------------------|
| founders.yourproduct.com | 450 | 22 | 4.9% | $91 |
| freelancers.yourproduct.com | 380 | 8 | 2.1% | $188 |
| enterprise.yourproduct.com | 320 | 6 | 1.9% | $333 |
| agencies.yourproduct.com | 290 | 12 | 4.1% | $125 |
| legal.yourproduct.com | 160 | 4 | 2.5% | $250 |

**Layer 1 Decision Threshold:**

- **>5% conversion:** This ICP is hot. Advance to Layer 2 testing.
- **2–5% conversion:** This ICP is lukewarm. Optional to advance.
- **<2% conversion:** This ICP is cold. Discard.

From the example above: **Founders (4.9%) and Agencies (4.1%) pass**. Advance both to Layer 2.

**Spend to date:** ~$2,200 over 5 days.

### Days 8–10: Run Layer 2 — Packaging Variants

You've identified two hot ICPs: Founders and Agencies.

For each ICP, run 5–6 messaging variants. Allocate $500 per ICP ($1,000 total), split evenly across variants:

**Founders variants (tested simultaneously):**

- founders-v1: "Cut roadmap busywork by 80%." (speed/relief)
- founders-v2: "One less thing to manage." (simplicity)
- founders-v3: "Keep your team aligned." (collaboration)
- founders-v4: "Spend time on strategy, not updates." (priority)
- founders-v5: "GitHub is your source of truth." (consolidation)
- founders-v6: "Ship faster, plan smarter." (efficiency)

| Variant | Clicks | Conversions | Rate | Winner |
|---------|--------|------------|------|--------|
| founders-v1 (speed) | 85 | 5 | 5.9% | ✓ |
| founders-v2 (simplicity) | 82 | 3 | 3.7% | |
| founders-v3 (collaboration) | 88 | 4 | 4.5% | |
| founders-v4 (priority) | 79 | 3 | 3.8% | |
| founders-v5 (consolidation) | 81 | 2 | 2.5% | |
| founders-v6 (efficiency) | 85 | 4 | 4.7% | |

**Layer 2 Decision:** Founders-v1 (speed/relief) wins at 5.9%.

Repeat for Agencies ICP. Identify top variant there too.

**Spend to date:** $3,200 (Layer 1 + Layer 2).

### Days 11–14: Run Layer 3 — Price Sensitivity

You've identified the winning ICP (Founders) and messaging (speed/relief).

Now test price. Create three subdomains with identical landing pages but different prices:

- founders-v1-99: $99/month
- founders-v1-199: $199/month
- founders-v1-299: $299/month

Run $500 each (total $1,500) for 4 days. Measure conversion rate at each price:

| Price | Clicks | Conversions | Conversion Rate | Implied MRR (if scaled 10x) |
|-------|--------|------------|-----------------|---------------------------|
| $99 | 510 | 24 | 4.7% | $11,880 |
| $199 | 490 | 14 | 2.9% | $13,860 |
| $299 | 470 | 8 | 1.7% | $12,040 |

**Layer 3 Decision:** Price-elasticity drop from $99 to $199 is 38% (acceptable). Drop from $199 to $299 is 41% (acceptable but steeper). **Optimal price: $199/month**. Conversion is still 2.9%, which is healthy.

**Total spend:** $8,500–$9,000 over 14 days.

## Decision Thresholds & Go/No-Go Criteria

### Layer 1: ICP Identification

- **>5% conversion:** Definite pass. This ICP will support a business.
- **3–5% conversion:** Conditional pass. Could work if messaging (Layer 2) improves it.
- **<3% conversion:** Discard. This ICP isn't a fit.

**Decision:** Advance the top 2–3 ICPs to Layer 2. Discard the rest.

### Layer 2: Messaging Validation

- **One variant 2x higher than others:** Clear winner. Use that messaging in production.
- **All variants within 20% of each other:** No strong angle. Problem/solution fit is the lever, not messaging. Use the highest performer anyway.
- **All variants <3% conversion:** This ICP isn't viable after all. Discard.

**Decision:** Pick the top variant per ICP. Advance to Layer 3.

### Layer 3: Price Optimization

- **Conversion rate stays >3% at higher price:** You're underpriced. Test even higher.
- **Conversion rate drops to 1–2% at higher price:** This is the ceiling. Stay at the previous price.
- **Conversion rate drops <1% at any price:** You've gone too high. Go back one tier.

**Final decision:** Choose the highest price that maintains >2% conversion rate.

## Implementation: Technical Architecture

### Subdomain Routing

Using Node.js/Express:

```javascript
const express = require('express');
const app = express();

// Config mapping subdomain to landing page variant
const configs = {
  'founders': { headline: 'Cut roadmap busywork by 80%', ...},
  'freelancers': { headline: 'Manage all your clients from one dashboard', ...},
  'enterprise': { headline: 'Roadmap alignment without meetings', ...},
  // ... etc
};

app.get('/', (req, res) => {
  const subdomain = req.hostname.split('.')[0];
  const config = configs[subdomain] || configs.default;

  res.render('landing', {
    ...config,
    trackingId: `${subdomain}-${Date.now()}`
  });
});

app.post('/signup', (req, res) => {
  const subdomain = req.hostname.split('.')[0];
  const variant = req.body.variant || 'default';

  // Log conversion with source tracking
  db.conversions.insert({
    subdomain: subdomain,
    variant: variant,
    price: config.pricing,
    email: req.body.email,
    timestamp: new Date()
  });

  // Redirect to payment
  res.redirect(`/checkout?subdomain=${subdomain}&variant=${variant}`);
});
```

### Tracking & Analytics

```javascript
// Client-side tracking
<script>
  window.addEventListener('load', () => {
    analytics.track('pageview', {
      subdomain: window.location.hostname.split('.')[0],
      variant: new URLSearchParams(window.location.search).get('v'),
      referrer: document.referrer
    });
  });

  document.getElementById('signup-btn').addEventListener('click', () => {
    analytics.track('conversion', {
      subdomain: window.location.hostname.split('.')[0],
      variant: new URLSearchParams(window.location.search).get('v'),
      timestamp: new Date()
    });
  });
</script>
```

### Analytics Dashboard

Create a simple dashboard (Metabase, Looker, or Google Sheets) showing:

- Clicks per subdomain/variant
- Conversion rates (ranked)
- Cost per acquisition
- Revenue opportunity (conversions × price)

```
Layer 1 Results:
Founders: 4.9% conv, $91 CAC ✓
Agencies: 4.1% conv, $125 CAC ✓
Enterprise: 1.9% conv, $333 CAC ✗

Layer 2 Results (Founders):
founders-v1: 5.9% ✓
founders-v3: 4.5%
founders-v4: 3.8%

Layer 3 Results (founders-v1):
$99: 4.7% conv
$199: 2.9% conv ✓
$299: 1.7% conv
```

## Why This Architecture Works

### 1. Parallelism Beats Sequentialism

Testing one thing at a time takes 4–6 weeks per iteration.
Testing 50 things in parallel takes 2 weeks total.

You collapse time by running experiments simultaneously.

### 2. Statistical Power

With 5,000+ total clicks across the experiment, you have strong statistical confidence in your winners.

A single landing page test with 500 clicks is noisy. A 50-variant test with 5,000 clicks is solid.

### 3. Emergent Insight

You might think "Founders care most about speed." But the data says otherwise.

Testing 50 combinations reveals unexpected patterns: maybe Agencies care more about support, or Enterprise cares about integration depth.

You find what actually matters, not what you thought would matter.

### 4. Low Risk

You're spending $8–$9K to test 50 combinations.

Building a full MVP for one hypothesis costs $30–$50K.

This is the cheapest way to reduce uncertainty before committing to build.

## Common Mistakes

### Mistake 1: Testing Too Many Variables at Once

You create 20 subdomains with completely different landing pages, different products, different CTAs.

Result: you can't isolate what drove conversions. Speed vs. messaging vs. design vs. ICP—which one mattered?

**Fix:** Hold design constant. Change only the messaging and ICP positioning. Change only one variable per layer.

### Mistake 2: Underfunding Ad Spend

You allocate $200 to each variant (so $10K total for 50 variants).

Result: each variant gets 40 clicks. That's statistically weak.

**Fix:** Allocate enough budget to get 100+ clicks per variant (~$2K per variant, so $100K total if you have 50 variants). Or test fewer variants with more budget each.

This framework is designed for $8–$9K spend. If you don't have that, test fewer variants.

### Mistake 3: Ignoring Cohort Bias

Your Founders audience might convert higher simply because it's a smaller, more targeted segment.

That doesn't mean it's a better business—it might just mean acquisition is easier, not that LTV is higher.

**Fix:** Track LTV separately. Test churn and retention, not just acquisition.

### Mistake 4: Not Repeating the Winning Combination

You identify "Founders + speed messaging + $199" as the winner.

Then you build a full product and forget to replicate that exact messaging in your marketing.

**Result:** new acquisition converts at 1–2% instead of 2.9%.

**Fix:** Lock the winning messaging. Use it in your website copy, email campaigns, ad creative, onboarding. Stay consistent.

## Advanced: Sequential Refinement

If you want to run this multiple times (14-day cycles, multiple rounds), here's the refinement process:

**Cycle 1 (Days 1–14):** Identify top ICP, messaging, price.
**Cycle 2 (Days 15–28):** Test 3–5 sub-variants of the winning combination (refine messaging further, test adjacent price points).
**Cycle 3 (Days 29–42):** Lock the winner. Move to build.

This takes 6 weeks but gives you high-confidence, iterated results.

## Next Steps After Testing

Once you have Layer 3 results, you know:

- **ICP:** Founders
- **Messaging angle:** Speed/relief from busywork
- **Price:** $199/month
- **Expected conversion:** ~2.9% on cold traffic
- **Expected CAC:** ~$120

Build your MVP to support this ICP, with messaging that emphasizes speed and relief.

Launch with the same landing page design and copy that drove 2.9% conversion in testing.

Track post-launch conversion. It should match test results (within 20%). If it doesn't, something changed (ad quality, landing page drift, etc.)—investigate.

## The Last Word

The subdomain testing architecture is a forcing function for rigor.

Most founders ship a product based on intuition. This framework forces you to let market data guide ICP, messaging, and pricing *before* you commit to build.

It costs $8K and 2 weeks.

Getting all three variables wrong costs $50K and 6 months.

Do the math.
