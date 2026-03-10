# /new-engagement

Set up a new consulting engagement with all required scaffolding.

## Usage

```
/new-engagement "<engagement name>" [--client "<client name>"] [--duration "<timeline>"]
```

## Behaviour

When invoked, create the following engagement structure:

### 1. Directory Structure

Create the engagement directory under the current project:

```
engagement/
├── scope/
│   ├── engagement-brief.md
│   ├── stakeholder-map.md
│   └── timeline.md
├── data/
├── analysis/
├── deliverables/
├── timesheets/
└── internal/
    └── notes.md
```

### 2. Engagement Brief (scope/engagement-brief.md)

Populate with this template, filling in details from the command arguments:

```markdown
# Engagement Brief

## Engagement
- **Name:** [from argument]
- **Client:** [from --client or "TBD"]
- **Start Date:** [today]
- **Duration:** [from --duration or "TBD"]
- **Status:** Active

## Objectives
1. [To be defined with client]

## Scope
### In Scope
- [To be defined]

### Out of Scope
- [To be defined]

## Deliverables
| # | Deliverable | Due Date | Status |
|---|------------|----------|--------|
| 1 | [TBD] | [TBD] | Not Started |

## Key Assumptions
1. [To be defined]

## Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| [TBD] | [H/M/L] | [H/M/L] | [TBD] |
```

### 3. Stakeholder Map (scope/stakeholder-map.md)

Create with the influence/interest grid template ready to populate.

### 4. Timeline (scope/timeline.md)

Create with phases: Discovery, Analysis, Synthesis, Delivery, Review.

### 5. Confirmation

After creating all files, display a summary of what was created and prompt the user to fill in the engagement brief.

## Notes

- If the engagement directory already exists, warn and ask before overwriting.
- The internal/ directory is for notes not shared with the client. Flag this clearly.
- Run the confidentiality hook after creation to verify no sensitive data was included.
