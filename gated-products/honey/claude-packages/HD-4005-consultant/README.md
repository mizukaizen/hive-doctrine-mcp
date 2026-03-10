# HD-4005: Consultant Pack

A Claude Code configuration for independent consultants and advisory teams who need to produce structured client deliverables, manage engagements, and track billable work.

## What's Inside

| Component | Purpose |
|-----------|---------|
| **consultant** agent | Leads engagements, writes reports, produces executive-ready output |
| **analyst** agent | Gathers data, validates assumptions, creates supporting analysis |
| `/new-engagement` | Scaffold a new consulting engagement with scope, stakeholders, and timeline |
| `/deliverable` | Generate a structured client deliverable from your analysis |
| `/timesheet` | Summarise billable work from git history and file changes |
| **report-generation** skill | Structured report creation with executive summary and appendices |
| **stakeholder-mapping** skill | Map stakeholders by influence and interest |
| **confidentiality-check** hook | Scans for client-sensitive data before file creation |

## Installation

Copy the contents of this package into your project's `.claude/` directory:

```bash
cp -r HD-4005-consultant/.claude/* your-project/.claude/
```

Or merge individual files into your existing `.claude/` configuration.

## Usage

Start a new engagement:
```
/new-engagement "Digital Transformation Assessment" --client "Acme Corp"
```

Generate a deliverable:
```
/deliverable "Phase 1 Findings Report"
```

Track your time:
```
/timesheet --period "2025-W12"
```

## Conventions

- All deliverables follow a consistent structure: Executive Summary, Context, Findings, Recommendations, Appendices
- Stakeholder maps use a 2x2 influence/interest grid
- Time tracking rounds to nearest 15-minute increment
- The confidentiality hook runs automatically before any file is written

## Customisation

Edit `CLAUDE.md` to adjust the engagement methodology, report templates, or billing conventions to match your practice.

---

Part of The Hive Doctrine · hivedoctrine.com
