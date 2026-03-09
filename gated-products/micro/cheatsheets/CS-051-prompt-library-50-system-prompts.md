---
title: "Prompt Library: 50 System Prompts — Cheat Sheet"
hive_doctrine_id: HD-1110
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-1110
full_product_price: 79
---

# Prompt Library: 50 System Prompts — Cheat Sheet

## What It Is

50 field-tested system prompts across 4 categories: Research, Analysis, Operations, and Communications. Plus 7 core design principles for writing your own.

## 7 Core Design Principles

1. **Role first** — Start with "You are a [specific role]" to set behaviour
2. **Constraints before instructions** — State what the agent must NOT do before what it should do
3. **Output format explicit** — Specify exact format (markdown, JSON, bullet points)
4. **Examples beat descriptions** — Show a sample output rather than describing it
5. **Keep under 500 words** — Longer system prompts get partially ignored
6. **Test with adversarial inputs** — Try to break the prompt before deploying
7. **Version and track** — System prompts are code; treat them as such

## Category Overview

### Research (12 Prompts)
- Web research with source verification
- Competitive analysis
- Market sizing
- Patent/prior art search
- Academic literature review
- Customer interview synthesis

### Analysis (14 Prompts)
- Data analysis and visualisation
- Financial modelling
- Risk assessment
- Root cause analysis
- Trend identification
- Decision matrix generation

### Operations (12 Prompts)
- Code review
- Bug triage and diagnosis
- Deployment planning
- Incident response
- Documentation generation
- Meeting summarisation

### Communications (12 Prompts)
- Email drafting (professional, casual, cold outreach)
- Social media content
- Report writing
- Presentation outline
- Press release
- Customer support response

## Sample Prompt Structure

```markdown
# System Prompt: [Name]

## Role
You are a [specific role] specialising in [domain].

## Constraints
- Never [prohibited action]
- Always [required behaviour]
- Output in [format]

## Instructions
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Output Format
[Exact template the output should follow]

## Example
[One complete example of input → output]
```

## Quick Reference: Top 5 Most Useful Prompts

| # | Prompt | Category | Use Case |
|---|--------|----------|----------|
| 1 | Research Synthesiser | Research | Summarise 10+ sources into a coherent brief |
| 2 | Root Cause Analyst | Analysis | Diagnose system failures from logs |
| 3 | Code Reviewer | Operations | Structured code review with severity ratings |
| 4 | Cold Outreach Writer | Communications | Personalised cold emails that don't sound robotic |
| 5 | Decision Matrix Builder | Analysis | Compare options with weighted criteria |

---

*This is the condensed version. The full guide (HD-1110, $79) covers all 50 system prompts with complete text, usage notes, and customisation guidance for each. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
