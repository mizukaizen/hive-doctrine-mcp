---
title: "Multi-Agent Debugging Playbook — Cheat Sheet"
hive_doctrine_id: HD-1106
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-1106
full_product_price: 79
---

# Multi-Agent Debugging Playbook — Cheat Sheet

## What It Is

A 3-layer debugging mental model for multi-agent systems. Individual agent, agent-to-agent, and system-level debugging with a 6-step structured process.

## 3-Layer Mental Model

### Layer 1: Individual Agent
- Is the agent receiving the right input?
- Is it producing the expected output?
- Is the system prompt correct and complete?
- Are tools available and working?

### Layer 2: Agent-to-Agent
- Is the message format consistent between agents?
- Is the handoff happening at the right time?
- Is context being lost between agents?
- Are there race conditions?

### Layer 3: System-Level
- Is the orchestrator routing correctly?
- Are there resource conflicts (shared databases, file locks)?
- Is the system degrading under load?
- Are retry storms cascading?

**Rule:** Always debug Layer 1 before Layer 2, Layer 2 before Layer 3. Most bugs are Layer 1.

## 6-Step Structured Process

1. **Reproduce** — Can you trigger the bug reliably? If not, add logging until you can.
2. **Isolate** — Which layer? Test the agent alone (Layer 1), then with its partner (Layer 2), then in the full system (Layer 3).
3. **Trace** — Follow the request from entry to failure. Use correlation IDs.
4. **Hypothesise** — Form max 3 hypotheses. Rank by likelihood.
5. **Verify** — Test each hypothesis with a non-destructive check (not a fix).
6. **Fix** — Fix the confirmed cause. One change at a time. Validate after.

## Top 5 War Stories (Common Bugs)

| Bug | Layer | Symptom | Root Cause |
|-----|-------|---------|------------|
| Silent prompt truncation | 1 | Agent gives wrong answers | System prompt exceeded context window |
| Format mismatch | 2 | Downstream agent fails to parse | Agent A outputs JSON, Agent B expects markdown |
| Stale context | 2 | Agent uses outdated information | Memory not refreshed between handoffs |
| Retry storm | 3 | System overloads and crashes | Failed requests retry exponentially, flood the queue |
| Race condition on shared file | 3 | Corrupted output | Two agents write to same file simultaneously |

## 5 Prevention Strategies

1. **Schema validation** between agents (validate input/output format at every handoff)
2. **Correlation IDs** on every request (trace end-to-end)
3. **Timeout + circuit breaker** on every external call
4. **Idempotent operations** (safe to retry without side effects)
5. **Structured logging** (JSON with agent_id, trace_id, timestamp)

---

*This is the condensed version. The full guide (HD-1106, $79) covers the complete 3-layer debugging model, all 10 war stories, and detailed prevention strategies. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
