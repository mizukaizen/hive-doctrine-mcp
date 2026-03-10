# Hook: Readability Check

Automatically checks the reading level of content before it is marked as ready to publish.

## Trigger

This hook activates when:
- A content file's frontmatter status is changed from `draft` or `review` to `published`
- The user says "ready to publish" or "mark as final"
- The editor agent approves a piece for publication

## Checks

### 1. Flesch-Kincaid Grade Level
Estimate the reading grade level by analysing:
- Average sentence length (words per sentence)
- Average syllable count per word
- Approximate formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59

**Thresholds:**
- Grade 6-8: Ideal for most online content. Pass.
- Grade 9-10: Acceptable but could be simpler. Warn with specific sections to simplify.
- Grade 11+: Too complex for general audiences. Block and flag the densest sections.

### 2. Section-Level Analysis
Do not just check the overall score — check each H2 section individually. A post can average Grade 8 while having one section at Grade 13 that loses readers.

For each section above Grade 10:
- Identify the longest sentences (over 30 words)
- Identify jargon or technical terms without definitions
- Suggest specific rewrites

### 3. Paragraph Length
Flag any paragraph with more than 5 sentences. Online readers scan — dense paragraphs get skipped.

### 4. Passive Voice
Estimate passive voice usage. Flag if more than 15% of sentences use passive construction. Provide examples and active-voice alternatives.

## Output

```markdown
## Readability Report

**Overall Grade Level:** [X]
**Status:** Pass / Warn / Block

### Section Scores
| Section | Grade | Status |
|---------|-------|--------|
| [H2 title] | [X] | [Pass/Warn/Block] |

### Issues Found
1. **[Section]:** Sentence "[long sentence...]" is [X] words. Suggest breaking into two sentences.
2. **[Section]:** Term "[jargon]" may not be understood by general audience. Define on first use.
3. **[Section]:** [X] sentences use passive voice. Consider active alternatives.

### Recommendation
[Pass: Ready to publish / Warn: Publish with noted caveats / Block: Revise flagged sections first]
```

## Rules

- Do not block content aimed at expert audiences from being published at Grade 10-11. Adjust expectations based on the target reader defined in CLAUDE.md.
- Readability is about accessibility, not dumbing down. Suggest simpler phrasing, not simpler ideas.
- If the overall score passes but one section is flagged, warn but do not block. The author may have intentionally gone deeper in that section.
