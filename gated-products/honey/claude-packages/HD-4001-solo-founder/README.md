# HD-4001: Solo Founder Kit

A Claude Code configuration package for solo founders building products alone. Designed around the lean startup loop: **validate, build, ship, iterate**.

## What's Inside

| Component | Purpose |
|-----------|---------|
| `CLAUDE.md` | Project context — sets Claude up as your co-founder |
| `settings.json` | Model and permission configuration |
| `agents/product-manager.md` | Idea validation, specs, backlog prioritisation |
| `agents/engineer.md` | Code, test, deploy — focused on shipping |
| `commands/validate.md` | `/validate` — Run idea validation framework |
| `commands/ship.md` | `/ship` — Pre-ship checklist and deploy |
| `commands/retro.md` | `/retro` — Weekly retrospective |
| `skills/lean-canvas/` | Generate lean canvas for new ideas |
| `skills/mvp-scoping/` | Scope MVPs ruthlessly |
| `hooks/pre-deploy.md` | Auto-run tests before any deployment |

## Installation

Copy this folder into your project root as `.claude/`:

```bash
cp -r HD-4001-solo-founder/ /path/to/your/project/.claude/
```

Move `CLAUDE.md` to your project root:

```bash
mv .claude/CLAUDE.md ./CLAUDE.md
```

## Philosophy

You are one person. You cannot do everything. This kit forces you to:

1. **Validate before building** — kill bad ideas early
2. **Ship the smallest thing** — perfectionism is the enemy
3. **Measure what matters** — vanity metrics are noise
4. **Iterate weekly** — retros keep you honest

The agents are opinionated. They will push back on scope creep, unnecessary features, and premature optimisation. That's the point.

## Slash Commands

- `/validate` — Run a structured idea validation (TAM, competitors, willingness to pay)
- `/ship` — Pre-ship checklist: tests, errors, performance, deploy
- `/retro` — Weekly retrospective: shipped, blocked, changes

## Pricing

$39 — one-time purchase. No subscriptions. Updates included.

---

Part of The Hive Doctrine · hivedoctrine.com
