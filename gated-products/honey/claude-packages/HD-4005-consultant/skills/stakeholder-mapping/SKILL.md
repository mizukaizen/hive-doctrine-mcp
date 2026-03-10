# Stakeholder Mapping Skill

Use when starting an engagement. Maps stakeholders by influence/interest, identifies champions and blockers.

## When to Activate

- User asks to "map stakeholders" or "identify stakeholders"
- The `/new-engagement` command is invoked
- User mentions needing to understand "who matters" or "who to talk to"

## Process

1. **Identify stakeholders.** From available context (engagement brief, org charts, meeting notes), list every person or role that could affect or be affected by the engagement.

2. **Classify each stakeholder.** For each, assess:
   - **Influence** (High/Low): Can they approve, block, fund, or redirect the engagement?
   - **Interest** (High/Low): Do they care about the outcome? Will it affect their work?
   - **Disposition** (Champion/Neutral/Blocker): Are they supportive, indifferent, or resistant?

3. **Plot the grid.**

```
                    HIGH INTEREST
                         |
    Keep Informed        |        Manage Closely
    (champions live      |        (decision makers,
     here often)         |         sponsors)
                         |
   LOW INFLUENCE --------+-------- HIGH INFLUENCE
                         |
    Monitor              |        Keep Satisfied
    (minimal effort)     |        (brief updates,
                         |         no surprises)
                         |
                    LOW INTEREST
```

4. **Define engagement strategy.** For each quadrant, specify:
   - Communication frequency (weekly/fortnightly/monthly/as-needed)
   - Communication format (meeting/email/report/dashboard)
   - Key messages tailored to their concerns
   - Risk if they are neglected

5. **Identify dynamics.**
   - Who are the informal influencers (not in the org chart but respected)?
   - Are there alliances or tensions between stakeholders?
   - Who controls budget vs who controls access vs who controls narrative?

## Output

A stakeholder map document saved to `scope/stakeholder-map.md` with:
- Stakeholder list with classifications
- 2x2 grid placement
- Engagement strategy per quadrant
- Key risks and mitigation for blocker stakeholders

## Notes

- Revisit the map at each phase gate. Stakeholder positions shift as the engagement progresses.
- Never share the full stakeholder map with the client. It contains your internal assessment of their people. Share the communication plan instead.
