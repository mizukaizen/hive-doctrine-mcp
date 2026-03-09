---
title: "Agent Memory Audit Protocol — Cheat Sheet"
hive_doctrine_id: HD-0011
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0011
full_product_price: 49
---

# Agent Memory Audit Protocol — Cheat Sheet

## What It Is

A 4-phase staleness check for agent memory systems. Detects when agents are operating on outdated information and fixes the pipeline.

## Phase 1: Inventory

List every memory source the agent reads from:

- Config files (`.env`, `config.json`)
- Knowledge base files (markdown, JSON)
- Database tables
- Synced files (Syncthing, S3, etc.)
- Cached API responses

**Output:** A table with columns: Source | Path | Expected Update Frequency | Last Updated

## Phase 2: Freshness Scoring

For each source, calculate freshness:

| Score | Meaning | Action |
|-------|---------|--------|
| **Fresh** | Updated within expected window | No action |
| **Stale** | Overdue by 1-2x expected window | Investigate |
| **Dead** | Overdue by 3x+ or never updated | Fix immediately |

**Common stale sources:** Syncthing folders that stopped syncing, cron jobs that silently failed, cached files with no TTL.

## Phase 3: Mechanism Check

For each memory source, verify the update mechanism:

- **Cron jobs:** Is the cron still running? Check `crontab -l` and recent execution logs
- **Sync tools:** Is Syncthing connected? Check peers and last sync time
- **Scripts:** Did the script error silently? Check stderr, exit codes
- **Manual:** Is someone still updating this? When was the last manual edit?

**Common bug:** Quoted heredocs in bash scripts. `cat <<'EOF'` prevents variable expansion — if your script relies on `$VARIABLE` inside a heredoc, use `cat <<EOF` (unquoted).

## Phase 4: Repair and Restore

1. Fix the broken mechanism (restart cron, reconnect Syncthing, fix script)
2. Manually refresh the stale data (one-time catch-up)
3. Add monitoring to prevent silent failures
4. Document the fix in LESSONS.md

## Monthly Audit Checklist

- [ ] Run inventory scan
- [ ] Score freshness for all sources
- [ ] Verify all cron jobs executed successfully
- [ ] Check Syncthing peer connections
- [ ] Test one memory retrieval end-to-end
- [ ] Update audit log with findings

## Key Rule

**Stale memory is worse than no memory.** An agent confidently acting on outdated information causes more damage than an agent that says "I don't know."

---

*This is the condensed version. The full guide (HD-0011, $49) covers the Syncthing async pipe pattern, detailed mechanism debugging, and real-world audit examples. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
