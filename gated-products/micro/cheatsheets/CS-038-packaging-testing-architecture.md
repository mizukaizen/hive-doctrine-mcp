---
title: "Packaging Testing Architecture — Cheat Sheet"
hive_doctrine_id: HD-0083
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0083
full_product_price: 49
---

# Packaging Testing Architecture — Cheat Sheet

## What It Is

A system for running 40+ packaging experiments in two weeks. Your product doesn't change — your positioning (the story you tell) changes. Find packaging-market fit.

## Core Insight

Products fail on positioning more often than features. The same product that fails at $99 to one audience sells at 3x conversion to a different audience with different wording.

## 3-Layer Testing Model

### Layer 1: ICP Targeting (3-5 subdomains)
- Same product, different audience
- Each ICP gets a dedicated subdomain and landing page
- Kill losers in days, double down on winners

### Layer 2: Packaging Variants (5-10 per ICP)
- Different emotional angles for each winning ICP
- Problem-first, outcome-first, fear-based, aspiration-based
- Same product logic, different words

### Layer 3: Price Sensitivity (3 price points)
- Conservative, aggressive, middle
- Let the market tell you — don't guess

## Subdomain-as-Hypothesis Architecture

```
founders.lighthouse.example    → messaging for founders
enterprise.lighthouse.example  → messaging for corporates
finance.lighthouse.example     → messaging for CFOs
```

**Why subdomains?**
1. Branding filter — visitors see messaging designed for them
2. Contained experiments — measure conversion per subdomain without pollution
3. Clean technical isolation — analytics stay clear, email lists stay segmented

## Traffic Automation

1. Send traffic to all subdomains simultaneously
2. Measure conversion signals in real time
3. After 2-3 days, automatically adjust traffic allocation
4. Kill underperformers, redirect to winners
5. After two weeks, clear winner emerges

## The Win Condition

One variant converts 2-3x higher than the rest, and that variant resonates with a specific, targetable ICP. That's your positioning. That's your launch.

## 14-Day Sprint

| Days | Activity |
|------|----------|
| 1-2 | Define ICPs, write variants, spin up subdomains |
| 3-7 | Run experiments, measure, kill losers |
| 8-10 | Test price on winning ICP + packaging |
| 11-14 | Consolidate winner, prepare launch messaging |

## Key Insight

**Positioning vs. Product:** You're not pivoting. You're not rebuilding. You're testing how the market hears what you've already built.

---

*This is the condensed version. The full guide (HD-0083, $49) covers the complete 3-layer testing model with traffic automation, subdomain architecture, and worked examples. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
