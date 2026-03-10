# Skill: SEO Optimisation

Use when optimising existing content for search. Analyses keyword placement, meta tags, internal linking structure, readability, and competitive positioning. Produces specific, actionable improvements.

## Trigger

Invoke this skill when the user wants to improve an existing post's search ranking, when the `/seo-check` command runs, or when a post has been published for 30+ days without ranking.

## Process

### 1. Content Audit
Read the content and extract:
- Current title and meta description
- All headings with hierarchy
- Word count and reading time
- All links (internal and external)
- All images and their alt text
- Primary keyword (from frontmatter or inferred)

### 2. Keyword Analysis

**Placement Check:**
- Title: Does it contain the primary keyword naturally?
- First 100 words: Does the keyword appear early?
- H2 headings: Is the keyword in at least one H2?
- Meta description: Is the keyword included?
- Alt text: Does at least one image alt text include the keyword?
- URL slug: Is the keyword in the URL?

**Density Check:**
- Count keyword occurrences vs total words
- Target range: 0.5%-1.5%
- Below 0.5%: Content may not signal relevance strongly enough
- Above 2.0%: Risk of keyword stuffing penalty

**Semantic Keywords:**
- Identify related terms that should appear in the content
- Check for natural inclusion of synonyms and related concepts
- Suggest additions where semantic coverage is thin

### 3. Technical SEO

**Meta Tags:**
- Title tag: Under 60 characters? Unique? Compelling?
- Meta description: 150-160 characters? Includes keyword? Creates curiosity?
- Open Graph tags: Present for social sharing?

**Structure:**
- Heading hierarchy correct (no skipped levels)?
- Content chunked into scannable sections?
- Table of contents warranted (for posts over 2,000 words)?

**Links:**
- Internal links: At least 2, pointing to relevant related content
- External links: At least 1 authoritative source
- Anchor text: Descriptive (not "click here" or "this article")
- Broken links: Any obvious dead links?

### 4. Readability Assessment

- Average sentence length (target: 15-20 words)
- Paragraph length (target: 3-4 sentences max)
- Passive voice percentage (target: under 15%)
- Flesch-Kincaid grade level (target: 7-8 for general audiences)
- Transition word usage (each section should flow logically)

### 5. Competitive Comparison

- What are the top 3-5 results covering that this content does not?
- Is the content length competitive?
- Does the content answer the search intent better than competitors?
- What unique value does this content provide?

### 6. Actionable Recommendations

Produce a prioritised list:

```markdown
## Priority 1 (Do Now)
1. [Specific change with exact text to add/modify]
2. [Specific change]

## Priority 2 (Do This Week)
1. [Specific improvement]
2. [Specific improvement]

## Priority 3 (Nice to Have)
1. [Optional enhancement]
```

## Rules

- Every recommendation must be specific and implementable. "Improve your SEO" is not a recommendation. "Add the phrase 'email marketing tools' to the H2 heading in section 3" is.
- Do not recommend changes that sacrifice readability for keyword placement.
- If the content is fundamentally misaligned with search intent, say so directly rather than suggesting surface-level optimisations.
- Track recommendations in `content/keyword-tracker.md` so progress can be measured over time.
