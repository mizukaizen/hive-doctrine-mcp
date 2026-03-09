---
title: "MCP Server Configuration Guide — Cheat Sheet"
hive_doctrine_id: HD-1101
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-1101
full_product_price: 79
---

# MCP Server Configuration Guide — Cheat Sheet

## What It Is

MCP (Model Context Protocol) server from development to production. JSON-RPC 2.0 protocol, OAuth 2.1 auth, deployment, and monitoring essentials.

## Core Architecture

MCP uses JSON-RPC 2.0 over multiple transports:

```json
// Request
{"jsonrpc": "2.0", "id": "req-123", "method": "tools/call", "params": {"name": "search"}}

// Response
{"jsonrpc": "2.0", "id": "req-123", "result": {"content": [{"type": "text", "text": "..."}]}}
```

## 3 Core Capabilities

| Capability | Purpose | Example |
|-----------|---------|---------|
| **Tools** | Actions the model can invoke | Search, create record, send email |
| **Resources** | Data the model can read | Database records, file contents |
| **Prompts** | Pre-built prompt templates | Analysis templates, report formats |

## Transport Options

| Transport | Use Case |
|-----------|----------|
| **stdio** | Local development, CLI tools |
| **SSE (Server-Sent Events)** | Web-based, one-way streaming |
| **Streamable HTTP** | Production, bidirectional |

## Security: OAuth 2.1

- Use OAuth 2.1 for production auth (not API keys)
- Validate every request's access token
- Scope tokens to specific tools/resources
- Never log tokens or include them in error messages

## Production Checklist

### Input Validation
- [ ] Validate all tool parameters (type, range, length)
- [ ] Sanitise string inputs (prevent injection)
- [ ] Rate limit per client

### Error Handling
- [ ] Never expose stack traces to clients
- [ ] Return structured JSON-RPC errors with codes
- [ ] Implement circuit breakers for external dependencies

### Deployment
- [ ] Docker container with health check endpoint
- [ ] Graceful shutdown (finish in-flight requests)
- [ ] Environment variables for all configuration
- [ ] Secrets mounted read-only, never in image

### Monitoring
- [ ] Request latency (p50, p95, p99)
- [ ] Error rate by tool/resource
- [ ] Token usage and cost tracking
- [ ] Memory and CPU utilisation
- [ ] Alerting on error rate spikes

## Common Failure Modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Memory leak | Unbounded context accumulation | Set max request size, implement TTL |
| Cascading timeout | Slow external API | Circuit breaker + fallback |
| Auth failure | Token expiry | Auto-refresh, clear error messages |
| Silent data corruption | Missing input validation | Validate everything before processing |

---

*This is the condensed version. The full guide (HD-1101, $79) covers the complete MCP lifecycle with working code, OAuth 2.1 implementation, Docker/Kubernetes deployment, and production monitoring setup. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
