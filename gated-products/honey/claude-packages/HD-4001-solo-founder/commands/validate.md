# Command: /validate

Run a structured idea validation before committing to building anything.

## Usage

```
/validate [idea description]
```

## Process

When this command is invoked, follow these steps in order:

### Step 1: Problem Statement
Ask the founder to articulate the problem in one sentence. If they cannot, the idea is not ready. Format: "[Who] struggles with [problem] because [reason]."

### Step 2: Market Sizing
Estimate TAM, SAM, and SOM:
- **TAM (Total Addressable Market):** How many people in the world have this problem?
- **SAM (Serviceable Addressable Market):** How many of those can you realistically reach?
- **SOM (Serviceable Obtainable Market):** How many of those will you capture in year 1?

Use publicly available data. If no data exists, flag that as a risk.

### Step 3: Competitor Landscape
Search for existing solutions. For each competitor found:
- Name and URL
- Pricing model
- Key differentiator
- Obvious weakness

If there are zero competitors, that is a red flag — not a green one. Either the market does not exist or you have not looked hard enough.

### Step 4: Willingness to Pay (WTP)
Assess whether people will pay for this:
- Are there paid alternatives? What do they charge?
- Is this a painkiller (must-have) or a vitamin (nice-to-have)?
- What is the founder's target price point? Is it realistic given the competitive landscape?

### Step 5: Verdict
Provide a clear GO / NO-GO / NEEDS MORE DATA recommendation with reasoning.

## Output Format

Save the validation to `docs/validations/[idea-slug]-validation.md` with all five sections.

## Rules

- Do not sugar-coat results. A "NO-GO" is more valuable than a false "GO."
- If the founder pushes back on a NO-GO, ask them what new evidence would change the verdict. Vibes are not evidence.
- Time-box the entire validation to 15 minutes of active work.
