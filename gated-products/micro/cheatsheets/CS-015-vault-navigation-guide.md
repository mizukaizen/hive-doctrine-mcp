---
title: "Vault Navigation Guide — Cheat Sheet"
hive_doctrine_id: HD-0029
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0029
full_product_price: 29
---

# Vault Navigation Guide — Cheat Sheet

## What It Is

A system for teaching agents to navigate structured knowledge bases (Obsidian vaults, file trees, documentation repos). Agents learn where to find things without searching blindly.

## Folder Structure Convention

Use a consistent, numbered top-level structure:

```
00-INBOX/          — Unprocessed items
01-PROJECTS/       — Active work
02-AREAS/          — Ongoing responsibilities
03-RESOURCES/      — Reference material
04-ARCHIVE/        — Inactive items
```

## Triage Decision Tree (5-7 Levels)

When an agent encounters a new file or needs to file something:

1. **Is it actionable?** No → Resources or Archive
2. **Is it tied to a deadline?** Yes → Projects
3. **Is it an ongoing responsibility?** Yes → Areas
4. **Is it reference material?** Yes → Resources
5. **Is it no longer relevant?** Yes → Archive
6. **Not sure?** → Inbox (process later)

## "Where to Find X" Tables

Embed these in the agent's system prompt or knowledge base:

| Looking for... | Go to... |
|----------------|----------|
| Active project files | `01-PROJECTS/[project-name]/` |
| Meeting notes | `02-AREAS/meetings/` |
| API documentation | `03-RESOURCES/docs/` |
| Old project files | `04-ARCHIVE/[project-name]/` |
| Unprocessed items | `00-INBOX/` |
| Agent configs | `01-PROJECTS/agents/[agent-name]/` |

## Naming Conventions

- **Folders:** lowercase, hyphens, numbered prefix (`01-project-name`)
- **Files:** lowercase, hyphens (`meeting-notes-2026-03-09.md`)
- **No spaces** in file or folder names
- **Date format:** YYYY-MM-DD (ISO 8601)

## Hard Rules for Agents

1. **Never create top-level folders** — the structure is fixed
2. **Never move files between top-level folders without approval** (except Inbox → destination)
3. **Always use absolute paths** — relative paths break across contexts
4. **Never delete from Archive** — it's the final resting place
5. **Process Inbox daily** — items left in Inbox rot

## Trigger Phrases

Teach agents to recognise navigation cues:

| Phrase | Action |
|--------|--------|
| "Where's the..." | Consult the "Where to Find X" table |
| "File this in..." | Use the triage decision tree |
| "Find all..." | Search within the appropriate top-level folder |
| "What's new?" | Check Inbox and recent modifications |

---

*This is the condensed version. The full guide (HD-0029, $29) covers the complete vault navigation system with triage decision trees, naming conventions, and agent training procedures. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
