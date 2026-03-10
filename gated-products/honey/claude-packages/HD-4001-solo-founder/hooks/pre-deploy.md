# Hook: Pre-Deploy

Runs automatically before any deploy command is executed.

## Trigger

This hook activates when:
- The `/ship` command is invoked
- Any deployment-related command is run (e.g., `vercel deploy`, `fly deploy`, `git push` to a deploy branch)

## Checks

### 1. Test Suite
Run the project's test suite. If any test fails, block the deploy and report the failure.

```bash
# Auto-detect test runner
if [ -f "package.json" ]; then npm test; fi
if [ -f "Cargo.toml" ]; then cargo test; fi
if [ -f "pytest.ini" ] || [ -f "pyproject.toml" ]; then pytest; fi
```

**Action on failure:** Block deploy. Report which tests failed.

### 2. Console Statement Scan
Search for debug statements that should not reach production:

```bash
# Check for console.error and console.warn in source files (not test files)
grep -rn "console\.\(error\|warn\|log\)" src/ --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" | grep -v "node_modules" | grep -v ".test." | grep -v ".spec."
```

**Action on finding:** Warn. List each occurrence with file and line number. The founder decides whether to proceed.

### 3. Environment Variable Check
Verify that required environment variables are set (not empty) by checking the deploy target's configuration.

**Action on failure:** Block deploy. List missing variables.

### 4. Secret Leak Scan
Check staged files for patterns that look like secrets:
- API keys (strings starting with `sk-`, `pk_`, `api_`)
- Private keys (strings matching key patterns)
- `.env` files in the commit

**Action on finding:** Block deploy. This is non-negotiable — secrets in git are permanent.

## Behaviour

- All checks run in sequence. First failure blocks the deploy.
- The founder can override warnings (console statements) but cannot override blockers (test failures, secret leaks).
- Report results in a clear pass/fail summary at the end.
