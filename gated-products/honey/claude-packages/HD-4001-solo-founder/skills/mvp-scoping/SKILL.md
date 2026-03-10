# Skill: MVP Scoping

Use when scoping a minimum viable product. Identifies the smallest feature set that validates the core hypothesis, cuts everything else, and defines launch criteria.

## Trigger

Invoke this skill when the user wants to scope an MVP, is planning a v1, or has a feature list that needs ruthless trimming.

## Process

1. **Identify the core hypothesis.** What is the one thing this product must prove? Write it as: "We believe [user] will [action] because [reason]."

2. **List all proposed features.** Get everything on the table — the user's full wish list.

3. **Apply the MVP filter.** For each feature, ask: "Can we validate the core hypothesis without this?" If yes, cut it. No exceptions.

4. **Categorise what remains:**
   - **Must have** — Cannot launch without it. Directly validates the hypothesis.
   - **Should have** — Improves the experience but not required for validation.
   - **Won't have (yet)** — Everything else. Explicitly listed so nothing sneaks back in.

5. **Define launch criteria.** What specific outcome means the MVP succeeded?
   - Quantitative: "10 users complete the core flow in week 1"
   - Qualitative: "3 users say they would pay for this"

6. **Estimate build time.** The MVP should be buildable in 1-2 weeks by one person. If the estimate exceeds 2 weeks, scope is too large — cut more.

## Output Template

```markdown
# MVP Scope: [Product Name]

**Date:** [YYYY-MM-DD]
**Core Hypothesis:** We believe [user] will [action] because [reason].

## Must Have (Launch Blockers)
- [ ] [Feature 1] — [1-sentence justification]
- [ ] [Feature 2] — [1-sentence justification]

## Should Have (Week 2)
- [ ] [Feature 3]
- [ ] [Feature 4]

## Won't Have (Yet)
- [Feature 5] — Reason for cutting
- [Feature 6] — Reason for cutting

## Launch Criteria
- [ ] [Quantitative goal]
- [ ] [Qualitative goal]

## Build Estimate
- Must Have features: [X] days
- Target launch date: [YYYY-MM-DD]
```

## Rules

- The "Must Have" list should contain 3-5 items maximum. If it has more than 5, the scope is too large.
- Auth, payments, and admin dashboards are almost never MVP features. Challenge any inclusion.
- If the user insists on keeping a cut feature, ask: "What will you cut instead to stay within 2 weeks?"
- Save the scope document to `docs/mvp-scope.md`.
