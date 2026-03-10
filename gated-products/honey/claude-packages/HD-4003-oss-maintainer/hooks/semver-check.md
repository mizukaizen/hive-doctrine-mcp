# Hook: Semver Check

Verifies that all breaking changes are properly documented before a version bump is applied.

## Trigger

This hook activates when:
- The `/release` command is invoked
- Any version bump is attempted (changes to package.json version, Cargo.toml version, etc.)
- A git tag matching `v*` is about to be created

## Checks

### 1. Detect Breaking Changes in Unreleased Commits
Scan all commits since the last tag for breaking change indicators:

```bash
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
git log "${LAST_TAG}..HEAD" --grep="breaking" --grep="BREAKING CHANGE" --oneline
```

Also scan diffs for:
- Removed or renamed public exports
- Changed function signatures (added required parameters, changed return types)
- Removed configuration options
- Changed default values

### 2. Verify Version Bump Type
If breaking changes are detected:
- The version bump MUST be a major version increment
- If the proposed bump is minor or patch, **block the release** and report the conflict

If no breaking changes are detected:
- A major bump is allowed but unusual — warn and ask for confirmation
- Minor or patch bumps proceed normally

### 3. Check Documentation
If breaking changes are detected, verify:
- `CHANGELOG.md` has a "Breaking Changes" section for this release
- Each breaking change has a migration path described
- A migration guide exists at `docs/migration/` (for major releases)

### 4. Verify Deprecation Timeline
Check if any previously deprecated features are being removed:
- Was the deprecation announced in a prior release?
- Was there at least one minor version between deprecation notice and removal?
- If removing without prior deprecation, block and recommend adding deprecation warnings first

## Actions on Failure

- **Breaking change + wrong version type:** Block release. Report: "Breaking changes detected but version bump is [minor/patch]. Must be major. Changes: [list]"
- **Breaking change + no documentation:** Block release. Report: "Breaking changes detected but not documented in CHANGELOG.md. Document these changes: [list]"
- **Breaking change + no migration guide:** Warn (do not block). Report: "Major release without migration guide. Strongly recommended."

## Rules

- This hook cannot be skipped. Breaking changes without proper versioning violate the semver contract with users.
- False positives are acceptable — it is better to warn unnecessarily than to miss a breaking change.
- If the maintainer believes a detected breaking change is not actually breaking, they must add a comment explaining why before the hook will pass.
