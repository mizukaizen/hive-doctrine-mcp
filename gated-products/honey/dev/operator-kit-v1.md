---
title: "Operator Kit v1.0 — Turn Your AI Coding Assistant into a Structured Dev Team"
author: Melisia Archimedes
collection: C7-dev-mastery
tier: honey
price: 149
version: 1.0
last_updated: 2026-03-09
audience: developers
hive_doctrine_id: HD-0057
---

# Operator Kit v1.0

Stop pretending your AI coding assistant is a junior developer. Give it a real role in a real team. The Operator Kit is a complete workflow framework—YAML configs, specialist agent prompts, 6 CLI commands, and a quality gate that actually works—that transforms Claude Code into a structured engineering pipeline. No dependencies. Copy it in. Start shipping in 5 minutes.

## The Problem

You're probably using your AI assistant like a search engine. You paste a problem, get back code, paste it into your project, test it, maybe iterate once or twice. It works sometimes. Other times you waste hours on hallucinated dependencies, missed edge cases, or code that looks clean but breaks in production.

The real issue: you're treating the assistant as a tool instead of a team member. You're not giving it context. You're not making it part of your system. You're not enforcing standards. You're not using it to catch problems *before* you write code.

Here's what actually happens when you work this way:
- You skip architecture because you just want to "get it done"
- You discover halfway through a sprint that your design doesn't scale
- Your code review finds security holes that should have been caught in the design phase
- You merge untested code because you needed it yesterday
- Your deployment breaks because nobody documented the SOP
- You can't onboard the next person because there's no operational record

Every one of these is a team coordination failure. And if you're working solo, you're feeling all of it at once.

The Operator Kit fixes this by doing one thing: **enforcing a structured pipeline with checkpoints that actually work.** It's not about making your assistant smarter. It's about making your team operate like a team.

## What You Get

The kit is eight files—no external dependencies, no cloud services, no subscriptions:

**The Framework**
- `.claude/CLAUDE.md` — Core operating manual (team structure, terminology, infrastructure facts)
- `.claude/rules/` — Five operational files that define how work gets done

**The Team**
- 7 specialist agent definitions (Explorer, Architect, Gatekeeper, Builder, Code Reviewer, Auditor, Deployer)
- Each agent has a specific role, constraints, and output format
- Each knows exactly when to hand off work to the next agent

**The Commands**
- `/discover` — Opportunity brief + market research. Understand what you're actually building before you design it.
- `/architect` — System architecture, component diagram, Architecture Decision Record (ADR) for each major choice
- `/gate-check` — Quality gate. Scores your PRD, architecture, risk register, and feasibility against a 90% Definition of Done. PASS or FAIL. No partial passes.
- `/ship` — Execute the build pipeline: write code → code review → test → deploy → handle payments → launch comms
- `/audit` — Standalone security scan (OWASP, dependency analysis, secrets detection)
- `/brief` — Project status snapshot. What's done, what's blocked, what's next.

**The Skills**
- BMAD design checklist (Business, Market, Architecture, Design)
- Security vulnerability scanner (pluggable, customisable)
- Test-Driven Development (TDD) harness
- API design patterns (REST, GraphQL, webhooks)
- Code conventions (naming, structure, error handling)
- Deployment SOP (staging, production, rollback)
- Accessibility & design audit (WCAG 2.1 AA)

**The Rules**
- Operational Rules — SSH safety, database backups, resource awareness, Syncthing sync behaviour
- Quality Gate Thresholds — PASS/FAIL criteria for Phase 3 (design), Phase 5 (test), Phase 8 (launch)
- Security Rules — no destructive commands without confirmation, vulnerability scanning, dependency review
- Testing Rules — minimum coverage targets, test categorisation, async testing patterns
- Code Conventions — naming standards, error handling, logging, file structure

## How It Works: The 8-Phase Pipeline

Think of this as a production engineering workflow, not a feature checklist. Each phase has clear inputs, outputs, and handoff criteria.

### Phase 1: Discover (/discover)
**The Explorer runs this.**

You've got an idea. Maybe it's a feature request, a bug fix, or a whole new product. The Discover phase gets your head right before you touch a single design doc.

The Explorer produces:
- Opportunity brief (what problem are we solving, for whom, why now)
- Market research (what exists, what's weak, competitive landscape)
- Success metrics (how do we know this worked)
- Constraints (budget, timeline, technical limits)

Input: A problem statement. Output: A 1–2 page brief that you actually agree with. Time: 30 minutes to 2 hours depending on scope.

### Phase 2: Architect (/architect)
**The Architect takes over.**

Now you know what you're building. Time to design it. This is where most solo developers skip ahead—and it costs them later.

The Architect produces:
- System architecture (boxes and arrows, naming conventions, data flows)
- Component breakdown (what are the independent pieces, what's their responsibility)
- Database schema (if applicable) with rationale
- Architecture Decision Record (ADR) — for each major choice (why we chose this, what we rejected, tradeoffs)
- API design (if applicable) — endpoints, request/response shapes, error codes
- Deployment architecture (staging, prod, CDN, monitoring)
- Risk assessment (what can break, how bad is it, what mitigates it)

Input: The opportunity brief from Phase 1. Output: A design that you've thought through. Time: 2–4 hours for a small project, 1–2 weeks for a major system.

### Phase 3: Gate Check (/gate-check)
**The Gatekeeper enforces this. This is where most teams fail.**

Before you write a single line of production code, the Gatekeeper runs a structured quality review. The gate checks:
- **PRD completeness** — ≥90% of the spec is actually filled in and makes sense
- **Architecture justification** — every major decision has a rationale; tradeoffs are documented
- **Risk register** — all CRITICAL risks have mitigations; nothing is "we'll figure it out later"
- **Feasibility** — no technology unknowns; you've validated dependencies and patterns

**The result is binary: PASS or FAIL. There are no partial passes.** If it fails, the Gatekeeper tells you exactly what's missing and what you need to fix. Then you iterate and run /gate-check again.

This is the single most important part of the kit. Most teams skip this. Most solo developers skip it too. The projects that succeed are the ones where someone—in your case, the Gatekeeper—says "not yet" and means it.

If /gate-check passes, you proceed to Phase 4. If it fails, you rework your design. It takes discipline. It saves months.

### Phase 4: Ship (/ship)
**The Builder, Code Reviewer, and Deployer run this in sequence.**

Now that the design is locked, the Builder writes the code. Once it's written:
- Code Reviewer checks it against your conventions, patterns, and security rules
- Tester runs the test suite and reports coverage
- Deployer handles staging validation and production release
- (For commercial products) Payments flow is tested and integrated
- Launch team handles comms—release notes, documentation, changelog

Input: A PASS from /gate-check. Output: Shipped code in production. Time: Variable; heavily dependent on scope.

### Phase 5: Audit (/audit)
**The Auditor runs this independently.**

After Ship, Audit runs a comprehensive security scan. OWASP vulnerabilities, dependency analysis, secrets scanning, code patterns. This is separate from the code review because the auditor isn't biased by "we've already shipped this."

### Phase 6: Brief (/brief)
**Run this at any time for status.**

Project status snapshot. What's shipped, what's in progress, what's blocked, risks that have changed. Useful for stakeholder comms or just keeping your own head clear.

### Phases 7–8: Operations & Iteration
Every project is live now. Phases 7 and 8 are monitoring, support, and the next iteration cycle. The kit handles this through runbooks (SOP documents) and incident response protocols.

---

## The Gate: Why It Matters

Most development advice tells you to "move fast and iterate." That's true. But it's only true *after* you know what you're building.

The problem: most projects fail not because the code is bad, but because the design was wrong. You find out halfway through that your schema doesn't scale, or your architecture puts all the logic in the wrong layer, or you missed a critical user flow.

These aren't code problems. They're design problems. And they're catastrophically expensive to fix mid-project.

The gate enforces a hard constraint: **no Phase 4 (Build) starts until Phase 3 (design review) achieves ≥90% on a structured checklist.** It's binary. PASS or FAIL. No "close enough."

What this actually means:
1. You can't start building until the architecture justifies every major choice
2. You can't start building until the risks are identified and mitigations are in place
3. You can't start building until you've validated that your dependencies actually exist
4. You can't start building until someone who isn't emotionally invested says "yes, this is ready"

This sounds slow. It isn't. It's the fastest way to build because you spend 20 hours on design to save 200 hours of rework.

The gate is also where the assistant adds the most value. A human architect can make educated guesses. An AI assistant can enumerate every decision, every tradeoff, every risk. Then you—the human—decide whether to accept it or reject it. That dialogue is the actual design work.

---

## Installation

1. **Download the kit** from the marketplace.

2. **Copy the `.claude` folder into your project root:**
   ```
   your-project/
   ├── .claude/
   │   ├── CLAUDE.md
   │   ├── rules/
   │   │   ├── 01-security.md
   │   │   ├── 02-testing.md
   │   │   ├── 03-code-conventions.md
   │   │   ├── 04-deployment.md
   │   │   └── 05-quality-gates.md
   │   ├── agents/
   │   │   ├── explorer.md
   │   │   ├── architect.md
   │   │   ├── gatekeeper.md
   │   │   ├── builder.md
   │   │   ├── code-reviewer.md
   │   │   ├── auditor.md
   │   │   └── deployer.md
   │   └── skills/
   │       ├── bmad-checklist.md
   │       ├── security-scanner.md
   │       ├── tdd-harness.md
   │       ├── api-patterns.md
   │       ├── code-conventions.md
   │       ├── deployment-sop.md
   │       └── design-a11y-audit.md
   └── src/
   ```

3. **Edit `.claude/CLAUDE.md`** — fill in your project name, team members (if any), infrastructure facts, and key terms for your domain.

4. **Start Phase 1:**
   ```
   /discover
   ```

That's it. The entire framework is now live in your project. Each command routes to the appropriate agent definition. Each agent knows what to do.

**First-run expectations:**
- `/discover` — 30 mins to 2 hours
- `/architect` — 2–4 hours for small projects, 1–2 weeks for major systems
- `/gate-check` — 1 hour (or several iterations if it fails)
- `/ship` onwards — depends on project scope

Most teams report that they get value from the gate alone (Phase 3). The rest of the pipeline is there for when you need it.

---

## What This Replaces

**Project Management Tool ($12/month × 12 = $144/year)**
The kit doesn't manage tasks or timelines, but it makes task decomposition automatic. Once /gate-check passes, the tasks write themselves: implement this component, write tests for this function, deploy to staging, validate in prod.

**Design & Whiteboarding Tool ($20/month × 12 = $240/year)**
The Architect agent produces architecture diagrams, component breakdowns, and ADRs in structured markdown. No Lucidchart subscription needed.

**Code Review Tool ($10/month × 12 = $120/year)**
The Code Reviewer agent runs against your conventions and security rules. It's not a replacement for human review, but it catches 80% of what a junior reviewer would flag.

**Security Scanning Tool ($50/month × 12 = $600/year)**
The Audit skill integrates OWASP patterns and dependency scanning. Run /audit after every major release.

**Testing Framework ($0, but time)**
TDD skill includes test harness templates for the most common patterns. Reduces setup time from 2 hours to 15 minutes.

**Total replaced:** ~$1,100/year in SaaS + significant time savings in design review and testing setup.

**ROI:** At $149, you break even in 6 weeks of saved tool subscriptions. The design discipline alone—preventing one major rework—is worth 10× the price.

---

## Who This Is For

**You should buy this if:**
- You ship code alone or in very small teams (1–3 people)
- You've experienced a major rework because the design was wrong
- You want your AI assistant to actually be part of your process, not just a search engine
- You care about security and code quality but don't have time to build your own standards
- You're tired of "done" meaning "shipped but fragile"
- You want repeatable process that scales as you bring on teammates

**Specific fit:**
- Indie hackers building products for revenue
- Technical founders who code but need the discipline
- Developers who've shipped enough to know design matters
- Teams moving to distributed work where async standards are critical
- Anyone adopting AI coding assistants and wondering how to actually use them

---

## Who This Isn't For

**You probably don't need this if:**
- You work in a large org with established design review and QA processes
- You're building throwaway code or prototypes (though the /discover phase is useful even for this)
- You strictly follow Scrum or XP methodology already (the kit is lighter-weight)
- You're risk-averse and already have exhaustive documentation processes
- You don't use Claude Code or another AI coding assistant

That said: if you use an AI assistant and ship code, the kit is worth the experiment. It costs $149. If it prevents one refactor, it pays for itself. If you get discipline around your gate, it saves months.

---

## What's Included

The kit ships with:

**1. Complete `.claude/` directory** — copy into project root
- 1 core manual (CLAUDE.md)
- 5 operational rules files
- 7 agent definitions
- 7 skills (with templates and patterns)

**2. Quick-start guide** — 5-minute setup, no dependencies

**3. Command reference** — exactly what each `/phase` produces and when to use it

**4. Agent prompts** — fully baked; you don't need to rewrite them

**5. Example outputs** — sample PRD, architecture, gate-check report, deployment runbook

**6. Customisation guide** — how to adapt the framework for your domain (e.g., if you're building APIs vs. frontends vs. data systems)

---

## The Pragmatist's Take

Here's what actually happens when you use this:

**First project:** You'll follow the phases loosely. /discover and /architect will feel like overkill. Then /gate-check will catch something you missed and you'll feel vindicated. By /ship, you'll realise you spent 20 hours on design and saved 100 hours of rework. You'll tell everyone about it.

**Second project:** You'll trust the process more. You might skip /discover if it's a small feature (that's fine—the kit is flexible). You'll run /gate-check twice because you want it tight. You'll ship faster.

**Third project:** The process is automatic. You don't think about it; you just work. The gate becomes second nature. Your code review velocity increases because the Builder knows exactly what conventions apply. Your deployments are boring because the SOP is ironclad.

That's the goal: not more process, but the *right* process, automated enough that it doesn't slow you down and disciplined enough that it actually works.

---

## License & Support

- **License:** Personal and commercial use included. Single-user or team of up to 10.
- **Support:** Email support; updates delivered to your Hive Doctrine account.
- **Version updates:** v1.1+ available; major updates may be separate purchases.

---

## One Last Thing

The reason this works isn't because the framework is clever. It's because it enforces the one thing most teams don't do: **say no before you build, not after.**

Most reworks happen because someone shipped without a design locked in. The gate forces the design lock *before* shipping. That's it. That's the magic.

Everything else—the agents, the skills, the command structure—is just scaffolding to make the gate work reliably.

Buy this if you're ready to let the gate say no. If you're going to ignore a FAIL from /gate-check and build anyway, save your money. But if you're willing to redesign when the gate tells you to, this kit will change how you ship.

---

**Ready to build like a team?**

[Add to Cart] / [Learn More]
