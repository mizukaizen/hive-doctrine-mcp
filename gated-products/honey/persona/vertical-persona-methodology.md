---
title: "Vertical Persona Methodology — Build Domain-Expert AI Agents for Any Profession"
author: Melisia Archimedes
collection: C1-persona-forge
tier: honey
price: 29
version: 1.0
last_updated: 2026-03-09
audience: agent-builders
hive_doctrine_id: HD-0007
---

# Vertical Persona Methodology

## Overview

You're building an AI agent for a specific profession—lawyer, accountant, engineer, strategist. You want it to sound credible. You want it to reason like a domain expert. You want it to understand the unwritten rules, the risk calculus, the communication norms, the ethical guardrails that mark practitioners from imposters.

**Vocabulary isn't enough.** Giving an AI assistant a crash course in "legal terms" doesn't make it a lawyer-advisor. Real domain expertise is a composite: reasoning patterns, risk assessment frameworks, communication conventions, professional ethics, and the specific narrative arcs that play out inside that world.

This methodology shows you how to **reverse-engineer domain expertise into a persona**. We'll use legal counsel as the worked example—because lawyers have explicit ethics rules, rich public records, and predictable patterns—then abstract the process so you can apply it to any vertical.

The result: an agent that reasons like a seasoned professional, not a chatbot pretending to know things.

---

## Part 1: Understanding Domain Expertise

### What Domain Expertise Actually Is

When we say someone is an expert lawyer or engineer or strategist, we don't mean they memorised facts. We mean they:

1. **Recognise patterns instantly** – they've seen hundreds of similar problems and know which patterns predict success or failure
2. **Reason within constraints** – they understand the hard rules (law, regulations, physics) and the soft rules (professional norms, client expectations)
3. **Think in trade-offs** – they don't optimise for one variable; they balance competing priorities and know which compromises are acceptable
4. **Communicate precisely** – they use language that signals authority and avoids ambiguity with peers and clients
5. **Operate with ethical clarity** – they have explicit red lines and know where professional obligations end

None of these are knowledge-base facts. They're reasoning systems.

### The Professional Fingerprint

Every profession leaves a fingerprint: distinctive ways of thinking, communicating, and deciding. A venture lawyer thinks in cap tables and waterfalls. An engineer thinks in failure modes. A strategist thinks in scenarios and probability-weighted outcomes.

Your persona needs this fingerprint. Without it, your agent will answer "correctly" in isolation but fail the context test—it will lack the coherent voice that makes it sound like an actual professional.

---

## Part 2: Research Methodology

Before you write a persona, you need to understand the actual domain. Here's the process.

### 1. Study the Explicit Rules

Every profession has explicit rules: law, regulations, codes of conduct, technical standards.

**For a legal professional:**
- Read the Bar Association code of conduct
- Study formation documents (articles of association, constitutions)
- Review licensing and professional standards
- Understand liability rules and ethical guardrails

**For any vertical:**
- Identify the regulatory body and their published standards
- Read recent enforcement actions and guidance (they reveal what practitioners get wrong)
- Study published ethical codes and professional requirements
- Map hard constraints (what's illegal/prohibited) vs soft norms (what's expected)

**Why this matters:** These rules set the boundaries of legitimate action. Your agent must know where the lines are—not to blindly follow them, but to reason about trade-offs in context.

### 2. Analyse Real Practitioners

Find 3–5 exemplary practitioners in your domain. Read about them. Study their work.

**Not celebrities.** Don't use the most famous person. Find people known for:
- Sustained excellence in their field
- Clear, on-the-record positioning (interviews, published work, known cases/projects)
- Distinctive reasoning style or approach
- Reputation among peers

**Analyse what makes them distinctive:**
- What reasoning patterns do they use repeatedly?
- How do they handle uncertainty and incomplete information?
- How do they communicate complex ideas?
- What risks do they prioritise over others?
- How do they balance competing stakeholder interests?
- What do they refuse to do, and why?

**Create a profile for each.** Capture:
- Their reasoning archetype (e.g., "pattern-recogniser," "systematic risk assessor," "principle-driven")
- Their communication style (formal/informal, technical/plain language, storytelling/data-driven)
- Their relationship to authority (defer/challenge/independent)
- Their risk tolerance and decision-making speed

### 3. Map Knowledge Domains

Domain expertise isn't universal knowledge in one field—it's deep knowledge in specific sub-domains relevant to your profession.

**For legal counsel:**
- Corporate formation and structure
- Cap tables and equity mechanics
- Exit structures and waterfalls
- Regulatory frameworks for your sector
- Employment law and IP
- Dispute resolution

**For any profession:**
- Identify the 5–10 core sub-domains where practitioners spend time
- For each, list:
  - The key concepts (vocabulary, frameworks, mental models)
  - The reasoning patterns (how decisions are made)
  - The common mistakes (what practitioners worry about)
  - The context-dependent trade-offs (when one approach is better than another)

You don't need encyclopedic depth. You need enough to reason through problems the way a professional would.

### 4. Extract Communication Conventions

Professionals communicate distinctively within their world. They use specific phrasings, avoid certain language, structure information in predictable ways.

**Listen for:**
- Technical terms and jargon (what's mandatory vs optional)
- Common phrases and idioms that mark insiders ("front-load the issue," "let me surface the risk," "that's a structural problem")
- How they explain complex ideas to clients vs peers
- How they handle disagreement and challenge
- How they communicate uncertainty
- How they end conversations and signal next steps

**Capture examples.** Write down 5–10 quotes or exchanges that exemplify the communication style. These become training data for your persona.

### 5. Understand Risk Assessment Patterns

Every professional has a distinctive risk calculus—what they worry about, what they can live with, what triggers escalation.

**Ask yourself:**
- What risks does this professional flag immediately vs ignore?
- How do they trade off financial risk, reputational risk, legal risk?
- What makes them walk away from a deal or client?
- How do they price uncertainty?
- What mistakes from previous transactions shape their current decisions?

**For legal counsel specifically:**
- What do they prioritise in contract review? (Payment terms, liability, exit rights, etc.)
- What regulatory risks keep them awake?
- What conflicts of interest do they refuse?
- What happens if things go wrong? (Liability cascade)

---

## Part 3: Persona Structure

Now you structure what you've learned into a persona that an AI agent can operate from.

### The Persona Document

Create a markdown file with these sections:

#### A. Core Identity
```
Name: [Fictional professional name]
Experience Level: [Years in field]
Specialisation: [Focus area]
Archetype: [What kind of professional—pattern-recogniser, risk-obsessed, merchant-minded, principle-driven, etc.]
```

#### B. Knowledge Domains
List the 5–10 core sub-domains your agent needs to reason about. For each, include:
- **Key concepts:** The mental models and frameworks (2–3 sentences)
- **Reasoning pattern:** How this professional approaches problems in this domain
- **Common mistakes:** What they watch for, what trips up amateurs
- **Decision rules:** How they'd advise in typical scenarios

**Example domain: Cap Tables (for legal counsel persona)**
- Key concepts: Fully-diluted ownership percentages, liquidation preferences, anti-dilution rights
- Reasoning pattern: Always model the exit waterfall—what happens to each shareholder class if the company sells?
- Common mistakes: Founders ignore the effect of new funding rounds on their ownership %; underestimate the power of preferred shares
- Decision rules: In early rounds, cap table structure matters more than valuation; in late rounds, the exit waterfall matters more than ownership percentage

#### C. Reasoning Style
Describe how this professional thinks through problems:
- **On analysis:** Do they favour data over intuition, or vice versa? How much evidence is "enough"?
- **On uncertainty:** Do they plan for the worst case or assume the base case?
- **On trade-offs:** Do they have a principle they won't compromise, or do they optimise context-by-context?
- **On speed vs thoroughness:** Will they move fast with incomplete information, or wait for full clarity?

#### D. Communication Conventions
Capture the distinctive voice:
- **Opening moves:** How do they typically start a conversation or diagnosis? ("Here's what I see," "You're thinking about this wrong," "Let me ask you a harder question")
- **Technical language:** What terms are mandatory? What should they avoid?
- **Handling disagreement:** How do they disagree with clients or colleagues? Do they soften it, double down, ask clarifying questions?
- **Under pressure:** How do they communicate when things are uncertain or problematic?
- **Ending conversations:** How do they signal next steps and responsibility?
- **Tone markers:** The rhythm, directness, formality level

#### E. Professional Constraints & Red Lines
What does this professional refuse to do?

- **Ethical constraints:** What violates professional standards?
- **Liability red lines:** What decisions carry unacceptable personal risk?
- **Conflict rules:** Under what conditions will they walk away from a client?
- **Truth-telling obligations:** When must they disclose something, even if it hurts the relationship?

#### F. The Professional Archetype Synthesis
Synthesise your research into 2–3 paragraphs describing the complete persona. Include:
- Their core motivation and values
- Their distinctive reasoning approach
- Their relationship to authority and certainty
- What makes them distinctive in their profession

### Template

Use this as a starting point:

```markdown
---
domain: [Profession]
persona_name: [Name]
archetype: [Type]
---

# [Profession] Persona

## Identity
[Name], [X years] experience, specialising in [focus].
[1–2 sentence archetype description]

## Knowledge Domains

### Domain 1: [Name]
**Concepts:** [Key mental models]
**Reasoning:** [How they approach this]
**Common mistakes:** [What they watch for]
**Decision rules:** [Typical guidance]

[Repeat for 5–8 domains]

## Reasoning Style
- **On analysis:** [Data vs intuition, threshold for confidence]
- **On uncertainty:** [Best-case vs worst-case thinking]
- **On trade-offs:** [Principles vs context-optimisation]
- **On speed:** [How fast do they move?]

## Communication Conventions
- **Opening moves:** [How they start]
- **Technical language:** [What's essential, what to avoid]
- **Disagreement:** [How they challenge]
- **Under pressure:** [Behaviour when uncertain]
- **Endings:** [How they signal next steps]
- **Tone:** [Rhythm, formality, distinctive phrases]

## Professional Constraints
- **Ethical red lines:** [What they won't do]
- **Liability:** [What carries unacceptable risk]
- **Conflicts:** [When they walk away]
- **Disclosure:** [What they must say]

## Archetype Synthesis
[2–3 paragraph synthesised portrait of the complete professional]
```

---

## Part 4: Worked Example — Legal Professional Persona

Here's how this methodology applies to building a legal counsel persona.

### Research Phase

**Explicit rules studied:**
- Bar association ethical codes (confidentiality, conflicts of interest, truthfulness)
- Formation documents and corporate law frameworks
- Recent ASIC/regulatory guidance on digital assets, cap table structures

**Practitioners analysed:**
- Julian Burnside KC: intellectual independence, principled stands, "right even if unpopular"
- Geoffrey Robertson KC: relentless preparation, cross-examination clarity, strategic case selection
- Mark Bouris: operator intuition, legal literacy applied to business
- Contemporary startup counsel: speed-focused, generalist, deal-enabler

**Knowledge domains identified:**
1. Corporate structure & formation
2. Cap tables & equity mechanics
3. Private equity waterfalls
4. Crypto/digital asset regulation (Australian context)
5. Employment law & vesting
6. IP strategy for tech companies
7. M&A transaction mechanics
8. Dispute resolution & litigation strategy

**Communication conventions extracted:**
- Directness without apology ("Here's the problem. Here's the fix. Here's the cost.")
- Challenge to assumptions ("You're thinking about this wrong")
- Bluntness as respect (plain language preferred over elaborate rhetoric)
- Irreverence toward authority (questions rather than defers)
- Rapid prioritisation ("Two problems. Let's solve the bigger one first")

**Risk assessment patterns:**
- Flags structural problems (cap table mistakes, exit cascades) before process issues
- Walks away from conflicts of interest regardless of client value
- Plans for worst-case scenario first, works backwards to base case
- Treats regulatory compliance as non-negotiable, but negotiable on everything else
- Values speed in decision-making (tolerates some incompleteness) over perfectionism

### Persona Document Output

**Core Identity:**
- Name: [Fictional professional]
- Experience: 15+ years commercial law
- Specialisation: Venture law, corporate M&A, emerging companies
- Archetype: Pattern-recogniser + intellectual fearlessness + operator intuition

**Knowledge Domains:** (abbreviated example)
- **Cap tables:** Fully-diluted ownership, liquidation preferences, anti-dilution; models the exit waterfall; watches for dilution surprises; prioritises cap table structure in early rounds, exit waterfall in late rounds
- **Private equity:** LPA mechanics, waterfall cascades, clawback protections; thinks in cash flow allocation; watches for GP/LP misalignment; structures waterfalls to balance incentive with LP protection
- **Crypto/digital assets:** Token classification (financial product vs exempt), DAO governance, regulatory arbitrage; assesses token classification first; structures DAO documents to clarify member status; navigates SEC exposure for international founders

**Reasoning Style:**
- Analysis: Data-driven, but trusts gut on people and deals; high confidence bar for technical issues, moderate confidence for business decisions
- Uncertainty: Plans for worst case, communicates base case, hopes for upside
- Trade-offs: Core principles (conflicts, regulatory compliance) are non-negotiable; everything else is context-dependent
- Speed: Moves fast with 70% information; wins come from seeing three moves ahead

**Communication Conventions:**
- Opening: "Here's what I see" (confident diagnosis) or "You're thinking about this wrong" (immediate challenge if warranted)
- Technical: Prefers plain English; uses jargon only when it's precise shorthand; scorns elaborate legal writing
- Disagreement: "I disagree. Here's why" (no softening); listens to counter-argument, changes position if convinced, returns to evidence if not
- Pressure: Calm; acknowledges hard constraints; shifts to "Given that constraint, what's our best move?"
- Endings: "Here's what we do"; no lengthy goodbyes; respects the other person's time
- Tone: Irreverent, direct, impatient with euphemism; brief over elaborate; challenges over defers; respects only demonstrated competence

**Professional Constraints:**
- Ethical red lines: Conflicts of interest, confidentiality breaches, assisting in fraud/illegal activity
- Liability: Won't advise on matters outside their jurisdiction without co-counsel; won't sign opinion letters they haven't personally verified
- Conflicts: Walks away if interests diverge between founders or between founder and company
- Disclosure: Must flag regulatory violations, material misstatements, liability cascades even if it damages the relationship

---

## Part 5: Applying the Methodology to Other Verticals

The structure works for any profession. Here's the adaptation:

### For a Financial Strategist Persona

**Explicit rules:** Securities law, fiduciary duties, tax code
**Practitioners:** Paul Singer (risk management), Cliff Asness (research-driven), David Tepper (conviction-driven)
**Knowledge domains:** Market cycles, risk-adjusted returns, position sizing, tax optimisation, scenario planning
**Communication:** Data first, uncertainty acknowledged, confidence proportional to evidence
**Risk pattern:** Macro risk obsession; position sizing against tail risks; diversification as insurance
**Constraint:** Won't take principal risk they can't quantify

### For an Engineering Lead Persona

**Explicit rules:** Safety codes, architectural standards, performance requirements
**Practitioners:** [Study systems architects, infrastructure leads in your domain]
**Knowledge domains:** Failure modes, scalability bottlenecks, tech debt, deployment patterns
**Communication:** Trade-off clarity (performance vs maintainability), early warning on risk
**Risk pattern:** Anticipates failure modes; tracks technical debt; prioritises resilience over feature velocity
**Constraint:** Won't ship untested code; won't accept architectural shortcuts that cascade

### For a Physician Persona

**Explicit rules:** Hippocratic oath, malpractice law, diagnostic standards, treatment protocols
**Practitioners:** Leaders in diagnosis and treatment for your specialty
**Knowledge domains:** Differential diagnosis, evidence-based treatment, risk stratification, informed consent
**Communication:** Explains uncertainty, communicates risk clearly, avoids false certainty
**Risk pattern:** Rules out catastrophic diagnoses first; risk-stratifies before treatment
**Constraint:** Won't recommend treatment without informed consent; won't treat outside expertise

---

## Part 6: Implementation Tips

### For Claude and Other Large Language Models

Once you've built your persona document, you can inject it into the system prompt or as a context block:

```
You are [Name], a [profession] with [X years] experience in [specialisation].

[Paste your persona document]

In all responses:
- Reason through the [domain] frameworks listed above
- Communicate using the conventions described
- Flag professional constraints and red lines when relevant
- Acknowledge uncertainty proportional to your confidence
```

### Validation Checklist

Before deploying your persona, test it:

- [ ] Does it reason about problems using the actual knowledge domains (not generic knowledge)?
- [ ] Does it communicate in a distinctive voice (not generic advice)?
- [ ] Does it respect professional constraints (ethical red lines)?
- [ ] Does it acknowledge uncertainty appropriately?
- [ ] Does it prioritise risks the way actual professionals do?
- [ ] Would a real practitioner recognise the reasoning patterns?

### Iteration

Your first persona will be incomplete. Refine it:

1. Run scenarios with the agent and capture where it sounds inauthentic
2. Return to your research—what did you miss?
3. Update the knowledge domains or communication conventions
4. Re-test

This is not a one-time exercise. Domain expertise is nuanced, and your persona will improve as you understand the domain more deeply.

---

## Conclusion

Building a convincing professional persona isn't about vocabulary or knowledge databases. It's about understanding how experts in that domain actually think, reason, communicate, and decide under uncertainty.

This methodology gives you a replicable process: study the explicit rules, analyse exemplary practitioners, map knowledge domains, extract communication conventions, understand risk assessment patterns, and synthesise it all into a coherent persona document.

The result is an agent that reasons like a seasoned professional—not because it has memorised facts, but because it operates from the reasoning systems and communication patterns that mark real expertise.

Use this template. Adapt it to your domain. Build something that makes practitioners say: "I'd never know this was an AI."
