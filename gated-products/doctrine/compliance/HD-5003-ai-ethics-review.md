# HD-5003: AI Ethics Review Template for Agent Deployments

**Product ID:** HD-5003
**Price Tier:** Doctrine ($9.99)
**Version:** 1.0
**Last Updated:** 2026-03-10

---

## Purpose

This template provides a structured framework for conducting ethical reviews of AI agent deployments. It is designed for organisations that deploy autonomous or semi-autonomous agents and need a repeatable, auditable process for evaluating the ethical implications of those deployments.

An ethics review is not a one-time exercise. It must be conducted before initial deployment, at regular intervals during operation, and whenever significant changes are made to agent capabilities, data sources, or user populations.

---

## 1. Deployment Summary

Complete this section for each agent deployment under review.

| Field | Entry |
|-------|-------|
| Agent System Name | |
| Deployment ID / Version | |
| Review Date | |
| Reviewer(s) | |
| Deployment Environment | Staging / Production / Internal / External |
| User Population | Description of who interacts with or is affected by the agent |
| Primary Function | What does the agent do? |
| Decision Authority Level | Advisory / Automated with human review / Fully autonomous |
| Review Type | Pre-deployment / Periodic / Triggered |
| Previous Review Date (if applicable) | |
| Previous Review Outcome | Pass / Conditional Pass / Fail / N/A |

---

## 2. Fairness Assessment

### 2.1 Fairness Criteria Checklist

Evaluate the agent against established fairness criteria. Not all criteria apply to every deployment; mark N/A where appropriate and document the reasoning.

| Criterion | Assessment | Status | Notes |
|-----------|-----------|--------|-------|
| **Demographic parity** — Does the agent produce equitable outcomes across demographic groups? | | Pass / Fail / N/A | |
| **Equalised odds** — Does the agent maintain similar true positive and false positive rates across groups? | | Pass / Fail / N/A | |
| **Individual fairness** — Do similar individuals receive similar treatment from the agent? | | Pass / Fail / N/A | |
| **Counterfactual fairness** — Would the agent's decision change if a protected attribute were different? | | Pass / Fail / N/A | |
| **Group fairness** — Are outcomes distributed proportionally across relevant groups? | | Pass / Fail / N/A | |
| **Procedural fairness** — Is the process by which the agent makes decisions fair and consistent? | | Pass / Fail / N/A | |

### 2.2 Protected Attributes Under Consideration

List the protected attributes relevant to this deployment. Consider local anti-discrimination legislation.

| Attribute | Relevance to This Deployment | Monitoring in Place? |
|-----------|------------------------------|---------------------|
| Age | | Yes / No |
| Gender | | Yes / No |
| Race / Ethnicity | | Yes / No |
| Disability | | Yes / No |
| Religion | | Yes / No |
| Sexual orientation | | Yes / No |
| Socioeconomic status | | Yes / No |
| Geographic location | | Yes / No |
| Language / Dialect | | Yes / No |

---

## 3. Bias Assessment

### 3.1 Training Data Audit

| Question | Response | Evidence |
|----------|----------|----------|
| What data was used to train or fine-tune the underlying model? | | |
| Is the training data representative of the deployment population? | Yes / No / Unknown | |
| Has the training data been audited for known biases? | Yes / No | |
| Are there known gaps or underrepresentation in the training data? | | |
| Was synthetic data used? If so, what generation methodology? | | |
| Is the training data provenance documented? | Yes / No | |

### 3.2 Output Bias Testing

| Test Type | Methodology | Results Summary | Pass / Fail |
|-----------|------------|-----------------|-------------|
| Prompt variation testing | Vary demographic signals in prompts, compare outputs | | |
| Toxicity scoring | Run representative inputs through toxicity classifier | | |
| Sentiment analysis | Analyse sentiment distribution across demographic groups | | |
| Stereotype testing | Test for reinforcement of known stereotypes | | |
| Language quality parity | Compare output quality across languages/dialects served | | |

### 3.3 Intersectional Analysis

Bias can compound at the intersection of multiple attributes (e.g., age + gender, race + socioeconomic status). Document intersectional testing performed.

| Intersection Tested | Methodology | Findings | Action Required |
|--------------------|------------|----------|-----------------|
| | | | Yes / No |
| | | | Yes / No |
| | | | Yes / No |

---

## 4. Transparency Requirements

| Requirement | Implementation Status | Evidence |
|-------------|----------------------|----------|
| **User disclosure** — Users are informed they are interacting with an AI agent | Implemented / Partial / Not implemented | |
| **Capability disclosure** — Agent capabilities and limitations are communicated | Implemented / Partial / Not implemented | |
| **Data use disclosure** — Users understand what data the agent collects and why | Implemented / Partial / Not implemented | |
| **Decision explainability** — Agent can explain its reasoning when asked | Implemented / Partial / Not implemented | |
| **Confidence communication** — Agent communicates uncertainty or low confidence | Implemented / Partial / Not implemented | |
| **Source attribution** — Agent cites sources when making factual claims | Implemented / Partial / Not implemented | |
| **Error acknowledgement** — Agent can acknowledge mistakes | Implemented / Partial / Not implemented | |
| **Opt-out availability** — Users can request human assistance instead | Implemented / Partial / Not implemented | |

---

## 5. Human Oversight Provisions

### 5.1 Oversight Mechanisms

| Mechanism | Description | Status |
|-----------|-------------|--------|
| **Escalation triggers** — Conditions under which the agent escalates to a human | | Active / Planned / N/A |
| **Override capability** — Human operators can override agent decisions in real time | | Active / Planned / N/A |
| **Kill switch** — Ability to immediately halt agent operations | | Active / Planned / N/A |
| **Output review queue** — Sample of agent outputs reviewed by humans | | Active / Planned / N/A |
| **Decision audit trail** — Complete record of agent decisions available for human review | | Active / Planned / N/A |
| **Feedback loop** — Users can flag problematic agent behaviour | | Active / Planned / N/A |

### 5.2 Escalation Trigger Definitions

Define the specific conditions that trigger escalation from agent to human.

| Trigger | Threshold | Response |
|---------|-----------|----------|
| Low confidence score | Below configurable threshold | Route to human reviewer |
| Sensitive topic detection | Keywords/classifiers for defined sensitive topics | Pause and escalate |
| User request for human | Explicit user request | Immediate handoff |
| Repeated user dissatisfaction | N consecutive negative feedback signals | Escalate and flag for review |
| Out-of-scope query | Agent unable to respond within defined scope | Handoff with context |
| High-stakes decision | Decision exceeds defined impact threshold | Require human approval |

### 5.3 Review Cadence

| Review Type | Frequency | Scope | Reviewer |
|-------------|-----------|-------|----------|
| Output sampling review | Weekly | Random sample of N agent interactions | |
| Escalation pattern review | Monthly | Analysis of escalation triggers and outcomes | |
| Bias monitoring review | Quarterly | Full bias assessment against fairness criteria | |
| Comprehensive ethics review | Annually | Full review using this template | |
| Triggered review | On event | Triggered by incidents, complaints, or significant changes | |

---

## 6. Stakeholder Impact Assessment

Identify all stakeholders affected by the agent deployment and assess impact.

| Stakeholder Group | Relationship to Agent | Potential Positive Impact | Potential Negative Impact | Risk Level | Mitigation |
|-------------------|----------------------|--------------------------|--------------------------|------------|------------|
| Direct users | Interact with agent | | | Low / Medium / High | |
| Indirect users | Affected by agent decisions | | | Low / Medium / High | |
| Internal staff | Operate/maintain agent | | | Low / Medium / High | |
| Displaced workers | Role partially/fully automated | | | Low / Medium / High | |
| Vulnerable populations | May be disproportionately affected | | | Low / Medium / High | |
| Broader society | Systemic effects | | | Low / Medium / High | |

---

## 7. Dual-Use Risk Evaluation

Assess whether the agent system could be repurposed for harmful applications.

| Risk Category | Description | Likelihood | Severity | Mitigation |
|--------------|-------------|-----------|----------|------------|
| Misinformation generation | Agent used to create misleading content at scale | Low / Medium / High | Low / Medium / High | |
| Surveillance enablement | Agent capabilities repurposed for monitoring individuals | Low / Medium / High | Low / Medium / High | |
| Social manipulation | Agent used to influence behaviour without informed consent | Low / Medium / High | Low / Medium / High | |
| Weaponisation | Agent capabilities used to cause physical or economic harm | Low / Medium / High | Low / Medium / High | |
| Discriminatory application | Agent deployed in contexts that amplify discrimination | Low / Medium / High | Low / Medium / High | |

---

## 8. Environmental Impact Consideration

| Factor | Measurement / Estimate | Notes |
|--------|----------------------|-------|
| Compute resources consumed (GPU hours/month) | | |
| Estimated energy consumption (kWh/month) | | |
| Carbon footprint estimate (kg CO2e/month) | | |
| Data centre energy source | Renewable / Mixed / Non-renewable | |
| Optimisation measures in place | Model distillation, caching, request batching, etc. | |
| Proportionality assessment | Is the environmental cost justified by the benefit? | |

---

## 9. Accountability Matrix

| Responsibility | Role / Individual | Authority Level |
|---------------|-------------------|-----------------|
| Ethics review sign-off | | Final approval |
| Bias monitoring and reporting | | Operational |
| Incident response for ethical issues | | Escalation |
| User complaint handling | | Operational |
| Regulatory compliance | | Advisory |
| Model/prompt governance | | Technical |
| Training and awareness | | Organisational |
| External ethics advisory | | Advisory |

---

## 10. Review Outcome

| Field | Entry |
|-------|-------|
| Overall Assessment | Pass / Conditional Pass / Fail |
| Conditions (if conditional) | |
| Required Actions Before Deployment | |
| Required Actions During Operation | |
| Next Review Date | |
| Reviewer Signatures | |

### Triggers for Re-Review

The following events require a new ethics review using this template:

- Change in agent model or significant prompt changes
- Expansion to new user populations or geographies
- Addition of new tool capabilities
- Significant increase in agent autonomy or decision authority
- External incident in the industry raising new ethical concerns
- Regulatory changes affecting AI ethics obligations
- User complaints or incidents indicating ethical concerns
- Six months since last review (maximum review interval)

---

DISCLAIMER: This is a template framework, not legal advice. Consult qualified legal counsel for your jurisdiction.

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
