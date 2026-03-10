# /deliverable

Generate a structured client deliverable from analysis work.

## Usage

```
/deliverable "<deliverable title>" [--type report|memo|presentation] [--audience executive|technical|mixed]
```

## Behaviour

### 1. Gather Context

- Scan the `analysis/` directory for completed analyses.
- Scan the `scope/engagement-brief.md` for objectives and deliverable list.
- Identify which deliverable this corresponds to and update its status.

### 2. Generate Document

Create the deliverable in `deliverables/` with the appropriate structure:

**For reports (default):**
```markdown
# [Title]
**Date:** [today]
**Classification:** Confidential — [Client Name] Only
**Version:** 1.0 — Draft

---

## Executive Summary
[One page maximum. Lead with the recommendation.]

## Context
[Why this engagement exists. What triggered it.]

## Approach
[Methodology used. Data sources. Limitations.]

## Findings
### Finding 1: [Theme]
[Evidence-based finding with source citations]

### Finding 2: [Theme]
[Evidence-based finding with source citations]

## Recommendations
1. **[Action]** — [Owner] by [date]. Expected impact: [quantified where possible].
2. **[Action]** — [Owner] by [date]. Expected impact: [quantified where possible].

## Next Steps
- [ ] [Immediate action]
- [ ] [Follow-up action]

## Appendices
### A. Methodology
### B. Data Sources
### C. Detailed Analysis
```

**For memos:** Shorter format — situation, complication, resolution structure.

**For presentations:** Slide-by-slide outline with key message per slide and supporting data points.

### 3. Quality Check

After generating, verify:
- Every finding cites a source
- Every recommendation has an owner and timeline
- Executive summary is comprehensible standalone
- Run confidentiality hook

### 4. Output

Display the deliverable path and a summary of contents. Ask the user to review before marking as final.
