# HD-5007: Agent Audit Log Specification

**Product ID:** HD-5007
**Price Tier:** Honey ($29)
**Version:** 1.0
**Last Updated:** 2026-03-10

---

## Purpose

This specification defines audit logging requirements for AI agent systems: log schema, required fields, action type taxonomy, retention, and alerting. Standard application logging does not capture what agents decided, why, what tools they used, what data they accessed, what they produced, and at what cost. This specification fills that gap with a structured, machine-readable format.

---

## 1. Log Schema

All agent audit log entries must conform to the following JSON schema. Every agent action produces exactly one log entry.

```json
{
  "log_version": "1.0",
  "timestamp": "2026-03-10T14:32:07.123Z",
  "agent_id": "agent-research-001",
  "agent_role": "specialist",
  "session_id": "sess-a1b2c3d4",
  "user_id": "usr-x9y8z7",
  "action_id": "act-f5e6d7c8",
  "parent_action_id": null,
  "action_type": "tool_use",
  "action_subtype": "web_search",
  "resource": "search-api/v2",
  "input_hash": "sha256:3a7bd3e2...",
  "output_hash": "sha256:9c4fe1a8...",
  "status": "success",
  "latency_ms": 1247,
  "token_count": {
    "input": 342,
    "output": 891,
    "total": 1233
  },
  "cost_usd": 0.0037,
  "tool_calls": [
    {
      "tool_name": "web_search",
      "parameters_hash": "sha256:b2c3d4e5...",
      "result_status": "success",
      "latency_ms": 1102
    }
  ],
  "error_details": null,
  "metadata": {
    "model": "gpt-4o-2026-02",
    "temperature": 0.7,
    "environment": "production"
  }
}
```

---

## 2. Required Fields

Every log entry must include the following fields. Missing required fields constitute a logging failure and should trigger an alert.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `log_version` | string | Schema version for forward compatibility | `"1.0"` |
| `timestamp` | string (ISO 8601) | UTC timestamp with millisecond precision | `"2026-03-10T14:32:07.123Z"` |
| `agent_id` | string | Unique identifier for the agent instance | `"agent-research-001"` |
| `agent_role` | string | Role of the agent (orchestrator, specialist, worker, read-only) | `"specialist"` |
| `session_id` | string | Identifier for the user session or task session | `"sess-a1b2c3d4"` |
| `user_id` | string | Identifier for the user who initiated the session (anonymised/pseudonymised) | `"usr-x9y8z7"` |
| `action_id` | string | Unique identifier for this specific action | `"act-f5e6d7c8"` |
| `action_type` | string | Category of action (see Action Type Taxonomy below) | `"tool_use"` |
| `resource` | string | The resource accessed or acted upon | `"search-api/v2"` |
| `input_hash` | string | SHA-256 hash of the input (not the input itself, for privacy) | `"sha256:3a7bd3e2..."` |
| `output_hash` | string | SHA-256 hash of the output (not the output itself, for privacy) | `"sha256:9c4fe1a8..."` |
| `status` | string | Outcome of the action: success, failure, timeout, denied | `"success"` |
| `latency_ms` | integer | Time taken to complete the action in milliseconds | `1247` |
| `token_count` | object | Token usage: input, output, total | `{"input": 342, "output": 891, "total": 1233}` |
| `cost_usd` | float | Estimated cost of this action in USD | `0.0037` |

### Why Hashes, Not Content

Inputs and outputs are hashed (not logged in full) for privacy — avoiding a second copy of sensitive data — and for verification — the hash confirms a specific input produced a specific output. Full content is retrieved from the primary data store using session ID and action ID when needed for investigation.

---

## 3. Optional Fields

These fields provide additional context and should be included when available.

| Field | Type | Description | When to Include |
|-------|------|-------------|-----------------|
| `parent_action_id` | string | Links this action to a parent action in multi-step workflows | When action is part of a chain (e.g., orchestrator delegates to specialist) |
| `action_subtype` | string | More specific classification within the action type | When the action type alone is insufficient (e.g., tool_use -> web_search) |
| `tool_calls` | array | Detailed record of tool invocations within this action | When the action involves tool use |
| `error_details` | object | Structured error information | When status is "failure" or "timeout" |
| `metadata` | object | Additional context: model version, temperature, environment, feature flags | Always recommended; required for production environments |
| `confidence_score` | float | Agent's self-reported confidence in its output (0.0-1.0) | When the agent system supports confidence scoring |
| `escalation_triggered` | boolean | Whether this action triggered an escalation to a human | When escalation logic is present |
| `data_classification` | string | Classification of the data accessed or produced | When data classification is implemented |
| `geographic_region` | string | Region where the action was processed | For data residency compliance |

### Error Details Schema

```json
{
  "error_code": "TOOL_TIMEOUT",
  "error_message": "Web search API did not respond within 10000ms",
  "error_category": "external_dependency",
  "retryable": true,
  "retry_count": 2
}
```

---

## 4. Action Type Taxonomy

Standardised action types enable consistent filtering and alerting.

| Action Type | Description | Typical Subtypes |
|------------|-------------|-----------------|
| `query` | Agent processes a user query or input | `user_query`, `system_query`, `follow_up` |
| `tool_use` | Agent invokes an external tool or API | `web_search`, `database_query`, `file_read`, `file_write`, `api_call`, `code_execution` |
| `memory_write` | Agent writes to its own or shared memory/context | `context_update`, `knowledge_store`, `preference_update`, `summary_store` |
| `memory_read` | Agent reads from memory or knowledge base | `context_retrieval`, `rag_query`, `preference_lookup` |
| `escalation` | Agent escalates to a human or higher-authority agent | `human_handoff`, `agent_escalation`, `confidence_escalation` |
| `delegation` | Orchestrator agent delegates task to another agent | `task_assignment`, `subtask_creation` |
| `response` | Agent produces a final response to the user | `text_response`, `structured_response`, `file_generation` |
| `error` | An error occurred during processing | `input_validation_error`, `tool_error`, `model_error`, `timeout`, `rate_limit` |
| `auth` | Authentication or authorisation event | `login`, `logout`, `permission_check`, `token_refresh`, `access_denied` |
| `system` | System-level events | `startup`, `shutdown`, `health_check`, `config_change`, `model_swap` |
| `moderation` | Content moderation or safety check | `input_filter`, `output_filter`, `policy_violation`, `pii_detection` |

---

## 5. Log Levels

| Level | When to Use | Retention | Alert? |
|-------|------------|-----------|--------|
| `CRITICAL` | System-wide failure, data breach, security incident | 3 years | Yes — immediate PagerDuty/on-call |
| `ERROR` | Action failed, tool call failed, unexpected exception | 1 year | Yes — engineering channel |
| `WARNING` | Degraded performance, approaching limits, retry required | 180 days | Threshold-based (>N per hour) |
| `INFO` | Normal operation, successful actions, standard events | 90 days | No |
| `DEBUG` | Detailed diagnostic information for troubleshooting | 7 days (staging), not logged in production | No |

### Log Level Selection Rules

- Every `action_type: error` entry must be at least `ERROR` level
- Every `status: denied` entry must be at least `WARNING` level
- Every `escalation_triggered: true` entry must be at least `INFO` level
- Cost overruns (action cost > 10x average) must be `WARNING`
- All `auth` actions must be at least `INFO` level
- `moderation` actions with `policy_violation` must be `WARNING` or above

---

## 6. Retention Requirements by Log Type

| Log Category | Retention Period | Storage Tier | Deletion Method |
|-------------|-----------------|-------------|-----------------|
| Security events (auth, access_denied, moderation) | 2 years | Hot (0-90 days), Warm (90-365 days), Cold (365-730 days) | Crypto-shred |
| Audit trail (all action types in production) | 1 year | Hot (0-30 days), Warm (30-180 days), Cold (180-365 days) | Secure delete |
| Performance metrics (latency, token counts, costs) | 1 year | Hot (0-30 days), Warm (30-365 days) | Standard delete |
| Error logs | 180 days | Hot (0-30 days), Warm (30-180 days) | Standard delete |
| Debug logs (staging only) | 7 days | Hot | Standard delete |
| Incident-related logs (under legal hold) | Duration of hold + 90 days | Immutable storage | Per legal counsel |

### Storage Tiers

| Tier | Access Latency | Cost | Use Case |
|------|---------------|------|----------|
| Hot | Milliseconds | High | Active investigation, real-time dashboards, alerting |
| Warm | Seconds to minutes | Medium | Compliance queries, periodic review, trend analysis |
| Cold | Minutes to hours | Low | Long-term retention, regulatory compliance, legal hold |

---

## 7. Search and Filter Patterns

Common investigation queries and the fields used to filter:

### 7.1 Common Investigation Patterns

| Investigation | Filter Fields | Example Query Logic |
|--------------|--------------|-------------------|
| What did a specific agent do? | `agent_id`, `timestamp` range | All actions by agent X in the last 24 hours |
| What happened in a specific session? | `session_id` | All actions with session_id = Y, ordered by timestamp |
| Why did an action fail? | `status: failure`, `error_details` | All failed actions in the last hour, grouped by error_category |
| Who accessed restricted data? | `data_classification: restricted`, `action_type: memory_read` | All restricted data reads, grouped by agent_id and user_id |
| What tools were used? | `action_type: tool_use`, `action_subtype` | Tool usage frequency by subtype over the last 7 days |
| Cost analysis | `cost_usd`, `agent_id`, `timestamp` | Total cost by agent by day for the last 30 days |
| Escalation analysis | `escalation_triggered: true` | All escalations, grouped by trigger reason |
| Authentication audit | `action_type: auth` | All auth events, focusing on access_denied |
| Multi-agent trace | `parent_action_id` chain | Reconstruct the full action chain from orchestrator to final response |
| Anomaly investigation | `token_count.total` > threshold, `latency_ms` > threshold | Actions that consumed unusually high tokens or took unusually long |

### 7.2 Index Recommendations

For efficient querying, create indices on:

| Index | Fields | Justification |
|-------|--------|---------------|
| Primary | `action_id` | Unique lookup |
| Session lookup | `session_id`, `timestamp` | Session reconstruction |
| Agent activity | `agent_id`, `timestamp` | Agent-level investigation |
| Error analysis | `status`, `timestamp`, `error_details.error_category` | Failure pattern analysis |
| Security audit | `action_type`, `status`, `timestamp` | Security event review |
| Cost tracking | `agent_id`, `cost_usd`, `timestamp` | Cost monitoring and attribution |
| User activity | `user_id`, `timestamp` | User-level audit (for data subject requests) |

---

## 8. Compliance Mapping

Which log fields satisfy which compliance requirements:

| Compliance Requirement | Relevant Fields | Regulation |
|-----------------------|-----------------|-----------|
| Who accessed what data, when | `user_id`, `agent_id`, `resource`, `timestamp`, `action_type` | GDPR Art. 30, SOC2 CC6, HIPAA |
| What processing was performed | `action_type`, `action_subtype`, `tool_calls` | GDPR Art. 30, SOC2 CC7 |
| Was access authorised | `status`, `action_type: auth` | SOC2 CC6, ISO 27001 |
| What was the outcome | `status`, `output_hash` | SOC2 CC7 (Processing Integrity) |
| Was personal data involved | `data_classification`, `resource` | GDPR Art. 30, CCPA |
| Cost and resource usage | `cost_usd`, `token_count`, `latency_ms` | Internal financial controls |
| Chain of custody | `action_id`, `parent_action_id`, `session_id` | Legal/eDiscovery |
| Error handling | `status`, `error_details`, `escalation_triggered` | SOC2 CC7, ISO 27001 |
| Change tracking | `action_type: system`, `metadata` | SOC2 CC8, ISO 27001 |

---

## 9. Log Aggregation Architecture

### Components

| Component | Responsibility | Examples |
|-----------|---------------|---------|
| **Log Producer** | Agent runtime emits structured log entries | Agent framework, application code |
| **Log Shipper** | Collects and forwards logs from producer to aggregator | Fluentd, Filebeat, Vector |
| **Log Aggregator** | Centralises logs, applies parsing and enrichment | Elasticsearch, Loki, Datadog |
| **Log Storage** | Stores logs across hot/warm/cold tiers | S3 (cold), Elasticsearch (hot/warm), object storage |
| **Query Interface** | Search, filter, and visualise logs | Kibana, Grafana, Datadog Log Explorer |
| **Alerting Engine** | Evaluates rules against log stream, triggers alerts | PagerDuty, Opsgenie, custom alerting |
| **Retention Manager** | Enforces retention policies, moves data between tiers, executes deletion | Index lifecycle management, custom cron jobs |

### Data Flow

```
Agent Runtime
  → Structured JSON log entry
    → Log Shipper (buffered, at-least-once delivery)
      → Log Aggregator (parsing, enrichment, indexing)
        → Hot Storage (real-time queries, dashboards, alerts)
          → Warm Storage (after 30 days)
            → Cold Storage (after 180 days)
              → Deletion (after retention period)
```

### Reliability Requirements

Target at-least-once delivery (no silently dropped entries), maximum 30-second lag from emission to queryability, 99.9% pipeline availability, daily snapshots to separate storage, and local buffering with replay on recovery if the aggregator is unavailable.

---

## 10. Alerting Rules

### 10.1 Security Alerts

| Alert Name | Condition | Severity | Action |
|-----------|-----------|----------|--------|
| Repeated auth failures | >5 `action_type: auth` with `status: denied` from same `agent_id` or `user_id` within 5 minutes | High | Notify security team, consider temporary lockout |
| Restricted data access | Any `data_classification: restricted` access outside approved roles | Critical | Immediate security team notification |
| Prompt injection indicator | `action_type: moderation` with `action_subtype: policy_violation` and input anomaly | High | Isolate session, notify security |
| Unusual tool usage | Agent uses a tool it has not used in the last 30 days, or tool call volume >5x baseline | Medium | Notify engineering for review |

### 10.2 Operational Alerts

| Alert Name | Condition | Severity | Action |
|-----------|-----------|----------|--------|
| Error rate spike | >5% of actions with `status: failure` in 5-minute window | High | Notify on-call engineer |
| Latency degradation | p95 `latency_ms` >3x 7-day baseline | Medium | Notify engineering channel |
| Cost anomaly | Hourly `cost_usd` sum >3x daily average | High | Notify on-call + finance |
| Token budget exceeded | `token_count.total` for single action >configured maximum | Medium | Log warning, consider circuit breaker |
| Log pipeline failure | No logs received from an agent for >5 minutes during expected operating hours | High | Investigate log shipper health |

### 10.3 Compliance Alerts

| Alert Name | Condition | Severity | Action |
|-----------|-----------|----------|--------|
| Missing required fields | Log entry missing any required field | Medium | Notify engineering, fix log producer |
| Retention policy violation | Data found in hot storage beyond retention threshold | Medium | Trigger retention manager, investigate |
| Unclassified data access | `data_classification` field is null for data access actions | Low | Notify data governance team |
| Deletion request overdue | Data subject deletion request not completed within 25 days | High | Escalate to DPO |

---

## 11. Example Log Entries

### 11.1 Successful User Query

```json
{
  "log_version": "1.0",
  "timestamp": "2026-03-10T09:15:22.456Z",
  "agent_id": "agent-assistant-prod-003",
  "agent_role": "specialist",
  "session_id": "sess-7k8m9n0p",
  "user_id": "usr-q1w2e3r4",
  "action_id": "act-t5y6u7i8",
  "parent_action_id": "act-o9p0a1s2",
  "action_type": "response",
  "action_subtype": "text_response",
  "resource": "user-session/sess-7k8m9n0p",
  "input_hash": "sha256:a1b2c3d4e5f6...",
  "output_hash": "sha256:g7h8i9j0k1l2...",
  "status": "success",
  "latency_ms": 2341,
  "token_count": {"input": 512, "output": 1024, "total": 1536},
  "cost_usd": 0.0046,
  "tool_calls": [],
  "error_details": null,
  "metadata": {"model": "claude-3.5-sonnet", "temperature": 0.3, "environment": "production"}
}
```

### 11.2 Escalation to Human

```json
{
  "log_version": "1.0",
  "timestamp": "2026-03-10T14:08:55.678Z",
  "agent_id": "agent-support-prod-002",
  "agent_role": "specialist",
  "session_id": "sess-w1x2y3z4",
  "user_id": "usr-a5b6c7d8",
  "action_id": "act-e9f0g1h2",
  "parent_action_id": null,
  "action_type": "escalation",
  "action_subtype": "human_handoff",
  "resource": "escalation-queue/tier-2-support",
  "input_hash": "sha256:i3j4k5l6m7n8...",
  "output_hash": "sha256:o9p0q1r2s3t4...",
  "status": "success",
  "latency_ms": 89,
  "token_count": {"input": 256, "output": 64, "total": 320},
  "cost_usd": 0.001,
  "tool_calls": [],
  "error_details": null,
  "escalation_triggered": true,
  "confidence_score": 0.23,
  "metadata": {
    "escalation_reason": "confidence_below_threshold",
    "confidence_threshold": 0.4,
    "topic_category": "billing_dispute",
    "environment": "production"
  }
}
```

---

DISCLAIMER: This is a template framework, not legal advice. Consult qualified legal counsel for your jurisdiction.

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
