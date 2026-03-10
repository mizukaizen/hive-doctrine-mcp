# HD-4008: QA Team Pack

A Claude Code configuration for quality assurance engineers and test leads who need test generation, bug triage workflows, and regression detection.

## What's Inside

| Component | Purpose |
|-----------|---------|
| **qa-lead** agent | Test strategy, coverage review, bug triage, environment management |
| **tester** agent | Test case writing, manual test execution, bug documentation |
| `/generate-tests` | Generate tests for changed files — unit, integration, and E2E |
| `/triage` | Triage bug reports with severity, priority, and reproduction steps |
| `/regression` | Check for regressions by comparing test results against baseline |
| **test-generation** skill | Analyse diffs and generate comprehensive test cases |
| **bug-analysis** skill | Root cause analysis, fix suggestions, blast radius assessment |
| **coverage-check** hook | Verify coverage does not drop below threshold after test runs |

## Installation

Copy the contents of this package into your project's `.claude/` directory:

```bash
cp -r HD-4008-qa-team/.claude/* your-project/.claude/
```

## Usage

Generate tests for recent changes:
```
/generate-tests --scope "changed" --types "unit,integration"
```

Triage a bug:
```
/triage "Login fails with special characters in password"
```

Check for regressions:
```
/regression --baseline "main" --compare "feature/auth-refactor"
```

## Conventions

- Tests follow the Arrange-Act-Assert pattern
- Bug reports include: summary, severity, priority, steps to reproduce, expected vs actual, environment
- The test pyramid is enforced: more unit tests than integration, more integration than E2E
- Coverage must not decrease with any change (enforced by the coverage-check hook)
- Test data fixtures are maintained alongside tests, never hardcoded

## Customisation

Edit `CLAUDE.md` to adjust coverage thresholds, test naming conventions, or triage workflows.

---

Part of The Hive Doctrine · hivedoctrine.com
