---
title: "Dynamic Council Thread Routing — Ad-Hoc Multi-Agent Collaboration Architecture"
author: Melisia Archimedes
collection: C4-infrastructure
tier: honey
price: 79
version: 1.0
last_updated: 2026-03-09
audience: agent-builders
hive_doctrine_id: HD-0022
---

# Dynamic Council Thread Routing

## Executive Summary

You've built a multi-agent system where each agent owns a static discussion channel. Now your agents need to collaborate on ad-hoc topics—summoning each other into temporary group conversations without cross-persona bleed, dropped messages, or routing dead zones.

This architecture solves that. It's a five-part pattern: create thread → register → hot-reload config → post opening → invoke and respond. The key insight is that each agent needs its own bot token for your messaging platform, and the routing system must update before the thread becomes visible. Zero downtime. No gateway restarts. Agents talk to each other through direct CLI invocation, not platform messaging (which blocks bot-to-bot communication anyway).

This is production-tested and generalises across any multi-bot system using a messaging platform with forum-like thread support and a config-watch runtime.

---

## The Problem

You're running multiple AI agents, each with their own bot identity, operating in a shared messaging workspace. You've set up static routing: Agent Alpha owns Channel 2, Agent Bravo owns Channel 4, etc. Each agent has explicit instructions: "If a message comes from channels 5 or 8, output NO_REPLY."

Now a user asks a question that needs input from both Agent Alpha and Agent Bravo. You want to dynamically create a temporary group discussion—a council thread—where both agents can collaborate. The user posts a question, Agent Alpha responds, then Agent Bravo, then back to Alpha. Just like a real meeting.

The naive approach: create the thread, add routing for it, restart the gateway, post the opening message. But this creates a window where the user's first reply lands in the thread before routing is live. The message gets dropped or routed to the wrong agent. Or you restart the gateway and lose state mid-execution. Or you assume you can trigger Agent Bravo by having Agent Alpha @mention them in the messaging platform—which doesn't work, because bots can't message each other directly.

You end up with threading that looks like:

```
User: "I need Alpha and Bravo's take on this strategy"
[thread created but routing unknown]
User: "Here's the context..." ← DROPPED or misrouted
[gateway restarts, 15s downtime]
Alpha: [finally responds]
Bravo: [never invited, doesn't know thread exists]
```

This pattern breaks every fundamental principle of reliable systems design: define service boundaries first, then publish endpoints. Don't publish an endpoint and hope routing catches up.

---

## The Solution: Five-Part Architecture

The core insight: register the thread in your routing config *before* anyone can send a message to it. Then invoke agents directly via CLI—skip the messaging platform entirely for agent-to-agent signalling.

```
                 ┌──────────────────────────────────┐
                 │  council-summon.sh execution     │
                 └──────────────────────────────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
      Step 0: Create         Step 0b: Write         Step 0c: Patch
      thread via           thread registry         routing config
      target's bot         (YAML/JSON)             → hot-reload ~30ms
           │                      │                      │
           └──────────────────────┴──────────────────────┘
                                  │
                            sleep 2 seconds
                    ← routing now live, no dead zone →
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
      Step 1: Post            Step 2: Invoke         Step 3: Post
      opening message         target agent          agent response
      (initiator's bot)       (direct CLI call)     (target's bot)
```

**Step 0: Create Thread via Target's Bot**

The target agent's bot token creates the thread. This is crucial. If the initiator creates it, the messaging platform may treat the target's first message as a response-to-service-message, triggering unintended routing logic or mention spam.

```bash
THREAD_ID=$(curl -s -X POST https://api.messaging-platform.example/threads \
  -H "Authorization: Bearer ${TARGET_BOT_TOKEN}" \
  -d "name=${TOPIC_NAME}&type=forum" | jq -r '.id')
```

**Step 0b: Write Thread Registry**

Append to a persistent registry (JSON, YAML, or SQLite—your choice). This serves three purposes:

1. **Auditability**: Know which agent initiated which council thread, when, on what topic
2. **Recovery**: If your routing config is ever reset or lost, rebuild it from the registry
3. **Monitoring**: Query threads created in the last hour, threads with no responses, threads by initiator

```json
[
  {
    "thread_id": 1047,
    "owner": "Agent Bravo",
    "initiator": "Agent Alpha",
    "topic_name": "🎯 Product prioritisation Q2",
    "question": "Which feature should we ship first?",
    "context": "We have three candidates with similar demand signals...",
    "created_at": "2026-03-09T14:22:33Z",
    "created_by_session_id": "council-1047-1741597353"
  }
]
```

**Step 0c: Patch Routing Config**

Update your gateway's routing configuration to include the new thread ID. This is typically a JSON or YAML file that maps thread IDs to agent routing rules.

```python
import json

with open('/path/to/routing-config.json', 'r') as f:
    config = json.load(f)

# Add new thread to the routing table
config['messaging']['threads'][str(THREAD_ID)] = {
    'agents': ['Agent Alpha', 'Agent Bravo'],
    'policy': 'open',
    'created_at': datetime.utcnow().isoformat()
}

with open('/path/to/routing-config.json', 'w') as f:
    json.dump(config, f, indent=2)
```

This write triggers a file-watch event in your gateway. Modern systems (Caddy, Traefik, custom gateways, etc.) watch config files for changes and reload without restarting—typically in 30–50ms. No downtime.

**Step 0c Detail: Why Hot-Reload Matters**

The original hypothesis was: "We'll need to restart the gateway for new routing to take effect." Testing revealed the actual behaviour: the gateway watches the config file. The moment the JSON is written, a reload fires automatically.

```
[2026-03-09T14:22:40.544Z] config change detected (threads.1047)
[2026-03-09T14:22:40.552Z] restarting messaging channel
[2026-03-09T14:22:40.573Z] hot-reload applied (threads.1047 now live)
```

The 2-second sleep is buffer time for the file-watch event to fire and settle. Without it, there's a 1–5% chance the opening message posts before the reload is complete.

**Step 1: Post Opening Message**

Sleep 2 seconds. Then post the opening message using the *initiator's* bot token. This establishes the message thread history clearly: the initiator kicked off the council.

```bash
sleep 2

curl -s -X POST "https://api.messaging-platform.example/threads/${THREAD_ID}/messages" \
  -H "Authorization: Bearer ${INITIATOR_BOT_TOKEN}" \
  -d "text=${OPENING_MESSAGE}"
```

**Step 2: Invoke Target Agent**

Invoke the target agent directly via your agent runtime's CLI. Don't try to @mention them in the thread—bots cannot receive messages from other bots. Instead, call the agent with a prompt containing the thread ID, the opening message, and any context.

```bash
AGENT_RESPONSE=$(agent-cli invoke \
  --agent-key "Agent Bravo" \
  --session-id "council-${THREAD_ID}-$(date +%s)" \
  --timeout 90 \
  --prompt "Thread ID: ${THREAD_ID}. User question: ${QUESTION}. Context: ${CONTEXT}. Reply in plain text only." \
  2>/dev/null)
```

The agent generates a text response. The CLI is the bridge between the agent runtime and the messaging platform.

**Step 3: Post Agent Response**

Strip markdown from the agent's response, then post it to the thread using the *agent's* bot token.

```bash
# Strip markdown: **bold** → bold, ## headers → headers, etc.
CLEAN_TEXT=$(echo "${AGENT_RESPONSE}" | sed \
  -e 's/\*\*//g' \
  -e 's/__//g' \
  -e 's/^## //' \
  -e 's/^### //' \
  -e '/^---$/d')

curl -s -X POST "https://api.messaging-platform.example/threads/${THREAD_ID}/messages" \
  -H "Authorization: Bearer ${TARGET_BOT_TOKEN}" \
  -d "text=${CLEAN_TEXT}"
```

The response appears to come from the target agent's identity—because it does, technically. The script is just the messenger.

---

## Key Insights

### Insight 1: Thread Creation Authority

Use the *target* agent's bot to create the thread. The target posts the response. The initiator posts the opening.

**Why:** Messaging platforms treat the thread creator as implicitly "mentioned" in all replies. If the initiator creates it, the target's bot sees every reply as directed @target, flooding its inbox.

### Insight 2: CLI as Bridge, Not Messaging

You cannot send a message from one bot to another bot in any modern messaging platform. Slack doesn't allow it. Discord doesn't. Telegram doesn't. Instead, invoke the agent directly via CLI with the context you need. The agent generates text. The script posts it.

This inverts the problem: instead of "how do I trigger an agent via messaging?", you ask "how do I invoke an agent with text input?" The answer is always CLI, SDK, or HTTP API—not messaging.

### Insight 3: Hot-Reload Over Restart

Many practitioners assume: "update config file → restart service → wait 15 seconds → proceed". This is outdated. Modern gateways (Caddy, Traefik, nginx with module reload) watch config files. Writing the file triggers a reload in 30–50ms, no downtime.

**Before building restart logic, verify your gateway supports hot-reload.** Test: update the config, check logs for "reload detected" or similar. If it's there, you don't need restart logic. If it's not, add a restart step.

### Insight 4: Never Docker from Inside the Container

If your summon script runs as an agent skill (inside the gateway container), you cannot execute `docker` commands. The `docker` CLI is not in the container's PATH. Any attempt to `docker restart` or `docker exec` will fail silently (if error handling isn't set to `set -euo pipefail`) or kill the script mid-execution.

Symptoms: thread created, but no messages appear. The container boundary is the hard boundary.

**Rule**: never issue docker commands from agent skills. If you need container operations, trigger them from a host-side cron job, webhook listener, or signal file that a host daemon watches.

### Insight 5: NO_REPLY for Cross-Agent Isolation

Each agent needs explicit routing rules. In their system prompt, tell them:

> "If you receive a message from threads 5, 8, or 12 (Agent Alpha's home threads), output exactly: NO_REPLY. Do not reply to messages in those threads. Council threads (dynamic IDs starting with 9xxx) are *always* fair game."

This prevents accidental cross-talk when agents are in the same workspace but shouldn't respond to each other's static topics.

### Insight 6: Markdown Stripping at Post Time

Agents generate markdown: `**bold**`, `## Headers`, `---` dividers. Your messaging platform may or may not render it. Rather than fighting the agent to produce "the right format", strip it at post time:

```bash
# Remove **bold**, __italic__, # headers, --- dividers
text=$(echo "$text" | sed \
  -e 's/\*\*\([^*]*\)\*\*/\1/g' \
  -e 's/__\([^_]*\)__/\1/g' \
  -e 's/^#\+ //' \
  -e '/^---$/d' \
  -e '/^$/N;/^\n$/!P;D')  # collapse blank lines
```

Cleaner, more reliable, and the agent doesn't need to know about platform specifics.

---

## Implementation Template

### Script Signature

```bash
council-summon.sh \
  <initiator_name> \
  <target_agent> \
  <topic_name> \
  <question> \
  [context] \
  [initiator_take] \
  [initiator_agent_key]
```

### Example Usage

```bash
./council-summon.sh \
  "Agent Alpha" \
  "Agent Bravo" \
  "🎯 Q2 Prioritisation" \
  "Which feature should we ship first?" \
  "We have three candidates with similar demand signals. Alpha thinks feature 1 has higher user impact. Bravo is concerned about technical debt." \
  "I lean toward feature 3, but happy to hear both perspectives." \
  "Alpha"
```

### Function Signature (Pseudocode)

```bash
function summon_council {
  local initiator_name="$1"
  local target_agent="$2"
  local topic_name="$3"
  local question="$4"
  local context="${5:-}"
  local initiator_take="${6:-}"
  local initiator_key="${7:-kv}"

  # Load bot tokens
  load_bot_tokens

  # Step 0: Create thread
  THREAD_ID=$(create_thread_via_target_bot "${topic_name}")

  # Step 0b: Write registry
  append_to_thread_registry \
    "${THREAD_ID}" \
    "${target_agent}" \
    "${initiator_name}" \
    "${topic_name}" \
    "${question}"

  # Step 0c: Patch routing config
  patch_routing_config "${THREAD_ID}" "${target_agent}"

  # Wait for hot-reload
  sleep 2

  # Step 1: Post opening
  post_opening_message "${THREAD_ID}" "${initiator_name}" "${question}" "${context}" "${initiator_key}"

  # Step 2: Invoke agent
  AGENT_RESPONSE=$(invoke_agent "${target_agent}" "${question}" "${context}")

  # Step 3: Post response
  CLEAN_RESPONSE=$(strip_markdown "${AGENT_RESPONSE}")
  post_agent_response "${THREAD_ID}" "${target_agent}" "${CLEAN_RESPONSE}"

  echo "Council thread created: ${THREAD_ID}"
}
```

### Config Patch (Python)

```python
def patch_routing_config(thread_id, target_agent):
    import json
    from datetime import datetime

    config_path = '/path/to/routing-config.json'

    with open(config_path, 'r') as f:
        config = json.load(f)

    if 'threads' not in config:
        config['threads'] = {}

    config['threads'][str(thread_id)] = {
        'target_agent': target_agent,
        'type': 'council',
        'created_at': datetime.utcnow().isoformat(),
        'policy': 'open'
    }

    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

    print(f"Config patched: thread {thread_id} → {target_agent}")
```

### Thread Registry Schema

```yaml
threads:
  - thread_id: 1047
    owner: Agent Bravo
    initiator: Agent Alpha
    topic_name: "🎯 Q2 Prioritisation"
    question: "Which feature should we ship first?"
    context: "Three candidates with similar demand signals..."
    initiator_take: "I lean toward feature 3..."
    created_at: 2026-03-09T14:22:33Z
    created_by_session: council-1047-1741597353
    messages_count: 4
    last_message_at: 2026-03-09T14:28:15Z
    closed_at: null
```

---

## Complete Flow Diagram

```
User                    Messaging                 Agent Runtime      Routing Config
                        Platform
  │                          │                          │                    │
  │                          │                          │                    │
  ├─[summon-cli invoked]─────>                          │                    │
  │  (initiator + target)     │                          │                    │
  │                           │                          │                    │
  ├──────────────────────────────────────────────────────>                    │
  │                           │                          │                    │
  │                           │       [Step 0]           │                    │
  │                           │   Create forum           │                    │
  │                           │   topic via              │                    │
  │                           │   target bot             │                    │
  │                           │<──────────────────────────                    │
  │                           │       THREAD_ID          │                    │
  │                           │                          │                    │
  │                       [Step 0b]                      │                    │
  │                       Write to                       │                    │
  │                       registry ─────────────────────────────────────────>
  │                           │                          │     (thread.json)  │
  │                           │                          │                    │
  │                       [Step 0c]                      │                    │
  │                       Patch config ──────────────────────────────────────>
  │                           │                          │    (config.json)   │
  │                           │                          │                    │
  │                           │                    [hot-reload in ~30ms]     │
  │                           │                          │                    │
  │                       [sleep 2s] ───────────────────────────────────────>
  │                           │                          │                    │
  │                       [Step 1]                       │                    │
  │ Post opening message  ──────────────>                │                    │
  │ via initiator bot          │                          │                    │
  │                           │                          │                    │
  │                       [Step 2]                       │                    │
  │ Invoke target agent ────────────────────────────────>                    │
  │ (via agent CLI)            │                    Agent                     │
  │                           │                  processes                    │
  │                           │                  & responds                   │
  │                           │                      <────                    │
  │                           │                    Agent                      │
  │                           │                   Response                    │
  │                       [Step 3]                       │                    │
  │ Post response         ──────────────>                │                    │
  │ via target bot            │                          │                    │
  │                           │                          │                    │
  ├─[user sees full thread]───│                          │                    │
  │  (opened, responses, ok)   │                          │                    │
```

---

## Common Pitfalls & Mitigations

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Thread created but no messages | Script runs but thread is empty. | Check `set -euo pipefail` isn't killing docker calls. Verify hot-reload logs. |
| Messages appear in wrong order | Agent response posts before opening. | Increase sleep from 2s to 3–5s. Check system clock skew. |
| Agent doesn't respond | Thread created, opening posted, silence. | Verify agent CLI invocation syntax. Check agent logs for errors. Test agent in isolation. |
| Routing config stuck (no hot-reload) | Config written but changes don't take effect. | Restart gateway manually. Check if gateway supports hot-reload (grep logs for "reload"). |
| Cross-persona bleed | Wrong agent responds. | Verify NO_REPLY rules in each agent's system prompt. Check thread ID not in static topic list. |
| Markdown rendering fails | Response appears as raw `**bold**` in platform. | Strip markdown before posting. Or set `parse_mode: HTML` in API call (if platform supports it). |

---

## Generalisation Beyond Telegram

This pattern works with any system where:

1. You have multiple bot identities, each with independent credentials
2. Your messaging platform supports forum-like threads
3. Your routing layer (gateway, proxy, MCP) watches config files for hot-reload
4. You can invoke agents via CLI or HTTP with structured input

**Platform-agnostic insights:**

- **Pre-register before publish**: Write routing config before the thread becomes visible. The moment a user sees the thread, all routing is live. No dead zones.
- **Check for hot-reload first**: Before building restart logic, verify your system supports file-watch reloading. Most modern systems do. Assuming restart is required is a premature optimisation that breaks reliability.
- **Use the messenger, not the platform**: Bot-to-bot messaging doesn't work. Use CLI, HTTP, or direct function calls to invoke agents. The messaging platform is for user interaction only.

---

## Packaging Notes

**This product**: Complete implementation template, thread registry schema, config patch function, script signature, and full worked example.

**Buyer persona**: Builders running multi-agent systems in Telegram, Discord, or custom messaging platforms who need ad-hoc agent collaboration without downtime or dropped messages.

**Time to implementation**: 30 minutes to adapt template to your platform. 2 hours to integrate into your gateway and test.

**Support materials (recommended additions)**:
- Runbook: "Debugging a Council Thread" (how to diagnose dropped messages, wrong routing, etc.)
- Video walkthrough: 10-minute recording of the full flow
- Troubleshooting guide: decision tree for common failures
- Agent prompt template: "How to write agent instructions for council threads"

**Related Hive Doctrine products**:
- C4-infrastructure / Async Agent Coordination (for agent-to-agent communication without threads)
- C7-dev-mastery / Multi-Agent Prompt Engineering (how to write prompts for agents in shared spaces)
