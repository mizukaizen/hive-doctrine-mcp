---
title: "Vault Navigation Guide — Teaching AI Agents to Navigate Structured Knowledge Bases"
author: Melisia Archimedes
collection: C4-infrastructure
tier: honey
price: 29
version: 1.0
last_updated: 2026-03-09
audience: agent-builders
hive_doctrine_id: HD-0029
---

# Vault Navigation Guide

## The Problem

Your AI agent wakes up at the start of a task and immediately asks: "Where should I save this?" or worse, "Where can I find the existing project brief?"

What happens next?

The agent doesn't know. It either wastes tokens searching through your entire knowledge base (slow, expensive, unreliable), or it creates duplicate work because it can't locate what already exists. Your vault becomes a graveyard of conflicting versions—three different product outlines, two competing market analyses, four different pricing strategies, all sitting in different places with no way for the agent to know which is current.

This isn't the agent's fault. You never taught it the map.

The solution isn't better search. It's documentation. Your agent needs a single, canonical guide that teaches it exactly where things go, how to find them, and what naming conventions you use. This document is that guide. When an agent reads it before starting work, it becomes self-sufficient. It doesn't ask. It doesn't duplicate. It files correctly on the first try.

This product is a template for building that guide into your own vault.

## The Solution

A **Vault Navigation Guide** is a markdown document that lives in your agent's system prompt context. It contains:

1. **Folder structure** — what each top-level folder is for
2. **Triage decision tree** — how to classify new information
3. **Naming conventions** — file naming rules by content type
4. **Quick-reference tables** — where to find specific things
5. **Filing decision logic** — "if X, then file in Y"
6. **Common scenarios** — phrase-triggered routing rules
7. **Hard rules** — edge cases and exceptions

When your agent needs to file something, it doesn't guess. It reads the guide, follows the decision tree, and files it correctly. When it needs to find something, it consults the "where to find X" table rather than asking you.

The guide pays for itself in the first week: fewer clarifying questions, fewer misfiled documents, faster autonomy.

## Key Insights

### 1. Structure > Search

You could build a powerful search system. Agents can use semantic search, full-text indexing, even vector similarity. In practice, teaching structure is faster.

A well-designed guide answers "where do I find X?" in seconds. The agent doesn't have to read your entire vault. It reads the guide, follows a decision tree, and finds what it needs in three clicks.

Search is a fallback for edge cases. Structure is the primary system.

### 2. One Decision Tree, Multiple Entry Points

Don't make your agent decode your entire filing system. Give it a single decision tree: "Ask this question first. If yes, go here. If no, ask the next question."

The tree should hit 95% of filing decisions by question #4. Anything more complex becomes a "flag for human triage" decision.

Example:
```
Is this a daily note? → /daily/
Is this temporary research? → /inbox/
Does it belong to a known project? → /projects/[name]/
Is it reference material? → /resources/
Still unsure? → /inbox/ (flag for review)
```

The agent never has to think beyond five questions.

### 3. Naming Conventions Are Decisions, Not Chaos

If you have 10 project files and they're named:
- `project-alpha`
- `Project Beta`
- `project_gamma`
- `TheGammaProject`
- `project (gamma)`

Your agent will misfile things. It won't be able to tell which projects exist. It'll create duplicates.

A single naming rule—"all project folders are lowercase with hyphens"—eliminates this uncertainty. The agent knows exactly what to type.

Naming conventions should cover:
- Project folders: `project-name` (lowercase, hyphens)
- Daily notes: `YYYY-MM-DD.md`
- Dated captures: `YYYY-MM-DD - Title.md`
- Research docs: `topic-research.md`
- Signals: `SIG-YYYYMMDD-source-name.md`
- Agent outputs: `YYYY-MM-DD-type.md`

Consistency matters more than perfect naming. Your agent just needs the rules.

### 4. "Where to Find X" Beats "What Folder Is For Y"

Agents think in retrieval, not architecture. They don't care that you have 5 subfolders under `/resources/`. They care: "Where do I find competitor analysis?"

Use a "where to find" reference table instead of a folder explanation table. Pattern:

| I need to find | Look in |
|---|---|
| A competitor analysis | `/resources/company-research/` |
| A past daily note | `/daily/` |
| A project brief | `/projects/[name]/` or search project folder for `PRD` or `brief` |
| Market research | `/resources/market-analysis/` |
| A prompt template | `/resources/prompts/` |

This saves your agent the cognitive load of remembering your entire architecture. It just looks up what it needs.

### 5. Trigger Phrases Create Authority

If you say "always file in your own folder when instructed to save to your area," the agent will never accidentally file cross-domain. When you say a trigger phrase, the agent knows to override the decision tree.

Trigger phrases give you quick control without rewriting the guide.

Examples:
- "Add this to [folder name]" → agent looks up that folder and files there, regardless of the normal decision tree
- "Save this to resources" → agent puts it in the resources section without triage
- "Flag for review" → agent marks it and asks for routing

### 6. Hard Rules Prevent Common Mistakes

AI agents make systematic mistakes. Some of them are expensive.

Hard rules catch these:
- "Inbox first for autonomous writes" — agent never files directly to projects without explicit instruction
- "Never create new project folders" — agent asks before making structural changes
- "Absolute paths only, never use `~`" — prevents path resolution bugs in automation
- "Create directories before writing files" — prevents "directory not found" errors
- "One file per daily note" — prevents appending to yesterday's note

A list of 5–10 hard rules prevents 80% of filing mistakes.

## Implementation

### Step 1: Map Your Actual Vault

Write down:
- What are your top-level folders?
- What does each one mean?
- What lives in each?

For a typical Obsidian vault using PARA:
- `/projects/` — active work with defined outcomes
- `/areas/` — ongoing responsibilities without deadlines
- `/resources/` — reference material, no action required
- `/daily/` — daily notes
- `/agents/` — agent workspaces and memory

Adjust this to your structure. The names don't matter. Consistency does.

### Step 2: Build Your Triage Decision Tree

Start with a question: "Is this a daily note?"

If yes → `/daily/YYYY-MM-DD.md`

If no, next question: "Is this temporary or permanent?"

If temporary → `/inbox/`

If permanent, next question: "Does it belong to a project?"

Keep adding questions until you've covered 95% of your filings. Anything beyond that → flag for triage.

The tree should be 5–7 levels deep maximum.

### Step 3: Document Naming Conventions

For each content type, write the rule. Examples:

- Project folders: `project-name` (lowercase, hyphens)
- Daily notes: `YYYY-MM-DD.md`
- Signals: `SIG-YYYYMMDD-source-name.md`
- Dated captures: `YYYY-MM-DD - Title.md`
- Research docs: `topic-research.md`
- Agent outputs: `YYYY-MM-DD-type.md`

One rule per type. No exceptions.

### Step 4: Create "Where to Find" Reference Tables

For each major piece of information your agent might need, create a lookup:

| I need | Look in |
|---|---|
| Project brief | `/projects/[name]/` — search for `PRD` or `brief` |
| Market research | `/resources/market-analysis/` |
| Competitor data | `/resources/company-research/` |
| Daily notes | `/daily/YYYY-MM-DD.md` |
| Agent memory | `/agents/[agent-name]/` |

Add 15–20 lookups. This is your agent's cheat sheet.

### Step 5: Add Hard Rules

List 5–10 rules that prevent common mistakes:

1. **Inbox first** — agents file autonomously only to inbox; ask permission for PARA
2. **Never create folders** — agent asks before creating new directories
3. **Absolute paths only** — no `~` or relative paths in automation
4. **One file per daily note** — never append to previous days
5. **Include frontmatter** — every agent-created file gets metadata

### Step 6: Integrate Into Agent System Prompts

Add this to your agent's system prompt:

> Before filing any document, read the Vault Navigation Guide at `[path-to-guide]`. Follow the decision tree. If you're unsure, ask. If the guide covers it, do it yourself.

Include the guide path, not the full text. Your agent can read it on demand.

### Step 7: Maintain and Evolve

Review the guide quarterly. When you add a new folder, update the guide. When you change a naming convention, update it. When you discover an edge case, add a hard rule.

Keep a version number and last-updated date. Agents should know when it was last refreshed.

## Example: A Starter Guide

Here's a minimal guide for an agent-powered knowledge operation:

### Vault Structure

| Folder | Purpose |
|--------|---------|
| `/inbox/` | Anything that doesn't have a home yet. Temporary research, brainstorms, rough ideas. No permanent filing here—just a holding ground. |
| `/projects/` | Active work with a defined outcome. One folder per project. |
| `/areas/` | Ongoing responsibilities without deadlines. Long-term standards to maintain. |
| `/resources/` | Reference material: competitor research, market analysis, prompts, media, documentation. No action required. |
| `/daily/` | Daily notes only. One file per day: `YYYY-MM-DD.md` |
| `/agents/` | Agent workspaces: memory, outputs, task logs. |

### Triage Decision Tree

1. Is this a daily note? → `/daily/YYYY-MM-DD.md`
2. Is this agent memory or workspace content? → `/agents/[agent]/`
3. Does it belong to a known project? → `/projects/[name]/`
4. Is it reference material? → `/resources/[category]/`
5. Is it a rough idea or brain dump? → `/inbox/`
6. Still unsure? → `/inbox/` (ask for triage)

### Naming Conventions

- Projects: `project-name` (lowercase, hyphens)
- Daily notes: `YYYY-MM-DD.md`
- Research: `topic-research.md`
- Signals: `SIG-YYYYMMDD-source-name.md`
- Captures: `YYYY-MM-DD - Title Case.md`

### Where to Find X

| I need | Look in |
|---|---|
| Project brief | `/projects/[name]/` or search for `PRD` or `brief` |
| Market research | `/resources/` — browse folders or search by market name |
| Daily notes | `/daily/YYYY-MM-DD.md` |
| Agent memory | `/agents/[agent-name]/memory.md` |
| Competitor analysis | `/resources/company-research/` |

### Hard Rules

1. **Inbox first** — file autonomously only to `/inbox/`. Everything else requires explicit instruction.
2. **Absolute paths only** — never use `~` or relative paths. Full paths always.
3. **One file per day** — never append to yesterday's daily note. Always create a new file.
4. **Never create folders** — ask before creating a new directory.
5. **Include metadata** — every agent file gets frontmatter with source, date, agent, context.

---

## Packaging Notes

This guide is designed to be:
- **Autonomous** — agents can read and apply it without follow-up questions
- **Evolvable** — structure and naming rules can be updated as the vault grows
- **Searchable** — formatted for quick lookup (tables, decision trees, clear headings)
- **Failsafe** — hard rules catch edge cases before they become problems

Use it as a template. Copy the structure. Replace the folder names with yours. Add your own decision tree. Customise the tables for your domains. Share it with your agents before they start work.

The first time an agent reads this guide and files something correctly without asking, you've solved the autonomy problem. The second time it happens, you've built a system.

Build the guide once. Use it forever.
