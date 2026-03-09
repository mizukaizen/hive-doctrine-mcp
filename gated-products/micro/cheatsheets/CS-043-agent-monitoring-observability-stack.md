---
title: "Agent Monitoring & Observability Stack — Cheat Sheet"
hive_doctrine_id: HD-1102
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-1102
full_product_price: 79
---

# Agent Monitoring & Observability Stack — Cheat Sheet

## What It Is

4-pillar observability for AI agent systems. Tracing, metrics, logging, and continuous evaluation.

## The 4 Pillars

### 1. Tracing (Spans + Correlation IDs)
- Every agent request gets a unique trace ID
- Each step (LLM call, tool use, retrieval) is a span within the trace
- Correlation IDs link related requests across agents
- **Visualise:** waterfall view showing where time is spent

### 2. Metrics (What to Track)

| Metric | Why | Alert Threshold |
|--------|-----|-----------------|
| Token usage (per request) | Cost control | >2x average |
| Latency (p50, p95, p99) | Performance | p95 > 5s |
| Cost per request | Budget | >$0.50/request |
| Error rate | Reliability | >5% |
| Tool call success rate | Integration health | <90% |

### 3. Structured Logging (JSON)
```json
{
  "timestamp": "2026-03-09T10:00:00Z",
  "level": "info",
  "trace_id": "abc-123",
  "agent_id": "marcus",
  "event": "tool_call",
  "tool": "web_search",
  "duration_ms": 450,
  "status": "success"
}
```
**Rule:** Never `console.log`. Always structured JSON with trace_id.

### 4. Continuous Evaluation
- Score agent outputs on a regular cadence (daily/weekly)
- Metrics: accuracy, relevance, helpfulness, safety
- Compare scores over time to detect regression

## Stack Options

| Tool | Best For | Cost |
|------|----------|------|
| **Langfuse** | Open source, self-hosted | Free (self-hosted) |
| **LangSmith** | LangChain ecosystem | $39+/mo |
| **Helicone** | Simple proxy-based logging | Free tier available |
| **OpenTelemetry** | Custom, vendor-neutral | Free (DIY) |

## 3 Dashboards

### Overview Dashboard
- Total requests, error rate, avg latency, active agents

### Cost Dashboard
- Cost by agent, cost by model, cost trend (daily/weekly), budget burn rate

### Debug Dashboard
- Recent errors with full traces, slow requests, failed tool calls

## Alerting Strategy

| Severity | Condition | Action |
|----------|-----------|--------|
| **Critical** | Error rate >10% for 5 min | Page on-call |
| **Warning** | Cost >2x daily average | Slack notification |
| **Info** | New agent deployed | Log only |

---

*This is the condensed version. The full guide (HD-1102, $79) covers the complete 4-pillar observability stack with dashboard designs, alerting runbooks, and tool comparison. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
