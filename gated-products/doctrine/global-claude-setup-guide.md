---
title: "Global Claude Code Setup Guide — Configure Your AI Assistant's Persistent Memory"
author: Melisia Archimedes
collection: C7-dev-mastery
tier: doctrine
price: 4.99
version: 1.0
last_updated: 2026-03-09
audience: developers
hive_doctrine_id: HD-0064
---

# Global Claude Code Setup Guide

Your Claude Code assistant forgets everything after every session. You're starting from zero every time. That's wasteful. Most developers never realise you can create a persistent instructions file — a `.claude/CLAUDE.md` in your home directory — that loads into every session automatically. This guide shows you how to build one that actually works.

## The Problem

You've got a complex project setup. Your assistant needs to know:
- Your infrastructure (which servers, which databases, which APIs)
- Your team structure (if you're managing agents or automation systems)
- Your operational rules (how to handle dangerous operations, backup protocols)
- Your project map (what's active, what's archived, what's blocked)
- Your output conventions (where files go, what naming means what)

Right now, you paste this context into every session. You copy-paste it wrong sometimes. You forget critical details. Your assistant makes mistakes because it doesn't have the full picture. You waste the first 5 minutes of every session re-establishing context.

A good global config fixes this entirely. Your assistant walks into every session with perfect, stable, operator-specific context loaded automatically.

## Why This Matters

When your AI assistant has clear, persistent identity and infrastructure context:
- Fewer mistakes (it knows which database is production, which is test)
- Faster startup (no context-pasting, straight to work)
- Better decisions (it understands your risk tolerance, your architecture philosophy)
- Consistency across agents (if you're running multiple AI workers, they all have the same baseline)
- Safer operations (it knows which commands need confirmation, which are quick-and-safe)

This isn't theoretical. Teams running multi-agent systems, trading bots, or complex automation pipelines report 30-40% faster iteration when the assistant has a well-structured global config.

## The Solution: Anatomy of a Good Global CLAUDE.md

A global `CLAUDE.md` has six sections. You don't need all of them immediately, but this structure scales from "solo developer" to "multi-agent operation".

### 1. Identity Section
```markdown
## Identity
- **Operator:** Your Name (your.email@domain.com) — Your role / context
- **Tone:** Your preferred communication style (Australian English, plain language, etc.)
- **Base workspace:** Path to your main project directory
```

This tells the assistant who you are and how you talk. It's 3–5 lines. It matters because consistency in tone and context builds better long-term working relationships with your AI assistant.

### 2. On Startup Protocol
```markdown
## On Startup
1. Check working directory. If you're in a project folder, read the project-level CLAUDE.md first.
2. If working on [infrastructure name], follow this procedure: [SSH command], read [key files]
3. Key memory files (read when relevant):
   - Path to lessons file — past mistakes to avoid
   - Path to active threads — what's blocked, what's next
```

Startup protocols are decision trees. They save time and prevent mistakes. You're essentially telling your assistant: "When you start, here's the 30-second checklist to get oriented."

### 3. Infrastructure Table
```markdown
## Infrastructure
| Purpose | Details |
|---------|---------|
| **Primary Server** | IP, provider, specs, OS |
| **SSH** | How to connect |
| **Database** | Where it lives, what tool to use |
| **Mesh VPN** | Which networks are connected |
| **Monitoring** | How to check system health |
```

This is where you list all the systems you operate. Format it as a two-column table so it's scannable. Include:
- IP addresses (or hostnames)
- SSH commands (exact syntax)
- Key directory paths
- Critical credentials contexts (not the credentials themselves — just references like "stored in .env")

### 4. Architecture & Hard Rules
If you operate bots, agents, or distributed systems, add a section explaining the architecture and non-obvious constraints:

```markdown
## [System Name] Architecture — READ THIS BEFORE ANY [SYSTEM] WORK

Describe the non-obvious parts. Include:
- What's a signer vs. what's a trader account (with examples if you have multi-sig or Safe accounts)
- What mode is each bot in (paper vs. live)
- What the assistant should never change without explicit permission
- Common diagnostic blind spots (e.g., "this API returns silent failures in SSH environments")
```

This section saves debugging time. It's where you document hard-won lessons about your own infrastructure.

### 5. Status Tables
Keep running status of your systems and projects:

```markdown
## System Status
| System | Mode | Notes |
|--------|------|-------|
| bot-1 | LIVE | Running, monitoring enabled |
| bot-2 | PAPER | Paper mode, awaiting approval |
| bot-3 | OFFLINE | Scheduled for decommission |

## Active Projects
| Project | Status | Next Action |
|---------|--------|-------------|
| Project A | In Progress | Deploy staging Friday |
| Project B | Blocked | Waiting on infrastructure |
| Project C | Archive | Old, reference only |
```

Status tables are your source of truth. Keep them updated. Your assistant will reference them and catch stale work.

### 6. Workspace Convention
Document where outputs go and what they mean:

```markdown
## Outputs Convention
| Type | Location | Examples |
|------|----------|----------|
| Session work | `/path/to/outputs/` | Research, drafts, temporary analysis |
| Permanent assets | Relevant project folder | Final files, configs, production docs |
| Memory/lessons | `/path/to/memory/` | Hard-won lessons, context threads |
```

This prevents files scattering across your disk. Your assistant knows where to save things. You can find them later.

## Implementation: Build Yours in 30 Minutes

**Step 1:** Create the file
```bash
mkdir -p ~/.claude
touch ~/.claude/CLAUDE.md
```

**Step 2:** Add the identity section
```markdown
---
# Global Claude Code Instructions — [Your Name]

## Identity
- **Operator:** [Your Name] ([your.email])
- **Tone:** Plain English, decision-oriented, technical
- **Base workspace:** ~/[your-main-folder]/
```

**Step 3:** Add your startup protocol (2–3 checklist items)
```markdown
## On Startup
1. If in ~/[project-folder], read the local CLAUDE.md first
2. For infrastructure work, SSH as: ssh user@[host]
3. Before any database operation, read ~/[path-to]/database-rules.md
```

**Step 4:** Build your infrastructure table
List every system you operate. One row per system. Include SSH commands, key paths, and roles.

**Step 5:** If you run bots/agents, add the architecture section
Document what's live, what's paper, what the non-obvious constraints are. Future-you will thank present-you.

**Step 6:** Add status tables for active projects and systems
Update these monthly. Or weekly if your operation is moving fast.

**Step 7:** Save and test
Push the file to your `.claude/` directory. Start a new Claude Code session. The assistant should load it automatically on startup.

## Key Insights

**Insight 1: Granularity matters.** Don't write a 50-page manual. Write clear, scannable sections. Your assistant reads this at session start — it should take 2 minutes to scan, not 20 minutes to read.

**Insight 2: Update it.** A global config becomes stale. Every month, review it. Update status tables. Add new infrastructure. Remove deprecated projects. Stale context is worse than no context.

**Insight 3: Separate global from local.** Global config lives in `~/.claude/CLAUDE.md`. Project-specific rules live in the project root as `CLAUDE.md`. Let them reference each other.

**Insight 4: Infrastructure changes.** When you rotate servers, swap databases, or decommission systems, update the global config *immediately*. Don't leave it as a "TODO". This is your single source of truth for what's actually running.

**Insight 5: Hard rules go here.** Anything you must never do without confirmation ("never delete production without backup", "never merge without testing", "never change this flag") goes in the global config. Makes it impossible to forget.

## Example: A Minimal Working Config

```markdown
---
# Global Claude Code Instructions — Alice Chen

## Identity
- **Operator:** Alice Chen (alice@example.com) — Full-stack engineer, 3-bot trading operation
- **Tone:** Australian English, plain language, challenge assumptions
- **Base workspace:** ~/Documents/

## On Startup
1. If in ~/Documents/, read CLAUDE.md in that folder
2. For infrastructure work: SSH as `ssh root@[PRIMARY_IP]`
3. Before any database operation: run `sqlite3 /path/to/db "PRAGMA wal_checkpoint(TRUNCATE);"`

## Infrastructure
| Purpose | Details |
|---------|---------|
| Primary Server | [IP], Hetzner, 16GB RAM, Ubuntu 24.04 |
| SSH | ssh root@[PRIMARY_IP] |
| Bot directory | /root/bots/trading-{crypto,weather,sports}/ |
| Database | SQLite at /root/data/trading.db |

## Bot Status
| Bot | Mode | Notes |
|-----|------|-------|
| crypto-bot | LIVE | 5-min intervals, BTC pairs |
| weather-bot | PAPER | Testing fade strategy |
| sports-bot | PAPER | 200+ markets, awaiting approval |

## Outputs Convention
| Type | Location |
|------|----------|
| Session work | ~/Documents/_cowork/outputs/ |
| Permanent assets | ~/Documents/01-projects/ |
| Bot logs | /root/logs/ |
```

This is minimal. It's enough. You can expand it later.

## Packaging Notes

This guide teaches pattern, not specifics. Every developer's global config will look different because every operation is different. The value is in understanding:
- Why persistent context matters
- How to structure it for clarity
- What sections scale with you as your operation grows

Use this as a template. Adapt it. Share it with your team if they're also using Claude Code. A well-structured global config is one of the fastest ROI improvements you can make to your AI-assisted workflow.

When you've built yours, test it. Start a fresh Claude Code session. Check that it loaded. Ask the assistant to repeat back your infrastructure details. If it knows them without being told, you've won.

---

**Next step:** Build your own. Spend 30 minutes on it. Use the template above. Update it quarterly. You'll save that 30 minutes back in the first week.
