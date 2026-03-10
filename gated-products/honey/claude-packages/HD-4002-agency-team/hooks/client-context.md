# Hook: Client Context Loader

Automatically loads client-specific context when switching between projects.

## Trigger

This hook activates when:
- The working directory changes to a `clients/[client-slug]/` path
- A command references a specific client slug
- The user says "switch to [client name]" or "working on [client name]"

## Actions

### 1. Load Client README
Read `clients/[client-slug]/README.md` to understand:
- Project overview and goals
- Tech stack and constraints
- Key contacts and communication preferences
- Client-specific rules or sensitivities

### 2. Load Current Status
Read `clients/[client-slug]/STATUS.md` to understand:
- Current phase (Discovery / Build / QA / Launch / Maintenance)
- What was last worked on
- Open blockers
- Upcoming deadlines

### 3. Load Scope
Read `clients/[client-slug]/SCOPE.md` to understand:
- What is in scope
- What is explicitly out of scope
- Any pending change requests

### 4. Confirm Context Switch
Output a brief confirmation:
```
Switched to [Client Name].
Phase: [Current phase]
Next deadline: [Date — deliverable]
Open blockers: [Count]
```

## Rules

- Never carry context from one client into another. Each context switch is a clean slate.
- If any of the three required files (README, STATUS, SCOPE) are missing, warn the user and offer to create them.
- If STATUS.md has not been updated in more than 7 days, flag it as potentially stale.
- Do not load client context silently — always confirm the switch so the user knows which client context is active.
