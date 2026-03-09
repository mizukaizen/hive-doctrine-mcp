---
title: "Claude Code Project Architecture — Turn Your AI Assistant into a Multi-Agent System"
author: Melisia Archimedes
company: The Hive Doctrine
collection: C7-dev-mastery
tier: doctrine
price: 9.99
version: 1.0
last_updated: 2026-03-09
audience: developers, claude-code-users
hive_doctrine_id: HD-0063
---

# Claude Code Project Architecture

## The Hidden Control Plane Most Developers Miss

You're using Claude Code as a pair-programmer. That's fine. But you're leaving 80% of its power on the table.

The real game is treating Claude Code as an orchestration platform — not just for this conversation, but across your entire project. The `.claude/` folder structure is your control plane. It's not documentation. It's not optional. It's where you define how your AI assistant behaves across every session, every tool call, every interaction.

Most developers don't know this folder exists. The ones who do treat it like a .gitignore — throw something in there and forget about it. That's a mistake. The `.claude/` structure is how you scale from "Claude helping me debug" to "Claude managing my entire development pipeline."

This document shows you how.

---

## The Problem: Configuration Chaos

Here's how most teams use Claude Code today:

**Session 1:** "Hey Claude, here's my codebase. Please follow these 47 rules I'm about to copy-paste."

**Session 2:** "Hey Claude, remember those 47 rules? No? Let me paste them again."

**Session 3:** You've got 3 versions of those rules. Two contradict each other. Claude is confused. You're frustrated.

By Session 10, you have:
- Inconsistent behaviour across sessions
- Rules that apply sometimes but not always (because they're in chat, not in your control plane)
- No way to update instructions across your entire team
- Knowledge that only exists in one person's head

The root cause: you're treating AI instructions like chat history. They're not. They're infrastructure.

---

## The Solution: Five Layers of Structured Configuration

The `.claude/` folder gives you five ways to control Claude's behaviour — each with different enforcement levels and use cases.

### Layer 1: AGENTS — Isolated Subagents with Restricted Scope

Create independent AI agents, each with its own context window, tool access, and system prompt.

**What this solves:**
- You're building a backend system that needs different AI oversight than your frontend
- You need one agent that can SSH and run destructive commands, another that can only read code
- You want agents with specialised knowledge (one for database design, one for API routing, one for security review)
- You want to run multiple AI tasks in parallel with different risk profiles

**How it works:**
Each agent lives in `.claude/agents/[agent-name]/` as a markdown file with YAML frontmatter:

```
.claude/agents/
├── database-architect/
│   └── AGENT.md         # System prompt + config
├── security-auditor/
│   └── AGENT.md
└── frontend-reviewer/
    └── AGENT.md
```

**Key properties:**
- **Isolated context:** Each agent has its own conversation thread — no information leakage between them
- **Restricted tools:** Agent A can SSH to production; Agent B can only read local files
- **Custom model:** Run one agent on Opus 4.6, another on Haiku (faster + cheaper for routine tasks)
- **MCP server access control:** Agent A accesses your database MCP server; Agent B doesn't
- **Independent permission modes:** Different privacy levels, different approval thresholds

**Invocation:** Automatic (triggered by rules or hooks) or manual via `/agents security-auditor "Review this code"`.

---

### Layer 2: RULES — Modular Instructions (Probabilistic)

Replace your monolithic `CLAUDE.md` with composable instruction files. Each rule is scoped to specific file paths and contexts.

**What this solves:**
- Your codebase has 5 subsystems with different coding standards
- You need different behaviour in the `/backend` folder vs `/frontend` folder
- You want to enforce a database schema review process without hardcoding it into every session
- You're sharing Claude Code with team members — each needs slightly different rules based on their role

**How it works:**
Rules live in `.claude/rules/` as markdown files. Each has YAML frontmatter defining scope:

```yaml
---
name: "Database Schema Reviews"
scope: ["**/schema.sql", "**/migrations/**"]
applies_to: [developers, code-reviewers]
priority: high
---

Before modifying any schema file, extract the current table definitions,
index usage, and foreign key constraints. Explain the impact of changes on:
1. Query performance (use EXPLAIN ANALYZE)
2. Data migration complexity
3. Backward compatibility
4. Rollback procedure
```

**Key properties:**
- **Composable:** One file per concern (database, security, documentation, testing)
- **Scopable:** Rules apply only to matching file paths
- **Layered:** User-level rules (`~/.claude/rules/`) load first; project-level rules (`./.claude/rules/`) override them
- **Probabilistic enforcement:** Claude's judgment applies (rules aren't bulletproof like hooks)

**Scope hierarchy:**
1. Global user rules (`~/.claude/rules/`) — apply everywhere
2. Project rules (`./.claude/rules/`) — override global
3. Rules are applied by filename pattern and layer

---

### Layer 3: SKILLS — Reusable Knowledge Bundles

Capture repeatable workflows as skills. Each skill is a self-contained knowledge block that can be invoked manually or automatically.

**What this solves:**
- You have a complex deployment checklist that changes once a quarter
- You want Claude to run a specific "code review" workflow consistently
- You need to document how to use obscure internal tools
- You want to share knowledge with team members without a 2-hour handoff

**How it works:**
Each skill lives in `.claude/skills/[skill-name]/`:

```
.claude/skills/
├── deploy-to-staging/
│   ├── SKILL.md           # Markdown + YAML frontmatter
│   ├── checklist.txt      # Reference files
│   └── risks.md
├── security-audit/
│   ├── SKILL.md
│   ├── checklist.md
│   └── owasp-checklists/
└── schema-migration/
    ├── SKILL.md
    └── templates/
```

**SKILL.md frontmatter:**
```yaml
---
name: deploy-staging              # becomes /slash-command
description: "Run full staging deployment with rollback plan"
disable_model_invocation: false   # Can this be auto-invoked?
user_invocable: true              # Can users call /deploy-staging?
---
```

**Key properties:**
- **Scoped context:** Each skill bundles all needed context (procedures, templates, risk matrices)
- **Auto-invocation:** Skills can be triggered by hooks or rules
- **Persistence:** Skills exist across sessions — no need to re-explain complex workflows
- **Templatable:** Skills can include reference files (checklists, code templates, decision trees)

**Invocation:**
- Manual: `/skills deploy-to-staging`
- Automatic: Triggered by PostToolUse hook when a specific condition is met

---

### Layer 4: COMMANDS — Custom Slash Commands (Simpler Alternative)

Simple key-value commands without the structure of skills. Use this for quick shortcuts.

**What this solves:**
- You want a faster way to reference common tasks than writing a full skill
- You need lightweight aliases (e.g., `/audit` → "Run full code audit")
- You want to create team-wide shortcuts without documentation overhead

**How it works:**
Simple markdown files in `.claude/commands/`:

```
.claude/commands/
├── audit.md
├── test.md
└── lint.md
```

Each file defines behaviour. Commands are lighter than skills — no auto-invocation, no MCP integration, just shorthand for common requests.

---

### Layer 5: HOOKS — Deterministic Event Scripts (100% Enforced)

Hooks execute with certainty. No judgment. No probabilistic enforcement. They run on specific events: SessionStart, SessionEnd, PreToolUse, PostToolUse.

**What this solves:**
- You need to audit every SSH command before it runs
- You need to log every database migration
- You need to capture metrics before a session ends
- You need to verify tool safety before specific operations

**How it works:**
Hooks are defined in `.claude/hooks/` and triggered by events:

```yaml
# .claude/hooks/PreToolUse.yaml
---
name: "SSH Safety Check"
trigger: "PreToolUse"
tool: "bash"
pattern: "^ssh|^rm -rf|^DROP TABLE"
action: "block_with_confirmation"
message: "Destructive SSH command detected. Request explicit user confirmation."
---
```

**Key events:**
- `SessionStart` — runs when you start a new session (load context, verify environment)
- `SessionEnd` — runs at session close (log usage, archive session context)
- `PreToolUse` — runs before any tool call (safety check, permission verification)
- `PostToolUse` — runs after tool completes (log results, trigger dependent actions)

**Enforcement:**
Hooks are deterministic and 100% enforced. If a hook blocks an action, it blocks. No exceptions (unless explicitly overridden by user confirmation).

---

## The Decision Matrix: When to Use What

| Scenario | Use | Reason |
|----------|-----|--------|
| One team member needs different rules than another | **Rules** (scoped by user role) | Lightweight, applies only to relevant code |
| You need to guarantee an action is audited before running | **Hooks** (PreToolUse) | 100% enforced, deterministic |
| You have a complex workflow that changes quarterly | **Skills** (with reference templates) | Persistent, shareable, self-contained |
| You need different Claude instances for different subsystems | **Agents** (isolated subagents) | Full isolation, independent tool access |
| You want a quick alias without full structure | **Commands** (simple shortcuts) | Lightweight, minimal overhead |
| You need to update instructions across your whole team | **Global rules** (`~/.claude/rules/`) | Propagate automatically to all projects |
| You need to control Claude's behaviour on all SSH calls | **Hooks** (PreToolUse + tool pattern matching) | Deterministic, applies to all matching calls |

---

## Architecture Pattern: The Layered Control Plane

Your `.claude/` folder is your **local control plane**. This applies even when SSH-ing to remote systems.

```
Mac (local machine)
├── ~/.claude/                 # User-level defaults (applies to all projects)
│   ├── rules/
│   ├── agents/
│   └── hooks/
└── project-A/
    └── .claude/              # Project overrides (applies only to this project)
        ├── rules/            # These override ~/.claude/rules/
        ├── agents/
        ├── skills/
        ├── commands/
        └── hooks/

                ↓ SSH to remote system ↓

Production VPS
├── /root/obsidian/          # Synced project files (no .claude/ here)
└── bots/                     # Live code

---

Control flow:
1. Load ~/.claude/rules/          (user defaults)
2. Override with ./.claude/rules/ (project-specific)
3. Load ~/.claude/agents/         (global agents)
4. Load ./.claude/agents/         (project agents override)
5. Execute hooks deterministically (PreToolUse, PostToolUse)
6. Apply rules probabilistically during the session
```

**Key insight:** Your `.claude/` folder is on your local machine. The remote system doesn't need it. Claude reads the config locally before executing commands remotely. This means you have **local control** even when working across multiple servers.

---

## Implementation Example: Real-World Setup

Here's how a mid-sized team structures this:

```
.claude/
├── MANIFEST.md                    # Index of all layers

├── rules/
│   ├── database-schema.md         # "Before touching schema files, extract current state"
│   ├── backend-standards.md       # "All backend changes require test coverage"
│   ├── frontend-standards.md      # "All UI changes show preview before commit"
│   ├── security-audit.md          # "Database migrations need security review"
│   └── remote-safety.md           # "SSH commands require explicit confirmation"

├── agents/
│   ├── database-architect/
│   │   └── AGENT.md               # Specialised for schema design
│   ├── security-auditor/
│   │   └── AGENT.md               # Can access SAST tools, not production
│   └── deployment-manager/
│   │   └── AGENT.md               # Can SSH, execute deploys, manage rollbacks

├── skills/
│   ├── full-database-audit/
│   │   ├── SKILL.md
│   │   └── checklist.md
│   ├── deploy-to-staging/
│   │   ├── SKILL.md
│   │   ├── rollback-plan.md
│   │   └── team-notification-template.txt
│   └── security-assessment/
│   │   ├── SKILL.md
│   │   └── owasp-checklist.md

├── commands/
│   ├── audit.md                   # /audit = "Run security audit skill"
│   ├── test.md                    # /test = "Run full test suite and report"
│   └── deploy.md                  # /deploy = "Trigger deployment skill"

└── hooks/
    ├── PreToolUse.yaml            # Block dangerous patterns, log SSH
    ├── PostToolUse.yaml           # Log tool results, trigger notifications
    ├── SessionStart.yaml          # Load environment context, verify permissions
    └── SessionEnd.yaml            # Archive session, update team dashboard
```

**Usage flow:**
1. **Day 1 developer:** Clones repo, Claude loads `./.claude/` automatically
2. **Dev writes code:** Rules apply as they code (probabilistic guidance)
3. **Dev wants to deploy:** Types `/deploy` → calls deploy-to-staging skill
4. **Deploy begins:** PreToolUse hook verifies permissions + asks for confirmation
5. **Deploy completes:** PostToolUse hook logs results + notifies team Slack
6. **Session ends:** SessionEnd hook archives session transcript for audit trail

---

## Key Insights: Why This Matters

### Insight #1: Probability vs. Determinism
Rules are probabilistic (Claude's judgment). Hooks are deterministic (always execute). Use rules for guidance, hooks for safety.

### Insight #2: Local Control Matters
Your `.claude/` folder is on your machine. This means you retain control of Claude's behaviour even when working with remote systems. You're not dependent on server config or cloud setup.

### Insight #3: Composition Over Monoliths
Stop writing 100-line system prompts. Write five 20-line rules instead. They're easier to version, override, and reason about.

### Insight #4: Agents as Process Isolation
Different subsystems need different oversight levels. Agents give you isolation without spawning new processes. One agent can SSH with audit logging; another can only read files. No context leakage.

### Insight #5: Skills as Persistent Knowledge
Your deployment procedure, security audit checklist, database migration process — these should live in code, not in someone's head. Skills make that possible.

---

## Packaging Notes (Why This Matters)

**For individual developers:**
- Reduces mental load: Stop re-explaining complex procedures every session
- Enables consistency: Same rules applied automatically across your codebase
- Improves collaboration: Share your `.claude/` folder with teammates; they inherit your standards

**For teams:**
- Version control for AI behaviour: Track changes to agent prompts, rules, and hooks in Git
- Audit trail: Hooks log every operation; security reviews have full transparency
- Scaling without chaos: Add new agents without modifying existing ones

**For organisations:**
- Reduce training time: New developers inherit the team's standards via `.claude/`
- Enforce compliance: Hooks can block non-compliant actions deterministically
- Distribute expertise: Agents can be specialised for different domains (security, performance, architecture)

---

## Next Steps

1. **Start with rules:** Create `.claude/rules/` with 2–3 files for your codebase's main concerns
2. **Add one agent:** Specialise for your riskiest operation (deployment, database changes, security)
3. **Build one skill:** Automate your most-repeated workflow (testing, auditing, deployment)
4. **Implement hooks:** Start with PreToolUse for safety-critical operations
5. **Document in MANIFEST.md:** Keep a map of what each layer does

The `.claude/` folder isn't decoration. It's your control plane. Use it.

---

**The Hive Doctrine | Melisia Archimedes | March 2026**
