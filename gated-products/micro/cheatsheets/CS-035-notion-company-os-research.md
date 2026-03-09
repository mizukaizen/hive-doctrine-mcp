---
title: "Notion Company OS Research — Cheat Sheet"
hive_doctrine_id: HD-0079
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0079
full_product_price: 49
---

# Notion Company OS Research — Cheat Sheet

## What It Is

Architecture patterns extracted from 50+ Notion systems. The 3 essential databases, 5 common mistakes, and a 4-week implementation roadmap.

## 3 Essential Databases

Every Notion Company OS needs exactly three core databases. Everything else is a view or relation.

### 1. Contacts
- People, companies, partners
- Relations to Projects and Tasks
- Properties: Name, Type (person/company), Email, Status, Last Contact Date

### 2. Projects
- Active work with defined outcomes
- Relations to Contacts and Tasks
- Properties: Name, Status, Owner, Start Date, Due Date, Priority

### 3. Tasks
- Individual work items
- Relations to Projects (required) and Contacts (optional)
- Properties: Name, Status, Assignee, Due Date, Priority, Project (relation)

**Rule:** If it's not a Contact, Project, or Task, it's a view of one of these three.

## 5 Common Mistakes

1. **Too many databases** — 15+ databases that should be views of 3 core databases
2. **No relations** — databases exist in isolation; data is duplicated across them
3. **Status property sprawl** — 12 status options when 4 would do (Not Started, In Progress, Done, Blocked)
4. **Template overload** — 20 templates nobody uses; 2-3 well-designed templates are enough
5. **Missing archive flow** — completed projects stay in active views forever, cluttering everything

## 7 Design Principles

1. One source of truth per data type
2. Relations over duplication
3. Views over new databases
4. 4 statuses maximum per database
5. Archive completed items monthly
6. Templates for repeatable workflows only
7. Fewer properties, more consistently filled

## 4-Week Implementation Roadmap

| Week | Focus | Output |
|------|-------|--------|
| 1 | **Audit** — Map existing databases, identify duplication | Inventory of all databases + redundancy map |
| 2 | **Consolidate** — Merge into 3 core databases | Contacts, Projects, Tasks databases live |
| 3 | **Views** — Create filtered views for teams/workflows | Dashboard views per role |
| 4 | **Templates + Training** — Build 2-3 templates, train team | Templates live, team onboarded |

---

*This is the condensed version. The full guide (HD-0079, $49) covers the complete research from 50+ Notion systems with all 7 design principles, database schemas, and the full 4-week implementation roadmap. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
