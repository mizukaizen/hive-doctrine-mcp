# Skill: Blog Writing

Use when creating a blog post from scratch. Guides the full process from topic research through to a publish-ready draft with proper SEO structure and heading hierarchy.

## Trigger

Invoke this skill when the user wants to write a blog post, create long-form content, or needs help with an article. Also activates when the `/draft` command is used.

## Process

### 1. Topic Validation
Before writing, confirm:
- **Target keyword exists:** Is anyone searching for this?
- **Competition is manageable:** Can you realistically rank?
- **You have something to add:** What angle is missing from existing content?

If any answer is "no," suggest alternative topics before proceeding.

### 2. Search Intent Alignment
Determine what the searcher actually wants:
- **Informational:** They want to learn. Write a comprehensive guide.
- **Comparison:** They want to choose. Write a balanced comparison with a recommendation.
- **How-to:** They want to do. Write step-by-step instructions with examples.
- **List:** They want options. Write a curated list with context for each item.

Match your content structure to the intent. A how-to post structured as a listicle will frustrate readers.

### 3. Outline Creation
Build the skeleton before writing:

- **H1 (title):** Includes primary keyword, under 60 characters, promises clear value
- **Introduction (no heading):** 2-3 sentences. State the problem, hint at the solution, establish credibility.
- **H2 sections (3-6):** Each answers one question the reader has. Logical flow from one to the next.
- **H3 subsections:** Break down complex H2 sections. Not every H2 needs H3s.
- **Conclusion H2:** Summary of key points, clear next step, call to action.

### 4. Drafting Guidelines
- **First paragraph:** Must contain the primary keyword and establish what the reader will learn.
- **Body paragraphs:** 3-4 sentences max. One idea per paragraph.
- **Examples:** At least one concrete example per major section. Abstract advice without examples is forgettable.
- **Transitions:** Each section should flow logically into the next. If it does not, the outline needs restructuring.
- **Formatting:** Use bold for key phrases, bullet points for lists of 3+, code blocks for technical content.
- **Length:** 1,500-2,500 words for most topics. Go longer only if the depth demands it.

### 5. Frontmatter
Every post needs frontmatter:

```yaml
---
title: "Post Title"
date: YYYY-MM-DD
status: draft | review | published
keyword: "primary keyword"
description: "Meta description, 150-160 chars"
tags: [tag1, tag2]
---
```

### 6. Self-Check Before Handoff
Before passing to the editor, verify:
- [ ] Primary keyword appears in title, first paragraph, one H2, and conclusion
- [ ] Meta description is written and under 160 characters
- [ ] At least 2 internal link placeholders marked
- [ ] At least 1 external source referenced
- [ ] No section exceeds 400 words without a subheading
- [ ] Opening paragraph hooks the reader within 2 sentences

## Output

Save to `content/blog/[YYYY-MM-DD]-[slug].md`. Flag for editorial review.

## Rules

- Never publish a first draft. Every post goes through the editor agent.
- If research reveals the topic is too broad, narrow it. "Marketing" is not a blog post. "Email subject line formulas that increase open rates" is.
- Quality over quantity. One excellent post per week beats three mediocre ones.
