# Compliance Mapping Skill

Use when mapping controls to compliance frameworks. Creates control matrix, identifies gaps, suggests evidence.

## When to Activate

- User asks about "compliance", "audit readiness", or "framework mapping"
- The `/audit` or `/compliance-check` command is invoked
- User asks "are we SOC 2 ready?" or "what do we need for GDPR?"

## Process

1. **Identify the target framework.** Determine which framework(s) apply based on:
   - Business type (SaaS → SOC 2, healthcare → HIPAA, EU data → GDPR)
   - Customer requirements (enterprise customers often require SOC 2)
   - Regulatory requirements (industry-specific mandates)

2. **Build the control inventory.** Scan the codebase for existing controls:

   | Control Category | Where to Look |
   |-----------------|---------------|
   | Access control | Auth middleware, RBAC configs, IAM policies |
   | Encryption | TLS configs, encryption libraries, key management |
   | Logging | Logger configuration, audit trail implementations |
   | Data handling | Data models, migration scripts, privacy policies |
   | Change management | CI/CD configs, branch protection, PR templates |
   | Incident response | Runbooks, alerting configs, on-call schedules |
   | Backup/Recovery | Backup scripts, DR documentation, restore procedures |
   | Network security | Firewall rules, security groups, network policies |

3. **Create the control matrix.** Map each discovered control to framework requirements:

```markdown
| Req ID | Requirement | Control | Status | Evidence | Gap |
|--------|------------|---------|--------|----------|-----|
| CC6.1 | Logical access security | Auth middleware in api/auth.js | Met | Code review + config | — |
| CC6.3 | Access removal | No offboarding automation found | Not Met | — | Need automated deprovisioning |
```

4. **Identify gaps.** For each unmet requirement:
   - Describe what is missing specifically
   - Suggest the simplest control that would satisfy the requirement
   - Estimate implementation effort
   - Prioritise: requirements that overlap with actual security risks first

5. **Suggest evidence.** For each met control, identify what evidence would satisfy an auditor:
   - Configuration screenshots or exports
   - Log samples showing the control in operation
   - Policy documents
   - Test results
   - Architecture diagrams

## Output

A compliance readiness report with:
- Overall readiness percentage per framework
- Control matrix with status
- Gap list with remediation effort
- Evidence collection checklist
- Recommended implementation order (quick wins first, then high-risk gaps)

## Notes

- Compliance does not equal security. A system can be compliant and still vulnerable. Use this skill alongside the vulnerability assessment skill.
- Framework requirements often overlap. Map controls once and apply to multiple frameworks where requirements align.
