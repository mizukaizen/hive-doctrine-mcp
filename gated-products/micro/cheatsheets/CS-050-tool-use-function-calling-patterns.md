---
title: "Tool Use & Function Calling Patterns — Cheat Sheet"
hive_doctrine_id: HD-1109
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-1109
full_product_price: 79
---

# Tool Use & Function Calling Patterns — Cheat Sheet

## What It Is

Production patterns for giving AI agents access to tools. Covers tool definition, execution, error handling, and advanced patterns.

## Tool Definition Best Practices

```json
{
  "name": "search_database",
  "description": "Search the customer database by name or email. Returns max 10 results.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {"type": "string", "description": "Search term (name or email)"},
      "limit": {"type": "integer", "default": 10, "maximum": 50}
    },
    "required": ["query"]
  }
}
```

**Rules for good tool definitions:**
1. **Name:** verb_noun format (`search_database`, `create_record`)
2. **Description:** what it does + constraints + what it returns
3. **Parameters:** typed, with descriptions, defaults, and constraints
4. **Required vs optional:** only mark truly required fields as required

## Execution Patterns

### Simple (One Tool, One Call)
Agent calls tool → gets result → generates response.

### Sequential (Chain of Tools)
Agent calls tool A → uses result to call tool B → generates response.

### Parallel (Multiple Independent Tools)
Agent calls tools A, B, C simultaneously → combines results → generates response.

### Conditional (Tool Based on Context)
Agent evaluates context → decides which tool to call → calls it.

## Error Handling

| Error Type | Response to Agent | Action |
|-----------|-------------------|--------|
| Invalid input | "Parameter X must be a string" | Agent retries with correct input |
| Rate limited | "Rate limit exceeded. Retry after 30s" | Agent waits and retries |
| Not found | "No results for query X" | Agent adjusts query or informs user |
| Server error | "Tool temporarily unavailable" | Agent uses fallback or informs user |
| Timeout | "Request timed out after 30s" | Agent retries once, then falls back |

**Rule:** Never return raw error messages to the agent. Always return structured, actionable error descriptions.

## Advanced Patterns

### Tool Composition
Combine simple tools into complex workflows:
```
get_customer → get_orders(customer_id) → calculate_ltv(orders)
```

### Dynamic Tool Registration
Add/remove tools based on context (user permissions, active integrations).

### Tool Use Guardrails
- **Max tool calls per request:** 10 (prevent infinite loops)
- **Timeout per tool call:** 30 seconds
- **Cost tracking:** log cost of each tool call
- **Approval gate:** require human approval for destructive tools (delete, send email)

## Anti-Patterns

1. **Too many tools** — 50+ tools confuse the model. Keep under 20.
2. **Vague descriptions** — "Does stuff with data" helps nobody
3. **No error handling** — raw exceptions leak information
4. **No rate limiting** — agent can spam expensive APIs

---

*This is the condensed version. The full guide (HD-1109, $79) covers the complete tool use patterns with production code, error handling strategies, and advanced patterns like dynamic registration. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
