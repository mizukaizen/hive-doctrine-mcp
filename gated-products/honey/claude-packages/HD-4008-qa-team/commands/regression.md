# /regression

Check for regressions by comparing test results against a baseline.

## Usage

```
/regression [--baseline "main|<branch>|<commit>"] [--compare "<branch>|HEAD"] [--suite "unit|integration|e2e|all"]
```

## Behaviour

### 1. Establish Baseline

- Identify the baseline reference (default: main branch)
- Record the test results from the baseline (or retrieve cached results)
- Note the total tests, pass count, fail count, skip count

### 2. Run Current Tests

- Run the test suite on the comparison branch/commit
- Capture results: pass, fail, skip, duration for each test

### 3. Compare Results

Identify:

- **New failures** — Tests that passed on baseline but fail now. These are potential regressions.
- **Fixed tests** — Tests that failed on baseline but pass now. Confirm these are intentional fixes.
- **New tests** — Tests that exist now but not on baseline. Verify they pass.
- **Removed tests** — Tests that existed on baseline but are missing now. Verify removal was intentional.
- **Performance changes** — Tests that take significantly longer (>50% increase in duration).

### 4. Analyse Regressions

For each new failure:
- Identify the most recent commit that could have caused it
- Check what code the failing test covers
- Assess whether the failure indicates a real bug or a test that needs updating
- Classify as: regression (real bug), intentional change (test needs update), or flaky test

### 5. Generate Report

```markdown
# Regression Report

## Summary
| Metric | Baseline | Current | Delta |
|--------|----------|---------|-------|
| Total tests | N | N | +/-N |
| Passing | N | N | +/-N |
| Failing | N | N | +/-N |
| Skipped | N | N | +/-N |
| Duration | Xs | Xs | +/-Xs |

## Regressions (New Failures)
| Test | File | Likely Cause | Classification |
|------|------|-------------|----------------|
| [test name] | [file] | [commit/change] | Regression / Intentional / Flaky |

## Fixed (Previously Failing)
| Test | File |
|------|------|
| [test name] | [file] |

## New Tests
| Test | File | Status |
|------|------|--------|
| [test name] | [file] | Pass/Fail |

## Verdict
[PASS: No regressions detected / FAIL: N regressions require investigation]
```

### 6. Output

Display the regression report. If regressions are found, list the specific tests and recommended investigation steps.
