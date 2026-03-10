# HD-5004: Agent Incident Response Playbook

**Product ID:** HD-5004
**Price Tier:** Honey ($29)
**Version:** 1.0
**Last Updated:** 2026-03-10

---

## Purpose

This playbook defines incident response procedures for AI agent system failures, misbehaviours, and security events. It covers the full lifecycle from detection through post-mortem, with procedures for failure modes unique to AI agents: hallucination, prompt injection, decision drift, cost runaway, and multi-agent cascading failures.

---

## 1. Severity Matrix

### Severity Definitions

| Severity | Name | Definition | Response Time | Resolution Target | Escalation |
|----------|------|-----------|---------------|-------------------|------------|
| SEV1 | Critical | Agent is causing active harm: data breach, financial loss, safety risk, or regulatory violation in progress | 15 minutes | 4 hours | Immediate executive notification |
| SEV2 | High | Agent is producing incorrect or harmful outputs at scale, but no active data breach or safety risk; significant user impact | 30 minutes | 8 hours | Engineering lead + product owner |
| SEV3 | Medium | Agent degradation affecting subset of users; incorrect outputs detected but contained; non-critical functionality impaired | 2 hours | 24 hours | On-call engineer |
| SEV4 | Low | Minor agent issues; cosmetic errors; isolated incorrect responses; performance degradation below impact threshold | Next business day | 5 business days | Ticket queue |

### Agent-Specific Severity Examples

| Scenario | Severity | Rationale |
|----------|----------|-----------|
| Agent leaking user data from one session into another (cross-contamination) | SEV1 | Active data breach |
| Agent executing unauthorised tool calls (e.g., sending emails, modifying data without permission) | SEV1 | Unauthorised actions causing potential harm |
| Cost runaway: agent in infinite loop consuming tokens/compute at >10x normal rate | SEV1 | Financial loss in progress |
| Prompt injection attack successfully extracting system prompts or internal data | SEV1 | Security breach |
| Agent consistently hallucinating factual claims for a specific topic area | SEV2 | Incorrect outputs at scale, user trust impact |
| Agent tone/personality drift making inappropriate or off-brand responses | SEV2 | Reputational risk |
| Intermittent failures in tool execution (e.g., API timeouts) causing degraded responses | SEV3 | Partial service degradation |
| Agent latency spike affecting response times but outputs remain correct | SEV3 | Performance degradation |
| Occasional formatting errors in agent output | SEV4 | Cosmetic issue |
| Agent not using preferred phrasing for low-impact interactions | SEV4 | Minor quality issue |

---

## 2. Phase 1: Detect

### 2.1 Monitoring Triggers

Automated monitoring should generate alerts for the following conditions:

| Trigger | Threshold | Alert Channel | Severity |
|---------|-----------|---------------|----------|
| Error rate spike | >5% of requests returning errors (5-min window) | PagerDuty / on-call | SEV2+ |
| Latency spike | p95 latency >3x baseline (5-min window) | Monitoring channel | SEV3 |
| Token consumption anomaly | >5x normal rate (15-min window) | PagerDuty / on-call | SEV1 |
| Cost anomaly | Projected daily cost >2x average | Finance alert + engineering | SEV2 |
| Output quality degradation | Automated quality score below threshold | Quality monitoring channel | SEV3 |
| Unusual tool call patterns | Tool calls outside normal distribution (type or frequency) | Security channel | SEV2 |
| User feedback spike | >3x normal negative feedback rate (1-hour window) | Product channel | SEV3 |
| Authentication failures | >10 failed auth attempts in 5 minutes | Security channel | SEV2 |
| Data classification violation | Agent output contains data above its clearance level | Security channel + PagerDuty | SEV1 |
| Circuit breaker activation | Any circuit breaker trips | Engineering channel | SEV2 |

### 2.2 User Report Intake

| Field | Description |
|-------|-------------|
| Reporter | Who reported the issue (user ID, support ticket, internal staff) |
| Timestamp of observation | When the reporter first noticed the issue |
| Agent ID | Which agent or agent system is affected |
| Description | What happened, in the reporter's words |
| Expected behaviour | What should have happened |
| Actual behaviour | What actually happened |
| Reproduction steps | Can the issue be reliably reproduced? |
| Impact scope | How many users or sessions are affected? |
| Evidence | Screenshots, conversation logs, error messages |

---

## 3. Phase 2: Contain

### 3.1 Containment Decision Tree

- Active harm (data leak, financial loss, safety risk) → Execute EMERGENCY STOP (3.2) → SEV1
- Incorrect/harmful outputs affecting all users → Execute CIRCUIT BREAKER (3.3) → SEV2
- Incorrect/harmful outputs affecting subset → Execute SELECTIVE ISOLATION (3.4) → SEV2/3
- Degraded but functional → Execute GRACEFUL DEGRADATION (3.5) → SEV3
- Minor issue → Log and monitor → SEV4

### 3.2 Emergency Stop Procedure

Execute when the agent is causing active harm. Target: complete within 5 minutes.

| Step | Action | Verification |
|------|--------|-------------|
| 1 | Kill all agent processes | Confirm no agent processes running |
| 2 | Revoke agent API keys | Confirm API calls return 401 |
| 3 | Block agent network access | Confirm no outbound connections |
| 4 | Preserve evidence (logs, memory, conversation history) | Snapshots saved to incident evidence store |
| 5 | Notify stakeholders via SEV1 channels | Confirm receipt from incident commander |
| 6 | Activate fallback system | Confirm fallback is serving users |

### 3.3 Circuit Breaker Activation

| Step | Action |
|------|--------|
| 1 | Identify the affected capability (tool, function, or response type) |
| 2 | Disable the specific capability |
| 3 | Activate fallback (static response, human handoff, or graceful error) |
| 4 | Verify unaffected capabilities continue operating |
| 5 | Log what was disabled, when, and why |

### 3.4 Selective Isolation

| Step | Action |
|------|--------|
| 1 | Identify affected segment (user group, session type, region, input pattern) |
| 2 | Route affected segment to fallback via load balancer or feature flags |
| 3 | Verify normal operation for unaffected segment |
| 4 | Export affected sessions for investigation |

### 3.5 Graceful Degradation

| Step | Action |
|------|--------|
| 1 | Reduce agent to known-good capability set |
| 2 | Lower alert thresholds, increase monitoring sampling rate |
| 3 | Communicate degraded status to users (status page, in-chat notification) |
| 4 | Create incident ticket, assign to next available engineer |

---

## 4. Phase 3: Investigate

### 4.1 Log Analysis Checklist

| Log Source | What to Look For | Priority |
|-----------|-----------------|----------|
| Agent audit logs | Unusual action sequences, tool calls outside normal patterns | High |
| Input logs | Potential prompt injection attempts, malformed inputs | High |
| Output logs | Hallucinated content, data leakage, policy violations | High |
| Error logs | Exception patterns, timeout clusters, resource exhaustion | Medium |
| Performance metrics | Latency spikes correlated with incidents, token usage anomalies | Medium |
| Access logs | Unauthorised access attempts, credential misuse | High |
| Third-party API logs | Upstream service failures causing cascading issues | Medium |

### 4.2 Prompt Replay Procedure

For output quality incidents: extract the triggering input from audit logs, replay it in an isolated environment with the same agent configuration, and compare outputs. If reproducible, vary inputs systematically to identify the trigger. If not reproducible, investigate environmental factors (model version, context window state, concurrent load).

### 4.3 Root Cause Categories

| Category | Common Causes |
|----------|---------------|
| Model degradation | Provider model update, fine-tuning regression, context overflow |
| Prompt failure | Prompt injection, template error, missing context |
| Tool failure | API changes, rate limiting, auth expiry, schema changes |
| Data contamination | Cross-session leakage, stale cache, vector DB corruption |
| Infrastructure failure | Resource exhaustion, network partition, disk full |
| Configuration error | Wrong model version, incorrect parameters, missing env vars |
| Adversarial attack | Prompt injection, jailbreaking, data poisoning |
| Scaling failure | Insufficient compute, queue overflow, timeout cascade |

---

## 5. Phase 4: Remediate

### 5.1 Fix Categories

| Fix Category | Testing Requirements | Approval |
|-------------|---------------------|----------|
| Configuration change | Verify in staging with representative inputs | On-call engineer |
| Prompt update | Regression test suite, bias check, red team sample | Engineering lead |
| Code fix | Unit tests, integration tests, canary rollout | Code review + engineering lead |
| Infrastructure fix | Load test, failover test | Infrastructure owner |
| Vendor coordination | Verify fix in staging after vendor confirms | Engineering lead |
| Rollback | Verify known-good state still functions | On-call engineer |

### 5.2 Deployment Verification

After applying any fix: replay the triggering input to confirm the issue no longer reproduces, run the standard test suite to check for regressions, observe production metrics for one hour to confirm return to baseline, and if possible confirm resolution with the original reporter.

---

## 6. Phase 5: Review

### 6.1 Post-Mortem Template

| Section | Content |
|---------|---------|
| **Incident ID** | |
| **Severity** | SEV1 / SEV2 / SEV3 / SEV4 |
| **Duration** | Time from detection to resolution |
| **Impact** | Users affected, business impact, data impact |
| **Timeline** | Minute-by-minute reconstruction of the incident |
| **Root cause** | What caused the incident (from root cause categories above) |
| **Detection** | How was the incident detected? Could it have been detected earlier? |
| **Containment** | What containment actions were taken? Were they effective? |
| **Resolution** | What fixed the issue? |
| **Lessons learned** | What did we learn? What would we do differently? |
| **Action items** | Specific, assigned, time-bound actions to prevent recurrence |

### 6.2 Blameless Post-Mortem Rules

1. Focus on systems and processes, not individuals
2. Assume everyone acted with the best information available
3. Identify contributing factors, not a single root cause
4. Every lesson learned must produce at least one concrete action item
5. Action items must have an owner and a deadline
6. Post-mortem document is shared with all relevant stakeholders

---

## 7. Communication Templates

### 7.1 Internal Notification (SEV1/SEV2)

```
INCIDENT DECLARED: [SEV level] - [Brief description]
Time: [Timestamp]
Affected system: [Agent system name]
Impact: [User count, functionality affected]
Current status: [Detected / Contained / Investigating / Remediated]
Incident commander: [Name/Role]
Next update: [Time]
War room: [Channel/link]
```

### 7.2 Customer Communication

```
We are currently experiencing an issue with [service name] that may affect
[description of user-facing impact]. Our team is actively working to resolve
this. We expect to provide an update by [time].

We apologise for any inconvenience and appreciate your patience.
```

### 7.3 Regulatory Notification (if required)

Include: organisation name, DPO contact, date/time of incident, nature of incident, data subjects affected (number and categories), data categories involved, likely consequences, measures taken, and reference to applicable regulation (e.g., GDPR Article 33). Submit within the regulatory deadline (72 hours under GDPR).

---

## 8. Escalation Matrix

| Severity | First Responder | 15 Min Escalation | 1 Hour Escalation | 4 Hour Escalation |
|----------|----------------|-------------------|-------------------|-------------------|
| SEV1 | On-call engineer | Engineering lead + Security lead | VP Engineering + Legal | Executive team + External counsel |
| SEV2 | On-call engineer | Engineering lead | Product owner | VP Engineering |
| SEV3 | On-call engineer | Team lead | Engineering lead | Product owner |
| SEV4 | Ticket queue | Team lead (if SLA at risk) | — | — |

---

## 9. Common Agent Failure Runbooks

### 9.1 Hallucination Incident

| Step | Action |
|------|--------|
| 1 | Confirm hallucination via manual verification of agent output against ground truth |
| 2 | Classify scope: isolated (single response) vs systematic (pattern of hallucinations) |
| 3 | If systematic: activate circuit breaker for affected topic area or capability |
| 4 | Check for context window overflow, stale RAG data, or model version change |
| 5 | If RAG-related: verify vector store integrity, re-index if corrupted |
| 6 | Add guardrails: confidence thresholds, fact-checking step, or human review for affected area |
| 7 | Monitor for recurrence after fix |

### 9.2 Data Leak / Cross-Contamination

| Step | Action |
|------|--------|
| 1 | EMERGENCY STOP — halt the agent immediately |
| 2 | Identify scope: which sessions were affected, what data was exposed, to whom |
| 3 | Preserve all evidence (logs, memory state, conversation history) |
| 4 | Assess regulatory notification requirements (72-hour window under GDPR) |
| 5 | Notify affected users |
| 6 | Root cause: session isolation failure, shared memory contamination, caching bug |
| 7 | Fix isolation mechanism, verify with testing before restart |
| 8 | Engage legal counsel for regulatory obligations |

### 9.3 Prompt Injection Attack

| Step | Action |
|------|--------|
| 1 | Identify the injected prompt from input logs |
| 2 | Assess what the injection achieved (data extraction, behaviour modification, privilege escalation) |
| 3 | If data was extracted: treat as SEV1 data leak (see 9.2) |
| 4 | Block the specific injection pattern (input filter) |
| 5 | Review and harden system prompt boundaries |
| 6 | Add injection detection to input pipeline |
| 7 | Red team the fix to verify effectiveness |

### 9.4 Cost Runaway

| Step | Action |
|------|--------|
| 1 | Identify the source: which agent, which operation, which API |
| 2 | Kill the runaway process or activate rate limiter |
| 3 | Assess financial impact: actual spend vs budget |
| 4 | Root cause: infinite loop, recursive agent calls, missing token limits, upstream API cost change |
| 5 | Implement or tighten: per-request token limits, per-session cost caps, per-hour budget alerts |
| 6 | Verify billing with provider, request credits if applicable |
| 7 | Add pre-execution cost estimation for expensive operations |

---

## 10. Incident Register

Maintain a running log of all incidents for trend analysis and audit purposes.

| Incident ID | Date | Severity | Category | Description | Duration | Root Cause | Status |
|-------------|------|----------|----------|-------------|----------|------------|--------|
| | | | | | | | Open / Resolved / Closed |

Review the incident register monthly for patterns. If three or more incidents share a root cause category within a quarter, escalate for systemic remediation.

---

DISCLAIMER: This is a template framework, not legal advice. Consult qualified legal counsel for your jurisdiction.

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
