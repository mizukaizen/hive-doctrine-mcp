# /compliance-check

Quick compliance check against specific framework requirements.

## Usage

```
/compliance-check --framework "SOC2|ISO27001|GDPR|PCI-DSS" --control "<control-area>"
```

## Behaviour

Unlike the full `/audit`, this is a targeted check for a specific control area. It runs fast and returns a focused assessment.

### 1. Identify the Control

Map the control area to specific framework requirements. Common control areas:

| Area | What It Covers |
|------|---------------|
| `access-control` | Authentication, authorisation, session management |
| `encryption` | Data at rest, data in transit, key management |
| `logging` | Audit trails, log retention, monitoring |
| `data-retention` | Data lifecycle, deletion, archival |
| `incident-response` | Detection, response, notification procedures |
| `change-management` | Code review, deployment gates, rollback procedures |
| `backup` | Backup frequency, testing, recovery procedures |
| `network` | Firewalls, segmentation, ingress/egress controls |

### 2. Scan for Evidence

Search the codebase and configuration for evidence relevant to the specified control:

- Configuration files
- Code patterns (middleware, decorators, hooks)
- Documentation (policies, runbooks)
- CI/CD pipeline definitions

### 3. Quick Assessment

Produce a focused result:

```markdown
# Compliance Check: [Framework] — [Control Area]

## Status: [PASS / PARTIAL / FAIL]

## Requirements Checked
| # | Requirement | Status | Evidence |
|---|------------|--------|----------|
| 1 | [Requirement] | [Met/Not Met] | [File or config reference] |

## Gaps (if any)
- [Specific gap and what is needed]

## Quick Fixes
- [Immediate action that would improve compliance]
```

### 4. Output

Display the result inline. If gaps are found, offer to create remediation tasks.

## Notes

- This is a lightweight check, not a formal audit. Use `/audit` for comprehensive compliance assessment.
- The check looks at code and configuration only. It cannot verify operational procedures (e.g., whether backups are actually tested regularly).
