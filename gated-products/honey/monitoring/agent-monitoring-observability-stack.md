---
title: "Agent Monitoring & Observability Stack: The Complete Guide"
author: Melisia Archimedes
collection: C5 Security & Ops
tier: honey
price: 79
version: 1.0
last_updated: 2026-03-09
audience: agent_operators
hive_doctrine_id: HD-1102
sources_researched: [observability platform docs, OpenTelemetry specs, LLM tracing frameworks, production monitoring guides]
word_count: 6847
---

# Agent Monitoring & Observability Stack: The Complete Guide

## 1. Why Agent Monitoring Is Different

You've launched your agent. It's running in production. Users are interacting with it. Everything looks fine until it doesn't—a task fails silently, tokens are hemorrhaging, or a tool call chain breaks partway through. You have no idea what happened.

This is the gap between traditional monitoring and agent observability.

Traditional APM (Application Performance Monitoring) tools were built for deterministic systems. You call a function, it returns a value, you log it. The flow is predictable. But LLM agents operate in a fundamentally different way:

**Non-deterministic outputs.** The same input doesn't always produce the same output. Your agent might take four reasoning steps one day and seven the next. You need observability that captures variability, not just averages.

**Multi-step reasoning chains.** A single user request might spawn dozens of internal LLM calls, tool invocations, and decision branches. Traditional request tracing stops after one hop. You need to follow the entire tree.

**Tool call chains and failures.** When your agent calls Tool A, which triggers Tool B, which times out, which causes Tool C to error—how do you find that failure in the noise? You need structured correlation across tool boundaries.

**Invisible costs.** With traditional software, CPU time is bounded. With agents, each LLM call is a cost event. You can't manage what you don't measure. You need real-time cost visibility, not a bill at month's end.

**Quality drift.** Your agent's accuracy might degrade over time as model behaviour changes, or as the task distribution shifts. You need continuous evaluation metrics, not just error counts.

Standard APM tools—Datadog, New Relic, Grafana—can instrument the plumbing around your agent (HTTP requests, database queries), but they're blind to what the agent itself is doing. They won't tell you that your agent spent 15 seconds reasoning inefficiently, or that it's making worse decisions than it did last week.

Agent observability is a new discipline. It combines tracing, metrics, structured logging, and continuous evaluation into a single system designed from the ground up for LLM-native workflows.

This guide walks you through building that system.

---

## 2. The Four Pillars of Agent Observability

Agent observability rests on four foundational pillars. Each answers a different question your operations team will ask.

### Pillar 1: Tracing

**Question: What happened?**

A trace is a complete record of a single user request as it flows through your agent system. It captures every step: the initial prompt, each LLM call, every tool invocation, the reasoning, the decision points, the final output.

A trace is structured as a tree of *spans*. A span is a unit of work—"LLM call to GPT-4", "invoke Tavily search", "validate output against schema". Each span has:

- **Start and end time.** Precise duration down to milliseconds.
- **Attributes.** Key-value metadata: the model used, the input length, the tool name, the retry count.
- **Events.** Discrete occurrences within the span: "API rate limited", "parsed JSON successfully", "fell back to cached response".
- **Status.** Success, error, or cancelled.

Spans nest. When your agent calls an LLM to decide which tool to use, that's a span. Inside it, the token counting is an event. The tool invocation is a child span. The tool's HTTP request is a grandchild span. This hierarchy lets you drill down from "request failed" to the exact LLM decision that led to the wrong tool choice.

Without tracing, debugging an agent failure is guesswork. With tracing, you can reconstruct the entire decision chain.

### Pillar 2: Metrics

**Question: How is the system performing?**

Metrics are aggregated, numeric measurements: token usage, latency, error rates, cost per task. Unlike traces, which are point-in-time records, metrics show trends over time.

Key agent metrics:

- **Token usage.** Input tokens, output tokens, and cached tokens separately. Cached tokens are your cost optimization lever.
- **Latency.** Wall-clock time from request in to response out. Break it down: LLM latency (time waiting on model API), tool latency (time in external services), reasoning latency (LLM time spent deliberating). Track percentiles: p50 (median), p95 (95th percentile, where slow requests live), p99 (worst-case outliers).
- **Cost.** Real-time per-task cost, cumulative cost per agent, cost per model. This is the number your finance team needs.
- **Error rates.** Model API errors, tool failures, timeouts, schema validation failures. Segment by type so you can spot systematic issues.
- **Task completion.** What percentage of tasks finish successfully? Of those, how many required retries?

Metrics are what your dashboards show. They're your early-warning system. When the p95 latency jumps from 2 seconds to 8 seconds, you know something's wrong before your users complain.

### Pillar 3: Logging

**Question: What did the agent decide?**

Logs are structured, queryable records of discrete events. Unlike traces, which are hierarchical and causal, logs are flat but searchable. You use logs to answer specific questions: "What prompt did we send to the model?" "Which agents called Tool X in the past hour?" "What was the exact error message?"

Agent logs should be structured (JSON, not free text). Each log entry should contain:

- **Timestamp.** ISO 8601 format, UTC.
- **Log level.** INFO, WARN, ERROR—but for agents, add custom levels like COST_SPIKE or ACCURACY_DIP.
- **Message.** Human-readable description.
- **Context.** Agent ID, user ID, task ID, model, tool name.
- **Value.** The thing you're measuring: token count, latency, cost, decision.

For an agent system, especially multi-agent systems, logs let you track decision chains across agent handoffs. Agent A logged "delegated to Agent B", Agent B logged "calling Tool X", Tool X logged "timed out". Search for a request ID and you can reconstruct the entire timeline.

### Pillar 4: Evaluation

**Question: Is the agent getting better or worse?**

Evaluation is the hardest pillar because it requires you to define what "good" means. Traces, metrics, and logs are generated automatically. Evaluation is intentional.

For agents, evaluation means:

- **Accuracy.** Does the agent's output match the ground truth? For tasks with clear answers (math, fact retrieval), accuracy is testable. For open-ended tasks (writing, analysis), you need human reviewers or proxy metrics.
- **Cost efficiency.** How much did it cost to complete the task? Did it use cached tokens? Did it retry excessively?
- **Latency.** Did it answer in acceptable time, or did it get stuck reasoning?
- **Safety.** Did it refuse appropriately? Did it avoid hallucinating?

Continuous evaluation means running a subset of your production tasks through a grading function daily, and tracking the score over time. You can't grade every task (too expensive), so you sample strategically. You pick representative examples and track their scores as the agent evolves.

Evaluation is where you catch drift that metrics miss. Latency and error rates might look fine, but accuracy could be declining slowly—invisible until evaluation reveals it.

---

## 3. Choosing Your Stack

You have four options: open-source platforms, commercial SaaS, DIY with OpenTelemetry, or a hybrid. Each has trade-offs.

### Option 1: Open-Source Platforms

**Langfuse** (MIT license, self-hosted) is purpose-built for LLM agents. It handles tracing, logging, cost tracking, and evaluation in a single interface. You self-host the server (Docker), point your agent SDK at it, and log everything locally.

Advantages:
- No vendor lock-in.
- All data stays in your infrastructure.
- Generous free tier if you host it yourself.
- Native support for agent patterns (multi-turn, tool calling, function chaining).

Disadvantages:
- You operate the server. It needs monitoring, backups, scaling.
- Smaller ecosystem than commercial options.
- No pre-built integrations with exotic tools.

**Arize Phoenix** (open-source, self-hosted) is similar but emphasizes drift detection and evaluation. Excellent for catching accuracy degradation.

**When to choose:** You need data privacy, control over infrastructure, or you're already managing a self-hosted stack.

### Option 2: Commercial SaaS

**LangSmith** (LangChain's native platform) is tightly integrated with LangChain agents. If you're already building with LangChain, it's the obvious choice.

Advantages:
- Zero setup. Requires one environment variable.
- LangChain integration is seamless.
- Excellent UI and pre-built dashboards.
- LangChain team maintains it actively.

Disadvantages:
- Vendor lock-in. Your traces and logs live in LangChain's database.
- Pricing scales with usage, can get expensive at scale.
- Less flexible if you're using non-LangChain agents.

**Helicone** (proxy-based) sits between your agent and the model API. You point your requests through their proxy, and they capture everything without SDK integration.

Advantages:
- Works with any agent framework (no SDK required).
- Easiest setup: one environment variable.
- Great cost tracking and caching optimization.

Disadvantages:
- Only captures API calls to models, not internal agent logic.
- Adds latency (you're routing through their servers).
- No tool call visibility.

**When to choose:** You want minimal setup, don't mind vendor lock-in, and need something running today.

### Option 3: DIY with OpenTelemetry

**OpenTelemetry** (CNCF standard) is a framework for instrumenting your code to emit traces and metrics. You configure OpenTelemetry SDKs to collect signals, then route them to a backend (Grafana Loki for logs, Prometheus for metrics, Grafana Tempo for traces, or Datadog/Honeycomb/New Relic).

Advantages:
- No vendor lock-in. OpenTelemetry is standard.
- Complete control. You decide what to instrument and how.
- Works with any agent framework.
- Extremely flexible.

Disadvantages:
- Requires instrumentation. You write the code that emits spans and metrics.
- Steep learning curve. OpenTelemetry has many concepts.
- You manage the entire pipeline (collectors, backends, storage).
- DIY evaluation and cost tracking.

**When to choose:** You have strong internal infrastructure expertise, need maximum control, or are already invested in observability infrastructure (Kubernetes, Prometheus, etc.).

### Option 4: Hybrid Approach

Start with Langfuse for early-stage agent development (simple, runs in Docker, covers 80% of needs). As you scale, layer in OpenTelemetry for infrastructure metrics, and add a SaaS tool like Helicone for cost tracking. This avoids over-engineering early and prevents lock-in later.

### Decision Matrix

| Need | Best choice | Why |
|------|-------------|-----|
| Privacy-first, self-hosted | Langfuse (open) | Data stays internal |
| Minimal setup, LangChain-native | LangSmith | Zero friction |
| Multi-framework, no integration work | Helicone | Proxy captures everything |
| Maximum flexibility, existing infra | OpenTelemetry + Grafana | You own the pipeline |
| Cost-conscious startup | Langfuse (self-hosted) | Free, runs on laptop |
| Scale + control | Langfuse + OpenTelemetry | Best of both |

---

## 4. Setting Up Tracing

Let's build a concrete example. You have an agent that answers customer questions by searching a knowledge base and generating responses.

A single user request traces like this:

```
Request: "What's your return policy?"
├─ Span 1: Route to appropriate agent (0.2s)
│  └─ LLM call: classify question type
│     └─ Event: classified as "policy"
├─ Span 2: Knowledge base agent (2.1s)
│  ├─ Span 2a: Search knowledge base (0.8s)
│  │  ├─ Event: found 3 documents
│  │  └─ Span 2a-i: HTTP call to KB API (0.7s)
│  └─ Span 2b: Generate response (1.3s)
│     └─ LLM call: synthesize answer
│        └─ Event: used 284 input tokens, 127 output tokens
└─ Span 3: Format and return (0.1s)
   └─ Event: response 511 characters
```

Each span has:

- **Trace ID:** Unique identifier for this entire request. Same for all spans.
- **Span ID:** Unique for this span.
- **Parent Span ID:** Links child to parent.
- **Timestamps:** Start and end times (microsecond precision).
- **Attributes:** Metadata specific to that span.

For the "LLM call: synthesize answer" span, attributes might be:

```json
{
  "span.name": "llm.call",
  "llm.model": "gpt-4-turbo",
  "llm.temperature": 0.7,
  "llm.max_tokens": 500,
  "llm.tokens.input": 284,
  "llm.tokens.output": 127,
  "llm.tokens.cached": 45,
  "span.status": "success",
  "user.id": "user-12345",
  "task.id": "task-67890"
}
```

The key insight: **correlation IDs**. Every span shares the same trace ID. This lets you follow a request across agent boundaries. If Agent A delegates to Agent B, you set the trace ID in the context you pass. Agent B uses the same trace ID. When you query "trace ID xyz", you see the entire decision chain across both agents.

In a multi-agent system, this is critical. Without correlation IDs, Agent B's logs look unrelated to Agent A's. With them, you can replay the entire conversation.

**Implementation sketch (pseudocode):**

```python
from opentelemetry import trace, context
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# Set up OpenTelemetry to export to Langfuse
exporter = OTLPSpanExporter(endpoint="http://your-langfuse:4317")
trace.set_tracer_provider(TracerProvider(resource=...))
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(exporter))

tracer = trace.get_tracer(__name__)

# In your agent code:
with tracer.start_as_current_span("agent.task") as span:
    span.set_attribute("task.id", task_id)
    span.set_attribute("user.id", user_id)

    # Inside this span, all child operations are automatically linked
    with tracer.start_as_current_span("llm.call") as llm_span:
        llm_span.set_attribute("llm.model", "gpt-4")
        response = await llm_call(prompt)
        llm_span.set_attribute("llm.tokens.input", count_tokens(prompt))
        llm_span.set_attribute("llm.tokens.output", count_tokens(response))

    # If delegating to another agent, pass the context
    context_to_pass = context.get_current()
    result = await other_agent.run(query, context=context_to_pass)
```

The tracer automatically records timing, nesting, and status. You just set attributes and let the framework do the work.

---

## 5. Key Metrics to Track

Your observability dashboard needs to answer four questions every hour:

1. **Are we costing what we expect?**
2. **Is the system fast enough?**
3. **Are we failing?**
4. **Are we improving?**

Here are the metrics to track for each:

### Cost Metrics

- **Total tokens per task.** Sum of input, output, and cached tokens. Track by model (GPT-4 is more expensive than Grok).
- **Cached tokens ratio.** Cached tokens / total tokens. Higher is better. This is your cost optimization lever. If it's under 10%, you're not using prompt caching effectively.
- **Cost per task.** Real dollars. Model cost + tool cost. For a $0.01 per 1M input tokens model, a 5000-token task costs roughly $0.00005.
- **Cost per agent.** Sum of all tasks run by that agent. Track daily and weekly. If one agent's cost jumps 50%, something's wrong.
- **Cost per model.** Which model is costing the most? Is it worth the quality difference?

**Dashboard visualization:** Time series of daily cost per agent. Overlay cost per model as stacked area chart. Add a line for cumulative cost (helps spot budget issues early).

### Latency Metrics

- **P50, P95, P99 latency.** End-to-end time from request in to response out. P50 (median) is your typical user experience. P99 (worst 1%) tells you about outliers and timeout issues.
- **LLM latency.** Just the time spent waiting on model APIs, not reasoning or tool calls. If this spikes, blame the model provider, not your code.
- **Tool latency.** Time spent in external calls (search, database, APIs). If this spikes, investigate the external service.
- **Latency by agent.** Does Agent A consistently slower than Agent B? Why?

**Dashboard visualization:** Line chart of p50/p95/p99 latency over time. Separate graphs for total, LLM, and tool latency. Add a horizontal line at your SLA (e.g., "tasks should complete in under 5 seconds").

### Error Metrics

- **Error rate.** Percentage of tasks that fail. Track as time series. An error rate spike is a critical alert.
- **Error types.** Segment failures: LLM API errors (rate limits, overload), tool failures (timeout, 500 error), validation failures (output didn't match schema), timeout (took too long).
- **Retry rate.** Percentage of tasks that required at least one retry. High retry rates indicate instability or unreliable external services.
- **Error rate by agent.** Is one agent more fragile than others?

**Dashboard visualization:** Stacked bar chart of error count by type. Line chart of error rate (%). Add a heatmap of error count by hour and agent (helps spot patterns).

### Quality Metrics

- **Task completion accuracy.** (Only if ground truth exists) Percentage of tasks with correct answers.
- **Hallucination rate.** (Sample-based) Percentage of responses containing factually incorrect claims.
- **Refusal rate.** Percentage of requests where the agent declined to answer (safety mechanism working).
- **User satisfaction.** (If you have feedback) Thumbs up / thumbs down on responses.

**Dashboard visualization:** Gauge chart for accuracy (0-100%). Line chart of accuracy over time (shows drift). Daily count of hallucinations sampled (helps spot spikes).

---

## 6. Alerting Strategy

You don't want to be paged at 3 AM for every blip. You want alerts for things that actually require action.

### What to Alert On

**Critical:** Page immediately.
- Error rate > 5% (your system is broken).
- Cost per task > 2x historical average (something's inefficient, or a model changed pricing).
- P99 latency > 60 seconds (users are waiting too long).
- Any task that failed for the same reason 3+ times in a row (systematic issue).

**Warning:** Notify Slack, don't page.
- Error rate > 1% but < 5% (something's degrading).
- Cost per task > 1.5x average (worth investigating).
- P95 latency > 20 seconds (slower than normal, but not critical).
- Cached token ratio < 5% (you could optimize costs).

**Informational:** Log only, no notification.
- P50 latency > 3 seconds.
- Individual task failures (only alert if frequent).

### Alert Fatigue Prevention

If you page your team every time error rate hits 1%, they'll ignore alerts. Set thresholds conservatively. Ignore noise. For example:

- Only alert on error rate if it persists for 5+ minutes (not a single spike).
- Alert on cost per task only if sustained over 1 hour (not one expensive task).
- Exclude known-bad cases (e.g., don't alert on failures when a specific external service is down).

### Escalation

Define a runbook for each alert. Example:

```
Alert: Cost per task > 2x average
Severity: WARNING
Runbook:
1. Check which agent is the culprit (filter by agent in metrics)
2. Check which model (filter by model)
3. Check token count (is it higher than usual?)
4. Check cached token ratio (is caching working?)
5. If token count increased: did a prompt change?
6. If no obvious cause: check cost tracking code for bugs
Escalate if: unresolved after 30 minutes → page on-call engineer
```

Write these runbooks before you need them. At 3 AM, you want procedures, not improvisation.

---

## 7. Dashboard Design

You need three dashboards: Overview, Cost, and Debug.

### Dashboard 1: Overview

The health check. Glance at it every morning.

Display:
- **Large number:** Current error rate (red if > 1%, yellow if > 0.5%, green otherwise).
- **Large number:** Current P99 latency in seconds.
- **Large number:** Tasks completed in past 24 hours.
- **Time series:** Error rate over past 7 days.
- **Time series:** P50/P95/P99 latency over past 7 days.
- **Heatmap:** Error count by hour of day and agent (helps spot patterns—e.g., "Agent C always fails at 2 AM").
- **Table:** Top 5 errors by frequency (helps prioritize debugging).

### Dashboard 2: Cost

Your finance dashboard.

Display:
- **Large number:** Total cost today (in dollars).
- **Large number:** Cost per task (average in past 24 hours).
- **Large number:** Cached token ratio (should be > 15%).
- **Time series:** Cumulative cost over past 30 days (shows budget burn).
- **Stacked area:** Cost by agent (who's expensive?).
- **Stacked area:** Cost by model (which models are costing the most?).
- **Gauge:** Budget spent this month / budget limit (helps prevent overage).
- **Table:** Top 10 most expensive tasks (investigate why they cost so much).

### Dashboard 3: Debug

When something breaks, go here.

Display:
- **Search box:** Filter by trace ID, user ID, agent name, error type.
- **Waterfall timeline:** Show trace as Gantt chart. Each span is a bar, nested spans indent. Hover over spans to see attributes. Click to drill into detailed logs.
- **Structured logs:** All logs for this trace, chronological. Search within logs.
- **Model calls:** Exact prompts and responses for each LLM call in this trace. Helps debug reasoning errors.
- **Tool calls:** Exact input and output for each tool invocation.

The Debug dashboard is for investigations. When a user reports "your agent gave me a bad answer," you search for their request ID here and replay exactly what happened.

---

## 8. Advanced: Multi-Agent Tracing

Your system isn't a single agent. It's Agent A deciding whether to delegate to Agent B, B calling Tool X which calls Tool Y, and passing results back to A. How do you trace that?

**Rule:** Every agent runs in the same trace context.

When Agent A decides to delegate to Agent B, it passes the trace ID and the current span ID as the parent. Agent B creates child spans under that parent. When B returns to A, the context remains the same trace.

Example flow:

```
Trace ID: abc123def456

User query arrives
├─ Span: Agent A processes (root)
│  └─ Span: Agent A calls LLM to route (parent: Agent A)
│     └─ Event: decided to delegate to Agent B
├─ Span: Agent B processes (parent: Agent A's routing span)
│  ├─ Span: Agent B calls Tool X (parent: Agent B)
│  │  └─ Span: Tool X calls external API (parent: Tool X)
│  └─ Span: Agent B synthesizes result
└─ Span: Agent A formats and returns
```

All spans share Trace ID abc123def456. Parent-child links show the decision tree. Search for this trace ID and you see the entire story.

In code, it looks like:

```python
# Agent A
with tracer.start_as_current_span("agent.route") as routing_span:
    decision = llm.decide_agent(query)
    if decision == "delegate_to_b":
        context_to_pass = context.get_current()
        result = await agent_b.run(query, parent_context=context_to_pass)
        # Agent B's spans will be children of routing_span
```

**Shared context propagation.** When you pass context between agents, include:
- Trace ID (so the same trace continues).
- Parent span ID (so the child knows where to hang).
- User ID, task ID, timestamps (so downstream agents have context).

This is why correlation IDs matter. Without them, Agent B's logs are orphaned from Agent A's. With them, you can replay the entire distributed decision.

---

## 9. Cost Tracking Integration

Cost tracking isn't decorative. It's operational. You need real-time cost data so you can:

1. **Alert on cost spikes.** If a single task costs 10x normal, you catch it before it happens 1000 times.
2. **Budget control.** Cap spending per day, per model, per agent. If you're about to exceed your OpenAI budget, throttle requests.
3. **Attribution.** Know which agent, which user, which task is expensive. Drive investment decisions.

### Real-Time Cost Monitoring

Every time you call an LLM, log the cost immediately:

```python
response = await llm.call(prompt)
cost = calculate_cost(model, response.usage.input_tokens, response.usage.output_tokens)

# Log cost as a metric
cost_metric.record(cost, attributes={
    "agent": agent_name,
    "model": model_name,
    "user_id": user_id,
    "task_id": task_id,
    "tokens.input": response.usage.input_tokens,
    "tokens.output": response.usage.output_tokens,
    "tokens.cached": response.usage.cached_input_tokens
})
```

Every tool invocation that has a cost, log it:

```python
result = await tool.call(params)
if tool_cost(tool):
    cost = tool.cost_for(result)
    cost_metric.record(cost, attributes={"tool": tool.name})
```

Aggregate cost per task, per agent, per hour. Query your metrics DB: "What's the total cost in the past 24 hours?" "What's the cost per task for Agent A?"

### Budget Alerts and Automatic Throttling

Set a budget. Example: $100 per day on GPT-4 calls.

Every hour, check: have we spent more than (100 / 24) = $4.17?

If yes, alert. If we're projected to overspend, either:
- **Refuse new requests.** "Sorry, we've hit our limit for the hour. Try again in 60 minutes."
- **Downgrade model.** Use GPT-3.5 instead of GPT-4 until the hour resets.
- **Increase throttle.** If specific tools are expensive, make them optional or async.

```python
current_hour_cost = cost_db.query(
    f"SELECT SUM(cost) FROM costs WHERE timestamp > now() - interval '1 hour'"
)[0]
hourly_budget = daily_budget / 24

if current_hour_cost > hourly_budget * 1.1:  # 10% buffer
    if current_hour_cost > hourly_budget * 1.5:
        # Refuse requests
        raise BudgetExceeded("Hourly limit exceeded. Requests throttled.")
    else:
        # Use cheaper model
        context.preferred_model = "gpt-3.5-turbo"
```

### Model-Level Cost Attribution

Different models have different costs. GPT-4o is more expensive than Grok. You might want to use cheaper models for simple tasks and expensive models only when necessary.

Track cost per model:

```python
cost_by_model = cost_db.query("""
SELECT model, SUM(cost) as total_cost, COUNT(*) as task_count
FROM costs
WHERE timestamp > now() - interval '30 days'
GROUP BY model
ORDER BY total_cost DESC
""")

# Output:
# gpt-4o      | $1,245  | 3,421 tasks | $0.36/task
# gpt-3.5     | $234    | 8,901 tasks | $0.03/task
# claude-3    | $891    | 2,123 tasks | $0.42/task
```

This tells you: "GPT-4o is our most expensive model, but we're using it on 3,400 tasks. If we switched 50% of them to GPT-3.5, we'd save ~$620/month with likely minimal quality loss."

You make that decision deliberately, not accidentally.

---

## Summary: The Observability Checklist

By the time you ship your agent to production, you should have:

- [ ] **Tracing configured.** Every agent and tool call emits spans with correlation IDs.
- [ ] **Metrics pipeline.** Token usage, latency, cost, and error rates flowing to a time-series DB.
- [ ] **Logging structure.** Structured, queryable logs with trace ID, timestamps, and context.
- [ ] **Three dashboards.** Overview (health), Cost (budget), Debug (investigation).
- [ ] **Alerting rules.** Critical, warning, and info levels. Runbooks for each.
- [ ] **Evaluation baseline.** At least 10 representative tasks with human-graded accuracy scores.
- [ ] **Cost controls.** Real-time cost tracking, hourly budget checks, automatic throttling.
- [ ] **Runbooks written.** Procedures for common failures: "error rate spike," "cost spike," "latency degradation."

This is the difference between flying blind and having full visibility.

Once this is in place, you can operate at scale. You'll know when something breaks, why it broke, and how much it cost. You'll catch quality drift before users complain. You'll optimize costs deliberately. You'll sleep better at night.

---

## Related Resources

- **Debugging Playbook (Pollen Tier):** Step-by-step procedures for common agent failures.
- **Cost Optimisation Guide (Honey Tier):** Techniques to reduce token usage and model spend.
- **Pollen Debugging Flowchart:** Decision tree for diagnosing agent issues.

---

**Author:** Melisia Archimedes
**Last updated:** 2026-03-09
**Hive Doctrine ID:** HD-1102
**Tier:** Honey ($79)
**License:** The Hive Doctrine Marketplace Terms
