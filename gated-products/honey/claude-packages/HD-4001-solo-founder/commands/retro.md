# Command: /retro

Weekly retrospective for solo founders. Run this every Friday.

## Usage

```
/retro
```

## Process

### Step 1: What Shipped This Week
Review git commits and changelog entries from the past 7 days. List everything that went to production, grouped by feature or area.

```bash
git log --oneline --since="7 days ago" --no-merges
```

### Step 2: What Got Blocked
Identify anything that was planned but did not ship. For each blocked item:
- What was the blocker?
- Was it technical, motivational, or scope-related?
- Is it still worth doing next week?

### Step 3: Metrics Check
Review the key metrics for the week (if `METRICS.md` exists):
- Users (new, active, churned)
- Revenue (new MRR, total MRR)
- Conversion rate changes
- Any metric that moved more than 10% in either direction

### Step 4: What to Change
Based on the above, recommend 1-2 process changes for next week. Keep it concrete:
- "Reduce scope on feature X to just the core flow"
- "Stop checking analytics more than once per day"
- "Time-box debugging to 30 minutes, then ask for help"

### Step 5: Next Week's Focus
Pick the single most important thing to ship next week. Write it as a one-sentence goal. Everything else is secondary.

## Output Format

Save the retro to `docs/retros/retro-[YYYY-MM-DD].md` with all five sections.

## Rules

- Be honest, not kind. If nothing shipped, say so. If the founder is stuck in a loop, call it out.
- Do not let retros become planning sessions. The output is reflection and one clear focus for next week.
- If this is the third retro in a row where the same item is blocked, escalate: "This has been blocked for 3 weeks. Either solve it this week or kill it."
