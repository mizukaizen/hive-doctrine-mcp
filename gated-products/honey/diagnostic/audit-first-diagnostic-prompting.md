---
title: "Audit-First Diagnostic Prompting — The Framework That Finds Bugs AI Would Otherwise Miss"
author: "Melisia Archimedes"
collection: "Diagnostic Patterns"
tier: "honey"
price: 49
version: "1.0.0"
last_updated: "2026-03-09"
audience: "AI-assisted developers, agent operators, anyone debugging complex systems with LLMs"
hive_doctrine_id: "HD-0072"
---

## The Problem

You're three hours into debugging a production system failure. Your LLM has offered six different fixes. You've applied three of them. Two made things worse. One had no effect. The sixth is still pending.

Here's what happened: you asked an AI to *prescribe* a solution based on your description of the symptoms. The model made assumptions about what went wrong and jumped straight to remediation. It hallucinated one part of the diagnosis, which cascaded into misaligned fixes. You caught the obvious ones but missed the secondary break that your prescriptive prompt would never expose.

This is the diagnostic failure pattern: **instruction framing beats context framing, but instruction framing is brittle.** When you tell an AI "do these troubleshooting steps," it optimises for narrative coherence, not truth. It fills gaps with plausible-sounding explanations. It assumes the simplest root cause and misses compound failures.

Audit-First Diagnostic Prompting (AFDP) inverts this. Instead of asking the model to *diagnose and fix*, you ask it to *investigate independently, externalise its reasoning spatially, then propose—never implement.*

This framework has caught bugs that standard diagnostic prompts would miss entirely.

---

## The Solution

AFDP separates investigation from remediation across four distinct phases. Each phase has a specific cognitive burden on the model and produces artefacts that expose hallucination.

### Phase 1: Context

**Your job.** You provide:
- Symptoms (what the system is doing wrong)
- Expected state (what should be happening)
- Actual state (what is happening instead)
- Relevant files, logs, configs, or system diagrams (optional but powerful)

You don't diagnose. You don't hypothesise. You present facts.

```
CONTEXT
=======
Symptom: Agent A is missing scheduled daily briefings 40% of the time.
Expected: Every day at 09:00 UTC, Agent A receives a briefing containing market data + news.
Actual: Briefings arrive 09:00, 09:15, 09:42, skip day 4, 09:00, skip day 6.
Supporting data:
  - Task scheduler logs from [dates]
  - Agent memory audit log
  - System clock offset data
```

### Phase 2: Audit

**The model's job.** The model:
- Reads the files and logs you've provided
- Forms its own hypothesis without guidance
- Documents what it sees, not what it thinks you want to hear
- Flags contradictions and gaps
- Proposes diagnostic tests if data is incomplete

The model is not asked to fix anything. It's asked to investigate like a forensic analyst, not a repair technician.

```
AUDIT FINDINGS
==============
Observation 1: Logs show task scheduler executing at expected times (09:00 UTC).
Observation 2: Agent memory shows inconsistent message delivery—delivered on days 1-3, 5, 7-12; missing days 4, 6.
Observation 3: System clock data reveals +45 second drift on days 4 and 6.
Observation 4: Queue processor logs show zero failures; all messages marked as delivered.

Contradiction: Scheduler and queue logs suggest messages were sent. Agent memory suggests they weren't received.
Hypothesis: Message loss occurs between queue confirmation and agent memory persistence, possibly during backup windows on days 4 and 6.
```

### Phase 3: Gap Analysis + Diagram

**The model's job.** Now the model externalises the flow using ASCII diagram and produces a gap table.

This is where things break into visibility.

**ASCII Diagram** (expected vs actual flow):

```
EXPECTED FLOW
=============
09:00 → Scheduler triggers → Queue publishes → Agent receives → Memory persists → Briefing displayed
   ↓
 ALWAYS

ACTUAL FLOW
===========
09:00 → Scheduler triggers → Queue publishes → [BACKUP LOCK ACQUIRED]
                                              ↓
                                        Agent receives? [UNCLEAR]
                                              ↓
                                        Memory persists? [LOST HERE on day 4, 6]
                                              ↓
                                        Briefing displayed [MISSING]
```

The spatial layout exposes what prose hides: there's a causal break between "message published" and "message in memory." And it happens specifically when backup runs.

**Gap Table:**

| Component | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Scheduler execution | 09:00 UTC | 09:00 UTC | ✓ Working |
| Queue publish | Synchronous, <100ms | Varies, up to 45s on day 4, 6 | ⚠ Slow on backup days |
| Agent receive | Immediate | Inconsistent; missing on days 4, 6 | ✗ Failing |
| Memory persist | Atomic, logged | No log entries days 4, 6 | ✗ Failing |
| Briefing display | Present in UI | Missing in UI | ✗ Failing |

Root cause locations: (2) Queue delays during backup, (3) Agent receive timeout during backup lock, (4) Memory write blocked by backup WAL lock.

### Phase 4: Propose (Don't Implement)

**The model's job.** Propose fixes in priority order with rationale. Ask for approval.

```
PROPOSED FIXES (in priority order)
==================================

FIX 1 (Priority: CRITICAL)
--
What: Acquire backup lock OUTSIDE of message queue window.
Where: Backup scheduling logic, lines 42-67.
Why: Backup runs from 09:00-09:15 UTC, overlapping with briefing delivery window.
Rationale: Moving backup to 08:30 or 09:30 eliminates the lock contention that blocks agent receive.
Evidence: Days 4, 6 show +45s queue delays exactly during backup window. No delays on other days.
Risk: If briefing job runs before 08:30, this won't help. Requires verification of briefing job start time.
Approval needed: YES—this changes operational timing.

FIX 2 (Priority: HIGH)
--
What: Add timeout + retry logic to agent message receive.
Where: Agent receiver, line 89.
Why: If message arrives during backup lock, agent times out and loses the message.
Rationale: Retry with exponential backoff catches messages that arrive late due to queue delays.
Evidence: Audit found no error logs on days 4, 6—agent silently fails rather than retrying.
Risk: Retries might double-deliver if memory persist succeeds on second attempt but briefing already sent.
Approval needed: YES—needs idempotency verification before deploy.

FIX 3 (Priority: MEDIUM)
--
What: Log all message receive attempts (success and failure).
Where: Agent receiver, around line 85.
Why: Currently, no visibility into whether message was received and rejected, or never received.
Rationale: Logging closes the audit gap that made diagnosis difficult.
Evidence: Gap table row 3 shows "unclear" status on agent receive.
Risk: Low. Logging-only, no logic change.
Approval needed: NO—safe to deploy immediately.

---

NEXT STEPS
==========
1. Confirm briefing job start time (does it run before 08:30?).
2. If yes, approve FIX 1 and schedule backup window move.
3. If no, alternative approach needed (FIX 1 insufficient).
4. Approve FIX 2 and run idempotency tests before deploy.
5. Deploy FIX 3 immediately for visibility.
```

The approval gate catches hallucinated solutions before they touch the system. In this example, FIX 1 assumes backup is the root cause—but it's *proposed for approval*, not implemented. If briefing job runs at 10:00, the assumption is wrong and the fix is wrong. You catch this before it lands.

---

## Key Insights

### 1. ASCII Diagrams Force Externalised Reasoning

Prose descriptions hide gaps. When you ask an LLM to write a flow diagram in ASCII, it can't hand-wave the causal chain. Every step must be explicit. Every connection must be drawn. Contradictions become spatial—visually obvious rather than buried in narrative.

In the example above, the spatial layout made it immediately clear that there's a breaking point between "queue publishes" and "agent receives." Prose diagnosis would have said "check the queue" (fixing FIX 3 alone) and missed the backup lock contention entirely.

### 2. Diagnosis Beats Prescription

When you ask an AI to prescribe fixes, it optimises for closure—providing answers that sound reasonable and coherent. When you ask it to diagnose (investigate, document, externalise), it optimises for accuracy. The cognitive task is different.

In one incident involving a multi-agent system:
- **Prescriptive approach:** "Restart Agent B and increase timeout to 30s." (1 bug found, 2 bugs made worse)
- **AFDP approach:** Audit revealed three independent failures: Agent B timeout logic, memory sync race condition, message queue retry backoff. Prescriptive fix addressed only the first.

### 3. Propose, Don't Implement Creates a Review Gate

Asking the model to propose solutions without implementing them does two things:
- It forces the model to justify each fix with evidence from the audit
- It creates a decision point where you catch hallucination before it's deployed

A hallucinated fix (one that sounds plausible but has no basis in the audit) becomes obvious in the proposal phase because it won't have evidence. You catch it before the fix touches production.

### 4. Context Framing Beats Instruction Framing

Instructions ("do these troubleshooting steps") are prescriptive. They assume a path. Context ("here's what's happening, investigate") is generative. The model discovers the path.

Compare:
- *Instruction framing:* "Check the queue logs, then check the agent logs, then check the backup timing."
- *Context framing:* "Here are all the logs. Investigate."

With context framing, the model doesn't assume queue is the issue first. It reads all logs, notices the correlation between backup timing and message loss, and surfaces that *because it's in the data*, not because you guided it there. This is especially powerful in systems where causality is non-obvious.

### 5. Relationship to Other Frameworks

AFDP builds on established techniques:
- **Chain-of-Thought (CoT):** AFDP requires explicit step-by-step reasoning (audit phase is CoT).
- **Reflexion:** AFDP includes self-verification (contradiction detection in audit, gap analysis).
- **ReAct:** AFDP combines reasoning (audit) with tools (file reading) with action (proposal).
- **Tree of Thoughts:** AFDP explores multiple hypotheses in the audit before converging on root cause.

The novel combination: **context framing + autonomous audit + required ASCII externalisation + propose/implement gate.** Each component isolates a source of LLM error. Together, they catch compound failures that any single technique would miss.

---

## Implementation

### Template Prompt Structure

```markdown
# CONTEXT
[Your symptoms, expected state, actual state, supporting data]

# YOUR TASK

## Phase 1: Audit
Read the provided logs and configs. Document what you observe without assuming diagnosis.
List contradictions and gaps.

## Phase 2: Gap Analysis + Diagram
Create an ASCII diagram showing the expected flow vs. the actual flow based on your audit findings.
Then create a gap table with columns: Component | Expected | Actual | Status.

## Phase 3: Propose (Don't Implement)
For each likely root cause, propose a fix:
- What specifically would change
- Where (file, function, line number if known)
- Why this fixes the problem (with evidence from your audit)
- Risk of the fix
- Whether approval is needed before deploying

Order fixes by priority (CRITICAL > HIGH > MEDIUM > LOW).

Ask explicitly: "Which fixes should I implement? In what order?"
```

### Workflow Integration

1. **Incident occurs.** Document symptoms, expected, actual state.
2. **Run AFDP.** Feed context + logs to the model.
3. **Review audit phase.** Check for contradictions. If the audit doesn't make sense, go back to step 1 with more logs.
4. **Review diagram and gap table.** Do they align with what you know about the system?
5. **Review proposals.** Do they have evidence? Do they align with the gap analysis?
6. **Approve specific fixes.** Return the approved list to the model for implementation.
7. **Implement and validate.** Model implements only what you approved.

This creates a three-gate review: audit credibility, gap analysis correctness, proposal alignment.

---

## Example: Agent Communication Failure

**Incident:** Agent A sends message to Agent B. Agent B never receives it. No error logs.

**Context:**
```
Symptom: Agent A reports "message sent to Agent B" but Agent B has no record of receiving it.
Expected: Message published → Agent B receives immediately → Ack sent back.
Actual: Message published → (agent B receives nothing) → 30s later, timeout.
Files: agent-a.log, agent-b.log, message-queue.log, network-trace.pcap
```

**AFDP Audit finds:**
- Agent A message published at 10:15:03.500
- Message queue log shows delivery confirmed at 10:15:03.502
- Agent B log shows no receive event
- Network trace shows TCP packet sent but no ACK from Agent B
- Agent B logs show 10:15:02–10:15:04 contains: "Memory lock acquired (backup in progress)"

**Diagram:**
```
EXPECTED
=========
Agent A → Message Queue → Agent B memory
            (instant)       (instant)

ACTUAL
======
Agent A → Message Queue → [Agent B is locked on backup]
            (fast)       ↓
                     Message lost (no retry)
```

**Gap table:** Shows message queue working, network delivering packet, but Agent B unable to write to memory during backup window.

**Proposals:**
1. CRITICAL: Move backup window outside Agent B active window
2. HIGH: Implement receive retry in Agent B
3. MEDIUM: Add receive logging for visibility

All three proposals have evidence. All three are concrete. You approve them with confidence.

---

## Packaging Notes

### For Practitioners
This framework is most valuable when:
- The system is complex and multi-component
- Root cause is non-obvious (second- or third-order failure)
- Multiple hypotheses are plausible but only one is correct
- You have logs/configs available to audit

### When to Use AFDP
- Production incident with unclear cause
- Intermittent failures (timing-dependent, race conditions)
- Multi-agent or distributed system debugging
- When previous diagnostic prompts have missed root cause

### When to Use Simpler Approaches
- Simple syntax errors (code review, linter)
- Linear, obvious failures (follow error trace)
- Single-component issues (debugging guide suffices)

### The Cost-Benefit Trade

AFDP requires:
- More setup (gathering logs, configs, context)
- More tokens (longer audit, diagram, proposal phase)
- More time (multiple review gates)

But catches:
- Compound failures (multiple independent root causes)
- Subtle timing issues (race conditions, lock contention)
- Hallucinated solutions (fixes with no evidence)

Use it when the cost of a missed diagnosis exceeds the cost of a thorough one.

---

## Checklist

Before deploying any fix approved through AFDP:

- [ ] Audit findings align with your understanding of the system
- [ ] ASCII diagram correctly represents the expected vs actual flow
- [ ] Gap table identifies all discrepancies, not just the obvious ones
- [ ] Each proposed fix has evidence from the audit, not just plausibility
- [ ] Risk assessment for each fix is realistic (not optimistic)
- [ ] Fixes are ordered by priority, not by ease of deployment
- [ ] You've explicitly approved the exact fixes being implemented
- [ ] Implementation matches the proposal (no scope creep)
- [ ] Post-deployment validation plan is clear

---

## Further Reading

- **Chain-of-Thought Prompting** (Wei et al., 2022): Foundation for explicit reasoning
- **Reflexion: Language Agents with Verbal Reinforcement Learning** (Shinn et al., 2023): Self-verification patterns
- **ReAct: Synergizing Reasoning and Acting in Language Models** (Yao et al., 2022): Integration of reasoning and tool use
- **Tree of Thoughts** (Yao et al., 2023): Multi-path hypothesis exploration

AFDP combines these into a practitioner's framework for the specific problem of diagnosing failures in complex systems using LLMs.

---

**Version:** 1.0.0
**Last updated:** 2026-03-09
**Tier:** Honey ($49)
**Author:** Melisia Archimedes
**Collection:** Diagnostic Patterns
**Hive Doctrine ID:** HD-0072
