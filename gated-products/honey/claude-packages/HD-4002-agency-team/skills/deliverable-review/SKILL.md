# Skill: Deliverable Review

Use when reviewing a deliverable before handing it off to the client. Checks quality, completeness, presentation, and readiness for client consumption.

## Trigger

Invoke this skill when a feature or milestone is complete and ready for client review. Run this before every client-facing delivery.

## Review Checklist

### 1. Acceptance Criteria
- Read the original spec or user story
- Verify each acceptance criterion is met
- Flag any criteria that were modified during implementation (and ensure the client approved the change)

### 2. Functional Quality
- Run the full test suite — all tests must pass
- Test the happy path manually
- Test at least 2 edge cases per feature
- Verify error states show user-friendly messages (not stack traces or raw error codes)
- Check loading states and empty states

### 3. Visual Quality
- Compare implementation against design mockups (if provided)
- Check responsive behaviour at 375px, 768px, and 1440px widths
- Verify consistent spacing, typography, and colour usage
- Check dark mode if applicable

### 4. Code Quality
- No debug statements (console.log, print, debugger)
- No commented-out code
- No hardcoded values that should be configuration
- No TODO comments without associated tracked issues
- Dependencies are up to date and free of known vulnerabilities

### 5. Documentation
- README includes setup and run instructions
- API endpoints are documented (if applicable)
- Environment variables are listed in `.env.example`
- Any complex business logic has inline comments explaining "why"

### 6. Presentation
- Demo script prepared (step-by-step walkthrough for the client)
- Known limitations documented honestly
- Next steps clearly outlined

## Output

Generate a review report at `clients/[client-slug]/docs/reviews/review-[YYYY-MM-DD].md`:

```markdown
# Deliverable Review: [Feature/Milestone]
**Date:** [YYYY-MM-DD]
**Reviewer:** [Name]

## Verdict: Ready / Needs Work / Blocked

## Acceptance Criteria: [X/Y] met

## Issues Found
| # | Severity | Description | Status |
|---|----------|-------------|--------|
| 1 | High     | [Issue]     | Open   |

## Recommendation
[Ship as-is / Fix issues first / Needs rework]
```

## Rules

- A deliverable with any Critical or High severity issue is "Needs Work" — no exceptions.
- Do not soften the review for deadline pressure. A bad deliverable damages the agency's reputation more than a delayed one.
- If the deliverable significantly deviates from the agreed scope, flag it — even if the result is better. The client approved a specific scope.
