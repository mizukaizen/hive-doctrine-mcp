---
title: "Agent Authority Template — Role-Based Permission Configs for Multi-Agent Systems"
author: Melisia Archimedes
collection: C3-authority-model
tier: honey
price: 49
version: 1.0
last_updated: 2026-03-09
audience: agent-builders
hive_doctrine_id: HD-0018
---

# Agent Authority Template

## The Problem

You've built a multi-agent system. You've got an orchestrator, a few specialist agents, maybe a data agent and a code agent. Now the question nobody talks about until it's too late: **who gets to do what?**

You've got two bad options:

**Option 1: Everything except production.** Your agents can read anything, write anything (except push to prod). This works until your data agent tries to "helpfully" modify your bot configuration, or your research agent hits an external API 10,000 times in an afternoon running up a bill you didn't budget for.

**Option 2: Nothing without approval.** You define a whitelist so tight that every single action requires human sign-off. Your agents become expensive question-answering machines. Bottlenecks everywhere. The system can't actually operate autonomously.

Both are failures of authority design. You end up with either chaos or a paperweight.

The pattern I've found that works: **discrete authority levels with permission boundaries that match real responsibilities.** L1 is observer. L2 is specialist with guardrails. L2-E is specialist with execution rights. L3 is coordinator. L4 is human override. Each level knows exactly what it can do, what requires approval, and what's completely off limits.

This isn't complexity theatre. It's the minimum viable governance for a system that actually runs.

---

## What This Solves

This template gives you:

1. **Two complete, copy-paste-ready authority configs** — one for a standard specialist (L2), one for a specialist with execution privileges (L2-E)
2. **The permission structure that actually works** — approved_actions, requires_approval, prohibited_actions, plus escalation paths
3. **How to calibrate it** — what changes when you move from research-only to execution-capable
4. **When to use each level** — decision tree for mapping agent roles to authority
5. **Override mechanics** — how humans actually intervene without breaking the system

---

## The Authority Levels

Keep this in your head when building agent permissions:

| Level | Can | Cannot | Use for |
|-------|-----|--------|---------|
| **L1** | Read data, analyse, report | Anything else | Observer, reporter, analyst |
| **L2** | Above + write to internal docs, draft external comms | Execute, spend, deploy | Research, strategy, business analysis |
| **L2-E** | Above + execute pre-approved actions | Spend, access system internals, override | Code, product, deployment (with gates) |
| **L3** | Coordinate across domains, request escalation | Direct agents (use L4 override) | Orchestration, cross-domain routing |
| **L4** | Everything | Nothing (everything requires intent) | Human oversight, final approval |

L2 agents answer the question "what should we do?" L2-E agents answer it and do it (within boundaries). The difference is execution privilege, not intelligence.

---

## Template 1: Standard Specialist (L2)

Use this for agents whose job is research, analysis, strategy, or recommendations. They write internally, but anything external requires approval.

```yaml
---
agent: "Research Agent"
level: "L2 — Specialist"
role: "Business opportunity identification and market analysis"

approved_actions:
  - "Research market trends and competitive activity"
  - "Analyse bot performance data (read-only)"
  - "Draft business cases and opportunity assessments"
  - "Maintain internal backlog/scorecard of opportunities"
  - "Write internal research docs to shared/research/"
  - "Use external tools for data gathering: web search, API queries, data aggregation"
  - "Analyse cross-domain data for patterns"

requires_approval_from: "Orchestrator (L3) or Human (L4)"
requires_approval_for:
  - "Publishing anything externally (even draft)"
  - "Sharing data with other agents outside normal workflow"
  - "Any recommendation that involves spending money"
  - "Creating new external integrations or connections"
  - "Changing the scoring or prioritisation methodology"

prohibited_actions:
  - "Execute trades or modify bot configuration"
  - "Spend money or make financial commitments"
  - "Deploy code or publish products"
  - "Direct other agents (route through Orchestrator)"
  - "Access other agents' credential files or secrets"
  - "Modify system infrastructure or configs"

escalation_protocol:
  - "Cross-domain question": "Route to Orchestrator (L3)"
  - "Decision involving money": "Escalate to Human (L4)"
  - "Conflict with other agent's output": "Orchestrator reviews and decides"
  - "Needs data from restricted domain": "Orchestrator requests on behalf"

safety_notes:
  - "Never assume you can publish a draft. Always ask first."
  - "If you find something urgent, escalate immediately. Don't implement."
  - "Read-only access means you can look, but changes go through Orchestrator."
  - "Your job is to make better decisions possible. Let others execute."
```

**When to use L2:**
- You want the agent to think and recommend, not act
- The agent's mistakes cost time, not money (or they cost money through recommendations, not execution)
- You're still establishing trust with the agent
- The domain requires human judgment on external-facing decisions

---

## Template 2: Specialist with Execution (L2-E)

Use this for technical agents—code builders, deployement operators, product engineers—who need to actually execute within guardrails. The key difference: they can do certain actions without approval, but production-critical actions still need sign-off.

```yaml
---
agent: "Product Engineer"
level: "L2-E — Specialist with Execution"
role: "Code, product, and deployment engineering"

approved_actions:
  - "Write code, build features, fix bugs"
  - "Draft architecture docs and technical specifications"
  - "Test and validate builds locally"
  - "Use development APIs and services"
  - "Plan deployments and create deployment checklists"
  - "Read codebase across domains (for learning/analysis only)"
  - "Commit code to feature branches"
  - "Create pull requests with detailed descriptions"
  - "Run automated tests and security scans"

requires_approval_from: "Human (L4)"
requires_approval_for:
  - "Deploy to production (staging OK, production no)"
  - "Push to main branch"
  - "Create or modify pricing, payment configs, or billing"
  - "Create public-facing pages or endpoints"
  - "Make anything externally visible without review"
  - "Access production credentials or secrets"
  - "Modify deployment infrastructure or CI/CD"

prohibited_actions:
  - "Execute trades or modify bot strategies"
  - "Spend money or make financial commitments"
  - "Access other agents' credential files"
  - "Modify system orchestration or core agent configs"
  - "Change data schemas without sign-off from data owner"
  - "Deploy code that interacts with financial systems without Human review"
  - "Execute emergency shutdowns or critical system changes"

escalation_protocol:
  - "Code review blocker": "Escalate to Human (L4) for decision"
  - "Production deployment ready": "Create checklist, send to Human (L4)"
  - "Cross-domain dependency needed": "Orchestrator (L3) coordinates"
  - "Security concern discovered": "Escalate immediately to Human"
  - "Architecture decision conflict": "Human (L4) decides direction"

safety_notes:
  - "NEVER modify bot executor or circuit breaker code without explicit Human review."
  - "Always create a deployment checklist before requesting production approval."
  - "Market orders and financial trades are completely prohibited. This is non-negotiable."
  - "Production deployments happen in daylight, never in off-hours without Human present."
  - "If unsure whether something needs approval, escalate. Wrong once is a mistake. Wrong twice is a pattern."
```

**When to use L2-E:**
- You need the agent to actually ship code, not just draft it
- The agent has proven judgment and won't make reckless moves
- The system has strong approval gates on truly critical actions (production, money, strategy)
- You trust the agent with deployment mechanics but not with business decisions

---

## How to Calibrate Authority

Start here: **what's the failure mode if this agent gets it wrong?**

| Failure Mode | Cost | Authority Level |
|---|---|---|
| Wastes time writing a bad proposal | Hours | L2 (no approval needed) |
| Publishes something wrong publicly | Reputation, trust | L2 (requires approval) |
| Deploys broken code to staging | Debugging time | L2-E (no approval needed) |
| Deploys broken code to production | Customers broken, revenue lost | L2-E (requires approval) |
| Spends \$100 on API calls | Quarterly budget impact | L2 (escalate immediately) |
| Modifies bot config, loses margin | Capital loss | Prohibited (hard no) |

**The rule:** if the agent's mistake costs < 1 hour of Human time to fix, L2/L2-E can do it without approval. If it costs > 1 hour or affects customers/money/reputation, it requires approval.

---

## The Override Condition

You want autonomy, but you also need a pressure valve. Here's what actually works:

**Standard operation:** Agent does its job within its authority level. No human in the loop.

**Escalation path:** When something is uncertain, agent flags it and asks. Orchestrator (L3) or Human (L4) decides.

**Override:** If Human sees something dangerous or wrong, they can:
- Revoke a specific action ("don't deploy that")
- Adjust the agent's authority temporarily ("you're L2 for the next 2 hours while I review")
- Undo recent decisions ("revert the code, let's reconsider")
- Shut down the agent if it's behaving unexpectedly

The override should be rare. If you're overriding constantly, your authority levels are wrong. Go back and recalibrate.

---

## Implementation Steps

1. **Pick your agent's role.** What is it actually supposed to do?

2. **Choose a level.** L1 if research-only. L2 if recommendation-only. L2-E if execution-required.

3. **Copy the template** above that matches your level. Don't invent your own structure—consistency matters.

4. **Fill in the approved_actions.** Be specific. "Use GitHub API" is good. "Can read repos" is vague.

5. **Fill in requires_approval_for.** What's the decision that always needs Human sign-off?

6. **Fill in prohibited_actions.** Absolute hard boundaries. No exceptions.

7. **Test it.** Run your agent for a week. Did it ask for approval when it should have? Did it act when it should have asked? Adjust and iterate.

8. **Document your escalation.** Who does the agent actually contact when it needs approval? Make it clear and testable.

---

## Packaging Notes

These templates work in context of:
- An orchestrator agent (L3) that routes requests and tracks escalations
- A human operator (L4) who provides final judgment on conflicts
- Clear logging of all authority decisions (what was approved, by whom, when)
- Regular audits (monthly is enough) to see if authority levels still match reality

You don't need sophisticated permission management software. A YAML file per agent + a log of approvals is sufficient. Start simple. Add structure only when you have data that shows you need it.

Authority is fundamentally about **trust calibrated to competence and consequence.** You're not trying to prevent your agents from being evil. You're trying to prevent them from being accidentally destructive. Build the guardrails proportionate to the risk, and they'll operate autonomously and safely.

---

## Next Steps

1. Print these templates to your project
2. Assign each agent a level (L1, L2, L2-E, L3)
3. Fill in your specific actions and escalations
4. Share with your team (or your orchestrator) so everyone knows the rules
5. Log every escalation for 4 weeks to find calibration gaps
6. Adjust authority based on what you learn

The system that works is the one you'll actually maintain. Keep it simple, keep it documented, keep it honest about what your agents can actually do.
