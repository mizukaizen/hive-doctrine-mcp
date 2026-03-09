---
title: "Dynamic Council Thread Routing — Cheat Sheet"
hive_doctrine_id: HD-0022
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0022
full_product_price: 79
---

# Dynamic Council Thread Routing — Cheat Sheet

## What It Is

A 5-part architecture for creating ad-hoc multi-agent collaboration threads. When a problem needs multiple agents, spin up a temporary "council" thread where they collaborate, then dissolve it.

## The 5 Steps

### 1. Create Thread
- Spawn a new communication channel (Discord thread, Slack thread, or internal message queue)
- Name it descriptively: `council-[topic]-[date]`
- Set a TTL (time to live) — councils don't run forever

### 2. Write Registry Entry
- Register the thread in a central registry file:
```yaml
councils:
  - id: council-pricing-2026-03-09
    topic: "Pricing strategy for Q2 launch"
    agents: [Elijah, Priya, Marcus]
    created: 2026-03-09T10:00:00Z
    ttl: 48h
    status: active
```

### 3. Patch Routing Config
- Update the message routing config so relevant messages reach the council
- Add a routing rule: messages tagged with `[topic]` go to the council thread
- Existing routing remains unchanged — council routes are additive

### 4. Post Opening Brief
- First message in the council defines:
  - **Problem statement** (one sentence)
  - **Decision needed** (specific question to answer)
  - **Each agent's role** in this council
  - **Deadline** for reaching a decision

### 5. Invoke and Respond
- Each agent contributes within their expertise
- Orchestrator synthesises and posts a decision summary
- Council thread is archived (not deleted) when complete

## Lifecycle

```
Create → Register → Route → Brief → Collaborate → Decide → Archive
```

## Key Design Rules

1. **Councils are temporary** — TTL enforced, auto-archive after expiry
2. **Max 4 agents per council** — more than 4 creates noise, not insight
3. **One decision per council** — scope creep kills councils
4. **Orchestrator owns the decision** — agents advise, orchestrator decides
5. **Archive, never delete** — council transcripts are valuable for future reference

## When to Use Councils

- Cross-domain decisions (needs expertise from multiple agents)
- Ambiguous problems without a clear owner
- High-stakes decisions that benefit from multiple perspectives

## When NOT to Use Councils

- Routine tasks (just assign to the right agent)
- Urgent issues (councils add latency)
- Single-domain problems (one expert is enough)

---

*This is the condensed version. The full guide (HD-0022, $79) covers the complete 5-part architecture with registry schemas, routing config patches, and real-world council examples. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
