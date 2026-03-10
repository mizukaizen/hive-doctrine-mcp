# /timesheet

Generate a timesheet summary from git commits and file modification history.

## Usage

```
/timesheet [--period "YYYY-WNN"|"YYYY-MM"|"YYYY-MM-DD to YYYY-MM-DD"] [--format summary|detailed]
```

## Behaviour

### 1. Gather Activity Data

- Run `git log` for the specified period with timestamps and file changes.
- Scan file modification times in the project directory.
- Cross-reference with any existing timesheet entries in `timesheets/`.

### 2. Categorise Work

Map each commit and file change to a category:

| Category | Indicators |
|----------|-----------|
| Research | Files in `data/`, web research notes, source documents |
| Analysis | Files in `analysis/`, spreadsheets, data processing scripts |
| Writing | Files in `deliverables/`, report drafts, memos |
| Review | Commits with "review", "revise", "feedback" in messages |
| Meetings | Meeting notes, agenda files |
| Admin | Config files, project setup, housekeeping |

### 3. Estimate Hours

- Estimate work time based on gaps between commits and file modifications.
- Round to nearest 15-minute increment.
- Cap any single session at 4 hours unless evidence suggests continuous work.
- Flag estimates with low confidence (large gaps between activity, ambiguous categorisation).

### 4. Generate Summary

**Summary format:**
```markdown
# Timesheet: [Period]

## Summary
| Category | Hours | % of Total |
|----------|-------|-----------|
| Research | X.XX | XX% |
| Analysis | X.XX | XX% |
| Writing | X.XX | XX% |
| Review | X.XX | XX% |
| Admin | X.XX | XX% |
| **Total** | **X.XX** | **100%** |

## By Deliverable
| Deliverable | Hours |
|------------|-------|
| [Name] | X.XX |

## Notes
- [Any estimation caveats]
```

**Detailed format:** Adds a day-by-day breakdown with individual entries.

### 5. Save

Write the timesheet to `timesheets/[period].md`.

## Notes

- These are estimates based on available signals. Always review before submitting to a client.
- The tool cannot capture work done outside the project directory (calls, whiteboard sessions, etc.). Add those manually.
