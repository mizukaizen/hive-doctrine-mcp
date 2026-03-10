# HD-5002: SOC2 Control Mapping for AI Agent Systems

**Product ID:** HD-5002
**Price Tier:** Honey ($29)
**Version:** 1.0
**Last Updated:** 2026-03-10

---

## Purpose

This document maps the AICPA Trust Service Criteria (TSC) used in SOC2 Type II examinations to the specific controls required for AI agent systems. Traditional SOC2 control mappings do not account for autonomous agents, tool use, prompt injection risks, multi-agent orchestration, or the unique data flows of retrieval-augmented generation (RAG) systems.

This mapping enables organisations to prepare for SOC2 audits by identifying which controls apply, what evidence is required, and where gaps exist in their current agent infrastructure.

---

## 1. Common Criteria (CC) Mapping

### CC1: Control Environment

| Control ID | TSC Criterion | Agent-Specific Control | Evidence Required |
|-----------|--------------|----------------------|-------------------|
| CC1.1 | Organisation demonstrates commitment to integrity and ethical values | AI ethics policy covering agent behaviour, bias monitoring, and responsible use | Documented AI ethics policy, ethics review board minutes |
| CC1.2 | Board exercises oversight of internal control | Executive-level accountability for agent system risks, regular reporting on agent incidents | Board meeting minutes, risk committee reports on AI operations |
| CC1.3 | Management establishes structure, authority, and responsibility | Clear ownership of agent systems: who builds, who deploys, who monitors | Organisation chart, RACI matrix for agent lifecycle |
| CC1.4 | Commitment to competence | Staff operating agent systems have appropriate AI/ML training | Training records, certification evidence, competency assessments |
| CC1.5 | Accountability for internal control | Agent system operators are held accountable for control effectiveness | Performance reviews, incident post-mortem assignments |

### CC2: Communication and Information

| Control ID | TSC Criterion | Agent-Specific Control | Evidence Required |
|-----------|--------------|----------------------|-------------------|
| CC2.1 | Quality information for internal control | Agent performance dashboards, anomaly detection alerts, cost monitoring | Dashboard screenshots, alert configuration, monitoring tool access |
| CC2.2 | Internal communication of control objectives | Agent operational runbooks, deployment checklists, incident response procedures | Published runbooks, team training records |
| CC2.3 | External communication of control matters | Customer-facing documentation on agent capabilities, limitations, and data handling | Published privacy policy, terms of service, agent disclosure notices |

### CC3: Risk Assessment

| Control ID | TSC Criterion | Agent-Specific Control | Evidence Required |
|-----------|--------------|----------------------|-------------------|
| CC3.1 | Clear objectives for risk identification | Agent risk register including: hallucination, data leakage, prompt injection, cost overrun, bias, availability | Risk register document, risk assessment meeting minutes |
| CC3.2 | Risk identification and analysis | Threat modelling for agent systems (STRIDE or equivalent adapted for agents) | Threat model documentation, risk heat maps |
| CC3.3 | Consideration of fraud risk | Prompt injection prevention, agent impersonation controls, adversarial input detection | Security testing reports, red team exercise results |
| CC3.4 | Change management risk assessment | Impact assessment for model updates, prompt changes, tool additions, agent capability expansion | Change advisory board records, impact assessment templates |

### CC4: Monitoring Activities

| Control ID | TSC Criterion | Agent-Specific Control | Evidence Required |
|-----------|--------------|----------------------|-------------------|
| CC4.1 | Ongoing and separate evaluations | Continuous monitoring of agent outputs, periodic manual review of agent decisions, automated quality checks | Monitoring tool configuration, review schedules, quality check results |
| CC4.2 | Communication of deficiencies | Escalation procedures when agent anomalies are detected, automated alerting for threshold breaches | Alert configuration, escalation matrix, incident tickets |

### CC5: Control Activities

| Control ID | TSC Criterion | Agent-Specific Control | Evidence Required |
|-----------|--------------|----------------------|-------------------|
| CC5.1 | Selection and development of control activities | Input validation, output filtering, rate limiting, token budgets, tool permission boundaries | Architecture documentation, control implementation evidence |
| CC5.2 | Technology general controls | Agent infrastructure: compute, networking, secrets management, deployment pipeline | Infrastructure diagrams, CI/CD pipeline configuration |
| CC5.3 | Control activities through policies and procedures | Agent deployment policy, model update policy, prompt management policy | Policy documents, version history |

### CC6: Logical and Physical Access

| Control ID | TSC Criterion | Agent-Specific Control | Evidence Required |
|-----------|--------------|----------------------|-------------------|
| CC6.1 | Logical access security | Agent-level RBAC: which agents access which tools, data stores, and APIs | Access control matrix, permission configuration |
| CC6.2 | User authentication | API key management, operator authentication, agent identity verification in multi-agent systems | Authentication configuration, key rotation logs |
| CC6.3 | Access authorisation | Approval workflows for granting agents new capabilities or tool access | Approval records, change tickets |
| CC6.4 | Access restrictions on physical assets | Secure hosting of agent infrastructure, HSM for signing keys if applicable | Data centre certifications, infrastructure provider SOC reports |
| CC6.5 | Logical access removal | Agent decommissioning procedures, API key revocation on agent retirement | Decommissioning checklists, key revocation logs |
| CC6.6 | System boundary definition | Network segmentation between agent systems, production/staging separation | Network diagrams, firewall rules |

### CC7: System Operations

| Control ID | TSC Criterion | Agent-Specific Control | Evidence Required |
|-----------|--------------|----------------------|-------------------|
| CC7.1 | Detection of changes | Agent behaviour drift detection, prompt version control, model fingerprinting | Monitoring alerts, version control history |
| CC7.2 | Monitoring for anomalies | Token usage anomaly detection, cost runaway alerts, output quality degradation monitoring | Alert configuration, anomaly detection rules |
| CC7.3 | Evaluation of events | Agent incident triage procedures, severity classification for agent-specific failure modes | Incident response playbook, triage records |
| CC7.4 | Incident response | Agent-specific incident response: isolation, circuit breakers, rollback procedures | Incident response plan, drill records |
| CC7.5 | Recovery from incidents | Agent recovery procedures: restore from known-good state, re-validate outputs, post-recovery testing | Recovery runbooks, test results |

### CC8: Change Management

| Control ID | TSC Criterion | Agent-Specific Control | Evidence Required |
|-----------|--------------|----------------------|-------------------|
| CC8.1 | Change management process | Controlled deployment of prompt updates, model changes, tool additions, agent configuration changes | Change management tickets, approval records, deployment logs |

### CC9: Risk Mitigation

| Control ID | TSC Criterion | Agent-Specific Control | Evidence Required |
|-----------|--------------|----------------------|-------------------|
| CC9.1 | Vendor and business partner risk | Third-party LLM provider risk assessment, data processing agreements, sub-processor audits | Vendor risk assessments, DPAs, sub-processor registers |
| CC9.2 | Vendor management | SLA monitoring for LLM providers, model availability tracking, fallback provider configuration | SLA documents, uptime reports, failover test results |

---

## 2. Security Category Controls

| Control Area | Agent-Specific Implementation | Evidence |
|-------------|------------------------------|----------|
| Encryption at rest | All agent memory stores, vector databases, conversation logs encrypted (AES-256 minimum) | Encryption configuration, key management documentation |
| Encryption in transit | TLS 1.2+ for all agent-to-agent, agent-to-API, and agent-to-user communication | TLS configuration, certificate management |
| Network segmentation | Agent systems isolated from general corporate network; agent-to-agent communication restricted to defined channels | Network diagrams, firewall rules |
| Vulnerability management | Regular scanning of agent infrastructure, dependency audits for agent frameworks | Scan reports, remediation timelines |
| Penetration testing | Annual penetration testing including agent-specific attack vectors (prompt injection, tool abuse, data exfiltration) | Pen test reports, remediation evidence |

---

## 3. Availability Controls

| Control Area | Agent-Specific Implementation | Evidence |
|-------------|------------------------------|----------|
| Uptime SLA | Defined availability target for agent services (e.g., 99.9%) | SLA documentation, uptime monitoring dashboards |
| Failover | Automatic failover to secondary LLM provider or degraded-capability mode | Failover configuration, failover test results |
| Disaster recovery | Agent system recovery within defined RTO/RPO; includes prompt libraries, configuration, and conversation state | DR plan, DR test results |
| Capacity planning | Token budget monitoring, compute scaling policies, queue depth monitoring | Capacity plans, auto-scaling configuration |
| Incident communication | Status page or equivalent for communicating agent system availability to users | Status page URL, communication templates |

---

## 4. Processing Integrity Controls

| Control Area | Agent-Specific Implementation | Evidence |
|-------------|------------------------------|----------|
| Input validation | Schema validation on agent inputs, maximum input length enforcement, content filtering | Validation rules, test results |
| Output verification | Output quality checks, hallucination detection, fact-checking pipelines (where applicable) | Quality check configuration, sample verification results |
| Audit trails | Complete logging of agent actions: inputs, outputs, tool calls, decisions, errors | Log schema documentation, sample log entries |
| Idempotency | Agent actions that modify external state must be idempotent or have rollback capability | Architecture documentation, test results |
| Determinism controls | Where deterministic output is required, temperature=0, fixed seeds, and output pinning | Configuration evidence, test results |

---

## 5. Confidentiality Controls

| Control Area | Agent-Specific Implementation | Evidence |
|-------------|------------------------------|----------|
| Data classification | Classification scheme applied to all data accessible by agents (public, internal, confidential, restricted) | Classification policy, data inventory |
| Agent access boundaries | Each agent role can only access data at or below its classification level | Access control matrix, permission tests |
| PII handling | PII detection in agent inputs/outputs, masking/redaction pipelines, minimisation in prompts | PII detection configuration, test results |
| Secrets management | Agent credentials, API keys, and signing keys stored in secrets manager (not in code, config, or prompts) | Secrets manager configuration, code scan results |
| Data isolation | Multi-tenant agent systems enforce strict data isolation between tenants | Isolation architecture, penetration test results |

---

## 6. Privacy Controls

| Control Area | Agent-Specific Implementation | Evidence |
|-------------|------------------------------|----------|
| Consent management | Explicit consent collection for data processing by agents; granular consent options | Consent UI, consent records |
| Data minimisation | Agents receive only the minimum data necessary for their task; prompt engineering for minimisation | Prompt templates, data flow diagrams |
| Purpose limitation | Each agent processing activity tied to a specific, documented purpose | Processing register, purpose mapping |
| Data subject rights | Automated or semi-automated workflows for access, deletion, portability, and rectification requests | Workflow documentation, test results |
| Privacy by design | Privacy impact assessments conducted before deploying new agent capabilities | DPIA documents, review records |

---

## 7. Evidence Collection Templates

For each control, collect the following evidence package:

| Evidence Type | Description | Collection Frequency |
|--------------|-------------|---------------------|
| Policy document | The written policy governing the control | Annual review |
| Configuration evidence | Screenshots or exports of system configuration implementing the control | Quarterly |
| Test results | Evidence that the control was tested and found effective | Quarterly or on change |
| Monitoring data | Dashboard exports, alert history, metric trends | Monthly |
| Incident records | Relevant incidents and their resolution, demonstrating the control was invoked | Ongoing |
| Training records | Evidence that relevant staff understand and follow the control | Annual |

---

## 8. Gap Analysis Worksheet

Use this worksheet to assess your current state against each control area.

| Control ID | Control Description | Current State | Gap Severity | Remediation Action | Owner | Target Date | Status |
|-----------|--------------------:|--------------|-------------|-------------------|-------|-------------|--------|
| CC1.1 | AI ethics policy | Not started / Partial / Complete | Critical / High / Medium / Low | | | | |
| CC3.1 | Agent risk register | Not started / Partial / Complete | Critical / High / Medium / Low | | | | |
| CC5.1 | Input/output controls | Not started / Partial / Complete | Critical / High / Medium / Low | | | | |
| CC6.1 | Agent RBAC | Not started / Partial / Complete | Critical / High / Medium / Low | | | | |
| CC7.2 | Anomaly monitoring | Not started / Partial / Complete | Critical / High / Medium / Low | | | | |
| CC7.4 | Incident response | Not started / Partial / Complete | Critical / High / Medium / Low | | | | |
| CC8.1 | Change management | Not started / Partial / Complete | Critical / High / Medium / Low | | | | |
| CC9.1 | Vendor risk assessment | Not started / Partial / Complete | Critical / High / Medium / Low | | | | |

### Severity Rating Guide

| Severity | Definition |
|----------|-----------|
| Critical | No control in place; high likelihood of material impact on audit opinion |
| High | Control exists but is ineffective or inconsistently applied |
| Medium | Control exists and is partially effective; improvements needed for audit readiness |
| Low | Control is effective with minor documentation or evidence gaps |

---

## Audit Preparation Timeline

| Weeks Before Audit | Activity |
|--------------------|----------|
| 16 weeks | Complete gap analysis, assign remediation owners |
| 12 weeks | Begin remediation of Critical and High gaps |
| 8 weeks | Complete all Critical remediations; begin evidence collection |
| 4 weeks | Complete all High remediations; evidence packages assembled |
| 2 weeks | Internal readiness review; address remaining gaps |
| 0 weeks | Audit begins |

---

DISCLAIMER: This is a template framework, not legal advice. Consult qualified legal counsel for your jurisdiction.

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
