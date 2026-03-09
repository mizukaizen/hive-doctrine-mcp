---
title: "Operator Kit Skill Bundles — Cheat Sheet"
hive_doctrine_id: HD-0059
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0059
full_product_price: 49
---

# Operator Kit Skill Bundles — Cheat Sheet

## What It Is

Seven skill templates that teach Claude Code specific competencies. Drop into `.claude/skills/` and reference from agent configs.

## The 7 Skills

### 1. BMAD Checklist
- Project management methodology
- Phase tracking, milestone verification
- Ensures no phase is skipped

### 2. Security Scanning (OWASP)
- OWASP Top 10 vulnerability checks
- Dependency audit (known CVEs)
- Secrets detection in source code
- Container security baseline

### 3. Testing Strategy (TDD)
- Test-Driven Development workflow: Red → Green → Refactor
- AAA pattern: Arrange, Act, Assert
- Coverage target: 80% line coverage minimum
- Unit, integration, and E2E test guidance

### 4. API Patterns
- RESTful design conventions
- Error response format standardisation
- Authentication patterns (OAuth 2.1, API keys)
- Rate limiting and pagination

### 5. Code Patterns
- Naming conventions (variables, functions, files)
- Error handling (no silent failures)
- Logging standards (structured, not console.log)
- No `any` types in TypeScript

### 6. Deployment Checklist
- Pre-deploy: tests pass, security scan clean, env vars set
- Deploy: staging first, health check, rollback plan ready
- Post-deploy: monitoring confirmed, smoke tests pass
- Rollback: documented procedure, tested quarterly

### 7. Design System (WCAG 2.1 AA)
- Colour contrast ratios (4.5:1 text, 3:1 large text)
- Keyboard navigation support
- Screen reader compatibility
- Focus indicator visibility
- Touch target sizes (44x44px minimum)

## Skill File Format

```markdown
# Skill: [Name]

## When to Use
[Trigger conditions]

## Checklist
- [ ] Item 1
- [ ] Item 2

## Rules
- Hard rule 1
- Hard rule 2

## Examples
[Concrete examples of correct application]
```

## Installation

Place in `.claude/skills/` directory. Reference from agent configs:

```yaml
skills:
  - "skills/security-scanning.md"
  - "skills/testing-strategy.md"
```

---

*This is the condensed version. The full guide (HD-0059, $49) covers all 7 complete skill templates with detailed checklists, rules, and examples ready to drop into any Claude Code project. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
