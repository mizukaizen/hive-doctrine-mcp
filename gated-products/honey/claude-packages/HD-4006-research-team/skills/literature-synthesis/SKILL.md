# Literature Synthesis Skill

Use when synthesising research findings. Creates structured literature review with thematic analysis and gap identification.

## When to Activate

- User asks for a "literature review", "research synthesis", or "evidence summary"
- The `/lit-review` command is invoked
- User asks to "summarise the evidence" or "what does the research say"

## Process

1. **Organise sources by theme.** Group papers by their primary contribution to the research question. A single paper may appear in multiple themes if it addresses multiple aspects.

2. **Within each theme, assess evidence strength:**
   - How many studies address this theme?
   - What study designs were used? (RCTs carry more weight than observational studies)
   - Do findings converge or diverge?
   - What are the sample sizes?
   - Are there methodological concerns?

3. **Identify patterns:**
   - **Convergence** — Multiple studies with consistent findings. Note the conditions under which the finding holds.
   - **Divergence** — Studies with contradictory findings. Investigate possible explanations: different populations, methods, outcome measures, time periods.
   - **Gaps** — Questions that have not been studied, populations not represented, methods not applied.

4. **Produce the synthesis document:**

```markdown
# Literature Synthesis: [Topic]

## Overview
[N] papers reviewed. [N] met inclusion criteria.

## Theme 1: [Name]
### Summary
[2-3 sentence overview of findings in this area]

### Evidence
| Study | Design | N | Key Finding | Quality |
|-------|--------|---|-------------|---------|
| Author (Year) | RCT | 200 | [Finding] | High |

### Assessment
Evidence strength: [Strong/Moderate/Weak/Insufficient]
Consistency: [Consistent/Mixed/Contradictory]

## Theme 2: [Name]
[Same structure]

## Gaps Identified
1. [Specific gap with explanation of why it matters]
2. [Specific gap]

## Implications for Current Study
[How these findings inform the research design and hypotheses]
```

5. **Quality control.** Verify every cited finding traces to a specific source. Flag any claims that rest on a single study.

## Anti-patterns

- Do not summarise papers one by one ("Author A found X. Author B found Y."). Synthesise by theme.
- Do not ignore contradictory evidence. Present it and explain possible reasons for divergence.
- Do not overstate evidence strength. "Preliminary evidence suggests" is different from "research has established."
