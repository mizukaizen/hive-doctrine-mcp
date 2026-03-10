# HD-4006: Research Team Pack

A Claude Code configuration for academic researchers, data scientists, and research teams who need rigorous literature review, statistical analysis, and paper writing workflows.

## What's Inside

| Component | Purpose |
|-----------|---------|
| **researcher** agent | Literature review, hypothesis formulation, citation tracking |
| **analyst** agent | Statistical analysis, visualisation, methodology validation |
| **writer** agent | Academic paper drafting, bibliography management, reviewer responses |
| `/lit-review` | Conduct a systematic literature review with structured synthesis |
| `/analyse` | Run an analysis pipeline from data cleaning through hypothesis testing |
| `/draft-paper` | Draft paper sections following IMRaD structure |
| **literature-synthesis** skill | Thematic analysis and gap identification across sources |
| **statistical-analysis** skill | Assumption validation, hypothesis testing, APA-formatted results |
| **citation-check** hook | Verify all claims are cited before finalising sections |
| **reproducibility-check** hook | Verify analysis code is reproducible before committing |

## Installation

Copy the contents of this package into your project's `.claude/` directory:

```bash
cp -r HD-4006-research-team/.claude/* your-project/.claude/
```

## Usage

Run a literature review:
```
/lit-review "impact of sleep deprivation on cognitive performance" --databases "PubMed, PsycINFO"
```

Analyse your data:
```
/analyse --data "data/experiment1.csv" --hypothesis "Treatment group shows higher scores"
```

Draft a paper section:
```
/draft-paper --section methods --journal "Nature Human Behaviour"
```

## Conventions

- All analyses are pre-registered before execution (write the plan, then run it)
- Effect sizes and confidence intervals are always reported alongside p-values
- Literature reviews follow PRISMA-style reporting
- Citations use author-year format by default (adjustable per journal)
- Random seeds are set and documented for all stochastic analyses

## Customisation

Edit `CLAUDE.md` to adjust citation style, target journal conventions, or statistical thresholds.

---

Part of The Hive Doctrine · hivedoctrine.com
