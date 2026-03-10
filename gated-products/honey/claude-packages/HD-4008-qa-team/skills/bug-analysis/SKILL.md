# Bug Analysis Skill

Use when analysing bug reports. Identifies root cause, suggests fix approach, assesses blast radius, recommends regression tests.

## When to Activate

- User asks to "investigate a bug", "find the root cause", or "why is this breaking?"
- The `/triage` command is invoked
- User reports unexpected behaviour and wants to understand why

## Process

1. **Reproduce the understanding.** Before investigating code:
   - Clarify the exact steps that trigger the bug
   - Understand the expected vs actual behaviour
   - Identify the environment and conditions (browser, OS, data state)
   - Determine if the bug is consistent or intermittent

2. **Locate the affected code.** Search systematically:
   - Start from the user-facing symptom and trace inward
   - Search for function names, error messages, or UI text mentioned in the report
   - Check recent git changes to the affected area
   - Look at related tests — do they cover this scenario?

3. **Identify the root cause.** Distinguish between:
   - **Proximate cause** — The line of code that produces the wrong result
   - **Root cause** — The underlying reason the bug exists (missing validation, wrong assumption, incomplete specification, race condition)
   - **Contributing factors** — Things that made the bug harder to catch (missing tests, unclear requirements, complex code)

4. **Assess blast radius.** Determine what else is affected:
   - What other features use the same code path?
   - What other data could be affected by the same bug?
   - Is the bug in shared code (utility function, base class, middleware)?
   - Could the fix introduce new issues elsewhere?

5. **Suggest fix approach.**

```markdown
## Root Cause Analysis

### Symptom
[What the user sees]

### Proximate Cause
[The specific code that is wrong]
File: [path:line]

### Root Cause
[Why the code is wrong — the underlying issue]

### Blast Radius
- **Directly affected:** [features/components using the same code path]
- **Potentially affected:** [features that share related logic]
- **Not affected:** [features confirmed safe]

### Recommended Fix
[Specific approach with rationale]
- Option A: [approach] — Pros: [X] Cons: [Y]
- Option B: [approach] — Pros: [X] Cons: [Y]
- Recommended: [A or B] because [reason]

### Regression Tests Needed
1. [Test for the specific bug scenario]
2. [Test for blast radius scenarios]
3. [Test for edge cases related to the root cause]
```

6. **Verify the analysis.** Before presenting:
   - Does the root cause fully explain the symptom?
   - Does the proposed fix address the root cause (not just the symptom)?
   - Could the same class of bug exist elsewhere in the codebase?
   - Are the recommended tests sufficient to catch the bug and prevent regression?

## Anti-patterns

- Do not assume the first suspicious code you find is the root cause. Verify the causal chain.
- Do not suggest a fix that only addresses the symptom. Fix the root cause.
- Do not forget the blast radius assessment. Bugs in shared code are never isolated.
- Do not skip regression test recommendations. A bug found once will be introduced again without tests.
