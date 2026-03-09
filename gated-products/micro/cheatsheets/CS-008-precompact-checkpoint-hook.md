---
title: "PreCompact Checkpoint Hook — Cheat Sheet"
hive_doctrine_id: HD-0014
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0014
full_product_price: 49
---

# PreCompact Checkpoint Hook — Cheat Sheet

## What It Is

A bash hook that captures the last 20 assistant turns before an AI session's context window compacts (loses history). Crash recovery for AI conversations.

## The Problem

When an AI assistant's context window fills up, older messages get compacted or lost. If the session crashes or compacts mid-task, the assistant loses track of:
- What it was working on
- Decisions already made
- Files already modified
- Questions still unanswered

## The Solution

A bash script that runs automatically before compaction, saving a checkpoint file.

## Hook Script (Core)

```bash
#!/bin/bash
set -euo pipefail

CHECKPOINT_DIR="${HOME}/_cowork/memory"
CHECKPOINT_FILE="${CHECKPOINT_DIR}/precompact-checkpoint.md"
CONVERSATION_FILE="$1"  # path to conversation JSON

mkdir -p "$CHECKPOINT_DIR"

# Extract last 20 assistant turns using jq
jq -r '
  [.messages[] | select(.role == "assistant")] |
  .[-20:] |
  .[] |
  "---\n" + .content + "\n"
' "$CONVERSATION_FILE" > "$CHECKPOINT_FILE"

echo "Checkpoint saved: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$CHECKPOINT_FILE"
```

## Hook Registration

```json
{
  "hooks": {
    "PreCompact": {
      "command": "/path/to/precompact-hook.sh",
      "timeout": 10
    }
  }
}
```

## Startup Recovery Protocol (3 Lines)

Add to your session startup checklist:

1. Check if `precompact-checkpoint.md` exists
2. If yes, read it — this is your last context before compaction
3. Resume from where the checkpoint left off

## Key Rules

- **`set -euo pipefail`** — script must fail loudly, never silently
- **Use quoted heredocs carefully** — `<<'EOF'` prevents variable expansion; `<<EOF` allows it
- **jq is required** — the script parses JSON conversation history
- **Timeout of 10 seconds** — if the hook takes longer, something is wrong
- **Checkpoint is overwritten each time** — only the most recent checkpoint matters

## Common Bugs

1. **Quoted heredoc trap:** Using `<<'EOF'` when you need `<<EOF` (or vice versa) silently produces wrong output
2. **Missing jq:** Script fails silently if jq isn't installed
3. **Wrong conversation file path:** The `$1` argument must point to the actual conversation JSON

---

*This is the condensed version. The full guide (HD-0014, $49) covers the complete hook implementation, jq parsing details, and integration with the Cowork memory architecture. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
