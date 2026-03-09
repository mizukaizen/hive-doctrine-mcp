---
title: "PreCompact Checkpoint Hook — Mid-Session Crash Recovery for AI Assistants"
author: Melisia Archimedes
collection: C2-memory-mastery
tier: honey
price: 49
version: 1.0
last_updated: 2026-03-09
audience: developers
hive_doctrine_id: HD-0014
---

# PreCompact Checkpoint Hook

An automated recovery system that captures your AI assistant's working context before the session transcript compacts, so your next session can resume seamlessly with full task continuity.

## The Problem

AI assistants operate within context windows. When you're deep in a multi-turn problem-solving session—debugging code, refining a document, orchestrating a complex workflow—your assistant maintains working memory across turns. But once that context window fills, the assistant must "compact" the conversation: it summarises the early turns, discards the original transcript, and continues with fresh capacity.

Here's the problem: **if the compaction happens mid-task, your work context evaporates**. Your next session starts cold. The assistant has no record of what you were building, what decisions were made, where the work was interrupted, or what the immediate next step is. You lose 20-30 minutes recovering that context manually—re-explaining the task, showing code snippets again, retracing decisions.

This is especially painful for:
- **Multi-day projects** that span multiple sessions
- **Exploratory work** where the approach itself is part of the continuity (e.g., "we've tried X and Y, next we test Z")
- **Debugging** sessions where you need to remember which hypotheses have been ruled out
- **Prompt engineering** where you've refined a complex system prompt and need to see the exact final version

The assistant's compaction is a black box. You can't intercept it. And even if you could, extracting the right context to save is non-obvious—do you save the full session? The last conversation? Structured summaries? Raw turns?

## The Solution

The PreCompact Checkpoint Hook is a **bash script that runs automatically before compaction fires**, capturing the last 20 assistant turns and writing them to a recoverable CHECKPOINT.md file. Next session: your startup protocol reads the checkpoint, recovers context in 30 seconds, then cleans up the file.

It's three pieces:

1. **The hook script** — fires on a documented lifecycle event, extracts turns from the session transcript using jq, writes them to a checkpoint file
2. **Hook registration** — a single JSON entry in your assistant settings that tells the runtime where the script lives
3. **Startup recovery protocol** — a three-line check in your session startup that reads and deletes the checkpoint

The flow:

```
Session A: [20 turns of work]
           [context window fills]
           [compaction triggers]
           → PreCompact hook fires
           → Extracts last 20 turns
           → Writes to CHECKPOINT.md
           [compaction proceeds; context summarised, old turns deleted]
           [session ends]

Session B: [startup protocol reads CHECKPOINT.md]
           → Recovers working context in chat
           → Deletes CHECKPOINT.md
           [you continue mid-task without re-explaining]
```

## Key Insights

**Why jq, not Python or other parsers?** In many AI tool sandboxes, Python3 stdout is silently swallowed or buffered oddly. jq is present on nearly all Unix systems, runs as a subprocess (not in-process), and its output is reliable. It's also a single dependency—no virtual environments, no pip, no fussing.

**Why document the lifecycle hook?** This isn't a workaround or a hack. The PreCompact hook is a published lifecycle event. You're using the documented API, not intercepting internals. That means it's stable, supported, and won't break across version upgrades.

**Why set -euo pipefail?** This is critical. If the script fails silently, you'll create a corrupted or empty checkpoint and never know. The flags force fast-fail: `-e` exits on any error, `-u` errors on undefined variables, `-o pipefail` fails if any command in a pipeline fails. You want loud failures, not silent data loss.

**Why fallback to find?** Some hook implementations don't pass transcript_path in the input. The fallback finds the most recently modified .jsonl file in your projects directory, which is nearly always the current session. It's a safety net for configurations that don't pass metadata.

**Why 20 turns, not 50 or 5?** Twenty assistant turns is roughly 10,000–15,000 tokens of context. That's enough to recover task state, recent decisions, code snippets, and the immediate next step—without overwhelming the next session with noise. It's also small enough to copy-paste into chat in seconds if needed.

**Why one-time read-and-delete?** The checkpoint is a recovery artifact, not persistent history. You read it once, get your context back, then delete it. This prevents checkpoint files from accumulating and keeps your workspace clean. If you need persistent session history, that's a separate concern (and a separate product).

## Implementation

### Step 1: Create the Hook Script

Save this to `~/.assistant/hooks/precompact-checkpoint.sh`:

```bash
#!/usr/bin/env bash
# PreCompact lifecycle hook: Checkpoint last 20 assistant turns before compaction.
# Fires automatically when the session transcript is about to be compacted.
# Next session reads CHECKPOINT.md for context recovery, then deletes it.

set -euo pipefail

INPUT=$(cat)
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty' 2>/dev/null)

# Fallback: find most recently modified .jsonl in projects directory
if [ -z "$TRANSCRIPT" ]; then
    TRANSCRIPT=$(find ~/.assistant/projects -name "*.jsonl" -type f -print0 2>/dev/null | \
                xargs -0 ls -t 2>/dev/null | head -1)
fi

CHECKPOINT="$HOME/workspace/_memory/CHECKPOINT.md"
DATE=$(date +%Y-%m-%d\ %H:%M:%S)

if [ -n "$TRANSCRIPT" ] && [ -f "$TRANSCRIPT" ]; then
    mkdir -p "$(dirname "$CHECKPOINT")"

    {
        echo "# CHECKPOINT — $DATE"
        echo ""
        echo "Session compacted mid-flight. Last 20 assistant turns:"
        echo ""
        echo '```'
        jq -r '
          .[] |
          select(.type == "assistant") |
          .message.content[] |
          select(.type == "text") |
          .text' "$TRANSCRIPT" 2>/dev/null | tail -20
        echo '```'
    } > "$CHECKPOINT"

    echo "[precompact-checkpoint] Checkpoint written to $CHECKPOINT" >&2
else
    echo "[precompact-checkpoint] WARNING: transcript not found, checkpoint skipped" >&2
fi
```

Make it executable:

```bash
chmod +x ~/.assistant/hooks/precompact-checkpoint.sh
```

### Step 2: Register the Hook

In your assistant settings (often `~/.assistant/config.json` or similar), add:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "type": "command",
        "command": "~/.assistant/hooks/precompact-checkpoint.sh"
      }
    ]
  }
}
```

Verify your settings file syntax is valid JSON. If your tool uses YAML, adapt to:

```yaml
hooks:
  PreCompact:
    - type: command
      command: ~/.assistant/hooks/precompact-checkpoint.sh
```

### Step 3: Add Startup Recovery Protocol

In your session startup script or checklist, add these three lines:

```bash
# Check for and recover from PreCompact checkpoint
if [ -f "$HOME/workspace/_memory/CHECKPOINT.md" ]; then
    echo "=== RECOVERING SESSION CONTEXT FROM PREVIOUS COMPACTION ==="
    cat "$HOME/workspace/_memory/CHECKPOINT.md"
    echo ""
    rm "$HOME/workspace/_memory/CHECKPOINT.md"
fi
```

Or if you're doing this manually in chat, before starting work:

```
Does a CHECKPOINT.md file exist in my workspace? If so, show me the contents and delete it.
```

## Example

**Session A (Day 1):**

You're debugging a Rust async runtime issue. Twenty turns in, your assistant's context window is 90% full. The next turn triggers compaction.

Behind the scenes:
- PreCompact hook fires (you don't see it happening)
- Script reads the session transcript
- Extracts the last 20 assistant turns (includes: the bug hypothesis, the test code you wrote, the error output, the two failed fixes you tried, and the current debugging direction)
- Writes to `~/workspace/_memory/CHECKPOINT.md`
- Compaction proceeds; session ends

**Session B (Day 2):**

You start a new session. Your startup protocol (or a manual check) finds CHECKPOINT.md:

```
# CHECKPOINT — 2026-03-08 16:47:22

Session compacted mid-flight. Last 20 assistant turns:

```
[Previous context: We've isolated the issue to the tokio task scheduler...]
[The error only happens under concurrent load with >16 tasks...]
[Test case: running 32 spawned tasks triggers the panic...]
[Next step: instrument the scheduler with debug logging...]
```
```

You paste this (or read it) in chat. In 30 seconds, your assistant has full context: the hypothesis, the test case, what's failed, where you were heading. You continue debugging seamlessly.

## Packaging Notes

**Installation checklist:**

1. Create `~/.assistant/hooks/` directory if it doesn't exist
2. Copy the hook script to `~/.assistant/hooks/precompact-checkpoint.sh`
3. Run `chmod +x ~/.assistant/hooks/precompact-checkpoint.sh`
4. Add the hooks entry to your settings file (JSON or YAML format)
5. Verify syntax: `jq . < ~/.assistant/config.json` (if JSON) or equivalent for your tool
6. Add the startup recovery lines to your startup script or checklist

**Testing the hook:**

Create a test transcript manually:

```bash
mkdir -p ~/.assistant/projects
cat > ~/.assistant/projects/test-transcript.jsonl << 'EOF'
{"type": "user", "message": {"content": [{"type": "text", "text": "Help me debug this"}]}}
{"type": "assistant", "message": {"content": [{"type": "text", "text": "First, let's check the error logs. Run: tail -50 app.log"}]}}
{"type": "user", "message": {"content": [{"type": "text", "text": "Done. Error: connection timeout on port 5432"}]}}
{"type": "assistant", "message": {"content": [{"type": "text", "text": "PostgreSQL isn't responding. Verify it's running: systemctl status postgresql"}]}}
EOF
```

Then manually trigger the hook:

```bash
echo '{"transcript_path": "'$HOME'/.assistant/projects/test-transcript.jsonl"}' | \
  ~/.assistant/hooks/precompact-checkpoint.sh
```

Check that `~/workspace/_memory/CHECKPOINT.md` was created with content.

**Troubleshooting:**

- **"jq: command not found"** — Install jq for your OS (apt install jq, brew install jq, etc.)
- **"Checkpoint skipped, transcript not found"** — Your assistant config isn't passing transcript_path, or the fallback path is wrong. Check paths in the script match your setup.
- **"Permission denied" on script** — Run `chmod +x` on the hook script. Verify it's executable: `ls -la ~/.assistant/hooks/precompact-checkpoint.sh` should show `x` flags.
- **Empty checkpoint** — The jq query might not be matching your transcript format. Check that your .jsonl file has `.type == "assistant"` fields. Run jq manually to debug: `jq '.[] | select(.type == "assistant")' your-transcript.jsonl`
- **Checkpoint appears but startup doesn't read it** — Verify the startup check is running before you begin work. Add debug output: `echo "Checking for checkpoint..." && ls -la ~/workspace/_memory/CHECKPOINT.md` (it should error if the file doesn't exist, which is fine—that's the normal case).

**Compatibility:**

- Requires: bash 4+, jq, standard Unix tools (mkdir, find, xargs, ls, cat, date)
- Works with: any AI assistant platform that supports PreCompact lifecycle hooks
- Tested with: session transcript formats following the .jsonl convention (one JSON object per line, with `.type` and `.message.content` fields)

**Next steps:**

If you need persistent session history (not just recovery checkpoints), combine this with a session archiver that timestamps and stores every compaction checkpoint. If you need richer recovery metadata (task name, code files involved, etc.), extend the checkpoint to include structured YAML frontmatter before the context snippet.
