---
title: "COO Agent Authority Scope — Operations Coordinator Permission Template"
author: Melisia Archimedes
collection: C3-authority-model
tier: honey
price: 49
version: 1.0
last_updated: 2026-03-09
audience: agent-builders
hive_doctrine_id: HD-0019
---

# COO Agent Authority Scope

## What This Is

A battle-tested authority scope template for an operations coordinator agent running at **L2 specialist level**. This agent researches, analyses, and *recommends* action—but never executes without human approval. It's the difference between "tell me what we should do" and "go do it". This template shows you exactly which permissions to grant, why each one matters, and how to customise it for your operation.

## The Problem This Solves

Operations agents are high-value targets for harm. Give them too much permission and they'll deploy untested code, send emails they shouldn't, or spend money without oversight. Give them too little and they become paperweights—reading data but unable to capture what they've learned.

The authority scope in this template draws a clear line: **L2 agents can research anything and write to working areas, but cannot touch production, cannot spend money, and cannot speak externally without approval.**

This prevents scope creep. It prevents accidental damage. It keeps your human in the loop where decisions with real consequences happen.

---

## The Template

```yaml
# AUTHORITY — Operations Coordinator Agent
# Level: L2 — Specialist (Operations & Research)

role: |
  Operations coordinator and insight scout. Researches operational opportunities,
  analyses performance data, maintains prioritised backlogs, and drafts strategic
  recommendations for leadership approval.

can_do:
  research:
    - Research business opportunities, market trends, and operational gaps
    - Analyse performance metrics and historical data (read-only)
    - Draft business cases, opportunity assessments, and strategic recommendations
    - Monitor competitive activity and external signals

  writing:
    - Maintain IDEAS-BACKLOG.md with scored and prioritised opportunities
    - Write analysis reports to shared working directories
    - Update performance dashboards and status documents
    - Create decision frameworks and scoring models

  tools:
    - Browser and web research
    - Data analysis and spreadsheet tools
    - Internal documentation systems
    - Performance analytics dashboards (read-only)

cannot_do:
  critical_boundary:
    - "Publish or send externally without explicit approval"
    - "Spend money or make financial commitments"
    - "Modify production systems, code, or configuration"
    - "Deploy products, features, or code to live environments"
    - "Direct or task other agents (route all requests through coordinator)"
    - "Modify or delete historical data"
    - "Change access permissions or security settings"

escalation:
  simple_questions: "Self-resolve if the answer is in documentation"
  cross_functional_needs: "Route to organizational coordinator (L3)"
  money_or_commitments: "Route to decision-maker (L4)"
  urgent_decisions: "Route to decision-maker (L4) with recommendation"
```

---

## Field-by-Field Explanation

### `role`

**What it does:** Describes the agent's purpose in plain language. This is your north star—every permission decision flows from this.

**Why it matters:** When ambiguity arises ("should this agent be able to X?"), the role statement answers it. An operations coordinator researches and recommends, so anything that prevents research or recommendation is wrong. Anything that lets the agent execute is wrong.

**How to customise:** Keep it to 2–3 sentences. Include:
- What problem does this agent solve?
- What's the scope? (e.g. "operations", "data analysis", "market research")
- What's the output? (e.g. "recommendations", "reports", "dashboards")

**Example for different roles:**
- *Security analyst:* "Monitors threat signals, audits access logs, identifies vulnerabilities, and recommends hardening steps."
- *Revenue ops:* "Analyses pricing experiments, customer cohort data, and funnel metrics to recommend go-no-go decisions."
- *Content strategist:* "Researches audience demand, competitive content, and trending topics to draft editorial calendars."

---

### `can_do` Sections

This is permission granted. Organised by category so you can scan quickly.

#### `research`

Everything an L2 agent should be able to investigate. Includes:
- External research (web, APIs, public data)
- Internal data analysis (read-only)
- Competitive intelligence
- Trend analysis

**Why this scope:** Research creates no direct harm. The worst that happens is a bad recommendation—which your L4 can reject. The best case: you get insights you didn't know you were missing.

#### `writing`

What the agent can create and where. Notice: *working directories only*, not public-facing channels.

- **Backlogs, dashboards, working docs:** Yes.
- **Email, Slack, GitHub comments, public docs:** No (requires approval).

This is the critical boundary. Writing to shared working space is fine—that's how the agent communicates with humans. Writing to public channels is publishing, and publishing requires approval.

#### `tools`

The exact integrations and APIs the agent can access. Keep this list minimal and specific. "Browser" is fine. "Can use any API" is not.

---

### `cannot_do` - The Critical Boundary

This is permission *denied*. Read this carefully—these restrictions exist for a reason.

#### `critical_boundary`

The four things that must never happen without approval:

1. **Publish/send externally** — Agent can write to internal docs, but not email customers, post on social media, or comment publicly.
2. **Spend money** — Agent cannot make purchases, set up payments, or authorise commitments.
3. **Modify production systems** — Agent cannot touch live code, configuration, databases, or settings.
4. **Deploy code** — Agent cannot push to production, even if the code is perfect.
5. **Direct other agents** — Agent cannot tell other agents what to do (this prevents runaway command chains).
6. **Modify historical data** — Agent cannot delete, edit, or archive records (audit trail must be clean).
7. **Change security settings** — Agent cannot grant access, create accounts, or modify permissions.

**Why these matter:**

- *Publish/send* = prevents accidental external commitments or reputation damage
- *Spend money* = prevents financial harm (even small purchases add up)
- *Modify production* = prevents outages and data corruption
- *Deploy* = prevents broken releases reaching customers
- *Direct others* = prevents agent cascade failures (agent tells bot to do X, bot tells another agent to do Y, chain breaks)
- *Modify historical data* = keeps audit trail clean and trustworthy
- *Change security* = prevents privilege escalation

---

### `escalation` - The Handoff Points

When should the agent ask for help? Define it explicitly.

- **Simple questions:** Agent answers itself (e.g. "What does this metric mean?" → check docs, respond)
- **Cross-functional needs:** Route to L3 coordinator (e.g. "I need data from the finance team" → coordinator negotiates)
- **Money or commitments:** Route to L4 decision-maker (e.g. "Should we hire a contractor?" → decision-maker approves)
- **Urgent decisions:** Always to L4 with a clear recommendation attached

**How to customise:** Add domain-specific escalation rules. Examples:
- "Any recommendation affecting customer-facing product → Engineering review first"
- "Any market opportunity > $50k → CEO approval required"
- "Any staffing decisions → People ops review"

---

## L2 vs L2-E: When to Use This Template

This template is **L2 — Recommend Only**. There's also **L2-E — Recommend + Execute** (HD-0018). Here's the difference:

| Dimension | L2 (This One) | L2-E |
|-----------|---------------|------|
| **Can research?** | Yes | Yes |
| **Can write to working docs?** | Yes | Yes |
| **Can recommend?** | Yes | Yes |
| **Can execute decisions?** | No | Yes, within limits |
| **Real-world example** | "Tell me which markets are hot" | "Pause underperforming ads, then tell me why" |
| **Best for** | High-stakes decisions, novel work, learning | Repetitive operational tasks, clear policies |
| **Risk level** | Low (human is always in the loop) | Medium (execution without pre-approval) |

**When to use L2 (this template):**
- First time working with an agent type (you haven't run enough experiments yet)
- High-stakes operations (finance, security, customer communication)
- Decisions that affect multiple teams (needs broader input)
- Novel or creative work (you want to review the thinking, not just the output)

**When to use L2-E (HD-0018):**
- You've been using L2 for 2+ months and have solid feedback loops
- Clear policies exist (the agent knows exactly what "good" looks like)
- Execution is reversible (can undo, rollback, or revert)
- Time-sensitive tasks that lose value if delayed for approval (real-time bidding, urgent alerts)

**Upgrade path:** Start with L2 for 4–8 weeks. Collect data on how often recommendations are rejected, what questions come up, how the agent interacts with your team. Once you have patterns, consider upgrading specific capabilities to L2-E.

---

## Customisation Guide

### Step 1: Define Your Role

Adapt the `role` statement to your operation. Ask:
- What problem does this agent solve?
- What's off-limits? (your cannot_do list starts here)
- What tools does it actually need?

### Step 2: Lock Your Boundaries

Go through `cannot_do` line by line. For each one, ask: "In my operation, is this actually forbidden?" Examples:
- Can your operations agent make purchases under $100? (Maybe change the boundary)
- Can it send internal emails but not external? (Refine the publish boundary)
- Can it modify experimental data but not production? (Add specificity)

### Step 3: Define Escalation

Write down the 3–5 people/roles that actually exist in your team:
- Who's your L3? (coordinator, team lead)
- Who's your L4? (decision-maker, founder, director)
- Who else needs a veto? (legal, compliance, security)

Use real job titles or role names.

### Step 4: Test for Ambiguity

Read the authority scope like an agent would. If you find a gap ("what if the agent needs to X?"), add it to either `can_do` or `cannot_do`. Authority scope should be boring—no surprises.

---

## Implementation Checklist

- [ ] I've adapted the role statement to my operation
- [ ] I've reviewed cannot_do and confirmed every boundary is necessary
- [ ] I've mapped escalation routes to real people/roles
- [ ] I've defined which tools the agent can actually access
- [ ] I've shared this with my team for feedback
- [ ] I've created a simple test: "Can the agent [X]?" — can I answer it in 5 seconds by reading this?

---

## What Comes Next

Once you've deployed an L2 agent with this authority scope, monitor:

1. **Escalation patterns:** Which decisions get escalated most? Those are candidates for L2-E upgrade.
2. **Rejection rate:** How often are recommendations rejected? Low rejection (5–10%) suggests good judgment. High rejection (>30%) means recalibrate the scope.
3. **Execution gaps:** What does the agent want to do but can't? Document these—they inform your next iteration.
4. **Team feedback:** Is the agent's output actually useful? Ask your team quarterly.

After 4–8 weeks, revisit this template. Upgrade capabilities that have earned trust. Tighten boundaries that have proven risky. Authority scope is not static—it's a conversation between you and your agents.

---

## Files in This Product

- `coo-authority-scope-template.md` (you are here) — Full guide and customisation walkthrough
- `authority-yaml-schema.md` (optional companion) — Field definitions and YAML structure reference
- `escalation-routing-examples.md` (optional companion) — Real-world escalation workflows

---

## Related Hive Doctrine Products

- **HD-0018** — L2-E (Recommend + Execute) Authority Scope — for time-sensitive operational tasks
- **HD-0001** — Agent Levels Explained — full L1–L4 framework
- **HD-0021** — Role Definition Template — how to write agent role statements
