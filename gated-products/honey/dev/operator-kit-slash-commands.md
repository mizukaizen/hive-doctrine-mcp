---
title: "The Command Layer — 6 Pipeline Commands for Structured AI Development"
author: "Melisia Archimedes"
collection: "C7: Dev Mastery"
tier: "honey"
price: 29
version: "1.0"
last_updated: "2026-03-09"
audience: "AI-native developers, Claude Code users, solo builders"
hive_doctrine_id: "HD-0061"
format: "Markdown command definitions (Claude Code .claude/commands/ format)"
---

# The Command Layer
## 6 Pipeline Commands for Structured AI Development

You have agents. You have a multi-phase product development pipeline. You have 80+ skills ready to run. So why do you still feel like you're juggling handwritten prompts, guessing what to do next, and restarting context when a phase completes?

The answer: **commands**. A command is a one-word interface to orchestrated complexity. Type `/discover` and the pipeline runs. It gathers requirements, invokes the right agents, sequences their work, captures outputs, and tells you what to do next.

This is the difference between **ad-hoc AI work** and **structured AI-native development**.

---

## Why Commands Matter

In traditional software, your workflow lives in your head. You've memorised the steps. "First I scope, then I design, then I review, then I ship." You move through them manually, remembering where you left off.

In AI-native development, the workflow is too large to hold in head. You have agents with different personalities, conflicting opinions, and specialised knowledge domains. You have quality gates that must be binary—not "mostly done" but "PASS or FAIL". You have pipeline phases that must run in strict order, with prerequisites that must be verified.

Without commands, you:
- Write the same preamble prompt 40 times ("okay, now we're in Phase 2, here's the context, here's what I need...")
- Forget which gate you passed and restart from scratch
- Lose outputs in an inbox because you didn't have a convention for saving them
- Run Phase 4 (Build) before Phase 3 (Gate Check) because the boundary wasn't enforced
- Create merge conflicts between what agents think they should do and what your product actually needs

**Commands solve this by making your workflow executable.**

A command:
1. **Enforces prerequisites.** "Did you pass the gate? No? Here's what you need to do first."
2. **Orchestrates agents in sequence.** Discovers requirements → invokes Agent A → passes output to Agent B → surfaces decision point.
3. **Standardises outputs.** Every Phase 1 output goes to `outputs/discoveries/`, named consistently, with a standard template.
4. **Makes the next step obvious.** Command ends with: "You've completed Phase 1. Next: run `/architect` to begin Phase 2."
5. **Survives context reset.** Kill the session, start a new one, run `/brief` to see where you are. All state lives in files, not in chat memory.

This is the difference between **using AI** and **scaling AI development**.

---

## The Command-Agent Relationship

A command is not an agent. Think of it this way:

- **Command:** User interface. What you type. Orchestration layer.
- **Agent:** Specialised execution. Does the actual thinking. Invoked by commands.
- **Skill:** Atomic capability. File I/O, API calls, code generation. Invoked by agents.

When you type `/discover`:

```
User types /discover
  ↓
Command layer (discover.claude) — gathers requirements from you
  ↓
Calls Explorer agent with structured brief
  ↓
Explorer agent invokes skills: research, competitor analysis, persona synthesis
  ↓
Explorer agent returns structured output
  ↓
Command layer saves to outputs/discoveries/{name}/BRIEF.md
  ↓
Command layer surfaces next action: "Ready for /architect? Run it next."
```

This architecture means:

- **Commands are reusable.** Same command works for Project A and Project B because it's parameterised by your input.
- **Agents are swappable.** Unhappy with how Explorer ran Phase 1? Swap in a different agent without changing the command.
- **Skills are composable.** One skill (e.g., "research via search") is called by multiple agents.
- **Pipeline is auditable.** Every command run is logged, every output is timestamped, every decision is captured.

You're not writing prompts. You're composing orchestration logic.

---

## The 6 Commands

### 1. /discover — Phase 1: Opportunity Discovery

**What it does:**
Runs your initial opportunity through a comprehensive discovery phase. Gathers your vision, runs market analysis, identifies risks, and produces a decision brief recommending whether to proceed.

**When to use:**
- You have a new product idea, feature, or project
- You need to validate TAM/SAM before investing in architecture
- You want a structured risk register before committing resources

**Which agents it calls:**
- **Explorer agent:** Market research, TAM/SAM sizing, competitor analysis, user persona synthesis, risk register compilation

**What it produces:**
- `outputs/discoveries/{project-name}/OPPORTUNITY_BRIEF.md` — Structured brief including:
  - Your opportunity statement (refined from your input)
  - TAM/SAM/SOM with assumptions
  - 3 primary competitors and positioning
  - 3 user personas with depth
  - Risk register (CRITICAL, HIGH, MEDIUM) with initial mitigations
  - Go/No-Go recommendation
- Log entry in `outputs/discoveries/INDEX.md`

**Prerequisites:**
- You have an opportunity statement (2-3 sentences, what problem you're solving)

**Example usage:**

```
User: /discover

Claude: What's your opportunity statement? (E.g., "Help solopreneurs automate their weekly reporting to save 3 hours per week")

User: We're building an AI code review system for research teams using Claude's API. They waste 20 hours per sprint on manual code reviews.

[Explorer agent runs TAM analysis, competitor research, persona synthesis, risk registry]

Claude: ✅ DISCOVERY COMPLETE

Opportunity: AI-powered code review for research teams
TAM: $1.2B (research sector)
SAM: $180M (US + EU mid-market labs)
Blockers: Researcher trust, integration with existing tools

Risk register: 3 CRITICAL (model hallucination on complex algorithms, integration friction, data privacy in academia)

Next: Run `/architect` to design the system architecture.
```

**Philosophy:**
/discover is your forcing function. It takes vague ideas and produces structured facts. It surfaces risks you haven't thought about. It prevents you from building something nobody needs.

---

### 2. /architect — Phase 2: System Architecture

**What it does:**
Takes your validated opportunity and produces a complete architecture. API contracts, database schema, deployment topology, third-party integrations, scaling assumptions.

**When to use:**
- Phase 1 (Discovery) is complete and you have a PASS recommendation
- You need technical decisions documented before building
- You want to validate assumptions with stakeholders before Phase 3 gate check

**Which agents it calls:**
- **Architect agent:** System design, API contract definition, database schema, deployment topology, tech stack selection, integration planning, scalability analysis

**What it produces:**
- `outputs/architectures/{project-name}/ARCHITECTURE_DECISION_RECORD.md` — Including:
  - System diagram (ASCII)
  - API contracts (OpenAPI spec stub)
  - Database schema (ERD + migration plan)
  - Deployment topology (dev/staging/prod)
  - Tech stack decisions with justification
  - Integration points (Stripe, Auth0, third-party APIs)
  - Scaling limits and breakpoints
  - Security assumptions
- `outputs/architectures/{project-name}/API_CONTRACTS.yaml` — Full OpenAPI definition
- `outputs/architectures/{project-name}/DATABASE_SCHEMA.sql` — Initial migration

**Prerequisites:**
- Completed `OPPORTUNITY_BRIEF.md` from Phase 1
- Opportunity recommendation must be PASS (no FAIL recommendations)

**Example usage:**

```
User: /architect

Claude: Prerequisites check:
✅ OPPORTUNITY_BRIEF.md found
✅ Recommendation: PASS

What are your non-functional requirements?
- Expected throughput? (requests/sec, users, data volume)
- Availability requirement? (99.9% uptime?)
- Latency requirement? (<100ms response time?)

User: 100 req/sec, 99.95% uptime, <200ms avg response. Budget $5k/month cloud.

[Architect agent designs: Lambda + RDS + CloudFront, Stripe webhooks, OAuth2 via Auth0]

Claude: ✅ ARCHITECTURE COMPLETE

System: Serverless (Lambda) + managed DB (RDS) + CDN (CloudFront)
API: 47 endpoints, async job queue for code review processing
Database: PostgreSQL with 8 tables, bi-temporal design for audit trail
Scaling: up to 1000 req/sec before infrastructure redesign
Cost: ~$3.2k/month at capacity

Next: Run `/gate-check` to verify completeness against quality standards.
```

**Philosophy:**
/architect forces you to answer hard questions before you write code. "How will users log in?" "What happens if the AI model is slow?" "Do we need a queue?" Making these decisions as commands, not as coding decisions, prevents rework.

---

### 3. /gate-check — Phase 3: Quality Gate

**What it does:**
Binary decision point. Runs your project against the Definition of Done checklist. Returns PASS (proceed to Phase 4) or FAIL (specific remediation steps required).

**When to use:**
- You've completed Opportunity Brief (Phase 1) and Architecture (Phase 2)
- You want permission to start building
- You want to know exactly what's missing before committing resources

**Which agents it calls:**
- **Gatekeeper agent:** Completeness check (90% Definition of Done), clarity verification, risk register review, feasibility assessment

**What it produces:**
- `outputs/gates/{project-name}/GATE_REPORT_PHASE_3.md` — Including:
  - PASS or FAIL (binary, no partial passes)
  - DoD checklist (✅ or ❌ for each section)
  - If FAIL: specific remediation steps (e.g., "Expand TAM analysis to EMEA region", "Add threat model for data encryption")
  - If PASS: approval to proceed to Phase 4
- Decision timestamp and gatekeeper signature

**Prerequisites:**
- Completed `OPPORTUNITY_BRIEF.md` from Phase 1
- Completed `ARCHITECTURE_DECISION_RECORD.md` from Phase 2
- Project PRD must be ≥90% complete

**Example usage:**

```
User: /gate-check

Claude: Prerequisites check:
✅ OPPORTUNITY_BRIEF.md found
✅ ARCHITECTURE_DECISION_RECORD.md found

Running Phase 3 gate against Definition of Done (90% threshold)...

[Gatekeeper agent scores each section]

Claude: ❌ GATE REPORT: FAIL

Completeness: 73% (needs 90%)

Missing sections:
- Threat model for code review injection attacks (CRITICAL risk, not mitigated)
- Accessibility audit plan (requirement not documented)
- Data retention policy (GDPR requirement)

Remediation required:
1. Add threat model to Architecture ADR (3 hours)
2. Add accessibility checklist to PRD (1 hour)
3. Add data retention policy to ops runbook (2 hours)

Rerun `/gate-check` after remediation.
```

**Philosophy:**
The gate is binary. Not "pretty good" but "PASS" or "FAIL". This prevents the most common product failure: starting to build something that was actually incomplete. The gate is there to save you weeks of rework.

---

### 4. /ship — Phases 4-8: Full Build Pipeline

**What it does:**
Orchestrates the complete build-to-launch pipeline. Test-driven development, code review, security scanning, deployment to production, payment integration, and launch readiness checks.

**When to use:**
- Phase 3 gate check returned PASS
- You're ready to go from spec to shipped product
- You want the AI to orchestrate all phases without interruption (or with deliberate handoff points)

**Which agents it calls:**
- **Builder agent** (Phase 4): Test-driven development, feature implementation, 80%+ coverage
- **Reviewer agent** (Phase 5): Security scanning, test validation, WCAG accessibility checks
- **Deployer agent** (Phase 6): CI/CD pipeline, staging/production deployment, monitoring setup
- **Auth agent** (Phase 7): Stripe webhook integration, OAuth setup, user isolation, tenant isolation
- **Launch agent** (Phase 8): Documentation, analytics instrumentation, launch comms, runbook verification

**What it produces:**

Phase 4 outputs:
- `outputs/builds/{project-name}/SOURCE_CODE/` — All application code
- `outputs/builds/{project-name}/TEST_REPORT.md` — Coverage ≥80%, all tests passing

Phase 5 outputs:
- `outputs/reviews/{project-name}/SECURITY_AUDIT.md` — Zero CRITICAL, zero HIGH vulnerabilities
- `outputs/reviews/{project-name}/ACCESSIBILITY_REPORT.md` — ≥90% WCAG 2.1 AA checks passed

Phase 6 outputs:
- `outputs/deployments/{project-name}/CI_CD_CONFIG.yaml` — GitHub Actions / similar
- `outputs/deployments/{project-name}/DEPLOYMENT_RUNBOOK.md` — Step-by-step deployment procedure

Phase 7 outputs:
- `outputs/payments/{project-name}/STRIPE_INTEGRATION.md` — Webhook definitions, test plan
- `outputs/auth/{project-name}/OAUTH_SETUP.md` — Auth0 config, user isolation validation

Phase 8 outputs:
- `outputs/launches/{project-name}/PRODUCT_DOCS.md` — User-facing documentation
- `outputs/launches/{project-name}/LAUNCH_CHECKLIST.md` — Go/no-go for production

**Prerequisites:**
- Phase 3 gate check must have returned PASS
- Architecture ADR must be completed
- Project PRD ≥90% complete

**Example usage:**

```
User: /ship

Claude: Prerequisites check:
✅ Phase 3 gate: PASS
✅ Architecture ADR complete
✅ PRD 94% complete

Beginning Phase 4 (Build): Test-driven development...

[Builder agent writes failing tests, then implementation, validates 80%+ coverage]

✅ Phase 4 COMPLETE: 847 tests passing, 82% coverage

Beginning Phase 5 (Review): Security + accessibility...

[Reviewer agent scans dependencies, OWASP checks, accessibility audit]

⚠️ Phase 5 BLOCKER: 2 HIGH severity vulnerabilities (lodash version, SQL injection in search)

Remediation: Upgrade lodash, parameterise SQL query.

User: Fixed! Rerun phase 5.

[Reviewer re-runs, all checks pass]

✅ Phase 5 COMPLETE

Beginning Phase 6 (Deploy)...
[Deployer agent configures CI/CD, deploys staging, validates smoke tests]

✅ Phase 6 COMPLETE: Staging live at staging.example.com

Beginning Phase 7 (Auth + Payments)...
[Auth agent integrates Stripe, OAuth, sets up webhook handlers]

✅ Phase 7 COMPLETE: Test payments working

Beginning Phase 8 (Launch)...
[Launch agent instruments analytics, writes docs, prepares launch comms]

✅ Phase 8 COMPLETE: All gates passed

🚀 READY FOR PRODUCTION LAUNCH

Next action: Merge main branch, trigger production deployment.
```

**Philosophy:**
/ship is not a single command; it's a pipeline orchestrator. It runs multiple phases, each with its own quality gate. If Phase 5 (Review) finds blockers, you fix them and rerun Phase 5 without restarting the entire pipeline. The command remembers where you are.

---

### 5. /audit — Standalone Security + Code Quality

**What it does:**
Independent security and code quality scan. Can be run at any time, independent of the pipeline. No prerequisites. Useful for legacy code, mid-project reviews, or security checkups.

**When to use:**
- You want a security audit without running the full pipeline
- You have legacy code and need a baseline vulnerability scan
- You want to verify code quality mid-project
- You've updated dependencies and want to check for new vulnerabilities

**Which agents it calls:**
- **Security Reviewer agent:** Dependency scanning (CVE checks), OWASP vulnerability checks, secrets detection, cryptography audit
- **Code Reviewer agent:** Code quality metrics, complexity analysis, style adherence, dead code detection

**What it produces:**
- `outputs/audits/{timestamp}/SECURITY_SCAN.md` — All vulnerabilities found, severity, remediation steps
- `outputs/audits/{timestamp}/CODE_QUALITY_REPORT.md` — Metrics, quality score, improvement recommendations
- `outputs/audits/{timestamp}/COMBINED_AUDIT_REPORT.md` — Executive summary + detailed findings

**Prerequisites:**
- None. Can run standalone at any time.

**Example usage:**

```
User: /audit

Claude: Running standalone audit (no prerequisites)...

[Security agent scans code, dependencies, secrets]
[Code agent measures complexity, coverage, style]

Claude: ✅ AUDIT COMPLETE

Security: 0 CRITICAL, 1 HIGH, 3 MEDIUM
- HIGH: lodash 4.17.20 (ReDOS vulnerability) — upgrade to 4.17.21
- MEDIUM: Hardcoded API key in tests (move to .env)

Code Quality: 78/100
- Cyclomatic complexity: 23 methods >10 (reduce to <7)
- Untested code paths: 3 critical paths need tests
- Dead code: 12 functions not called (remove or document)

Estimated remediation: 6-8 hours.

Fix and rerun `/audit` when ready.
```

**Philosophy:**
/audit is your escape hatch. You don't need to be in a formal pipeline to run security checks. Use it whenever you want reassurance that your code is safe.

---

### 6. /brief — Project Status Snapshot

**What it does:**
Reads your project context and outputs a quick status snapshot. What phase are you in? What's the latest output? What's blocking you? What's next?

**When to use:**
- You've restarted in a new session and need to remember where you are
- You're passing the project to another team member
- You want to document progress for stakeholders
- You're context-switching and need a 2-minute refresher

**Which agents it calls:**
- None. Command layer only. Reads output files and project context.

**What it produces:**
- `outputs/briefs/{timestamp}/PROJECT_FLASH_CARD.md` — Including:
  - Current phase
  - Latest outputs (with timestamps)
  - Known blockers
  - Deployment status (where does it live?)
  - Next action (what command to run)
  - Team context (who's working on this)

**Prerequisites:**
- None. Can run at any time.

**Example usage:**

```
User: /brief

Claude: Scanning project context...

Claude: 📋 PROJECT FLASH CARD

Project: AI Code Review System for Research Labs
Status: Phase 6 (Deploying)
Last activity: 2 hours ago

Phase Progress:
✅ Phase 1: Discovery — TAM $1.2B, PASS
✅ Phase 2: Architecture — Serverless + RDS, PASS
✅ Phase 3: Gate — 90% complete, PASS
🏗️ Phase 4: Build — 847 tests, 82% coverage ✅
🔍 Phase 5: Review — Security audit complete ✅
🚀 Phase 6: Deploy — Staging live, smoke tests passing
⏳ Phase 7: Auth+Payments — Not started
⏳ Phase 8: Launch — Not started

Latest outputs:
- outputs/deployments/code-review-lab/DEPLOYMENT_RUNBOOK.md (45 min ago)
- outputs/reviews/code-review-lab/SECURITY_AUDIT.md (1 hour ago)

Blockers: None known

Production URL: Not yet deployed

Next action: Continue Phase 6 — deploy to production staging, then run Phase 7 auth integration.
```

**Philosophy:**
/brief keeps you grounded. Every session is a fresh start in AI. Having a one-command status snapshot means you never lose context, even across multiple sessions or team handoffs.

---

## Pipeline Flow

The six commands sequence as follows:

```
/discover (Phase 1)
    ↓
    [Review Opportunity Brief]
    ↓
/architect (Phase 2)
    ↓
    [Review Architecture ADR]
    ↓
/gate-check (Phase 3)
    ↓ PASS?
    ├─ YES → /ship (Phases 4-8)
    ├─ NO  → [Remediate] → /gate-check (rerun)
    ↓
    🚀 Production Live

[Anytime] /audit — Security + code quality check
[Anytime] /brief — Status snapshot
```

Key rule: **No Phase 4 (Build) without Phase 3 PASS.** This boundary is enforced by the /ship command.

---

## Utility Commands vs Pipeline Commands

| Command | Type | Can run anytime? | Prerequisite | Output |
|---------|------|------------------|--------------|--------|
| /discover | Pipeline | No | None | Opportunity Brief |
| /architect | Pipeline | No | Phase 1 PASS | Architecture ADR |
| /gate-check | Pipeline | No | Phase 1 + 2 complete | Gate Report (PASS/FAIL) |
| /ship | Pipeline | No | Phase 3 PASS | Phases 4-8 artifacts |
| /audit | Utility | **Yes** | None | Security + code quality |
| /brief | Utility | **Yes** | None | Status snapshot |

Utility commands are your escape hatches. Pipeline commands enforce order.

---

## Creating Your Own Commands

The command format (Claude Code `.claude/commands/` directory) is simple:

```markdown
# /mycommand
command: mycommand
description: What this command does
status: draft

## requirements
- [ ] Prerequisite 1
- [ ] Prerequisite 2

## execution
1. Check prerequisites
2. Gather input from user
3. Invoke agent(s)
4. Capture outputs to outputs/{section}/
5. Surface next action

## output
- outputs/{section}/{file}.md
```

When creating custom commands:
1. **Name for clarity.** `/deploy-staging` is better than `/ds`.
2. **Document prerequisites.** Save people from preventable failures.
3. **Save outputs consistently.** All Phase 4 outputs go to `outputs/builds/`, not scattered.
4. **Surface next action.** Every command ends with "Next: run `/whatever` to continue."

The art of command design is **knowing what to sequence, what to gate, what to document**.

---

## The Philosophy: Commands as Product Development Workflow

A command is your product development workflow encoded as a one-word interface.

In traditional software teams, a person (the PM, the tech lead, or an experienced engineer) knows the workflow. They guide junior developers through it. "First, we validate the idea. Then we design the system. Then we review against a checklist. Then we build." This person is making sure nobody skips steps, nobody builds the wrong thing, nobody ships without testing.

Commands are that person, encoded.

When you type `/discover`, the command:
- Enforces that discovery happens first
- Gathers the right information
- Invokes the right agent (the expert who can synthesize)
- Saves the output so you don't lose it
- Tells you exactly what to do next

This works because **commands are deterministic, logged, and auditable**. They're not lost in chat history. They're not subject to the whims of a tired team member. They're not forgotten when context resets.

For solo builders and small teams working with AI, commands are how you scale. They're your forcing function. They're your insurance policy against skipped gates and wasted weeks on the wrong product.

Use them.

---

## Quick Reference

| Command | Phase | Input | Output | Next |
|---------|-------|-------|--------|------|
| /discover | 1 | Opportunity statement | Opportunity Brief | /architect |
| /architect | 2 | Non-functional requirements | Architecture ADR | /gate-check |
| /gate-check | 3 | (reads Phase 1+2) | Gate Report | /ship or remediate |
| /ship | 4-8 | (reads Phase 1-3) | All build artifacts | Production |
| /audit | — | (anytime) | Security + QA report | Fix and rerun |
| /brief | — | (anytime) | Status snapshot | (context refresh) |

---

**Ready to build?** Start with `/discover`. Your first command will shape everything that follows.
