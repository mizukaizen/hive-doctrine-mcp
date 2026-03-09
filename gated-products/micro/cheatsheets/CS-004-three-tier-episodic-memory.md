---
title: "Three-Tier Episodic Memory — Cheat Sheet"
hive_doctrine_id: HD-0009
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0009
full_product_price: 99
---

# Three-Tier Episodic Memory — Cheat Sheet

## What It Is

A hot/warm/cold storage architecture for agent memory. Agents remember recent events in detail, summarise older events, and archive the rest.

## The Three Tiers

| Tier | Age | Storage | Latency | Content |
|------|-----|---------|---------|---------|
| **Hot** | 0-7 days | SQLite (WAL mode) | <10ms | Full event records |
| **Warm** | 7-90 days | Daily summaries + temporal facts | ~100ms | Compressed summaries |
| **Cold** | 90+ days | Gzip archive files | Seconds | Raw archive, rarely accessed |

## Hot Tier — SQLite Schema

```sql
CREATE TABLE episodes (
  id TEXT PRIMARY KEY,
  timestamp DATETIME,
  agent_id TEXT,
  event_type TEXT,
  content TEXT,
  metadata JSON,
  embedding BLOB
);
```

- WAL mode for concurrent reads during writes
- Index on `(agent_id, timestamp)` for fast lookups
- Checkpoint before any DB copy: `PRAGMA wal_checkpoint(TRUNCATE)`

## Warm Tier — Daily Summaries

- Cron job runs daily, summarises hot-tier events using a cheap model (e.g. Claude Haiku)
- Output: one paragraph per day per agent
- Temporal facts graph: key facts with timestamps ("User switched to PostgreSQL on March 3")

## Cold Tier — Archive

- Gzip compress warm-tier data older than 90 days
- Store by month: `archive/2026-01.json.gz`
- Only accessed for deep historical queries

## Hybrid Retrieval Scoring

When querying memory, blend three signals:

| Signal | Weight | Method |
|--------|--------|--------|
| Temporal | 20% | Recency decay (exponential) |
| Keyword | 50% | BM25 / full-text search |
| Semantic | 30% | Cosine similarity on embeddings |

**Final score** = 0.2 * temporal + 0.5 * keyword + 0.3 * semantic

## Key Implementation Rules

1. **Hot tier is the only writable tier** — warm and cold are derived
2. **Never delete hot-tier data** — migrate it to warm, then cold
3. **Summaries are lossy by design** — that's the point; agents don't need perfect recall of old events
4. **WAL checkpoint before copying** — always

---

*This is the condensed version. The full guide (HD-0009, $99) covers the complete Python MemoryDB class, daily_summary.py cron script, hybrid retrieval implementation, and production deployment patterns. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
