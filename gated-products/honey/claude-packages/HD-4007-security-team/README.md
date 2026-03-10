# HD-4007: Security Team Pack

A Claude Code configuration for security engineers and compliance teams who need vulnerability scanning, audit workflows, and compliance mapping against industry frameworks.

## What's Inside

| Component | Purpose |
|-----------|---------|
| **security-analyst** agent | Vulnerability scanning, code review, CVSS-based triage |
| **auditor** agent | Compliance audits, evidence collection, gap analysis |
| `/scan` | Run a comprehensive security scan across dependencies, code, and config |
| `/audit` | Run a compliance audit against a specified framework |
| `/compliance-check` | Quick check against specific framework requirements |
| **vulnerability-assessment** skill | Prioritised vulnerability scanning with remediation plans |
| **compliance-mapping** skill | Control matrix creation and gap identification |
| **secrets-scan** hook | Scan for leaked secrets before every commit |
| **dependency-audit** hook | Run dependency vulnerability check after package installs |

## Installation

Copy the contents of this package into your project's `.claude/` directory:

```bash
cp -r HD-4007-security-team/.claude/* your-project/.claude/
```

## Usage

Run a security scan:
```
/scan --scope "full" --severity "high,critical"
```

Run a compliance audit:
```
/audit --framework "SOC2" --scope "access-control,encryption"
```

Quick compliance check:
```
/compliance-check --framework "GDPR" --control "data-retention"
```

## Conventions

- Findings are triaged by CVSS score: Critical (9.0-10.0), High (7.0-8.9), Medium (4.0-6.9), Low (0.1-3.9)
- All findings include remediation guidance with effort estimates
- Compliance evidence is documented with control references
- The secrets-scan hook blocks commits containing detected secrets
- False positives are tracked and excluded from future scans

## Customisation

Edit `CLAUDE.md` to adjust scanning rules, compliance frameworks, or severity thresholds.

---

Part of The Hive Doctrine · hivedoctrine.com
