# /analyse

Run an analysis pipeline from data cleaning through hypothesis testing.

## Usage

```
/analyse --data "<path>" --hypothesis "<hypothesis>" [--test "t-test|anova|correlation|regression"] [--alpha 0.05]
```

## Behaviour

### 1. Pre-registration Check

Before any analysis, verify `analysis/preregistration.md` exists. If not, create one:

```markdown
# Pre-registration

## Hypothesis
[From --hypothesis argument]

## Variables
- Independent: [identify from data]
- Dependent: [identify from data]
- Covariates: [if applicable]

## Planned Analysis
- Test: [from --test or inferred from hypothesis]
- Alpha: [from --alpha or 0.05]
- Correction: [if multiple tests planned]
- Minimum effect size of interest: [specify]

## Exclusion Criteria
- [Data-driven exclusions specified before analysis]

## Deviations
[Document any changes from this plan during analysis]
```

### 2. Data Cleaning

- Read the data file and report basic properties (rows, columns, types).
- Check for missing values — report percentage per variable.
- Check for duplicates.
- Check for outliers using IQR method — report but do not remove without confirmation.
- Create a processed data file with a processing log.

### 3. Exploratory Analysis

- Descriptive statistics for all variables (M, SD, range, or frequencies).
- Distribution checks (skewness, kurtosis).
- Correlation matrix for numeric variables.
- Flag any patterns that might affect the planned analysis.
- Clearly label all output as "EXPLORATORY — not pre-registered."

### 4. Hypothesis Testing

- Verify assumptions for the planned test.
- Run the pre-registered analysis.
- Report in APA format with effect size and confidence interval.
- Run sensitivity analysis if assumptions are violated.

### 5. Output

Save results to `analysis/outputs/` with:
- Summary statistics table
- Test results in APA format
- Assumption check results
- Any figures described in sufficient detail for recreation

Display the key result and whether the hypothesis was supported.
