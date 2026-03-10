# /scan

Run a comprehensive security scan across dependencies, code, and configuration.

## Usage

```
/scan [--scope "full|deps|code|config|secrets"] [--severity "critical,high,medium,low"] [--fix]
```

## Behaviour

### 1. Dependency Audit

Scan package manifests for known vulnerabilities:

- **Node.js:** `npm audit` or parse `package-lock.json` against advisory databases
- **Python:** Check `requirements.txt` or `Pipfile.lock` against safety/pip-audit databases
- **Rust:** Parse `Cargo.lock` against RustSec advisory database
- **Go:** Parse `go.sum` against Go vulnerability database

For each vulnerable dependency, report:
- Package name and installed version
- CVE identifier and CVSS score
- Fixed version (if available)
- Whether it is a direct or transitive dependency

### 2. Static Analysis (SAST)

Scan source code for security anti-patterns:

- SQL injection: string concatenation in queries, unsanitised user input in SQL
- XSS: unescaped user input in HTML output, innerHTML usage
- Command injection: user input in shell commands, exec/eval usage
- Path traversal: user input in file paths without sanitisation
- Insecure crypto: MD5/SHA1 for security purposes, ECB mode, hardcoded IVs
- Insecure randomness: Math.random() for security-sensitive operations

### 3. Secrets Detection

Scan all files for leaked credentials:

- API keys (common provider patterns: `sk-`, `AKIA`, `ghp_`, etc.)
- Private keys (RSA/EC/Ed25519 PEM headers)
- Passwords in configuration files
- Connection strings with embedded credentials
- JWT tokens
- AWS/GCP/Azure credential patterns

### 4. Configuration Audit

Check for misconfigurations:

- Docker: running as root, exposed ports, no health checks, secrets in build args
- CI/CD: secrets in plain text, untrusted actions, missing branch protections
- Cloud: public S3 buckets, overly permissive IAM, missing encryption
- Application: debug mode in production, CORS wildcards, missing security headers

### 5. Report

Generate a scan report in `security/scans/[date]/report.md`:

```markdown
# Security Scan Report — [Date]

## Summary
| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Dependencies | X | X | X | X |
| Code | X | X | X | X |
| Secrets | X | X | X | X |
| Configuration | X | X | X | X |
| **Total** | **X** | **X** | **X** | **X** |

## Critical and High Findings
[Detailed findings with remediation]

## Medium and Low Findings
[Summary table with links to detail]
```

If `--fix` is specified, attempt automated fixes for straightforward issues (dependency upgrades, adding .gitignore entries for secrets).
