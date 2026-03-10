# Command: /release

Prepare and publish a semver-compliant release.

## Usage

```
/release [major|minor|patch]
```

If no version type is specified, analyse commits since the last tag to determine the appropriate bump.

## Process

### Step 1: Determine Version

```bash
# Get current version
git describe --tags --abbrev=0

# List commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

Apply semver rules:
- Any commit with `breaking:` or `BREAKING CHANGE` in the body = **major**
- Any commit with `feat:` = **minor** (unless major is triggered)
- Only `fix:`, `docs:`, `chore:` = **patch**

### Step 2: Generate Changelog
Run `/changelog` to generate entries. Review the output for accuracy.

### Step 3: Update Version Files
Update version references in:
- `package.json` (Node.js)
- `Cargo.toml` (Rust)
- `pyproject.toml` (Python)
- Any other version files detected in the project

### Step 4: Write Migration Guide (if major)
For major version bumps, generate a migration guide covering:
- What changed and why
- Before/after code examples
- Step-by-step upgrade instructions

Save to `docs/migration/v[X]-to-v[Y].md`.

### Step 5: Create Release Commit and Tag

```bash
git add -A
git commit -m "chore: release v[X.Y.Z]"
git tag -a "v[X.Y.Z]" -m "Release v[X.Y.Z]"
```

### Step 6: Publish
- Push commits and tags: `git push origin main --tags`
- Create GitHub release with changelog as the body
- Publish to package registry if applicable

### Step 7: Post-Release
- Verify the release appears on GitHub
- Verify the package is available on the registry
- Close the milestone (if one was used)
- Report: "Released v[X.Y.Z] with [N] changes"

## Rules

- Never release on a Friday. If it is Friday, schedule for Monday.
- Never release without running the full test suite.
- If any breaking change is found but the version type is set to minor or patch, stop and warn.
- Always review the generated changelog before publishing — automated output needs human verification.
