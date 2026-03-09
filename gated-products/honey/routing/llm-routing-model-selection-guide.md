---
title: "LLM Routing & Model Selection Guide"
author: Melisia Archimedes
collection: C4 Infrastructure
tier: honey
price: 79
version: 1.0
last_updated: 2026-03-09
audience: agent_operators
hive_doctrine_id: HD-1104
sources_researched: [RouteLLM framework, LMSYS research, model benchmarks, production routing implementations, cascade routing papers]
word_count: 5847
---

# LLM Routing & Model Selection Guide

## 1. Why Model Routing Matters

Every agent system faces the same problem: you have a portfolio of models with vastly different capabilities and costs, and you need to decide which model handles which task. Get this wrong, and you're either bleeding money on expensive models for simple queries, or degrading quality by defaulting to cheap models for complex reasoning.

The economics are stark. Research from LMSYS and production agent operators consistently shows that **70-80% of agent tasks don't require your most capable model**. Most classification, retrieval, and formatting work is trivial from a reasoning perspective. But without intelligent routing, teams default to one of two patterns: either they overprovision by always using their most capable model (Claude Opus, GPT-4o, or Gemini 2.5 Pro), or they underprovision by always using the cheapest option and accept degraded quality.

Smart routing solves both problems. A well-designed routing system can achieve **50-70% cost reductions** while maintaining or improving quality across your agent workloads. This isn't about being cheap—it's about fitting the tool to the task.

Consider a typical agent system handling customer support. A query like "What's our return policy?" is a simple retrieval and formatting task. Routing this to Opus costs 150x more than routing it to Haiku, and Haiku will handle it perfectly. But a query like "Our customer says the product damaged their workspace. They want us to cover replacement of a $50k installation. What's our liability exposure?" is a complex reasoning task requiring nuance, precedent analysis, and judgment. Here, Opus earns its cost through better decision quality.

The opportunity cost of poor routing is enormous. Over 100k agent queries per month, the difference between smart routing and default-to-expensive is $200k-$400k. And the difference between smart routing and default-to-cheap is 15-25% quality degradation on high-stakes outputs.

This guide gives you the frameworks, implementation patterns, and monitoring approaches to build routing systems that actually work in production. We'll cover strategy, architecture, and the practicals of tuning confidence thresholds and handling model quirks.

## 2. The Model Landscape

To route intelligently, you need to understand what you're routing between. The LLM market in 2026 is fragmented but structured around clear capability and cost tiers.

### Claude Family (Anthropic)

**Claude Opus 4.6** is the reasoning heavyweight. 200k context, superior complex reasoning, instruction following, and agentic behavior. Structured output handling is clean. Tool use is reliable. Best for: strategy tasks, complex reasoning, customer escalations, multi-step research, novel problem solving. Cost: $15/1M input tokens, $60/1M output tokens. Benchmark: 94th percentile on LMSYS Arena.

**Claude Sonnet 4.5** is the workhorse. 200k context, strong reasoning, excellent for general-purpose agent work. About 15% cheaper than Opus, with 85-90% of the reasoning capability. Best for: core agent loops, research, writing, synthesis. Cost: $3/1M input, $15/1M output. Benchmark: 88th percentile Arena.

**Claude Haiku 4** is the efficiency play. 200k context, genuinely competent at simple classification, formatting, retrieval tasks. Much faster. Best for: routing decisions themselves, simple triage, structured data extraction, content filtering. Cost: $0.80/1M input, $4/1M output. Benchmark: 75th percentile Arena, but perfectly adequate for most lightweight tasks.

### GPT Family (OpenAI)

**GPT-4o** is feature-rich for vision and tool-dense workflows. 128k context, excellent multimodal reasoning, strong on vision tasks agents need to handle. Structured output (JSON mode) is reliable. Best for: multimodal agent work, vision-heavy tasks, tool-calling agents. Cost: $5/1M input, $15/1M output. Benchmark: 91st percentile Arena.

**GPT-4o Mini** is the lightweight responder. Genuinely capable for most agent tasks despite the "mini" label. 128k context. Best for: most routing decisions, simple agentic work, cost-sensitive applications. Cost: $0.15/1M input, $0.60/1M output. Benchmark: 78th percentile Arena.

**GPT-o3** (preview, 2026) focuses on reasoning depth for complex multi-step problems. Expensive. Best for: hard reasoning tasks, complex planning, strategy. Cost variable, typically 3-5x GPT-4o. Benchmark: 96th percentile Arena (reasoning benchmarks).

### Gemini Family (Google)

**Gemini 2.5 Pro** offers the largest practical context window (1M tokens) and good multimodal handling. Best for: long document analysis, multi-source research, context-heavy agent tasks. Cost: $1.25/1M input, $5/1M output. Benchmark: 87th percentile Arena.

**Gemini 2.5 Flash** is fast and surprisingly capable. 1M context window. Best for: speed-critical agent work, cascade routing first-pass. Cost: $0.075/1M input, $0.30/1M output. Benchmark: 73rd percentile Arena.

### Open Source (Self-Hosted)

**Llama 3.1 (405B)** and **Mistral Large v2** and **Qwen 2.5 (72B)** are viable if you self-host. Economics only work at scale (100k+ monthly queries). Deployment adds engineering burden but gives you model control and inference latency predictability. Best for: large-scale operations where inference cost dominates, regulatory constraints requiring on-prem models.

### Cost Comparison Table

| Model | Input Cost (/1M) | Output Cost (/1M) | Reasoning | Speed | Multimodal | Context | Best For |
|-------|------------------|------------------|-----------|-------|-----------|---------|----------|
| Opus 4.6 | $15 | $60 | ⭐⭐⭐⭐⭐ | ⭐⭐ | No | 200k | Complex reasoning, escalations |
| Sonnet 4.5 | $3 | $15 | ⭐⭐⭐⭐ | ⭐⭐⭐ | No | 200k | Agent core loops, general work |
| Haiku 4 | $0.80 | $4 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | No | 200k | Classification, routing, simple tasks |
| GPT-4o | $5 | $15 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 128k | Multimodal, vision, tools |
| GPT-4o Mini | $0.15 | $0.60 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | 128k | Lightweight routing, simple tasks |
| o3 (preview) | variable | variable | ⭐⭐⭐⭐⭐ | ⭐ | No | 128k | Hard reasoning, strategy |
| Gemini 2.5 Pro | $1.25 | $5 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 1M | Long-context analysis, research |
| Gemini 2.5 Flash | $0.075 | $0.30 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 1M | Speed-critical work, first-pass |

**The key insight:** There's no universally "best" model. Your model landscape is a spectrum. Opus handles 5-10% of queries (hard reasoning, escalations). Sonnet handles 30-40% (core agent work). Haiku and Mini handle 50-70% (simple classification, retrieval, formatting). You route by fitting the right model to task complexity.

## 3. Routing Strategies

Routing decisions happen in milliseconds and must be reliable at scale. Here are the main patterns used in production agent systems.

### Simple Task-Type Routing

The crudest approach: map task types to models directly.

```
if task_type == "classification":
    model = "haiku"
elif task_type == "retrieval":
    model = "haiku"
elif task_type == "formatting":
    model = "haiku"
elif task_type == "synthesis":
    model = "sonnet"
elif task_type == "complex_reasoning":
    model = "opus"
elif task_type == "escalation":
    model = "opus"
```

This works better than you'd think, especially early on. It requires you to classify the incoming task (a lightweight step) and then apply rules. The problem: task types overlap messily. Is "synthesize competitor research with risk analysis" a synthesis task or reasoning task? Are "create executive summary of 50-page document" and "summarize customer sentiment from 200 support tickets" equivalent difficulty?

**Use simple task routing** when you have high confidence in your taxonomy and relatively homogeneous workloads. It's easy to understand and maintain. But it will eventually hit limits.

### Complexity-Based Routing

More sophisticated: estimate the difficulty of the query itself, and route based on that difficulty.

The idea: run the incoming query through a lightweight complexity classifier. This classifier asks: "How hard is this task?" and returns a score (0-100, or categorical). Then map complexity ranges to models.

```
complexity = estimate_complexity(query)

if complexity < 20:
    model = "haiku"  # trivial tasks
elif complexity < 40:
    model = "haiku or mini"  # simple tasks
elif complexity < 60:
    model = "sonnet"  # moderate tasks
elif complexity < 80:
    model = "sonnet or opus"  # hard tasks
else:
    model = "opus"  # very hard tasks
```

What features does your classifier look at? Query length, presence of reasoning keywords ("analyze," "explain," "compare"), mention of multiple sources, temporal complexity (past/future/conditional reasoning), domain specialization (legal/medical/technical), explicit requests for justification.

A logistic regression model trained on your own task difficulty labels can be startlingly effective. Or use a simple heuristic: if the query contains more than 3 of {multi-step reasoning, source synthesis, domain expertise, temporal logic, novel application}, route to Sonnet or Opus.

**Complexity routing catches the case simple task-type routing misses:** a synthesis task can be trivial (summarize one article) or hard (integrate 50 sources into a strategy doc). Complexity routing distinguishes them.

### Cascade Routing

The most production-proven pattern: try cheap first, escalate if the model reports uncertainty.

```
1. Send query to haiku
2. Haiku completes the task and returns a confidence score (e.g., "I'm 92% confident")
3. If confidence >= threshold (e.g., 85%):
     Return haiku's response
4. Else if confidence < threshold:
     Re-route to sonnet
5. Sonnet returns response (with confidence)
6. If confidence >= threshold:
     Return sonnet's response
7. Else:
     Escalate to opus
```

The advantage of cascade routing: you save money on the 70-80% of queries that Haiku can handle well, but you don't sacrifice quality on hard queries because you escalate automatically.

The mechanism: how does the model report confidence? Some approaches:

- **Explicit confidence tokens:** Train the model to output a `[CONFIDENCE: 85]` token at the end. This works but requires fine-tuning or prompt engineering.
- **Uncertainty in reasoning:** Parse the model's output. Does it say "I'm not sure" or "this is ambiguous"? Escalate. Does it say "this is straightforward" or "clearly"? Keep it.
- **Semantic similarity fallback:** Compare the model's response to likely correct answers (from a validation set). Low similarity = low confidence = escalate.
- **Token probability analysis:** Check the model's token probabilities on key decision points. Low probability = low confidence = escalate.

**Cascade routing works best** when escalation is cheap relative to the cost of getting it wrong. In most agent systems, this is true: paying 3x more to escalate a query is cheaper than returning a bad response and having the user re-query or escalate themselves.

### Semantic Routing

Use embeddings to route. Embed the query, then:

1. Embed a library of task types or difficulty levels.
2. Find the nearest neighbors (semantic similarity).
3. Route to the model associated with those neighbors.

This is most useful when you have a corpus of historical tasks labeled with which model handled them well. You can train a classifier: given a query embedding, predict the optimal model.

Practically: this is overkill unless you have 10k+ labeled examples. For most agent systems, simpler approaches work.

### Confidence-Based Fallback

Some modern models (Claude Sonnet and newer) can report internal confidence and suggest escalation. If a model detects that it's uncertain, it flags the query for escalation before you even run it.

```
response = call_model(query, model="sonnet")

if response.contains_escalation_flag():
    response = call_model(query, model="opus")
    return response
else:
    return response
```

This is lightweight and works well for models that support it.

## 4. Building a Router

A production routing system has these components:

**Intake → Classifier → Model Pool → Output → Quality Check → Feedback**

### Architecture

```
INPUT (agent query)
  ↓
CLASSIFIER (estimate complexity or task type)
  ↓
ROUTING DECISION (select model)
  ↓
MODEL POOL (call selected model)
  ↓
OUTPUT (return response)
  ↓
QUALITY CHECK (did this work?)
  ↓
FEEDBACK LOOP (improve routing for next time)
```

The classifier is lightweight and runs on every query. It must be fast (< 100ms) and accurate enough to distinguish complexity buckets. The model pool is abstracted: you can swap models without changing routing logic.

### The Classifier: Building It

Your classifier estimates task difficulty (or maps to task type). Here's a practical approach:

**Step 1: Gather labeled data.** Run 500-1000 agent queries through your most capable model (Opus). For each query and response, manually label the difficulty (1-5 scale: trivial, simple, moderate, hard, very hard) and note which model would have been sufficient.

```
Query: "What's the return policy?"
Response: "Our return policy is..."
Difficulty: 1 (trivial)
Sufficient Model: Haiku

Query: "A customer says our product caused $50k in facility damage. Our legal team isn't available. What's the risk exposure and what should I tell the customer?"
Response: "This is a high-risk escalation..."
Difficulty: 5 (very hard)
Sufficient Model: Opus
```

**Step 2: Extract features** from each query. Length, keyword presence, source count, reasoning cues:

```python
def extract_features(query):
    return {
        "length": len(query.split()),
        "has_multiple_sources": "compare" in query.lower() or "versus" in query,
        "has_reasoning_keywords": any(kw in query.lower() for kw in ["analyze", "explain", "why", "impact", "implications"]),
        "has_temporal_logic": any(kw in query.lower() for kw in ["will", "could", "future", "past", "before", "after"]),
        "has_domain_term": any(kw in query.lower() for kw in domain_keywords),
        "asks_for_justification": any(kw in query.lower() for kw in ["why", "explain", "justify"]),
    }
```

**Step 3: Train a simple classifier.** A logistic regression or random forest on these features. Sklearn is sufficient.

```python
from sklearn.ensemble import RandomForestClassifier

X = [extract_features(q) for q in queries]
y = [difficulty_labels[q] for q in queries]

classifier = RandomForestClassifier(n_estimators=100, max_depth=10)
classifier.fit(X, y)
```

**Step 4: Validate.** Test on held-out queries. Aim for 80%+ accuracy in distinguishing "trivial" from "hard" (the key decision). Exact difficulty levels matter less.

In practice, you don't need ML sophistication here. A decision tree with 3-5 rules often works as well as a forest:

```
if length < 50 words and not has_reasoning_keywords:
    difficulty = "trivial"
elif length < 200 and has_multiple_sources and has_reasoning_keywords:
    difficulty = "moderate"
elif length > 300 or has_domain_term or asks_for_justification:
    difficulty = "hard"
else:
    difficulty = "simple"
```

### Threshold Tuning

Once you have a classifier, you need to decide: at what complexity threshold do I upgrade from Haiku to Sonnet? From Sonnet to Opus?

This is a cost-quality optimization. Here's how to tune it:

**Step 1: Establish your quality baseline.** Run 100 test queries through Opus and rate the quality (1-5). This is your quality ceiling.

**Step 2: Run the same 100 queries through your routing system.** Measure:
- Percentage routed to each model
- Quality of responses from each model
- Cost

**Step 3: Move the thresholds.** If you're routing 80% to Haiku and quality is 4.2/5, try moving the threshold to route more to Sonnet. If you're routing 20% to Opus and quality is 4.9/5, try moving the threshold down.

**Step 4: Find the Pareto frontier.** Plot cost vs quality for different threshold settings. Choose the threshold that gives you the best quality for acceptable cost, or the lowest cost for acceptable quality.

### A/B Testing Routing Decisions

In production, you can A/B test routing strategies:

- 50% of queries go through routing strategy A (complexity-based).
- 50% of queries go through routing strategy B (simple task-type).
- Measure quality and cost for each.
- Roll out the winner.

This catches cases where your routing logic doesn't match reality.

## 5. Production Implementation

### RouteLLM Framework

RouteLLM is an open-source framework (from MIT-CSAIL and LMSYS) designed specifically for this. It provides:

- A lightweight router that estimates query complexity without calling a model.
- Cascade routing pipeline.
- Integration with multiple model APIs.

Basic usage:

```python
from routellm.router import RouteEngine

router = RouteEngine(
    simple_model="gpt-4o-mini",
    complex_model="gpt-4o",
    threshold=0.5,  # if complexity > 0.5, use complex model
)

response = router.route(query)
```

RouteLLM's router is a lightweight classifier trained on thousands of real queries. It's fast and reasonably accurate out of the box.

### OpenRouter and LiteLLM

If you don't want to build your own router, **OpenRouter** and **LiteLLM** are reverse-proxy services that handle routing for you.

**OpenRouter** lets you specify a routing strategy (round-robin, lowest-latency, cheapest) and it auto-selects from a pool of models. You pay OpenRouter's markup on top of the model provider's cost.

**LiteLLM** is a library that abstracts model APIs behind a single interface and supports fallback routing:

```python
from litellm import completion

response = completion(
    model="gpt-4-turbo",
    fallback_models=["gpt-3.5-turbo", "claude-opus"],
    messages=[...],
)
```

If GPT-4-turbo fails, LiteLLM automatically retries with GPT-3.5-turbo, then Opus.

### Custom Router with Fallback Chains

For most agent operators, a custom router is practical and lightweight:

```python
class AgentRouter:
    def __init__(self):
        self.classifier = load_trained_classifier()
        self.models = {
            "cheap": "haiku",
            "medium": "sonnet",
            "expensive": "opus",
        }

    def route(self, query):
        complexity = self.classifier.predict(query)

        if complexity < 0.3:
            model = self.models["cheap"]
        elif complexity < 0.7:
            model = self.models["medium"]
        else:
            model = self.models["expensive"]

        response = call_model(model, query)

        # Cascade: if response is uncertain, escalate
        if response.confidence < 0.8 and model != "opus":
            response = call_model("opus", query)

        return response
```

### Handling Model-Specific Quirks

Different models have different APIs and behaviors. Your router needs to normalize:

**Tool calling:** Claude uses `tool_use` blocks. GPT uses `function_calls`. Your router should abstract this:

```python
def normalize_tool_calls(response, model):
    if model.startswith("gpt"):
        return response.choices[0].message.tool_calls
    elif model.startswith("claude"):
        return [block for block in response.content if block.type == "tool_use"]
```

**Structured output:** Claude uses `json_mode` in the system prompt. GPT uses `response_format`. Your router should handle both.

**Context windows:** Gemini has 1M tokens. Claude/GPT have 200k/128k. If you're routing long documents, check context limits before routing.

**Token limits:** Know the output token limits for each model. Some have hard caps (GPT-4 vision: 4k output tokens max).

## 6. Quality Assurance

Routing systems degrade silently. Your cheap model might be subtly worse at a particular task type without you noticing. Here's how to catch it:

### Monitoring Quality Across Routing Decisions

Instrument every routed query:

```python
result = {
    "query": query,
    "routed_model": model,
    "response": response,
    "confidence": extracted_confidence,
    "quality_score": None,  # filled by evaluation
    "timestamp": now(),
}

log_to_database(result)
```

Every day, sample 100 routed queries and rate their quality (1-5 scale). Track quality by model:

```
Haiku quality (last 7 days): 4.1/5 (n=500)
Sonnet quality (last 7 days): 4.6/5 (n=300)
Opus quality (last 7 days): 4.8/5 (n=50)
```

If Haiku quality drops below your threshold (e.g., 3.8/5), something is wrong. The model might have changed, your task mix might have shifted, or your classifier might have degraded.

### Regression Detection

Set up automated alerts:

```
if model_quality[model] < baseline - 0.3:
    alert("Quality regression detected for {model}")
```

This catches problems before they accumulate.

### Feedback Loops

Use outcomes to improve your routing. If a query routed to Haiku was later escalated to Opus, that's a data point: your classifier underestimated difficulty. Log it and retrain your classifier periodically.

```python
if escalated:
    log_misroute(query, routed_model, escalated_model)

# Weekly, retrain classifier on all logged misroutes
if day == "monday":
    new_classifier = train_classifier(training_data + misroutes)
    replace_classifier(new_classifier)
```

## 7. Cost-Quality Optimisation

The goal of routing is to find the Pareto frontier: the set of decisions that maximize quality per dollar spent.

### Mapping the Frontier

Run your test set through different threshold settings:

```
Threshold | Cheap % | Medium % | Expensive % | Quality | Cost/query
0.3       | 85      | 10       | 5          | 4.0/5   | $0.008
0.5       | 70      | 20       | 10         | 4.3/5   | $0.012
0.7       | 50      | 35       | 15         | 4.6/5   | $0.018
0.85      | 30      | 40       | 30         | 4.8/5   | $0.035
1.0       | 5       | 20       | 75         | 4.9/5   | $0.050
```

The Pareto frontier is the set where you can't improve quality without increasing cost (or vice versa). In this example, thresholds 0.5, 0.7, and 0.85 are on the frontier. Threshold 0.3 is not (0.5 gives better quality at similar cost).

### Finding Your Sweet Spot

Where to operate on the frontier depends on your business model:

- **Cost-sensitive** (e.g., high-volume support): optimize for cost. Operate at threshold 0.5-0.7. Accept 4.3-4.6 quality.
- **Quality-sensitive** (e.g., executive briefings): optimize for quality. Operate at threshold 0.85. Pay 3-4x more per query.
- **Balanced** (e.g., most agent systems): operate at 0.7. Quality of 4.6 is excellent; cost is reasonable.

### When to Upgrade Thresholds

Once you're live, monitor whether your operating point is still optimal:

- **If quality drops and cost stays same:** your task mix has shifted toward harder tasks. Move threshold up slightly.
- **If cost increases and quality stays same:** inflation in model pricing. Reoptimize.
- **If a new cheaper model releases:** retest your cheap tier. You might improve quality while cutting cost.

A quarterly re-optimization is reasonable. Don't do it too often (noise in quality measurements), but often enough to track real changes.

---

## Conclusion

Model routing is the single highest-ROI optimization for agent systems operating at scale. Getting it right saves 50-70% on inference costs while improving quality. The frameworks and patterns described here—cascade routing, complexity classification, Pareto optimization—are proven in production across hundreds of agent systems.

Start simple: task-type routing. Validate that it works. Then iterate to complexity-based routing or cascade routing. Instrument heavily. Use feedback loops to improve. And check your Pareto frontier quarterly.

The best routing strategy for your system depends on your task mix and your tolerance for cost vs. quality tradeoffs. But all good routing strategies share the same principle: **put the right model on the right task, and measure the outcome.**

### Cross-Links

- **Pollen tier:** Model selection heuristics for specific agent architectures
- **Honey tier:** Cost optimisation monitoring stack; cascade routing implementation patterns
- **Nectar tier:** Custom fine-tuned routing models for proprietary task domains

---

*Melisia Archimedes, March 2026. Routing isn't about being cheap. It's about putting the right model on the right task.*
