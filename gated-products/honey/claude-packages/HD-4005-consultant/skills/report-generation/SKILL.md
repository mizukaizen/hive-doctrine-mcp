# Report Generation Skill

Use when producing a client report. Creates structured document with executive summary, analysis, recommendations, and appendices.

## When to Activate

- User asks for a "report", "deliverable", "findings document", or "client document"
- The `/deliverable` command is invoked
- User asks to "write up" or "summarise" analysis results

## Process

1. **Identify the audience.** Executive audience gets short, action-oriented language. Technical audience gets detail and methodology. Mixed audience gets a layered document (summary up front, detail in appendices).

2. **Gather inputs.** Read all files in `analysis/` and `data/` directories. Read the engagement brief for scope and objectives. Identify which findings exist and which gaps remain.

3. **Structure the report.** Follow the standard template:
   - Executive Summary (1 page max)
   - Context and Objectives
   - Approach and Methodology
   - Findings (grouped by theme)
   - Recommendations (numbered, actionable)
   - Next Steps
   - Appendices

4. **Write with discipline.**
   - Lead every section with its conclusion.
   - Support every claim with evidence.
   - Use bullet points for findings, numbered lists for recommendations.
   - Include tables for comparative data.
   - Keep paragraphs to 3-4 sentences maximum.

5. **Quality check.** Before presenting the report:
   - Verify all findings trace to evidence
   - Verify all recommendations include owner, timeline, and impact
   - Verify executive summary stands alone
   - Run confidentiality check
   - Check for consistent terminology throughout

## Output

A markdown document saved to `deliverables/` with the naming convention: `[YYYY-MM-DD]-[short-title].md`

## Anti-patterns

- Do not pad reports with generic commentary. If a section has nothing substantive, cut it.
- Do not bury the lead. The recommendation goes in the first paragraph of the executive summary.
- Do not use weasel words ("might", "could potentially", "it appears that"). State findings directly and qualify uncertainty explicitly.
