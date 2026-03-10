# Command: /ship

Pre-ship checklist and deployment. Run this before every production deploy.

## Usage

```
/ship
```

## Process

### Step 1: Run Tests
Execute the project's test suite. If any test fails, stop and report the failure. Do not proceed until tests pass.

```bash
# Detect and run the appropriate test command
# npm test / pytest / cargo test / etc.
```

### Step 2: Check for Debug Artifacts
Scan the codebase for common debug artifacts that should not ship:

- `console.log` / `console.error` / `console.warn` statements (unless in a logging utility)
- `debugger` statements
- `TODO` or `FIXME` comments added in the current diff
- Hardcoded `localhost` URLs
- `.env` files staged for commit

Report any findings. The founder decides whether to fix or ship anyway.

### Step 3: Performance Check
If the project has a web frontend, run a Lighthouse audit (or equivalent):

- Performance score must be above 80
- Accessibility score must be above 90
- Flag any image over 500KB that is not optimised

### Step 4: Build Verification
Run the production build. It must complete without errors or warnings.

```bash
# npm run build / cargo build --release / etc.
```

### Step 5: Deploy
Execute the project's deploy command. Verify the deployment is live by checking the production URL or running a smoke test.

### Step 6: Post-Deploy
- Update `CHANGELOG.md` with what shipped and today's date
- Confirm the core user flow works on production
- Report: "Shipped. [summary of what went live]"

## Rules

- If any step fails, stop and report. Do not skip steps.
- The founder can override any warning with explicit confirmation.
- Total deploy time target: under 5 minutes from `/ship` to live.
