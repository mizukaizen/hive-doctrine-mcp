---
title: "AI SDR Product Spec — Cheat Sheet"
hive_doctrine_id: HD-0039
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0039
full_product_price: 49
---

# AI SDR Product Spec — Cheat Sheet

## What It Is

A complete product requirements document for building an AI-powered Sales Development Representative (SDR) platform.

## 3 User Personas

| Persona | Description | Key Need |
|---------|-------------|----------|
| **Bootstrapped Founder** | Solo, no sales team, $0-49/mo budget | Automated outreach that doesn't feel robotic |
| **Sales Manager** | 5-15 person team, $99-299/mo budget | Scale pipeline without hiring more SDRs |
| **Director of Sales** | 50+ person org, $499+/mo budget | Data-driven prospecting, CRM integration |

## Feature Set

### MVP (Launch)
- AI-generated personalised outreach emails
- Lead list import (CSV, CRM integration)
- Email sequence builder (3-6 touch campaigns)
- Basic analytics (open rate, reply rate, bounce rate)
- Prospect research from LinkedIn/web

### Post-MVP
- Multi-channel sequences (email + LinkedIn + Twitter)
- A/B testing on messaging
- CRM auto-sync (Salesforce, HubSpot)
- Team management and reporting

### Nice-to-Have
- AI phone call scheduling
- Real-time buying signal detection
- Custom AI voice messages

## Technical Architecture

| Layer | Stack |
|-------|-------|
| Frontend | Next.js, React |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| AI | Claude API for personalisation |
| Email | SendGrid or Postmark |
| Queue | Redis + Bull |

## Key User Story

> As a bootstrapped founder, I want to upload a list of 100 prospects and have the system generate personalised outreach emails for each, so I can start a sales pipeline without hiring an SDR.

**Acceptance criteria:**
- Upload CSV with name, company, role, LinkedIn URL
- System researches each prospect (30 seconds per prospect)
- Generates personalised email (references their company, role, recent activity)
- User reviews and approves before sending

## Success Metrics

- **Activation:** 50% of users send first campaign within 7 days
- **Reply rate:** >5% on AI-generated emails (industry avg: 1-3%)
- **Retention:** 40% monthly retention at 6 months

## 18-Week Timeline

Weeks 1-4: Core backend + email engine | Weeks 5-8: Frontend + prospect research | Weeks 9-12: Sequences + analytics | Weeks 13-16: CRM integration | Weeks 17-18: Beta launch

---

*This is the condensed version. The full guide (HD-0039, $49) covers the complete PRD with detailed user stories, acceptance criteria, technical architecture diagrams, and the full 18-week timeline. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
