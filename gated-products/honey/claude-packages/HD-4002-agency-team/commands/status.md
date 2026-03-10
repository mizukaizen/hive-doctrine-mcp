# Command: /status

Generate a cross-project status report for all active client projects.

## Usage

```
/status
```

## Process

### Step 1: Discover Active Projects
Scan `clients/` directory for all project folders. Read each project's `STATUS.md` and `SCOPE.md`.

### Step 2: Generate Dashboard

```markdown
# Agency Status Dashboard
**Generated:** [YYYY-MM-DD HH:MM]

## Active Projects

| Client | Phase | Health | Deadline | Hours Used/Budget | Blockers |
|--------|-------|--------|----------|-------------------|----------|
| [Name] | Build | Green  | Apr 15   | 40/120h           | None     |
| [Name] | QA    | Amber  | Mar 30   | 95/100h           | API docs |

## Attention Required
[List any project where:]
- Hours exceed 80% of budget
- Deadline is within 5 business days
- There are unresolved blockers
- Status has not been updated in 7+ days

## This Week's Deliverables
- [Client A]: [Deliverable] — due [date]
- [Client B]: [Deliverable] — due [date]

## Team Allocation
| Team Member | Current Project | Utilisation |
|-------------|-----------------|-------------|
| [Name]      | [Client]        | 80%         |
```

### Step 3: Health Assessment
Assign health status per project:
- **Green:** On track, within budget, no blockers
- **Amber:** Minor risk — timeline pressure, approaching budget limit, or minor blockers
- **Red:** At risk — over budget, past deadline, or critical blockers

### Step 4: Save Report
Save to `reports/status-[YYYY-MM-DD].md`.

## Rules

- Report only facts. Do not speculate about why things are behind.
- If a project's STATUS.md has not been updated in 7+ days, flag it as stale data.
- Include time tracking variance if available (estimated vs actual hours).
