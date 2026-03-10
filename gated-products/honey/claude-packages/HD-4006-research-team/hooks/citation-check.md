# Citation Check Hook

## Trigger

Before finalising any paper section (files in `paper/` directory).

## Behaviour

Scan the document for citation integrity:

### Checks

1. **Uncited claims.** Identify factual statements that lack a citation. Exclude:
   - Common knowledge ("The Earth orbits the Sun")
   - Statements about the current study's methodology
   - Logical deductions clearly derived from cited premises

2. **Orphaned references.** Check that every entry in the bibliography is cited at least once in the text. Flag unused references.

3. **Missing references.** Check that every in-text citation (Author, Year) has a corresponding entry in the bibliography file.

4. **Citation format.** Verify citations follow the required format:
   - Single author: (Smith, 2023)
   - Two authors: (Smith & Jones, 2023)
   - Three or more: (Smith et al., 2023)
   - Multiple citations: (Jones, 2022; Smith, 2023) — alphabetical order

5. **Self-citation ratio.** If more than 30% of citations are self-citations, flag for review.

### Actions

1. **Block** — If more than 3 factual claims lack citations, halt and list them. Require citations before proceeding.
2. **Warn** — If 1-3 claims lack citations, or if orphaned/missing references are found, warn and list issues.
3. **Pass** — If all checks pass, proceed silently.

## Output on Failure

```
CITATION CHECK: [N] issues found

UNCITED CLAIMS:
  - Line X: "[claim text]" — needs citation
  - Line Y: "[claim text]" — needs citation

ORPHANED REFERENCES:
  - Smith (2020) — in bibliography but not cited in text

MISSING REFERENCES:
  - Jones (2023) — cited on line X but not in bibliography

Action: Resolve citation issues before finalising this section.
```
