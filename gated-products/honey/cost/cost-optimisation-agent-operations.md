---
title: "Cost Optimisation for Agent Operations"
author: Melisia Archimedes
collection: C4 Infrastructure
tier: honey
price: 99
version: 1.0
last_updated: 2026-03-09
audience: agent_operators
hive_doctrine_id: HD-1103
sources_researched: [LLM pricing analysis, prompt caching documentation, model routing frameworks, production cost reports, batch API docs]
word_count: 6842
---

# Cost Optimisation for Agent Operations

Every dollar you save on inference is a dollar you can spend on building better agents. Most agent operators are bleeding 50-80% more than necessary on API calls—not because they're wasteful, but because they've never mapped where that money actually goes. This guide shows you exactly where, and how to stop.

## 1. The Cost Problem

When you deploy your first agent, you get a shock. You expected $10/day. You get a bill for $100/day. Or $1,000/day. You did the math: 100 requests at 5,000 tokens each, Claude 3.5 Sonnet at roughly $0.003 per 1K tokens—should be $1.50 total. But your bill is 50x higher.

This isn't accidental. It's structural.

The average production agent costs 10-100x more than operators estimate because almost nobody accounts for the *true operational cost* of a language model in a loop. Three things consume 80% of that overage:

1. **Retries and failure amplification** — A failed tool call doesn't just cost the failed call. It costs the context re-fed on the retry. A 2% failure rate translates to a 1.3x multiplier on total cost.

2. **Context bloat** — Your 500-token conversation becomes 8,000 tokens because you're carrying the full history of tool outputs, intermediate reasoning, and scaffolding. Multiply that across 20 turns, and you're paying for 160,000 tokens when 20,000 would suffice.

3. **Wrong model selection** — Running Claude 3.5 Sonnet for a classification task that Claude 3 Haiku could solve for 1/10th the cost. Or routing every request to your most capable model because it's easier than building a classifier.

There are also hidden costs that most operators never quantify: embedding overhead for retrieval, duplicate tool calls because you didn't cache results, token waste in verbose prompts, and cascade failures where one mistake triggers a chain of retries.

The operators who've nailed cost efficiency don't have special access to cheaper APIs. They've built systems that treat every token like a production metric. They know exactly what each agent costs per task, per day, per month. They've mapped where the money flows and where the leaks are.

That's what this guide does.

---

## 2. The Cost Formula

To optimise cost, you first need to see it clearly. Most operators only see the API bill. That's not where the cost actually is.

### The Visible Cost

```
Visible Cost = (Input Tokens + Output Tokens) × Model Price
```

For a request to Claude 3.5 Sonnet:
- Input: 5,000 tokens @ $0.003 per 1K = $0.015
- Output: 1,000 tokens @ $0.015 per 1K = $0.015
- **Visible Cost: $0.03**

That's what shows up on your invoice. But it's not what you actually pay.

### The Real Cost (With Multipliers)

```
Real Cost = Visible Cost × (1 + Retry Multiplier) × (1 + Context Multiplier) × (1 + Tool Overhead)
```

Let's work through a realistic agent:

**Base cost:** $0.03 (as above)

**Retry multiplier (+30%):** Your agent fails on 2-3% of requests. Each failure burns the context again on retry. That's 1.3x the cost.
- $0.03 × 1.3 = $0.039

**Context overhead (+15%):** Your 5,000-token input includes old conversation history that isn't strictly needed. You could compress it to 4,250 tokens.
- $0.039 × 1.15 = $0.044

**Tool calls and embeddings (+40%):** Before sending the request, you searched a vector database (200 tokens), called a retrieval tool (100 tokens), and evaluated tool results (150 tokens). That's 450 tokens of overhead.
- $0.044 + (450 tokens × $0.003/1K) = $0.044 + $0.0013 = $0.0456

**Actual cost: $0.046 per request—50% higher than the "visible" $0.03.**

Now multiply that across your operations:

- 1,000 requests/day = $46/day (vs. the $30 you budgeted)
- 100,000 requests/day = $4,600/day (vs. the $3,000 you thought)
- 1M requests/day = $46,000/day

The gap grows. In real production systems, the true cost is 2-3x the visible API cost once you account for retries, context overhead, tool integration, and orchestration overhead.

The operators who've cut costs by 50-80% do it by attacking these multipliers, not by negotiating better API pricing.

---

## 3. Prompt Caching: The Highest-ROI Lever

Prompt caching is the single highest-return optimisation available to agent operators. It's also the most universally applicable.

### How It Works

Both Anthropic and OpenAI now offer prompt caching: the ability to mark sections of your prompt as stable and cache them server-side. On the first request, you pay 25% more for those tokens (the "cache write cost"). On every subsequent request, you pay 10% of the normal price for those tokens (the "cache read cost").

**The math:**
- Normal token cost: 100 credits per 1K tokens
- Cache write cost: 125 credits per 1K tokens (+25%)
- Cache read cost: 10 credits per 1K tokens (-90%)

If your system prompt is 2,000 tokens and you make 100 requests:

Without caching:
- 100 requests × 2,000 tokens × 100 credits = 20,000,000 credits

With caching:
- First request: 2,000 tokens × 125 credits = 250,000 credits
- Remaining 99 requests: 99 × 2,000 × 10 = 1,980,000 credits
- **Total: 2,230,000 credits (89% savings)**

After 20 requests, the overhead of the cache write cost is recovered. Every request after that is pure savings.

### What to Cache

Not everything should be cached—only the parts of your prompts that are:
1. Stable across multiple requests
2. Large enough to matter
3. Accessed repeatedly

**System prompts and instructions** (500-2,000 tokens): These don't change per request. Cache them.

```
System Prompt (cached):
You are an agent that classifies customer support tickets...
[1,500 tokens of detailed instructions]

Current Task (not cached):
Classify this ticket: "My subscription won't renew..."
```

**Few-shot examples** (500-5,000 tokens): If you're using the same examples across requests, cache them. Change the task, not the examples.

```
Examples (cached):
Ticket: "Billing issue..."
Classification: billing

Ticket: "Can't login..."
Classification: technical

[50 more examples]

Current ticket to classify (not cached):
"My account won't..."
```

**Tool definitions and schemas** (200-1,000 tokens): Your tools don't change per request.

```
Tool Definitions (cached):
- search_kb: Search the knowledge base...
- create_ticket: Create a support ticket...
- escalate: Escalate to human...

Current tool use (not cached):
The agent decides which tool to call
```

**Reference data** (1,000-10,000+ tokens): If you're passing the same company policies, product docs, or reference material across requests, cache it.

```
Reference Data (cached):
Our refund policy: ...
[Product documentation: 5,000 tokens]

Current context (not cached):
This customer is asking about...
```

### Implementation Pattern

Here's what a cached agent looks like in code:

```python
import anthropic

client = anthropic.Anthropic()

# These don't change per request
SYSTEM_PROMPT = "You are a support agent..."  # 500 tokens
EXAMPLES = "Example 1: ...\nExample 2: ..."    # 1,000 tokens
TOOLS = "Tools: search_kb(...), create_ticket(...)"  # 200 tokens

# This changes per request
def process_support_ticket(ticket_text):
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"}  # Mark for caching
            },
            {
                "type": "text",
                "text": EXAMPLES,
                "cache_control": {"type": "ephemeral"}
            },
            {
                "type": "text",
                "text": TOOLS,
                "cache_control": {"type": "ephemeral"}
            }
        ],
        messages=[
            {
                "role": "user",
                "content": f"Process this ticket:\n{ticket_text}"
            }
        ]
    )
    return response.content[0].text
```

The first request to `process_support_ticket()` pays the cache write cost. Requests 2-∞ read from the cache. If you're running 1,000+ requests/day with this pattern, you save 85%+ on system/examples/tools costs.

### Real-World Impact

A customer support agent processing 10,000 tickets/month with:
- System prompt: 800 tokens
- Examples: 2,000 tokens
- Tool definitions: 300 tokens
- **Total cached: 3,100 tokens**

Cost without caching:
- 10,000 requests × 3,100 tokens × $0.003/1K = $93/month (just the cached portion)

Cost with caching:
- Cache write (1 request): 3,100 × $0.00375 = $0.0116
- Cache read (9,999 requests): 9,999 × 3,100 × $0.0003 = $9.30
- **Total: $9.31/month (90% savings on cached tokens)**

If your full request is 5,000 tokens and 3,100 are cached, you save ~$84/month on that agent alone. Scale to 10 agents and you're at $840/month in pure savings.

---

## 4. Model Routing: Matching Task Complexity to Model Cost

The second-biggest cost lever is running the right model for each task. Most operators route everything to their most capable model because it's simpler. That's like using a truck to deliver a letter.

### The Tiered Approach

LLM pricing scales dramatically with capability:

| Model | Input Cost | Output Cost | Best For | Relative Cost |
|-------|-----------|-----------|----------|---------------|
| Claude 3 Haiku | $0.80/1M | $4/1M | Classification, routing, simple extraction | 1x (baseline) |
| Claude 3.5 Sonnet | $3/1M | $15/1M | Complex reasoning, multi-step tasks | 3.75x |
| Claude 3 Opus | $15/1M | $75/1M | Research synthesis, strategic planning | 18.75x |

A routing system routes tasks to the cheapest model capable of solving them:

```
Simple tasks (60% of requests):
  Classification, extraction, validation
  → Claude 3 Haiku (cost: 1x)

Medium tasks (30% of requests):
  Summarization, light reasoning, content generation
  → Claude 3.5 Sonnet (cost: 3.75x)

Complex tasks (10% of requests):
  Multi-step reasoning, strategy, deep analysis
  → Claude 3 Opus (cost: 18.75x)
```

This distribution cuts costs by 50-70% compared to routing everything to Sonnet.

### Building a Routing Classifier

The trick is estimating task complexity without running the expensive model first. You build a lightweight classifier using Haiku (cheap) to route to Sonnet or Opus (expensive).

```python
def classify_complexity(task_description):
    """Cheap pass: estimate complexity with Haiku."""
    response = client.messages.create(
        model="claude-3-haiku-20250305",
        max_tokens=10,
        messages=[
            {
                "role": "user",
                "content": f"""Rate this task's complexity (simple/medium/complex):

Task: {task_description}

Respond with ONLY one word: simple, medium, or complex."""
            }
        ]
    )
    complexity = response.content[0].text.strip().lower()
    return complexity

def route_task(task_description, task_input):
    """Route to appropriate model based on complexity."""
    complexity = classify_complexity(task_description)

    if complexity == "simple":
        model = "claude-3-haiku-20250305"
    elif complexity == "medium":
        model = "claude-3-5-sonnet-20241022"
    else:
        model = "claude-3-opus-20250219"

    response = client.messages.create(
        model=model,
        max_tokens=1000,
        messages=[
            {
                "role": "user",
                "content": task_input
            }
        ]
    )
    return response.content[0].text
```

For 10,000 requests/day (60% simple, 30% medium, 10% complex):

Without routing:
- 10,000 × 3.75x cost = 37,500 relative cost units

With routing:
- 6,000 simple × 1x = 6,000
- 3,000 medium × 3.75x = 11,250
- 1,000 complex × 18.75x = 18,750
- **Total: 36,000 (4% savings)**

But that's conservative. With good routing accuracy, you shift more tasks to Haiku:

- 7,000 simple × 1x = 7,000
- 2,500 medium × 3.75x = 9,375
- 500 complex × 18.75x = 9,375
- **Total: 25,750 (31% savings)**

The cost of the routing call (Haiku is $0.80/1M tokens) is recovered after 2-3 task classifications.

### Cascade Routing: Try Cheap First, Escalate on Failure

An even more aggressive approach: try the cheap model first. If it fails, escalate.

```python
def cascade_route(task_description, task_input):
    """Try Haiku, escalate to Sonnet if needed."""

    # Try cheap model first
    cheap_response = client.messages.create(
        model="claude-3-haiku-20250305",
        max_tokens=500,
        messages=[{"role": "user", "content": task_input}]
    )
    cheap_result = cheap_response.content[0].text

    # Check if result is credible (simple heuristic)
    if is_credible(cheap_result):
        return cheap_result

    # Escalate to expensive model
    expensive_response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        messages=[{"role": "user", "content": task_input}]
    )
    return expensive_response.content[0].text

def is_credible(result):
    """Simple check: does the result look complete?"""
    return len(result) > 50 and result.count('\n') > 1
```

If 90% of tasks are handled by Haiku and only 10% escalate:

Cost = (0.9 × 1x) + (0.1 × 3.75x) = **1.375x** (63% savings vs. running everything on Sonnet)

---

## 5. Context Window Management: Compression Over Expansion

The longer your conversation runs, the more context you carry. After 20 turns, you're feeding the model 10,000+ tokens of history when 1,000 would suffice.

### The Problem

A typical agent conversation:

```
Turn 1: "Search for X"
  → Token count: 500

Turn 2: "Here's the result. Analyse it."
  → Context: Turn 1 + Result (2,000 tokens)
  → New tokens: 500
  → Total: 2,500

Turn 3: "Summarize the analysis"
  → Context: Turns 1-2 + Results (5,000 tokens)
  → New tokens: 500
  → Total: 5,500

Turn 20: ...
  → Context: All previous turns and results (50,000 tokens)
  → New tokens: 500
  → Total: 50,500
```

You're paying for 50,000 tokens of redundant history when you could pay for 5,000 tokens of compressed history.

### Sliding Window Strategy

Keep only the last N turns:

```python
def sliding_window_context(conversation_history, window_size=5):
    """Keep only the most recent N turns."""
    return conversation_history[-window_size:]
```

This cuts context by 40-60% with minimal accuracy loss. You lose historical context, but agents rarely need turn 3 when they're on turn 20.

### Summarization-Based Compression

Better: every 5 turns, summarise everything so far and drop the original turns.

```python
def compress_conversation(conversation_history, summary_interval=5):
    """Summarise old turns, keep recent ones."""
    if len(conversation_history) < summary_interval:
        return conversation_history

    old_turns = conversation_history[:-summary_interval]
    recent_turns = conversation_history[-summary_interval:]

    # Summarise everything old
    summary = client.messages.create(
        model="claude-3-haiku-20250305",  # Use cheap model
        max_tokens=200,
        messages=[
            {
                "role": "user",
                "content": f"""Summarise this conversation in 2-3 sentences:\n\n{old_turns}"""
            }
        ]
    )

    # Return compressed history
    compressed = [{"role": "assistant", "content": summary.content[0].text}]
    return compressed + recent_turns
```

This saves 50-70% of context tokens while keeping recent interactions intact. The summarisation cost (cheap Haiku) is recovered after 2-3 conversations.

### Selective Context Injection

Only include context that's relevant to the current task:

```python
def selective_context(full_history, current_task):
    """Include only historically relevant turns."""

    # Find turns related to current task topic
    relevant_turns = []
    for turn in full_history:
        if any(keyword in turn.lower() for keyword in extract_keywords(current_task)):
            relevant_turns.append(turn)

    # Add last 3 turns regardless (recent context)
    relevant_turns.extend(full_history[-3:])

    return relevant_turns
```

Combines window sizing with semantic relevance. Can reduce context by 30-50% without losing important information.

### Real-World Impact

A multi-turn agent processing support tickets:

Without optimisation:
- 20 turns × average 2,500 tokens/turn = 50,000 tokens
- Cost per conversation: 50,000 × $0.003/1K = $0.15

With sliding window (keep 5 turns):
- 5 turns × 2,500 = 12,500 tokens
- Cost: $0.0375 (75% reduction)

With compression (summarise every 5 turns):
- 5 recent turns (2,500 tokens) + 1 summary (200 tokens) = 2,700 tokens
- Cost: $0.0081 (95% reduction)

Scale: 1,000 conversations/day × $0.07 savings = **$70/day, $2,100/month** on just one agent.

---

## 6. Batch Processing: Trade Speed for Cost

When you need 50%+ savings and latency isn't critical, use batch APIs.

Most providers (Anthropic, OpenAI) offer batch endpoints: submit 100-10,000 requests at once, get processed overnight, 50% discount.

```python
import json
from anthropic import Anthropic

client = Anthropic()

# Prepare batch
requests = []
for ticket_id, ticket_text in tickets:
    requests.append({
        "custom_id": ticket_id,
        "params": {
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": 500,
            "messages": [{"role": "user", "content": ticket_text}]
        }
    })

# Submit batch
batch = client.beta.messages.batches.create(requests=requests)
print(f"Batch ID: {batch.id}")

# Poll for results (takes minutes to hours)
import time
while True:
    batch_status = client.beta.messages.batches.retrieve(batch.id)
    if batch_status.processing_status == "ended":
        break
    time.sleep(30)

# Process results
results = client.beta.messages.batches.results(batch.id)
for result in results:
    print(f"Ticket {result.custom_id}: {result.result.message.content[0].text}")
```

**When to batch:**
- Nightly report generation
- Daily bulk classification
- Weekly data processing
- Anything with >100 items and <24 hour deadline

**When not to batch:**
- Real-time chat (users waiting for response)
- Live agent interactions
- Anything requiring <5 minute latency

For a support team processing 5,000 tickets/night:

Standard API:
- 5,000 requests × 3,000 tokens × $0.003/1K = $45/night

Batch API:
- 5,000 requests × 3,000 tokens × $0.0015/1K = $22.50/night
- **Annual savings: $4,095**

---

## 7. Caching Strategies Beyond Prompts

Prompt caching handles your instructions. But you can cache results too.

### Semantic Caching

If you ask "What's the weather in Sydney?" and later ask "Weather in Sydney?", the second should use the cached result of the first. But cache keys are usually exact-match, so they miss this.

Semantic caching hashes the meaning, not the words:

```python
from sentence_transformers import SentenceTransformer
import hashlib

model = SentenceTransformer('all-MiniLM-L6-v2')

def semantic_cache_key(query):
    """Create a cache key based on query meaning."""
    embedding = model.encode(query)
    # Round to 2 decimals to allow fuzzy matching
    rounded = [round(x, 2) for x in embedding]
    return hashlib.md5(str(rounded).encode()).hexdigest()

cache = {}

def query_with_semantic_cache(query):
    key = semantic_cache_key(query)

    if key in cache:
        return cache[key]  # Hit: use cached result

    # Miss: call API
    result = expensive_api_call(query)
    cache[key] = result
    return result
```

This catches ~20-30% more cache hits than exact-match caching.

### Tool Result Caching

Before you call an API again, check if you already have the result:

```python
import hashlib
import json

tool_cache = {}

def call_tool(tool_name, tool_args):
    # Create cache key from tool + args
    cache_key = hashlib.md5(
        json.dumps({"tool": tool_name, "args": tool_args}).encode()
    ).hexdigest()

    if cache_key in tool_cache:
        return tool_cache[cache_key]  # Cached

    # Call tool
    result = execute_tool(tool_name, tool_args)
    tool_cache[cache_key] = result
    return result
```

Typical savings: 20-40% reduction in tool calls (the same query is asked multiple times, or by different agents).

### Embedding Caching

Computing embeddings is expensive (often 20-50% of your agentic cost in retrieval systems). Cache them:

```python
import pickle

embedding_cache = {}

def get_embedding(text):
    if text in embedding_cache:
        return embedding_cache[text]

    embedding = embedding_model.encode(text)
    embedding_cache[text] = embedding
    return embedding

# Persist cache to disk (load on startup)
import shelve
cache_db = shelve.open('embedding_cache.db')

def get_embedding_persistent(text):
    if text in cache_db:
        return pickle.loads(cache_db[text])

    embedding = embedding_model.encode(text)
    cache_db[text] = pickle.dumps(embedding)
    return embedding
```

For a retrieval system with 10,000 documents queried 100 times/day:

Without caching:
- 10,000 documents × 100 queries = 1M embeddings/day

With caching:
- 10,000 embeddings (computed once) + repeated lookups = 10k lookups
- **Cost: 1% of unbuffered cost**

---

## 8. Monitoring and Budget Controls

You can't optimise what you don't measure. Build cost visibility into your agents:

```python
import json
from datetime import datetime

def log_cost(agent_id, task_id, model, input_tokens, output_tokens, cost):
    """Log every API call with cost attribution."""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "agent_id": agent_id,
        "task_id": task_id,
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost": cost
    }
    with open(f"costs/{agent_id}.jsonl", "a") as f:
        f.write(json.dumps(log_entry) + "\n")

# Query cost data
def agent_daily_cost(agent_id, date):
    """Get today's cost for an agent."""
    total = 0
    with open(f"costs/{agent_id}.jsonl") as f:
        for line in f:
            entry = json.loads(line)
            if entry["timestamp"].startswith(date):
                total += entry["cost"]
    return total

# Set budget limits
DAILY_BUDGETS = {
    "support_agent": 50,  # $50/day
    "research_agent": 100,
    "routing_agent": 10
}

def check_budget(agent_id, cost):
    """Stop agent if it exceeds daily budget."""
    today = datetime.now().strftime("%Y-%m-%d")
    daily_cost = agent_daily_cost(agent_id, today)

    if daily_cost + cost > DAILY_BUDGETS[agent_id]:
        raise Exception(f"Budget exceeded for {agent_id}")

    return True
```

Set up daily cost dashboards. Watch for:
- Agents with cost >2x expected
- New peaks in per-request cost
- Retries above 1-2%
- Model usage shifting to more expensive models unexpectedly

---

## 9. The 80/20 of Cost Reduction

Most cost savings come from three things. Do these in order:

**Week 1: Model Routing (saves 40-50%)**
Build a Haiku-based complexity classifier. Route simple tasks to Haiku, medium to Sonnet, complex to Opus. This is the biggest single lever. One engineer, 2-3 days.

**Week 2: Prompt Caching (saves 20-30% additional)**
Mark your system prompt, examples, and tool definitions for caching. Trivial to implement, immediate gains.

**Week 3-4: Context Management (saves 15-25% additional)**
Implement sliding window compression. Summarise old turns. Keep conversations pruned.

**Month 2: Tool and Embedding Caching (saves 10-20% additional)**
Cache tool results and embeddings. Lower priority because gains are smaller, but easy to add.

**Batch Processing: Use when deadline allows (saves 50% on batchable work)**
Not always applicable, but when it is, it's a straight 50% discount.

If you implement all five, you'll cut costs by 65-75%. Most operators do weeks 1-2 and stop, landing at 60%.

The difference between "we reduced costs by 50%" and "we reduced costs by 75%" is often just one more week of work.

---

## Implementation Checklist

- [ ] Audit current cost per task (establish baseline)
- [ ] Build Haiku-based complexity classifier for routing
- [ ] Deploy model routing system
- [ ] Identify stable prompt sections and mark for caching
- [ ] Enable prompt caching in Anthropic SDK
- [ ] Implement sliding window context management
- [ ] Set up cost logging by agent
- [ ] Configure daily budget alerts
- [ ] Build cost dashboard
- [ ] Identify batch-processable workloads
- [ ] Document per-agent costs and optimisations

---

## Cross-Links

- **Pollen Cost Calculator** — Calculate real cost per task including all multipliers
- **Pollen Model Selection Guide** — Detailed capability matrix for routing decisions
- **Honey Monitoring Stack** — Real-time cost tracking and anomaly detection
- **Pollen Prompt Caching Deep Dive** — Implementation patterns for specific frameworks

---

## Summary

Every dollar saved on inference is a dollar you can spend on building better agents. The operators who've cut costs by 50-80% aren't smarter—they're systematic. They measure every token. They route to the cheapest capable model. They cache relentlessly. They compress context.

Start with model routing. Add caching next. From there, the smaller optimisations stack.

By the time you've done weeks 1-4, you'll know your true cost per task. You'll have visibility into where the money goes. You'll have the levers to pull when budgets tighten.

That's agent cost optimisation.
