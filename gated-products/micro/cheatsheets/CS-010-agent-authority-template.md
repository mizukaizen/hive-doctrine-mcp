---
title: "Agent Authority Template — Cheat Sheet"
hive_doctrine_id: HD-0018
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0018
full_product_price: 49
---

# Agent Authority Template — Cheat Sheet

## What It Is

A YAML template defining exactly what an agent can and cannot do. Prevents scope creep, rogue actions, and ambiguous authority.

## 5 Authority Levels

| Level | Name | Description |
|-------|------|-------------|
| **L1** | Observer | Read-only. Can report, cannot act. |
| **L2** | Executor | Can perform defined tasks within strict boundaries. |
| **L2-E** | Extended Executor | L2 + limited autonomous decisions in defined scenarios. |
| **L3** | Manager | Can delegate to other agents, approve L2 actions. |
| **L4** | Orchestrator | Full system authority. Single agent only. |

## L2 Authority Template (YAML)

```yaml
agent_id: agent-name
authority_level: L2
role: "One-line role description"

can_do:
  - "Specific action 1 with clear scope"
  - "Specific action 2 with clear scope"
  - "Specific action 3 with clear scope"

cannot_do:
  - "Action that requires human approval"
  - "Action outside this agent's domain"
  - "Destructive operations (delete, overwrite)"

escalation:
  trigger: "When [specific condition]"
  to: "manager-agent-id or human"
  method: "message channel or alert system"
```

## L2 vs L2-E Comparison

| | L2 | L2-E |
|---|---|---|
| Execute defined tasks | Yes | Yes |
| Make autonomous decisions | No | Yes, within defined scenarios |
| Handle edge cases | Escalate | Attempt, then escalate if failed |
| Error recovery | Stop and report | Retry once, then escalate |

## Calibration Guide

Choose authority level based on **failure mode cost**:

| If the agent makes a mistake... | Assign |
|--------------------------------|--------|
| Nobody notices | L2-E |
| Minor inconvenience, easily reversed | L2 |
| Significant impact, hard to reverse | L1 |
| Financial loss or security breach | L1 + human approval gate |

## Override Mechanics

- Any higher-level agent can override a lower-level agent's action
- Overrides must be logged with reason
- Human operator can override any agent at any time
- Override log is append-only (no editing history)

## Key Rules

1. **Default to L2** — most agents should be executors with clear boundaries
2. **`cannot_do` is more important than `can_do`** — explicit prohibitions prevent accidents
3. **Escalation must have a target** — never escalate to "someone"
4. **Review quarterly** — authority should evolve as trust is established

---

*This is the condensed version. The full guide (HD-0018, $49) covers both L2 and L2-E templates with calibration examples, override mechanics, and quarterly review procedures. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
