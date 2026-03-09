---
title: "LLM Routing & Model Selection Guide — Cheat Sheet"
hive_doctrine_id: HD-1104
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-1104
full_product_price: 79
---

# LLM Routing & Model Selection Guide — Cheat Sheet

## What It Is

Model landscape comparison, 5 routing strategies, and how to build a router that sends each request to the right model.

## Model Landscape (2026)

| Model | Best For | Input/Output Cost (per MTok) |
|-------|----------|------------------------------|
| Claude Haiku 3.5 | Fast classification, extraction | $0.25 / $1.25 |
| Claude Sonnet 3.5 | Coding, analysis, most tasks | $3 / $15 |
| Claude Opus | Complex reasoning, critical decisions | $15 / $75 |
| GPT-4o | Multi-modal, general purpose | $2.50 / $10 |
| GPT-4o Mini | Budget general purpose | $0.15 / $0.60 |
| Gemini 1.5 Pro | Long context (1M tokens) | $1.25 / $5 |
| Llama 3 70B | Self-hosted, no API costs | Infra only |

## 5 Routing Strategies

### 1. Simple Task-Type Routing
```
Classification → Haiku
Coding → Sonnet
Complex reasoning → Opus
```
Easiest to implement. Static rules.

### 2. Complexity-Based Routing
Estimate task complexity (token count, domain, required reasoning depth). Route based on score:
- Low complexity → Haiku
- Medium → Sonnet
- High → Opus

### 3. Cascade Routing
Start with cheapest model. If confidence is low, escalate:
```
Haiku → (low confidence?) → Sonnet → (low confidence?) → Opus
```
Saves money on easy tasks, ensures quality on hard ones.

### 4. Semantic Routing
Embed the request, compare to a set of labelled examples. Route to the model that handles that type best.

### 5. Confidence-Based Fallback
Send to primary model. Check output confidence/quality. If below threshold, re-send to a better model.

## Building a Router

### Step 1: Classifier
Build a lightweight classifier (Haiku or rule-based) that categorises each request.

### Step 2: Threshold Tuning
Set confidence thresholds per route. Too low = quality drops. Too high = unnecessary cost.

### Step 3: A/B Testing
Run 10% of traffic through alternative routes. Compare quality scores. Adjust routing rules.

## Quality Assurance

- **Pareto frontier:** Plot cost vs quality for each model. Choose models on the frontier (best quality for a given cost).
- **Regression testing:** When changing routes, run a test suite of 100 representative requests. Quality must not drop.
- **Human evaluation:** Sample 5% of routed requests weekly. Score quality. Adjust routes.

---

*This is the condensed version. The full guide (HD-1104, $79) covers the complete model landscape, all 5 routing strategies with implementation code, and Pareto frontier optimisation. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
