# Dependency Audit Hook

## Trigger

After any package install operation (detecting changes to lock files: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `Pipfile.lock`, `requirements.txt`, `Cargo.lock`, `go.sum`, `Gemfile.lock`).

## Behaviour

When a lock file changes, audit the new or updated dependencies for known vulnerabilities.

### Checks

1. **New dependencies.** Identify packages added since the last lock file state:
   - Check for known CVEs
   - Check package popularity/maintenance (last publish date, weekly downloads if available)
   - Flag packages with no repository URL or mismatched repository
   - Flag packages with install scripts (`preinstall`, `postinstall`)

2. **Updated dependencies.** For version changes:
   - Check if the new version resolves any known vulnerabilities
   - Check if the new version introduces any new vulnerabilities
   - Flag major version bumps that may include breaking changes

3. **Transitive dependencies.** Check the full dependency tree:
   - Flag deep dependency chains (>5 levels) as a maintenance risk
   - Identify shared dependencies at different versions
   - Check transitive dependencies against vulnerability databases

### Actions

1. **Block** — If any dependency has a Critical or High severity CVE with a known exploit:
   ```
   DEPENDENCY AUDIT FAILED

   CRITICAL/HIGH vulnerabilities found:
     [package]@[version] — CVE-XXXX-XXXXX (CVSS: X.X)
       [Description]
       Fix: upgrade to [version] or later

   Action: Resolve critical vulnerabilities before committing lock file changes.
   ```

2. **Warn** — If Medium/Low vulnerabilities are found, or if maintenance concerns are identified:
   ```
   DEPENDENCY AUDIT WARNING

   Medium vulnerabilities: [N]
   Low vulnerabilities: [N]
   Unmaintained packages: [list]

   Run /scan --scope deps for full details.
   ```

3. **Pass** — If no issues found, proceed with a brief summary:
   ```
   Dependency audit passed. [N] packages checked, 0 known vulnerabilities.
   ```

### Notes

- This hook catches issues at install time, before vulnerable code enters the project.
- For a comprehensive dependency review, use `/scan --scope deps` which provides full detail and remediation guidance.
- Some vulnerabilities may not be exploitable in your specific usage. Document these in `security/false-positives.md` to suppress future warnings.
