# Skill: Issue Labelling

Use when new issues come in and need categorisation. Applies consistent labels for type, priority, and component to keep the issue tracker organised.

## Trigger

Invoke this skill when processing new issues, during triage sessions, or when the `/triage` command runs.

## Label Taxonomy

### Type Labels (exactly one required)
| Label | Criteria |
|-------|----------|
| `bug` | Something that worked before is now broken, or documented behaviour does not match actual behaviour |
| `feature` | Request for new functionality that does not currently exist |
| `docs` | Documentation is missing, incorrect, or unclear |
| `question` | User needs help, not reporting a problem (redirect to discussions if available) |

### Priority Labels (exactly one for bugs and features)
| Label | Criteria |
|-------|----------|
| `priority: critical` | Data loss, security vulnerability, or complete feature breakage with no workaround |
| `priority: high` | Significant functionality affected, workaround exists but is painful |
| `priority: medium` | Noticeable issue, reasonable workaround exists |
| `priority: low` | Minor inconvenience, cosmetic, or affects very few users |

### Status Labels (applied as needed)
| Label | When to apply |
|-------|---------------|
| `needs-info` | Cannot reproduce or understand without more detail from reporter |
| `confirmed` | Bug has been reproduced by a maintainer |
| `good first issue` | Well-scoped, clear solution path, minimal project knowledge required |
| `help wanted` | Maintainer cannot prioritise — community contributions welcome |
| `duplicate` | Already reported in another issue |
| `wontfix` | Intentional behaviour, or does not align with project direction |

### Component Labels (project-specific)
Define component labels based on the project's architecture. Examples:
- `component: parser`
- `component: cli`
- `component: api`
- `component: ui`

## Decision Process

For each issue:

1. **Read the full issue** including any reproduction steps or screenshots.
2. **Assign type** — What category does this fall into?
3. **Check for duplicates** — Search closed and open issues for similar reports.
4. **Assign priority** — Based on impact and affected user count.
5. **Assign component** — Which part of the project is affected?
6. **Check for first-issue suitability** — Is the fix obvious, well-scoped, and achievable without deep project knowledge?
7. **Determine next action** — Needs info? Ready to work on? Needs discussion?

## Rules

- Every issue must have exactly one type label.
- Bugs and features must have exactly one priority label.
- If unsure about priority, default to medium and note the uncertainty.
- Never apply `good first issue` to anything requiring architectural knowledge or touching more than 2 files.
- When marking as duplicate, always link the original issue and explain why it is a duplicate.
- Labels are not permanent — re-label if new information changes the categorisation.
