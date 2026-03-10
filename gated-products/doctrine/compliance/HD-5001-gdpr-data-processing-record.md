# HD-5001: GDPR Data Processing Record Template for AI Agent Systems

**Product ID:** HD-5001
**Price Tier:** Doctrine ($9.99)
**Version:** 1.0
**Last Updated:** 2026-03-10

---

## Purpose

This template provides a structured framework for documenting data processing activities carried out by AI agent systems, in compliance with Article 30 of the General Data Protection Regulation (GDPR). Organisations deploying AI agents must maintain records of processing activities (ROPA) that account for the unique data flows created by autonomous and semi-autonomous agent systems.

Traditional ROPA templates do not adequately capture the complexity of agent-based processing, where data may be ingested, transformed, stored in vector databases, used for context retrieval, and passed between multiple agents in a single workflow. This template addresses those gaps.

---

## 1. Controller Information

| Field | Entry |
|-------|-------|
| Organisation Name | |
| Registration Number | |
| Registered Address | |
| Data Protection Officer (DPO) | |
| DPO Email | |
| DPO Phone | |
| EU Representative (if applicable) | |
| Representative Address | |
| Date of Last ROPA Update | |
| Next Scheduled Review | |

---

## 2. Data Inventory

Document every category of personal data processed by agent systems. One row per data category.

| Data Category | Source | Format | Typical Volume (records/month) | Storage Location | Encryption at Rest | Encryption in Transit |
|--------------|--------|--------|-------------------------------|-----------------|--------------------|-----------------------|
| Conversation logs | User input via chat interface | JSON/plaintext | | | Yes / No | Yes / No |
| User preferences | User settings, explicit configuration | JSON | | | Yes / No | Yes / No |
| Embedding vectors | Derived from user content | Float arrays (768/1536-dim) | | | Yes / No | Yes / No |
| Session metadata | System-generated | Structured logs | | | Yes / No | Yes / No |
| User identifiers | Registration / authentication | UUID, email, username | | | Yes / No | Yes / No |
| Behavioural analytics | Agent interaction tracking | Event streams | | | Yes / No | Yes / No |
| Feedback data | User ratings, corrections | JSON | | | Yes / No | Yes / No |
| Third-party API responses | External services called by agents | JSON/XML | | | Yes / No | Yes / No |

### Notes on Embedding Vectors

Embedding vectors derived from personal data constitute personal data under GDPR, even though they are not human-readable. If a vector can be used to re-identify an individual or is linked to an identifiable individual, it falls within scope. Document the embedding model used, the input data type, and whether vectors are stored with or without linkage to source identifiers.

---

## 3. Processing Purposes and Legal Basis

For each processing activity, document the purpose and the legal basis under Article 6(1) GDPR.

| Processing Activity | Purpose | Legal Basis (Art. 6) | Justification |
|---------------------|---------|---------------------|---------------|
| Storing conversation logs | Service delivery, context continuity | 6(1)(b) Contract performance | Necessary to provide the agent service the user has engaged |
| Generating embedding vectors | Semantic search, retrieval-augmented generation | 6(1)(f) Legitimate interest | Enables relevant responses; balanced against user privacy via anonymisation |
| User preference storage | Personalisation of agent behaviour | 6(1)(a) Consent | User explicitly opts into personalisation features |
| Session metadata logging | Security monitoring, abuse prevention | 6(1)(f) Legitimate interest | Necessary for platform integrity; minimal data collected |
| Behavioural analytics | Service improvement, agent performance monitoring | 6(1)(f) Legitimate interest | Aggregated analysis; individual tracking minimised |
| Training data curation | Model fine-tuning, agent improvement | 6(1)(a) Consent | Separate explicit consent required; opt-out available |
| Incident investigation | Security and compliance | 6(1)(c) Legal obligation | Required under applicable cybersecurity regulations |

### Legitimate Interest Assessment (LIA) Summary

For each activity relying on Art. 6(1)(f), complete a Legitimate Interest Assessment:

1. **Purpose test:** Is the interest legitimate? Is it necessary?
2. **Necessity test:** Is the processing necessary for that purpose? Could less intrusive means achieve the same result?
3. **Balancing test:** Does the individual's interests, rights, or freedoms override the legitimate interest?

Document LIA outcomes separately and reference them here by assessment ID.

---

## 4. Data Subject Categories

| Category | Description | Age Restrictions | Special Considerations |
|----------|-------------|-----------------|----------------------|
| End users | Individuals interacting directly with agents | Must be 16+ (or local age of digital consent) | May include vulnerable individuals |
| Operators | Staff managing agent systems | N/A (employees) | Access logged and audited |
| Third-party data subjects | Individuals mentioned in user inputs | No direct relationship | Cannot obtain direct consent; rely on legitimate interest or user responsibility |
| API consumers | Developers integrating via API | N/A (B2B) | Data processing agreement required |

---

## 5. Retention Periods

| Data Type | Retention Period | Justification | Auto-Purge Enabled | Review Trigger |
|-----------|-----------------|---------------|--------------------|----|
| Conversation logs | 90 days | Service continuity, dispute resolution | Yes | Quarterly |
| User preferences | Duration of account + 30 days | Service delivery | Yes | On account deletion |
| Embedding vectors | 90 days (linked) / indefinite (anonymised) | Search relevance | Yes (linked only) | Quarterly |
| Session metadata | 180 days | Security analysis | Yes | Bi-annually |
| Audit logs | 2 years | Compliance evidence | No | Annually |
| Training data (consented) | Until consent withdrawn or model retired | Model improvement | No | Annually |
| Error/debug logs | 30 days | Troubleshooting | Yes | Monthly |
| Behavioural analytics (aggregated) | 1 year | Trend analysis | Yes | Annually |

---

## 6. Data Protection Impact Assessment (DPIA) Trigger Checklist

Under Article 35 GDPR, a DPIA is mandatory when processing is "likely to result in a high risk to the rights and freedoms of natural persons." For AI agent systems, assess the following triggers:

| Trigger | Applies? (Y/N) | Notes |
|---------|----------------|-------|
| Systematic and extensive profiling with significant effects | | Agent personalisation that affects service access or pricing |
| Large-scale processing of special category data (Art. 9) | | Health data, biometric data, political opinions in conversations |
| Systematic monitoring of publicly accessible areas | | Agents scraping or monitoring public forums |
| Use of new technologies (including AI/ML) | | Generally YES for agent systems |
| Automated decision-making with legal or similarly significant effects | | Agent decisions affecting contracts, access, pricing |
| Large-scale processing of personal data | | Threshold: typically >10,000 data subjects or high sensitivity |
| Matching or combining datasets from multiple sources | | RAG systems pulling from multiple data sources |
| Data concerning vulnerable data subjects | | Children, elderly, patients, employees |
| Innovative use of existing technology | | Novel agent architectures, multi-agent orchestration |
| Cross-border data transfers outside EEA | | Cloud infrastructure in non-EEA jurisdictions |

**Rule:** If two or more triggers are marked YES, a DPIA is required. Document the DPIA separately and reference it here by assessment ID.

---

## 7. International Data Transfers

| Transfer | Destination Country | Transfer Mechanism | Adequacy Decision? | Supplementary Measures |
|----------|--------------------|--------------------|-------------------|----------------------|
| Cloud hosting (primary) | | SCCs / Adequacy / BCRs | Yes / No | |
| LLM API provider | | SCCs | Yes / No | Data minimisation, no training on inputs |
| Embedding service | | SCCs | Yes / No | Pseudonymisation before transfer |
| Analytics platform | | Adequacy decision | Yes / No | |
| Backup/DR storage | | SCCs | Yes / No | Encryption before transfer |

### Standard Contractual Clauses (SCCs) Checklist

- [ ] SCCs executed with each data importer
- [ ] Transfer Impact Assessment (TIA) completed for each transfer
- [ ] Supplementary measures documented where adequacy is uncertain
- [ ] SCCs use the 2021 EU Commission version (not the deprecated 2010 version)
- [ ] Module selection documented (Controller-to-Controller, Controller-to-Processor, etc.)

---

## 8. Technical and Organisational Measures

| Measure | Implementation Status | Evidence Location |
|---------|----------------------|-------------------|
| Encryption at rest (AES-256 or equivalent) | | |
| Encryption in transit (TLS 1.2+) | | |
| Access controls (RBAC) | | |
| Audit logging | | |
| Data minimisation in agent prompts | | |
| Pseudonymisation / anonymisation pipelines | | |
| Regular penetration testing | | |
| Incident response plan | | |
| Staff training on data protection | | |
| Data Processing Agreements with all processors | | |

---

## 9. Processor and Sub-Processor Register

| Processor Name | Service Provided | DPA Signed? | DPA Date | Sub-Processors Disclosed? | Data Categories Shared |
|---------------|-----------------|------------|----------|--------------------------|----------------------|
| | LLM inference | Yes / No | | Yes / No | |
| | Cloud hosting | Yes / No | | Yes / No | |
| | Embedding generation | Yes / No | | Yes / No | |
| | Monitoring/observability | Yes / No | | Yes / No | |

---

## 10. Data Subject Rights Procedures

| Right | Response Deadline | Process Owner | Automated? | Notes |
|-------|------------------|--------------|------------|-------|
| Access (Art. 15) | 30 days | | Partial | Include conversation logs, preferences, embeddings metadata |
| Rectification (Art. 16) | 30 days | | No | Manual review of stored data |
| Erasure (Art. 17) | 30 days | | Yes | Cascading deletion across all agent memory stores |
| Restriction (Art. 18) | 30 days | | Partial | Flag data, prevent further processing |
| Portability (Art. 20) | 30 days | | Yes | JSON export of user data |
| Objection (Art. 21) | 30 days | | No | Assessment required for legitimate interest processing |

---

## Review and Maintenance

This record must be reviewed and updated:

- **Quarterly** as a minimum
- **Immediately** when new data categories are introduced
- **Immediately** when new agents or agent capabilities are deployed
- **Immediately** when processors or sub-processors change
- **On request** by the supervisory authority

| Review Date | Reviewer | Changes Made | Next Review Due |
|-------------|----------|--------------|-----------------|
| | | | |

---

DISCLAIMER: This is a template framework, not legal advice. Consult qualified legal counsel for your jurisdiction.

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
