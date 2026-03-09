---
title: "Security Audit Report Template — Traffic-Light Vulnerability Assessment for AI Infrastructure"
author: Melisia Archimedes
collection: C5-security-ops
tier: honey
price: 79
version: 1.0
last_updated: 2026-03-09
audience: agent-builders
hive_doctrine_id: HD-0035
---

# Security Audit Report Template — Traffic-Light Vulnerability Assessment

## The Problem

You've built an AI multi-agent system. It's running on a VPS. It's connected to live APIs. Your LLM keys have billing tied to them. Your agents have credentials. You've got financial integrations. And you haven't had a proper security audit because:

1. You don't know what to check in an AI stack—most security frameworks assume web apps and databases, not agents pulling from 15 different APIs and syncing credentials across servers.
2. You can't get a professional audit because it costs 5–20k and takes 3 weeks.
3. You're shipping something valuable and you can feel the risk but you don't know if it's "medium risk, fix it later" or "critical, fix it now."

This template gives you the framework. It's built from a real multi-agent audit of a production infrastructure running 4 bots, 6 AI agents, Docker, Syncthing, and 3 API providers. It covers the gaps that matter: secrets management, container isolation, SSH hardening, network exposure, and credential sprawl.

## The Solution: Traffic-Light Severity System

This template uses a three-tier severity model instead of CVSS/CVSS scores. It's faster to work with and maps directly to action planning:

- **🔴 RED:** Fix today. Critical risk. Financial exposure, credential compromise, or privilege escalation. Action plan: immediate.
- **🟡 AMBER:** Fix this week. Significant gaps in defence-in-depth. No immediate exploitation path but adds up. Action plan: 3–7 days.
- **🟢 GREEN:** Passed. Control is implemented or risk is acceptable. No action required. Document and move on.

This matches how builders actually think: "Can I get pwned tomorrow? Can I get pwned this month? Did I get this right?" Forget the CVSS scale. Focus on your action plan.

## The Core Template Structure

### 1. Executive Summary

One paragraph. Give the reader the traffic light dashboard immediately. Format:

```
Overall posture is [RISK LEVEL: low/medium/high].
Key strengths: [2–3 things done right].
Key gaps: [2–3 critical issues that need action].
Action items: [X RED · Y AMBER · Z GREEN].
```

Then a one-row-per-category table with category, rating, and key finding. This is your scoreboard. It answers the question "Should I ship this?" in 30 seconds.

### 2. Traffic Light Dashboard Table

| Category | Rating | Key Finding |
|----------|--------|-------------|
| SSH & VPS Hardening | 🟡 AMBER | [Brief description] |
| Secrets & API Keys | 🔴 RED | [Brief description] |
| Container Security | 🟡 AMBER | [Brief description] |
| Network Exposure | 🟢 GREEN | [Brief description] |
| Credential Storage | 🟡 AMBER | [Brief description] |
| [Your Infrastructure] | [Rating] | [Finding] |

Each row is one major control area. Scan the column for 🔴. If you see red, you're blocked from shipping until it's fixed. If you see only 🟡 and 🟢, you can ship and remediate AMBER items this week.

### 3. Critical Findings (RED)

For each RED finding, use this structure:

```
RED-N: [Finding Title]

**What it is:** Plain English. What vulnerability exists.

**Evidence:** How you found it. Command run, output, file path.

**Risk:** Why this matters. What's the blast radius? What can an attacker do?

**Fix:** Actionable remediation. Not "use a secrets manager" but "move keys to
/your-secrets-path/ and reference via env_file."
```

Example:

```
RED-1: API Keys Stored in Plaintext in docker-compose.yml

**What it is:** Three live API keys stored as plaintext environment
variables in the compose file:
- XAI_API_KEY (full key visible)
- ANTHROPIC_API_KEY (full key visible)
- TAVILY_API_KEY (full key visible)

**Evidence:** Direct read of /root/compose/docker-compose.yml lines 60–62.
All three keys fully exposed.

**Risk:** Any code that can read the filesystem (path traversal,
compromised dependency, any container with a volume mount to the compose
directory) gains all three keys. These keys have billing implications and
can be used to exfiltrate data via the LLM API. The Anthropic key is
high-value.

**Fix:** Move keys to /root/secrets/ as individual files and reference via
Docker env_file. See Action Plan section RED-1.
```

Keep it direct. No fluff. The person reading this is deciding whether to ship today or spend the afternoon patching.

### 4. Medium Findings (AMBER)

Same structure as RED, but stack them closer together. AMBER items are important but not ship-blockers. Use them to build your "fix this week" list.

```
AMBER-N: [Title]

**Evidence:** [How you found it]
**Risk:** [What can go wrong]
**Fix:** [Remediation path—can be less detailed than RED]
```

Group AMBER items by category if you have more than 4. Readers need to scan and prioritise.

### 5. Passing Checks (GREEN)

Bullet list. Be specific. Readers need to know what you actually checked.

```
- **SSH key hardening:** Single Ed25519 key, clean authorised_keys, no legacy RSA,
  verified with `ssh-keygen -l -f ~/.ssh/authorized_keys`
- **UFW active:** Default deny inbound, only ports 22/80/443 allowed, verified
  with `ufw status verbose`
- **Docker socket isolation:** No docker.sock mounts, verified with
  `docker inspect [container_name]` across all containers
- **TLS certificates:** mcp.your-domain.ai (expires May 2026), verified with
  `echo | openssl s_client -connect mcp.your-domain.ai:443`
```

This is the trust-building section. Show what you got right. It matters.

### 6. Gap Analysis Table

This is your audit's summary table. Map each control to best practice vs. current state vs. gap severity.

| Control | Best Practice | Current State | Gap |
|---------|--------------|---------------|-----|
| Secrets management | Docker secrets or env_file outside repo | Plaintext in compose file | HIGH |
| SSH brute-force protection | Fail2Ban with 5-attempt ban | Not installed | HIGH |
| Container privileges | Non-root user | Runs as root | MEDIUM |
| Network isolation | Bridge networks between containers | Host network mode | MEDIUM |
| Secrets mount | Read-only | Mounted :rw | MEDIUM |
| Log rotation | max-size/max-file in Docker config | Not configured | LOW |

Use this table to:
1. Show completeness of the audit (you checked these controls)
2. Justify why you picked the RED and AMBER items (highest gaps)
3. Give the reader a roadmap for what to fix next (sorted by gap severity)

### 7. Prioritised Action Plan

Break remediation into timeframes:

#### Immediate (Today)

Start with the RED items. Give exact commands.

```bash
# 1. Move API keys out of docker-compose.yml
echo "xai-your-key-here" > /root/secrets/xai_api_key
echo "tvly-your-key-here" > /root/secrets/tavily_api_key
echo "sk-ant-your-key-here" > /root/secrets/anthropic_api_key
chmod 600 /root/secrets/*_api_key

# Update docker-compose.yml to reference files instead:
# env_file:
#   - /root/secrets/.env.api

# 2. Install Fail2Ban
apt-get install -y fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
maxretry = 5
bantime = 3600
findtime = 600
EOF
systemctl enable fail2ban && systemctl start fail2ban
fail2ban-client status sshd
```

#### This Week

AMBER items that compound if left alone. Give the engineer enough detail to prioritise:

```
4. Harden SSH configuration
5. Fix /root/secrets mount to read-only in docker-compose.yml
6. Move agent credentials out of Syncthing vault
7. Add Docker log rotation to compose file
8. Add rate limiting to reverse proxy (Caddy/Nginx)
```

#### This Month

Lower priority but important for long-term hardening. These don't block shipping:

```
9. Audit and rotate old backup credentials
10. Run containers as non-root users
11. Migrate from host network mode to bridge networks
12. Enable read-only filesystem on all containers
```

This timeframe structure answers the question every builder has: "Can I ship while I fix this?" RED = no. AMBER = yes if you commit to this week. GREEN = yes, no action needed.

### 8. Unknowns & Manual Review Required

Call out what you didn't check or what requires human judgment:

```
- **Cloud firewall configuration:** Confirm whether a cloud-level firewall is
  configured in your hosting provider's dashboard. UFW is your only gate if not.
- **Credential key rotation:** After moving keys to /root/secrets/, rotate both
  XAI and Anthropic keys via their dashboards. Keys in git history should be
  considered potentially exposed.
- **Revenue agent credentials scope:** API key in workspace/.credentials/ —
  confirm whether this is a live or test key. Live = critical priority.
- **Port 3003 authentication:** Reverse proxy returns "Unauthorized" suggesting
  app-level auth exists. Confirm whether auth is token-based or IP-restricted.
- **Old backup data:** 2.4GB backup from decommissioned VPS in /root/old-backup/.
  Determine whether credentials within are still valid/in-use, then encrypt or delete.
```

This section tells the reader: "I did a thorough job but some things need a human decision." It prevents false confidence.

## The Finding Template (for your own use)

When you discover a vulnerability during audit, use this format:

```
### [SEVERITY]-[NUMBER]: [Title]

**File/Location:** [Exact path or configuration]

**What it is:** [Plain description of the issue]

**Evidence:** [Command you ran and output, or screenshot, or direct observation]

**Current:** [What's currently happening]

**Best practice:** [What should be happening]

**Risk:** [Why this matters—data exposure, privilege escalation, DoS, etc.]

**Blast radius:** [Who/what gets compromised if exploited]

**Fix:** [Exact steps to remediate, with commands where applicable]

**Verification:** [How to prove it's fixed]

**Timeline:** [When this should be fixed—immediate/this week/this month]
```

This is your internal form. Use it to fill in the template sections above.

## Common AI Infrastructure Findings to Check

When you're auditing an agent-based system, prioritise these areas:

**Secrets Management:**
- API keys in plaintext in docker-compose.yml, .env files, or git history
- LLM API keys readable by all containers
- Agent credentials (GitHub, Stripe, Vercel) stored with world-readable permissions
- Secrets synced via Syncthing to untrusted machines

**Container Isolation:**
- Containers running as root
- Host network mode (no network segmentation)
- /root/secrets/ or credential directories mounted read-write instead of read-only
- docker.sock mounted into containers (container escape vector)

**SSH & VPS Hardening:**
- No Fail2Ban or rate limiting on SSH port 22
- X11Forwarding enabled on headless servers
- PasswordAuthentication not explicitly disabled
- Old or RSA SSH keys mixed with Ed25519

**Credential Sprawl:**
- Agent .credentials directories with world-readable permissions
- Financial keys (Stripe, wallets) stored unencrypted in synced vaults
- Multiple .env files with different permission levels (some 644, some 600)

**Network Exposure:**
- No rate limiting on public reverse proxies
- Internal services (port 3001, 3003) exposed to 0.0.0.0 without authentication
- Syncthing GUI or other internal tools exposed externally

**Log & Audit:**
- No Docker log rotation configured (disk exhaustion risk)
- No audit trail of who access secrets or API keys
- Old backups with live-era credentials still stored

## Recurring Audit Schedule

Don't audit once and forget. Build this into your operations:

```yaml
# Add to your cron or CI/CD:

# Monthly security spot-check (30 mins)
0 9 1 * * /usr/local/bin/security-check.sh

# Quarterly full audit (2–3 hours)
0 10 1 */3 * /usr/local/bin/full-audit.sh

# Daily automated scanning (secrets exposure, open ports)
0 2 * * * /usr/local/bin/daily-scan.sh
```

For each audit run, use this template. Keep every report. Track which RED and AMBER items were fixed. Build a trend line.

## Customising This Template for Your Stack

The structure above is framework-agnostic. Modify the categories based on what *you* run:

- Running Kubernetes instead of Docker? Add Pod Security Policies section.
- Using managed LLM APIs instead of self-hosted models? Modify API security section.
- Running agents on AWS Lambda? Add Lambda-specific findings (IAM roles, env vars, log groups).
- Multi-region setup? Add cross-region replication and secret propagation sections.

Keep the traffic light system. Keep the "immediate/this week/this month" timeframe. Keep the RED/AMBER/GREEN severity model. Change the categories to fit your architecture.

## Why This Works

1. **Fast to read:** 30 seconds gets you the score. 10 minutes gets you the action plan. 1 hour gets you the detail.
2. **Fast to execute:** Named timeframes mean you can plan staffing and sprint capacity.
3. **Built for multi-agent systems:** Covers Docker, credentials across machines, agent-specific risks.
4. **Repeatable:** Use the same template quarterly. Watch your posture improve. Track progress.
5. **Actionable:** Every RED item has exact commands. Every AMBER item has a week assigned. No vague recommendations.

The builders who use this template do three things right:
- They ship their system within a week (not blocked by perfect security)
- They fix the critical RED items immediately (shipping safely)
- They harden AMBER items over the month (building resilience)
- They re-audit quarterly (catching new gaps)

That's the balance. Audit. Ship. Harden. Repeat.

---

## Quick-Start Checklist

To run your first audit using this template:

- [ ] Gather infrastructure details (VPS specs, Docker services, agents, integrations)
- [ ] SSH into your server and run diagnostic commands (docker ps, ps aux, netstat, docker inspect, file permissions)
- [ ] Collect evidence (outputs, logs, config files with PII stripped)
- [ ] Map findings to RED/AMBER/GREEN using the severity definitions above
- [ ] Build the traffic light dashboard table first (5 mins, high-value summary)
- [ ] Write RED findings with exact fix steps (15 mins)
- [ ] Write AMBER findings with timeframes (15 mins)
- [ ] List GREEN checks to show completeness (10 mins)
- [ ] Build the gap analysis table (10 mins, justifies your severity picks)
- [ ] Generate the action plan by timeframe (10 mins, pull from RED/AMBER descriptions)
- [ ] Add unknowns/manual review section (5 mins, prevents false confidence)
- [ ] Send to team with the question: "Can we ship while fixing RED items this week?"

Total time: 80 mins for a production infrastructure audit. Compare that to waiting 3 weeks for an external audit at 5k–10k.

---

**Use this. Audit your stack. Ship safely. Fix hard things systematically. Build the next wave.**
