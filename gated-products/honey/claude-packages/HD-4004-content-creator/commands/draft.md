# Command: /draft

Start a new content piece from topic selection through to first draft.

## Usage

```
/draft [topic or keyword]
```

## Process

### Step 1: Keyword and Intent Research
Identify:
- **Primary keyword:** The main search term to target
- **Secondary keywords:** 2-3 related terms to include naturally
- **Search intent:** What does someone searching this actually want?
  - Informational ("how to...", "what is...")
  - Comparison ("X vs Y", "best tools for...")
  - Transactional ("buy...", "pricing for...")

### Step 2: Competitive Analysis
Review what currently ranks for this keyword:
- What topics do the top results cover?
- What angle or information is missing?
- What is the typical content length?
- What can you add that they have not?

### Step 3: Create Outline
Build a structured outline:

```markdown
# [Headline — includes primary keyword, under 60 chars]

**Meta description:** [150-160 chars, includes keyword, compelling]
**Primary keyword:** [keyword]
**Secondary keywords:** [keyword 2], [keyword 3]
**Target length:** [X] words
**Search intent:** [informational/comparison/transactional]

## [H2: Opening section — hook and problem statement]

## [H2: Core concept or solution]
### [H3: Sub-topic 1]
### [H3: Sub-topic 2]

## [H2: Practical application or examples]

## [H2: Common mistakes or misconceptions]

## [H2: Conclusion and next steps]
```

### Step 4: Write First Draft
Following the approved outline, write the full draft:
- Open with a hook that establishes why this matters
- Each H2 section addresses one main point
- Include at least one concrete example per major section
- Close with a clear takeaway and call to action

### Step 5: Save and Handoff
Save to `content/blog/[YYYY-MM-DD]-[slug].md` with frontmatter:

```markdown
---
title: "[Headline]"
date: [YYYY-MM-DD]
status: draft
keyword: "[primary keyword]"
description: "[meta description]"
---
```

Flag the draft for editorial review.

## Rules

- Do not skip the outline step. Writing without structure produces unfocused content.
- The outline must be approved (or at least reviewed) before drafting begins.
- First drafts are allowed to be rough. Get the ideas down; editing comes next.
- If keyword research reveals the topic is too competitive or too low-volume, report back and suggest alternatives before drafting.
