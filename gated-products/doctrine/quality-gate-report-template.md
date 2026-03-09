---
title: "Quality Gate Report Template — Binary Pass/Fail Design Review for AI-Assisted Development"
author: Melisia Archimedes
collection: C7-dev-mastery
tier: doctrine
price: 4.99
version: 1.0
last_updated: 2026-03-09
audience: developers
hive_doctrine_id: HD-0065
---

# Quality Gate Report Template

## Problem

You've written a PRD. You've sketched architecture. You've named your team members. You're excited to start coding.

Then halfway through Phase 4, you discover the PRD didn't define acceptance criteria. Or the architecture assumes a feature that's going to take a third person to build. Or you find out three days in that your chosen tech stack has a licensing conflict you didn't anticipate.

Or worse: you find these problems during code review. Or in production.

The standard software engineering answer is: run a design review gate before you write code. Stop, look at the work so far, and ask a binary question: **Are we ready to build, or do we need to fix something first?**

The problem is that design review gates are slow, expensive, and abstract. They live in meeting rooms and Slack threads. They produce 30-page documents that nobody reads. By the time someone writes down the findings, you've already started coding anyway.

What you need is a gate that:
- **Is fast.** 2 hours to run, not 2 weeks.
- **Is concrete.** Uses artefacts you've already built (PRD, ADR, risk register).
- **Is binary.** PASS (90%+) or FAIL (<90%). No ambiguity.
- **Catches real problems.** Problems that would cost you days or weeks to fix later.

This template shows you how.

## Solution

The **Quality Gate Report Template** is a structured design review process that runs before Phase 4 (Build) starts. It's based on a real gate report that caught a missing PRD, a capacity underestimation, and a scope leak—all before a single line of code was written. That gate review took 2 hours. It saved an estimated 2 weeks of rework.

The report uses five scoring sections:

1. **Phase 1 Validation** — Market research, competitive analysis, personas, unfair advantage, risk register.
2. **Phase 2 Validation** — PRD completeness, architecture soundness, API contracts, database schema, deployment, security baseline.
3. **Phase 3 Gate Criteria** — The five binary checks: PRD (≥90%), architecture (≥90%), risk mitigation (all CRITICAL risks have plans), feasibility (no tech unknowns), timeline (effort vs. capacity).
4. **Critical Findings** — Any BLOCKER, MAJOR, or MINOR issues, ranked by severity.
5. **Remediation Steps** — Ordered tasks to fix the issues, with time estimates.

The template includes:
- A blank report structure (copy it, fill it in)
- The worked example showing a FAIL gate (76% score)
- How the gate caught three real issues before build
- How remediation was estimated at 45–60 minutes
- How the projected score after fixes reaches 97% (PASS)

## Key Insights

### The Gate Caught a Missing PRD

The project had an Opportunity Brief (market research) and an Architecture Decision Record (design). Looks good, right? Except nobody had written the PRD—the formal specification of what the product must do to be shippable.

Without a PRD, Phase 4 (packaging) had no definition of done. The builder couldn't test against acceptance criteria because none existed. Success metrics weren't defined.

**If the gate hadn't caught this:** Phase 4 would have finished, the product would have been declared "done", and only then would someone ask, "Wait, what are the success metrics? What does v1 actually need to do?"

Cost to fix later: restart Phase 4. Rework PDR, repackage, retest. Estimated 3–5 days.

Cost to fix at gate: write the PRD. 30 minutes.

### The Gate Surfaced a Capacity Mismatch

The ADR estimated "2 focused sessions of 1.5–2 hours each" to build the product. But the capacity check never happened. Nobody asked: "Do we actually have 3 hours of uninterrupted time next week? Or are we in the middle of a production incident, a maintenance cycle, or a client call?"

**If the gate hadn't caught this:** The team would have started Phase 4, then halfway through Day 1, a production incident would have stopped the work. Sessions would split. Momentum would break. The 2-session estimate would balloon to 4 sessions over a week.

Cost to fix later: context switching, lost momentum, scope creep. Estimated 5–7 days of calendar time.

Cost to fix at gate: check the calendar, confirm capacity, document a contingency. 10 minutes.

### The Gate Resolved an Open Scope Decision

The architecture record flagged an unanswered question: "Does the template need a 'Tech Stack Presets' section in v1?" The ADR leaned against it, but left the question open.

**If the gate hadn't caught this:** During Phase 4, mid-conversation, someone would have said, "Actually, let's add presets. It'll only take 2 hours." Those 2 hours would have expanded to 6. The product would have shipped 2 weeks late. Or it would have shipped without presets, and then v1.1 would have been "added presets" — fragmenting the product line.

Cost to fix later: scope creep, delayed launch, customer confusion. Estimated 1–2 weeks.

Cost to fix at gate: make a binary decision and write it down. 5 minutes.

### Why Binary Gates Matter

The gate is binary: PASS or FAIL. Not "mostly ready" or "good enough to start" or "we'll fix it during development."

This matters because:
- **90% is the threshold.** Not 70%, not 80%. 90%. If you're below, you stop and fix it.
- **No ambiguity.** "Are we above or below 90?" is a question a child can answer. "Is this 'ready enough'?" is a 2-hour argument.
- **Forces completion.** If you know a gate is binary, you finish your artefacts before running it. You don't show up with 70% of a PRD and hope for the best.
- **Prevents the sunk cost trap.** If you run the gate at Phase 2, you can still abandon the project if it fails. If you wait until Phase 4, you've already "invested" too much and you'll ship it anyway.

## Implementation

### Step 1: Copy the Template

Use the blank template included in this file (or find it in the appendix). Populate it as you work through Phase 1, Phase 2, and Phase 3.

### Step 2: Gather the Artefacts

Your gate review needs:
- Opportunity Brief or market research document
- PRD (or a candidate PRD—even if it's incomplete)
- Architecture Decision Record or design brief
- Risk register
- Team capacity calendar (optional but recommended)

You don't need all of these. The gate is flexible. But the more concrete artefacts you bring, the more concrete the findings will be.

### Step 3: Score Each Section

For each criterion in each phase section, ask: "Is this criterion met?" If yes, mark PASS. If no, mark FAIL. If unclear, mark it as a finding.

Add up the passes and fails. Calculate the percentage.

### Step 4: Identify Critical Findings

If any criterion failed, or if you found a gap during review, write it down as a finding. Rate it:
- **BLOCKER** — Gate will FAIL regardless of other scores. (Example: no PRD exists.)
- **MAJOR** — Could cause rework in Phase 4 or later. (Example: capacity not assessed.)
- **MINOR** — Low risk, but worth documenting. (Example: an open ADR question.)

### Step 5: Write Remediation Steps

For each finding, write an ordered list of tasks to fix it. Include time estimates.

### Step 6: Calculate Projected Score

After remediation, estimate the new score. Should reach 90%+.

### Step 7: Make the Go/No-Go Decision

If current score ≥90%: **PASS**. Proceed to Phase 4.

If current score <90%: **FAIL**. Execute remediation steps, then re-run the gate.

**Critical rule:** Do not proceed to Phase 4 if the gate is FAIL. The cost of fixing issues now is always lower than the cost of fixing them mid-build.

## Example: A Real FAIL Gate

Here's the worked example from the real report that inspired this template.

**Project:** Operator Kit v1.0 (a developer workflow framework)

**Date:** 2026-03-06

**Current Score: 76% (FAIL)**

| Phase | Current Score | Status |
|-------|---|--------|
| Phase 1 (Market) | 100% | PASS |
| Phase 2 (PRD + Design) | 86% | ⚠️ At risk |
| Phase 3 Gate Criteria | 60% | FAIL |
| **Overall** | **76%** | **FAIL** |

**Three findings:**

1. **BLOCKER — No PRD Document**
   - The project went straight from Opportunity Brief to architecture, skipping the PRD.
   - PRD is missing: success metrics, user stories, acceptance criteria, non-functional requirements.
   - Impact: Phase 4 has no definition of done. Builder can't verify v1 is shippable.
   - Fix: Write a condensed PRD (30 min).

2. **MAJOR — Capacity Assessment Missing**
   - Timeline estimates "2 sessions" but doesn't validate against current operational load (two live services, infrastructure maintenance).
   - Impact: Could delay Phase 4 or cause context switching and rework.
   - Fix: Check team capacity calendar and document contingency (10 min).

3. **MINOR — Open ADR Question**
   - Architecture record flags: "Does template need presets in v1?" but doesn't formally close the question.
   - Impact: Could lead to scope creep during Phase 4.
   - Fix: Make a binary decision (IN or OUT) and document it (5 min).

**Remediation Path:**

| Task | Time | Outcome |
|------|------|---------|
| Write condensed PRD with metrics, stories, acceptance criteria | 30 min | Phase 2 score: 86% → 100% |
| Close ADR question on presets (recommend OUT) | 5 min | Scope locked |
| Add explicit capacity reservation to timeline | 10 min | Timeline validated |
| Re-run gate check | 10 min | **Projected: 97% (PASS)** |
| **Total** | **45–60 min** | **PASS** |

**Key learning:** The gate caught three issues before any code was written. Had the team skipped the gate and started Phase 4, they would have discovered these issues mid-build—when fixes are 10× more expensive.

## Packaging Notes

### How to Use This Template

1. **For a single project:** Copy the template, fill it in as you go through Phase 1, 2, and 3. Run the gate before Phase 4 starts. Keep the report in your project archive.

2. **For a repeating process:** Save the template into your team's project template folder. Use it for every project that requires a design gate. Over time, you'll build up a library of gate reports—a record of what worked and what didn't.

3. **For a gatekeeping role:** If you're responsible for quality gates across multiple projects or teams, use this template as your standard. Consistency matters. If the first gate is binary and detailed, and the second gate is vague and handwavy, people will trust neither of them.

### What You'll Get

- **Blank template** ready to copy into your project
- **Worked example** showing a FAIL gate and how remediation works
- **Scoring rubric** (the exact criteria for each phase)
- **Instructions** for running the gate (this document)
- **Remediation checklist** format (so you don't lose track of fixes)

### Time Investment

- Running the gate: 2 hours
- Documenting findings: 30 minutes
- Remediation (if needed): 1–4 hours (depends on findings severity)

### What It's Not

This template is not a replacement for code review, testing, or launch readiness checks. It's a pre-build design review. It happens in Phase 3. It stops you from starting Phase 4 with a broken plan. Once you're in Phase 4 (build), you use different gates (test coverage, security scan, code review).

### Next Steps

1. Copy the template into your current project.
2. Gather your Opportunity Brief, PRD draft, and architecture notes.
3. Score each section honestly. Don't inflate scores to reach 90%.
4. If you find findings, write them down with time estimates.
5. If score ≥90%, start Phase 4. If <90%, fix the findings first.
6. Save the completed report. It's part of your project archive and your team's institutional knowledge.

---

## Appendix: Blank Template

```markdown
# Gate Report: [Project Name]

**Phase 3 Gate Check — [Pipeline Name]**
**Date:** [YYYY-MM-DD]
**Artefacts reviewed:**
- [List documents reviewed]

---

## DECISION: [PASS / FAIL]

**Score: [X]% (above or below 90% threshold)**

[1-2 sentence summary of decision and next steps]

---

## Phase 1 Validation — [Brief Name]

**Score: [X]/7 = [X]%** [✅ or ⚠️ or ❌]

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Market size with sources | PASS / FAIL | |
| 3+ competitors analysed | PASS / FAIL | |
| Target persona validation | PASS / FAIL | |
| Problem/solution fit | PASS / FAIL | |
| Revenue model | PASS / FAIL | |
| Unfair advantage | PASS / FAIL | |
| Risk register (4+ items) | PASS / FAIL | |

---

## Phase 2 Validation — PRD + Architecture

**Score: [X]/7 = [X]%** [✅ or ⚠️ or ❌]

| Criterion | Status | Evidence |
|-----------|--------|----------|
| PRD: success metrics, stories, acceptance criteria | PASS / FAIL | |
| Architecture: system diagram, tech stack rationale | PASS / FAIL | |
| API contracts | PASS / FAIL | |
| Database schema | PASS / FAIL | |
| Deployment topology | PASS / FAIL | |
| Security baseline | PASS / FAIL | |
| Go/no-go decision documented | PASS / FAIL | |

---

## Phase 3 Gate Criteria

**Score: [X]/5 = [X]%** [✅ or ❌]

| Criterion | Status | Evidence |
|-----------|--------|----------|
| PRD completeness: ≥90% sections, metrics defined | PASS / FAIL | |
| Architecture soundness: ≥90% decisions justified | PASS / FAIL | |
| Risk mitigation: all CRITICAL risks have action plans | PASS / FAIL | |
| Feasibility: proven tech stack, no unknowns | PASS / FAIL | |
| Timeline: estimated effort vs. capacity assessed | PASS / FAIL | |

---

## Critical Findings

### Finding [N] ([BLOCKER / MAJOR / MINOR])

[Description of issue]

**Why this matters:** [Impact if not fixed]

**Fix:** [Proposed solution and time estimate]

---

## Remediation Steps (Ordered)

[Numbered list with time estimates]

---

## Projected Score After Remediation

| Section | Current | After Remediation |
|---------|---------|------------------|
| Phase 1 | X% | Y% |
| Phase 2 | X% | Y% |
| Phase 3 | X% | Y% |
| **Overall** | **X%** | **Y%** |

Expected outcome: [PASS / FAIL]

---

## Summary

[1–2 paragraph summary of gate outcome, key learning, and next steps]

---

*Gate report saved to: [path]*
```

---

## About the Author

Melisia Archimedes is an AI development systems architect based in Australia. She specialises in design review processes, quality gates, and building decision-making frameworks for AI-assisted teams. She's built gates for crypto trading systems, real-time data pipelines, and developer tools. This template comes from a real project where the gate caught three critical issues before the first line of code was written.

