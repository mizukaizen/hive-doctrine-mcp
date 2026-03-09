---
title: "Multi-Agent Architecture SOP — Step-by-Step Production Deployment Guide"
author: Melisia Archimedes
collection: C4-infrastructure
tier: nectar
price: 149
version: 1.0
last_updated: 2026-03-09
audience: agent-builders
hive_doctrine_id: HD-0024
---

# Multi-Agent Architecture SOP

## Executive Summary

This is a battle-tested Standard Operating Procedure for deploying multi-agent LLM systems from zero to production. It covers everything from infrastructure preparation through day-2 operations: single-agent deployment, inter-agent routing, orchestration layers, observability, hardening, and rollback procedures.

This SOP consolidates patterns from AutoGen, CrewAI, LangGraph, and MetaGPT frameworks, plus real-world failure case studies. It avoids "hello world" examples and focuses on the 20% of deployment decisions that determine whether your system thrives or fails:

- Why 36.9% of multi-agent systems fail from interagent misalignment (and how to prevent it)
- How semantic trigger matching works (not regex—and why this breaks people)
- The "copy drift problem" and why proper file hierarchy is the real fix
- Context rot: why performance degrades 73% when key information is buried mid-context
- Token efficiency that actually works (model routing saves 60–80%, not marginal gains)
- When to escalate vs retry vs degrade gracefully

**Target:** Engineer operators running 3–20 specialist agents in production. Prerequisites: basic Docker, Python, and familiarity with your chosen orchestrator (CrewAI, AutoGen, LangGraph, etc.).

**Time to production:** 6–8 weeks for a hardened 5-agent system, 3–4 weeks for a minimal 2-agent proof-of-concept.

---

## Phase 0: Pre-Deployment Checklist

Before you touch infrastructure, validate that your system design is sound. This phase is non-negotiable; skipping it costs you weeks in rework later.

### 0.1 Infrastructure Requirements

**Compute:**
- **Dev environment:** 8GB RAM minimum. You'll run the orchestrator, 2–3 agents, monitoring stack, and a persistent queue (Redis or equivalent) locally.
- **Staging:** 16–32GB. Allows 5–10 concurrent agent instances plus observability tools (Prometheus, Grafana, ELK).
- **Production:** 32–64GB for redundancy. Budget 2–4GB per agent instance plus 4–6GB for infrastructure (orchestrator, message queue, logging, monitoring).

**Storage:**
- Persistent volume for agent memory files (SOUL.md, conversation history, learned patterns). Minimum 50GB; plan for 2–3x growth over 12 months.
- SQLite WAL files or equivalent transaction logs. Always use Write-Ahead Logging; plan for 500MB–2GB depending on message volume.
- Audit logs (immutable). Budget 100GB+ for 12 months of agent decision traces in production.

**Network:**
- If agents communicate via API, assume 100ms–500ms latency per hop. Design retry logic accordingly.
- If using message queues (RabbitMQ, Kafka), assume ~5ms local queue latency and ~50ms over WAN.
- Rate-limit downstream APIs to 80% of quoted limits; reserve 20% for spikes.

### 0.2 Agent Definitions

Before deployment, document every agent in a standardised format. Use a single AGENTS.md file at the repo root.

**Minimum metadata per agent:**

```
Agent: ResearchAssistant
Role: Market intelligence synthesis
Trigger phrase: "research X" OR "find latest data on Y"
Trigger confidence threshold: 0.85
Skills: web-search, data-synthesis, trend-analysis
Max token budget: 8000
Escalation: to Strategy when trend is novel (confidence > 0.92)
Degradation: summarise existing knowledge if search fails
Success metric: "user confirms findings are novel and actionable"
```

**Common mistakes:**
- Trigger phrases that collide (e.g., both "analyse" and "analyze" if you normalise text)
- Unclear role boundaries (every agent shouldn't do everything)
- Token budgets set without testing (budget = historical avg + 2 * stddev, not guesswork)
- No escalation path (who calls who when something's unclear?)

### 0.3 Security Audit Pre-Deployment

Run a lightweight security review before day 1 in production:

**API Keys & Secrets:**
- All API keys must be in environment variables or a secret manager (HashiCorp Vault, AWS Secrets Manager).
- Never commit `.env` files. Use `.env.example` with placeholder values.
- Rotate keys every 90 days. Plan a rotation procedure now; don't improvise in an incident.

**Agent Permissions:**
- Define what each agent can and cannot do. If an agent can call an API, grant the minimum permission needed.
- Example: ResearchAssistant needs read-only access to search APIs; it should not have write access to any system.
- Document permissions in a PERMISSIONS.md file.

**Data Isolation:**
- Agents should not access other agents' working memory unless explicitly routed through the orchestrator.
- Implement read/write ACLs on all shared data structures (queues, caches, logs).

**Monitoring Setup:**
- Plan alerting before it's needed. You want to know in real-time if an agent is stuck or looping.
- Identify which events are critical (agent crash, API quota exceeded, cascading failures) vs informational (agent slow, retry on transient error).

---

## Phase 1: Single-Agent Deployment

Get one agent running first. This validates your orchestration, observability, and operational tooling. Tempting to skip to multi-agent—don't.

### 1.1 Agent Scaffolding

Create a minimal agent definition. Most agent frameworks use a standard structure with configuration files plus identity and capability documents:

**Directory layout:**
```
agents/
├── research-assistant/
│   ├── config.json          # role, skills, token budget, escalations
│   ├── SOUL.md              # personality, decision-making style
│   ├── SKILL.md             # callable actions (search, summarise, etc.)
│   ├── memory/              # long-term state (learnings, user preferences)
│   │   └── learned.json
│   └── logs/                # local execution logs (rotated daily)
```

**config.json structure:**
```json
{
  "name": "research-assistant",
  "role": "Synthesise market data into actionable insights",
  "model": "claude-opus",
  "temperature": 0.2,
  "max_tokens": 8000,
  "skills": ["web_search", "data_parse", "summarise"],
  "escalation_trigger": {
    "rule": "trend_confidence > 0.92 AND novel_pattern == true",
    "escalate_to": "strategy-agent"
  },
  "degradation_mode": "return_cached_knowledge",
  "retry_policy": {
    "max_attempts": 3,
    "backoff_seconds": [1, 4, 16]
  }
}
```

### 1.2 Local Testing (Dev Environment)

**Goal:** Run the agent in isolation and confirm basic functionality.

1. **Mock external dependencies.** Don't call live APIs yet. Use stub responses.
   ```python
   def search_stub(query: str) -> dict:
       return {"results": [{"title": "Mock Result", "url": "http://..."}]}
   ```

2. **Run 10 test scenarios.** Cover happy path, missing input, API timeout, invalid response, empty results. Log each execution.

3. **Measure token efficiency.** Track input tokens, output tokens, and cost per execution. You'll use this to set production budgets.

4. **Check memory usage.** Does the agent leak memory? Run it 100 times and watch heap usage. Spike = bug.

5. **Document latency.** How long does the agent take? Record p50, p95, p99. This drives SLA design later.

### 1.3 Staging Deployment (First Real Environment)

**Goal:** Run the agent against real APIs in a non-production environment.

1. **Use staging credentials.** Every external API (search, weather, financial data) has a staging environment. Use those.

2. **Enable debug logging everywhere.** You want to see every decision, every API call, every token spent. Later you'll tone this down; now, capture everything.

   ```python
   logger.info(f"[{agent}] Trigger matched: {trigger_phrase} (confidence: {conf})")
   logger.info(f"[{agent}] Calling {skill_name} with args: {args}")
   logger.info(f"[{agent}] API response: {response}")
   logger.info(f"[{agent}] Tokens: in={in_tokens}, out={out_tokens}")
   ```

3. **Run 100 real executions.** Not 10. You need statistical confidence. Cover edge cases:
   - Empty search results
   - API rate limit (wait, then retry)
   - Malformed response (agent should gracefully degrade)
   - Slow API (60-second timeout—how does agent respond?)

4. **Monitor for drift.** Does the agent's behaviour change over time? (Hint: context size grows, latency creeps up, costs drift higher.) Set a baseline and alert if metrics deviate >10%.

5. **Run chaos experiments.** Kill the database connection mid-execution. Poison the cache. What happens? The agent should fail gracefully, not hang forever.

---

## Phase 2: Inter-Agent Communication

This is where most systems break. Adding a second agent exposes 3–5 hidden assumptions about how agents route, queue, and coordinate.

### 2.1 Message Broker Setup

Choose one: RabbitMQ, Redis Streams, Kafka, or AWS SQS. Trade-offs below:

| Broker | Latency | Ordering | At-least-once | Best for |
|--------|---------|----------|---------------|----------|
| **Redis Streams** | 5ms | Per-stream | No | Proof-of-concept, dev/staging |
| **RabbitMQ** | 10ms | Per-queue | Yes | Mid-scale production (10s of agents) |
| **Kafka** | 50ms | Per-partition | Yes | High-volume, long message history needed |
| **AWS SQS** | 100ms | No | Yes | Serverless, AWS-native architectures |

**Recommendation for first deployment:** Start with Redis Streams in dev, graduate to RabbitMQ in production. It's battle-tested and widely supported.

### 2.2 Routing Layer

Every agent must know where to send messages. Three patterns:

**Pattern A: Hub-and-spoke (centralised router)**
```
Agent A → Router → (decides) → Agent B/C/Escalation
```
*Pros:* Clear control flow, easy to add logic (SLA checks, cost optimisation).
*Cons:* Router is a bottleneck; if it's down, system fails.

**Pattern B: Direct agent-to-agent (with service discovery)**
```
Agent A → (service discovery) → Agent B's address → direct call
```
*Pros:* Lower latency, no single point of failure.
*Cons:* Debugging is harder; requires service discovery (Consul, etcd).

**Pattern C: Publish-subscribe (agent broadcasts, others listen)**
```
Agent A publishes "research_complete" event
→ Strategy agent, Reporting agent, Notification agent all see it
```
*Pros:* Decoupled, easy to add new listeners later.
*Cons:* Non-deterministic execution order; need careful idempotency handling.

**For first production system:** Use Pattern A (hub-and-spoke). Revisit once you have 5+ agents and understand your bottlenecks.

### 2.3 Message Passing Semantics

Define how agents talk to each other. This seems obvious; it's not.

**Standard message format:**
```json
{
  "message_id": "uuid",
  "timestamp": "2026-03-09T10:45:32Z",
  "sender": "research-assistant",
  "recipient": "strategy-agent",
  "priority": "high",
  "payload": {
    "task": "analyse_trend",
    "data": {"trend": "crypto_volatility_up_40pc", "confidence": 0.94},
    "context": "market_watch_weekly"
  },
  "deadline": "2026-03-09T10:55:32Z",
  "retry_count": 0
}
```

**Key decisions:**
- **Priority levels:** high, normal, low. Implement queue priority; high-priority messages jump the queue.
- **Deadlines:** Every message should have a deadline. If 10 minutes have passed and the recipient hasn't ACKed, re-route or escalate.
- **Idempotency key:** If the same message is delivered twice, the recipient should handle it gracefully (e.g., "already processed this, returning cached result").

### 2.4 Handling Failure Between Agents

**Scenario 1: Agent B is slow (p95 = 30 seconds, deadline = 15 seconds)**
- Don't wait. Escalate to Agent C or degrade: "Agent B is overloaded. Using cached analysis instead."

**Scenario 2: Agent B crashes mid-execution**
- Message lands in a "dead letter queue." Someone (human or another agent) processes it later.
- Set up alerting: if >5 messages land in DLQ per hour, page on-call.

**Scenario 3: Agent A sends a malformed message to Agent B**
- Agent B should validate the message schema first. If invalid, log an error and ask Agent A to reformat.
- Don't silently drop the message; that hides bugs.

**Scenario 4: Circular routing (Agent A → B → C → A)**
- Track message hops. If a message has been seen by the same agent twice, it's looping. Break the loop and escalate.

---

## Phase 3: Orchestration Layer

The orchestrator is the "conductor"—it decides what agents run, in what order, and with what context.

### 3.1 Hierarchy and Escalation

Define a clear hierarchy. Example for a trading system:

```
User Request
  ↓
[Entry Agent] (parses intent, routes to specialist)
  ↓
[Specialist A: Research] [Specialist B: Risk] [Specialist C: Execution]
  ↓
[Escalation Agent] (decides "trade" vs "flag for review" vs "reject")
  ↓
[Execution Agent] (only fires if approved)
```

**Rule:** Escalation always flows upward. An agent should never call a peer agent directly; it goes through the parent.

**Escalation rules:**
- If confidence < 0.8, escalate to human review.
- If decision involves >$X, escalate to senior agent.
- If novel pattern detected, escalate for learning.

### 3.2 State and Context Management

Agents need context. You have three options:

**Option 1: Shared working memory (JSON file)**
```json
{
  "session_id": "sess_abc123",
  "user": "user@example.com",
  "market_state": {
    "last_checked": "2026-03-09T10:45:00Z",
    "prices": {...},
    "volatility": 0.23
  },
  "conversation_history": [
    {"role": "user", "content": "Is ETH a good buy?"},
    {"role": "research_agent", "content": "..."}
  ],
  "decisions": [
    {"agent": "risk_agent", "decision": "approved", "timestamp": "..."}
  ]
}
```

*Pros:* Simple, all agents see the same state.
*Cons:* Conflicts if two agents write simultaneously; context grows unbounded.

**Option 2: Event log (immutable append-only)**
```
[10:45:00] user_input: Is ETH a good buy?
[10:45:05] research_triggered: ethereum_trend_analysis
[10:45:22] research_complete: trend=bullish, confidence=0.91
[10:45:23] risk_check_triggered
[10:45:31] risk_complete: approved
[10:45:32] execution_triggered
```

*Pros:* No conflicts, full audit trail, easy to replay.
*Cons:* Agents need to reconstruct state from log (slower).

**Option 3: Hybrid (shared state + event log)**
- Event log is source of truth (immutable).
- Shared state is cache (rebuilt from log if corrupted).

**Recommendation:** Start with hybrid. Shared state for latency, event log for auditability.

### 3.3 Token and Cost Management

LLM calls are expensive. Budget strictly.

**Per-agent token budgets:**
```
Research Agent: 12000 tokens/execution
  - Input context: 2000 (user query + recent history)
  - Model response: 8000
  - Buffer: 2000 (for retries)

Risk Agent: 6000 tokens/execution
  - Input: 1000
  - Response: 4000
  - Buffer: 1000

Reporting Agent: 4000 tokens/execution
```

**Cost caps:**
- Daily cap per agent: $X/day
- If agent exceeds cap, downgrade to smaller model (e.g., Claude 3 Sonnet instead of Opus)
- If 3 days in a row exceed cap, page operator for review

**Token efficiency tricks:**
1. **Prune context.** Old conversation entries are less relevant. Use a sliding window (last 10 messages or 2000 tokens, whichever is smaller).
2. **Use cheaper models for classification.** If an agent is just deciding "which bucket?", use a smaller model, not Opus.
3. **Cache frequently-asked questions.** "What's BTC price?" shouldn't call the LLM every time.
4. **Route based on complexity.** Is the query simple? Route to Sonnet. Is it novel? Route to Opus.

---

## Phase 4: Monitoring and Observability

If you can't see it, you can't fix it. This section is not optional.

### 4.1 Metrics to Collect

**Per-agent metrics:**
- **Execution time:** p50, p95, p99 (milliseconds)
- **Success rate:** % of executions that complete without error
- **Token usage:** input tokens, output tokens, total cost
- **Error rate:** % of executions that fail (by error type: timeout, API rate limit, validation error, etc.)

**System-level metrics:**
- **Message queue depth:** How many messages are waiting? If >100, something is slow.
- **Agent utilisation:** % of time each agent is actively processing vs idle
- **Escalation rate:** How often do agents escalate to humans? >5% per day = design problem.
- **Context drift:** Average context size per agent execution. Growing = memory leak or context pruning failure.

**Business metrics (domain-dependent):**
- **Decision accuracy:** % of decisions that turn out correct (e.g., trades that were profitable)
- **User satisfaction:** Time-to-insight, decision confidence
- **Cost per decision:** Total LLM spend / number of decisions

### 4.2 Logging Strategy

**Structured logging (JSON):**
```json
{
  "timestamp": "2026-03-09T10:45:32.123Z",
  "agent": "research-assistant",
  "level": "info",
  "event": "execution_complete",
  "execution_id": "exec_xyz789",
  "duration_ms": 5420,
  "tokens_in": 2100,
  "tokens_out": 7850,
  "cost_usd": 0.42,
  "success": true,
  "trigger": "user_asked_about_eth",
  "output_summary": "ETH bullish (0.91), suggest 5% position"
}
```

Log to:
- **Local files** (for debugging): Keep 7 days of logs locally.
- **Centralised log aggregation** (ELK, Datadog, CloudWatch): Ingest all logs here for querying and alerting.
- **Audit log** (immutable): Every decision, every escalation, every cost. Keep forever.

**What NOT to log:**
- Full LLM prompts (too large, clutters logs). Log a hash instead.
- Full API responses (200KB+ responses will bloat your logs). Log a summary.
- User PII (unless you have explicit consent and compliance review).

### 4.3 Alerting Rules

Set up alerts for:

| Condition | Severity | Action |
|-----------|----------|--------|
| Agent crash (3 failures in 5 min) | CRITICAL | Page on-call immediately |
| Queue depth > 500 | HIGH | Notify ops; auto-scale if possible |
| Error rate > 10% for 5 min | HIGH | Notify ops; consider circuit breaker |
| Execution time > 10x p95 | MEDIUM | Log for investigation; no page yet |
| Cost exceeds daily budget | MEDIUM | Notify ops; may degrade model choice |
| No executions in 1 hour (agent hung) | MEDIUM | Notify ops; consider restart |

---

## Phase 5: Hardening (Production Readiness)

Your system has survived staging. Now make it production-grade.

### 5.1 Rate Limiting and Circuit Breakers

**Rate limiting:**
- Limit agent calls to external APIs. Don't call the weather API 1000x in 1 second just because users asked.
- Per-agent rate limit: X calls/minute. When exceeded, queue calls or degrade response.

**Circuit breaker pattern:**
```
Normal (closed) → API succeeds/fails normally
         ↓ (5 failures in 10 sec)
Tripped (open) → API is down; reject calls immediately (fail fast)
         ↓ (wait 60 sec)
Half-open → Try 1 call. Success? Back to normal. Fail? Back to open.
```

### 5.2 Retry Policies

**Transient errors (can retry):**
- Network timeout
- Rate limit (429)
- Temporary service unavailability (503)
- Retry: exponential backoff [1sec, 4sec, 16sec, give up]

**Permanent errors (don't retry):**
- Invalid input (400)
- Authentication failure (401)
- Not found (404)
- Log and escalate; don't retry.

**Example retry logic:**
```python
def call_with_retry(func, max_attempts=3, backoff=[1, 4, 16]):
    for attempt in range(max_attempts):
        try:
            return func()
        except TransientError as e:
            if attempt < max_attempts - 1:
                sleep(backoff[attempt])
            else:
                raise
        except PermanentError:
            raise  # Don't retry
```

### 5.3 Graceful Degradation

When something fails, degrade gracefully instead of crashing:

**Scenario 1: External API is down**
- Return cached result from 1 hour ago (with a disclaimer: "Data is stale")
- Or return a simpler answer using local knowledge only

**Scenario 2: Agent is overloaded**
- Don't queue forever. If queue depth > 100, start rejecting new requests with "System busy, retry in 5 minutes"

**Scenario 3: Cost exceeds daily budget**
- Switch to cheaper model (Sonnet instead of Opus)
- Or reduce context size (use less conversation history)
- Notify ops; don't silently degrade

### 5.4 Disaster Recovery Basics

**Backup strategy:**
- Agent memory files (SOUL.md, learned.json): Back up daily to off-site storage.
- Event log: Immutable, but back up to 2+ locations (local + cloud).
- Configuration (config.json, AGENTS.md): Version-controlled in Git.

**Restore procedure:**
- Agents crash? Restart from last known good state (20 minutes of lost context is acceptable).
- Corruption detected? Restore from 24-hour backup; replay events since then.

---

## Phase 6: Rollback Procedures

Deployment went wrong. Now what?

### 6.1 Pre-Deployment Checklist

Before you deploy anything:
- [ ] All tests pass locally
- [ ] Staging deployment is stable for 24 hours
- [ ] Monitoring and alerting are set up
- [ ] Runbook is written and reviewed
- [ ] On-call engineer is briefed
- [ ] Rollback procedure is tested

### 6.2 Rollback Scenarios

**Scenario 1: New agent version has a bug (5% error rate)**
- Rollback: Restart old container.
- Time: ~30 seconds.
- Data loss: None (event log continues).

**Scenario 2: Configuration change breaks routing (agents can't find each other)**
- Rollback: Revert config file, restart orchestrator.
- Time: ~1 minute.
- Data loss: Messages in flight may be lost (acceptable if rate < 0.1%).

**Scenario 3: New skill causes infinite loop (agent stuck)**
- Kill the agent immediately (don't wait for timeout).
- Rollback: Restart without that skill.
- Investigate offline. Don't re-enable until root cause is fixed.

**Scenario 4: Token budget error leads to runaway costs ($500 spent in 1 hour)**
- Circuit breaker: Cap daily spend at 2x normal. Disable agent if cap hit.
- Investigate.
- Manually adjust token budgets downward.

### 6.3 Rollback Runbook Template

```
INCIDENT: Agent X is crashing every 30 seconds
PRIORITY: HIGH
MITIGATION OWNER: ops-team

1. STOP THE BLEEDING (0–2 min)
   - SSH to production server
   - Kill agent X container: docker kill agent_x
   - Notify on-call: "Agent X disabled, investigating"

2. ROOT CAUSE (2–10 min)
   - Check logs: tail -f /var/log/agents/agent_x.log
   - Look for repeated error pattern
   - Is it OOM? Timeout? API error? Code bug?

3. RECOVER (10–30 min)
   - Option A (code bug): Rollback to previous version
   - Option B (config): Fix config, restart
   - Option C (dependency): Restart orchestrator

4. VALIDATION (30–45 min)
   - Run synthetic tests. Did agent recover?
   - Monitor for 15 minutes. Any new errors?
   - Check other agents. Did rollback break anything?

5. POST-INCIDENT (within 24 hours)
   - Write incident report: what happened, why, how to prevent
   - Update runbooks if needed
   - Schedule post-mortem with team
```

---

## Phase 7: Day-2 Operations

Your system is live. This section covers ongoing management.

### 7.1 Adding a New Agent

**Checklist:**
- [ ] Agent definition created (config.json, SOUL.md, SKILL.md)
- [ ] Routing rules written (where does it fit in hierarchy?)
- [ ] Token budget set and validated in staging
- [ ] Security audit passed (permissions, API access, data isolation)
- [ ] Monitoring set up (metrics, alerts, logging)
- [ ] Runbook drafted
- [ ] Staged for 1 week (watch metrics, no issues?)
- [ ] Deployed to production

**Timeline:** 2 weeks for a new agent (1 week design + testing, 1 week staging, 1 day production)

### 7.2 Removing an Agent

**Checklist:**
- [ ] Notify stakeholders (which users rely on this agent?)
- [ ] Wait 1 week (allow time for objections)
- [ ] Redirect any inbound requests to replacement agent
- [ ] Remove from orchestrator
- [ ] Archive logs and memory files (might need for audit)
- [ ] Update documentation

### 7.3 Scaling Agents

As usage grows, a single agent instance becomes a bottleneck.

**Horizontal scaling (add more instances):**
```
Agent X (instance 1) + Agent X (instance 2) + Agent X (instance 3)
                    ↓
            Load balancer (round-robin)
                    ↓
              (from router)
```

Requires:
- Shared message queue (so all instances see work)
- Shared state (or accept eventual consistency)
- Load balancer or service mesh

**When to scale:**
- If queue depth > 50 consistently
- If p95 latency > 10x p50
- If CPU/memory usage > 80%

**First scaling:** Add a second instance. Monitor for 1 week. If stable, you've solved it.

### 7.4 Cost Optimisation

Costs creep up. Regular audits keep them in check.

**Weekly cost review:**
- Which agents spent the most?
- Was it expected?
- Which skills are most expensive?

**Quarterly cost engineering:**
- Can we batch requests (fewer LLM calls)?
- Can we cache responses (avoid redundant calls)?
- Can we use cheaper models for some tasks?
- Is our prompt well-designed (no wasted context)?

**Benchmarking:**
- Cost per decision should be stable over time.
- If it's trending up, something's wrong (context bloat, more retries, inefficient routing).

---

## Phase 8: Common Failure Modes and Mitigations

### 8.1 Interagent Misalignment

**Symptom:** Agents conflict. Agent A recommends "buy", Agent B recommends "sell", system outputs both.

**Root causes:**
- Conflicting objectives (not aligned upfront)
- Stale context (Agent B doesn't see Agent A's decision)
- Escalation logic is unclear

**Mitigation:**
- Single source of truth for decisions (one agent = final say)
- Explicit handoffs (Agent A→B→C, not parallel)
- Escalation rules in AGENTS.md
- Weekly alignment review: Do agents' outputs make sense together?

### 8.2 Context Rot

**Symptom:** Agent latency creeps up from 2 seconds to 15 seconds over 2 weeks.

**Root cause:** Context window keeps growing (conversation history, learned facts, market data). Eventually agent spends 80% of tokens just reading context, not reasoning.

**Mitigation:**
- Prune old conversation entries (keep last 10 messages, discard older)
- Summarise old conversations (compress 100 messages into 5 summary bullets)
- Use separate "memory" and "context" files (memory = learned facts only)
- Set a context size limit and enforce it

### 8.3 Cascading Failures

**Symptom:** Agent A is slow → Agent B times out waiting → Agent C escalates → System grinds to halt.

**Root cause:** No timeout, no degradation, everything waits.

**Mitigation:**
- Every call has a timeout (never infinite wait)
- If timeout, degrade (use cache, skip step, escalate)
- Implement bulkheads (isolate agents so one failure doesn't bring down others)

### 8.4 Token Budget Overruns

**Symptom:** Bill arrives for $2000/month, expected $500.

**Root causes:**
- Token budgets set too high
- Agent gets stuck in a retry loop (3 failures = 3x cost)
- Prompts not well-designed (include too much context)

**Mitigation:**
- Set token budgets based on actual usage (track for 1 week, set cap at 1.5x median)
- Monitor token spend per execution in real-time
- Set a daily spend cap; if exceeded, disable non-critical agents
- Review top 10 most expensive executions monthly

---

## Reference: Checklist for Week 1–8 Timeline

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| **1** | Agent design | AGENTS.md, config.json for 3–5 agents |
| **2** | Single-agent tested | 1 agent passing 100 executions in staging |
| **3** | Routing designed | Message format, escalation rules documented |
| **4** | Multi-agent staging | 2+ agents communicating, 50 executions logged |
| **5** | Monitoring live | Metrics visible in dashboard, 5+ alerts configured |
| **6** | Hardening complete | Rate limits, circuit breakers, degradation tested |
| **7** | Runbooks written | Deployment, escalation, rollback procedures documented |
| **8** | Production deploy | First 3 agents live, monitoring steady, ops trained |

---

## Appendix: Token Efficiency Calculations

**Formula:**
```
Cost per execution = (input_tokens × $0.003/1k + output_tokens × $0.015/1k)
Expected daily cost = avg_executions_per_day × cost_per_execution × 30 days
```

**Example:**
```
Research agent: 2000 input + 7000 output tokens per execution
Cost: (2000 × 0.003) + (7000 × 0.015) = $6 + $105 = $0.111 per execution

If 100 executions/day:
Daily: 100 × $0.111 = $11.10
Monthly: $11.10 × 30 = $333
```

Set your token budget accordingly. If target spend is $500/month and you have 2 agents, allocate $250 per agent.

---

## Final Notes

This SOP is battle-tested but not dogma. Your system will differ. Adapt:

- Use this as a starting point.
- Where it disagrees with your framework's recommendations, go with your framework.
- Every 4 weeks, retrospective: what worked? What didn't? Update this SOP.
- Share learnings with your team. A SOP is only useful if everyone has seen it.

Good luck. Multi-agent systems are powerful and complex. Treat them with respect.
