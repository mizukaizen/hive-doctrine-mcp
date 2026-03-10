# Command: /seo-check

Run an SEO analysis on existing content and provide actionable improvement recommendations.

## Usage

```
/seo-check [file-path]
```

## Process

### Step 1: Read the Content
Load the specified file and extract:
- Title / H1
- Meta description (from frontmatter or first paragraph)
- All headings (H2, H3, H4)
- Word count
- Primary keyword (from frontmatter or inferred from title)

### Step 2: Keyword Analysis
Check keyword placement:

| Location | Required | Found | Status |
|----------|----------|-------|--------|
| Title / H1 | Yes | [Yes/No] | [Pass/Fail] |
| First paragraph | Yes | [Yes/No] | [Pass/Fail] |
| At least one H2 | Yes | [Yes/No] | [Pass/Fail] |
| Meta description | Yes | [Yes/No] | [Pass/Fail] |
| Image alt text | Yes | [Yes/No] | [Pass/Fail] |

Calculate keyword density: Occurrences / total words. Target: 0.5%-1.5%. Flag if below 0.5% (underused) or above 2% (keyword stuffing).

### Step 3: Structure Analysis
- **Heading hierarchy:** Is it correct (H1 > H2 > H3)? Are there skipped levels?
- **Heading count:** At least 3 H2 sections for posts over 1,000 words.
- **Paragraph length:** Flag any paragraph over 5 sentences.
- **Content length:** Is it competitive with top-ranking content for the target keyword?

### Step 4: Link Analysis
- **Internal links:** Count and list. Target: at least 2 per post.
- **External links:** Count and list. Target: at least 1 authoritative source.
- **Broken links:** Check for obvious issues (404 patterns, dead domains).

### Step 5: Meta Tags
- **Title tag:** Under 60 characters? Includes keyword?
- **Meta description:** 150-160 characters? Includes keyword? Compelling?
- **URL slug:** Short, descriptive, includes keyword?

### Step 6: Generate Report

```markdown
# SEO Analysis: [Post Title]

**Date:** [YYYY-MM-DD]
**Overall Score:** [X/10]
**Primary Keyword:** [keyword]
**Keyword Density:** [X]%

## Keyword Placement
[Table from Step 2]

## Issues Found
### Must Fix
1. [Issue and specific fix]

### Should Fix
1. [Issue and suggested improvement]

## Recommendations
1. [Specific, actionable recommendation]
2. [Specific, actionable recommendation]
3. [Specific, actionable recommendation]

## Comparison to Competitors
- Average competing content length: [X] words
- Your content length: [X] words
- Topics covered by competitors but missing from your content: [list]
```

## Rules

- Score must be justified. Do not give a 9/10 and then list 5 issues.
- Recommendations must be specific and actionable. "Improve SEO" is useless. "Add the keyword 'content marketing' to the H2 in section 3" is useful.
- Do not recommend keyword stuffing. Natural placement always wins.
- If the content is under 1,000 words for a competitive keyword, recommend expanding with specific section suggestions.
