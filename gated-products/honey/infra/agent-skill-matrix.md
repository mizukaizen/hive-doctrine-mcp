---
title: "Agent Skill Matrix — Capability Tracking for Multi-Agent Teams"
author: Melisia Archimedes
collection: C4-infrastructure
tier: honey
price: 49
version: 1.0
last_updated: 2026-03-09
audience: agent-builders
hive_doctrine_id: HD-0020
---

# Agent Skill Matrix

Stop pretending you know what your agents can do. Track it systematically instead.

## The Problem

You've built a multi-agent system. Agent Alpha handles research, Agent Bravo writes content, Agent Charlie manages data. Each agent has access to a bunch of tools and skills. Then something breaks—a skill stops working, an API key expires, or you spin up a new agent and can't remember which tools it needs. You search your codebase. You ask an agent "what can you do?" and get a hallucinated answer. You discover Agent Delta has been using a deprecated image-generation tool for three weeks because nobody told it to switch.

This is skill drift. It happens in every multi-agent system that doesn't track capabilities explicitly.

The fix is simple: a single source of truth for which agents have access to which skills, why, and what state each one is in. Not documentation you write once and never update. A working matrix you reference when adding features, auditing permissions, and debugging "why can't the agent use X?"

This product gives you the framework, the template, and the policies to prevent skill drift.

## What This Is

The Agent Skill Matrix is a practical tracking system for multi-agent capability management. It covers:

1. **Global skills**: tools available to all agents through a shared mechanism (e.g. a mounted directory, a base runtime library)
2. **Per-agent skills**: agent-specific overrides or customisations (extra credentials, specialised tools, API keys)
3. **Policy rules**: when to duplicate a skill vs. share it globally, how to handle deprecation, permission models
4. **Status tracking**: Active, Needs Setup, Deprecated, No Triggers—quick visual scanning to spot problems
5. **Audit and maintenance**: how to review the matrix monthly and keep it current

## The Template

Use this markdown table as your starting point. Create it at the root of your agents' shared workspace or in your config repository.

### Global Skills (Available to All Agents)

| Skill | Status | Dependencies | Notes |
|-------|--------|--------------|-------|
| web-search | Active | – | Basic web search via public API—no setup needed |
| memory-search | Active | ripgrep binary | Local file search; requires ripgrep installed in runtime |
| image-generation | Needs API key | API credentials file | Set `IMAGE_GEN_API_KEY` in container env before runtime startup |
| transcription | Active | – | Built-in to agent runtime; handles audio-to-text |
| content-fetch | Needs credentials | Email/password | Requires credential file at `~/.agent/credentials/content.json` |
| slack-integration | Needs setup | Slack workspace API token | Per-workspace token; generate in Slack admin panel, add to env |
| news-aggregator | Active | – | No external dependencies; built on public news feeds |
| **deprecated-tool-v1** | **Deprecated** | – | Replaced by deprecated-tool-v2 (released 2026-02-15). Remove after all agents migrate. |

### Per-Agent Skills

These override or supplement global skills when agent-specific configuration is needed. Typical scenarios: per-agent API keys (e.g. Slack tokens for different workspaces), specialist tools only certain agents use (e.g. code-generation for Agent Alpha only), or customised versions of global tools.

| Skill | Agent Alpha | Agent Bravo | Agent Charlie | Agent Delta | Agent Echo |
|-------|-------------|------------|---------------|-------------|-----------|
| code-generation | Yes | No | Yes | No | No |
| advanced-analysis | Yes | No | Yes | Yes | Yes |
| slack-integration | Yes (workspace-a) | Yes (workspace-b) | No | Yes (workspace-a) | No |
| vector-search | Yes | Yes | Yes | Yes | No |
| voice-synthesis | No | Yes | Yes | No | Yes |
| deprecated-tool-v1 | Yes (migrate required) | Yes (migrate required) | No | No | Yes (migrate required) |

**Key:** Yes = agent has this skill; Yes (note) = agent has it with special config; No = agent doesn't need it; blank = not assigned.

## Global vs Per-Agent: The Policy

**Use global skills when:**
- The tool is identical across agents (no customisation, no per-agent config)
- You want a single source of truth to avoid divergence
- The skill is foundational (web search, logging, memory)
- You're adding a new agent and don't want to manually copy skills

**Use per-agent skills when:**
- The agent needs a custom version of a global tool (e.g. different API endpoint, modified prompts)
- Each agent needs its own API credentials (e.g. different Slack workspace tokens)
- The tool is specialist—only 1–2 agents use it, and duplicating to all agents adds noise
- You need to version independently (one agent stays on v1 while others test v2)

**Rule of thumb:** Duplicate only when necessary. Default to global + config overrides.

## Status Categories

Track each skill's readiness with one of these:

| Status | Meaning | Action |
|--------|---------|--------|
| **Active** | Deployed and working. Agents can use it now. | Monitor. Update when new versions available. |
| **Needs Setup** | Functional but not ready. Usually waiting for credentials or configuration. | Track the blocker in Pending Actions. |
| **Needs API Key** | The skill is built, but needs an external API key (stripe key, weather API, etc.). | Add to Pending Actions: "Get API key from X, add to env." |
| **No Triggers** | The skill is available but not auto-invoked. Agents can call it manually or through explicit routing. | Document the manual invocation method. |
| **Deprecated** | Being phased out. Agents still using it, but replacement exists. | Set a migration deadline. Remove 2–4 weeks after all agents have migrated. |

## Implementation: Three Steps

### 1. Create the Matrix File

Save your skill matrix to a shared location—your Git repo, your agent workspace directory, or your team wiki. If you're using a multi-agent runtime, put it in the agents root folder. Every team member should know where it is.

Example structure:
```
agents/
  ├── shared/
  │   └── SKILL-MATRIX.md          ← The matrix lives here
  ├── agent-alpha/
  ├── agent-bravo/
  └── ...
```

### 2. Use the Template Above

Copy the markdown tables. Fill in:
- Your actual skill names (replace `web-search`, `image-generation`, etc. with the ones you've built)
- Your agent names (replace Agent Alpha, Bravo, etc.)
- Your infrastructure (replace env var names, file paths, etc.)
- The real status of each skill (check your config right now; don't guess)

### 3. Link It to Your Agent Configuration

Your agents need to know which skills are available. This depends on your runtime:

**If using a mounted directory approach** (common in containerised runtimes):
```yaml
# Example: agent config
agents:
  agent-alpha:
    skills_directory: /workspace/skills/global
    overrides: /workspace/skills/agent-alpha
```

**If using environment-based discovery:**
```bash
export AGENT_SKILLS="web-search,memory-search,image-generation"
export AGENT_ALPHA_SKILLS="code-generation,advanced-analysis"
```

**If using a runtime manifest:**
```json
{
  "agents": {
    "agent-alpha": {
      "skills": ["web-search", "memory-search", "code-generation"]
    }
  }
}
```

Document your method in the matrix file itself, or in a linked setup guide.

## Pending Actions Checklist

Add this section to your matrix to track blockers. Include:
- What needs to happen (e.g. "Get API key")
- Who owns it (e.g. "Ops Lead")
- Deadline (optional but useful)

Example:

```markdown
## Pending Actions

- [ ] Obtain web-search API key from vendor, add as `WEB_SEARCH_KEY` to container environment. Owner: Ops Lead. Deadline: [date].
- [ ] Configure Slack tokens for Agent Bravo workspace integration. Owner: Platform team. Deadline: 2026-03-20.
- [ ] Migrate Agent Delta from deprecated-tool-v1 to advanced-analysis. Owner: Agent Delta maintainer. Deadline: 2026-03-25.
- [ ] Remove deprecated-tool-v1 from global and per-agent directories after migration complete.
- [ ] Test vector-search on all agents after upgrade to v2.3.
```

Keep this list current. Review it weekly. Close items when done.

## Auditing and Maintenance

**Monthly audit checklist:**

1. **Status check**: Are all "Active" skills still working? Run a quick test or grep your logs for errors.
2. **Deprecation tracking**: Are any Deprecated skills still in use? If so, accelerate migration or extend the deadline.
3. **Coverage check**: Is there a new feature that needs a skill? Add it to the matrix with "Needs Setup" status.
4. **Credential rotation**: Have any API keys expired? Check your Pending Actions.
5. **Divergence check**: Are per-agent skills drifting apart? If an override is outdated, reconcile or remove it.

**When adding a new skill:**

1. Build or integrate it (test locally)
2. Add a row to the Global Skills table with status "Needs Setup"
3. If only specific agents need it, add it to Per-Agent Skills instead with "Needs Setup"
4. Add a Pending Action if setup is required (credentials, config files, etc.)
5. Update status to "Active" when all agents can use it
6. Set a calendar reminder to audit it in 30 days

**When deprecating a skill:**

1. Change status to "Deprecated" in the matrix
2. Document the replacement in the Notes column
3. Add a migration deadline in Pending Actions (suggest 2–4 weeks)
4. Notify agents/teams that use it
5. Track migration progress
6. Remove the skill only after all agents have migrated

## Real Example: A Five-Agent System

Here's what a practical matrix looks like for a team of five agents in a research-and-content operation:

**Global Skills:**
- `web-search` (Active)
- `file-storage` (Active)
- `memory-search` (Active)
- `newsletter-publish` (Needs API key)

**Per-Agent Skills:**

| Skill | Research | Writing | Data | Strategy | Comms |
|-------|----------|---------|------|----------|-------|
| code-execution | Yes | No | Yes | No | No |
| content-generation | No | Yes | Yes | No | Yes |
| sentiment-analysis | Yes | No | Yes | Yes | No |
| slack-notifier | Yes (workspace-a) | Yes (workspace-a) | Yes (workspace-b) | Yes (workspace-a) | Yes (workspace-b) |

**Pending Actions:**
- Get newsletter API key from vendor (Owner: Platform. Deadline: 2026-03-13)
- Rotate Slack tokens quarterly (Owner: Security. Next: 2026-04-09)

This is scanned in under 30 seconds. A new team member can understand the system immediately. You can spot drift—"Why does the Data agent have code-execution?"—in one glance.

## Packaging Notes

**For your product or template library:**

1. Include the blank template as a Markdown snippet (easy copy-paste)
2. Include the real example above as a reference
3. Include a one-page "How to Audit" checklist
4. Consider a CSV or YAML export format if you're auto-generating the matrix from your runtime config
5. Link to your runtime's skill-loading docs (how agents actually discover skills)

**If you're selling this:**
- Price it as infrastructure tooling (£30–50 GBP / $40–70 USD)
- Bundle with a runbook if you have one
- Offer a template in both Markdown and Google Sheets for teams who prefer spreadsheets
- Include a one-page "migration guide" for teams moving from ad-hoc skill management to systematic tracking

**If you're using this internally:**
- Save it to your Git repo
- Update it every time you add or change a skill
- Link to it in your agent onboarding docs
- Review it in your monthly ops standup

## Why This Matters

Skill drift sounds like a small problem until it costs you an hour of debugging because an agent's been using an expired API key for a week. Or until you deploy a new agent and it doesn't have access to the tools it needs. Or until you decommission a skill and forget to remove it from half your agents.

The matrix forces you to be explicit about capability distribution. It's a single source of truth. It scales from 2 agents to 50. It catches gaps before they become incidents.

Use it.
