---
title: "Agent Onboarding Playbook: Day 1 to Day 30"
author: Melisia Archimedes
collection: C4 Infrastructure
tier: honey
price: 149
version: 1.0
last_updated: 2026-03-09
audience: agent_operators
hive_doctrine_id: HD-1105
sources_researched: [agent deployment guides, production case studies, DevOps onboarding literature, multi-agent operations manuals]
word_count: 7231
---

# Agent Onboarding Playbook: Day 1 to Day 30

## Introduction: Why Most Agent Deployments Fail in the First Month

You've built the agent. It works brilliantly in your notebook. Then you push to production and everything falls apart.

The agent hallucinates. It repeats loops. It costs $3,000 in a week. Your users lose trust. You burn out. You shelve the project.

This is remarkably common. Not because your agent is broken—it's because you didn't onboard it properly.

Most agent deployments fail in the first 30 days not due to technical architecture, but due to absence of structure. No baseline metrics. No cost guards. No escalation plan. No team alignment. Prompts that drift. Tools that fail silently. Memory that grows unbounded.

The first 30 days determine everything: whether your agent scales, whether it earns trust, whether it becomes a revenue driver or a support nightmare. Get this period right, and you're positioned to grow. Get it wrong, and you're fighting uphill for months.

This playbook is your map. It's built on production deployments across dozens of agent systems—research agents, content systems, trading systems, customer support agents—across financial, media, and software verticals. It contains the actual steps you'll take, the metrics you'll track, the failures you'll sidestep, and the decision gates you'll use to move forward.

You won't follow this sequentially. You'll adapt it to your context. But the skeleton is proven.

### The 30-Day Framework

The playbook breaks into four phases:

- **Week 1 (Foundation):** Get the agent live, measure baseline performance, establish feedback loops.
- **Week 2 (Integration):** Connect to real data, harden security, establish cost controls.
- **Week 3 (Optimisation):** Reduce cost and latency, set up evaluation frameworks, define escalations.
- **Week 4 (Launch Readiness):** Load test, audit compliance, document runbooks, train your team.

At the end of Week 4, you make a binary decision: go live at scale or investigate blockers.

---

## Pre-Launch Checklist (Day 0)

Before you deploy anything, you need to know whether your environment can support this agent. Day 0 is your insurance policy. It takes 4–6 hours and saves you weeks of firefighting.

### Infrastructure & Model Audit

**Declare your model choice.** Which model runs your agent? Claude 3.5 Sonnet? Claude 3 Opus? Specify versions. Document why. If you're evaluating multiple models, commit to a champion for the first 30 days; you can A/B test later.

**Budget cap.** Calculate your monthly spend ceiling. Use the Agent Cost Calculator (HD-1002) if you haven't already. For a reasoning-heavy agent with moderate volume, budget $500–2,000/month for your first pilot. Set hard API spend limits at the provider level—not soft targets, hard limits. Configure billing alerts at 50%, 75%, and 90% of cap.

**Latency requirements.** Define acceptable latency for your use case. If this is a search agent, you likely need sub-2-second response times. If it's a report-writing agent, 30 seconds is fine. Measure baseline latency during Week 1; you'll use this as your North Star throughout onboarding.

**Concurrency and throughput.** How many agents will run in parallel? How many requests per day? Start conservatively—better to scale up than to overprovision and haemorrhage budget.

### API Keys, Permissions, and Secrets Management

**Segregate credentials by environment.** Create separate API keys for development, staging, and production. Never share production keys in Slack or email. Store them in a secrets manager (HashiCorp Vault, AWS Secrets Manager, 1Password for smaller teams).

**Tool permissions audit.** If your agent uses external tools—databases, APIs, webhooks—audit which tools have which permissions. An agent that writes to production databases should have narrower permissions than one writing to logs. Apply the principle of least privilege: the agent gets access to exactly what it needs, nothing more.

**Rate limits and quotas.** Set rate limits on every external API your agent calls. If you have a 10,000-requests-per-day quota, set an alert at 7,500. This prevents runaway loops from consuming your entire month's quota in an hour.

### Monitoring & Observability Foundation

**Logging infrastructure.** Where will agent logs live? CloudWatch, DataDog, Splunk, or structured JSON files? Decide before Day 1. Log every LLM call (input tokens, output tokens, cost, latency, model), every tool invocation (tool name, input, output, duration), every error, and every user action.

**Baseline metrics.** Define the metrics you'll track from Day 1:
- LLM call success rate (%)
- Average latency per agent turn (ms)
- Cost per request (USD)
- Tool error rate (%)
- Context window utilisation (%)
- Daily active users or requests

**Alert thresholds.** Set initial alert thresholds. If latency exceeds 5 seconds, alert. If error rate exceeds 5%, alert. If daily spend exceeds $50, alert. These thresholds will change as you understand your agent's behaviour, but you need something from Day 1.

**Dashboards.** Build a single-page dashboard showing your key metrics. This is your operational nerve centre. Update it daily during Week 1–2, weekly during Week 3–4. Share it with stakeholders every Friday.

### Rollback Plan

**Feature flags.** Can you turn this agent off instantly if something goes wrong? Implement feature flags (Unleash, LaunchDarkly, or home-rolled) so you can disable the agent without redeploying code.

**Backup and recovery.** Document how to recover if the agent fails. Do you have a version rollback procedure? Can you revert to the previous agent version in under 5 minutes? Practice this on Day 0. Time yourself.

**Graceful degradation.** If the agent fails, what happens to your users? Do they see an error message? Fall back to a human queue? Fall back to a simpler agent (a keyword-based bot)? Define this before Day 1.

### SOUL.md and Identity

**Agent identity document.** Create a SOUL.md file (per HD-1011: The SOUL.md Standard). This is a single markdown file that captures:
- Agent name and purpose (one sentence)
- Core values and decision-making principles
- Examples of correct and incorrect behaviour
- Guardrails and forbidden actions
- Interaction style (formal, casual, technical, etc.)

This file sits alongside your system prompt and becomes your north star. Every time the agent drifts, you refer back to SOUL.md.

**System prompt version control.** Store your system prompt in version control. Tag each major version. Document what changed and why. Example tags: `v1.0-launch`, `v1.1-reduced-hallucinations`, `v1.2-faster-responses`.

---

## Week 1: Foundation (Days 1–7)

### Day 1: First Deployment and Smoke Tests

**Morning: Deploy to staging.**

Push your agent to a staging environment that mirrors production as closely as possible. This isn't your laptop; it's an environment that matches what users will experience. If production runs on Kubernetes, staging runs on Kubernetes. If production has 10ms latency to the database, staging should too.

**Environment parity checklist:**
- [ ] Same LLM model and version
- [ ] Same tool definitions and integrations
- [ ] Same database schema (or equivalent test data)
- [ ] Same network topology and latency characteristics
- [ ] Same monitoring and logging infrastructure
- [ ] Same secrets management and credential handling

If staging differs from production, you'll discover differences the hard way: after launch, when they matter.

**Run smoke tests.** These are minimal tests that verify the agent exists and responds:
- Can you invoke the agent?
- Does it return a structured response in under 10 seconds?
- Does every call log successfully?
- Do you see the call in your monitoring dashboard?
- Does the agent handle missing tool dependencies gracefully?
- Are all API keys and credentials configured correctly?

Smoke tests take 30 minutes. They save you weeks of debugging. Run them three times. If they don't pass consistently, something's wrong with your staging setup.

**Baseline measurement.** Run 100 requests through the agent (either synthetic or real, depending on your setup). Measure:
- Average latency
- 95th percentile latency
- Number of errors
- Total cost
- Average output tokens per call

Store these numbers. They become your baseline for the entire 30-day period.

**Afternoon: First user trials (internal).** If you have colleagues, friends, or internal stakeholders, run 5–10 conversations with the agent. Don't brief them heavily; just let them talk to it naturally. Observe:
- Do they get what they expect?
- Do they get confused?
- Do they find bugs immediately?

Document everything. Screenshot weird outputs. Save conversations.

**End of day:** Post a standup message (template in Section 8) with baseline metrics, any blockers, and next actions.

### Days 2–3: Prompt Iteration and Output Quality

**Evaluate every conversation from Day 1.** Did the agent behave as intended? Did it hallucinate? Did it refuse to answer valid questions? Create a simple spreadsheet:

| Request | Expected Output | Actual Output | Category | Fix |
|---------|-----------------|---------------|----------|-----|
| [Q1] | [Expected] | [Actual] | [Logic/Fact/Tone/Structure] | [Prompt change or arch change] |

Spend 2 hours filling this out. It's your diagnostic tool.

**Categorise failures:**
- Logic errors (agent chose the wrong tool, wrong pathway)
- Fact errors (agent said something false, hallucinated)
- Tone errors (agent was too formal or too casual for context)
- Structure errors (agent's response was disorganised, hard to parse)
- Completeness errors (agent answered part of the question but missed critical elements)

For each category, decide: Is this a prompt problem or an architecture problem? Prompt problems are fixed in your system prompt and SOUL.md. Architecture problems require tool or workflow changes.

**Iterate on the prompt.** Make targeted changes:
- If the agent is too verbose, add "Be concise. Maximum 2 paragraphs." to your prompt.
- If the agent is refusing valid requests, add an example of a valid request to your few-shot examples.
- If the agent is choosing the wrong tools, reorder your tool descriptions by relevance or add negative examples ("Don't use the database tool for this").

**Create a test suite.** Pick 5 questions that represent your core use cases. Track the agent's performance on these 5 questions across every prompt iteration. This becomes your regression test for the entire 30 days.

**Test each change on the same 100 requests from Day 1.** Don't deploy every tweak to production; batch your changes. Deploy once per day, at the same time (e.g., 5 PM), so you can measure impact without confusion.

**Quality gate:** By end of Day 3, you should be able to point at 20 conversations and say "these are representative of what we want." If you can't, you're not ready for Week 2. Iterate longer. This is the final quality check before you connect to real data.

### Days 4–5: Tool Integration Testing and Error Handling

**Test every tool integration exhaustively.** This is not optional. Tool failures are the #1 source of agent breakdowns in production.

If your agent calls a database:
- Can it handle connection timeouts?
- What if the query returns 0 rows vs. 10,000 rows?
- What if credentials are wrong?
- What if the table doesn't exist?

If it calls an external API:
- Does it retry on 5xx errors?
- Does it handle 429 (rate limit) responses?
- What if the API is down (connection refused)?
- What if the response is malformed JSON?
- What if the API takes 30 seconds (longer than your timeout)?

Create a failure test matrix:

| Tool | Failure Mode | Expected Behaviour | Test Result |
|------|--------------|-------------------|-------------|
| Database | Connection timeout | Retry, then error to user | ☐ Pass |
| Database | Slow query (10s) | Time out at 5s, return error | ☐ Pass |
| API | 5xx response | Retry with backoff | ☐ Pass |
| API | 429 response | Backoff exponentially | ☐ Pass |
| API | Malformed JSON | Log error, return helpful message | ☐ Pass |

**Implement exponential backoff and circuit breakers.** If a tool fails, retry with increasing delays (1s, 2s, 4s, 8s, max 32s). If a tool fails 5 times in a row, stop calling it and return a helpful error message to the user. Don't retry forever—that's how you burn tokens and frustrate users.

**Measure tool performance.** For each tool, track:
- Success rate (%) — target: ≥95%
- Average latency (ms) — target: <1s
- p95 latency (ms) — target: <2s
- Error types and frequencies — log every error type separately

If a tool is slower than expected or failing frequently, escalate to the tool owner. Don't work around it by adjusting your agent's prompt; fix the underlying tool. You're masking the real problem otherwise.

### Days 6–7: Memory System Setup and Context Management

**Define your memory architecture precisely.** Does the agent maintain conversation history? Across how many turns? How do you summarise old conversations to fit them in context? This is not a guess—document it in code and config.

**Memory architecture patterns:**
1. **No memory** (stateless): Agent forgets each turn. Good for simple Q&A. Bad for multi-turn reasoning.
2. **Full history** (stateful): Agent sees entire conversation. Good for coherence. Bad for cost (tokens grow quadratically).
3. **Sliding window** (recent context): Agent sees last N turns + summary of older turns. Balanced approach.
4. **Semantic memory** (RAG): Agent stores and retrieves relevant facts from a vector database. Good for long-term context. Bad if retrieval is inaccurate.

Choose one. Implement it. Test it. Document the choice.

If you're using a vector database for memory (RAG-style), test it exhaustively:
- Can you store and retrieve memories reliably? Run 1,000 store-retrieve cycles.
- Is retrieval latency acceptable? (<500ms, ideally)
- Do you get relevant results, or is there noise? Manually check 20 retrievals.
- Does quality degrade as the database grows? Test with 100, 1,000, 10,000 stored facts.

**Implement context windowing aggressively.** The agent doesn't need the entire conversation history. Implement a strategy:
- Keep the last N turns verbatim (recent context is usually most relevant). N=5 is conservative, N=10 is aggressive.
- Summarise older turns (compress 50 turns into a 200-token summary using another LLM call)
- Discard irrelevant turns (if the user switches topics radically, forget the old topic)

Test this with long conversations (30+ turns, 100+ turns, 500+ turns). Measure whether the agent's quality degrades or improves as conversations get longer. If quality drops after 50 turns, fix it before Week 2.

**Set memory limits (hard limits).** A conversation history that grows unbounded will eventually consume your entire context window and break the agent. Set a hard limit: maximum 50 turns, or maximum 8,000 tokens of history, whichever comes first. When you hit the limit, summarise the conversation and start fresh. Test this boundary on Day 7. Make sure the agent gracefully handles hitting the limit and informs the user.

### Week 1 Checkpoint Metrics

**Review these metrics at end of Day 7:**

| Metric | Target | How to measure |
|--------|--------|-----------------|
| Smoke test pass rate | 100% | All 100 baseline requests succeed |
| Output quality score | ≥80% | Manual review: 80+ of 100 outputs meet brief |
| Tool success rate | ≥95% | Count successful tool calls / total calls |
| Avg latency | Baseline established | Time from request to response |
| Cost per request | Per HD-1002 budget | Sum of LLM tokens × rate |
| Error rate | <5% | Failed requests / total requests |
| Team confidence | High | Subjective: does your team think this is ready to scale? |

If any metric is below target, don't move forward. Extend Week 1. The cost of fixing problems now is trivial; the cost of fixing them in Week 3 is enormous.

---

## Week 2: Integration (Days 8–14)

**Week 2 is where theory meets reality.** Your agent has worked in isolation. Now it connects to the real world: databases, APIs, external systems. This is where 70% of production failures originate.

Your job this week: integrate safely. Verify that real data behaves as expected. Find integration failures before users do.

### Connecting to Production Data Sources

**Sandbox your data access.** Before the agent can read your production database, it should read a non-critical staging database. If something goes wrong (malicious prompt injection, logic error, runaway loop), you lose staging data, not production data.

**Audit data permissions.** Which tables can the agent read? Which columns? If you have customer PII, can the agent see it? Implement row-level security: the agent can query the customers table, but only see customers it has a legitimate business reason to see.

**Implement query limits.** A naive agent might run a SELECT * that returns 1 million rows and crashes your database. Set limits:
- Maximum result set size: 10,000 rows
- Maximum query complexity: no more than 3 JOINs
- Maximum runtime: 5 seconds

These limits prevent accidental DoS.

**Test data mutations carefully.** If the agent can write to the database (create records, update fields), test this extensively:
- Does it write valid data?
- Does it respect foreign key constraints?
- Can it be tricked into writing garbage data?

Start with read-only access and graduate to write access only after two weeks of flawless reads.

### Multi-Agent Handoffs (if applicable)

**Define handoff protocols.** If you have multiple agents (a router agent that delegates to specialist agents), how does handoff work?
- Does Agent A pass context to Agent B?
- How do you prevent infinite loops (Agent A → Agent B → Agent A)?
- What happens if Agent B fails?

Document these protocols in a runbook before implementing them.

**Test handoffs under load.** Run a scenario where many users trigger handoffs simultaneously. Do context transfers succeed? Do you lose messages? Does latency explode?

**Implement correlation IDs.** Every request gets a unique ID that flows through all agents. This lets you trace a single user's journey through the system in your logs.

### Rate Limiting and Cost Controls

**Implement per-user rate limits.** User A can make 10 requests per minute; User B has unlimited. This prevents one noisy user from blocking everyone else.

**Implement per-request cost caps.** If a single request is going to cost more than $10 (because the context is huge or the agent looped), stop and alert. Don't rack up a $1,000 bill on a single customer's request.

**Soft limits vs. hard limits.** Soft limits trigger alerts. Hard limits stop the action. You want both:
- Soft limit: if daily spend exceeds $40, send an alert
- Hard limit: if daily spend exceeds $50, turn off the agent

**Test your limits.** Deliberately trigger them. Does the alert fire? Is the message clear? Does the hard limit actually stop the agent, or does it keep running?

### Security Hardening: Prompt Injection Defence and Output Sanitisation

**Implement prompt injection detection** (reference HD-1004: Agent Security Checklist). This is critical in Week 2 because by now, your agent is visible to users and adversaries.

Common techniques:
- Role-based sandboxing: the agent can't see your system prompt, no matter what
- Input sanitisation: strip suspicious patterns from user input before passing to the LLM
- Output validation: check the agent's output before displaying it to users

**Test prompt injection.** Try to get the agent to:
- Reveal its system prompt
- Bypass its safety guardrails
- Execute unintended actions
- Return data it shouldn't

Have a security-minded person (or hire one for a few hours) attack your agent. Document every successful attack. Fix them before Week 3.

**Output sanitisation.** Before returning the agent's response to a user, clean it:
- Remove any references to API keys or credentials
- Remove any URLs to internal systems
- Escape HTML if returning via a web interface
- Check for common phishing patterns

**API key rotation.** If an agent's keys are ever exposed, rotate them immediately. Do a rotation test now, on Day 10, so you know you can do it in an emergency.

### Week 2 Checkpoint Metrics

| Metric | Target | How to measure |
|--------|--------|-----------------|
| Data access success rate | 100% | Reads succeed without permission errors |
| Handoff success rate | ≥95% | Multi-agent transfers complete successfully |
| Security audit pass | Yes | No successful prompt injections or data leaks |
| Cost predictability | ±10% | Actual cost within 10% of projected cost |
| Rate limit enforcement | Yes | Limits trigger and stop requests as expected |
| User satisfaction (internal) | ≥4/5 | Simple 5-point feedback from early users |

**Week 2 is complete when you can confidently hand the agent to a second team member and they can operate it without explanation.** If you can't, extend Week 2.

---

## Week 3: Optimisation (Days 15–21)

**Week 3 is about squeezing every ounce of efficiency.** Your agent is working. Now you make it work faster and cheaper. This is where you fight the cost spiral and latency creep that kills agent products.

### Cost Optimisation

**Implement prompt caching** (if available from your LLM provider). If your agent repeatedly uses the same system prompt or context, cache it. This can reduce costs by 20–40%.

**Model routing.** For cheap requests (simple questions), use a smaller, faster model. For expensive requests (complex reasoning), use a larger model. Route automatically based on request complexity. Example: use Claude 3 Sonnet for 80% of requests, Claude 3 Opus for 20%.

**Batch processing.** If your agent produces reports or analyses, batch them. Instead of computing each report in isolation, process 10 at a time. This lets you reuse context and reduce token overhead.

**Token budgeting.** For each type of request, what's the minimum viable token count? Do you really need the entire conversation history, or can you summarise? Can you reduce your system prompt by 20% without losing quality?

Run these experiments on a copy of production. Measure cost before and after. Only deploy if cost reduction is ≥15% and quality doesn't degrade.

**Reference HD-1103: Cost Optimisation for Agent Operations** for deeper techniques.

### Performance Tuning: Latency and Throughput

**Profile your agent.** Where does time go? LLM call (3–5 seconds typically)? Tool invocation (1–2 seconds)? Waiting for database (variable)? Memory retrieval?

Use a profiler or add timestamps to your logs. Run 100 requests and build a histogram of where time is spent.

**Parallelize where possible.** If your agent needs to call three tools, can it call all three in parallel instead of sequentially? Yes, if they don't depend on each other. This can cut latency by 50% or more.

**Cache at multiple levels:**
- API-level caching: cache responses from external APIs
- Database-level caching: cache database queries
- LLM-level caching: cache completions (if the input is identical, return the cached output)

**Set a latency SLO (Service Level Objective).** Example: 95% of requests complete in under 3 seconds. Measure this daily. If you miss your SLO two days running, escalate.

### Evaluation Framework Setup

**Automated evaluation.** By Day 15, you should be able to run your agent against 100 test cases and get a quality score without human judgment.

Common evaluation approaches:
- Exact match: does the output match a golden answer?
- Semantic similarity: is the output semantically equivalent?
- Rubric scoring: does the output meet multiple criteria? (e.g., accuracy, completeness, tone)
- Pairwise comparison: is output A or output B better?

Pick one and implement it. Use reference HD-1015: How to Evaluate If Your Agent Is Actually Working for detailed frameworks.

**Regression testing.** Every time you change the prompt or system, re-run your evaluation suite. If the score drops, investigate before deploying.

**Human-in-the-loop evaluation.** Automate what you can, but have humans review 10% of outputs weekly. This catches issues your automated scoring misses.

### Alert and Escalation Rules

**Define escalation paths.** If the error rate exceeds 10%, who do you contact? How quickly? Define this now, don't wait for the outage.

Example escalation rule:
- Error rate 5–10%: alert the team, investigate within 1 hour
- Error rate 10%+: page the on-call engineer, disable the agent if can't be fixed within 15 minutes
- Cost spike >50% daily: alert leadership, may need to disable if root cause unknown

**Test escalations.** Simulate an outage. Does the alert fire? Does the on-call engineer get notified? Does the team respond as expected?

### Week 3 Checkpoint Metrics

| Metric | Target | How to measure |
|--------|--------|-----------------|
| Cost per request | ≤ -15% vs baseline | Compare HD-1002 projections to actual |
| Avg latency (p95) | ≤ 3 seconds | Measure 95th percentile across 1,000 requests |
| Eval score | ≥80% | Automated evaluation of test suite |
| Regression test pass rate | 100% | All historical tests still pass |
| Alert accuracy | >90% | Alerts fire when rules trigger, not false positives |

**Week 3 is complete when your agent consistently meets cost and latency targets, and you have automated systems that enforce those targets.**

---

## Week 4: Production Readiness (Days 22–30)

**Week 4 is your final exam.** Everything must pass, or you don't launch. This is not about building new features; it's about proving the agent is ready for real humans to use.

You're testing for failure. You're documenting every step. You're training your team. You're going live.

### Load Testing and Stress Scenarios

**Define your load profile.** On launch day, how many concurrent users? How many requests per second? Use conservative estimates; it's better to exceed expectations than to disappoint.

**Run load tests.** Use a tool like Locust or JMeter:
- Ramp up to your target load linearly over 10 minutes
- Maintain load for 30 minutes
- Measure latency, error rate, and cost

What happens at 2x your expected load? 5x? Where does it break?

**Chaos testing.** Deliberately break things:
- Kill a database connection mid-request
- Delay tool responses by 10 seconds
- Return 5xx errors from external APIs
- Fill up your disk (or approach your token budget)

How does your agent handle each scenario? Does it degrade gracefully, or does it crash the whole system?

**Document limits.** What's the maximum load your agent can handle? At what point does latency become unacceptable? This lets you set autoscaling rules.

### Compliance and Audit Trail Verification

**Audit trail.** Every LLM call, every tool invocation, every user action should be logged with:
- Timestamp
- User ID
- Agent ID
- Input (full or hashed if sensitive)
- Output (full or hashed if sensitive)
- Cost
- Duration
- Error status

This is non-negotiable if your agent touches PII, financial data, or healthcare information.

**Data retention policy.** How long do you keep audit logs? 30 days? 1 year? Decide and implement. Some regulatory environments require 7 years.

**Compliance checks.** If you operate in a regulated industry:
- SOC 2? Ensure your logging and access controls pass audit.
- GDPR? Implement right-to-deletion: users can request their data be purged.
- HIPAA? All data must be encrypted in transit and at rest.

Get legal and compliance sign-off on Week 2. By Week 4, you should have it confirmed in writing.

### Documentation and Runbook Creation

**Write your runbook.** This is a document your operations team uses when something breaks. Sections:
- Architecture overview (one page)
- How to deploy a new version
- How to rollback
- Common issues and fixes
- Escalation procedures
- How to access logs and metrics

**Document SOUL.md changes.** Every time you changed the system prompt or SOUL.md, document why. This is your agent's history. Future maintainers will thank you.

**Create a playbook for common scenarios:**
- Agent is responding slowly: check this, then this, then this.
- Agent is giving wrong answers: evaluate these test cases, then adjust prompt.
- Agent is costing too much: check for infinite loops, then check for inappropriate model use.

**Disaster recovery.** How do you bring the agent back if it completely breaks? Do you have a version you can roll back to? Do you have a manual process for that day when rollback fails? Document it.

### Team Training and Handoff Procedures

**Train your team.** By Day 25, your entire team should be able to:
- Monitor the agent's health
- Interpret basic metrics
- Recognize an outage
- Initiate a rollback
- Escalate appropriately

One 90-minute training session, hands-on. Have them execute each procedure themselves.

**Create shift handoff documentation.** If you have on-call rotations, how does the night shift know what happened during the day? Write a handoff template (in Section 8) and review the previous day's incidents at shift change.

**Build a FAQ.** What questions do users ask? What misunderstandings do they have? Build a FAQ for your team and for your users.

### Go-Live Checklist

Before you flip the switch on Day 30, review this checklist:

- [ ] Smoke tests: 100% pass rate
- [ ] Security audit: 0 critical findings
- [ ] Load test: passes at 2x expected load
- [ ] Latency SLO: 95% of requests under 3s
- [ ] Cost: within ±10% of budget
- [ ] Monitoring: all dashboards live and alerting correctly
- [ ] Runbook: complete and tested
- [ ] Team: trained on procedures
- [ ] Compliance: sign-off obtained
- [ ] Rollback: tested and documented
- [ ] Escalation: procedures documented and contactable
- [ ] Users: early feedback positive (≥4/5)
- [ ] Leadership: approval to go live

If anything is incomplete, delay launch. This checklist is binary: you either pass or you don't.

### Week 4 Checkpoint Metrics

| Metric | Target | How to measure |
|--------|--------|-----------------|
| Load test: p95 latency | ≤ 3s @ 2x load | Synthetic load test |
| Load test: error rate | <2% @ 2x load | Count errors in load test |
| Runbook completeness | 100% | All sections written and reviewed |
| Team readiness | All trained | Each team member executes checklist |
| Go-live approval | Obtained | Written sign-off from leadership |

---

## On-Call Runbook: Your First Week in Production

Once you deploy, the agent is live. Users are talking to it. If something breaks, you need to know how to fix it in under 5 minutes.

**The on-call rotation.** You have a person (or people) on-call 24/7 for the first month. Their job: respond to alerts, investigate issues, escalate to the engineering team if needed. Create an on-call schedule. Communicate it to your team. Make sure there's always someone reachable.

**The alert playbook.** For every alert you defined in Week 3, write a response playbook:

**Alert: High Error Rate (>10%)**
1. Check the agent's logs. Are there common error patterns?
2. Is a specific tool failing? (Check tool latency and success rate)
3. Is the LLM API slow or returning errors? (Check API status page)
4. Recent changes? (Check git log and deployment history)
5. If you find the root cause: escalate to the engineering team or fix it yourself (if quick)
6. If you can't find the cause within 15 minutes: disable the agent and page the on-call engineer

**Alert: Latency Spike (p95 > 5s)**
1. Check which tools are slow. Run a tool performance check.
2. Is the database slow? Check database load and query times.
3. Is the LLM API slow? (Check API response times)
4. If latency is acceptable now: investigate what caused the spike (cache miss? load spike?)
5. If latency persists: consider disabling expensive features (RAG, multi-tool chains)

Write similar playbooks for every alert. Make them specific and actionable. Avoid vague instructions like "investigate the issue." Be prescriptive.

**Dashboard hygiene.** Your monitoring dashboard is your first line of defence. Update it every morning for the first week. Look for trends:
- Is cost trending up?
- Is error rate trending up?
- Is latency trending up?

Trends matter more than individual data points. A latency spike of 5s is noisy. But if latency increases 10% every day for 5 days, something is wrong and needs investigation.

**Communication.** When an incident occurs, communicate:
1. What we know (agent is responding slowly, error rate is high)
2. What we're doing (investigating, rolling back, disabling)
3. When we expect resolution (in 5 minutes, 1 hour, etc.)

Over-communicate in the first week. Users will forgive outages if you're transparent.

---

## Common Failure Modes: Top 10 Things That Go Wrong in the First 30 Days

### 1. Prompt Drift
**The problem:** Your prompt evolves every day. By Day 30, it's unrecognisable from Day 1. You can't pinpoint when quality changed.

**Prevention:** Version control your system prompt. Tag major changes. Keep it in the same file, same location. If you make more than 3 changes per day, you're doing something wrong; the agent isn't ready, or your initial design was flawed.

### 2. Infinite Loops
**The problem:** The agent calls a tool, gets an error, retries the same tool with the same input, gets the same error, repeats forever. Cost explodes.

**Prevention:** Implement maximum retry limits per tool per request (3 retries max). Implement maximum LLM calls per conversation (50 max). Add loop detection: if the agent repeats the same action twice, break the loop and escalate.

### 3. Context Window Overflow
**The problem:** Conversation history grows unbounded. By the 100th turn, context is full and the agent starts forgetting information.

**Prevention:** Summarise long conversations. Keep last 10 turns verbatim, summarise older turns. Hard limit: maximum 8,000 tokens of context per conversation.

### 4. Tool Latency Cascades
**The problem:** Agent calls Tool A (2s), then Tool B (2s), then Tool C (2s). User sees 6-second latency. If Tool A is slow one day, everything is slow.

**Prevention:** Parallelise independent tool calls. Set timeouts: if Tool A takes more than 3 seconds, cancel it and fall back. Cache tool results so repeated calls don't re-run.

### 5. Unbudgeted Token Consumption
**The problem:** One user asks the agent to analyse a 100-page document. Context window is full immediately. Cost is $100 for a single request.

**Prevention:** Before processing user input, estimate token count. If input exceeds budget (e.g., 4,000 tokens), ask the user to split it or summarise. Hard cap per request: if estimated cost is >$5, ask for confirmation first.

### 6. Silent Tool Failures
**The problem:** Agent calls a database query that times out. Agent receives empty result set. Agent confidently tells the user "there are no records." User doesn't know whether it's true or whether the tool failed.

**Prevention:** Tool responses must distinguish between "no results" and "error". Raise an exception when tool times out. Catch the exception in your agent; return a user-friendly error message, not a hallucinated answer.

### 7. Prompt Injection Exploitation
**The problem:** User embeds instructions in a URL or document the agent reads. Agent follows the embedded instructions instead of the original system prompt.

**Prevention:** Implement prompt injection defence (HD-1004). Validate all user input. Don't let the agent see raw user input; sanitise it first. Test for injection attacks weekly.

### 8. Memory System Hallucination
**The problem:** Agent retrieves "memory" from a vector database that's not actually relevant. Agent confidently uses wrong information.

**Prevention:** Test your vector database retrieval with real examples. Is it accurate? Does it drift over time? Implement a confidence score: only use retrieved memories if confidence >0.8. Add human verification for critical decisions.

### 9. Unmonitored Cost Growth
**The problem:** Agent is unexpectedly expensive. Nobody notices until the monthly bill is 5x budget.

**Prevention:** Monitor cost daily, not weekly. Set soft alerts at 50% and 75% of budget. Set hard limits at 100%. Review cost trend line weekly. If cost is increasing, investigate immediately.

### 10. Team Knowledge Silos
**The problem:** Only one person understands how the agent works. That person gets sick or leaves. Nobody else can support it.

**Prevention:** Document everything. Train the whole team. Do a knowledge transfer session on Day 20. Have someone other than the agent creator execute the runbook and write it better based on their experience.

---

## Templates and Checklists

### Daily Standup Template

```
**Date:** YYYY-MM-DD

**Metrics:**
- Requests processed: [N]
- Avg latency: [Xms]
- Error rate: [X%]
- Daily cost: $[X]

**Key wins today:**
- [Item 1]
- [Item 2]

**Blockers:**
- [Item 1]
- [Item 2]

**Tomorrow:**
- [Action item 1]
- [Action item 2]

**Alerts triggered:**
- [Alert 1 – resolved / investigating]
```

### Weekly Review Template

```
**Week of:** YYYY-MM-DD to YYYY-MM-DD

**Cumulative metrics:**
- Requests: [N] (target: [N])
- Avg latency: [Xms] (target: [Xms])
- Error rate: [X%] (target: <5%)
- Weekly cost: $[X] (budget: $[X])

**Quality score:**
- Automated eval: [X%] (target: ≥80%)
- Manual feedback: [X/5] (target: ≥4/5)

**Wins:**
- [Item 1]

**Lessons learned:**
- [Item 1]
- [Item 2]

**Adjustments for next week:**
- [Change 1]
- [Change 2]
```

### Go-Live Checklist

```
**Pre-go-live audit (Day 29–30):**

**Functionality**
- [ ] Smoke tests: 100% pass
- [ ] Eval score: ≥80%
- [ ] All tools functional: yes
- [ ] Handoffs (if applicable): working

**Performance**
- [ ] Latency (p95): ≤3s
- [ ] Throughput: meets 2x load test
- [ ] Cost predictable: yes

**Security**
- [ ] Prompt injection test: failed all attacks
- [ ] Data access: scoped correctly
- [ ] Audit logging: 100% coverage
- [ ] Secrets: stored securely, rotated

**Operations**
- [ ] Monitoring: all alerts configured
- [ ] Runbook: complete and tested
- [ ] Team: trained and can execute procedures
- [ ] Escalation: documented and contactable

**Compliance**
- [ ] Legal review: approved
- [ ] Data retention: policy set
- [ ] GDPR/HIPAA (if applicable): compliant

**Leadership**
- [ ] Stakeholder feedback: positive
- [ ] Business case: confirmed
- [ ] Go/no-go approval: signed

**Result:** ☐ GO | ☐ HOLD (list blockers)
```

### Incident Response Template

```
**Incident:** [Title]
**Severity:** [critical / high / medium / low]
**Reported at:** [YYYY-MM-DD HH:MM UTC]

**Impact:**
- Users affected: [N]
- Estimated cost: $[X]
- Duration: [X minutes]

**Root cause:**
[Description]

**Immediate action:**
[What we did to stop the bleeding]

**Resolution:**
[Permanent fix]

**Prevention:**
[What we'll do to prevent recurrence]

**Post-mortem assigned to:** [Name]
**Follow-up date:** [Date]
```

### Shift Handoff Template

```
**From:** [Name] | **To:** [Name]
**Date:** YYYY-MM-DD | **Time:** HH:MM UTC

**System status:**
- All agents: [operational / degraded / down]
- Cost trend: [increasing / stable / decreasing]
- Error rate: [X%]

**Incidents from previous shift:**
- [Incident 1 – status]
- [Incident 2 – status]

**Active investigations:**
- [Item 1 – assigned to]
- [Item 2 – assigned to]

**Known issues:**
- [Issue 1 – workaround]

**Escalation contacts:**
- On-call engineer: [Name] ([Phone])
- On-call manager: [Name] ([Phone])

**Anything else?**
[Notes]
```

---

## What's Next: Month 2 Priorities and Scaling

### Month 2 Focus Areas

**Advanced cost optimisation.** Implement model routing, batch processing, and more aggressive caching. Target: 20% cost reduction by end of Month 2.

**Scale to higher load.** Gradually increase users or request volume by 50% per week. Monitor for degradation. Are there bottlenecks? Scale vertically (bigger servers) or horizontally (more instances)?

**Evaluation framework expansion.** Move from automated eval to continuous eval. Set up a system that samples 5–10% of production traffic and has humans score it weekly.

**Multi-agent expansion.** If you have one agent, start building a second. If you have multiple agents, integrate them. Use this Month 1 experience to accelerate Month 2 builds.

**Agent customization.** Once your core agent is stable, explore:
- Persona variants (formal vs. casual)
- Domain variants (finance vs. support)
- User-specific fine-tuning based on feedback

### Cross-References to Other Hive Doctrine Products

For deeper dives, reference:

- **HD-1002: Agent Cost Calculator** — financial planning for Month 2 and beyond
- **HD-1004: Agent Security Checklist** — comprehensive security audit beyond Week 2
- **HD-1011: The SOUL.md Standard** — refining agent identity and values
- **HD-1015: How to Evaluate If Your Agent Is Actually Working** — advanced evaluation frameworks
- **HD-1102: Agent Monitoring & Observability Stack** — observability at scale
- **HD-1103: Cost Optimisation for Agent Operations** — ongoing cost management

### Scaling Patterns

**Replicate success.** You've successfully onboarded one agent. Document that playbook for your team. Next agent takes 2 weeks, not 4, because you've systematized the process. Create a standard "agent deployment runbook" template that your team reuses for every new agent. This accelerates dramatically.

**Tier your agents.** As you build more agents, not all need the same level of rigor. Consider:
- **Mission-critical agents** (trading, financial): full 30-day onboarding, high load testing, comprehensive audit trails
- **Standard agents** (customer support, research): streamlined 20-day onboarding, moderate testing, standard logging
- **Experimental agents** (prototypes, low-traffic): 10-day onboarding, lightweight testing, optional monitoring

Adjust the timeline and rigor based on impact if things go wrong. A $1,000/day revenue agent gets 30 days. A $10/day experimental agent gets 10.

**Share infrastructure.** As you scale to 5, 10, 20 agents, they'll share:
- Monitoring (one platform for all agents)
- Logging (one log aggregator)
- Rate limiting (shared gateway)
- Secrets management (one vault)
- Evaluation (shared scoring system)

Build shared infrastructure in Month 2–3. It compounds as you scale. One unified observability platform saves engineering time and creates organisational knowledge of all agent behaviour.

**Knowledge transfer.** After each agent reaches production, have someone who wasn't involved in the build write a post-mortem. What worked? What would they do differently? This feedback loop accelerates every subsequent agent build. Make it a standard practice: every agent that ships has a 30-minute retrospective with the team.

---

## Appendix: The Onboarding Decision Tree

By Day 28, you'll face a decision. Go live or hold? Here's the framework:

**If you're hitting all Week 4 metrics and the go-live checklist is 100% complete:** Deploy. No waiting for perfection. Perfect is the enemy of shipped.

**If you're missing one or two metrics but you understand why and have a plan:** Negotiate the timeline. Can you fix the blockers in 48 hours? If yes, ship on Day 32. If no, hold for Week 5.

**If you're missing three or more metrics and you don't have a clear root cause:** Hold. Don't ship to learn. Debug now, ship later. A failed launch is worse than a delayed one.

**If your team is exhausted or demoralised:** This is a red flag. Tired teams make mistakes. Consider pushing Day 30 to Day 35 so the team can recover. Burned-out operators lose agents in production.

The decision is yours, but it's binary: GO or HOLD. No grey areas.

---

## Closing: The 30-Day Bet

The first 30 days of an agent deployment determine everything. Get them right, and you have a product that's ready to scale, trusted by users, and operationally sound. Get them wrong, and you're fighting fires for months.

This playbook is your defence. Follow it, and you'll deploy at scale on Day 31. Skip steps, and you won't.

The metrics are real. The timelines are achievable. The failure modes are drawn from dozens of production deployments. You're not guessing; you're following a proven path.

Most importantly: **onboarding is not a cost, it's an investment.** The 30 days you spend now prevent 300 days of firefighting later. The team training you do in Week 4 prevents midnight pages in Month 3. The documentation you write becomes your competitive advantage when you're scaling to 10 agents instead of 1.

Treat this seriously. Treat every checklist as non-negotiable. Treat every metric as a safety guardrail.

Then deploy tomorrow.

---

*Melisia Archimedes*
*Hive Doctrine*
*March 2026*
