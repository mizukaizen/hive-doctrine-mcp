---
title: "Agent Tier Vault Access System — File-System Permissions for Multi-Agent Teams"
author: Melisia Archimedes
collection: C3-authority-model
tier: honey
price: 79
version: 1.0
last_updated: 2026-03-09
audience: agent-builders
hive_doctrine_id: HD-0016
---

# Agent Tier Vault Access System

## The Problem

You're running a multi-agent system. Your agents are autonomous, capable, and dangerous — because they can all write to the same shared knowledge vault. Within weeks you're seeing:

- Junior agents filing documents in the wrong folders, breaking your PARA structure
- Sensitive operational configs leaked because there's no clear access policy
- No canonical reference for who is allowed to do what — rules scattered across 11 different agent config files
- Path bugs that fail silently — an agent uses `~/workspace/vault/` instead of the canonical path and the write never happens
- Agents stepping on each other's work, creating orphaned files and version conflicts
- No clear hierarchy for autonomous approval chains

The deeper problem: you have no mental model for "agent trust levels" mapped to vault footprints. You're making it up as you go.

This system fixes all of it.

---

## The Solution: Tiered Vault Access Policy

A four-tier access model where each tier has a defined vault footprint and explicit permissions. Enforced through a canonical shared guide (`OBSIDIAN_GUIDE.md`) that all agents read before any vault write, plus per-agent config files (`AGENTS.md`) that specify individual paths and rules.

### Tier Definitions

| Tier | Role | Trust Level | Vault Footprint |
|------|------|-------------|-----------------|
| **L0** | Human operator | Absolute | Everything — no restrictions |
| **L1** | Orchestrator + Oracle | High | Orchestrator: full read/write. Oracle: read-only, no filing. "You do not file. You speak." |
| **L2** | Domain specialists (Pantheon agents) | Medium | Own workspace + own PARA pillar + shared inbox + shared feed. PROJECTS only on explicit instruction. |
| **L3** | Junior/autonomous agents | Low | Own workspace + shared feed only. No PARA access except via L2 manager instruction. |

### Why These Tiers?

- **L0:** The human operator needs to access everything — debugging, audits, recovery.
- **L1:** Orchestrators and oracles are highly trusted but not autonomous. Orchestrators drive the system; oracles advise only. Oracles don't file because advice shouldn't clutter the vault.
- **L2:** Domain specialists are trusted within their domain. They own a PARA pillar (e.g. "Business Systems" or "Content Strategy") and can write freely there. But they can't touch other agents' pillars or core PROJECTS without approval.
- **L3:** Junior agents and skills are restricted to their own workspace and a shared event feed. They report up to an L2 manager. They never directly modify PARA without manager approval.

---

## The PARA Integration

Your vault uses PARA (Projects, Areas, Resources, Archive). The key design is that **L2 agents own specific PARA locations**.

```
02-AREAS/
  Business/
    systems-infrastructure/      ← Agent Alpha (L2)
    operations-scaling/          ← Agent Bravo (L2)
    finance-partnerships/        ← Agent Charlie (L2)
  Growth/
    goals-vision/                ← Agent Delta (L2)
    health-culture/              ← Agent Echo (L2)
    learning-innovation/         ← Agent Foxtrot (L2)
  Personal/
    home-community/              ← Agent Golf (L2)
    travel-exploration/          ← Agent Hotel (L2)
    wealth-legacy/               ← Agent Indigo (L2)
```

Each L2 agent has a named "Areas Home" pillar that maps to their domain. They can file freely within it. L3 agents have no owned PARA location — they write up to their L2 manager when something needs to be filed.

---

## The Filing Decision System

Agents use a four-step decision tree when not given an explicit location:

1. **Deadline / finite scope → `01-PROJECTS/`**
   - Use for time-bound work with a clear end state
   - Examples: "Launch feature X", "Run Q2 audit", "Build agent Y"

2. **Reference only → `03-RESOURCES/`**
   - Use for templates, guides, research docs you won't modify
   - Examples: "Copy of competitor analysis", "API documentation", "Decision framework"

3. **Ongoing responsibility in own domain → `02-AREAS/[own-pillar]/`**
   - L2 agents only — use for work that's part of your owned area
   - Examples: "Update quarterly goals", "Log weekly health checks", "Document new system"

4. **Unclear → `00-INBOX/`**
   - Safe default, always valid
   - Use when in doubt. INBOX triage happens weekly

**Rule #0:** Agents never write directly to PROJECTS, AREAS, or RESOURCES without explicit instruction. INBOX is always the safe default. A misrouted file causes confusion; an inbox file just needs triage.

**Explicit trigger phrases override the decision tree entirely:**
- "Add this to your areas folder" → write directly to your Areas Home path
- "File this as a resource" → write to 03-RESOURCES/
- "Create a project for this" → create in 01-PROJECTS/ (L2 and above only)

---

## The Manager-Report Link (L2 → L3)

L3 agents don't receive instructions directly from the human operator. The chain is hierarchical:

```
Human → L2 Manager → L3 Agent
```

The L2 manager's `AGENTS.md` defines:
- Reviewing L3 agent weekly reports
- Approving/rejecting product launches before they go live
- Writing standing tasks to L3's `HEARTBEAT.md` (task queue)
- Triaging L3 blocker escalations before they reach the human

The L3 agent's `AGENTS.md` defines:
- "You report to [Manager Name]. The human does not talk to you directly."
- Filing to PARA only on manager's explicit instruction
- Using a specific summoning protocol to reach manager (e.g. `summon-council` or tagged message)
- Escalation path: manager first, then human

This keeps the human out of the loop for routine L3 decisions while maintaining clear accountability.

---

## The Path Safety Rule

All agents follow a hard path rule in both the shared guide and their individual config.

**Only valid prefix:** `/opt/runtime/workspace/vault/...` (or your equivalent canonical path)

**Never use:**
- `~/vault/` — tilde doesn't expand reliably in bash string contexts
- `~/runtime/workspace/vault/` — same problem, different variant
- `/opt/vault/` — non-canonical host path (wrong base)
- Any path starting with `~` — full stop, no exceptions

This rule was born from a live failure: an agent used `~/runtime/workspace/vault/` (tilde before path), which technically evaded the old rule that banned `~/vault/`. The write failed silently. The fix: ban any path beginning with `~`.

Every agent's `AGENTS.md` includes this rule. Every vault write includes a path validation check.

---

## Implementation: Core Components

| Component | What it does | Maintained by |
|-----------|-------------|--------------|
| `OBSIDIAN_GUIDE.md` | Central policy document. All agents read this before any vault write. Contains: folder map, decision tree, Areas Index, PARA filing logic, tier access table, trigger phrases, hard rules. | Human (L0) |
| `[Agent]/AGENTS.md` | Per-agent config. My Areas Home path, personal filing rules, what I can/cannot do, how to escalate. | Human (L0), reviewed by agent |
| `02-AREAS/[group]/[pillar]/` | Agent-owned PARA location. Each L2 agent has one. | L2 agent (unrestricted within pillar) |
| `[Agent]/workspace/` | Agent workspace. Always writable freely, no approval needed. | Agent (L2/L3) |
| `[Agent]/HEARTBEAT.md` | Manager-to-agent task queue. L2 writes tasks; L3 reads at each heartbeat. | L2 manager |
| `06-AGENTS/shared/feed.jsonl` | Shared event feed. All agents (including L3) can append. Used for cross-agent updates, blockers, wins. | All agents (append-only) |

---

## Example: Walking Through a Decision

**Scenario:** Agent Delta (L2, Growth domain) wants to add a new template for quarterly planning.

**Decision process:**
1. Is it deadline-driven? No — it's an ongoing part of my domain.
2. Is it reference only? No — I'll be updating it quarterly.
3. Is it my owned domain? Yes — Goals & Vision.
4. **Action:** Write to `02-AREAS/Growth/goals-vision/templates/quarterly-planning.md`

No approval needed. Agent Delta owns that pillar.

---

**Scenario:** Agent Golf (L3, junior) finds a bug in a shared system and wants to document it.

**Decision process:**
1. Is it deadline-driven? Maybe — needs investigation.
2. Unclear where this lives.
3. I'm L3 — I can't write to PARA without manager approval.
4. **Action:** Write to `00-INBOX/bug-report-system-x.md` and mention it in the shared feed.

At the next heartbeat, agent's L2 manager (Agent Hotel) reads HEARTBEAT.md and triages the bug to the right place.

---

## Why This Is Sellable

Anyone running a multi-agent AI system eventually hits this exact problem:

- "Which agent is allowed to touch which files?"
- "How do I stop agents from stepping on each other?"
- "How do I give a junior agent limited access without manually policing it every session?"
- "How do I scale from 2 agents to 20 without chaos?"

This system answers all four with a replicable, teachable architecture:

- One canonical guide file, read by all agents before any write
- Per-agent config with explicit paths (not inferred from role or guessed)
- Four-tier trust model that maps directly to autonomy level
- PARA integration so agents have clear ownership within domains
- Manager-report chain for L3 agents — keeps the human out of the loop for routine decisions
- Path safety rule prevents silent failures
- Append-only shared feed enables cross-agent communication without permission overhead

Packageable as:
- Vault scaffold (folder structure)
- `OBSIDIAN_GUIDE.md` template (drop-in)
- `AGENTS.md` template with tier-aware rules section
- `feed.jsonl` event schema
- Implementation checklist

---

## What You Get

1. **Clear mental model** — Every agent knows their tier and footprint
2. **Silent failure prevention** — Path rule catches errors at config time
3. **No accidental writes** — Decision tree prevents misrouting
4. **Audit trail** — All writes respect the canonical guide; policy is centralised
5. **Scalability** — Add new agents by copying template, assigning tier, setting their Areas Home path
6. **Human leverage** — L3 manager chain keeps humans out of routine decisions

---

## Implementation Steps

1. Create `OBSIDIAN_GUIDE.md` in your shared agents directory
2. Create `AGENTS.md` for each agent (use template)
3. Set up `02-AREAS/` pillar structure, assign L2 owners
4. Initialise `feed.jsonl` (append-only event log)
5. For L3 agents, create `HEARTBEAT.md` in their workspace
6. Brief all agents on the tier system and path rules
7. Test with a junior agent — ensure they can't write outside their footprint
8. Add path validation to your agent startup script

---

## Status & Maturity

- **Built and live** — Running across 11 agents in production (March 2026)
- **Tested** — Caught 2 path bugs before they broke anything
- **Scaled** — Covers L0 through L3 with clear manager chains
- **Auditable** — Central policy means compliance checks are straightforward

---

**Author:** Melisia Archimedes
**Hive Doctrine ID:** HD-0016
**Last Updated:** 2026-03-09
