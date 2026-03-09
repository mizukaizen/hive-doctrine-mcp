---
title: "Slack/Discord Routing Architecture — Cheat Sheet"
hive_doctrine_id: HD-0023
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0023
full_product_price: 79
---

# Slack/Discord Routing Architecture — Cheat Sheet

## What It Is

A two-plane architecture separating human-facing channels from agent coordination. Humans see clean channels; agents coordinate invisibly behind the scenes.

## Two-Plane Model

| Plane | Visibility | Purpose |
|-------|------------|---------|
| **Human Plane** | Visible to users | Clean channels for human interaction |
| **Agent Coordination Plane** | Hidden from users | Agent-to-agent messaging, task routing, status updates |

## Gateway Agent Role

A single gateway agent sits between the two planes:

1. **Receives** all human messages from the human plane
2. **Classifies** each message (intent, urgency, domain)
3. **Routes** to the appropriate specialist agent in the coordination plane
4. **Returns** the specialist's response to the human plane

The human only ever sees the gateway agent (or sees nothing — responses appear to come from the channel itself).

## Message Classification

| Signal | Route To |
|--------|----------|
| Technical question | Builder agent |
| Research request | Research agent |
| Content/writing | Content agent |
| Strategy/planning | Strategy agent |
| Unclear/ambiguous | Gateway handles directly or asks clarifying question |

## Fallback Chain

If the primary agent can't handle the message:

1. Primary specialist agent
2. Secondary specialist (if defined)
3. Gateway agent (general response)
4. Human escalation (operator notification)

## Capability Registry (YAML)

```yaml
agents:
  - id: marcus
    capabilities: [research, market-analysis, web-search]
    channels: [research, general]
  - id: lila
    capabilities: [writing, content, social-media]
    channels: [content, marketing]
  - id: priya
    capabilities: [data-analysis, reporting, sql]
    channels: [analytics, general]
```

## Notification Policy

| Event | Notify Human? | Channel |
|-------|---------------|---------|
| Task completed | No (unless requested) | Agent plane only |
| Escalation needed | Yes | DM or dedicated alert channel |
| Error/failure | Yes | Alert channel |
| Daily summary | Yes | Briefing channel |

## Deployment Checklist

- [ ] Gateway agent deployed and connected to platform
- [ ] Capability registry populated for all agents
- [ ] Routing rules configured and tested
- [ ] Fallback chain verified end-to-end
- [ ] Human escalation path tested
- [ ] Agent coordination channels created (hidden from users)
- [ ] Notification policy configured

---

*This is the condensed version. The full guide (HD-0023, $79) covers the complete two-plane architecture with gateway agent implementation, message classification logic, and platform-specific deployment guides. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
