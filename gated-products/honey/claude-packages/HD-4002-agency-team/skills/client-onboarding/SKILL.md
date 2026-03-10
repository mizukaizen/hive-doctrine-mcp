# Skill: Client Onboarding

Use when onboarding a new client. Creates a structured onboarding process that captures requirements, sets expectations, and establishes communication norms.

## Trigger

Invoke this skill when a new client engagement begins, after the contract is signed but before development starts.

## Process

### 1. Requirements Gathering
Walk through a structured questionnaire:

**Business Context:**
- What problem does this project solve for your business?
- Who are the end users? How many?
- What does success look like? How will you measure it?
- Are there hard deadlines (e.g., event launch, regulatory compliance)?

**Technical Requirements:**
- Existing systems this must integrate with?
- Preferred tech stack or platform constraints?
- Expected traffic/load (users, requests per second)?
- Data sensitivity level (public, internal, PII, financial)?

**Design Requirements:**
- Brand guidelines or design system?
- Reference sites or apps you admire?
- Accessibility requirements (WCAG level)?

**Process Preferences:**
- Preferred communication channel (email, Slack, Teams)?
- Feedback turnaround time expectation?
- Approval process (single stakeholder or committee)?
- How often do you want status updates?

### 2. Scope Agreement
Based on requirements, draft a scope document covering:
- Included features (explicit list)
- Excluded features (explicit list — prevents future disputes)
- Assumptions (what must be true for estimates to hold)
- Change request process

### 3. Project Setup
Run `/new-client` to scaffold the project structure with gathered information.

### 4. Kickoff Checklist
Generate a kickoff checklist:
- [ ] Requirements document reviewed and signed off
- [ ] Scope document reviewed and signed off
- [ ] Communication channel set up
- [ ] Access to client systems granted (staging, APIs, brand assets)
- [ ] First milestone and deadline agreed
- [ ] Status update schedule confirmed

## Output

Save onboarding artefacts to `clients/[client-slug]/docs/onboarding/`:
- `requirements.md` — Captured requirements
- `kickoff-checklist.md` — Checklist with status

## Rules

- Never start development before requirements and scope are signed off.
- If the client cannot answer a requirements question, log it as an assumption and flag the risk.
- Keep the onboarding process to a single session if possible. Long onboarding delays project start.
