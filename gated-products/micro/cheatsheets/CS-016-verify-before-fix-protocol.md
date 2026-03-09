---
title: "Verify Before Fix Protocol — Cheat Sheet"
hive_doctrine_id: HD-0030
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0030
full_product_price: 29
---

# Verify Before Fix Protocol — Cheat Sheet

## What It Is

A 4-phase protocol that stops agents (and humans) from fixing assumptions instead of fixing problems. Diagnose locally, verify remotely, fix small, validate after.

## The Problem It Solves

An AI agent reads cached source code, spots 5 "issues," and rewrites 6 files. In reality, 4 of the 5 assumptions were wrong, and only 1 file needed a 2-line change. The other 5 file changes created new bugs.

## The 4 Phases

### Phase 1: Diagnostic Session (Local)

- Read available information (logs, configs, source code)
- Form hypotheses about what's wrong
- **Do NOT fix anything yet**
- Output: a numbered list of assumptions

```markdown
## Diagnostic Assumptions
1. Config file has wrong database URL
2. Cron job stopped running
3. API key expired
4. Log rotation broke the pipeline
5. Permissions changed on /data/ directory
```

### Phase 2: Verification Session (Remote)

- For each assumption, run a **non-destructive** verification command
- Record actual findings in a verdict table:

| # | Assumption | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Wrong DB URL | WRONG | Config shows correct URL |
| 2 | Cron stopped | CONFIRMED | `crontab -l` shows no entry |
| 3 | API key expired | NOT_APPLICABLE | No API calls in this flow |
| 4 | Log rotation broke | WRONG | Logs rotating normally |
| 5 | Permissions changed | PARTIAL | /data/ fine, /data/tmp/ wrong |

### Verdict Categories

| Verdict | Meaning |
|---------|---------|
| **CONFIRMED** | Assumption is correct — this needs fixing |
| **WRONG** | Assumption is incorrect — do not fix |
| **PARTIAL** | Partially correct — scope the fix narrowly |
| **NOT_APPLICABLE** | Assumption doesn't apply to this situation |

### Phase 3: Scoped Fix Session

- Fix ONLY confirmed and partial items
- One change at a time
- Non-destructive write test before real write
- Log every change made

### Phase 4: Validation

- Re-run the diagnostic checks from Phase 2
- Confirm each fix resolved the issue
- Check for regressions (did the fix break something else?)

## Key Rules

1. **Never fix in the diagnostic phase** — diagnosis and treatment are separate
2. **Non-destructive verification only** — `cat`, `ls`, `grep`, not `rm`, `sed`, `mv`
3. **Most assumptions are wrong** — expect 60-80% of initial hypotheses to be incorrect
4. **Small fixes beat rewrites** — if you're changing more than 3 files, re-verify your assumptions

---

*This is the condensed version. The full guide (HD-0030, $29) covers the complete 4-phase protocol with real-world examples showing 4 of 5 assumptions wrong and a 1-file fix instead of 6. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
