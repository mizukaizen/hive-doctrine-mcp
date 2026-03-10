# Skill: Pull Request Review

Use when reviewing a pull request. Provides a structured review process that checks code quality, test coverage, breaking changes, and documentation completeness.

## Trigger

Invoke this skill when the user asks to review a PR, when a new PR is opened, or when using the reviewer agent.

## Process

### 1. Understand the PR
- Read the PR description and linked issue
- Understand the intent: What problem does this solve?
- Check the size: If over 500 changed lines, recommend splitting

### 2. Review the Diff
Go through every changed file. For each file, check:

**Correctness:**
- Does the logic correctly solve the stated problem?
- Are edge cases handled (null, empty, boundary values)?
- Are concurrent access patterns safe?

**Breaking Changes:**
- Any public API signature changes?
- Any removed or renamed exports?
- Any changed default values or behaviour?
- Any modified configuration format?

If breaking changes are found, verify:
- The PR title or description acknowledges the breaking change
- A migration path is documented
- The version will be bumped appropriately (major)

**Test Coverage:**
- New features have corresponding tests
- Bug fixes include a regression test
- Tests actually assert meaningful behaviour (not just "does not throw")

**Documentation:**
- Public API changes reflected in docs
- README updated if user-facing behaviour changed
- Inline comments for non-obvious logic

### 3. Write the Review

```markdown
## Review Summary

**PR:** #[number] — [title]
**Verdict:** Approve / Request Changes / Comment

### Breaking Changes
[List or "None detected"]

### Must Fix
- [ ] [File:line] — [Issue description and suggestion]

### Should Fix
- [ ] [File:line] — [Issue description and suggestion]

### Nits
- [File:line] — [Optional improvement]

### Positives
- [What the contributor did well]
```

### 4. Apply the Review
If using GitHub CLI:
```bash
gh pr review [number] --approve
# or
gh pr review [number] --request-changes --body "Review comments..."
```

## Rules

- Every review must include at least one positive observation.
- Use "we" language, not "you should."
- Ask questions before making demands — the contributor may have context you lack.
- Never approve with failing CI.
- If the PR is a first contribution, be extra welcoming and patient.
