# Coverage Check Hook

## Trigger

After any test run completes (detecting test result or coverage report files).

## Behaviour

Check whether test coverage has decreased compared to the previous baseline.

### Checks

1. **Read current coverage.** Parse the coverage report from the test run. Support common formats:
   - `coverage/lcov.info` (lcov format)
   - `coverage/coverage-summary.json` (Istanbul/NYC)
   - `htmlcov/` (Python coverage.py)
   - `coverage.xml` (Cobertura format)

2. **Read baseline coverage.** Compare against:
   - Previous coverage report committed to the repository
   - Coverage thresholds defined in CLAUDE.md (80% line, 70% branch, 85% function)

3. **Compare metrics.**

   | Metric | Baseline | Current | Delta | Status |
   |--------|----------|---------|-------|--------|
   | Line coverage | XX% | XX% | +/-X% | Pass/Fail |
   | Branch coverage | XX% | XX% | +/-X% | Pass/Fail |
   | Function coverage | XX% | XX% | +/-X% | Pass/Fail |

4. **Identify uncovered code.** If coverage dropped, identify:
   - Which files lost coverage
   - Which specific lines/branches are newly uncovered
   - Whether the uncovered code is in changed files (needs new tests) or unchanged files (existing tests were removed)

### Actions

1. **Fail** — If any coverage metric drops below the minimum threshold:
   ```
   COVERAGE CHECK FAILED

   Line coverage: XX% (minimum: 80%) — BELOW THRESHOLD
   Branch coverage: XX% (minimum: 70%) — OK
   Function coverage: XX% (minimum: 85%) — OK

   Uncovered areas:
     src/auth/login.ts: lines 45-52 (new code, no tests)
     src/utils/format.ts: lines 12-18 (existing tests removed)

   Action: Add tests to restore coverage before merging.
   ```

2. **Warn** — If coverage decreased but remains above thresholds:
   ```
   COVERAGE WARNING

   Line coverage dropped: 87% → 84% (-3%)
   Newly uncovered: src/auth/login.ts lines 45-52

   Coverage is above minimum thresholds but trending down.
   Consider adding tests for new code.
   ```

3. **Pass** — If coverage is maintained or improved:
   ```
   Coverage check passed. Line: XX% (+X%), Branch: XX% (+X%), Function: XX% (+X%)
   ```

### Notes

- Coverage is a necessary but not sufficient quality metric. 100% coverage does not mean 100% tested — it means every line was executed, not that every behaviour was verified.
- Focus coverage improvements on business-critical code paths, not on achieving a number.
- If coverage legitimately needs to decrease (removing obsolete tests, deleting dead code), document the reason and override the check with confirmation.
