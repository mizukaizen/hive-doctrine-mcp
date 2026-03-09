---
title: "Operator Kit v1 — Cheat Sheet"
hive_doctrine_id: HD-0057
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0057
full_product_price: 149
---

# Operator Kit v1 — Cheat Sheet

## What It Is

A complete development pipeline framework for Claude Code. 8 phases, binary quality gates, and a set of agents, skills, rules, and slash commands. Replaces ~$1,100/year in SaaS tooling.

## The 8-Phase Pipeline

| Phase | Name | Output |
|-------|------|--------|
| 1 | **Discover** | User stories, requirements doc |
| 2 | **Architect** | ADR, tech stack, data model |
| 3 | **Gate Check** | Binary pass/fail (90% threshold) |
| 4 | **Build** | Working code (TDD) |
| 5 | **Test & Security** | 80%+ coverage, 0 critical vulns |
| 6 | **Review** | Code review, design audit |
| 7 | **Deploy** | Staging → production |
| 8 | **Launch** | Monitoring, runbook, comms |

## The Binary Gate (Phase 3)

**90% pass or fail. No partial passes.**

Checklist:
- [ ] PRD completeness: >=90% of sections filled
- [ ] Architecture review: >=90% of decisions justified
- [ ] Risk register: all CRITICAL risks mitigated
- [ ] Feasibility: no technology unknowns

**Critical rule:** Never start Phase 4 before Phase 3 passes.

## What's Included

| Component | Count | Purpose |
|-----------|-------|---------|
| Agent templates | 7 | Explorer, Architect, Gatekeeper, Builder, Reviewers, Deployer |
| Skill bundles | 7 | BMAD, Security, Testing, API, Code, Deployment, Design |
| Rule files | 5 | Security, Testing, Conventions, Deployment, Quality |
| Slash commands | 6 | /discover, /architect, /gate-check, /ship, /audit, /brief |

## Installation

```
.claude/
  agents/       ← 7 agent config files
  skills/       ← 7 skill markdown files
  rules/        ← 5 rule files
  commands/     ← 6 slash command configs
```

Drop into any Claude Code project. The pipeline activates through slash commands.

## What It Replaces

| SaaS Tool | Annual Cost | Operator Kit Equivalent |
|-----------|-------------|------------------------|
| Linear/Jira | $120 | /discover + TASKS.md |
| SonarQube | $150 | /audit + security rules |
| Snyk | $300 | Security skill bundle |
| Codecov | $240 | Testing skill (80% coverage gate) |
| Notion (project docs) | $96 | Markdown files in repo |
| **Total replaced** | **~$1,100/yr** | **One-time $149** |

---

*This is the condensed version. The full guide (HD-0057, $149) covers the complete 8-phase pipeline, all agent/skill/rule/command files, installation guide, and detailed SaaS replacement analysis. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
