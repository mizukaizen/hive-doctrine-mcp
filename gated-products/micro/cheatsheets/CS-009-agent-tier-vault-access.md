---
title: "Agent Tier Vault Access — Cheat Sheet"
hive_doctrine_id: HD-0016
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0016
full_product_price: 79
---

# Agent Tier Vault Access — Cheat Sheet

## What It Is

A 4-tier access model controlling which agents can read/write to which parts of a structured knowledge vault (e.g. an Obsidian vault using PARA methodology).

## The Four Tiers

| Tier | Access | Who | Example |
|------|--------|-----|---------|
| **L0** | Read-only, own workspace | Junior agents, new deployments | Can read their own agent folder only |
| **L1** | Read all, write own workspace | Standard agents | Can read the full vault, write to their assigned folder |
| **L2** | Read all, write to designated areas | Senior agents, specialists | Can write to project folders they're assigned to |
| **L3** | Full read/write | Orchestrator agent only | Can modify any file in the vault |

## PARA Integration

Map tiers to PARA folders:

| PARA Folder | L0 | L1 | L2 | L3 |
|-------------|----|----|----|----|
| Projects | - | Read | Read/Write (assigned) | Read/Write |
| Areas | - | Read | Read | Read/Write |
| Resources | - | Read | Read | Read/Write |
| Archive | - | - | Read | Read/Write |

## Filing Decision System

When an agent creates a file, it must decide where to put it:

1. **Is it tied to a specific project?** → Projects folder
2. **Is it an ongoing responsibility?** → Areas folder
3. **Is it reference material?** → Resources folder
4. **Is it no longer active?** → Archive folder
5. **Not sure?** → Agent's own workspace (safe default)

## Manager-Report Link

Each L2 agent has a designated L3 manager. The manager:
- Reviews files the agent wants to write outside its workspace
- Approves tier escalation requests
- Audits the agent's file operations monthly

## Path Safety Rule

**Agents must never write outside the vault root.** Enforce with:
- Path validation (reject `../` traversal)
- Allowlist of writable directories per tier
- Log all write operations for audit

## Key Rules

1. **Default to L0** — new agents start with minimal access
2. **Escalate with evidence** — agents earn higher tiers through demonstrated reliability
3. **L3 is singular** — only one orchestrator agent gets full access
4. **Audit monthly** — review what each agent has written and whether tier is appropriate

---

*This is the condensed version. The full guide (HD-0016, $79) covers the complete 4-tier model with PARA integration, filing decision trees, manager-report linking, and audit procedures. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
