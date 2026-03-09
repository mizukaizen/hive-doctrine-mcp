---
title: "xAI X Proxy Pattern — Cheat Sheet"
hive_doctrine_id: HD-0088
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0088
full_product_price: 29
---

# xAI X Proxy Pattern — Cheat Sheet

## What It Is

A 3-step pattern for routing agent social media requests through LLM provider APIs to bypass datacenter IP blocks. When agents can't access X/Twitter directly, use xAI's Grok API as a proxy.

## The Problem

Datacenter IPs are blocked by X/Twitter. Your agent can't:
- Read tweets
- Search X
- Access user profiles

Direct HTTP requests return 403 or captcha challenges.

## The 3-Step Pattern

### Step 1: URL Reader Script

```python
import json
import urllib.request

def read_url_via_xai(url, api_key):
    """Route URL reading through xAI's Grok API"""
    payload = {
        "model": "grok-2",
        "messages": [
            {"role": "user", "content": f"Read and summarise this URL: {url}"}
        ]
    }
    req = urllib.request.Request(
        "https://api.x.ai/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["choices"][0]["message"]["content"]
```

### Step 2: Search Script

```python
def search_x_via_xai(query, api_key):
    """Search X/Twitter through xAI's live search capability"""
    payload = {
        "model": "grok-2",
        "messages": [
            {"role": "user", "content": f"Search X/Twitter for: {query}. Return the top 10 recent results with usernames and tweet text."}
        ]
    }
    # Same request pattern as Step 1
```

### Step 3: Agent Routing Table

```yaml
routing:
  x_twitter:
    method: xai_proxy
    api: "https://api.x.ai/v1/chat/completions"
    model: grok-2
    fallback: tavily_search
  reddit:
    method: tavily_search
    scope: "site:reddit.com"
  general_web:
    method: tavily_search
```

## Key Rules

1. **API key in environment variable** — never hardcode
2. **Rate limit awareness** — xAI API has rate limits; cache results
3. **Fallback to Tavily** — if xAI fails, use Tavily with `site:twitter.com` scoping
4. **Results are summaries, not raw data** — the LLM interprets the content

## When to Use

- Agent needs X/Twitter data from a datacenter IP
- Direct scraping is blocked
- You have an xAI API key

---

*This is the condensed version. The full guide (HD-0088, $29) covers the complete proxy pattern with both Python scripts, agent routing table template, and fallback strategies. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
