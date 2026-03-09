---
title: "Security Audit Report Template — Cheat Sheet"
hive_doctrine_id: HD-0035
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0035
full_product_price: 79
---

# Security Audit Report Template — Cheat Sheet

## What It Is

An 8-section security audit report template using a traffic-light severity system. Designed for AI infrastructure but applicable to any system.

## Severity System

| Level | Meaning | Action |
|-------|---------|--------|
| **RED** | Critical — active vulnerability or breach risk | Fix within 24 hours |
| **AMBER** | Medium — weakness that could be exploited | Fix within 1 week |
| **GREEN** | Passing — meets security requirements | No action needed |

## 8-Section Template

### 1. Executive Summary
- One paragraph: what was audited, when, by whom
- Overall verdict: RED / AMBER / GREEN
- Count of findings by severity

### 2. Dashboard Table

| Area | Status | Finding Count |
|------|--------|---------------|
| Authentication | GREEN | 0 |
| Secrets Management | RED | 2 |
| Network Security | AMBER | 1 |
| Data Protection | GREEN | 0 |

### 3. Critical Findings (RED)
For each: Description, Evidence, Impact, Remediation, Deadline

### 4. Medium Findings (AMBER)
Same format as Critical, with longer deadline

### 5. Passing Checks (GREEN)
Brief list of what was checked and passed

### 6. Gap Analysis Table

| Expected Control | Current State | Gap | Priority |
|-----------------|---------------|-----|----------|
| API keys rotated quarterly | Last rotation: 6 months ago | Overdue | HIGH |

### 7. Prioritised Action Plan

| Priority | Action | Owner | Deadline |
|----------|--------|-------|----------|
| **Immediate** | Rotate exposed API key | Ops | Today |
| **This Week** | Enable 2FA on admin accounts | Ops | Fri |
| **This Month** | Implement secrets scanning in CI | Dev | End of month |

### 8. Unknowns
Things that couldn't be verified during the audit — flagged for follow-up.

## Common AI Infrastructure Findings

- [ ] Secrets in source code or environment variables without encryption
- [ ] API keys not rotated in 90+ days
- [ ] Docker containers running as root
- [ ] No network segmentation between agents
- [ ] Logs containing PII or sensitive data
- [ ] No audit trail for agent actions
- [ ] Unencrypted data at rest
- [ ] Missing rate limiting on APIs

---

*This is the condensed version. The full guide (HD-0035, $79) covers the complete 8-section template with worked examples, AI infrastructure-specific checklists, and remediation playbooks. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
