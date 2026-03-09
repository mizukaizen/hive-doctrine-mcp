---
title: "Agent Skill Matrix — Cheat Sheet"
hive_doctrine_id: HD-0020
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0020
full_product_price: 49
---

# Agent Skill Matrix — Cheat Sheet

## What It Is

A capability tracking system for multi-agent teams. Maps what each agent can do, what's in progress, and what's missing.

## Global Skill Table

Track all skills across the team:

| Skill | Owner Agent | Status | Last Verified | Notes |
|-------|-------------|--------|---------------|-------|
| Web search | Marcus | Active | 2026-03-01 | Tavily API |
| Content writing | Lila | Active | 2026-03-01 | Long-form + social |
| Data analysis | Priya | Active | 2026-02-28 | Python + SQL |
| Code review | Builder | Active | 2026-03-05 | Rust, Python, TS |
| Market research | Marcus | Active | 2026-03-01 | X/Twitter + web |
| Image generation | — | Missing | — | No agent assigned |

## Per-Agent Skill Table

Each agent gets its own table:

```markdown
# Marcus — Skills

| Skill | Proficiency | Tools Used | Limitations |
|-------|-------------|------------|-------------|
| Web research | High | Tavily, browse | No Reddit (IP blocked) |
| Market analysis | High | Search + synthesis | No real-time data feeds |
| Report writing | Medium | Markdown output | Needs human review |
```

## Status Categories

| Status | Meaning |
|--------|---------|
| **Active** | Working and verified |
| **Degraded** | Working but unreliable (e.g. API rate limited) |
| **In Progress** | Being developed or tested |
| **Missing** | Needed but no agent has it |
| **Deprecated** | Was active, no longer needed |

## Monthly Audit Checklist

- [ ] Review each agent's skill table for accuracy
- [ ] Test one skill per agent (spot check)
- [ ] Identify missing skills and assign or flag
- [ ] Remove deprecated skills
- [ ] Update "Last Verified" dates
- [ ] Check for skill overlap (redundancy)
- [ ] Update global skill table

## Key Rules

1. **One owner per skill** — if two agents share a skill, designate a primary
2. **Verify, don't assume** — "Last Verified" must reflect actual testing, not deployment date
3. **Missing skills are action items** — every missing skill needs a plan or an explicit "not needed"
4. **Limitations are mandatory** — every skill entry must document what the agent *cannot* do with that skill

---

*This is the condensed version. The full guide (HD-0020, $49) covers the complete skill matrix system with global and per-agent tables, monthly audit procedures, and skill gap analysis. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
