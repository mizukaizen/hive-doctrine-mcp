---
title: "The Agent Team — 7 Specialist Agent Templates for AI-Native Development"
author: "Melisia Archimedes"
collection: "C7: Dev Mastery"
tier: "honey"
price: 79
version: "1.0"
last_updated: "2026-03-09"
audience: "AI-native developers, Claude Code users, solo builders"
hive_doctrine_id: "HD-0058"
format: "Markdown agent definitions (Claude Code .claude/agents/ format)"
---

# The Agent Team — 7 Specialist Agent Templates for AI-Native Development

## Problem: Solo Developers Need Structured Thinking Partners

You're building alone. You have access to Claude—powerful, capable, generalist. But Claude-as-a-chatbot lacks structure. You jump between market research, architecture decisions, code review, security audits, deployment planning. Each requires different tools, different depth, different decision-making style. No consistent handoff. No gate checks. No audit trail.

The result: architectural decisions made without competitive research. Code shipped without security review. Deployments without runbooks. Rework. Technical debt. Blocked launches.

**What if you could work like a high-functioning team?** A specialist for market research who feeds into architecture decisions. An architect who hands off to a gatekeeper. A gatekeeper who blocks bad code. A builder who implements against explicit criteria. A reviewer who catches what the builder missed. A combined auditor for security, coverage, accessibility. A deployer who automates away risk.

That's what this product gives you: **7 specialist agents**, each configured for a specific phase of product development, each with different tools, models, and decision-making constraints. Used together, they form a structured pipeline. Used individually, each brings depth to a single problem.

This is how teams scale from 1 person to 3 people to 10 without changing process. You just change which agent takes the lead.

---

## The Agent Team Architecture

These 7 agents map to an 8-phase development pipeline. Not all phases require an agent—some are human decisions (Go/No-Go calls, creative direction, shipping decisions). But the high-cognitive, high-risk phases have agents built for them.

```
Phase 1: Discovery          → EXPLORER (market research)
Phase 2: Strategy           → Human (founder/PM)
Phase 3: Architecture       → ARCHITECT (system design)
Phase 3.5: Gate Check       → GATEKEEPER (validation)
Phase 4: Implementation     → BUILDER (TDD coding)
Phase 4.5: Code Review      → CODE REVIEWER (adversarial review)
Phase 5: Integration Tests  → COMBINED REVIEWER (security + coverage + design)
Phase 6: Deployment         → DEPLOYER (CI/CD + infrastructure)
Phase 7: Launch             → Human (go/no-go, comms)
Phase 8: Operations         → Human + monitoring (on-call)
```

Each agent is designed to be independent (you can use Explorer without the full pipeline) but interconnected (agents reference outputs from earlier phases). The handoff format is consistent: markdown documents, decision records, checklists.

---

## Agent 1: Explorer Agent (Market Research)

### Why This Agent Exists

Market validation is the highest-leverage research you can do. Most builders skip it or do it badly—gut feel instead of fact-based discovery. An Explorer agent forces rigorous discovery: competitive analysis, TAM/SAM scoring, persona interviews, unfair advantage identification, revenue model testing. Before you spend engineering time, you know if the market exists and if you can win in it.

### Configuration

```yaml
name: explorer
model: opus
tools:
  - read           # Parse documents, PRDs, case studies
  - glob           # Find files matching patterns
  - grep           # Search across large codebases for patterns
  - web_search     # Search engines and market data
  - web_fetch      # Read full web pages, competitor sites
max_turns: 10
```

**Why Opus?** Market research requires sustained analysis across multiple sources. Opus handles complex competitive comparisons, TAM estimation, and strategic pattern-matching better than cheaper models.

**Why these tools?** The Explorer needs to read existing research (Read), find papers or case studies (Glob), identify patterns across documents (Grep), discover new information (Web Search), and pull full context from competitor sites (Web Fetch).

**Why 10 turns?** Market research converges in ~5-7 turns once you've identified the key competitors, user segments, and TAM drivers. 10 gives breathing room without open-endedness.

### What the Explorer Outputs

An **Opportunity Brief** document with sections:

1. **Executive Summary** — 150-word thesis: Is this market real? Can you win?
2. **TAM/SAM/SOM** — Total addressable market, serviceable available market, serviceable obtainable market (with sources)
3. **Competitive Landscape** — 3-5 main competitors, their positioning, gaps, and weaknesses (fact-based, not opinion)
4. **User Personas** — 2-3 target personas with pain points, buying behavior, and willingness to pay
5. **Revenue Models** — 2-3 candidate models with unit economics and assumptions
6. **Unfair Advantages** — What gives you a defensible edge (network, technology, data, brand)?
7. **Risk Register** — CRITICAL risks that could invalidate the thesis (market shrinkage, new entrant, regulatory)
8. **Go/No-Go Recommendation** — Explicit recommendation with confidence level

### Design Decisions

- **Fact-based tone.** Explorer calls out unfounded assumptions. "This claim about addressable market comes from the founder's LinkedIn, not from industry data" is a valid comment.
- **Sources always cited.** Every TAM number, every competitive claim, every persona insight includes a source (URL, document, analysis).
- **Conservative estimates.** When TAM is unknowable, Explorer estimates low and documents the methodology.
- **Competitive analysis is structural, not emotional.** Explorer doesn't say "Competitor X is bad." It says "Competitor X charges $200/month but has 15% customer churn, suggesting pricing-elasticity issues in their customer segment."
- **Risk register is comprehensive.** Not just "market risk" but regulatory, technological, dependency, and talent risks.

### Customisation

Explorer is designed for B2B SaaS but works for any market. Adapt the revenue model section for your space (subscription → transactions → licensing → freemium + premium, etc.). Add domain-specific competitive criteria if your space has unique dynamics (healthcare regulatory approval timelines, crypto custody requirements, real estate zoning constraints).

---

## Agent 2: Architect Agent (System Design)

### Why This Agent Exists

A well-designed system can be built 10x faster than a poorly-architected one. But architecture decisions are high-consequence and hard to reverse after coding starts. An Architect agent enforces decision discipline: explicit tech stack choices, documented trade-offs, API contracts defined before implementation, deployment topology designed for your constraints (team size, infrastructure budget, regulatory requirements).

### Configuration

```yaml
name: architect
model: opus
tools:
  - read           # Parse PRDs, existing architecture docs
  - glob           # Find similar patterns in codebase
  - grep           # Search for tech decisions, config files
  - web_fetch      # Fetch framework docs, architecture references
max_turns: 15
```

**Why Opus?** Architecture is holistic—it touches frontend, backend, data layer, infrastructure, security. Opus handles the cross-cutting decisions and trade-off analysis required.

**Why 15 turns?** Architecture decisions benefit from multiple passes. Turn 1-3: tech stack options and trade-offs. Turn 4-8: system diagram and API contracts. Turn 9-12: data model, auth flows, deployment. Turn 13-15: security model and runbook drafting. Each pass builds on prior decisions.

### What the Architect Outputs

An **Architecture Decision Record (ADR)** with sections:

1. **System Diagram** — ASCII diagram or reference to visual tool showing services, data flows, external dependencies
2. **Tech Stack Matrix** — Framework choices (frontend, backend, DB, caching, job queue, etc.) with rationale per choice
3. **API Endpoints** — All backend endpoints defined: method, path, request/response schema, error handling
4. **Database Schema** — Entity-relationship diagram, primary schema tables, indexes, migrations strategy
5. **Authentication Flow** — How users/services authenticate, token lifetimes, session management, permission model
6. **Deployment Topology** — Where code runs (cloud provider regions, containers, serverless, self-hosted), traffic routing, scaling strategy
7. **Security Controls** — Encryption (transport, at-rest), secrets management, rate limiting, audit logging, threat model
8. **Scalability & Performance** — Load testing assumptions, expected QPS, latency targets, cache strategy, CDN usage
9. **Observability** — Logging, metrics, tracing, alerts, what you'll monitor in production
10. **Trade-offs & Justification** — Every major choice includes explicit trade-offs and why you chose this path

### Design Decisions

- **Default stack documented.** Frontend (static hosting, CDN), backend (containerised, auto-scaling), database (primary + read replicas), reverse proxy (SSL termination, routing), monitoring (structured logging, metrics, distributed tracing).
- **Opinionated but justified.** The Architect doesn't present 10 equal options. It recommends a primary path and documents why it beats alternatives.
- **No "future-proofing."** Architect designs for today's scale and team size, not speculative 10x growth. You can refactor when you hit that growth.
- **Every choice documents assumptions.** "We assume <100 concurrent users, so we don't need a message queue" is explicit. If that assumption breaks, you know where to refactor.
- **Deployability is first-class.** The ADR includes a deployment checklist: staging → smoke tests → production promotion. Deployment risk is a design consideration, not an afterthought.

### Customisation

The default stack (Vercel frontend, Docker backend, SQLite/Postgres, Caddy) is optimised for solo developers or small teams. If you're on AWS, GCP, or have different constraints (low-latency gaming, real-time data, IoT), adapt the stack section. The structure and decision discipline apply everywhere.

---

## Agent 3: Gatekeeper Agent (Quality Validation)

### Why This Agent Exists

It's 2 AM. You're excited about your product. You've built architecture and now you want to code. **Don't.** A Gatekeeper agent forces a go/no-go decision before you spend builder time. If your PRD is 60% complete or your architecture has unresolved security risks, the Gatekeeper blocks. This saves weeks of rework.

### Configuration

```yaml
name: gatekeeper
model: haiku
tools:
  - read           # Parse PRD and ADR
  - glob           # Verify all required documents exist
  - grep           # Check for required sections
max_turns: 5
```

**Why Haiku?** Gatekeeper is a validation agent, not a creative one. It checks against a rubric. Haiku is fast and cheap—you'll run gates frequently, and you don't need Opus reasoning for checkboxes.

**Why 5 turns?** Gatekeeper is binary. Turn 1: read PRD and ADR. Turn 2-3: validate against checklist. Turn 4-5: generate gate report. If something fails, the report tells you exactly what to fix, and you run the gate again.

### What the Gatekeeper Outputs

A **Gate Report** with:

1. **Overall Result** — PASS or FAIL (binary, no partial credit)
2. **PRD Validation Scorecard** — % complete on: problem statement, user personas, success metrics, constraints, timeline, dependencies
3. **Architecture Validation Scorecard** — % complete on: tech stack choices, API contracts, data model, deployment topology, security model, scaling assumptions
4. **Risk Assessment** — All CRITICAL risks from PRD and ADR registered and have mitigations (blockers if not)
5. **Feasibility Check** — Are there unknown unknowns? Unproven technologies? Missing team skills?
6. **Remediation Steps** — If FAIL, exact sections to rework and what the Gatekeeper expects

### Design Decisions

- **90% is the threshold.** Gate checks are binary. ≥90% complete and all CRITICAL risks mitigated = PASS. <90% or unmitigated CRITICAL risks = FAIL. No negotiation.
- **CRITICAL vs. MAJOR distinction is important.** A MAJOR risk (scaling above 100k users) doesn't block. A CRITICAL risk (unresolved auth model) does.
- **Gatekeeper is supportive, not punitive.** The report tells you exactly what to fix so you can rerun it. This is enabling, not blocking.
- **Gatekeeper doesn't block you shipping later.** It only blocks you from moving to implementation. You can ship without 100% ADR detail, but you won't after going through the builder phase.

### Customisation

The 90% threshold is firm, but the rubric is customisable. If you're shipping an MVP, you might create a "Minimum Gate" with lighter criteria (60% PRD, 70% ADR). If you're enterprise software, add security and compliance sections. The discipline is more important than the exact criteria.

---

## Agent 4: Builder Agent (Implementation)

### Why This Agent Exists

The Builder is a Test-Driven Development agent. It reads the ADR, breaks it into feature branches, writes tests first, implements, refactors, and verifies coverage. This is slow and deliberate by design. Fast coding creates debt. Deliberate coding creates shipping velocity.

### Configuration

```yaml
name: builder
model: opus
tools:
  - read           # Read ADR, existing code
  - glob           # Find test patterns, source files
  - grep           # Search existing code for patterns
  - bash           # Run tests, compile, commit
  - edit           # Modify existing files
  - write          # Create new files
max_turns: 20
```

**Why Opus?** Building systems requires sustained reasoning across multiple files, refactoring decisions, and architectural discipline.

**Why 20 turns?** Implementation is iterative. Turn 1-2: parse ADR. Turn 3-5: write tests for first feature. Turn 6-10: implement and refactor. Turn 11-15: second feature, same cycle. Turn 16-20: integration, cleanup, final commit.

### What the Builder Produces

Working, tested code with:

1. **Feature branches** — One feature per branch, atomic commits with clear messages
2. **Tests first** — Unit tests written before implementation, covering happy path and error cases
3. **Implementation** — Clean code that reads like well-written prose
4. **Refactoring** — Extracted common patterns, named constants, removed duplication
5. **Coverage report** — Verification that code meets ≥80% line coverage
6. **Commit log** — Clear, atomic commits with context

### Design Decisions

- **TDD is non-negotiable.** Tests written before code. If you can't write a test for it, you can't build it.
- **No `any` types, no `unwrap()` in library code.** Explicit types and error handling. These constraints force you to think about failure modes upfront.
- **No secrets in source.** All credentials, API keys, database credentials in environment variables or secrets management. Builder verifies this before committing.
- **Atomic commits.** Each commit should be independently useful and deployable. Avoid "WIP: refactoring" commits.
- **Code reads like prose.** Variable names, function names, error messages should be clear enough to understand without comments.

### Customisation

The TDD discipline is language-agnostic. Adapt the test framework and style guide to your stack. If you're building iOS, use XCTest. If you're Node, use Jest. The discipline is the same: tests first, implementation second.

---

## Agent 5: Code Reviewer Agent (Adversarial Review)

### Why This Agent Exists

You've built something. You think it's good. A Code Reviewer agent reads your code as an adversary: What edge cases did you miss? What security vulnerabilities are lurking? What performance issues will bite you in production? What naming choices will confuse future you?

### Configuration

```yaml
name: code_reviewer
model: sonnet
tools:
  - read           # Read implementation
  - glob           # Find test files, related code
  - grep           # Search for patterns, anti-patterns
max_turns: 10
```

**Why Sonnet?** Code review is fast reasoning. Sonnet is fast and precise—it catches bugs and security issues without the overhead of Opus.

**Why 10 turns?** Review converges in 5-7 turns. Turn 1-2: read code and tests. Turn 3-5: check correctness (edge cases, error handling). Turn 6-7: check security and performance. Turn 8-10: maintainability and style.

### What the Code Reviewer Outputs

A **Code Review Report** with:

1. **Overall Verdict** — APPROVE or REQUEST CHANGES
2. **Correctness Check** — Edge cases, boundary conditions, error handling, type safety
3. **Security Check** — Injection vulnerabilities, authentication/authorisation bypass, data exposure, secrets in logs
4. **Performance Check** — N+1 queries, unbounded loops, memory leaks, cache hits/misses
5. **Maintainability Check** — Naming, testability, documentation, adherence to style guide
6. **Findings** — Each finding has: description, severity (BLOCKER/MAJOR/MINOR/SUGGESTION), suggested fix, why it matters

### Design Decisions

- **Severity is clear.** BLOCKER = shipping is blocked. MAJOR = must fix before shipping. MINOR = should fix before next version. SUGGESTION = nice-to-have.
- **Every finding includes a fix.** Don't just point out the problem. Suggest concrete code changes.
- **Reviewer is constructive.** This isn't about ego. The tone is "I see where you're going, here's what I'd watch out for."
- **Reviewer looks for patterns, not just instances.** If there's one SQL injection risk, there's probably more. Reviewer flags the pattern and asks for systematic fixes.

### Customisation

The checklist (correctness, security, performance, maintainability) is general. Add language-specific or domain-specific checks. If you're building cryptography, add crypto-specific security checks. If you're building real-time systems, add concurrency and race condition checks.

---

## Agent 6: Combined Reviewer Agent (Phase 5: Security + Coverage + Design)

### Why This Agent Exists

Code Review is one lens. But shipping requires three: security (OWASP Top 10, dependency vulnerabilities, secrets), test coverage (80%+ coverage, test quality, regression coverage), and design (WCAG accessibility, responsive design, error states, loading states). Combined Reviewer does all three in one comprehensive audit.

### Configuration

```yaml
name: combined_reviewer
model: sonnet
tools:
  - read           # Read source, tests, HTML, CSS
  - glob           # Find all code files, test files, design assets
  - grep           # Search for patterns, dependencies, security risks
  - bash           # Run coverage tools, security scanners
max_turns: 12
```

**Why Sonnet?** Three-pass review doesn't require Opus-level reasoning, but it does require speed and precision. Sonnet handles three thorough passes in 12 turns.

**Why 12 turns?** Three independent passes: Turn 1-4 (security), Turn 5-8 (coverage), Turn 9-12 (design). Each pass is complete and independent.

### What the Combined Reviewer Outputs

A **Combined Review Report** with:

**Pass 1: Security Audit**
- OWASP Top 10 checklist (injection, broken auth, XSS, CSRF, etc.)
- Dependency scanning (known vulnerabilities in libraries)
- Secrets detection (hardcoded credentials, API keys, database passwords)
- Auth flow review (token handling, CORS, rate limiting)
- Findings with severity and remediation

**Pass 2: Test Coverage Validation**
- Coverage percentage (line, branch, function)
- Coverage quality (are tests actually asserting, or just running code?)
- Regression test coverage (do tests cover previous bugs?)
- Edge case testing (boundary conditions, error paths, concurrency)
- Findings: gaps and recommendations

**Pass 3: Design & Accessibility Audit**
- WCAG 2.1 AA checks (colour contrast, keyboard navigation, screen reader support)
- Responsive design (mobile, tablet, desktop breakpoints)
- Loading states (what users see while data loads)
- Error states (clear, actionable error messages)
- Empty states (what users see when there's no data)

### Design Decisions

- **Three independent passes prevent overlap.** Security reviewer doesn't review design. Coverage reviewer focuses on test quality, not security. This specialisation keeps findings focused.
- **WCAG 2.1 AA is the bar.** Not AAA (nice-to-have). Not unvalidated accessibility claims. Level AA is the legal/ethical minimum.
- **Test quality > coverage percentage.** 80% coverage with weak assertions is worse than 60% coverage with rigorous assertions. Reviewer assesses both.
- **Security findings are strict.** If you're shipping user data, CSRF protection is non-negotiable. If you're shipping auth, rate limiting is non-negotiable.

### Customisation

Add compliance-specific audits if you operate in regulated spaces. Healthcare (HIPAA), finance (SOC 2), EU (GDPR) all require additional checks. Add them as Pass 4, 5, 6.

---

## Agent 7: Deployer Agent (Infrastructure)

### Why This Agent Exists

Your code is built and reviewed. Now you need to ship it. This is where most solo builders fail. Deployer automates the infrastructure, CI/CD, and deployment choreography: staging first, smoke tests, production promotion, health checks, runbooks, rollback procedures.

### Configuration

```yaml
name: deployer
model: opus
tools:
  - read           # Read ADR, code, deployment config
  - glob           # Find docker files, env templates, CI config
  - grep           # Search for secrets, hardcoded config
  - bash           # Run deployments, health checks, logs
  - web_fetch      # Check deployed service health
max_turns: 12
```

**Why Opus?** Deployment choreography is complex. You need to coordinate frontend, backend, database migrations, DNS, SSL, health checks. Opus handles the multi-step reasoning.

**Why 12 turns?** Turn 1-2: read ADR and code. Turn 3-4: set up CI/CD. Turn 5-7: staging deployment and smoke tests. Turn 8-10: production promotion. Turn 11-12: health check validation and runbook.

### What the Deployer Outputs

A **Deployment Guide** with:

1. **Deployment Topology** — Where each service runs, traffic routing, scaling rules
2. **CI/CD Configuration** — Build steps, test gates, promotion rules, rollback triggers
3. **Environment Variables Template** — All configuration, example values (no secrets)
4. **DNS & SSL Setup** — Domain routing, certificate management, renewal automation
5. **Health Checks** — Liveness probe, readiness probe, alerting rules
6. **Monitoring Setup** — Log collection, metrics, traces, alert thresholds
7. **Rollback Procedure** — How to revert a bad deployment, when to do it, runbook
8. **Runbook** — Day-1 operational tasks: starting services, viewing logs, debugging

### Design Decisions

- **Automate everything.** No manual steps. If you can't script it, you'll do it wrong at 3 AM.
- **Staging before production.** Deployer runs the exact deployment sequence on staging first, then promotes to production only after smoke tests pass.
- **Never deploy on a Friday.** Or Monday after a long weekend. Deployer respects operational discipline.
- **Health checks are paranoid.** Liveness (is it still running?) and readiness (is it ready to accept traffic?) are separate. You catch cascading failures before they spread.
- **Rollback is instant.** Deployer can revert to the previous version in <2 minutes. This removes the fear from deployments.

### Customisation

The deployment model assumes managed infrastructure (Vercel for frontend, Docker for backend). If you're shipping to AWS, GCP, or bare metal, adapt the scripts. The discipline is the same: automate, test in staging, promote to production, monitor relentlessly.

---

## How Agents Hand Off to Each Other

The pipeline is sequential but not linear. Each agent's output feeds into the next.

```
Explorer → Opportunity Brief
         ↓
         → Architect reads brief, designs system
         ↓
         → Architect outputs ADR
         ↓
         → Gatekeeper validates PRD + ADR
         ↓
         → Gatekeeper gates (PASS/FAIL)
         ↓
         → Builder reads approved ADR, implements
         ↓
         → Builder produces code + tests
         ↓
         → Code Reviewer audits code
         ↓
         → Code Reviewer gates (APPROVE/REQUEST CHANGES)
         ↓
         → Combined Reviewer passes 1-3 (security + coverage + design)
         ↓
         → Combined Reviewer gates (PASS/FAIL)
         ↓
         → Deployer reads approved code + ADR
         ↓
         → Deployer produces runbook + deploys staging
         ↓
         → Deployer promotes to production
```

Each handoff is a document. The downstream agent reads that document and continues. This creates an audit trail: who decided what, when, and why.

---

## Using the Agent Team in Practice

### Solo Developer (You're All Seven)

Start with Explorer to validate the market. Then Architect. Then all three gates (Gatekeeper, Code Reviewer, Combined Reviewer). Then Deployer. The full pipeline takes 2-3 weeks for a MVP.

### Small Team (3-5 people)

One person might be Explorer + Architect. One person might be Builder. Another might be reviewer. The agents guide who does what and when. The Gatekeeper blocks bad work before it costs engineering time.

### Scaling (10+ people)

Explorer is research-only. Architects work in squads (each squad has one). Builders implement. Code review is peer + agent. Combined review is security + QA + design specialists. Deployer is SRE-owned. The agents scale the process without centralising decisions.

### Using Individual Agents

You don't need the full pipeline to benefit. Run Explorer when you're unsure about market fit. Run Architect when you need design clarity. Run Code Reviewer on existing codebases to catch technical debt. The agents are modular.

---

## Installation & Customisation

### Installation

Copy the agent definitions to your Claude Code project:

```bash
cp -r agents/ ~/.claude/agents/
```

Each agent is a standalone `.claude/agents/{agent_name}.md` file with YAML frontmatter defining tools, model, maxTurns, and system instructions.

### Customisation

Edit the agent files to:
- Change the model (opus → sonnet for faster/cheaper, haiku for simple validation)
- Add/remove tools (read architecture docs first, then decide what other tools you need)
- Adjust max_turns (longer for exploratory agents, shorter for gatekeepers)
- Refine the style and tone (these templates are generic; make them yours)

### Integrating with Your Stack

The agents are stack-agnostic. The default assumes:
- Frontend: static site on a CDN (Vercel, Netlify)
- Backend: containerised service (Docker)
- Database: relational (Postgres) or lightweight (SQLite)
- Reverse proxy: SSL termination, routing (Caddy, Nginx)

If your stack is different (serverless, IoT, mobile-native, real-time), adapt the Architect agent's default stack section. The structure and decision discipline apply everywhere.

---

## Why This Works

The Agent Team approach solves three problems:

1. **Consistency.** Every project goes through the same gates. You can't skip market research or ship without security review just because you're tired. The agents enforce discipline.

2. **Speed.** The agents are *fast*. Gatekeeper's binary gates prevent rework. Builder's TDD catches issues early. Deployer automates away weeks of infrastructure work. You spend less time on meta-work and more on shipping.

3. **Scalability.** This pipeline works for you at 1 person. It still works at 5 people. It still works at 50. You're not inventing process on the fly; the agents embody best practices from teams that scaled.

The cost is deliberateness. You can't skip gates. You can't ship untested code. You can't deploy without a runbook. These constraints feel slow upfront. In month 2 and 3, when you're shipping features without firefighting, they feel like superpowers.

---

## What's Next

This product gives you the templates and the discipline. What you bring is domain expertise and taste. You'll customise these agents for your market, your stack, your constraints. You'll add agents (PM agent for roadmapping? Data agent for analytics?). You'll build a process that reflects how you actually work.

The goal isn't to follow these templates perfectly. The goal is to *think like a team* when you're working alone. These seven agents are a starting point.

Use them. Adapt them. Build on them. Then share what you learn.

---

## Files Included

This product includes 7 agent definition files (Markdown with YAML frontmatter), ready to copy into your `.claude/agents/` directory:

- `explorer.md` — Market research agent
- `architect.md` — System design agent
- `gatekeeper.md` — Quality validation agent
- `builder.md` — TDD implementation agent
- `code_reviewer.md` — Adversarial code review agent
- `combined_reviewer.md` — Security + coverage + design audit
- `deployer.md` — Infrastructure + CI/CD agent

Each file includes: role definition, tool configuration, output format, design decisions, and customisation guidance.

---

## About the Author

Melisia Archimedes is a solo builder and AI researcher focused on agent-native development workflows. The Agent Team approach comes from 3+ years building and shipping products solo, then scaling across small teams. These templates are battle-tested and iterated based on what actually works in practice.
