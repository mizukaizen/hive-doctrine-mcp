---
title: "COO Authority Scope Template — Cheat Sheet"
hive_doctrine_id: HD-0019
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0019
full_product_price: 49
---

# COO Authority Scope Template — Cheat Sheet

## What It Is

A YAML template for defining an L2 specialist agent's authority scope. Specifically designed for COO-type agents that manage operations but don't own strategy.

## The Template

```yaml
agent_id: coo-agent
authority_level: L2
role: "Operations coordinator — manages execution of approved plans"

can_do:
  - "Schedule and coordinate tasks across agent team"
  - "Monitor task progress and flag blockers"
  - "Generate status reports and summaries"
  - "Assign tasks to L1/L2 agents within approved scope"
  - "Manage file organisation within designated folders"
  - "Send notifications and reminders"

cannot_do:
  - "Approve budget or spending decisions"
  - "Modify agent authority levels"
  - "Delete or archive project folders"
  - "Make strategic decisions (product, pricing, hiring)"
  - "Override another L2 agent's domain decisions"
  - "Access secrets, API keys, or credentials"

escalation:
  trigger: "Budget request, strategic decision, cross-domain conflict"
  to: "human-operator"
  method: "Telegram message with structured summary"
  format: |
    ESCALATION: [category]
    Context: [1-2 sentences]
    Decision needed: [specific question]
    Recommended action: [agent's suggestion]
    Deadline: [when this needs resolution]
```

## L2 vs L2-E for COO Agents

| Scenario | L2 (Standard) | L2-E (Extended) |
|----------|---------------|-----------------|
| Task is within defined scope | Execute | Execute |
| Task is ambiguous but low-risk | Escalate | Attempt, log decision |
| Task requires cross-agent coordination | Escalate | Coordinate directly, report after |
| Task involves money or security | Escalate | Escalate (no override) |

## When to Use L2-E

Upgrade a COO agent to L2-E when:
- It has operated without errors for 30+ days
- Escalation volume is high but decisions are consistently approved
- The operator wants fewer interruptions

**Never use L2-E for:** financial decisions, security operations, or irreversible actions.

## Key Design Rules

1. **`cannot_do` is a hard boundary** — the agent must refuse, not attempt
2. **Escalation format is mandatory** — unstructured escalations waste operator time
3. **Review monthly** — adjust `can_do` based on actual usage patterns
4. **One COO per team** — multiple coordinators create conflicts

---

*This is the condensed version. The full guide (HD-0019, $49) covers the complete L2 specialist template with L2-E comparison, escalation format design, and monthly review procedures. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
