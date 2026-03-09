---
title: "Agent Compliance Audit Framework — Cheat Sheet"
hive_doctrine_id: HD-1105
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-1105
full_product_price: 79
---

# Agent Compliance Audit Framework — Cheat Sheet

## What It Is

EU AI Act compliance framework for AI agent systems. Risk classification, audit trail architecture, documentation requirements, and human oversight patterns.

## Risk Classification Decision Tree

| Risk Level | Criteria | Requirements |
|-----------|---------|--------------|
| **Unacceptable** | Social scoring, real-time biometric ID | Banned |
| **High** | Critical infrastructure, HR decisions, legal, medical | Full compliance (audit trail, human oversight, documentation) |
| **Limited** | Chatbots, content generation | Transparency obligations (disclose AI use) |
| **Minimal** | Spam filters, game AI | No requirements |

**Most agent systems fall under Limited or High risk.**

## Audit Trail Architecture

Every agent action must be logged:

```json
{
  "timestamp": "2026-03-09T10:00:00Z",
  "agent_id": "marcus",
  "action": "generate_report",
  "input_hash": "sha256:abc...",
  "output_hash": "sha256:def...",
  "model": "claude-sonnet-3.5",
  "human_oversight": "on-loop",
  "decision_rationale": "User requested market analysis"
}
```

**Storage:** Append-only PostgreSQL table. No deletes. No updates. Retention: minimum 5 years for high-risk.

## Documentation Requirements (High-Risk)

- [ ] System purpose and intended use
- [ ] Training data description and provenance
- [ ] Performance metrics and limitations
- [ ] Risk assessment and mitigation measures
- [ ] Human oversight mechanisms
- [ ] Incident response procedures

## 3 Human Oversight Patterns

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| **In-the-Loop** | Human approves every action before execution | High-risk decisions (medical, legal, financial) |
| **On-the-Loop** | Human monitors and can intervene at any time | Medium-risk operations |
| **In-Command** | Human sets boundaries; agent operates within them | Low-risk, high-volume tasks |

## 5-Phase Enterprise Roadmap

| Phase | Timeline | Focus |
|-------|----------|-------|
| 1 | Weeks 1-2 | Risk classification of all AI systems |
| 2 | Weeks 3-4 | Audit trail implementation |
| 3 | Weeks 5-6 | Documentation and transparency |
| 4 | Weeks 7-8 | Human oversight mechanisms |
| 5 | Ongoing | Monitoring, auditing, updating |

---

*This is the condensed version. The full guide (HD-1105, $79) covers the complete EU AI Act compliance framework with risk classification decision trees, audit trail schemas, and the full enterprise roadmap. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
