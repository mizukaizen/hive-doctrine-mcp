---
title: "Cost Optimisation for Agent Operations — Cheat Sheet"
hive_doctrine_id: HD-1103
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-1103
full_product_price: 99
---

# Cost Optimisation for Agent Operations — Cheat Sheet

## What It Is

A cost formula with multipliers and 6 key levers to cut AI agent operating costs by 50-90%.

## The Cost Formula

```
Total Cost = Base LLM Cost × Retry Multiplier × Context Multiplier × Tool Overhead
```

Each multiplier inflates cost. Reduce any multiplier to cut total cost.

## 6 Key Levers

### 1. Prompt Caching (Up to 90% Savings)
- Cache the system prompt and static context
- Only send dynamic content as new tokens
- Anthropic's prompt caching: 90% cost reduction on cached prefixes
- **Rule:** If 80%+ of your prompt is the same every call, you must cache it

### 2. Model Routing (3-Tier)

| Tier | Model | Use For | Cost |
|------|-------|---------|------|
| Fast | Haiku 3.5 | Classification, simple extraction | $0.25/$1.25 per MTok |
| Standard | Sonnet 3.5 | Most tasks, coding, analysis | $3/$15 per MTok |
| Premium | Opus | Complex reasoning, critical decisions | $15/$75 per MTok |

**Rule:** Route 70% of requests to Haiku, 25% to Sonnet, 5% to Opus.

### 3. Context Window Compression
- Summarise old conversation turns instead of keeping full history
- Drop tool call results after they've been processed
- Keep context under 4K tokens when possible (even if window allows 200K)
- **Savings:** 3-5x reduction in input token costs

### 4. Batch Processing (50% Discount)
- Anthropic Batch API: 50% cost reduction, results within 24 hours
- Use for: non-urgent analysis, report generation, bulk classification
- **Rule:** Anything that doesn't need real-time response should be batched

### 5. Caching Layers

| Layer | What to Cache | TTL |
|-------|---------------|-----|
| Semantic | Similar queries → same response | 1 hour |
| Tool results | API call results | 5-30 min |
| Embeddings | Vector representations | 24 hours |

### 6. Monitoring & Budget Controls
- Set daily spend limits per agent
- Alert at 80% of daily budget
- Hard cutoff at 100% (agent stops until next day)
- Review top 10 most expensive requests weekly

## Quick Wins (Do These First)

1. Enable prompt caching (10 minutes to implement, 90% savings on cached portion)
2. Route classification tasks to Haiku (5 minutes, 10-20x cheaper)
3. Set daily budget alerts (prevents runaway costs)

---

*This is the condensed version. The full guide (HD-1103, $99) covers the complete cost formula, all 6 levers in detail, model routing implementation, and budget control architecture. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
