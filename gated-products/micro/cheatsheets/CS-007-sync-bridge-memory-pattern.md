---
title: "Sync Bridge Memory Pattern — Cheat Sheet"
hive_doctrine_id: HD-0012
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0012
full_product_price: 49
---

# Sync Bridge Memory Pattern — Cheat Sheet

## What It Is

Bidirectional file sync (e.g. Syncthing) used as an async memory pipeline between agents or between an agent and its operator. No APIs, no databases — just structured files in synced folders.

## How It Works

```
Agent A writes → Synced Folder → Agent B reads
Agent B writes → Synced Folder → Agent A reads
```

The sync tool (Syncthing, rsync, S3 sync) handles transport. The agents handle reading and writing structured files.

## Structured Update File Format

Each update is a markdown file with three sections:

```markdown
# Update — [timestamp]

## Summary
One-sentence description of what changed.

## New Facts
- Fact 1: [specific, timestamped information]
- Fact 2: [specific, timestamped information]

## Files to Update
- path/to/file.md — [what needs changing]
- path/to/other.md — [what needs changing]
```

## Processing Rules

1. **Check for new update files on session start** — scan the sync folder for files newer than last processed timestamp
2. **Process in chronological order** — oldest first, never skip
3. **Archive after processing** — move to `processed/` subfolder, never delete
4. **Write acknowledgement** — create a response file confirming receipt

## Heartbeat Processing

For continuous operation:

- Agent checks sync folder every N minutes (or on file-change event)
- New files trigger processing pipeline
- Stale heartbeat (no new files for 2x expected interval) triggers alert

## Key Design Rules

1. **Archive, don't delete** — processed files move to `processed/`, preserving audit trail
2. **One fact per line** — makes parsing reliable
3. **Timestamps on everything** — without timestamps, you can't resolve conflicts
4. **Idempotent processing** — processing the same file twice should produce the same result
5. **Conflict resolution** — if two agents write simultaneously, latest timestamp wins

## When to Use This Pattern

- Agents on different machines that can't share a database
- Operator-to-agent communication (operator drops a file, agent picks it up)
- Cross-environment sync (local dev to production server)

## When NOT to Use It

- Real-time communication (latency too high)
- High-frequency updates (file sync can't keep up)
- Complex queries (use a database instead)

---

*This is the condensed version. The full guide (HD-0012, $49) covers the complete sync bridge implementation, conflict resolution strategies, and Syncthing-specific configuration. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
