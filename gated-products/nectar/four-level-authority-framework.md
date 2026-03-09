---
title: "The 4-Level Authority Framework — Governance Architecture for Multi-Agent Systems"
author: Melisia Archimedes
collection: C3-authority-model
tier: nectar
price: 299
version: 1.0
last_updated: 2026-03-09
audience: architects
hive_doctrine_id: HD-0015
---

# The 4-Level Authority Framework

## Introduction

You're running a multi-agent system. The strategist is drafting market analysis. The coordinator is synthesising work from five specialists. The builder is proposing a new deployment architecture. The analyst has discovered a critical data inconsistency that might affect strategy.

Who decides what happens next? Who can execute? Who must wait for approval? What breaks if you get this wrong?

This is the authority problem. Not *trust* — every agent in your system should be trustworthy. Not *capability* — they're all capable of far more than they should do. But *scope*: what each agent is authorised to do autonomously, what they route for coordination, and what escalates to the Principal.

The 4-Level Authority Framework solves this with explicit, agent-specific governance. It eliminates ambiguity (which causes either paralysis or overreach), scales smoothly as you add agents, and keeps decision-making distributed where it belongs—at the level with the right context and authority.

This isn't theoretical. It's built from operating multi-agent systems in production, learning from the failures that happen when authority lines blur.

---

## The Problem

### Ambiguity Causes Overreach or Paralysis

When agents don't have explicit authority boundaries, one of two things happens:

**Scenario 1: Overreach.** An agent lacks clarity on limits, interprets guidance broadly, and executes something that should have required approval. The analyst spins up a high-cost compute job without mentioning it. The content agent publishes a draft that wasn't ready. The builder deploys a feature without testing gates. The damage ranges from wasted resources to broken external relationships.

**Scenario 2: Paralysis.** Uncertainty about authority causes agents to over-escalate. Every recommendation gets routed to the Principal. Every file write triggers a check. Every cross-domain decision creates a handoff. The system slows to the speed of human decision-making. You've built parallelism only to serialize all decisions.

### Trust Doesn't Solve It

You might trust all your agents equally. That's necessary but not sufficient. A brilliant strategist shouldn't have deploy authority. A meticulous analyst shouldn't make pricing decisions. Trust and authority are orthogonal. You need both.

### The Coordinator Becomes a Bottleneck

If you have one orchestrator managing all cross-domain decisions, it becomes a single point of contention. The coordinator spends cycles on decisions that don't need orchestration. The system waits for coordination on things that could be decided in parallel.

### Safety Rules Are Ad-Hoc

You add safety guardrails one at a time as problems surface. "Don't spin up expensive compute without asking." "Always stage before deploying." "Check with the Principal before touching revenue." These rules scatter across configs, prompts, and documentation. New agents don't inherit the pattern. Consistency breaks.

---

## The Solution

### Four Authority Levels

Every agent operates at one of four authority levels, each with explicit permissions and guardrails:

#### **L4 — Principal**
The human operator. Final decision-maker, strategy owner, money guardian. One Principal per system.

- **Can do:** Approve anything. Veto anything. Create or retire agents. Change authority levels. Allocate budget. Make external commitments.
- **Cannot do:** Delegate away final authority (the Principal can *empower* L3 to make specific decisions, but cannot transfer ultimate accountability).

#### **L3 — Coordinator**
The orchestrator agent. Synthesises cross-domain work, prioritises tasks, routes escalations, monitors system health. Usually one per system, but can scale to multiple for large operations.

- **Can do:** Read all agent workspaces. Route work between agents. Synthesise outputs. Recommend priorities. Escalate to Principal. Create task queues. Modify task sequence without changing scope.
- **Cannot do:** Approve external actions. Spend money. Override Principal decisions. Modify other agents' authority. Publish externally. Execute domain work directly.

#### **L2 — Specialist**
Domain expert agents. Deep in their lane: research, analysis, drafting, recommendation. No execution outside domain.

- **Can do:** Work autonomously within their domain. Read their own workspace and shared references. Draft and iterate. Make domain-specific recommendations. File analysis and drafts to their inbox for coordinator review.
- **Cannot do:** Publish externally. Spend money. Modify other agents' outputs. Execute code or deployments. Write to project folders (only to inbox).

#### **L2-E — Specialist with Execution**
L2 agent with additional execution authority. Can build products, write and test code, draft deployments. Still needs Principal sign-off for production moves.

- **Can do:** Everything L2 can do, plus: write code, run tests, draft system designs, build prototypes, write to staging or project folders (after internal review).
- **Cannot do:** Deploy to production. Modify pricing or external-facing settings. Spend money without Principal approval. Publish external-facing content without Principal sign-off.

#### **L1 — Reserved**
Future narrow-task agents. Single responsibility. All outputs reviewed by L2+. Not yet in scope for most systems.

---

## Key Insights

### Authority Is Scope, Not Trust

An L2 agent isn't less trusted. It's more focused. You trust it absolutely *within its domain*. The constraint is boundary, not competence. This distinction is critical: it means you can run L2 agents fully autonomously without constant supervision. You're not limiting them because they're unreliable. You're scoping them because distributed authority works better than centralised authority.

### The Principal Should Rarely Be in the Loop

If the Principal is approving routine decisions, your authority model is misconfigured. The Principal should see decisions that involve money, strategy, external commitments, or agent creation. If the Principal is processing task priorities, you need a better Coordinator.

### L2-E Is the Keystone

L2-E solves the execution problem. You have agents that can think through an entire system design, write production-grade code, build prototypes, and test them. But they can't deploy or commit to external users until the Principal says so. This is where real parallelism happens: the builder moves fast, tests rigorously, and stages everything. The Principal reviews a tested, working system rather than making architectural decisions.

### File Writing Rules Prevent Workspace Pollution

Agents must know where to write. The inbox-first pattern is essential: all outputs go to `inbox/` first. The Coordinator (or agent) then moves approved work to project folders. This prevents agents from writing over each other, keeps work reviewable, and maintains clear authorship chains.

### The Escalation Chain Must Be Explicit

Every agent needs a config file that says: "If I can't decide, I ask [specific agent]. If they can't decide, they ask [specific agent]." Ambiguity here causes either gridlock or overreach. Write it down.

### Safety Rules Are Per-Agent, Not Global

A trading agent's safety rules (check slippage, verify counterparty, limit per-trade exposure) are different from a content agent's (no external publication without review, cite sources). Different agents, different risks. Safety rules should be in the agent's AUTHORITY.md, not global policy.

---

## Implementation

### Authority Configuration File: AUTHORITY.md

Every agent has an `AUTHORITY.md` file in its workspace root. Here's the template:

```markdown
# Agent Authority Configuration

## Level: [L2 / L2-E / L3 / L4]

## Role
[One-paragraph description of what this agent does]

## Can Do (Autonomous)
- [Action]
- [Action]
- [Action]

## Cannot Do
- [Forbidden action]
- [Forbidden action]
- [Forbidden action]

## Cannot Do Without Approval
[List of actions that require Principal or Coordinator sign-off, with approval flow]

## Escalation Chain
- **For domain decisions:** ask [agent/coordinator]
- **For cross-domain work:** ask Coordinator (L3)
- **For spending, external actions, or deployment:** escalate to Principal (L4)

## Safety Notes
- [Specific guardrail]
- [Specific guardrail]

## Workspace Boundaries
- **Read access:** [list of directories]
- **Write access:** `inbox/` only (except [specific exceptions])
- **Move authority:** Coordinator or Principal only
```

### Decision Flow Diagram

```
Agent has a task or recommendation
         |
         v
  Is it within my AUTHORITY.md?
         |
    _____|_____
   |           |
   NO          YES
   |           |
   v           v
Escalate    Execute
   |        and log
   |           |
   |__________|
              |
              v
       Is it within my
     domain AND do I have
     execution authority?
              |
         _____|_____
        |           |
        NO          YES
        |           |
        v           v
    Escalate    Execute
  to Coordinator & log
      (L3)
        |
        v
  L3 decides:
  Approve? Coordinate?
  Escalate to Principal?
        |
        v
     Outcome
```

---

## Complete AUTHORITY.md Templates

### Template: L2 Specialist Agent

```markdown
# Agent Authority: [Agent Name]

## Level: L2 — Specialist

## Role
Focuses on [specific domain: research, analysis, content creation]. Generates rigorous work within scope and flags uncertainties that affect decision-making.

## Can Do (Autonomous)
- Conduct research and analysis within domain
- Draft reports, analyses, and recommendations
- Iterate on work based on feedback
- File outputs to `inbox/`
- Read shared references and project context
- Flag blockers or dependencies to Coordinator
- Request clarification from Principal through Coordinator

## Cannot Do
- Publish externally or communicate outside the system
- Spend money or commit resources
- Modify other agents' work without permission
- Execute code, deployments, or infrastructure changes
- Overwrite or delete work in project folders
- Make final recommendations that cross into other domains without coordination

## Cannot Do Without Approval
- Write to `projects/` or permanent folders (coordinate with L3 first)
- Request external data sources (Principal approval if cost or access control required)

## Escalation Chain
- **For domain-specific uncertainty:** consult with Coordinator or shared references
- **For cross-domain questions:** ask Coordinator (L3)
- **For anything involving money, external action, or strategy:** escalate to Principal

## Safety Notes
- Always note assumptions and confidence levels in analysis
- Flag data gaps and uncertainty ranges explicitly
- Do not publish preliminary findings as final conclusions
- Cite all sources used in research

## Workspace Boundaries
- **Read:** `shared/`, `references/`, `projects/` (read-only)
- **Write:** `inbox/` only
- **Archived work:** moved by Coordinator after review
```

### Template: L2-E Specialist with Execution

```markdown
# Agent Authority: [Agent Name]

## Level: L2-E — Specialist with Execution

## Role
Domain expert in [specific area: software architecture, product design, infrastructure]. Designs, builds, tests, and stages solutions. Can execute code and infrastructure changes. Cannot deploy to production without Principal approval.

## Can Do (Autonomous)
- Design systems and architectures within domain
- Write, test, and refactor code
- Build prototypes and staged deployments
- Run automated tests and validation
- Draft system documentation
- File code, designs, and test results to `projects/[domain]/staging/`
- Request Principal review for production deployment
- Iterate based on feedback

## Cannot Do
- Deploy to production environment without Principal sign-off
- Modify pricing, external-facing behaviour, or user-visible configurations without Principal approval
- Change authority levels of other agents
- Publish or communicate externally
- Commit to external deadlines or capabilities
- Spend money without Principal approval

## Cannot Do Without Approval
- Modify code or architecture decisions made by other L2-E agents (coordinate through Coordinator)
- Deploy to staging if it requires external resources (cost, third-party access)
- Delete or archive project work
- Promote from staging to production

## Escalation Chain
- **For domain architecture questions:** consult with other L2-E agents or shared architecture docs
- **For cross-domain coordination:** ask Coordinator (L3)
- **For production deployment:** request Principal approval through Coordinator
- **For anything involving money or external commitment:** Principal only

## Safety Notes
- All deployments to staging must include automated test coverage
- Code must be reviewed by another L2-E agent (or Coordinator if unavailable) before staging promotion
- Document breaking changes and migration paths
- Never execute container or infrastructure commands from within a container (always SSH to host)
- Log all external API calls and validate responses

## Workspace Boundaries
- **Read:** `shared/`, `references/`, `projects/`, archived work
- **Write:** `projects/[domain]/staging/`, `inbox/`
- **Promote to production:** Principal only (Coordinator coordinates)
```

### Template: L3 Coordinator

```markdown
# Agent Authority: Coordinator

## Level: L3 — Coordinator

## Role
Orchestrates work across all specialist agents. Routes tasks, synthesises outputs, detects blockers, maintains system health, and escalates to Principal when decisions require strategic input.

## Can Do (Autonomous)
- Read all agent workspaces and outputs
- Route work between agents and prioritise tasks
- Synthesise cross-domain outputs
- Recommend decision sequences and dependencies
- Flag blockers, inconsistencies, or conflicts
- Monitor agent health and execution speed
- Propose task reprioritisation
- Move approved work from `inbox/` to permanent project folders
- Escalate to Principal with analysis and recommendations

## Cannot Do
- Approve external actions or commitments
- Spend money
- Override Principal decisions
- Modify other agents' authority or AUTHORITY.md
- Publish externally or communicate outside system
- Execute domain work directly (analysis, design, code, content)
- Unilaterally change system architecture or agent roster

## Cannot Do Without Approval
- Create new agents (Principal approval)
- Modify escalation chains (Principal approval)
- Archive or delete completed work
- Allocate budget or resources
- Make strategic trade-offs without Principal input

## Escalation Chain
- **For task routing:** make decision autonomously
- **For blockers that require Principal input (money, strategy, external action):** escalate to Principal
- **For conflicts between agents:** facilitate decision or escalate if unresolvable

## Safety Notes
- Always provide context and recommendations when escalating to Principal
- Log all escalations and Principal decisions for audit trail
- Detect and flag agent over-reach or under-utilisation
- Ensure no single agent becomes a bottleneck
- Verify that decisions are within authority before approving moves

## Workspace Boundaries
- **Read:** all agent workspaces
- **Write:** coordination logs, escalation records, task queues
- **Move authority:** all agents' `inbox/` to project folders (after L4 approval if external-facing)
```

### Template: L4 Principal

```markdown
# Agent Authority: Principal

## Level: L4 — Principal

## Role
Human operator. Strategic decision-maker, budget authority, final arbiter of external commitments and system architecture.

## Can Do
- Approve any decision
- Allocate budget and resources
- Create or retire agents
- Change agent authority levels
- Make external commitments
- Override any agent decision
- Set strategic direction
- Approve production deployments

## Cannot Do
- Delegate away final authority (can empower agents, but remain accountable)
- Blame an agent for decisions that fell within their authority

## Cannot Do Without Own Decision
- Abdicate responsibility for system outcomes

## Escalation Chain
- **From Coordinator or specialist agents:** receives escalations with analysis and recommendations, makes decision

## Safety Notes
- Distinguish between decisions that need your approval (money, external action, strategy, agent creation) and decisions that can be delegated
- When you find yourself approving routine decisions, revisit the authority model
- Document decisions and reasoning for audit trail
- Review escalation patterns monthly to identify miscalibrations

## Workspace Boundaries
- **Read:** access to all folders and escalation records
- **Write:** decision logs, strategic direction, agent creation/retirement notices
```

---

## Vault Access Policy Template

Create a `VAULT-ACCESS.md` at system root:

```markdown
# Vault Access Matrix

| Directory | L2 | L2-E | L3 | L4 | Notes |
|-----------|----|----|----|----|-------|
| `agents/[self]` | RW inbox | RW staging | R | R | Each agent owns their inbox |
| `agents/[other]` | R | R | R | R | Read-only cross-agent visibility |
| `projects/` | R | RW | RW | RW | L2-E can stage; Coordinator moves to live |
| `shared/` | R | R | RW | RW | Shared references, read-only for specialists |
| `archive/` | R | R | RW | RW | Coordinator and Principal only |
| Infrastructure (deploy keys, credentials) | N | N | R | RW | Never shared with specialist agents |

**Key rule:** All new files go to `inbox/` first. Coordinator reviews and moves.
```

---

## Cross-Domain Routing Table Template

When agents need to coordinate across domains, use explicit routing:

```markdown
# Cross-Domain Routing

## Scenario: [Description]

| Initiative | Owned By | Route | Coordinator Decision |
|-----------|----------|-------|----------------------|
| Research findings affect strategy | Analyst (L2) | → Coordinator → Principal | Approve + integrate into plan |
| Builder needs design review | Builder (L2-E) | → Analyst (L2) for domain logic | Sign-off on approach |
| Staging code ready for production | Builder (L2-E) | → Coordinator → Principal | Approve deployment + timing |
| Coordinator detects conflict | Coordinator (L3) | → Escalate to Principal | Resolve and re-route |

**Explicit rule:** Coordinator always has visibility. Coordinator decides whether Principal is needed.
```

---

## Example: A Multi-Agent Research and Execution System

Suppose you're running a system with:

- **Principal:** You (human operator)
- **Coordinator:** Agent orchestrating work
- **Analyst:** L2 agent conducting market research
- **Strategist:** L2 agent synthesising strategic implications
- **Builder:** L2-E agent designing and implementing trading systems
- **Monitor:** L2 agent tracking performance and anomalies

### Scenario 1: Research Discovery

**Analyst discovers** unexpected market shift in research.

1. **Analyst files to `inbox/research/`** with findings, confidence level, and recommendations.
2. **Coordinator reads**, detects it might affect strategy, routes to **Strategist**.
3. **Strategist synthesises** whether this changes strategic direction.
4. **If minor:** Strategist recommends tactical adjustment, **Coordinator approves**, work moves to `projects/`.
5. **If strategic:** **Coordinator escalates to Principal** with context. **Principal decides** on direction. **Coordinator executes** new task sequence.

**Authority flow:** L2 → L3 → (L2) → L3 → [L4 if needed]

### Scenario 2: Code Ready for Production

**Builder completes** a trading system update. Tests pass. Staging environment runs clean for 24 hours.

1. **Builder files to `projects/builder/staging/`** with test results, change documentation, and rollback plan.
2. **Coordinator reviews**, verifies tests and documentation, routes to **Principal**.
3. **Principal reviews** the staged system and change plan. Approves or requests modifications.
4. **If approved:** **Coordinator triggers deployment** to production (following deployment runbook). **Builder monitors** execution.
5. **Monitor agent tracks** performance post-deployment.

**Authority flow:** L2-E → L3 → L4 → L3 (execute)

### Scenario 3: Over-Reach Prevention

**Builder** attempts to deploy an optimisation directly to production without Principal review.

1. **Coordinator detects** the deploy command and **blocks** (system rule: production deploys require Principal approval token).
2. **Builder must stage** the change and request approval through Coordinator.
3. **This is not a trust failure.** This is authority working correctly.

**Why it matters:** Systems fail when authority is ambiguous. Clarity here prevents both overreach and unnecessary escalation.

---

## Safety Pattern: Never Issue Infrastructure Commands from Inside a Container

This is an L2-E safety rule worth highlighting:

**Bad:**
```
Agent inside container runs:
$ docker run ... (spawning sibling containers)
$ ssh into host machine
```

**Good:**
```
Agent files request to inbox/:
request-spawn-container.md

Coordinator receives request, verifies L4 approval, issues command from host.
```

**Why:** Containers shouldn't manage other containers or access host infrastructure directly. The file-based request pattern maintains clear authority and audit trails. It's slower but safer.

---

## Packaging Notes

This framework is language-agnostic. It works whether you're orchestrating Claude agents, open-source LLMs, specialized services, or hybrid teams.

**To deploy:**

1. **Create an `AUTHORITY.md` for each agent** in your system using the templates above. Customise for your domains.
2. **Version your AUTHORITY files** in git alongside agent configs. Authority changes are code changes.
3. **Add to your agent's system prompt:** "Your AUTHORITY.md is at [path]. Consult it before acting. If you're unsure whether you have authority, escalate."
4. **Create a VAULT-ACCESS.md** at system root and communicate it to all agents.
5. **Log all escalations and Principal decisions** in a `decisions/` folder. Use this to detect miscalibrations.
6. **Monthly review:** Coordinator reports escalation patterns to Principal. If too much is escalating, redistribute authority. If too little, tighten safety rules.

**Common mistakes:**

- **Giving agents too much authority too fast.** Start L2 for new agents, promote to L2-E after they've proven reliability in domain.
- **Making the Coordinator a bottleneck.** If Coordinator approves everything, you've made it do domain work. Route more decisions to L2 agents and Principal directly.
- **Assuming trust is authority.** You might trust an agent completely and still scope it to L2. That's healthy.
- **Forgetting to document escalations.** If you don't track why decisions are being escalated, you can't improve the model.

---

## Conclusion

The 4-Level Authority Framework is fundamentally about clarity. Every agent knows what it can do without asking. Every agent knows when to escalate and to whom. The Principal sees decisions that matter and avoids micro-managing routine work. The Coordinator orchestrates without becoming a chokepoint.

This isn't about control. It's about scale. As you add agents, distributed authority scales. Centralised authority doesn't.

Implement this framework when you have three or more agents. It pays for itself in eliminated ambiguity and clearer decision-making within a week.
