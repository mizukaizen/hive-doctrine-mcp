# /draft-paper

Draft a paper section following academic conventions.

## Usage

```
/draft-paper --section "intro|methods|results|discussion|abstract" [--journal "<journal name>"] [--word-limit N]
```

## Behaviour

### 1. Gather Context

- Read `literature/synthesis.md` for background and citations (intro, discussion).
- Read `analysis/outputs/` for results and statistics (methods, results).
- Read `analysis/preregistration.md` for methodology details.
- If `--journal` is specified, adapt formatting to that journal's conventions.

### 2. Draft the Section

Generate the section following IMRaD conventions as defined in the writer agent's guidelines. Each section:

- **Abstract** — Structured: Background, Methods, Results, Conclusions. Typically 150-300 words.
- **Introduction** — Broad context to specific gap to hypothesis. Cite throughout.
- **Methods** — Reproducible detail. Past tense. Subheadings: Participants, Materials, Procedure, Analysis.
- **Results** — Pre-registered analyses first, then exploratory. APA-formatted statistics.
- **Discussion** — Summary, interpretation, comparison with literature, limitations, implications, conclusion.

### 3. Citation Check

After drafting, verify:
- Every factual claim has a citation.
- Every citation appears in the bibliography.
- No orphaned references (cited but not in text, or in text but not in reference list).

### 4. Output

Save to `paper/draft-[section].md`. Display the section with a word count and any citation warnings.

If the section references analyses not yet completed, flag them as "[PENDING: analysis of X required]" rather than fabricating results.

## Notes

- Never fabricate results or statistics. If data is not available, mark the gap explicitly.
- When writing the discussion, present limitations as specific methodological points, not generic disclaimers.
- If a word limit is specified, prioritise content ruthlessly. Cut padding before cutting substance.
