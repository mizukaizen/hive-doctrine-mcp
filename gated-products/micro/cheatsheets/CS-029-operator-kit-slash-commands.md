---
title: "Operator Kit Slash Commands — Cheat Sheet"
hive_doctrine_id: HD-0061
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0061
full_product_price: 29
---

# Operator Kit Slash Commands — Cheat Sheet

## What It Is

Six pipeline commands that drive the Operator Kit development workflow. Each command triggers a specific phase of the 8-phase pipeline.

## The 6 Commands

### `/discover`
- **Phase:** 1 (Discovery)
- **Agent:** Explorer
- **Action:** Gather requirements, write user stories
- **Output:** PRD with user stories, acceptance criteria, success metrics
- **Usage:** `/discover [product idea or brief]`

### `/architect`
- **Phase:** 2 (Architecture)
- **Agent:** Architect
- **Action:** Design technical architecture, write ADR
- **Output:** Architecture Decision Record, data model, API endpoints
- **Usage:** `/architect` (reads PRD from Phase 1)

### `/gate-check`
- **Phase:** 3 (Quality Gate)
- **Agent:** Gatekeeper
- **Action:** Score PRD + ADR against quality checklist
- **Output:** PASS (>=90%) or FAIL (<90%) with detailed scores
- **Usage:** `/gate-check` (reads PRD + ADR)

### `/ship`
- **Phase:** 4-7 (Build + Deploy)
- **Agent:** Builder → Reviewer → Deployer
- **Action:** TDD implementation, code review, deployment
- **Output:** Working, tested, deployed code
- **Usage:** `/ship` (only after gate-check passes)

### `/audit`
- **Phase:** Any (On-demand)
- **Agent:** Security Auditor
- **Action:** Security scan, dependency audit, secrets check
- **Output:** Security audit report (RED/AMBER/GREEN)
- **Usage:** `/audit [scope]`

### `/brief`
- **Phase:** Any (On-demand)
- **Agent:** None (system command)
- **Action:** Generate status briefing
- **Output:** Current state of project, blockers, next steps
- **Usage:** `/brief`

## Pipeline Flow

```
/discover → /architect → /gate-check → /ship
                              |
                         FAIL → loop back to /architect
                         PASS → proceed to /ship
```

## Key Rules

1. **Commands must run in order** — `/ship` before `/gate-check` is forbidden
2. **`/gate-check` is the gatekeeper** — no exceptions, no overrides
3. **`/audit` and `/brief` can run anytime** — they're independent of the pipeline
4. **Each command reads the output of the previous command** — no manual handoff needed

---

*This is the condensed version. The full guide (HD-0061, $29) covers all 6 slash commands with complete configuration files, agent routing, and pipeline flow diagrams. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
