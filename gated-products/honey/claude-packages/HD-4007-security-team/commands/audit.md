# /audit

Run a compliance audit against a specified framework.

## Usage

```
/audit --framework "SOC2|ISO27001|GDPR|PCI-DSS|HIPAA|NIST-CSF" [--scope "<specific controls>"] [--period "<date range>"]
```

## Behaviour

### 1. Load Framework Controls

Load the control set for the specified framework. If `--scope` is provided, filter to the specified control areas only.

### 2. Inventory Existing Controls

Scan the project for evidence of security controls:

- **Authentication:** Look for auth middleware, session management, MFA configuration
- **Authorisation:** Look for RBAC/ABAC implementations, permission checks
- **Encryption:** Check TLS configuration, encryption-at-rest settings, key management
- **Logging:** Check for audit logging, log retention configuration, log protection
- **Access control:** Check for least-privilege patterns, service account scoping
- **Data handling:** Check for PII handling, data classification, retention policies
- **Incident response:** Check for runbooks, alerting configuration, escalation procedures
- **Change management:** Check for PR requirements, CI/CD gates, deployment procedures

### 3. Map Controls to Requirements

Create the control matrix mapping discovered controls to framework requirements. For each requirement:

- **Met** — Control exists, is documented, and evidence shows it operated during the period
- **Partially Met** — Control exists but has gaps (not documented, not consistently applied, scope too narrow)
- **Not Met** — No corresponding control found

### 4. Generate Gap Analysis

For each unmet or partially met requirement:
- What is missing
- What would be needed to achieve compliance
- Estimated effort to remediate
- Suggested priority based on risk

### 5. Produce Audit Report

Save to `security/audits/[framework]/[date]-report.md` using the auditor agent's report format.

Display the executive summary with pass rate and critical gaps.
