# Command: /triage

Systematically triage open issues in the repository.

## Usage

```
/triage
```

## Process

### Step 1: Gather Open Issues
List all open issues without labels or with the `needs-triage` label. Sort by creation date (oldest first).

```bash
# If using GitHub CLI
gh issue list --state open --label "needs-triage" --limit 50
# Or list unlabelled issues
gh issue list --state open --limit 50 --json number,title,labels,createdAt
```

### Step 2: For Each Issue, Determine

1. **Type:** bug / feature / docs / question / duplicate
2. **Priority:** critical / high / medium / low
3. **Component:** which part of the project is affected
4. **Actionability:** Can someone act on this now, or is more info needed?
5. **First issue:** Is this suitable for `good first issue` labelling?

### Step 3: Check for Duplicates
For each issue, search existing issues (open and closed) for similar reports:

```bash
gh issue list --state all --search "[key terms from issue]" --limit 10
```

If a duplicate is found, link the original and close the duplicate with a polite message.

### Step 4: Apply Labels and Respond

For each triaged issue:
- Apply appropriate labels
- Add a comment acknowledging the report
- Assign to a milestone if appropriate
- If more info is needed, ask specific questions (not "can you provide more info?")

### Step 5: Generate Triage Summary

```markdown
# Triage Summary — [YYYY-MM-DD]

## Processed: [X] issues

| # | Title | Type | Priority | Action Taken |
|---|-------|------|----------|--------------|
| 42 | Crash on startup | bug | critical | Labelled, assigned to v2.1.1 |
| 43 | Add dark mode | feature | medium | Labelled, added to backlog |
| 44 | Typo in README | docs | low | Labelled 'good first issue' |

## Duplicates Closed: [X]
## Needs Info: [X]
## New 'Good First Issues': [X]
```

## Rules

- Process issues in chronological order. Older issues first.
- Never close an issue without an explanation.
- If unsure about priority, default to medium and flag for maintainer review.
- Spend a maximum of 2 minutes per issue during triage. Deep investigation happens later.
