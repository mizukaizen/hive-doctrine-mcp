# HD-4004: Content Creator Kit

A Claude Code configuration package for content creators who publish blogs, newsletters, and social media. Built around SEO-driven content workflows with consistent publishing cadence.

## What's Inside

| Component | Purpose |
|-----------|---------|
| `CLAUDE.md` | Content creator context — SEO, publishing rhythm, repurposing |
| `settings.json` | Model and permission configuration |
| `agents/writer.md` | Drafts blog posts, threads, newsletters with brand voice |
| `agents/editor.md` | Reviews for clarity, SEO, readability, style compliance |
| `commands/draft.md` | `/draft` — Start a new content piece from outline to first draft |
| `commands/seo-check.md` | `/seo-check` — Analyse content for search optimisation |
| `commands/schedule.md` | `/schedule` — Create social media schedule from published content |
| `skills/blog-writing/` | End-to-end blog post creation process |
| `skills/seo-optimisation/` | SEO analysis and improvement workflow |
| `hooks/readability-check.md` | Auto-check reading level before publishing |

## Installation

Copy this folder into your content project root as `.claude/`:

```bash
cp -r HD-4004-content-creator/ /path/to/your/content-project/.claude/
```

Move `CLAUDE.md` to your project root:

```bash
mv .claude/CLAUDE.md ./CLAUDE.md
```

## Philosophy

Content that ranks is content that serves. This kit enforces:

1. **Research before writing** — understand what people search for, then write to answer
2. **Structure for scanning** — headers, short paragraphs, clear takeaways
3. **Optimise without stuffing** — SEO is about relevance, not repetition
4. **Repurpose everything** — one blog post becomes a thread, a newsletter section, and three social posts

## Slash Commands

- `/draft` — Start a new content piece with structured outline and first draft
- `/seo-check` — Run SEO analysis on existing content
- `/schedule` — Generate social media schedule from published content

## Pricing

$29 — one-time purchase. Write as much as you want.

---

Part of The Hive Doctrine · hivedoctrine.com
