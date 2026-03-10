# HD-4002: Agency Team Kit

A Claude Code configuration package for development agencies managing multiple client projects simultaneously. Built for teams that need structure, consistency, and clean handoffs.

## What's Inside

| Component | Purpose |
|-----------|---------|
| `CLAUDE.md` | Agency context — multi-client, team coordination, standards |
| `settings.json` | Model and permission configuration |
| `agents/project-lead.md` | Client management, deliverable tracking, coordination |
| `agents/developer.md` | Implementation per client spec, coding standards |
| `agents/qa.md` | Testing, acceptance criteria validation, cross-browser |
| `commands/new-client.md` | `/new-client` — Scaffold a new client project |
| `commands/handoff.md` | `/handoff` — Generate handoff documentation |
| `commands/status.md` | `/status` — Cross-project status report |
| `skills/client-onboarding/` | Structured client onboarding process |
| `skills/deliverable-review/` | Pre-handoff quality review |
| `hooks/client-context.md` | Auto-load client constraints on project switch |

## Installation

Copy this folder into your agency's root workspace as `.claude/`:

```bash
cp -r HD-4002-agency-team/ /path/to/agency-workspace/.claude/
```

Move `CLAUDE.md` to your workspace root:

```bash
mv .claude/CLAUDE.md ./CLAUDE.md
```

## Philosophy

Agencies fail in the gaps: unclear handoffs, inconsistent code quality, client context lost between team members. This kit closes those gaps by:

1. **Standardising project setup** — every client gets the same scaffold
2. **Documenting decisions as they happen** — not after the project ends
3. **Forcing quality checks before handoff** — the client sees polished work
4. **Making context portable** — any team member can pick up any project

## Slash Commands

- `/new-client` — Scaffold a new client project with standard structure
- `/handoff` — Generate complete handoff documentation
- `/status` — Status report across all active client projects

## Pricing

$49 — one-time purchase. Covers the entire agency. No per-seat fees.

---

Part of The Hive Doctrine · hivedoctrine.com
