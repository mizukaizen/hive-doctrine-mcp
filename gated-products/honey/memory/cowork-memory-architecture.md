---
title: "Session Memory Architecture — Never Lose AI Context Again"
author: Melisia Archimedes
collection: C2-memory-mastery
tier: honey
price: 79
version: 1.0
last_updated: 2026-03-09
audience: operators
hive_doctrine_id: HD-0010
---

# Session Memory Architecture — Never Lose AI Context Again

If you're running AI coding assistants (Claude Code, Cursor, or similar tools) for serious work, you've hit this wall: a week into a project, your context window fills up, you compact the conversation to clear space, and suddenly the AI forgets the architectural patterns, tooling decisions, and hard-won discoveries that made everything work. You start from scratch. Time and quality collapse.

This markdown-native memory system fixes that. It's three layers: between-session continuity (markdown files the AI reads every startup), mid-session crash recovery (a hook that captures your last 20 exchanges before context compaction), and working context monitoring (the AI tracks its own load and wraps sessions proactively). No database. No API. Just files. And it works.

I built this for full-time AI-assisted development. The system assumes you're pairing with an AI coding assistant across days or weeks, moving through layers of a large codebase, and you can't afford to lose thread. This is the operational memory system that makes that sustainable.

---

## The Problem

Three failure modes break AI pair programming at scale:

**1. Between-session amnesia.** You start a new session. The AI has no memory of your workspace layout, your architectural decisions, how your build system works, or why you structured things a certain way. You spend the first 20 minutes re-establishing context that should have persisted. Multiply that across a hundred sessions.

**2. Mid-session context collapse.** You're deep in a refactor. The conversation is 150 exchanges in. The context window hits capacity. The AI asks to compact. You agree. The compact throws away your last week of architectural work, decisions about error handling, patterns you've standardised on, feedback you've given about what works and what doesn't. The AI restarts cold on the next message.

**3. Crash recovery vacuum.** Your terminal disconnects. Your AI session dies mid-task. You reconnect in a new session tomorrow with no record of where you were, what you'd just built, what the next step was. You have to reconstruct it from commit history or half-finished code.

The industry standard is "save the transcript"—export the conversation as JSON and read it back. This works for short sessions. It breaks at scale. Transcripts are massive (hundreds of kilobytes for real work), unstructured, and expensive to re-read. You can't search them efficiently. You can't encode feedback or operational rules into them. And they sit outside your tools—your AI coding assistant doesn't know they exist unless you manually paste them in.

The underlying assumption is wrong: you don't need to preserve *everything* from the last session. You need to preserve the *shape* of your workspace—the decisions that matter, the patterns that worked, the gotchas you've hit, the glossary of terms—and then you need a *recovery artifact* for unfinished work.

---

## The Solution

A three-layer markdown-native memory system that works with any AI coding assistant that reads files at startup (which is documented behaviour for Claude Code and Cursor).

**Layer 1: Between-Session Continuity**

Files in `~/.workspace/_memory/` that the AI reads at the beginning of every session. These are opinionated. Short. Designed to be skimmed, not searched.

- **BRIEF.md** — Master workspace context. What's the project? Who are the key stakeholders? What's the current phase? What's broken right now? Typically 20–50 lines.
- **PROTOCOL.md** — Operational checklist. Startup steps (linters, file watchers, local servers). Briefing template (the 12-step format below). Testing ritual. Shutdown steps.
- **SESSION-LOG.md** — Append-only log of session dates, what was worked on, and commits landed. One line per session. This is your index into Git history.
- **CONTEXT-THREADS.md** — Kanban of active work. What's in progress, blocked, pending review, done. Keeps the AI oriented on priorities without it having to ask.
- **WORKING-STYLE.md** — How you want the AI to communicate. Prefer concise or explanatory? Code-first or reasoning-first? Australian English or neutral? Any quirky preferences (e.g., "never use emojis").
- **FEEDBACK-LOG.md** — Structured log of corrections. "Session 2026-03-05: Don't suggest using X library, we're standardising on Y. Don't forget trailing commas in JSON." Prevents the AI repeating the same mistakes.
- **LESSONS.md** — Architectural discoveries. "We tried async rendering first—was a dead end, real bottleneck was database queries." These are expensive insights that should never evaporate.
- **glossary.md** — Project-specific terms and their meanings. Prevents the AI inventing terminology or using the wrong definitions for domain-specific words.

These files live in your repo (or your workspace, not a session directory). The AI reads them at startup. You add to them asynchronously, outside the session—during standup, in your daily notes, when you think of something important.

**Layer 2: Mid-Session Crash Recovery**

A PreCompact hook that fires *before* the AI's conversation history gets compacted. It captures the last 20 assistant turns as a JSON artifact and writes a human-readable markdown checkpoint.

The hook uses `jq` to parse the conversation transcript (which is stored as `.jsonl` in the session directory) and extracts:
- Last 20 assistant messages
- Their timestamps and token counts
- Any code blocks or structured output
- The turn where context got tight

This checkpoint sits in `_memory/CHECKPOINT.md` (or `.json` for structure). The next session reads it. If it's relevant, the AI uses it to resume. If not, it gets deleted.

Why a hook? Because the AI can't trigger code to run on its own—but the platform (Claude Code, Cursor) fires PreCompact events before it purges history. That's where you hook.

**Layer 3: Working Context Monitoring**

The AI tracks its own context load and wraps proactively. Before hitting 85% of capacity, the AI writes a summary of its current working state, saves it to a `SESSION-WORKING-STATE.md` file, and tells you it's about to wrap. You can push one more task or take the wrap clean.

This isn't enforced by a hook—it's a discipline the AI adopts. But if the memory system is well-structured, the AI can actually see its remaining context and make good decisions.

---

## Key Insights

**Files are the API.** Claude Code and Cursor both read files at startup—documented, safe, no special permissions required. Markdown is the interface. The AI scans `_memory/` automatically. No configuration needed.

**Plain text scales.** A markdown file remains usable at any size. A conversation transcript becomes noise after 50 exchanges. Markdown doesn't. You can keep a FEEDBACK-LOG.md for six months of sessions, and the AI will still skim it in milliseconds.

**The PreCompact hook is the keystone.** The hook doesn't require the AI to do anything. It's a system-level event fired by the platform. You write the hook once, register it once, and it runs on every compact. That's where the magic lives—capture happens automatically, not through discipline.

**jq is the right tool.** In sandboxed environments (like Claude Code's execution context), Python stdout is swallowed or limited. `jq` works in pure bash, parses JSON, and outputs what you need. It's lightweight and available everywhere.

**Opinionated structure beats flexible schema.** You could design a nested folder structure, a tagging system, or a database. Don't. The more flexible the system, the more decisions the AI has to make about where to put things. Opinionated—fixed file names, one-per-topic—wins because it removes choice and makes the system predictable.

**Graceful degradation.** If the hook doesn't fire, you lose crash recovery but keep between-session continuity. If FEEDBACK-LOG.md doesn't exist, the AI still reads BRIEF.md and PROTOCOL.md. The system is additive—each layer improves on the base, but absence of one layer doesn't break the others.

**Tool-agnostic design.** This works with Claude Code today. It'll work with any future AI assistant that reads files at startup. The moment a new tool supports that, this system ports over unchanged.

---

## Implementation

### File Structure

```
~/workspace/
├── BRIEF.md                      # 20–50 lines, workspace context
├── .gitignore                    # Make sure _memory/ is committed
├── _memory/
│   ├── PROTOCOL.md               # Startup checklist + 12-step briefing
│   ├── SESSION-LOG.md            # Append-only history (one line per)
│   ├── CONTEXT-THREADS.md        # Kanban of active work
│   ├── WORKING-STYLE.md          # Communication preferences
│   ├── FEEDBACK-LOG.md           # Structured corrections
│   ├── LESSONS.md                # Architectural discoveries
│   ├── CHECKPOINT.md             # Recovery artifact (auto-written)
│   └── glossary.md               # Project terminology
├── _outputs/                     # Session work products
└── _inbox/                       # Queued handoffs
```

### BRIEF.md Format

```markdown
# Workspace Brief

**Project:** [Name]
**Current Phase:** [Build/Testing/Launch/Maintenance]
**Team:** [You + AI assistant name]
**Status:** [Healthy/Degraded/Blocked]

## What's Broken Right Now

- [Issue 1]
- [Issue 2]

## Architecture (one-liner)

[Single sentence describing the system shape]

## Next Sprint

1. [Task 1]
2. [Task 2]
3. [Task 3]
```

### PROTOCOL.md — 12-Step Briefing Format

The AI reads this at startup and follows it every session.

1. **Greet.** "Morning. I've read your memory files."
2. **State context load.** "I'm starting fresh with [X] tokens of prior context."
3. **Confirm workspace shape.** "Your project is [description]. Is that still accurate?"
4. **Check for CHECKPOINT.** "I found a crash recovery checkpoint from [date]. Should I resume from it?"
5. **Summarise active threads.** "Your current work is: [threads from CONTEXT-THREADS.md]."
6. **Confirm phase.** "You're in the [phase] phase. That right?"
7. **Run startup steps.** "Running startup protocol: [checklist from PROTOCOL.md]."
8. **Flag feedback.** "I've loaded your feedback log. I'll remember: [3–5 key points]."
9. **State next move.** "Based on CONTEXT-THREADS, the next action is [task]. Correct?"
10. **Ask for new context.** "Anything new since last session I should know?"
11. **Confirm working style.** "I'll keep comms concise, code-first. Sound right?"
12. **Confirm ready.** "Ready. What first?"

This ritual takes 60 seconds. It re-establishes everything. The AI doesn't guess—it reads, confirms, and moves.

### PreCompact Hook (Bash + jq)

This lives in your Claude Code settings (`settings.json` or equivalent platform config):

```json
{
  "hooks": {
    "preCompact": {
      "script": "/path/to/workspace/_memory/hook-precompact.sh",
      "enabled": true
    }
  }
}
```

The hook script (`hook-precompact.sh`):

```bash
#!/bin/bash

# PreCompact hook — fires before conversation is compacted
# Extracts last 20 assistant turns and writes a checkpoint

TRANSCRIPT="${1:-./.claude/transcript.jsonl}"
CHECKPOINT="${2:-_memory/CHECKPOINT.md}"

# Abort if transcript doesn't exist
[ -f "$TRANSCRIPT" ] || exit 0

# Extract last 20 assistant turns using jq
jq -s 'reverse | map(select(.role == "assistant")) | .[0:20] | reverse' "$TRANSCRIPT" > /tmp/checkpoint.json

# Write human-readable checkpoint
cat > "$CHECKPOINT" <<'EOF'
# Crash Recovery Checkpoint

**Timestamp:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Reason:** Conversation compacted at [X] turns.

## Last 20 Assistant Turns

EOF

jq -r '.[] | "- **Turn \(.turn):** \(.content | split("\n")[0])"' /tmp/checkpoint.json >> "$CHECKPOINT"

echo "**Recovery Status:** Ready to resume from this point if session crashes." >> "$CHECKPOINT"

# Clean up
rm /tmp/checkpoint.json

exit 0
```

Register this in your platform config (Claude Code uses `.claude/settings.json` or equivalent):

```json
{
  "memory": {
    "preCompactHook": {
      "enabled": true,
      "scriptPath": "_memory/hook-precompact.sh",
      "transcriptPath": ".claude/transcript.jsonl"
    }
  }
}
```

### SESSION-LOG.md Format

```markdown
# Session Log

| Date | Work | Commits | Duration |
|------|------|---------|----------|
| 2026-03-09 | Implemented auth middleware | abc1234, def5678 | 2h 45m |
| 2026-03-08 | Debugged database query performance | xyz9999 | 1h 20m |
| 2026-03-07 | Refactored API error handling | qrs2222 | 3h 10m |
```

One row per session. Append as you close sessions. This becomes your index into Git history.

### Intelligence Briefing Output (Structured Format)

After reading all memory files at startup, the AI outputs a structured briefing:

```
═══════════════════════════════════════════════════════════════
                  INTELLIGENCE BRIEFING
═══════════════════════════════════════════════════════════════

PROJECT:     [Name]
PHASE:       [Current phase]
STATUS:      [Healthy/Degraded/Blocked]

CONTEXT THREADS (Priority Order):
  1. [Thread 1] — Status: [In Progress/Blocked/Review]
  2. [Thread 2] — Status: [In Progress/Blocked/Review]
  3. [Thread 3] — Status: [In Progress/Blocked/Review]

WORKING STYLE:
  • Communication: [Concise/Explanatory]
  • Code Format: [First/Secondary]
  • Preferences: [Key preferences from WORKING-STYLE.md]

FEEDBACK LOADED:
  • [Key feedback 1]
  • [Key feedback 2]
  • [Key feedback 3]

CONTEXT AVAILABLE:
  • Session: [X] tokens remaining
  • Emergency buffer: [Y] tokens reserved

NEXT ACTION (Recommended):
  [Task from CONTEXT-THREADS.md]

CHECKPOINT STATUS:
  [If crash recovery exists: "Ready to resume from [date]"]
  [If not: "Clean start"]

═══════════════════════════════════════════════════════════════

Ready? What first?
```

This briefing takes 2–3 seconds to read. It answers every question the AI might ask and re-establishes context without re-reading everything.

---

## Example

**Session 1 (Day 1, 9:00 AM)**

You start a new session. BRIEF.md says the project is a React dashboard. PROTOCOL.md tells the AI to start local dev servers. CONTEXT-THREADS.md says the current work is "refactor auth flow" (in progress) and "add dark mode" (blocked, waiting for design feedback).

The AI reads these, outputs the Intelligence Briefing (12 lines), confirms "you're working on auth, dark mode is waiting." You say "correct, let's focus on auth. Here's the current code." Conversation starts. No wasted time.

**Mid-Session (3:30 PM, Same Day)**

You're 85 turns into the session. The context window is at 82% capacity. The AI notices (working context monitoring) and says: "Context at 82%. I can fit one more task before wrapping. Want to push another feature or take the wrap clean?"

You say "wrap clean." The AI writes a summary:

```
## Session Summary (2026-03-09, Afternoon)

**Work Completed:**
- Refactored OAuth token refresh logic
- Added rate-limit handling to API client
- Tests passing (23/23)

**Commits:**
- abc1234: "refactor: oauth token refresh"
- def5678: "feat: api rate-limit retry"

**Next Steps:**
- Write integration tests for OAuth flow
- Deploy to staging (requires dark mode, currently blocked)

**Known Issues:**
- Token cache can become stale in edge cases (low priority)
- Need to coordinate with design team on dark mode timeline

**Context Decisions:**
- Using promise-based retry pattern (not queue-based)
- Token cache in sessionStorage (not localStorage)
```

This goes in SESSION-LOG.md and _memory/CONTEXT-THREADS.md. You close the session.

**Session 2 (Day 2, 10:00 AM)**

You start a new session. The AI reads BRIEF.md, PROTOCOL.md, SESSION-LOG.md, and the summary from yesterday. The Intelligence Briefing includes: "Yesterday you refactored OAuth and tests pass. Next is integration tests. Dark mode is still blocked."

No re-explanation needed. You say "continue with integration tests" and the conversation resumes at full productivity.

**Mid-Session Crash (1:45 PM, Same Day)**

The PreCompact hook fires (or the session crashes before compact). The hook writes a checkpoint with the last 20 turns. It captures:
- The OAuth test structure you just wrote
- A bug you discovered (token cache stale in edge cases)
- The pattern you settled on for retry logic

**Session 3 (Day 3, 9:00 AM)**

The AI reads the CHECKPOINT.md from the crash. It says "I found a recovery checkpoint from yesterday. Your last 20 turns were about integration tests and a token cache edge case. Should I resume from there?"

You say "yes." The AI uses the checkpoint to context-jump and continues. No reconstruction needed.

---

## Packaging Notes

**This is a system, not a feature.** You're selling operators the discipline and the architecture to keep AI context persistent across weeks of work. The value is in the time saved (re-establishing context, reconstructing work after crashes) and the quality improvement (the AI carries forward discoveries, patterns, and feedback).

**No special software required.** This works with:
- Claude Code (any recent version)
- Cursor (any recent version)
- Any future AI coding assistant that reads files at startup

The only custom piece is the PreCompact hook. That's platform-specific (one version for Claude Code, one for Cursor) but it's ~30 lines of bash + jq. Trivial to adapt.

**Customisation entry points:**
- PROTOCOL.md can be extended with project-specific rituals (linting, deployment steps, testing phases)
- FEEDBACK-LOG.md captures domain-specific do's and don'ts
- LESSONS.md is a growing document of architectural discoveries
- WORKING-STYLE.md ports between projects (or customises per project)

**Scaling path:**
- Honey tier: This document + template files (blank BRIEF.md, PROTOCOL.md structure, hook script)
- Platinum tier (future): Integration with CI/CD to auto-append test results to CONTEXT-THREADS.md. Auto-export important Github issues to FEEDBACK-LOG.md. Real-time monitoring of context load with alerts.

**Why this works:**
- Files are the interface—no buy-in from the AI vendor
- Markdown is human-readable—works with your brain and your version control
- Incremental adoption—add BRIEF.md first, PROTOCOL.md second, hooks last
- Recovers from platform changes—if you switch tools, your memory system is portable
- Reduces entropy—forces you to document decisions asynchronously, not in the heat of the moment

This is the memory architecture that makes serious, sustained AI pair programming sustainable.
