# /triage

Triage bug reports with severity, priority, component assignment, and reproduction analysis.

## Usage

```
/triage "<bug description>" [--component "<component>"] [--reported-by "<source>"]
```

## Behaviour

### 1. Parse the Bug Report

Extract from the description:
- What is broken (the symptom)
- When it happens (the trigger)
- Who is affected (user scope)
- How it was discovered (user report, monitoring, testing)

### 2. Investigate the Codebase

- Search for the affected component in the source code
- Identify recent changes to that area (git log)
- Check for related tests (existing coverage)
- Look for similar patterns elsewhere that might also be affected

### 3. Assess Severity

Based on impact analysis:

| Severity | Criteria |
|----------|----------|
| S1 — Critical | Data loss, security breach, complete feature failure for all users |
| S2 — High | Major feature broken, no workaround, affects many users |
| S3 — Medium | Feature broken with workaround, or affects few users |
| S4 — Low | Cosmetic, minor inconvenience, edge case |

### 4. Assess Priority

Based on urgency:
- P1 if S1 or if blocking other work
- P2 if S2 or affects a current release
- P3 if S3 or can wait for next sprint
- P4 if S4 or very low user impact

### 5. Generate Bug Report

Create a structured bug report:

```markdown
## Bug: [Concise title derived from description]

**Severity:** S[N] — [Justification]
**Priority:** P[N] — [Justification]
**Component:** [Identified component]
**Likely cause:** [Hypothesis based on code investigation]

### Steps to Reproduce
1. [Derived or confirmed steps]

### Expected Result
[What should happen]

### Actual Result
[What actually happens]

### Investigation Notes
- Recent changes to this area: [git log summary]
- Existing test coverage: [coverage status]
- Related code: [file paths]
- Similar patterns at risk: [if any]

### Suggested Fix
[Approach based on code investigation]

### Recommended Regression Tests
- [Test to add to prevent recurrence]
```

### 6. Output

Display the triaged bug report and ask the user to confirm severity and priority before filing.
