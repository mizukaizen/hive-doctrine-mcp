---
title: "Cowork Memory Architecture — Cheat Sheet"
hive_doctrine_id: HD-0010
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0010
full_product_price: 79
---

# Cowork Memory Architecture — Cheat Sheet

## What It Is

A 3-layer markdown-native session memory system for AI assistants that persist context across conversations without databases.

## The Three Layers

### Layer 1: Between-Session Files (Persistent)

Core files that survive session boundaries:

| File | Purpose |
|------|---------|
| `BRIEF.md` | Morning briefing — what happened, what's next |
| `PROTOCOL.md` | How the assistant operates (startup/shutdown steps) |
| `TASKS.md` | Active task list with status |
| `LESSONS.md` | Hard-won lessons — mistakes not to repeat |
| `CONTEXT-THREADS.md` | Active work threads and their state |
| `GLOSSARY.md` | Project-specific terminology |

**Rule:** These files are the source of truth. Read them on every session start.

### Layer 2: PreCompact Hook (Crash Recovery)

A bash hook that captures the last 20 assistant turns before context compaction occurs:

- Triggers automatically when context window fills up
- Saves to `_cowork/memory/precompact-checkpoint.md`
- On next session start, check if checkpoint exists — if so, recover context

### Layer 3: Working Context Monitoring

During a session, track what's changed:

- Files modified (paths and timestamps)
- Decisions made (and rationale)
- Questions asked but not yet answered
- Tasks started but not completed

## 12-Step Briefing Format

1. Read PROTOCOL.md
2. Read BRIEF.md
3. Read TASKS.md
4. Check for precompact checkpoint
5. Check inbox for new items
6. Read LESSONS.md
7. Read CONTEXT-THREADS.md
8. Check recently modified files
9. Summarise current state
10. Identify top 3 priorities
11. Present briefing to user
12. Wait for user direction

## Key Design Principles

1. **Markdown over databases** — files are debuggable, portable, version-controlled
2. **Read on startup, write on shutdown** — bookend every session
3. **Lessons are permanent** — never delete from LESSONS.md
4. **Crash recovery is mandatory** — the PreCompact hook is not optional

---

*This is the condensed version. The full guide (HD-0010, $79) covers the complete file templates, PreCompact hook implementation, working context monitoring scripts, and 12-step briefing walkthrough. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
