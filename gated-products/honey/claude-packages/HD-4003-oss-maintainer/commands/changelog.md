# Command: /changelog

Generate a changelog from git commits since the last release tag.

## Usage

```
/changelog
```

## Process

### Step 1: Identify Range

```bash
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -z "$LAST_TAG" ]; then
  echo "No previous tags found. Generating changelog for all commits."
  git log --oneline --no-merges
else
  git log "${LAST_TAG}..HEAD" --oneline --no-merges
fi
```

### Step 2: Categorise Commits

Group commits by type using Conventional Commits prefixes:

- **Breaking Changes** — `breaking:` or commits with `BREAKING CHANGE` in body
- **Features** — `feat:`
- **Bug Fixes** — `fix:`
- **Documentation** — `docs:`
- **Other** — `chore:`, `refactor:`, `test:`, `ci:`, `style:`

### Step 3: Generate Changelog Entry

Format using Keep a Changelog style:

```markdown
## [X.Y.Z] — YYYY-MM-DD

### Breaking Changes
- Description of breaking change ([#PR](link)) — @contributor

### Added
- Description of new feature ([#PR](link)) — @contributor

### Fixed
- Description of bug fix ([#PR](link)) — @contributor

### Changed
- Description of change ([#PR](link)) — @contributor

### Documentation
- Description of docs update ([#PR](link)) — @contributor
```

### Step 4: Polish

- Rewrite commit messages into user-friendly language. "fix: null deref in parser" becomes "Fixed crash when parsing empty configuration files."
- Credit contributors by their handle.
- Link to relevant PRs or issues.
- Remove internal-only changes (CI config, dev tooling) unless they affect contributors.

### Step 5: Output

Prepend the new entry to `CHANGELOG.md`. If the file does not exist, create it with a header:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
```

## Rules

- Changelogs are for users. Write in language they understand.
- Always credit contributors. Open source runs on recognition.
- Group related changes together rather than listing every commit individually.
- If a commit message is unclear, check the diff to understand what actually changed.
