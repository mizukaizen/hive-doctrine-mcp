---
title: "Slack/Discord Multi-Agent Routing Architecture — Route Messages to the Right Agent Automatically"
author: Melisia Archimedes
collection: C4-infrastructure
tier: honey
price: 79
version: 1.0
last_updated: 2026-03-09
audience: agent-builders
hive_doctrine_id: HD-0023
---

# Slack/Discord Multi-Agent Routing Architecture

When you deploy multiple AI agents into a team environment—a research agent, a data analyst, a strategist—the hardest problem isn't training them. It's **routing**. When a user posts in Slack or Discord, how does the system know which agent should respond? If agents route randomly, users wait. If agents all respond, channels become noise. If routing is manual, you've built a glorified dispatch system, not automation.

This product file describes a proven routing architecture that solves this problem at scale. It separates the human interface (the channels and messages users see) from the agent coordination plane (how agents talk to each other internally). It defines the channel structure, the routing logic, fallback chains, and escalation patterns. Most importantly, it eliminates the mess—channels stay readable, agents stay coordinated, and users don't care about the machinery.

## The Two Planes Problem

Almost every Slack/Discord + multi-agent system fails for the same reason: it conflates two distinct communication planes.

### The Human Plane

This is what you see and interact with:
- Commands you send to agents
- Outputs agents return to you
- Critical alerts that need your attention
- Status updates and intelligence briefings

The human plane should be clean, low-volume, and intentional. You check it on your schedule. It doesn't interrupt you unless something critical broke.

### The Agent Coordination Plane

This is how the agent runtime talks to agents internally:
- Agent A asks Agent B for data
- Agent C queues a task for Agent D
- Results are collected and aggregated
- Retry logic and fallback chains execute

This plane should never appear in Slack or Discord. It's operational machinery. The moment agent-to-agent chatter starts appearing in user-facing channels, they become unreadable.

**The architecture below keeps these planes hard-separated.** Slack/Discord is human plane only. The agent runtime's internal routing is the agent coordination plane. They touch at exactly two points: when a user sends a command, and when an agent posts output back to a channel.

## Channel Structure

Here's the recommended channel topology:

```
COMMANDS (user → agent gateway)
├── #ops                    ← Single entry point for all commands
│                           (or use a Discord thread model equivalent)

CRITICAL ALERTS (agent runtime → user — high-urgency only)
├── #alerts                 ← Bot failure, order failure, security events
│                           Notifications ENABLED. Only channel that pings you.

MONITORING & INTELLIGENCE (agent runtime → user — read-only)
├── #signals                ← Market signals, anomalies, thresholds breached
├── #daily-brief            ← Scheduled morning briefing (run daily at 9am, etc.)
└── (others only when agents actually post regularly)

AGENT NOTEBOOKS (L2 agent outputs, when you want depth)
├── #research               ← Full research threads, detailed analysis
├── #analytics              ← Data analysis, P&L reports, metrics
└── #strategy               ← Strategic recommendations, trade-offs
```

**What's NOT in the channels:** agent-to-agent coordination. This lives entirely inside the agent runtime. Never pollute user-facing channels with it.

## The Gateway Agent Role

In a multi-agent system, one agent acts as the **gateway** (call it the orchestrator). This agent:

1. **Monitors the command channel** — reads `#ops` and any direct mentions
2. **Interprets user intent** — classifies what the user is asking for
3. **Routes internally** — sends tasks to the right L2 agents via internal routing (not Slack messages)
4. **Responds in-thread** — always threads replies back to the triggering message, never top-level
5. **Posts scheduled outputs** — publishes morning briefs, signals, alerts to their designated channels
6. **Handles critical events** — posts urgent alerts to `#alerts`

The gateway does not monitor other channels. Only L2 agents read their own channels—and only when they're configured to do so (not the default).

### Why One Gateway?

Single-gateway architecture wins for solo operations because:
- No routing ambiguity (one place to send commands)
- One command history to scroll through
- Centralized fallback logic (if a task fails, the gateway decides what happens next)
- No concurrent gateway invocations causing race conditions

If you add multiple users later, you can evolve to per-user channels or mention-based routing, but start with one gateway.

## Message Classification & Intent Detection

When a user posts "Run the analysis on today's signals," the gateway must classify this command. The classification determines which L2 agent gets the task.

### Classification Strategy

Build a classification layer that maps intents to agents:

| Intent Pattern | Example | Route to | Fallback |
|---|---|---|---|
| Research / analysis | "Deep dive into XYZ thesis" | Research agent | Strategic agent |
| Data query | "What's the P&L this week?" | Analytics agent | Research agent |
| Market signal | "Check crypto volatility" | Signals agent | Analytics agent |
| Decision / recommendation | "Should we increase position?" | Strategy agent | Research agent |
| System/config | "Restart the bot, change settings" | Infrastructure agent | Gateway (admin) |

The classification doesn't have to be perfect. The fallback chain (right column) catches misclassifications. If the research agent can't answer a data query, it hands off to the analytics agent. If analytics can't answer a strategic question, it escalates to the gateway.

### Implementation

Embed the classification in the gateway agent's system prompt:

```
You are the orchestration gateway for a multi-agent system.

When a user posts in #ops:
1. Classify their intent using these categories:
   - RESEARCH (analysis, investigation, market intelligence)
   - DATA (queries, metrics, historical analysis)
   - SIGNALS (monitoring, anomalies, thresholds)
   - STRATEGY (recommendations, trade-offs, decisions)
   - SYSTEM (config, admin, infrastructure)

2. Route to the appropriate L2 agent internally.

3. If the L2 agent fails or returns "not applicable", use this fallback chain:
   - RESEARCH fails → try DATA
   - DATA fails → try RESEARCH
   - SIGNALS fails → try RESEARCH
   - STRATEGY fails → try RESEARCH (for context) then DATA (for metrics)
   - SYSTEM fails → escalate to admin (do not retry)

4. Always thread your response back to the user's message.
   Format: [status] [result summary] [next steps or pointer to full output]

5. Long-form outputs (>500 chars) go to their designated agent notebook.
   Post a summary in #ops with a pointer: "Full analysis in #research (T-042)."
```

## Routing Rules

### Rule 1: Single Entry Point

All commands go to `#ops` (or the Discord equivalent—a command thread or channel). Don't create per-agent command channels like `#ask-research` or `#ask-analytics`. This creates ambiguity:
- Does `#ask-research` mean "I want to command the research agent" or "I'm reading research output"?
- What happens if you send a research-adjacent question that should actually go to analytics?

**Better approach:** Single channel. Gateway classifies and routes internally.

### Rule 2: All Responses Thread

Every response from the gateway threads back to the triggering message. No exceptions. No top-level replies to commands.

Why? Readability. If the gateway posts 10 top-level messages a day, the channel becomes a log. Threading keeps the command and its response paired. Users can scan the channel, see "command X → response X", and move on.

Exception: Proactive posts (scheduled briefs, alerts, signal summaries) are allowed top-level because they're not responses—they're broadcasts.

### Rule 3: Structured Response Format

Enforce a consistent format in the gateway's system prompt:

```
Completed task:
✅ [task name in 4-6 words]
[1-3 line summary of result]
→ Next: [follow-up action or recommendation, or omit]

In-progress task:
⚡ [task name] — running
ETA ~Xmin

Failed task:
⚠️ [task name] — failed
[One-line reason why]
→ What to do: [retry? escalate? try alternative?]
```

Example:
```
✅ Crypto volatility check
BTC volatility at 42% (90-day), ETH at 38%. Elevated but within normal ranges.
→ Next: Monitor for spikes above 50%.
```

This format is scannable, unambiguous, and fits in a thread.

### Rule 4: Task IDs for Parallel Execution

When the user fires multiple commands in quick succession, parallel tasks can interleave. Solve this with task IDs.

The gateway generates a short sequential ID for each command (`T-001`, `T-002`, `T-003`). When results come back, they include their ID:

```
Command 1: "Analyze signal A"
Command 2: "Analyze signal B"
Command 3: "Fetch yesterday's metrics"

---

✅ T-001: Signal A analysis
[result]

✅ T-002: Signal B analysis
[result]

✅ T-003: Yesterday's metrics
[result]
```

All results are clearly tagged and unambiguous.

Now when you read the thread 2 hours later, it's unambiguous which result belongs to which command.

## Fallback Chains & Escalation

No agent will always be available or capable of answering every question. Build fallback logic into the gateway's routing.

### Fallback Chain Example

```
User asks: "What's our current edge in the XYZ markets?"

Route 1 (primary): Research agent
  → Can this agent answer? Check its training context.
  → If no: escalate to fallback.

Route 2 (fallback): Analytics agent
  → Can this agent pull the data needed? Check its data sources.
  → If no: escalate to next fallback.

Route 3 (final fallback): Strategy agent
  → Can this agent synthesize a recommendation? Check its scope.
  → If no: escalate to gateway (admin).

Gateway (escalation): Log the unhandled request, ask the user for clarification.
  Post in thread: "I couldn't answer this with the current agent capabilities.
  Can you clarify: are you asking for (a) historical analysis, (b) real-time metrics,
  or (c) a strategic recommendation?"
```

### When to Escalate to Admin

Escalate immediately (don't retry) if:
- The request requires system admin access (config changes, bot restart, API key rotation)
- The request is outside the defined scope (agents can't answer questions about proprietary financials if they're not trained on them)
- A user is attempting to bypass agent safeguards

## Handling Rate Limits & Load Shedding

If the agent runtime is under load, incoming commands will queue. The gateway should surface this transparently:

```
⚡ Your request is queued
Position in queue: 3
ETA ~5 min

(You'll see the result threaded here when ready.)
```

For proactive posts (signals, alerts), implement rate limiting to prevent channel noise in #ops:

```
Max proactive posts per channel per hour: 5
Batch rule: If a channel hits the limit, batch remaining posts into an hourly summary.

Example:
- 5:00 AM: Signal A posted (count: 1/5)
- 5:15 AM: Signal B posted (count: 2/5)
- 5:30 AM: Signal C posted (count: 3/5)
- 5:45 AM: Signal D posted (count: 4/5)
- 6:00 AM: Signal E posted (count: 5/5)
- 6:15 AM: Signal F arrives
  → Rate limit hit. Batch F with any other signals arriving until 7:00 AM.
  → At 7:00 AM, post: "Signal summary (6 signals): [list]"
```

## Notification Policy

**Critical rule: The gateway never pings you unless you're about to lose money or something is on fire.**

Implement this with explicit channel notification settings:

| Channel | Notifications | Rationale |
|---|---|---|
| `#alerts` | ENABLED (default on) | Critical only: bot down, failed orders, security incidents |
| `#ops` | MUTED (default off) | Responses are threaded to your commands—you'll see them when you check |
| `#signals` | MUTED (default off) | Important but not urgent. You check on your schedule |
| `#daily-brief` | MUTED (default off) | Scheduled output. You read it when ready |
| `#research`, `#analytics`, `#strategy` | MUTED (default off) | Reference channels. You pull data from them when needed |

**Exception:** If a user explicitly says in a command "notify me when this is done," the gateway can send one direct mention for that result. But this should be rare.

The goal: Slack/Discord is ambient. You dip in when you want to. It doesn't interrupt you unless something critical broke.

## Integration with External Systems

### File-Based Context

The gateway agent should have access to persistent context:
- Agent capabilities and availability
- User preferences (notification thresholds, routing overrides)
- Historical command logs (for learning what works)
- System status (which agents are live? which are degraded?)

Store this in structured files (JSON, YAML) rather than in Slack history. Slack history is noisy and unreliable for reconstruction.

### Webhook Integration

To send commands to the gateway programmatically (from monitoring systems, cron jobs, etc.), expose a webhook:

```
POST /webhook/command
Content-Type: application/json

{
  "user_id": "monitoring-system",
  "intent": "SIGNALS",
  "message": "CPU usage on prod is at 95%. Is this expected?",
  "priority": "high",
  "channel": "#alerts"
}
```

The gateway classifies and routes. If the issue requires human attention, it posts to `#alerts`. Otherwise it handles it internally.

### Agent Capability Registry

Maintain a registry of L2 agent capabilities:

```yaml
agents:
  research:
    name: "Research Agent"
    capabilities:
      - market analysis
      - thesis evaluation
      - trend identification
    fallback_to: [analytics, strategy]
    response_time_sla: "< 5 min"
    availability: "Mon-Fri 6am-6pm UTC"

  analytics:
    name: "Analytics Agent"
    capabilities:
      - data queries
      - metric computation
      - historical analysis
    fallback_to: [research]
    response_time_sla: "< 2 min"
    availability: "24/7"

  strategy:
    name: "Strategy Agent"
    capabilities:
      - recommendations
      - trade-off analysis
      - decision frameworks
    fallback_to: [research, analytics]
    response_time_sla: "< 10 min"
    availability: "Mon-Fri 8am-5pm UTC"
```

The gateway consults this registry when classifying intents and choosing fallback routes.

## Common Pitfalls & How to Avoid Them

### Pitfall 1: Channel History as Working Memory

Your first instinct might be to have the gateway scan channel history to reconstruct context. Don't.

Slack/Discord history is a noisy, unstructured log. It's full of side conversations, typos, outdated info. Scanning it is expensive and error-prone.

**Instead:** Use a proper working memory store—SQLite, a vector index, or structured files. Channels are interface and output. They're not storage.

### Pitfall 2: Agent Notebooks Become Noise

If an L2 agent posts 20 times a day to its output channel, you'll mute it and lose the signal. Implement rate limiting and batching (see "Handling Rate Limits" above). Threshold: max 5 proactive posts per channel per hour. Batch anything over the limit into a summary.

### Pitfall 3: Conflating Command Channel with Output Channel

If `#research` is both where you command the research agent AND where it posts outputs, you've created ambiguity.

**Better design:** Single command channel (`#ops`). Separate output channels for each agent (`#research`, `#analytics`, `#strategy`). The gateway routes; agents produce. Users command once, read outputs in the right place.

### Pitfall 4: Threading Rules Aren't Enforced in the System Prompt

Threading and response format are easy to skip under load. If they're just in a config file, the gateway agent will forget them.

**Instead:** Make threading and format requirements explicit in the gateway's system prompt. They should be front-and-centre, not buried in docs.

### Pitfall 5: No Escalation Logic

If an agent can't answer a question and the gateway just returns "I don't know," you've built a very expensive search engine.

**Instead:** Build explicit fallback chains. If Research fails, try Analytics. If Analytics fails, try Strategy. If all three fail, escalate to admin with a structured summary.

## Implementation Roadmap

### Phase 1: Command Discipline (1–2 hours)

1. Create a single `#ops` channel (or Discord thread-based equivalent)
2. Deploy the gateway agent with threading rules in its system prompt
3. Test with 5 representative commands
4. Verify: all responses threaded, all formatted, no top-level noise

### Phase 2: Output Channels (2–3 hours)

1. Create `#alerts`, `#signals`, `#daily-brief`
2. Configure the gateway to post critical alerts to `#alerts`
3. Configure the gateway to post daily briefing to `#daily-brief` on a schedule (e.g., 9:00 AM daily)
4. Set Slack/Discord notification settings: `#alerts` = enabled, everything else = muted
5. Test the notification behaviour (only get pinged for `#alerts`)

### Phase 3: L2 Agent Channels (1 hour)

1. Create output channels for each L2 agent (`#research`, `#analytics`, `#strategy`)
2. Configure agents to post long-form outputs to their channels
3. Update the gateway's response format to include pointers: "Full analysis in #research (T-042)"
4. Test that long outputs appear in the right channel, not cluttering `#ops`

### Phase 4: Task IDs & Parallel Execution (1 hour)

1. Add task ID generation to the gateway (simple counter: T-001, T-002, etc.)
2. Configure the agent runtime to include task IDs in all routed tasks
3. Update response format to include the task ID
4. Test with 3+ concurrent commands and verify results are unambiguous

### Phase 5: Capability Registry & Smarter Fallbacks (2–3 hours, later)

1. Build the agent capability registry (YAML or JSON)
2. Encode fallback chains based on the registry
3. Add capability checks to the gateway's routing logic
4. Test with "bad" questions (out of scope, impossible to answer) and verify escalation works

## Configuration Template

Save this configuration alongside the gateway agent's system prompt:

```yaml
gateway:
  name: "Multi-Agent Orchestrator"
  command_channel: "#ops"

  response_format:
    template: |
      [status emoji] [task name in 4–6 words]
      [1-3 line summary]
      → [next steps or pointer to full output]
    max_summary_chars: 500
    long_output_pointer: "Full analysis in #[agent_channel] (T-[task_id])"

  threading:
    all_responses_thread: true
    top_level_allowed: [alerts, scheduled_posts]

  task_ids:
    enabled: true
    format: "T-{counter:03d}"

  rate_limiting:
    proactive_posts_per_channel_per_hour: 5
    batch_overflow_into_summary: true

  notifications:
    alert_channel: "#alerts"
    alert_mentions_enabled: true
    default_channel_notifications: muted

  fallback_chains:
    research: [analytics, strategy]
    analytics: [research]
    signals: [research]
    strategy: [research, analytics]
    system: [admin_escalation]
```

## Deployment Checklist

Before going live:

- [ ] Command channel created and pinned
- [ ] Gateway agent deployed with threading rules in system prompt
- [ ] 5 test commands sent and verified (threaded, formatted)
- [ ] Output channels created for each L2 agent
- [ ] Long-form output pointer format tested
- [ ] Notification settings configured (alerts enabled, others muted)
- [ ] Task ID generation working (verify with concurrent commands)
- [ ] Fallback chain tested with "impossible" questions
- [ ] Capability registry populated and accessible to gateway
- [ ] Configuration YAML deployed alongside agent config
- [ ] Rate limiting tested (hit the limit, verify batching)
- [ ] Documentation updated with channel purposes and routing logic

## Why This Matters

Most multi-agent systems in production fail operationally because they lack a clear communication structure. Channels become noisy. Agents step on each other. Users don't know where to ask questions or read results. And the developer gets pulled in to manually route tasks and debug ambiguities.

This architecture solves that. It's boring. It works. It scales to 10+ agents without becoming unmaintainable. And most importantly, it keeps the human interface clean and intentional while the agent coordination happens invisibly in the background.

The key insight: separate the human plane from the agent plane. One channel for commands. Separate channels for outputs. One gateway. Clear routing rules. Let users think in intent, not infrastructure.

---

## Further Reading

- **Intent classification at scale:** If you have 50+ possible user intents, move from a simple pattern-match classifier to a fine-tuned embedding model or a hierarchical decision tree.
- **Multi-turn conversations:** This architecture assumes single-message commands. If users need multi-turn dialogue, thread that entire conversation together and only escalate once the user says "done."
- **Handoff between agents:** If Agent A needs Agent B's output to complete a task, the handoff happens internally (inside the agent runtime). Don't create a "handoff channel."
- **Audit logging:** Every command, route decision, and result should be logged to a structured file or database. Use this to improve routing accuracy over time.
