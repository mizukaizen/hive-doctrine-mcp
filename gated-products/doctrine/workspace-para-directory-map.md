---
title: "Workspace PARA Directory Map — Folder Structure Template for AI Agent Teams"
author: Melisia Archimedes
collection: C4-infrastructure
tier: doctrine
price: 9.99
version: 1.0
last_updated: 2026-03-09
audience: agent-builders
hive_doctrine_id: HD-0028
---

# Workspace PARA Directory Map

## What This Is

A battle-tested folder structure template for agent-driven operations. Most AI teams scatter files across a desktop and S3 buckets, then spend hours debugging which version is current. This teaches you how to build a single source of truth that your agents can navigate programmatically.

The template implements PARA (Projects, Areas, Resources, Archive) at the workspace root, with subsystems for session context, agent memory, infrastructure state, and output separation. Agents can query the directory map, locate context files by tier, and avoid version conflicts.

## The Problem It Solves

When you run a multi-agent system:

- **Agents can't find things.** They grep across `/home/user/Downloads/`, five Slack threads, and a half-written Notion database.
- **Context files clash.** You have `system-status-v3-draft.md`, `system-status-latest.md`, and `system-status-old-2026-02-11.md` in the same folder. Which is current?
- **Infrastructure visibility breaks.** Your VPS state, active bots, database schemas, and deployed services live in scattered locations. When you spin up a new agent, it takes them an hour to map the landscape.
- **Output files bury important artefacts.** A critical analysis from last week sits next to 15 exploratory documents with no metadata about which is production-ready.
- **Session handoffs fail.** You start a new AI session and have to reconstruct context from scratch because the previous operator didn't follow a consistent structure.

PARA is the fix. It's not new—Tiago Forte formalised it in 2017. But most knowledge management systems treat it as a writing tool. This template treats it as an agent-native filesystem.

## How the Structure Works

### The Five PARA Tiers

```
~/workspace/
├── 00-INBOX/              ← Raw input, unprocessed
├── 01-PROJECTS/           ← Finite outcomes (numbered subfolders)
├── 02-AREAS/              ← Ongoing responsibilities, no end date
├── 03-RESOURCES/          ← Reference material (evergreen)
├── 04-ARCHIVE/            ← Cold storage (inactive)
├── _cowork/               ← Agent session runtime & memory
├── _system/               ← Infrastructure state snapshots
├── _products/             ← Finished artefacts (separate tier)
└── _media/                ← Large assets (images, video, audio)
```

**Why this order?**

- `00-` and `01-` float to the top (projects are always visible first).
- `02-04` follow sequential priority.
- Underscore prefix (`_*`) pushes system folders below user PARA folders alphabetically—they don't clutter your view of active work.

### 00-INBOX: The Drop Zone

**Purpose:** Catch all for unprocessed input.

```
00-INBOX/
├── README.md                           ← how to use this folder
├── slack-transcript-march-2026.txt     ← from Slack export
├── competitor-analysis.pdf             ← PDF from email
├── meeting-notes-march-9.md            ← AI auto-transcribed notes
└── agent-output-analysis-draft.md      ← exploratory work
```

**What goes here:**
- PDFs you want summarised
- Screenshots you need catalogued
- Raw transcripts from meetings or calls
- Unprocessed data drops from external systems

**Agent responsibility:** Process this folder weekly. Sort to appropriate PARA tier. Delete if irrelevant. Keep only items that block work or need routing.

### 01-PROJECTS: Active Work

**Purpose:** Projects with defined outcomes and end dates.

```
01-PROJECTS/
├── 01-core-platform/
│   ├── 01-product-overview.md         ← numbered for reading order
│   ├── 02-architecture.md
│   ├── 03-feature-roadmap.md
│   ├── design/
│   ├── research/
│   └── deliverables/
│
├── 02-market-analysis/
│   ├── README.md
│   ├── competitor-benchmarks.md
│   ├── pricing-research.md
│   └── reports/
│
└── 03-agent-system/
    ├── agent-configs/
    ├── prompts/
    ├── memory-snapshots/
    └── performance-logs/
```

**Naming rules:**
- Prefix each project with a number: `01-`, `02-`, `03-`. This sets reading order and sort order.
- Use kebab-case for folder names: `core-platform`, `market-analysis`, `agent-system`.
- Inside a project, if there are sequential files, number them: `01-overview.md`, `02-architecture.md`, etc. This signals they're meant to be read in order.
- If no reading order matters, don't number—just name them descriptively: `design/`, `research/`, `deliverables/`.

**Archive rule:** When a project is done, move the entire folder to `04-ARCHIVE/`. Do not delete.

### 02-AREAS: Ongoing Responsibilities

**Purpose:** Recurring work with no fixed end date (roles, domains, repeating obligations).

```
02-AREAS/
├── 01-operations/
│   ├── README.md
│   ├── weekly-status.md                ← rolling document
│   ├── team-roles.md
│   └── policies/
│
└── 02-personal/
    ├── learning-log.md
    ├── health-tracking.md
    └── finance/
```

**Key difference from Projects:** These don't end. A project has a finish line. An area is a role you hold indefinitely. Operations, learning, team management, compliance—these go in Areas.

### 03-RESOURCES: Reference Material

**Purpose:** Evergreen knowledge, templates, and reference docs.

```
03-RESOURCES/
├── frameworks/
│   ├── PARA-setup-guide.md
│   ├── agent-prompt-templates.md
│   └── quality-gates-checklist.md
│
├── standards/
│   ├── coding-conventions.md
│   ├── documentation-style.md
│   └── naming-conventions.md
│
└── how-to/
    ├── setting-up-agent-memory.md
    ├── debugging-agent-output.md
    └── syncing-infrastructure-state.md
```

**No expiry.** These documents don't change unless the underlying system does.

### 04-ARCHIVE: Cold Storage

**Purpose:** Completed projects, inactive explorations, old versions.

```
04-ARCHIVE/
├── completed-projects/
│   ├── 01-old-platform/
│   ├── 02-prototype-a/
│   └── 03-failed-experiment/
│
├── snapshots/
│   ├── system-state-2026-02-01/
│   └── agent-configs-legacy/
│
└── third-party/
    ├── vendor-exports/
    └── integration-repos/
```

**Rule:** Never delete old work. Archive it. Why?
1. You may need to recover a decision that was made two years ago.
2. Agents can query archive as a historical record—"What did we try last time?"
3. It's evidence of progress. Keeps people motivated.

### _cowork: Agent Session Runtime

**Purpose:** Session-specific context, memory layers, and task tracking.

```
_cowork/
├── TASKS.md                           ← canonical task list
├── inbox/                             ← queue for next session
│   ├── meeting-notes/
│   ├── handoffs/
│   └── research-to-process/
│
├── memory/                            ← persistent learning layer
│   ├── CONTEXT-THREADS.md            ← active work threads
│   ├── SESSION-LOG.md                ← session summaries (historical)
│   ├── FEEDBACK-LOG.md               ← corrections & learnings
│   ├── WORKING-STYLE.md              ← communication preferences
│   ├── context/                       ← biographical/narrative docs
│   │   ├── infrastructure.md          ← current system state snapshot
│   │   ├── team-identity.md
│   │   └── strategic-thesis.md
│   ├── people/                        ← team member profiles
│   │   ├── operator-profile.md
│   │   └── stakeholder-map.md
│   └── projects/                      ← per-project status tracking
│       ├── platform-migration.md
│       └── agent-deployment.md
│
├── outputs/                           ← session work products
│   ├── research/
│   ├── prompts/
│   ├── analysis/
│   └── drafts/
│
└── archive/
    ├── completed-handoffs/
    └── deprecated-protocols/
```

**Memory structure explained:**

- **TASKS.md:** The source of truth for what's urgent, active, waiting, and someday. Updated at session end.
- **CONTEXT-THREADS.md:** Multi-session work threads. Each thread has: status, next action, blocking issues. This is what you read when you start a new session.
- **SESSION-LOG.md:** Historical record of what got done in each session. Useful for forensics and pattern detection.
- **FEEDBACK-LOG.md:** Things that broke, lessons learned, course corrections. Read at session start to avoid repeating mistakes.
- **memory/context/:** Narrative context that doesn't fit elsewhere. Infrastructure snapshots, strategic thesis, team origin story. Start empty, add as needed.
- **memory/people/:** Profiles of team members, stakeholders, and external collaborators. Agents use this to understand who to route decisions to.
- **outputs/:** Everything your agents created this session—research summaries, prompt libraries, analysis, drafts. Separate from permanent project artefacts (those go in `01-PROJECTS/`).

**Critical distinction:** `_cowork/outputs/` is session-scoped ephemera. `01-PROJECTS/` is permanent artefacts. If something has an obvious home in PARA (e.g. a final architecture doc for a project), it lives there. If it's exploratory work from this session with no obvious permanent home, it goes in `_cowork/outputs/`.

### _system: Infrastructure State

**Purpose:** Snapshots of current system state—VPS details, deployed services, bot status, database schemas, API keys (encrypted).

```
_system/
├── services/
│   ├── vps-nodes.md                  ← hostnames, IPs, specs
│   ├── deployed-services.md          ← Docker containers, what's running
│   └── networking.md                 ← DNS, firewalls, tunnels
│
├── bots/                              ← active bot configs & state
│   ├── bot-status.txt                ← live status (refreshed hourly)
│   ├── crypto-bot-config.json        ← bot parameters
│   ├── market-bot-config.json
│   └── logs/                          ← recent bot activity
│
├── databases/
│   ├── schema-dump.sql               ← current schema (refreshed daily)
│   ├── backup-manifest.json          ← list of backups
│   └── migration-log.md              ← applied schema changes
│
└── agents/
    ├── agent-roster.md               ← who's deployed, what they do
    ├── agent-configs/                ← agent prompts & parameters
    └── memory-snapshots/             ← agent context snapshots (weekly)
```

**Why separate from _cowork?** Because agents and humans both need to query live system state. It's not session-scoped; it's always-on infrastructure data. When a new agent spins up, it reads `_system/agent-roster.md` to understand what the team already built.

### _products: Finished Artefacts

**Purpose:** Marketplace-ready, production deliverables. Separate tier from projects.

```
_products/
├── doctrines/                        ← Hive Doctrine products
│   ├── workspace-para-structure/     ← this document
│   ├── agent-memory-architecture/
│   └── session-protocol-v2/
│
├── tools/                            ← standalone utilities
│   ├── prompt-optimizer/
│   └── context-compiler/
│
└── courses/                          ← educational products
    ├── agent-operations-101/
    └── scaling-multi-agent-teams/
```

**Naming:** Use kebab-case, one folder per product. Inside each product folder: source files, generated assets, marketing copy.

### _media: Large Assets

**Purpose:** Images, video, audio—anything >10MB or binary.

```
_media/
├── screenshots/
│   ├── 2026-03/
│   └── 2026-02/
│
├── recordings/
│   ├── podcast-episodes/
│   └── demo-videos/
│
├── brand/
│   ├── logos/
│   ├── templates/
│   └── color-palettes/
│
└── datasets/
    ├── market-data-2026-q1/
    └── training-corpora/
```

**Don't store media in Git.** Use S3 or a CDN for anything >1MB. Store a manifest in `_system/` that points to the media URL.

## Naming Conventions

### Numbered Sequential Files

Use when reading/execution order matters:

```
01-product-overview.md        ✓ read first
02-market-analysis.md         ✓ read second
03-roadmap.md                 ✓ read third
```

Use in:
- Project setup docs
- Agent onboarding sequences
- Architecture decision records
- Runbooks with steps

### ALL-CAPS for Primary Session Documents

```
TASKS.md                       ← read this first
CONTEXT-THREADS.md            ← then this
SESSION-LOG.md                ← then this
```

Use for:
- Session startup checklist
- Active task list
- Status documents
- Critical reference

### Kebab-case for Folders

```
01-core-platform/   ✓
01-CorePlatform/    ✗
01_core_platform/   ✗
```

Reason: readable in terminal, sorts predictably, mixes well with numbered prefixes.

### Dated Snapshots

Use when archiving point-in-time state:

```
system-state-2026-03-09.md           ✓ clear timestamp
system-state-2026-03-09T14-30.md     ✓ with time precision
system-state-latest.md               ✗ ambiguous
```

Use for:
- Infrastructure snapshots
- Agent memory exports
- Periodic backups
- Historical versions

## How Agents Discover and Use This Structure

### On Startup

A new agent reads this map in this order:

1. **README in workspace root** — explains the folder layout
2. **`_cowork/memory/CONTEXT-THREADS.md`** — understands current work threads
3. **`_cowork/memory/context/infrastructure.md`** — loads system state
4. **`_cowork/memory/people/`** — learns about team members
5. **`_system/agent-roster.md`** — discovers what other agents exist and what they do
6. **Relevant `01-PROJECTS/*/README.md`** — reads project context for their assigned work

This takes 2–3 minutes. By the time they're done, they understand the full landscape.

### During Execution

When an agent needs to find something, it queries by tier:

**"Where would the database schema live?"**
→ `_system/databases/schema-dump.sql`

**"What's the current status of Project X?"**
→ `01-PROJECTS/XX-project-name/README.md` or `_cowork/memory/projects/project-x.md`

**"What decisions have we already made about authentication?"**
→ `03-RESOURCES/` or `04-ARCHIVE/` (check old projects for precedent)

**"Who do I ask about vendor integrations?"**
→ `_cowork/memory/people/stakeholder-map.md` or `_system/agents/agent-roster.md`

### At Session End

Agents update:
- **`_cowork/TASKS.md`** — new tasks, status changes
- **`_cowork/memory/CONTEXT-THREADS.md`** — thread progress, next actions, blocking issues
- **`_cowork/memory/FEEDBACK-LOG.md`** — anything that broke or surprised them
- **`_system/bot-status.txt`** — live bot state (if applicable)

This takes 5 minutes and makes the next session 10x faster.

## Implementation Steps

### Phase 1: Set Up Root PARA (30 minutes)

```bash
mkdir -p ~/workspace/{00-INBOX,01-PROJECTS,02-AREAS,03-RESOURCES,04-ARCHIVE}
mkdir -p ~/workspace/{_cowork,_system,_products,_media}
```

Create `~/workspace/README.md` with an overview pointing to this doc.

### Phase 2: Initialize Memory Layer (20 minutes)

```bash
mkdir -p ~/workspace/_cowork/{inbox,memory,outputs,archive}
mkdir -p ~/workspace/_cowork/memory/{context,people,projects}

# Create core memory files
touch ~/workspace/_cowork/{TASKS,claude-settings}.json
touch ~/workspace/_cowork/memory/{CONTEXT-THREADS,SESSION-LOG,FEEDBACK-LOG,WORKING-STYLE}.md
```

Populate with templates (examples below).

### Phase 3: Set Up Infrastructure State (15 minutes)

```bash
mkdir -p ~/workspace/_system/{services,bots,databases,agents}

# Create state files
touch ~/workspace/_system/{services/vps-nodes,bots/bot-status,databases/schema-dump}.md
touch ~/workspace/_system/agents/agent-roster.md
```

Add your current VPS nodes, bot configs, database schema, and agent list.

### Phase 4: Add Git & Version Control (10 minutes)

```bash
cd ~/workspace
git init
echo '_media/' >> .gitignore
echo '_system/secrets/' >> .gitignore
git add .
git commit -m "init: PARA workspace structure"
```

Use shallow commits for snapshot updates. E.g. "snapshot: bot status 2026-03-09".

## Template Files

### _cowork/TASKS.md

```markdown
# Task List

## URGENT (this week)
- [ ] Task 1
- [ ] Task 2

## ACTIVE (in progress)
- [ ] Task 3
- [ ] Task 4

## WAITING (blocked on someone else)
- [ ] Task 5

## SOMEDAY (backlog)
- [ ] Task 6

## DONE (completed this session)
- [x] Task 7

Last updated: 2026-03-09 by [Agent Name]
```

### _cowork/memory/CONTEXT-THREADS.md

```markdown
# Active Work Threads

## Platform Core

**Status:** In progress
**Owner:** Agent Alpha
**Next action:** Architecture review by Day X
**Blocking:** Design doc pending from PM
**Links:** `01-PROJECTS/01-core-platform/`

## Market Analysis

**Status:** Awaiting data refresh
**Owner:** Agent Beta
**Next action:** Rerun competitor benchmarks when data arrives
**Links:** `01-PROJECTS/02-market-analysis/`

## Infrastructure

**Status:** Stable
**Owner:** SysOps
**Last check:** 2026-03-09 14:30 UTC
**Issues:** None
**Links:** `_system/services/`
```

### _system/agent-roster.md

```markdown
# Agent Roster

| Agent | Role | Owner | Last Ping |
|-------|------|-------|-----------|
| Alpha | Core platform development | Operator | 2026-03-09 10:00 |
| Beta | Market intelligence | Agent-R | 2026-03-09 11:30 |
| Gamma | Infrastructure ops | Auto | 2026-03-09 13:15 |
```

## Common Mistakes & How to Avoid Them

**Mistake 1:** Putting temporary scratch files in `01-PROJECTS/`
→ **Fix:** Use `_cowork/outputs/` for session work. Move permanent artefacts to projects at session end.

**Mistake 2:** Renaming or reorganising `_obsidian/` / synced folders
→ **Fix:** If you use Obsidian or Syncthing, treat synced folders as immutable. Changes propagate to all connected machines. Use separate `_cowork/` for Claude-only work.

**Mistake 3:** Storing API keys or credentials in this structure
→ **Fix:** Keep secrets in a `.env` file or password manager. Link from `_system/` with a note: "see .env or vault system."

**Mistake 4:** Letting `_cowork/inbox/` grow unbounded
→ **Fix:** Set a weekly reminder to process and archive inbox items. If something's been in inbox for two weeks, move it to `04-ARCHIVE/`.

**Mistake 5:** Not dating snapshots, then wondering which is current
→ **Fix:** Always use timestamps: `system-state-2026-03-09.md`. Check timestamps when querying historical state.

## Why This Matters

PARA looks simple. It's actually a contract between you and your agents about how to find things. When that contract is clear:

- Agents onboard in 2 minutes instead of 2 hours
- You stop losing work in nested folders
- Context switches cost 5 minutes instead of 30
- Your team can operate async without colliding on file versions
- New people (or new agents) inherit a clear decision trail

It's infrastructure for thought. Build it once, and every session gets better.

---

**Questions?** Read the full Tiago Forte PARA guide, then adapt it to your workflow. This template is a starting point, not dogma.
