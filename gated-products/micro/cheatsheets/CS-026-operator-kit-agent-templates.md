---
title: "Operator Kit Agent Templates — Cheat Sheet"
hive_doctrine_id: HD-0058
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0058
full_product_price: 79
---

# Operator Kit Agent Templates — Cheat Sheet

## What It Is

Seven specialist agent templates for the Operator Kit development pipeline. Each agent owns one phase of the build process.

## The 7 Agents

### 1. Explorer (Phase 1: Discovery)
- **Role:** Requirements gathering, user story writing
- **Output:** PRD with user stories, acceptance criteria, success metrics
- **Key rule:** Ask questions, don't assume

### 2. Architect (Phase 2: Architecture)
- **Role:** Technical design, ADR writing
- **Output:** Architecture Decision Record, data model, API design
- **Key rule:** Every decision must have a documented rationale

### 3. Gatekeeper (Phase 3: Gate Check)
- **Role:** Binary quality gate assessment
- **Output:** PASS (>=90%) or FAIL (<90%) with scored checklist
- **Key rule:** No partial passes, no exceptions

### 4. Builder (Phase 4: Build)
- **Role:** TDD implementation
- **Output:** Working code with tests
- **Key rule:** Tests first, then implementation, then refactor

### 5. Code Reviewer (Phase 5-6: Review)
- **Role:** Code quality, security, best practices
- **Output:** Review comments with severity (blocker/major/minor)
- **Key rule:** Zero blockers before merge

### 6. Combined Reviewer (Phase 5-6: Full Review)
- **Role:** Code + design + security audit in one pass
- **Output:** Unified review report
- **Key rule:** WCAG 2.1 AA compliance check included

### 7. Deployer (Phase 7: Deploy)
- **Role:** Staging and production deployment
- **Output:** Deployment confirmation with health checks
- **Key rule:** Staging must pass before production

## Agent Config Template (YAML)

```yaml
name: "agent-name"
role: "One-line role description"
phase: 1
triggers:
  - "/command-name"
output_format: "markdown"
rules:
  - "rule-file-1.md"
  - "rule-file-2.md"
skills:
  - "skill-file-1.md"
```

## Agent Interaction Flow

```
Explorer → Architect → Gatekeeper → Builder → Reviewer → Deployer
              ↑              |
              └──── FAIL ────┘
```

If Gatekeeper fails, loop back to Architect. Never proceed to Builder on a fail.

---

*This is the condensed version. The full guide (HD-0058, $79) covers all 7 agent templates with complete YAML configs, output format specifications, and inter-agent communication patterns. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
