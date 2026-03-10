# HD-5005: Agent Access Control Matrix

**Product ID:** HD-5005
**Price Tier:** Doctrine ($9.99)
**Version:** 1.0
**Last Updated:** 2026-03-10

---

## Purpose

This template defines a role-based access control (RBAC) framework for AI agent systems. It specifies who and what can access which resources, with what permissions, and through what approval workflows. Unlike traditional RBAC, agent systems require access controls that govern both human access to agent infrastructure and agent access to tools, data, and external services.

Agents are not users, but they act with delegated authority. This document treats agents as principals in the access control model, with their own permission sets, boundaries, and audit requirements.

---

## 1. Role Definitions

### 1.1 Human Roles

| Role | Description | Typical Responsibilities | Access Level |
|------|-------------|-------------------------|-------------|
| **Admin** | Full system authority. Manages infrastructure, deployment, and access control policies | Infrastructure management, access provisioning, emergency response, policy changes | Full (all resources) |
| **Operator** | Day-to-day management of agent systems. Deploys, configures, and monitors agents | Agent deployment, configuration changes, monitoring, incident triage | High (operational resources) |
| **Developer** | Builds and maintains agent code, prompts, and integrations | Code commits, prompt engineering, tool integration development, testing | Medium (development resources, staging) |
| **Auditor** | Read-only access for compliance, security, and performance review | Log review, compliance checks, access audits, report generation | Read-only (all logs, configs, audit trails) |
| **Viewer** | Limited read access to dashboards and reports | View dashboards, performance metrics, high-level status | Read-only (dashboards only) |

### 1.2 Agent Roles

| Role | Description | Scope | Trust Level |
|------|-------------|-------|-------------|
| **Orchestrator** | Coordinates other agents, manages workflows, routes tasks | Can invoke other agents, manage task queues, access shared context | High |
| **Specialist** | Performs specific tasks within a defined domain | Access limited to domain-specific tools and data | Medium |
| **Worker** | Executes discrete, well-defined tasks without autonomy over scope | Access to specific tools for specific tasks; no agent invocation | Low |
| **Read-Only Agent** | Retrieves and summarises information without modifying state | Read access to specified data sources; no write or execute permissions | Minimal |

---

## 2. Resource Categories

| Category | Examples | Sensitivity |
|----------|---------|-------------|
| **Data Stores** | Vector databases, conversation logs, user profiles, knowledge bases | High |
| **APIs** | LLM provider APIs, third-party service APIs, internal microservice APIs | Medium-High |
| **Tools** | File system access, web browsing, code execution, email sending, database queries | High |
| **Secrets** | API keys, signing keys, database credentials, service account tokens | Critical |
| **Infrastructure** | Compute instances, networking configuration, deployment pipelines, monitoring systems | High |
| **Configuration** | Agent prompts, model parameters, feature flags, routing rules | Medium |
| **Logs** | Audit logs, error logs, performance metrics, conversation transcripts | Medium-High |
| **Agent Registry** | Agent definitions, capability declarations, trust level assignments | Medium |

---

## 3. Permission Matrix — Human Roles

| Resource | Admin | Operator | Developer | Auditor | Viewer |
|----------|-------|----------|-----------|---------|--------|
| **Data Stores** | RWXA | RWX | R (staging only) | R | — |
| **APIs** | RWXA | RWX | RWX (staging) | R | — |
| **Tools** | RWXA | RX | RX (staging) | R | — |
| **Secrets** | RWXA | R (use only) | — | R (metadata only) | — |
| **Infrastructure** | RWXA | RX | R | R | — |
| **Configuration** | RWXA | RW | RW (staging), R (prod) | R | — |
| **Logs** | RWXA | R | R (own systems) | R | R (dashboards) |
| **Agent Registry** | RWXA | RW | R | R | — |

**Permission Key:** R = Read, W = Write, X = Execute, A = Admin (grant/revoke access)

---

## 4. Permission Matrix — Agent Roles

| Resource | Orchestrator | Specialist | Worker | Read-Only Agent |
|----------|-------------|-----------|--------|----------------|
| **Data Stores** | R (all), W (shared context) | R (domain-specific) | R (task-specific) | R (assigned sources) |
| **APIs** | X (coordination APIs) | X (domain APIs) | X (assigned APIs only) | R (read-only endpoints) |
| **Tools** | X (agent invocation, task routing) | X (domain tools) | X (single assigned tool) | — |
| **Secrets** | Use (via secrets manager, never direct) | Use (domain secrets only) | Use (task secrets only) | — |
| **Infrastructure** | — | — | — | — |
| **Configuration** | R (own config + subordinate configs) | R (own config) | R (own config) | R (own config) |
| **Logs** | W (own logs), R (subordinate logs) | W (own logs) | W (own logs) | W (own logs) |
| **Agent Registry** | R | R (own entry) | R (own entry) | R (own entry) |

### Agent Permission Boundaries — Critical Rules

1. **No agent has direct access to secrets.** Agents use secrets through a secrets manager that injects credentials at runtime without exposing the values.
2. **No agent can modify its own permissions.** Permission changes require human approval.
3. **No agent can access infrastructure controls.** Compute, networking, and deployment are human-only.
4. **Agents cannot grant access to other agents.** Only human Admin or Operator roles can modify the agent permission matrix.
5. **All agent tool calls are logged.** No silent execution.

---

## 5. Example Access Control Matrix — Multi-Agent System

This example illustrates a typical configuration for a multi-agent system with an orchestrator and three specialist agents.

| Resource | Orchestrator Agent | Research Agent | Writer Agent | Data Agent |
|----------|-------------------|---------------|-------------|-----------|
| Knowledge base (read) | Yes | Yes | Yes | Yes |
| Knowledge base (write) | No | No | No | Yes |
| Web search tool | No | Yes | No | No |
| Document generation tool | No | No | Yes | No |
| Database query tool | No | No | No | Yes |
| Email sending tool | No | No | No | No |
| Agent invocation | Yes | No | No | No |
| Shared context (read) | Yes | Yes | Yes | Yes |
| Shared context (write) | Yes | Yes (own results) | Yes (own results) | Yes (own results) |
| LLM API | Yes | Yes | Yes | Yes |
| User PII access | No | No | No | Yes (aggregated only) |
| Conversation history | Yes (current session) | No | No | No |
| System prompt (own) | Read | Read | Read | Read |
| System prompt (others) | No | No | No | No |

---

## 6. Approval Workflows

### 6.1 Standard Permission Request

```
1. Requester submits access request
   ├── Specifies: resource, permission level, justification, duration
   └── Ticket created in access management system

2. Manager review
   ├── Validates business justification
   └── Confirms appropriate permission level (principle of least privilege)

3. Security review (if elevated access)
   ├── Reviews risk implications
   └── Confirms compensating controls are in place

4. Approval
   ├── Standard access: Manager approval sufficient
   ├── Elevated access: Manager + Security approval
   └── Admin access: Manager + Security + Executive approval

5. Implementation
   ├── Access provisioned by Admin
   ├── Audit trail entry created
   └── Requester notified

6. Expiry / Review
   ├── Time-limited access: auto-revoke on expiry date
   └── Permanent access: included in quarterly access review
```

### 6.2 Agent Capability Expansion

When an agent needs access to a new tool or data source:

| Step | Action | Approver |
|------|--------|----------|
| 1 | Developer documents the capability requirement and justification | — |
| 2 | Risk assessment: what could go wrong if the agent misuses this capability? | Security |
| 3 | Compensating controls identified (rate limits, output validation, audit logging) | Developer + Security |
| 4 | Approval | Operator + Security |
| 5 | Implementation in staging, testing with representative inputs | Developer |
| 6 | Promotion to production | Operator |
| 7 | Monitoring verification (confirm audit logging captures new capability use) | Operator |

### 6.3 Emergency Access (Break-Glass)

For situations requiring immediate elevated access outside normal approval workflows.

| Step | Action | Timeline |
|------|--------|----------|
| 1 | Declare emergency, document justification | Immediate |
| 2 | Access break-glass credentials (stored in sealed envelope, HSM, or emergency secrets vault) | Within 5 minutes |
| 3 | Perform necessary actions, logging all commands and changes | During emergency |
| 4 | Notify security team and management | Within 1 hour |
| 5 | Complete post-emergency access review | Within 24 hours |
| 6 | Rotate break-glass credentials | Within 24 hours |
| 7 | Document in incident report | Within 48 hours |

**Break-glass access is automatically flagged for audit.** Every use triggers a mandatory review.

---

## 7. Access Review Schedule

| Review Type | Frequency | Scope | Reviewer | Output |
|-------------|-----------|-------|----------|--------|
| Quarterly access review | Every 90 days | All human access to agent systems | Manager + Security | Certified access list, revocations logged |
| Agent permission audit | Every 90 days | All agent permissions, tool access, data access | Operator + Security | Audit report, permission adjustments |
| Privileged access review | Monthly | Admin and Operator access, break-glass usage | Security + Executive | Privileged access report |
| Service account review | Every 90 days | All service accounts, API keys, tokens | Security | Active/inactive account list, key rotation status |
| Separation of duties check | Every 180 days | Verify no single person/agent holds conflicting permissions | Security + Compliance | SoD conflict report |

### Review Checklist

For each access entry reviewed:

- [ ] Access is still required for current role/function
- [ ] Permission level follows principle of least privilege
- [ ] No separation of duties conflicts
- [ ] Last activity date is within acceptable window (revoke if unused >90 days)
- [ ] Approval documentation exists and is current
- [ ] Compensating controls are in place for elevated access

---

## 8. Audit Requirements for Privileged Access

All privileged access (Admin, Operator, Orchestrator agent) must generate the following audit records:

| Event | Log Fields | Retention |
|-------|-----------|-----------|
| Access granted | Timestamp, grantor, grantee, resource, permission level, justification, expiry | 2 years |
| Access revoked | Timestamp, revoker, grantee, resource, reason | 2 years |
| Access used | Timestamp, principal, resource, action, outcome (success/failure) | 1 year |
| Permission change | Timestamp, changer, target, old permission, new permission, justification | 2 years |
| Break-glass access | Timestamp, accessor, justification, actions taken, review status | 3 years |
| Access review completed | Timestamp, reviewer, scope, findings, actions taken | 2 years |
| Failed access attempt | Timestamp, principal, resource, attempted action, failure reason | 1 year |

---

## 9. Separation of Duties

The following role combinations are prohibited for a single individual:

| Role A | Role B | Conflict Reason |
|--------|--------|----------------|
| Developer | Admin (production) | Could deploy and approve own code without review |
| Operator | Auditor | Could modify systems and audit own changes |
| Admin | Auditor | Could grant self access and certify compliance |
| Developer | Operator (same system) | Could build and deploy without independent review |

For agent roles, the following combinations are prohibited:

| Agent Role A | Agent Role B | Conflict Reason |
|-------------|-------------|----------------|
| Orchestrator | Worker (same workflow) | Could assign tasks to itself and approve results |
| Data Agent (write) | Auditor Agent | Could modify data and audit own modifications |

---

## 10. Key Rotation Schedule

| Credential Type | Rotation Frequency | Owner | Verification |
|----------------|-------------------|-------|-------------|
| LLM API keys | Every 90 days | Operator | Confirm new key works, old key revoked |
| Database credentials | Every 90 days | Admin | Connection test after rotation |
| Service account tokens | Every 90 days | Admin | Service health check after rotation |
| Signing keys | Every 180 days | Admin + Security | Signature verification test |
| Break-glass credentials | After every use + every 180 days | Security | Sealed storage verification |
| Agent-to-agent auth tokens | Every 90 days | Operator | Multi-agent communication test |

---

DISCLAIMER: This is a template framework, not legal advice. Consult qualified legal counsel for your jurisdiction.

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
