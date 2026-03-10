# Skill: Lean Canvas Generator

Use when starting a new product idea. Generates a structured lean canvas to force clarity on the business model before any code is written.

## Trigger

Invoke this skill when the user says they have a new product idea, want to explore a business concept, or needs to articulate their value proposition.

## Process

1. Ask the user to describe their idea in 2-3 sentences.
2. Generate a lean canvas covering all 9 blocks.
3. Challenge any block that relies on assumptions without evidence.
4. Save the canvas to `docs/canvases/[idea-slug]-canvas.md`.

## Output Template

```markdown
# Lean Canvas: [Product Name]

**Date:** [YYYY-MM-DD]
**Status:** Draft / Validated / Rejected

## 1. Problem
Top 3 problems this product solves:
1. [Problem 1]
2. [Problem 2]
3. [Problem 3]

**Existing alternatives:** [How people solve this today]

## 2. Customer Segments
- **Target user:** [Who specifically]
- **Early adopters:** [Who will use v1 despite its rough edges]

## 3. Unique Value Proposition
[Single clear sentence: what makes this different and worth paying attention to]

## 4. Solution
Top 3 features that address the top 3 problems:
1. [Solution to Problem 1]
2. [Solution to Problem 2]
3. [Solution to Problem 3]

## 5. Channels
How you will reach customers:
- [Channel 1]
- [Channel 2]

## 6. Revenue Streams
- **Pricing model:** [subscription / one-time / freemium / usage-based]
- **Price point:** $[X]/[period]
- **Justification:** [Why this price]

## 7. Cost Structure
- **Fixed costs:** [hosting, domains, tools]
- **Variable costs:** [per-user costs, API calls, support]
- **Break-even:** [X] paying customers

## 8. Key Metrics
- [Metric 1 — e.g., weekly active users]
- [Metric 2 — e.g., conversion rate]
- [Metric 3 — e.g., churn rate]

## 9. Unfair Advantage
[Something that cannot be easily copied or bought — domain expertise, existing audience, proprietary data, network effects]
```

## Rules

- If the user cannot fill "Unfair Advantage," that is fine for now — but flag it as a long-term risk.
- Challenge any revenue estimate that assumes more than 1% conversion rate without evidence.
- The canvas is a living document. Update it as validation data comes in.
