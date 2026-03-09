---
title: "Multi-Agent Debugging Playbook"
author: Melisia Archimedes
collection: C9 Diagnostic Patterns
tier: honey
price: 79
version: 1.0
last_updated: 2026-03-09
audience: agent_operators
hive_doctrine_id: HD-1107
sources_researched: [distributed systems debugging literature, multi-agent failure analysis, observability platforms, production incident post-mortems]
word_count: 6787
---

# Multi-Agent Debugging Playbook

## Introduction: Why Multi-Agent Debugging Is Harder Than You Think

Debugging a single agent is bad. Debugging five agents talking to each other is exponentially worse.

When you run one agent in production, you've got maybe 10–15 failure modes to worry about: prompt regressions, token limits, hallucinations, bad tool calls, memory issues. You can write a test for each one and move on.

When you run five agents—especially if they're calling each other, sharing state, or coordinating around shared resources—you've got a combinatorial explosion. Agent A's output becomes Agent B's input. Agent B's latency affects Agent C's timeout logic. Agent C's error cascades back to A, which retries, which creates a race condition in the shared state that Agent D is also trying to update.

The worst part? All five agents can be functionally correct in isolation, and the system still produces garbage output. You can't see the failure in unit tests. It only shows up when they're running together under load.

This playbook is for people who've been there. Who've spent three hours staring at logs trying to figure out why Agent B never got the message from Agent A, or why the system went into a cascade failure that took everyone down. Who've learned—sometimes painfully—what to look for, how to think about these problems, and how to fix them fast.

---

## The Debugging Mental Model: Think in Graphs, Not Stacks

The fundamental shift you need to make: stop thinking like you're debugging a web request (request in, response out) and start thinking like you're debugging a distributed system.

When debugging a single agent, you trace backward through the stack: function called, function called, function called, output wrong. Linear. Easy.

When debugging multiple agents, you need to think in **graphs**. Each agent is a node. Each message is an edge. Requests flow through nodes, sometimes in parallel, sometimes with synchronisation points.

Your mental model has three layers:

1. **Individual agent layer**: Each agent's internal state—what it's thinking, what it remembers, whether it's hallucinating.
2. **Agent-to-agent layer**: How messages move between agents. Did the message arrive? Did it arrive intact? Did both agents agree on what the schema was?
3. **System layer**: How the whole topology behaves under load. Are you rate-limited? Are you deadlocked? Is emergent misbehaviour happening?

Most debugging failures happen because operators get stuck at one layer and never zoom out. You fix an agent's prompt, tests pass, deploy—and the system still breaks because the real problem was at the agent-to-agent layer (Agent A was sending messages in the wrong order) or the system layer (rate-limiting was killing throughput).

**Rule of thumb:** Always start at the system layer. If the symptom shows up at runtime but not in tests, you're probably looking at an interaction problem or an emergent failure, not a single-agent bug.

---

## Layer 1: Individual Agent Failures

### Prompt Regression

You edit Agent B's system prompt to be "more helpful." Tests still pass. You deploy. Production starts returning wrong answers.

**What happened:** Prompt changes have downstream effects you didn't anticipate. Maybe you made the agent more verbose, and now it's hitting context limits in downstream agents. Or you changed tone, and now the agent is less conservative about edge cases. Prompts aren't code—they're behavioural specifications. Small word changes can have outsized effects on an LLM's reasoning process.

A classic example: you remove the phrase "be concise" from the prompt because you want more detailed reasoning. The agent starts returning 2000-token responses instead of 500-token ones. Now Agent C, which depends on Agent B's output, is receiving massive inputs and hitting its own token limits. The system cascades from there.

**Diagnostic approach:**
- Compare the old and new prompt side-by-side. What changed? Look for tone shifts, constraint removals, examples added or removed, and emphasis changes.
- Run the same input through both prompts. Do outputs differ in length, tone, reasoning depth, or confidence level?
- If outputs differ, do the differences propagate to downstream agents? Can downstream agents handle the new output format?
- Are there interaction effects with other agents' recent changes? Did someone also change Agent C's prompt recently?
- Check output statistics: max tokens, average latency, error rate before and after the change.

**Prevention:** Keep a version history of every agent's system prompt in a structured format. Tag major changes with a changelog (what changed and why). Before deploying, run comparative tests on a diverse set of inputs—not just happy path, but edge cases, adversarial inputs, and high-load conditions. Run A/B tests in staging: route some traffic through the old prompt, some through the new one. Compare outputs. If error rates differ, investigate before production.

### Context Window Overflow

Agent B is supposed to look at the full conversation history, but halfway through the day, it stops responding. Or it starts truncating its own outputs.

**What happened:** The input context (conversation history, retrieved documents, previous turn summaries) is growing faster than you realised. Agent B hits the token limit. It either crashes, starts dropping data, or truncates its own reasoning.

**Diagnostic approach:**
- Log the token count of every input to Agent B. What's the max you've seen?
- When does it start failing? Right after a certain message volume threshold?
- Is the agent truncating outputs, or is it returning an error?
- Are you using a rolling window of context? Is it actually rolling, or are you keeping everything?

**Prevention:** Add automatic context window monitoring. Log input token counts. Set a warning threshold at 70% of the agent's max tokens. Implement automatic context pruning—oldest messages first, or summarise old conversations.

### Hallucination Detection and Measurement

Agent C is supposed to answer questions about known facts, but it confidently states things that are completely wrong.

**What happened:** The agent is making stuff up. This is the classic LLM problem, but it gets worse in multi-agent systems because now Agent D might be acting on the hallucination, amplifying the error.

**Diagnostic approach:**
- Ground-truth check: For outputs that seem plausible but suspicious, verify against your actual data.
- Confidence flags: Does the agent say "I'm not sure" or does it always sound certain?
- Consistency check: If you ask the same question twice, does the agent give the same answer?
- Schema check: Is the agent returning outputs in the agreed format, or is it improvising?

**Prevention:** Add a verification layer. Before Agent C's output reaches downstream agents, have it cite its sources. "This is based on document X, section Y." If there's no source, flag it. Use retrieval-augmented generation (RAG): make Agent C look up facts from a known base rather than relying on training data.

### Tool Call Failures

Agent A is supposed to call Tool X and pass the result to Agent B. But sometimes Tool X times out. Sometimes Agent A calls it with the wrong parameters. Sometimes Tool X returns an unexpected format.

**What happened:** Either the agent doesn't understand the tool's contract, or the tool is unreliable, or the network is failing.

**Diagnostic approach:**
- Check the tool's contract: Is the agent calling it correctly? Are the parameters valid?
- Check the tool's logs: Is it actually executing? Is it failing?
- Check latency: How long is the call taking? Is it timing out?
- Check error handling: When the tool fails, does the agent retry? Does it fail gracefully?
- Check the format: Is the tool returning what the agent expects?

**Prevention:** Wrap every external tool call in explicit error handling. Log every call: input, output, latency, errors. Add timeouts—a failed tool call shouldn't hang your system. Test tools offline first, then in staging, before production.

### Memory Corruption or Stale Context

Agent B is remembering things that didn't happen. Or it's acting as though old information is current.

**What happened:** If agents store conversation history, summaries, or facts in memory or a database, and you're not careful about updates, you end up with stale data. Maybe you updated a fact in the database, but Agent B still has the old version cached in memory.

**Diagnostic approach:**
- Trace what Agent B knows: What's in its memory? When was it last updated?
- Compare to source of truth: If facts are stored in a database, does Agent B's memory match?
- Check the update path: When a fact changes, does Agent B get notified? How long does it take?
- Look for cache invalidation bugs: Is there code that clears the cache? Does it run when it should?

**Prevention:** Never cache without an expiration. Use a write-through cache: whenever data changes, update both the cache and the source. Add a "refresh on miss" pattern: if the cache is stale or missing, go to source of truth. Version your facts. Store a timestamp on every piece of data Agent B remembers.

---

## Layer 2: Agent-to-Agent Failures

### Message Passing Failures

Agent A sends a message to Agent B. Agent B never gets it. Or gets it twice. Or gets a corrupted version.

**What happened:** Network issues, queueing failures, or bugs in the message passing layer.

**Diagnostic approach:**
- Check the logs on Agent A's side: Did it send the message?
- Check the logs on Agent B's side: Did it receive the message?
- Is there a queue in the middle? Is the message stuck there?
- Is there a retry mechanism? Is it retrying forever?
- Compare the sent version to the received version: Are they identical?

**Prevention:** Implement request IDs. Every message gets a unique ID that carries through the whole chain. Log every send and receive with the request ID. If a message is sent but never received, you can see it immediately. Use idempotency keys: if a message is delivered twice, the second delivery should be a no-op.

### Schema Mismatches

Agent A sends a JSON object with fields `{user_id, action}`. Agent B expects `{userId, action_type}`. Agent B can't parse it and crashes.

**What happened:** The agents' interfaces drifted. Maybe someone updated Agent A's output format but didn't update Agent B's input schema. Or the documentation was wrong.

**Diagnostic approach:**
- Check both agents' schemas: Are they actually compatible?
- Look at recent changes: Did one agent get updated without updating the other?
- Run a schema validator: Can you automatically validate that Agent A's output matches Agent B's input schema?
- Check the error message: Does it say "unexpected field" or "missing required field"?

**Prevention:** Use strict schema validation. Before an agent sends output, validate it against its own output schema. Before an agent accepts input, validate it against its own input schema. Use a shared schema definition that both agents reference. Use semantic versioning: if you change a schema, bump the version number and have both agents understand both versions for a transition period.

### Deadlocks

Agent A is waiting for Agent B to respond. Agent B is waiting for Agent A to respond. Both are blocked forever.

**What happened:** Circular dependencies in the agent interaction graph. A calls B, B calls A, both wait for each other.

**Diagnostic approach:**
- Map the interaction graph: Who's calling whom?
- Identify cycles: Is there a circular path?
- Check the timeouts: How long will each agent wait before timing out?
- Look at the order of operations: Does A always call B first? Does B try to call A synchronously?

**Prevention:** Design your agent topology to be acyclic. If you need feedback loops (A calls B calls A), make them asynchronous and explicit. Don't have one agent blocking on another agent's response unless you're sure that agent will respond. Add a timeout—if the response doesn't arrive in N seconds, give up.

### Race Conditions in Shared State

Agents A and B both try to update the same record in the database at the same time. One write succeeds, the other overwrites it. Now the system's in an inconsistent state.

**What happened:** Multiple agents writing to shared state without synchronisation.

**Diagnostic approach:**
- Identify shared state: What data do multiple agents write to?
- Check for locks: Are there any database locks or mutexes protecting this state?
- Look at the update pattern: Is it read-modify-write? (classic race condition pattern)
- Check the logs: Can you see two agents updating the same record in quick succession?

**Prevention:** Use optimistic locking: add a version number to every piece of shared state. When an agent updates, it includes the version it read. If the version doesn't match (someone else updated it), the update fails. The agent retries. Use database transactions: wrap reads and writes in a transaction so either all succeed or all fail. Use event sourcing: instead of updating state directly, append immutable events to a log. Rebuild state from events as needed.

### Cascade Failures

Agent A fails. This causes Agent B to timeout. This causes Agent C to retry. The retries overload the system. The overload causes Agent D to fail. By the time you notice, everything is down.

**What happened:** One failure propagates through the system.

**Diagnostic approach:**
- Timeline: When did things start failing? What was the first failure?
- Dependency graph: Who depends on whom?
- Trace the failure path: How did it cascade?
- Look for retry loops: Are failing agents retrying? Are they backing off, or retrying immediately?

**Prevention:** Implement bulkheads: isolate failures so they don't cascade. If Agent A fails, don't let it take down Agent B. Use circuit breakers: if an agent detects that a downstream agent is failing, stop calling it for a while. Use exponential backoff: if a call fails, wait before retrying. Wait longer if it fails again. Use graceful degradation: if Agent B is unavailable, can Agent A do something useful without it?

---

## Layer 3: System-Level Failures

### Resource Exhaustion

The system was running fine at 100 requests per minute. At 200 requests per minute, everything slows to a crawl. At 300, it crashes.

**What happened:** You've hit a resource limit. Token budget (if using APIs), API rate limits, memory, database connections, or network bandwidth.

**Diagnostic approach:**
- Monitor resource usage: What's maxed out? Memory? CPU? Network?
- Check the bottleneck: Which agent or component is the constraint?
- Look for unbounded growth: Is something getting bigger over time? (memory leak, queue buildup)
- Check scaling: Is your system designed to scale horizontally? Can you add more instances?

**Prevention:** Set resource limits on every agent and component. Monitor actual usage. When a resource hits 70% of its limit, alert. When it hits 90%, start throttling. Implement backpressure: if an agent can't keep up, slow down the inputs. Use queuing: don't process everything immediately, queue requests and process them at a sustainable rate.

### Configuration Drift

Agent A is running the v2 prompt. Agent B is running the v1 prompt. They're not compatible, and the system breaks.

**What happened:** Agents got deployed at different times, or someone updated one agent's config and forgot to update the others.

**Diagnostic approach:**
- Audit all running agents: What version of each agent's code and config is actually running?
- Check deployment times: Did everything get deployed together, or piecemeal?
- Compare configs: Are there differences between what you think is running and what's actually running?

**Prevention:** Use a unified deployment mechanism. Deploy all agents at the same time. Use configuration management: store all configs in version control. Before deploying, verify that all agents are using compatible versions. Use health checks: each agent reports its version and config at startup. If they don't match expectations, fail to start.

### External Dependency Failures

Agent A relies on API X. API X goes down. Agent A times out or crashes. The rest of the system grinds to a halt.

**What happened:** You depend on something you don't control.

**Diagnostic approach:**
- Check the external service's status: Is it actually down?
- Look at logs: Is Agent A timing out or getting an error?
- Check the dependency: Can you function without API X? What breaks?
- Look for fallbacks: Are there alternative ways to get the data?

**Prevention:** Don't depend on external services unless you have to. If you do, cache aggressively. If the API goes down but you have cached data, use the cache. Implement timeouts: don't wait forever for an external service. Use fallbacks: if the primary service fails, try a secondary. Monitor dependencies: if an external service is experiencing issues, you should know before your system breaks.

### Emergent Misbehaviour

Each agent is working correctly. The system architecture is sound. But somehow the system is producing garbage output.

**What happened:** The interactions between agents are creating unexpected emergent behaviour. Maybe agents are amplifying each other's errors. Maybe they're converging on a suboptimal equilibrium. Maybe the incentive structure is wrong, and agents are optimising for the wrong thing.

**Diagnostic approach:**
- Isolate each agent: Test them in isolation. Do they work correctly?
- Test agent pairs: Does Agent A + B work correctly?
- Expand incrementally: Add agents one at a time. When does the system start misbehaving?
- Analyse the interaction pattern: What are agents optimising for? Are they aligned?
- Look for feedback loops: Are agents amplifying each other's behaviour?

**Prevention:** This is the hardest one. Design your agent system explicitly. Define what success looks like for the system as a whole, not just individual agents. Use explicit protocols for agent interaction. Test the full system, not just individual components. Monitor system-level outcomes, not just component health.

---

## The Debugging Toolkit

A good toolkit can cut debugging time in half. Build it before you need it, not after a 3am incident.

### Trace Visualisation

See the full request path through all agents.

Every message gets a request ID at inception. As it flows through the system, every agent logs when it receives the message, processes it, and sends it on. You can reconstruct the entire path: timestamp, agent, operation, latency, success or failure. Visualise it as a directed graph or a waterfall chart. You'll see immediately if a message is stuck in a queue, if an agent is slow, or if a path is missing entirely.

Implementation: in your framework layer (the thing that orchestrates agent calls), generate a UUID for every new request. Attach it to every message. Every agent logs it. Build a collector that reads logs and reconstructs the trace graph. Visualise it in a web dashboard.

Tools: distributed tracing platforms (Datadog, New Relic, Honeycomb) or open-source solutions (Jaeger, Grafana Tempo). If you're building a custom system, you can implement this yourself with structured logging and a time-series database.

### Log Correlation

Link logs across agents by request ID.

Instead of staring at five different log streams (one per agent) and trying to manually match timestamps, you can search by request ID and see every log entry related to that request, in all agents, in chronological order. You go from "I think Agent B was slow around 10:05" to "Agent B received the request at 10:05:32.123, processed it from 10:05:32.124 to 10:05:35.456, and returned the response."

Implementation: Configure your logging library to automatically include the request ID in every log. Use a structured format (JSON) so you can parse and search later. When an agent passes a message to another agent, pass the request ID. The receiving agent includes it in all its logs. Use a log aggregation system (ELK, Datadog, Cloudflare) that can index and search by request ID.

### State Snapshots

Capture the full state of every agent at the moment of failure.

When something goes wrong, save not just the error message, but also: what was in the agent's memory? What was its context window? What were its recent inputs? What was the agent's internal state? This lets you replay the failure later in a debug session.

Implementation: Add middleware that, on error, snapshots the full state to a database or file. Include: current time, request ID, agent name, full inputs, full outputs, internal state, configuration. Don't just capture the error—capture the full context. Make snapshots searchable by request ID so you can find them later.

A captured snapshot is like a stack trace in traditional debugging, but for distributed systems. It's invaluable.

### Replay Debugging

Re-run a failed interaction with the same inputs and full context.

If you have a snapshot of the state when the failure occurred, you can load it and replay the failure locally. Feed in the same input, step through line by line, and understand what went wrong. This lets you test fixes in a controlled environment that exactly mirrors production without risking real users.

Implementation: Build replay infrastructure that can deserialise a snapshot and restore the system to that exact state. Set up a local test environment. Load the snapshot. Feed in the same input. Run through the agent logic. Observe. Fix. Test. Verify the fix resolves the issue.

### Diff Analysis

Compare successful vs failed runs.

When you have two runs of the same input (one successful, one failed), diff them: input, intermediate states, outputs, logs. What's different? Usually, the difference points straight to the bug. Maybe Agent A's output changed. Maybe the timing was different. Maybe one run executed a code path the other didn't.

Implementation: Log everything in both runs using the same format. Use a diff tool to compare. Automate this: when a run fails, automatically compare it to a recent successful run with similar inputs. Build a dashboard that shows you the diffs visually. Highlight differences in red. This saves enormous debugging time.

---

## Structured Debugging Process

A process keeps you from going in circles. Follow it even when you're impatient.

### Step 1: Reproduce

Can you trigger the failure reliably?

Spend 15 minutes trying to reproduce the failure. If it's intermittent, find conditions that make it reproducible. Is it correlated with time of day? With certain inputs? With a certain load level? With concurrent operations? With network latency?

If you can reproduce it consistently, great. You can debug it. If you can't, you need to look at production logs and try to understand what led to the failure. If it's truly random and you can't find a trigger, you're looking at either a race condition (hard to reproduce reliably) or an environmental factor (works in staging, breaks in production).

Write down the exact steps to reproduce. This will be valuable for regression testing later.

### Step 2: Isolate

Which layer? Which agent? Which interaction?

Is it a single-agent failure (Layer 1)? Or an agent-to-agent issue (Layer 2)? Or an emergent system-level issue (Layer 3)?

Start by testing components in isolation:
- Run Agent A alone with the same inputs. Does it fail? If not, Agent A itself is probably fine.
- Run Agent B alone. Does it fail? If not, Agent B itself is probably fine.
- Run Agent A → Agent B (Agent A's output becomes Agent B's input). Does it fail? If yes, it's a Layer 2 problem.
- Run the full system. Does it fail? It's either a Layer 3 problem or a complex Layer 2 problem.

This binary search reduces your search space from "something in the system is broken" to "it's specifically Agent A + B interaction" or "it's a system-level issue like resource exhaustion."

### Step 3: Instrument

Add logging and tracing at the failure point.

You need visibility into what's happening at the exact moment things go wrong. Don't rely on existing logs. Add temporary, detailed logging: log every decision the agent makes, every input it receives, every output it sends, every intermediate state change.

Use tracing: record the full execution path and timing. Make sure you have request IDs so you can correlate logs across agents.

### Step 4: Hypothesise

What could cause this specific symptom?

Make a list of hypotheses ranked by likelihood. Prioritise by how common the cause is and how easy it is to check. Common causes first: prompt issue, input format issue, memory issue, timeout, dependency failure, race condition, configuration drift.

For a message that never arrives, likely causes are: network issue (easy to check), queue failure (check logs), agent not sending (check logs), agent not receiving (check logs), wrong destination (check code).

### Step 5: Test

Validate or reject each hypothesis systematically.

For each hypothesis, design a test that would confirm or refute it. Run the test. Log the result. Move to the next hypothesis. This is methodical and boring, but it works.

For "Agent B isn't receiving messages": check Agent A's logs. Is it sending? Check Agent B's logs. Is it receiving? Is there a queue? Check queue logs. Does the message arrive at the queue? Does it get delivered to Agent B?

This is where your instrumentation pays off. If you have good logging and tracing, you can look at the data and see which hypothesis holds up.

### Step 6: Fix and Verify

Fix the root cause, then run regression tests.

Once you've identified the issue, fix it. But don't just deploy and hope. Run the tests that would have caught this bug originally. Add a regression test to your test suite—a test that fails before the fix and passes after—so it doesn't happen again.

Commit the test with the fix. Document the bug in your incident report: what failed, why it failed, how it was fixed, and what you did to prevent it in the future.

---

## 10 Production War Stories

### Story 1: The Silent Message

**Symptom:** Agent B's responses started getting stale. It would answer questions based on old information, even though Agent A had sent updates.

**Initial hypothesis:** Agent A was sending messages, but Agent B wasn't receiving them.

**Actual root cause:** Agent A was sending messages to a queue. Agent B was reading from the queue. But Agent B had a memory cache that was being consulted first. The cache had a 10-minute TTL, but Agent B wasn't invalidating the cache when new messages arrived. So it would answer using cached data even though new messages were in the queue.

**Fix:** Implement cache invalidation. When Agent B detects a new message in the queue, clear the cache before processing.

**Lesson:** Caching is great for performance, but it's a source of bugs. Every cache needs explicit invalidation logic, or it needs a short TTL. Think through the whole path: queue → memory → cache. If any layer gets stale, you'll have issues.

### Story 2: The Timeout Cascade

**Symptom:** The system would hang intermittently. When it did, it would hang for exactly 30 seconds, then start working again.

**Initial hypothesis:** A timeout somewhere in the system, 30 seconds.

**Actual root cause:** Agent A calls Agent B with a 30-second timeout. If Agent B takes longer, Agent A times out and retries. But it doesn't back off. It retries immediately. If the system is overloaded, Agent B takes even longer. Agent A keeps retrying. The retries overload the system further. Agent B gets even slower. Eventually, the load drops enough that Agent B starts responding fast again, and the timeout is resolved.

**Fix:** Implement exponential backoff. First retry after 1 second. Then 2 seconds. Then 4 seconds. Also, implement a circuit breaker: if Agent B is failing consistently, stop calling it for 60 seconds.

**Lesson:** Don't just set a timeout and hope for the best. Think about what happens when the timeout triggers. A naive retry can make things worse, not better.

### Story 3: The Schema Sneak

**Symptom:** Agent B started crashing with "unexpected field" errors.

**Initial hypothesis:** Agent A changed its output format and didn't tell anyone.

**Actual root cause:** Agent A didn't change its format. But Agent C did. Agent C passes data to Agent B. Agent B was relying on Agent C's output format, not Agent A's. Someone updated Agent C to include an extra field. Agent B's schema validator rejected it.

**Fix:** Explicit schema contracts. Both agents agree on the schema. When the schema changes, both agents need to be updated together.

**Lesson:** In a multi-agent system, you can't assume you know the data flow. If Agent A talks to Agent B talks to Agent C, be aware that Agent B might be transforming the data in ways that matter downstream. Use strict schema validation at every step.

### Story 4: The Golden Hallucination

**Symptom:** Agent D was confidently providing incorrect information, and downstream users were acting on it.

**Initial hypothesis:** Agent D was hallucinating.

**Actual root cause:** Agent D wasn't hallucinating. It was repeating information that Agent C had given it. Agent C was hallucinating. Agent D had no way to know the information was wrong because it looked plausible and Agent C was confident.

**Fix:** Add a verification layer. Before Agent C provides information, require it to cite the source. If there's no source (it's relying on training data), flag it as uncertain. Have Agent D check sources before repeating.

**Lesson:** Errors propagate. If Agent C is wrong, Agent D will amplify it. You need verification and grounding at every step, not just at the boundaries.

### Story 5: The Race Condition

**Symptom:** Database records were getting corrupted. Sometimes fields would have values that shouldn't be possible.

**Initial hypothesis:** Someone's inserting bad data.

**Actual root cause:** Agents A and B were both updating the same record. Agent A reads the record (value = 10). Agent B reads the record (value = 10). Agent A increments and writes back (value = 11). Agent B increments and writes back (value = 11). But the value should be 12 if both increments had succeeded.

**Fix:** Optimistic locking. Add a version number. Agent A reads (value = 10, version = 5). Agent B reads (value = 10, version = 5). Agent A tries to write (value = 11, version = 6 where version = 5). Succeeds. Agent B tries to write (value = 11, version = 6 where version = 5). Fails because version doesn't match. Agent B retries.

**Lesson:** Read-modify-write on shared state is dangerous. You need synchronisation. Optimistic locking is simpler than pessimistic locking and often sufficient.

### Story 6: The Memory Leak

**Symptom:** The system would run fine for 12 hours, then memory usage would spike and the system would crash.

**Initial hypothesis:** Someone's allocating memory without releasing it.

**Actual root cause:** Agent A was caching summaries of conversations. When a conversation ended, the summary was supposed to be cleared from cache. But there was a code path where the conversation could end without triggering the cleanup. Over 12 hours, thousands of conversations would accumulate in cache, until memory was exhausted.

**Fix:** Add lifecycle hooks. When a conversation ends, ensure cleanup happens. Also add a background task that periodically clears old entries from cache (time-based eviction, not just event-based).

**Lesson:** Any resource that grows unboundedly (cache, queue, file handles) needs both explicit cleanup and automatic bounding. Set a max size. When you hit the limit, evict old entries.

### Story 7: The Configuration Ghost

**Symptom:** Agent A was behaving correctly in staging but incorrectly in production.

**Initial hypothesis:** Different data in production vs staging.

**Actual root cause:** Agent A was running with a different configuration in production. Someone had manually edited a config file on the production server to test something, forgot about it, and never reverted it. This config only existed on the production instance, not in version control.

**Fix:** Stop allowing manual edits to production configs. All configs in version control. Deployment verifies that the running config matches version control. If it doesn't, fail to start.

**Lesson:** Configuration management is tedious, but worth it. Configuration drift is one of the hardest bugs to track down because you're not looking at the code, you're looking at the configuration, which might not be in version control.

### Story 8: The API Ambush

**Symptom:** Agent B would occasionally fail with a 429 (rate limit) error.

**Initial hypothesis:** Unexpected traffic spike.

**Actual root cause:** Agent A was calling an external API, and it had retries implemented. When the API was briefly slow, Agent A would retry immediately. Multiple retries would hit the rate limit. The rate limit would cause even more retries. It was a feedback loop that made the problem worse.

**Fix:** Implement exponential backoff and jitter. Don't just retry immediately. Wait a bit longer each time. Add randomness so that multiple agents don't all retry at the same time.

**Lesson:** External dependencies are fragile. Even if you control your retry logic, you're still at the mercy of the external service's rate limits and behaviour. Implement defensive patterns.

### Story 9: The Phantom Message

**Symptom:** Agent B would receive the same message twice and process it twice, leading to duplicated work.

**Initial hypothesis:** Agent A is sending duplicate messages.

**Actual root cause:** Agent A sends a message. Agent B receives it and processes it. Agent B sends an acknowledgement back to Agent A. The acknowledgement gets lost. Agent A doesn't see the ack, so it retries. Agent B receives the retry and processes it again.

**Fix:** Implement idempotency. Give every message a unique ID. If Agent B receives a message with an ID it's already processed, return the cached result instead of reprocessing.

**Lesson:** In a distributed system, you can't guarantee message delivery. Assume messages might be lost or duplicated. Design agents to be idempotent: same input = same output, no matter how many times you call it.

### Story 10: The Emergent Chaos

**Symptom:** The system was producing outputs that made no sense. Not a crash, not an error, just wrong answers.

**Initial hypothesis:** One of the agents was broken.

**Actual root cause:** Each agent was working correctly. But the system had a feedback loop where agents were amplifying each other's uncertainties. Agent A would give a slightly uncertain answer. Agent B would read that and make a decision based on it. Agent C would read Agent B's output and treat it as more authoritative than it should be. By the time it looped back to Agent A, the uncertainty had been amplified into confidence in a wrong answer. All agents thought they were providing correct information, but the system was converging on a lie.

**Fix:** Redesign the interaction pattern to avoid amplifying uncertainty. Add explicit calibration: if an agent is uncertain, communicate that uncertainty downstream. Have downstream agents discount uncertain inputs. Break feedback loops or make them explicit and bounded.

**Lesson:** This is the hardest kind of failure to debug because nothing is technically broken. The system is doing what you told it to do. But the emergent behaviour is wrong. Prevention is better than cure: think through your agent interactions carefully before deploying them.

---

## Prevention Strategies: Debug 80% Less

These strategies won't eliminate debugging, but they can reduce the time you spend hunting bugs by an order of magnitude.

### 1. Contract Testing

Agents agree on schemas. Before each agent sends output, it validates against its own schema. Before it accepts input, it validates against its input schema.

Write a test that verifies Agent A's output schema matches Agent B's input schema. Include edge cases: empty inputs, maximum-sized inputs, malformed inputs, null fields, unexpected additional fields. If Agent A and Agent B have incompatible schemas, the test fails immediately. You don't deploy. You don't debug in production.

Tools like Pact (for microservices) can automate this. For multi-agent systems, you can build a schema registry: a central definition of all agent input and output schemas. Every agent validates against the registry at startup.

### 2. Integration Tests

Don't just test agents in isolation. Test them together.

Run Agent A + B in a test harness. Give them a set of inputs. Assert on the combined output. If the integration breaks, you find out before production. Include tests for:
- Normal operation (happy path)
- Agent A failures (how does B respond?)
- Agent B timeouts (does A retry? Does it give up?)
- Large inputs (do both agents handle scale?)
- Rapid-fire requests (do they handle concurrency correctly?)

Write these tests in your staging environment with the same infrastructure as production. A test that passes locally but fails in staging is telling you something about your environment assumptions.

### 3. Canary Deployments

Deploy changes to a small percentage of traffic first.

If you've updated Agent A, deploy it to 5% of traffic. Monitor key metrics: error rate, latency, output quality. If everything looks good for an hour, roll out to 25%. Then 100%. If something goes wrong at 5%, you've impacted a small group, caught the issue quickly, and can roll back without major damage.

Set up alerts that trigger automatically if canary metrics exceed thresholds. If error rate goes above 2% on canary, pause the rollout.

### 4. Automated Quality Checks

Every agent should have basic health checks running continuously.

Can it process a simple request? Can it handle edge cases? Does its output match the schema? Is latency within expected bounds? Run these checks every minute in production. When one fails, alert immediately. Log the failure with as much context as possible so you can debug it later.

Build a health check framework: a set of standard inputs that verify basic functionality. Add custom checks for your agents' specific responsibilities. Treat failing health checks as the highest-priority incidents.

### 5. Observability-First Architecture

Assume things will break. Build visibility in from day one.

Log every request with: request ID, timestamp, agent name, operation, inputs, outputs, latency, errors. Trace every message that passes between agents. Monitor resource usage: memory, CPU, network, API rate limits, token consumption. Profile performance: where's time being spent? Which operations are slow?

Don't add observability as an afterthought. When you design a new agent, design it with observability built in. Use structured logging (JSON, not plaintext). Use distributed tracing to see the full path of a request. Use metrics and dashboards to monitor system health.

When something breaks, you'll have the data to debug it in minutes instead of hours.

---

## Quick Reference: Symptom → Cause → Action

| Symptom | Likely Layer | Likely Cause | First Diagnostic Action |
|---------|-------------|--------------|------------------------|
| Agent's output is wrong | Layer 1 | Prompt regression, hallucination | Compare old and new prompts; ground-truth check against known facts |
| Agent not responding | Layer 1 | Context overflow, crash | Check input token count; check logs for errors |
| Message between agents lost | Layer 2 | Network issue, queue failure | Check logs on both agents for send and receive entries |
| Agent receives wrong format | Layer 2 | Schema mismatch | Validate both agents' schemas against each other |
| System hangs, then recovers | Layer 2/3 | Deadlock or timeout cascade | Check for circular agent dependencies; check retry logic |
| Memory usage grows over time | Layer 1/3 | Memory leak, unbounded cache | Check cache eviction logic; look for resources that aren't being cleaned up |
| Intermittent failures | Layer 3 | Resource exhaustion, race condition | Monitor resource usage; look for concurrent operations on shared state |
| System output is nonsensical | Layer 3 | Emergent misbehaviour, feedback loop amplification | Isolate each agent; test pairs; look for feedback loops |
| Different results in prod vs staging | Layer 3 | Configuration drift | Audit all configs; verify they match version control |
| System slows down with load | Layer 3 | Bottleneck, unbounded growth | Monitor resource usage; check for backpressure; look for O(n²) algorithms |

---

## Closing

Multi-agent debugging is harder than single-agent debugging, but it's not magic. You need a mental model (the three layers), a toolkit (logging, tracing, state snapshots), and a process (reproduce, isolate, instrument, hypothesise, test, fix).

The operators who debug fastest aren't the smartest. They're the ones with the best visibility into their systems. They've instrumented everywhere. They can replay failures. They can see the full interaction graph in their logs.

Invest in observability. Invest in prevention. When something breaks—and it will—you'll be glad you did.

---

## Cross-Links

- [The Agent Debugging Flowchart](HD-1006) — Visual decision tree for diagnosing agent failures
- [5 Multi-Agent Architectures Compared](HD-1003) — Different ways to structure agents and their implications for debugging
- [Agent Monitoring & Observability Stack](HD-1102) — Specific tools and patterns for logging, tracing, and monitoring
- [Stigmergic Coordination vs Centralised Routing](HD-1012) — How agent topology choices affect failure modes
- [How to Evaluate If Your Agent Is Actually Working](HD-1015) — Testing frameworks and quality gates for multi-agent systems
