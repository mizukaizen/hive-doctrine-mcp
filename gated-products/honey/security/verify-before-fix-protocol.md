---
title: "Verify-Before-Fix Agent Config Protocol — Stop Debugging from Wrong Assumptions"
author: Melisia Archimedes
collection: C5-security-ops
tier: honey
price: 29
version: 1.0
last_updated: 2026-03-09
audience: agent-builders, devops-engineers
hive_doctrine_id: HD-0030
---

# Verify-Before-Fix Agent Config Protocol

You're debugging a multi-agent system. Something's broken. An agent can't access a tool. A config isn't being read. An environment variable isn't propagating. You've been staring at local files for two hours. You've triple-checked the path. You've re-read the Docker Compose file. You've validated the YAML syntax. Everything looks correct.

And the system is *still* broken.

Here's the hard truth: **local file analysis lies.**

Your config file in the editor is a snapshot from yesterday. The running system is different. The Docker mount points obscure the actual paths. Environment variables get layered—base image defaults, compose file overrides, runtime flags. Tools have been swapped out. Shared volumes have drifted. You're looking at what you *intended* to deploy, not what's actually running.

This protocol forces you to stop guessing. It separates diagnosis from remediation. It makes your assumptions visible and testable. And it catches the cases where 4 of your 5 assumptions are wrong, saving you from a 6-file fix when the real problem is in 1 file.

## The Problem: Why Local Analysis Fails

You've read the docs. You know the config should work. But when you SSH into the system and query the live state, something doesn't match:

- The Docker Compose file says the volume is at `/var/config`, but the container is seeing it at `/etc/local/config`.
- The env var file is there, but a Docker `RUN` instruction in the base image set a different default that takes precedence.
- The agent tool registration script runs fine locally, but the deployment pipeline migrated the tool to a different registry, and the config never got updated.
- Synced files have stale copies; the actual source is somewhere else.
- A previous fix left a hard-coded path that overrides the config you just changed.

The mental model in your head—*what you think is running*—is not the actual system state.

This costs you:
- Hours of re-diagnosis because your assumptions seem sound but are fundamentally wrong
- A fix that works locally but fails in production because the environments are actually different
- Rework when you discover mid-implementation that the problem is elsewhere
- Lost confidence: "I don't know how this thing actually works anymore"

## The Solution: The 4-Phase Verify-Before-Fix Protocol

This is a structured method to:
1. Make your diagnostic assumptions explicit and numbered
2. Test each assumption against the *live system* before you touch anything
3. Build a verdict table that separates confirmed issues from wrong guesses
4. Scope the actual fix based on verified facts, not assumptions
5. Separate the diagnostic session from the fix session to prevent "fix while investigating" drift

### The Four Phases

**Phase 1: Diagnostic Session (Local)**
- Write down what you think is happening
- List your assumptions (A1, A2, A3, etc.) in plain English
- Don't fix yet; just diagnose
- Output: Verification prompt template

**Phase 2: Verification Session (Remote/Live)**
- Run shell commands on the live system
- Test each assumption with actual queries (file checks, env reads, process inspection)
- Record the result: CONFIRMED, WRONG, PARTIAL, or NOT_APPLICABLE
- Output: Verdict table with evidence

**Phase 3: Scoped Fix Session (Remote/Live)**
- Based on the verdict table, write a fix prompt that only addresses verified issues
- Include a non-destructive write test
- Output: Exact commands to fix only what's actually broken

**Phase 4: Validation (Remote/Live)**
- Run the non-destructive test first
- Run the fix
- Verify the system recovers

The critical rule: **Do not move to Phase 3 until every assumption in Phase 2 is marked CONFIRMED, WRONG, or PARTIAL.**

## Key Insights

### 1. Assumptions Must Be Testable

Bad assumption: "The config should be loaded when the agent starts."

Good assumption: "When agent process PID 1234 starts, it reads `/etc/agent/config.yaml`, and that file contains the string `tool_registry: true` on line 7."

The good version is testable with a shell command. The bad version is a guess.

### 2. Separate the Diagnostic Mind from the Fix Mind

This is the hardest discipline: once you're in diagnostic mode, you're not allowed to fix. You investigate, you document, you hand off to a separate session.

Why? Because the moment you start implementing a fix, you unconsciously stop looking for contrary evidence. You see what you expect. You interpret ambiguous output as confirmation. You stop thinking critically.

The four-phase protocol forces a hand-off. Phase 2 happens in a different session context. By the time you write the fix, you can't unconsciously defend wrong assumptions—they're already marked WRONG in the verdict table.

### 3. The Verdict Table Is Your Source of Truth

Not your intuition. Not your re-reading of the config. The verdict table.

```
| Assumption | Result | Evidence |
|---|---|---|
| Config file exists at /etc/agent/config.yaml | WRONG | File is at /etc/config/agent.yaml (note singular vs plural and order) |
| Agent reads config on startup | CONFIRMED | Process exec log shows "Reading /etc/config/agent.yaml" |
| Tool registry URL is set by env var TOOL_REG_URL | PARTIAL | Env var is set, but agent only reads it if config flag enable_env_override=true, which is false |
```

Now your fix is scoped: don't try to fix the path first. Fix the enable_env_override flag. That's the real blocker.

### 4. Always Include a Non-Destructive Write Test

Before you delete, rename, or overwrite anything, test your fix in dry-run mode:

```bash
# Test: verify the fix will work without applying it
docker exec agent-service /agent-cli --dry-run --apply-config /new/config.yaml

# Result: "Would update 4 fields. No errors detected."

# Then: apply it for real
docker exec agent-service /agent-cli --apply-config /new/config.yaml
```

If the dry run fails, you know the fix itself is broken before it affects the system.

### 5. Local Files Are Lies; Running Processes Are Truth

Always query the running system:
- `docker exec <container> cat /path/to/file` — actual file in the container, not your local interpretation of the Compose file
- `docker exec <container> env | grep PATTERN` — actual env vars, not what you set in the compose file
- Process inspection: `ps aux | grep agent`, `lsof -p <PID>`, `/proc/<PID>/environ` — what's actually running

## Implementation Guide

### Step 1: Write Your Diagnostic Memo

Before you SSH anywhere, sit down and write what you think is happening. Use this template:

```
## Diagnostic Memo: [System] [Issue]

**What's Broken:**
[One sentence. What's not working.]

**What I Think Is Happening:**
[Your mental model. Where does the problem originate.]

**Assumptions (Testable):**

A1: [Assumption in if-then form, testable with a shell command]
A2: [Next assumption]
A3: [...]

**Questions I Have:**
[Anything that would change my fix if the answer were different]

**Constraints:**
[What I can't change. What's read-only. What's shared.]
```

Example:

```
## Diagnostic Memo: Agent Tool Registry Not Loading

**What's Broken:**
The agent service starts but can't find the weather tool. Error: "tool not found: weather.get_forecast"

**What I Think Is Happening:**
The tool registry config is not being read on startup. Either the file path is wrong, or the registry lookup is failing silently.

**Assumptions:**

A1: Tool registry is configured via file at /etc/agent/tools/registry.json
A2: Agent reads this file during initialization (before serving requests)
A3: The file exists and contains valid JSON with a "weather" entry
A4: If the file is missing, the agent logs an error to stdout

**Questions:**
- Is the agent actually reading from /etc/agent/tools/ or a different path?
- Does the Docker mount point in the Compose file actually map to where the agent expects the file?
- Is there a precedence issue (e.g., a base image default overriding our config)?

**Constraints:**
- Agent process is running in read-only mode for /etc/
- Can't restart the agent (live traffic)
```

### Step 2: Write the Verification Prompt

Now turn your assumptions into a verification script. This is what you'll hand to a separate session that runs on the live system:

```
# Verification Session: Confirm assumptions about agent tool registry

## A1: Tool registry file exists at /etc/agent/tools/registry.json

Command:
docker exec agent-service ls -la /etc/agent/tools/registry.json

Expected outcomes:
- File exists: mark CONFIRMED
- File not found: mark WRONG, then run: docker exec agent-service find / -name "registry.json" 2>/dev/null | head -5
- Permission denied: mark PARTIAL, note the actual path

## A2: Agent reads the registry file during init

Command:
docker exec agent-service grep -i "registry" /var/log/agent.log | head -10

Expected outcomes:
- Logs show "Loading tool registry from /etc/agent/tools/registry.json": mark CONFIRMED
- Logs show a different path: mark WRONG, note the actual path
- No logs mentioning registry: mark PARTIAL, check if logging is enabled

## A3: File contains valid JSON and a "weather" entry

Command:
docker exec agent-service cat /etc/agent/tools/registry.json | jq '.tools | keys' 2>&1

Expected outcomes:
- Output includes "weather": mark CONFIRMED
- JSON parse error: mark WRONG, check file syntax
- Empty keys: mark WRONG, registry has no tools defined
- File not readable: mark PARTIAL, check permissions

## A4: Missing file causes logged error

Command:
docker exec agent-service cat /var/log/agent.log | grep -i "registry\|not found\|error" | head -20

Expected outcomes:
- Error message about missing registry: mark CONFIRMED
- No error on startup but tool lookup fails later: mark PARTIAL
- No errors at all: mark WRONG, tool lookup may be silently failing
```

### Step 3: Run Verification, Build Verdict Table

Execute the commands from Step 2 on the live system. Record results:

```
| Assumption | Result | Evidence |
|---|---|---|
| A1: File at /etc/agent/tools/registry.json | WRONG | File not found. Actual path: /var/lib/agent/tools/registry.json (different dir) |
| A2: Agent reads registry on init | CONFIRMED | Log shows: "Loading tool registry from /var/lib/agent/tools/registry.json" |
| A3: Valid JSON with weather entry | CONFIRMED | jq output: ["weather", "crypto", "sports"] |
| A4: Missing file causes error | PARTIAL | No error logged, but service hangs for 5s on startup (timeout waiting for file) |
```

### Step 4: Scope the Fix

Now write a new diagnostic prompt that addresses only what's verified:

```
# Fix Session: Correct agent tool registry path

Based on verification, the actual issue is:
- Config points to /etc/agent/tools/registry.json (wrong path)
- Actual registry is at /var/lib/agent/tools/registry.json
- Fix: Update the agent config to use the correct path

## Non-destructive test:
docker exec agent-service /agent-cli --dry-run --config-set tool_registry_path=/var/lib/agent/tools/registry.json

## If test passes:
docker exec agent-service /agent-cli --config-set tool_registry_path=/var/lib/agent/tools/registry.json

## Verification:
docker exec agent-service /agent-cli --config-get tool_registry_path
# Expected output: /var/lib/agent/tools/registry.json

docker exec agent-service systemctl restart agent

# Wait 10s, then check:
curl -s http://localhost:8080/tools/weather | jq .
# Expected: tool details, not "not found"
```

## Real-World Example

A multi-agent system running four distributed agents. One agent can't call a custom tool. The tooling coordinator reports "tool not found: validate_market_conditions."

**Local analysis** (2 hours wasted):
- Checked the tool definition in YAML: ✓ Present and syntactically valid
- Checked the agent config that references it: ✓ Listed correctly
- Checked Docker Compose volumes: ✓ Tool files are mounted into /tools/custom
- Checked for typos: ✓ None found

Still broken.

**Assumptions written down:**

A1: Tool file exists inside container at /tools/custom/market.py
A2: Agent's tool loader reads from /tools/custom
A3: The tool is registered under the name "validate_market_conditions"
A4: No other agent has overridden this tool name
A5: Agent process can read the file (permissions)

**Verification session (20 minutes):**

```
A1: docker exec agent-3 ls -la /tools/custom/market.py
    → Result: File not found
    Actual: ls /tools shows only default_tools/, no custom/
    Verdict: WRONG

A2: docker exec agent-3 env | grep TOOL
    → Result: TOOL_PATH=/tools, not /tools/custom
    Verdict: WRONG

A3: docker exec agent-3 /agent-cli list-tools | grep validate
    → Result: No output (tool not registered)
    Verdict: WRONG

A4: docker exec agent-1 /agent-cli list-tools | grep validate
    → Result: Registered as "validate_market_conditions" by agent-1
    Verdict: PARTIAL (only agent-1 has it, not agent-3)

A5: docker exec agent-3 stat /tools/custom 2>&1
    → /tools/custom: No such file or directory
    Verdict: NOT_APPLICABLE (directory doesn't exist)
```

**The verdict table revealed:** 4 of 5 assumptions were completely wrong. The tool is mounted into `/tools`, not `/tools/custom`. Only agent-1 has the tool registered (it wasn't distributed to agent-3). The tool registration step must have been skipped during agent-3's init.

**The actual fix** (not what you'd have done from local analysis):
- Copy the tool definition to agent-3's init sequence
- Deploy agent-3 with the updated init
- Verify: `docker exec agent-3 /agent-cli list-tools | grep validate` → "validate_market_conditions: ✓ Registered"

**Time saved:** ~90 minutes. **Files changed:** 1 (agent-3's init config), not 6.

## Packaging Notes

This protocol is practitioner doctrine. It's built from real broken systems, not theory. The voice is intentionally blunt because the stakes are high—if you're debugging a production multi-agent system, you need clarity, not reassurance.

The template structure is designed to be copy-paste ready. Operators should be able to take the Diagnostic Memo template, fill it out, hand it to a co-worker or a separate Claude session, get back the verification results, and immediately know what to fix.

The non-destructive test requirement saves catastrophic mistakes. Include it in every fix.

The core discipline—separate the diagnostic session from the fix session—is counterintuitive. Most engineers want to debug and fix simultaneously. This protocol forces a hand-off. It's uncomfortable. It works.

Used at scale: 4 assumptions → verdict table → 1-file fix instead of 6-file rework. Applied to agent configs, service deployments, tool registry issues, and cross-system integrations.

Price point: $29. This is a specific, narrow protocol for a specific problem. Operators either need it or they don't. It's not a framework or a general debugging guide. It's a technique that fixes a real category of mistake.