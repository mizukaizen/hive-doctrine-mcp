---
title: "Audit-First Diagnostic Prompting — Cheat Sheet"
hive_doctrine_id: HD-0072
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0072
full_product_price: 49
---

# Audit-First Diagnostic Prompting — Cheat Sheet

## What It Is

A 4-phase framework (AFDP) that forces AI to investigate before prescribing fixes. Catches bugs that standard "fix this" prompts miss entirely.

## The Problem It Solves

You tell an AI "fix this bug." It makes assumptions, jumps to remediation, and hallucinates part of the diagnosis. Two of its fixes make things worse. AFDP separates investigation from remediation.

## The 4 Phases

### Phase 1: Context (You Provide)

Present facts only. No hypotheses. No diagnosis.

```
CONTEXT
=======
Symptom: [What the system is doing wrong]
Expected: [What should be happening]
Actual: [What is happening instead]
Supporting data: [logs, configs, files]
```

**Rule:** You don't diagnose. You present facts.

### Phase 2: Audit (AI Investigates)

The AI independently examines all provided data. Key instruction:

> "Audit every file, log, and config I've provided. List every anomaly, inconsistency, and gap you find. Do NOT propose fixes yet."

**Output:** Numbered list of findings with evidence.

### Phase 3: Gap Analysis + ASCII Diagram

The AI maps what it knows vs. what's missing:

> "Draw an ASCII diagram of the system as you understand it. Mark every unknown with a '?' and every confirmed anomaly with a '!'. List gaps where you need more information."

**Why ASCII?** It forces spatial reasoning. The model can't hide vague understanding behind flowing prose. Missing connections become visible.

### Phase 4: Propose, Don't Implement

> "Based on your audit findings, propose fixes ranked by likelihood. Do NOT implement any fix. For each proposal, state what evidence supports it and what could disprove it."

**Key rule:** The AI proposes. You decide. You implement. Never let the AI jump from diagnosis to code changes in one step.

## Why This Works

| Standard Prompt | AFDP |
|----------------|------|
| AI assumes root cause | AI lists all anomalies first |
| Fixes based on narrative coherence | Fixes based on evidence |
| Misses compound failures | ASCII diagram exposes gaps |
| Hallucination hidden in prose | Spatial reasoning exposes hallucination |

## Quick Prompt Template

```
Phase 1: Here is the context. [paste facts]
Phase 2: Audit everything. List anomalies. Do not fix anything.
Phase 3: Draw an ASCII diagram. Mark unknowns with ? and anomalies with !
Phase 4: Propose fixes ranked by likelihood. Do not implement.
```

---

*This is the condensed version. The full guide (HD-0072, $49) covers the complete AFDP framework with real-world debugging examples and prompt templates for each phase. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
