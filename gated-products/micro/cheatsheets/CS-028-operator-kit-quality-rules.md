---
title: "Operator Kit Quality Rules — Cheat Sheet"
hive_doctrine_id: HD-0060
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0060
full_product_price: 29
---

# Operator Kit Quality Rules — Cheat Sheet

## What It Is

Five rule files for `.claude/rules/` that enforce quality standards across all Claude Code sessions.

## The 5 Rule Files

### 1. Security Rules
- Never commit secrets, API keys, or `.env` files
- Use environment variables for all credentials
- No `console.log` with sensitive data
- Secrets in `.env`, loaded via `process.env`
- Docker containers: never run as root in production

### 2. Testing Rules
- **80% line coverage minimum** — enforced, not aspirational
- TDD workflow: write test first, then implementation
- AAA pattern: Arrange, Act, Assert
- No skipped tests (`it.skip`, `xit`) in production branches
- Integration tests for all API endpoints

### 3. Code Convention Rules
- No `any` types in TypeScript
- No `unwrap()` in Rust library code (use `Result<T, E>`)
- No `console.log` in production (use proper logging)
- Australian English in comments and docs
- Atomic git commits with descriptive messages

### 4. Deployment Rules
- Staging before production — always
- Health check endpoint required
- Rollback procedure documented before deploy
- Environment variables verified before deploy
- Post-deploy smoke tests mandatory

### 5. Quality Gate Rules
- **Phase 3 gate: 90% pass or fail** (binary, no partial)
- PRD completeness >= 90%
- Architecture decisions all justified
- All CRITICAL risks have mitigations
- No technology unknowns
- **Never start Phase 4 (Build) before Phase 3 passes**

## Installation

```
.claude/
  rules/
    01-security.md
    02-testing.md
    03-code-conventions.md
    04-deployment.md
    05-quality-gates.md
```

Claude Code reads these automatically on every session start.

## Key Enforcement Principle

Rules are **hard constraints**, not suggestions. If a rule says "No `any` types," the agent must refuse to write `any` types — not flag them as warnings.

---

*This is the condensed version. The full guide (HD-0060, $29) covers all 5 complete rule files ready to drop into any Claude Code project. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
