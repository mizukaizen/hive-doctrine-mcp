# Statistical Analysis Skill

Use when running statistical analyses. Validates assumptions, runs tests, produces APA-formatted results.

## When to Activate

- User asks to "analyse data", "run a test", or "check significance"
- The `/analyse` command is invoked
- User provides a dataset and a hypothesis

## Process

1. **Identify the appropriate test.** Based on:
   - Number of groups/conditions (2 vs 3+)
   - Type of variables (continuous, categorical, ordinal)
   - Design (between-subjects, within-subjects, mixed)
   - Sample size (parametric vs non-parametric)
   - Independence of observations

   Common mappings:
   | Question | Test |
   |----------|------|
   | Two group means | Independent t-test (or Mann-Whitney U) |
   | Paired means | Paired t-test (or Wilcoxon) |
   | 3+ group means | One-way ANOVA (or Kruskal-Wallis) |
   | Relationship between continuous vars | Pearson r (or Spearman rho) |
   | Predicting from multiple vars | Multiple regression |
   | Categorical association | Chi-square test |

2. **Check assumptions.** For each test, verify:
   - **Normality** — Shapiro-Wilk test, Q-Q plot description, skewness/kurtosis values
   - **Homogeneity of variance** — Levene's test
   - **Independence** — Design-based assessment
   - **Linearity** — Scatterplot inspection for correlations/regression
   - **No multicollinearity** — VIF values for regression

3. **Run the analysis.** Execute the test and capture:
   - Test statistic and degrees of freedom
   - Exact p-value (to 3 decimal places, or "< .001")
   - Effect size with confidence interval
   - Sample sizes per group

4. **Format results in APA style.**

   Examples:
   - "An independent samples t-test revealed a significant difference between groups, *t*(48) = 2.34, *p* = .023, *d* = 0.67, 95% CI [0.09, 1.24]."
   - "There was no significant correlation between X and Y, *r*(98) = .12, *p* = .231, 95% CI [-.08, .31]."

5. **Sensitivity check.** Run at least one robustness check:
   - Non-parametric equivalent if assumptions are marginal
   - Analysis with and without outliers
   - Alternative operationalisation of key variables (if available)

## Output

A results section ready for incorporation into a paper, with:
- Descriptive statistics table
- Assumption check results
- Main analysis in APA format
- Sensitivity analysis results
- Brief interpretation (supported/not supported, with caveats)

## Critical Rules

- Never round p-values to convenient thresholds. Report exact values.
- Never interpret a non-significant result as "no effect." It means "insufficient evidence."
- Always report what you tested, even when results are null.
- If assumptions are violated and no non-parametric alternative is appropriate, state this explicitly rather than proceeding with an invalid test.
