---
title: "Operator Kit PRD Template — Product Requirements Document for AI Development Frameworks"
author: Melisia Archimedes
collection: C7-dev-mastery
tier: doctrine
price: 9.99
version: 1.0
last_updated: 2026-03-09
audience: developers
hive_doctrine_id: HD-0062
---

# Operator Kit PRD Template

A reusable product requirements document template, demonstrated through a real example: the Operator Kit itself. This doctrine provides the structure, commentary, and a fully worked example so you can spec any product with clarity and rigour.

## The Problem

You're building something—a library, a tool, a framework—and you know it needs to be clearly defined before you start building. But PRDs vary wildly. Some are 2 pages of vibes. Others are 40 pages of administrative overhead. Most skip the bits that actually matter: success metrics, user stories with acceptance criteria, and a clear gate between planning and build.

Result: You start coding without a shared understanding of what success looks like. Halfway through, the design changes because you discovered an edge case nobody mentioned. Your code review is bloated because there's no acceptance criteria to measure against. You ship something that technically works but doesn't actually solve the problem.

A tight PRD isn't red tape. It's the difference between shipping what you meant to ship versus shipping what you accidentally coded.

## The Solution

This doctrine gives you a PRD template with seven sections, commentary on each, and a complete, filled-in example (the Operator Kit). Copy the structure. Use the commentary to understand *why* each section matters. Read the example to see how real constraints, user stories, and quality gates translate to words on a page.

### What You Get

1. **Template structure** — Seven sections that cover everything you need before Phase 4 (Build)
2. **Section commentary** — Why each section exists and what to put in it
3. **Complete worked example** — The Operator Kit PRD, annotated, showing how a real product was spec'd
4. **Reusable checklist** — Acceptance criteria and quality gates adapted for any product type

---

## The Template

### 1. Product Goal

*Start here. One paragraph, maximum.*

Answer: What does this product do, who buys it, and why? Avoid marketing fluff. This is a shared understanding, not a sales page.

**Example from Operator Kit:**

> Operator Kit is a drop-in `.claude/` folder configuration that turns Claude Code into a structured 8-agent development team with enforced quality gates. It ships as a zip file, installs in under 5 minutes, and requires no coding, no dependencies, and no backend infrastructure to operate.
>
> Target buyer: Solo developers and AI operators using Claude Code who want to ship production-quality SaaS products without a team.
>
> Core value proposition: Stop vibe coding. Start shipping structured, reviewed, gate-approved products — with Claude Code running the whole pipeline.

**Why it works:** It's specific (zip file, 5 minutes, no dependencies), it names a buyer (solo developers and AI operators), and it frames the value as a problem solved (stop vibe coding → start shipping).

---

### 2. Success Metrics

*Define how you'll know if the product succeeded. Two tiers: launch targets and quality gates.*

**Launch targets** measure commercial success in the first 90 days: units sold, revenue, testimonials, refund rate, time to first use. Make them measurable and specific.

**Quality gates** measure whether the product is ready to ship: all smoke tests pass, install works, documentation is complete. These block launch if they fail.

**Example from Operator Kit:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Sales** | 50 units in first 30 days | Gumroad dashboard |
| **Revenue** | $2,500 gross in first 90 days | Gumroad + Stripe reports |
| **Testimonials** | 5 verified testimonials within 60 days | Gumroad reviews / Twitter DMs |
| **Refund rate** | <5% | Gumroad refund data |
| **Time-to-first-use** | Buyer runs `/discover` within 30 mins of install | Qualitative (survey/DMs) |

**Quality gates:**
- Install test: Kit installs cleanly into a blank project with zero errors
- Cold start: `/discover` runs in a fresh install with no prior context
- Pipeline test: All 6 slash commands execute without errors
- CLAUDE.md test: Non-technical user completes template in under 10 minutes
- Docs test: README quick-start followed without external documentation

**Why it works:** Launch targets are concrete enough to track; quality gates are binary (pass/fail) so you know when you're done.

---

### 3. User Stories

*Break the product into scenarios. Each story has acceptance criteria (the pass/fail test).*

Write stories for your primary personas. Include 2–3 stories per persona. Use the format: "As [persona], I want [action] so that [benefit]."

Acceptance criteria are the contract between spec and code. If the built feature passes all acceptance criteria, the story is done.

**Example from Operator Kit — two of five stories:**

**Persona A — AI Operator**

> As an AI operator, I want to drop a `.claude/` folder into my existing project so that I get a structured development pipeline without building one from scratch.
>
> **Acceptance criteria:**
> - Copy `.claude/` folder to project root → Claude Code immediately recognises agents and commands
> - No additional configuration required for basic usage
> - Existing files in the project are unaffected by the install

**Persona B — Solo SaaS Founder**

> As a solo SaaS founder with no CS background, I want the CLAUDE.md template to guide me through describing my project context so that the agents give me relevant, accurate output.
>
> **Acceptance criteria:**
> - CLAUDE.md template has clear labels on every section
> - Each section has a brief description of what to write (1 sentence)
> - Completing the template takes under 10 minutes for a non-technical user
> - Agents produce noticeably better output when CLAUDE.md is filled vs blank

**Why it works:** Acceptance criteria are testable. You can show a user the template, time them, and know instantly if they pass. No ambiguity.

---

### 4. Acceptance Criteria — Shippable Checklist

*The binary gate. All items must be ✓ before you ship.*

Separate into logical sections (file bundle, genericisation, templates, install script, smoke test, etc.). Make every item checkbox-testable: "Does this file exist?" "Can I run this command?" not "Is this good enough?"

**Example sections from Operator Kit:**

**File Bundle**
- [ ] `.claude/agents/` contains exactly 7 agent files
- [ ] `.claude/commands/` contains exactly 6 command files
- [ ] `.claude/settings.json` contains no server-specific references, no personal credentials
- [ ] No file contains: an IP address, a personal API key, a wallet address

**Genericisation**
- [ ] `agents/architect.md` contains no user-specific refs
- [ ] All skills reference generic infrastructure (Vercel, Coolify, PocketBase)

**End-to-End Smoke Test**
- [ ] Fresh project directory: `mkdir test-project && cd test-project`
- [ ] Fill in CLAUDE.md (5 minutes)
- [ ] Open Claude Code in the directory
- [ ] Run `/discover` → brief produced, saved correctly
- [ ] All 6 commands appear in Claude Code's slash command list

**Why it works:** No interpretation. Either the test passes or it doesn't. You know when you're done.

---

### 5. Non-functional Requirements

*The constraints that aren't features but need to be true.*

Compatibility (OS, framework versions), file size, install time, dependencies, platform support, language, performance thresholds. These often matter more to the user than feature lists.

**Example from Operator Kit:**

| Requirement | Specification |
|-------------|---------------|
| **Compatibility** | Claude Code CLI current version (March 2026+); tested on macOS 14+; documented manual install for Windows |
| **File size** | Compressed zip ≤ 500KB; no binaries, no images |
| **Install time** | Manual install: < 2 minutes; with install.sh: < 30 seconds |
| **Dependencies** | Zero — no Node.js, Python, or other runtime required |
| **Platform** | `.claude/` folder is cross-platform; `install.sh` is Unix/macOS only |
| **Language** | Australian English throughout all documentation |

**Why it works:** They become product constraints that guide development. "Zero dependencies" changes your architecture. "500KB max" drives file and documentation choices.

---

### 6. Out of Scope (v1.0)

*The things you explicitly *won't* do yet.*

Be specific. "Custom landing page", "Next.js-specific skill packs", "Video walkthroughs", "npm/npx installer"—not vague like "advanced features" or "future enhancements".

This protects you from scope creep and sets buyer expectations. You can revisit after v1.0 ships.

---

## How to Use This Template

1. **Fill in Section 1 (Product Goal)** in one paragraph. If you can't fit it in one paragraph, your product is too unfocused. Compress it.

2. **Define success (Section 2)** — what does launch success look like in 90 days? What quality gates *must* pass before you build?

3. **Write user stories (Section 3)** for your two main personas. 2–3 stories each. Include acceptance criteria you can test.

4. **Create the shippable checklist (Section 4)**. Make every item testable. If you can't checkbox it, rewrite it.

5. **List non-functional requirements (Section 5)**. File size. Compatibility. Language. Install time. Anything you'll measure against.

6. **Document out of scope (Section 6)** — the features you're not shipping in v1.0. Be specific.

7. **Link supporting docs** (Section 7) — Opportunity Brief, Architecture Decision Record, Gate Report. These live in separate files, not in the PRD.

## Why This Works

This PRD structure enforces a gate between planning and build. You can't start Phase 4 (writing code) until this document is 90% complete and reviewed. It's uncomfortable to enforce—it feels like process overhead—but it catches the problems that cost most to fix later.

Real story: A team skipped the acceptance criteria section because "we all know what we're building". Six weeks later, code review found security holes because the architectural review had never happened. It would've taken 30 minutes to write proper acceptance criteria. Instead, it cost them three weeks of rework.

A tight PRD is the cheapest insurance you can buy.

## Packaging Notes

- **Format:** Plain Markdown, 1,600 words, Australian English
- **Audience:** Solo developers and technical founders building products; suitable for SaaS, developer tools, frameworks, CLIs
- **Reusability:** Copy the template structure directly; sections 1–6 adapt to any product type
- **Integration:** Use alongside your Opportunity Brief (Phase 1) and Architecture Decision Record (Phase 2)
- **Next step after approval:** Proceed to Phase 4 (Build); if PRD is <90% complete, return to this phase and remediate gaps

---

**Author:** Melisia Archimedes
**Collection:** C7-dev-mastery
**Published:** 9 March 2026
