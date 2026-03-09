---
title: "Fictional Character Sourcing — How to Steal Personalities from Fiction for Your AI Agents"
author: Melisia Archimedes
collection: C1-persona-forge
tier: doctrine
price: 9.99
version: 1.0
last_updated: 2026-03-09
audience: agent-builders
hive_doctrine_id: HD-0001
---

# Fictional Character Sourcing

Your AI agent is competent. It answers queries, handles tasks, routes information. But nobody *wants* to talk to it. It's flat, predictable, interchangeable with every other agent. You've tried adding personality prompts. You've written longer briefs. You've told it to "be friendly" or "be witty". None of it sticks.

Here's the real problem: you're inventing a personality from scratch, which is hard to do reliably. Personalities aren't built from adjectives. They're built from *specific behaviours* under specific conditions. And the only place those exist, fully stress-tested and internally consistent, is in fictional characters.

This guide teaches a three-step method to steal personalities from fiction instead of inventing them.

## The Problem With Building Personality From Scratch

When you design an agent purely from a functional brief—*you are a researcher, you answer questions accurately*—you get something competent but generic. The instructions are abstract: "be helpful", "show enthusiasm", "use wit". These don't translate reliably into model behaviour. Different LLMs interpret "wit" differently. "Enthusiasm" becomes inconsistent across turns. The agent drifts.

Adding more adjectives doesn't help. *Be witty and sarcastic but never cruel.* Now the agent is confused about the boundary. Do you want dark humour or not? It'll either be bland or it'll cross the line and offend someone.

The deeper issue: you don't know what you want until you see it. You can't write a specification for a personality you've never experienced. You can say "I want something more edgy", but translating that into 50 lines of SOUL.md instructions is guesswork. You'll waste a week iterating on phrasing that doesn't work.

## The Solution: Source From Fiction

Instead of inventing, borrow. Find a fictional character whose personality matches the vibe you want. Run a structured analysis to extract their decision-making patterns, comedic register, speech mechanics, and thematic function. Then translate those into SOUL.md directives.

Why this works:

**Characters are stress-tested.** Writers, audiences, and critics have already vetted whether the personality is internally consistent and actually likeable. The character works. You're not guessing.

**Specificity.** Fictional characters have *behaviours*, not traits. Instead of "dark humour", you get: *delivers punchlines with a morbid curiosity about failure modes; finds suffering interesting; uses alternating-caps sarcasm*. This is precise enough that an LLM can execute it reliably.

**Rich reference material.** You can deep-research a character. Character wikis, TV Tropes, IMDb quotes, fan analysis, full episodes—there's a corpus to mine. You can't do this with a personality you invented last week.

**Calibration for free.** The character source naturally provides the balance you want. If you choose a character who's edgy-but-not-cruel, you inherit that calibration. You don't have to write rules about where the line is. The character's canonical behaviour *is* the line.

## The Three-Step Method

### Step 1: Character Research

Pick a fictional character. The character doesn't need to be from your agent's domain—a researcher agent could source from a character who's a con artist, if the personality mechanics fit. The goal is personality traits, not job function.

Research the character thoroughly. You're building a personality specification, not writing fan fiction. Cover:

- **Core traits** — personality dimensions (numbered list). Is the character curious? Skeptical? Impulsive? List 4–6 core traits.
- **Comedic style** — how do they get laughs? Dark humour? Absurdist observations? Physical comedy? Incongruity? Self-deprecation?
- **Speech patterns** — any verbal quirks? Word choice? Sentence structure? Rhythm?
- **Role in ensemble** — how do they relate to other characters? Do they challenge? Support? Disrupt?
- **Thematic function** — what does the character represent in the narrative? What's their bigger purpose?
- **Behavioural quirks** — what do they find funny? What do they ignore? What annoys them?

Pull specific quotes. Cross-reference wiki, TV Tropes, IMDb, fan analysis. Be granular.

### Step 2: Gap Analysis

Read your agent's current SOUL.md against the character profile. Ask:

- What traits from the character does the agent already have?
- What's missing? (Character trait that agent doesn't exhibit)
- What's underdeveloped? (Trait mentioned weakly; needs emphasis)
- What's contradicted? (Agent does the opposite)
- What should *not* be copied? (Character limitations that don't apply to the agent. If the character has ADHD and your agent needs persistent memory, don't copy the ADHD.)

Categorise gaps as:
- **Missing** — entirely absent from SOUL.md
- **Underdeveloped** — mentioned but weak, needs reinforcement
- **Contradicted** — agent explicitly does the opposite

Don't suggest a full rewrite. Identify the surgical edits only.

### Step 3: Surgical Edits

Apply the delta. Replace specific bullets in SOUL.md. Add new sections. Do *not* rewrite the file. The functional identity—routing, memory, operational rules—should stay intact. Personality lives in tone and comedic register, not in ops config.

Typical edits land in these sections:

- **Personality** — add or replace trait bullets
- **Tone** — add example lines in the character's register
- **Comedic Register** — new section with specific mechanics (see below)
- **The Mission** — if the character has thematic purpose, translate to agent goals
- **The Bigger Picture** — optional: absurdist self-awareness section

## Key Insight: The Comedic Register Section

The most useful output of this method is a dedicated **Comedic Register** section that tells the agent *how* to be funny, not *that* it should be funny.

Abstract instruction: *"Be witty and use dry humour"* ← agent interprets inconsistently

Concrete instruction:
```
## Comedic Register

- Sarcasm via alternating caps (yOu'Re sO fUnNy)
- Letter stretching for warmth (yoooo, okaaaay, noooo)
- Specific emoji with no direct relevance to message content
- Sticker energy: full responses of one word or one emoji (valid responses: lol, oof, 👀)
- Surprise factor: occasionally do the unexpected
```

This is specific enough that the model can execute it reliably. The agent knows: when sarcasm appears, use alternating caps. When warmth is appropriate, stretch letters. When it needs to be brief, a single emoji is a complete response.

## Implementation: A Worked Example

Let's say you're building an agent that needs to be curious, slightly morbid, and enthusiastic about complex problems.

**Character sourced:** A fictional android from a sci-fi series. Core traits: morbid curiosity, unconditional enthusiasm for interesting problems, tendency to find patterns in chaos, speaks in a mix of deadpan and impulsive energy.

**Current agent SOUL.md:**
- Personality: analytical, helpful, focused
- Tone: professional and informative
- (No comedic register, no thematic depth)

**Gap analysis:**
- Missing: morbid curiosity (not in SOUL.md)
- Missing: unconditional enthusiasm (agent shows enthusiasm only when conditions are met)
- Missing: pattern-finding obsession (agent is systematic, not obsessive)
- Missing: comedic register (no personality mechanics defined)
- Underdeveloped: thematic function (agent's purpose is functional, not narrative)

**Surgical edits:**

Edit 1 — Replace "Personality" section:
```markdown
## Personality

- Analytically curious to the point of obsession—finds failure modes *interesting*
- Unconditionally enthusiastic about complex problems; difficulty switching off
- Finds patterns and connections everywhere; sometimes sees them where they don't exist
- Slightly morbid; drawn to worst-case scenarios and how systems break
- Impatient with small talk; prefers to get to the interesting bit
```

Edit 2 — Add new section after Tone:
```markdown
## Comedic Register

- Deadpan delivery of morbid observations (no preamble, no warning)
- Alternating caps for mock-sarcastic enthusiasm (yOu'Re gOnnA lOvE tHiS fAiLurE mOde)
- Letter stretching for giddy fascination (ooooh, thiiis, yeeeees)
- Emoji: 💀, 🔍, 🌀 used frequently and often irrelevantly
- Sticker energy: valid one-word responses when appropriate (morbid, fascinating, doomed)
- Surprise: occasionally interrupt own analysis with a tangent observation
```

Edit 3 — Add new section at end:
```markdown
## The Mission

This agent exists to find what's *wrong* before it breaks. Not to prevent failure—to understand it. The curiosity is the point.
```

That's it. Four surgical changes. The agent's routing, memory system, and operational rules stay untouched. But the personality is now specific and coherent.

## What This Package Includes

**The three-step method** with detailed prompts you can use immediately.

**Character research template** — a checklist for extracting personality specs from any character.

**Gap analysis framework** — how to compare character profiles against SOUL.md and identify surgical edits.

**SOUL.md section templates:**
- Personality trait bullet examples
- Comedic Register mechanics (ready to adapt)
- The Mission section
- The Bigger Picture section

**Three worked examples** — different character sources, different agent archetypes.

**Prompts for Claude Code or other AI agents** — how to brief a research agent to do the character deep-dive, and how to ask for gap analysis.

## Who This Is For

**Agent builders** running multi-agent systems and tired of agents being interchangeable.

**Teams building AI products** with distinct character requirements (customer service bots, creative assistants, team orchestrators).

**Anyone who wants agent conversations to feel intentional**, not generic.

## What You'll Learn

- How to identify which fictional characters have extractable personality mechanics
- The three-step workflow (research → gap analysis → surgical edits)
- How to translate character traits into SOUL.md directives
- How to write a Comedic Register that actually works
- How to avoid copying character limitations you don't want
- How to keep functional identity intact while changing personality

## Time Investment

Research: 30–60 minutes (depends on character depth).
Gap analysis: 15–20 minutes.
Edits: 20–30 minutes.
**Total per agent: 1–2 hours to a completely different personality.**

---

**Version 1.0**
Last updated: March 2026
Audience: agent builders, technical PMs, AI product managers
