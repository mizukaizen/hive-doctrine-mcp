# HD-4003: OSS Maintainer Kit

A Claude Code configuration package for open source project maintainers. Covers the full maintenance lifecycle: issue triage, pull request review, release management, and community health.

## What's Inside

| Component | Purpose |
|-----------|---------|
| `CLAUDE.md` | OSS maintainer context — semver, community, contributor experience |
| `settings.json` | Model and permission configuration |
| `agents/maintainer.md` | Issue triage, release management, community coordination |
| `agents/reviewer.md` | Deep code review, breaking change detection |
| `commands/triage.md` | `/triage` — Triage open issues systematically |
| `commands/release.md` | `/release` — Prepare and publish a release |
| `commands/changelog.md` | `/changelog` — Generate changelog from commits |
| `skills/pr-review/` | Structured pull request review process |
| `skills/issue-labelling/` | Consistent issue categorisation |
| `hooks/semver-check.md` | Verify breaking changes are documented before version bump |

## Installation

Copy this folder into your project root as `.claude/`:

```bash
cp -r HD-4003-oss-maintainer/ /path/to/your/oss-project/.claude/
```

Move `CLAUDE.md` to your project root:

```bash
mv .claude/CLAUDE.md ./CLAUDE.md
```

## Philosophy

Good open source maintenance is mostly invisible. Users notice when things break, not when they work. This kit helps you:

1. **Triage efficiently** — label, prioritise, and deduplicate issues without burning out
2. **Review thoroughly** — catch breaking changes, missing tests, and documentation gaps
3. **Release confidently** — semver-compliant releases with clear changelogs
4. **Communicate clearly** — contributors know what is expected and what to expect

## Slash Commands

- `/triage` — Systematically triage open issues
- `/release` — Prepare a semver-compliant release with changelog
- `/changelog` — Generate changelog from git history since last tag

## Pricing

$39 — one-time purchase. Use it on as many projects as you maintain.

---

Part of The Hive Doctrine · hivedoctrine.com
