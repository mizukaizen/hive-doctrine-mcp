# Command: /handoff

Generate a comprehensive handoff document for transitioning a project between team members or to the client.

## Usage

```
/handoff [client-slug] [recipient: team-member | client]
```

## Process

### Step 1: Scan Project State
Read the following files to build context:
- `clients/[client-slug]/README.md`
- `clients/[client-slug]/STATUS.md`
- `clients/[client-slug]/DECISIONS.md`
- `clients/[client-slug]/SCOPE.md`
- Recent git log (last 20 commits)

### Step 2: Generate Handoff Document

Create `clients/[client-slug]/docs/HANDOFF-[YYYY-MM-DD].md` with:

```markdown
# Project Handoff: [Client Name]
**Date:** [YYYY-MM-DD]
**From:** [Current owner]
**To:** [Recipient]

## Project Summary
[2-3 sentence overview of the project and its current state]

## Current Status
- **Phase:** [Discovery / Build / QA / Launch / Maintenance]
- **Completion:** [X]% of agreed scope
- **Open items:** [Count]

## Architecture Overview
[Brief description of the tech stack, key components, and how they connect]

## Key Decisions Made
[List of significant decisions from DECISIONS.md with rationale]

## Open Issues
[List of known bugs, incomplete features, or pending decisions]

## Environment Setup
[Step-by-step instructions to get the project running locally]

## Credentials & Access
[DO NOT include actual credentials — list what is needed and where to find them]
- Database: [location of credentials]
- API keys: [location of credentials]
- Hosting: [provider and access method]

## Client-Specific Notes
- Communication preferences: [email / Slack / weekly calls]
- Key stakeholders: [names and roles]
- Known sensitivities: [topics, deadlines, or constraints to be aware of]

## Next Steps
1. [Immediate priority]
2. [Second priority]
3. [Third priority]
```

### Step 3: Verify Completeness
Check that:
- All environment variables are documented (not their values, just their names)
- Setup instructions actually work
- No credentials are exposed in the document
- Open issues are actionable (not vague)

## Rules

- If generating a client-facing handoff, remove all internal commentary, pricing notes, and team-specific language.
- Credentials must never appear in the handoff document. Reference their secure location only.
- The handoff must be self-contained — the recipient should be able to work independently after reading it.
