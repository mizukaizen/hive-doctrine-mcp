---
title: "The Guardrails — 5 Quality Rules That Stop AI Agents from Shipping Garbage"
author: "Melisia Archimedes"
collection: "C7: Dev Mastery"
tier: "honey"
price: 29
version: "1.0"
last_updated: "2026-03-09"
audience: "AI-native developers, Claude Code users, solo builders"
hive_doctrine_id: "HD-0060"
format: "Markdown rule definitions (Claude Code .claude/rules/ format)"
---

# The Guardrails: 5 Quality Rules That Stop AI Agents from Shipping Garbage

## Introduction: Why Constraints Beat Checklists

You're working with Claude Code as your pair programmer. The agent is fast, thoughtful, and often right. But "often right" isn't good enough when you're deploying to production. You need guardrails — not suggestions, not best practices, but **hard constraints** that apply automatically to every file you touch.

A checklist is something you remember to check. A rule is something the system enforces. Claude Code's `.claude/rules/` system lets you encode your non-negotiables so they apply to every session, every branch, every decision. You don't repeat yourself. The agent doesn't either.

This collection contains five rule files that have prevented thousands of dollars in incidents across production systems. They cover security, testing, code hygiene, deployment discipline, and the phase gate system that separates "code ready for staging" from "code ready for launch."

### How Rules Work

Rules are always-on constraints scoped to file patterns. When you create a rule file in `.claude/rules/`, Claude Code reads it before every operation. If a file matches the pattern, the rule applies. No exceptions. No "I'll just skip this once."

A rule file looks like this:

```markdown
# Rule Name

When working with files matching `*.ts`, `*.tsx`:

1. Never export functions without explicit parameter types
2. No implicit `any` types — strict mode only
3. Custom errors inherit from `Error` base class
```

The agent reads this. The agent follows it. Every session. Every branch.

---

## Rule 1: Security Rules

**Applies to:** `*.ts`, `*.tsx`, `*.rs`, `*.json`, `.env*`, `Dockerfile`, `docker-compose*`, `Caddyfile`

### What It Enforces

Security rules separate secrets from code, enforce strong defaults, validate all external input, and make dependency vulnerabilities visible before they reach production.

### Why It Matters

A single leaked API key in a Git commit is recoverable with rotation. A vulnerability chain that reaches production isn't — it's incident response, customer communication, possible data loss. Security isn't a feature. It's a prerequisite.

The rules below are the minimum bar. They're not paranoid. They're the difference between "we got hacked" and "we didn't."

### File Patterns and Constraints

#### 1. Secrets are Never in Code

**Pattern:** `.env*`, configuration files, `*.ts`, `*.tsx`, `*.rs`

- `.env` files are local only, never committed. Use `git` configuration to block them:
  ```bash
  echo ".env*" >> .gitignore
  echo ".env.local" >> .gitignore
  ```
- `.env.example` documents all required variables with dummy/sanitized values:
  ```
  DATABASE_URL=postgresql://user:pass@localhost/dbname
  API_KEY=your-api-key-here
  ENCRYPTION_KEY=base64-encoded-32-byte-key
  ```
- Code reads secrets from environment variables only. No hardcoding credentials.
- Rotation plan documented for every secret (database passwords, API keys, signing keys).

**Catches:** Accidentally committing `DATABASE_PASSWORD=prod_pw_123` to a public repo.

#### 2. Dependencies Are Scanned on Every Update

**Pattern:** `package.json`, `Cargo.toml`, `requirements.txt`, lock files

- Zero tolerance for CRITICAL or HIGH severity vulnerabilities in production dependencies.
- Every `npm update`, `cargo update`, `pip install` is followed by a security scan:
  ```bash
  npm audit --production
  cargo audit
  safety check
  ```
- Transitive vulnerabilities count. Scan the entire dependency tree, not just direct deps.
- Vulnerability remediation happens before the branch is merged:
  - Update the vulnerable package → run tests → scan again → commit
  - If no patch exists, document the risk + mitigation in SECURITY.md and get explicit sign-off
- Lock files are committed (package-lock.json, Cargo.lock). Reproducible installs matter.

**Catches:** Pulling in a logging library that has a known RCE vulnerability you didn't know about. Finding it on day 1 of staging, not in production week 3.

#### 3. Database Backups Precede Migrations

**Pattern:** `Dockerfile`, deployment scripts, migration files

- No migration runs against production without a tested backup.
- Backup testing is mandatory: you run the restore in a staging environment and verify data integrity.
- Rollback plan is documented before the migration executes:
  - What tables are affected
  - How to restore from backup
  - How to verify the rollback succeeded
- Time window for migration is agreed in advance. Off-peak only. Announce in advance.
- Schema changes include both forward and backward migrations:
  ```bash
  # Good
  migrate up    # applies schema change + data transformation
  migrate down  # reverts schema change, no data loss

  # Bad
  ALTER TABLE users DROP COLUMN last_login CASCADE
  -- No rollback. Data is gone.
  ```

**Catches:** Running an ALTER TABLE that modifies 2M rows at midnight, discovering a bug 30 minutes in, having no way to recover because nobody tested the restore.

#### 4. Auth Defaults to Strong

**Pattern:** `*.ts`, `*.tsx`, `*.rs`, authentication/authorization code

- No basic auth in production. API keys or OAuth only.
- Session tokens have short TTL (15 minutes for web sessions, 1 hour for API tokens).
- Passwords are hashed with bcrypt or argon2, never plaintext or weak algorithms.
- HTTPS enforced. No HTTP in production, ever.
- CORS is configured explicitly — no `*` origin. Specify trusted domains.
- JWT tokens include `exp` claim (expiration). Validate it on every request.
- Refresh tokens are separate from access tokens and have longer TTL (7 days).
- No hardcoded credentials in code. Ever. See Rule 1.1 above.

**Catches:** Using MD5 for password hashing. Allowing HTTP in production because "we'll switch later." CORS set to `*` to "make testing easier."

#### 5. Encryption In Transit and At Rest

**Pattern:** `*.ts`, `*.tsx`, `*.rs`, database configuration, TLS configuration

- All network communication is encrypted (TLS 1.3 or higher, TLS 1.2 minimum).
- Database connections use encrypted channels (SSL/TLS).
- Sensitive data at rest is encrypted:
  - PII (personally identifiable information) encrypted with AES-256
  - API keys stored encrypted with a key derived from environment secrets
  - User payment information never stored (use payment processor tokenization)
- Encryption keys are rotated regularly (annually minimum).
- Decryption failures are logged and don't expose the plaintext. They fail safely.

**Catches:** Storing user credit card numbers in plaintext. Using HTTP for API calls. Sending passwords unencrypted over WebSockets.

#### 6. Input Validation on All External Data

**Pattern:** `*.ts`, `*.tsx`, `*.rs`, API handlers, webhooks, form submissions

- All input from external sources (API requests, form submissions, webhooks, database reads) is validated immediately.
- Use a schema validation library (Zod for TypeScript, serde for Rust):
  ```typescript
  // Good
  const userSchema = z.object({
    email: z.string().email(),
    age: z.number().int().min(0).max(150),
  });

  // Bad
  function createUser(email, age) {
    // Trust that email is an email and age is a number
  }
  ```
- Validation errors are handled gracefully (return 400 with message, don't crash).
- Never construct SQL queries from user input (use parameterized queries / prepared statements).
- File uploads validate file type and size before processing.

**Catches:** A webhook sends malformed JSON. Code crashes because it tried to access `.user.id` on undefined. SQL injection because you concatenated user input directly into a query.

#### 7. No Debug Endpoints in Production

**Pattern:** `*.ts`, `*.tsx`, `*.rs`

- Debug routes (like `GET /debug/config`, `GET /admin/clear-cache`) are wrapped in environment checks:
  ```typescript
  if (process.env.NODE_ENV !== 'production') {
    app.get('/debug/config', (req, res) => {
      res.json(config);
    });
  }
  ```
- Debug code is never accessible in production, even if someone guesses the URL.
- Remove console.log statements before commit (or wrap them in dev-only checks).

**Catches:** Shipping a debug endpoint that exposes the entire configuration object to anyone who knows to ask for `/admin/debug`. A competitive researcher finds it and maps your entire system architecture.

---

## Rule 2: Testing Rules

**Applies to:** `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`, `test/`, `tests/`, `__tests__/`

### What It Enforces

Tests are written first, deterministic, and fast. They test behaviour, not implementation. Critical paths are covered end-to-end.

### Why It Matters

A test that sometimes passes and sometimes fails is worse than no test — it creates false confidence. A test that's slow gets skipped. A test that tests implementation details fails when you refactor (even if the refactor is good).

These rules ensure tests are trustworthy guardrails, not cargo cult ceremonies.

### Constraints

#### 1. TDD: Tests Written First

**Pattern:** All test files

- Write the test first. Then write code to make it pass.
- This sounds slow. It's not. Knowing what you're building before you build it saves rework.
- Test names describe what behaviour is being verified:
  ```typescript
  // Good
  it('should reject an email without a domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  // Bad
  it('test email', () => {
    expect(validateEmail('user@')).toBe(false);
  });
  ```

**Catches:** Writing code you think covers the happy path, then discovering in integration testing that it doesn't handle a critical edge case.

#### 2. Minimum 80% Code Coverage

**Pattern:** All test files

- Line coverage ≥80%. Branch coverage ≥75%.
- Coverage is measured before every production deploy.
- Coverage below 80% on new code blocks the merge.
- Exception: External code (vendor code, generated code, type stubs) doesn't count toward coverage.
- Coverage reports are stored in CI/CD — trends tracked over time.

**Catches:** Merging a feature that looks working but has untested error paths. Finding the bugs in production because 15% of the code has no test coverage.

#### 3. Tests Are Deterministic

**Pattern:** All test files

- No time-based tests. Don't use `setTimeout` to "wait for something to finish." Use mocks and promises.
- No random values. If you need to test with 100 different inputs, use property-based testing or parameterized tests.
- No external network calls in unit tests. Mock external APIs:
  ```typescript
  // Good
  const mockAPI = jest.fn().mockResolvedValue({ status: 'ok' });

  // Bad
  const response = await fetch('https://api.example.com/health');
  ```
- Integration tests can hit a test database / staging API. Unit tests cannot.
- A test run 100 times should pass 100 times, or fail 100 times. Never 99 passes and 1 failure.

**Catches:** A test that passes locally but fails in CI because the system clock is different. A flaky test that makes CI unreliable, so developers stop trusting it.

#### 4. Fast Test Suite

**Pattern:** All test files

- Unit tests complete in <1 second total.
- Integration tests complete in <10 seconds total.
- If a test takes >5 seconds, it's probably an integration test, not a unit test.
- Slow tests go in a separate suite run on merge, not on every commit.

**Catches:** A test suite that takes 2 minutes to run discourages frequent testing. Developers skip tests locally. Bugs slip through.

#### 5. Meaningful Assertions

**Pattern:** All test files

- Test behaviour, not implementation. Test the API contract, not the internals.
- If you refactor the function and the test still passes without changes, it's a good test.
- Assertions are specific:
  ```typescript
  // Good
  expect(user.email).toBe('test@example.com');
  expect(orders).toHaveLength(2);

  // Bad
  expect(user).toBeDefined();
  expect(orders).toBeTruthy();
  ```
- Every test has a clear expected outcome. No "happy path only" — test error cases too.

**Catches:** Refactoring a function and breaking its behaviour in a way the tests don't catch because they were too generic.

#### 6. E2E Tests for Critical Paths

**Pattern:** `e2e/`, `cypress/`, `playwright/` directories

- Signup flow: user creates account, verifies email, logs in. Fully scripted, runs daily.
- Payment flow (if applicable): user adds payment method, submits payment, receives confirmation. Fully scripted.
- Core product flow: the main job the product does, from user input to output. Fully scripted.
- E2E tests run in a real browser (or headless browser) against a staging environment.
- E2E tests are slow and expensive. Only cover critical paths. Don't test every checkbox with E2E.

**Catches:** The signup flow works in unit tests but fails in production because you didn't test email delivery. The payment integration fails on day 1 because it wasn't end-to-end tested.

---

## Rule 3: Code Conventions

**Applies to:** `*.ts`, `*.tsx`, `*.rs`

### What It Enforces

Consistent, readable, maintainable code. No god functions. No magic numbers. No copy-paste.

### Why It Matters

Code is read far more often than it's written. Code that's easy to read and understand is code that's easy to debug and maintain.

### Constraints

#### TypeScript-Specific

**Pattern:** `*.ts`, `*.tsx`

- Strict mode enabled in `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true
    }
  }
  ```
- No `any` types. Use `unknown` and narrow, or use a more specific type.
- Enums for state:
  ```typescript
  enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
  }
  ```
- Custom errors inherit from `Error`:
  ```typescript
  class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ValidationError';
    }
  }
  ```
- `async`/`await` for all async operations. No `.then()` chains (they're harder to debug).
- Naming: camelCase for variables/functions, PascalCase for classes/types, UPPER_SNAKE_CASE for constants.

**Catches:** Using `any` to avoid thinking about types. A type error that should be caught at compile time appears in production instead.

#### Rust-Specific

**Pattern:** `*.rs`

- Edition 2021 or later (in Cargo.toml: `edition = "2021"`).
- Clippy deny list applied:
  ```toml
  [lints.clippy]
  all = "deny"
  ```
- No `unwrap()` in library code (it panics). Use `Result` and propagate:
  ```rust
  // Good
  fn connect(url: &str) -> Result<Connection, Error> {
    let conn = TcpStream::connect(url)?;
    Ok(Connection::new(conn))
  }

  // Bad
  fn connect(url: &str) -> Connection {
    let conn = TcpStream::connect(url).unwrap();
    Connection::new(conn)
  }
  ```
- Use `thiserror` for custom error types.
- No `unsafe` blocks without documentation explaining why it's safe.

**Catches:** A library function that panics in production because you used `unwrap()` on a Result that turned out to be an error. A data race in `unsafe` code because it wasn't documented properly.

#### General (All Languages)

**Pattern:** `*.ts`, `*.tsx`, `*.rs`

- No `console.log` in production code. Use a logger:
  ```typescript
  logger.debug('processing user', { userId: user.id });
  ```
- No magic numbers. Extract them to named constants:
  ```typescript
  // Good
  const MAX_RETRIES = 3;

  // Bad
  for (let i = 0; i < 3; i++) {
    // ...
  }
  ```
- Functions ≤50 lines. Shorter is better. If it's >50 lines, split it.
- No commented-out code. Delete it. Git has history.
- No copy-paste. If you're writing similar code twice, extract a function.
- Clear error messages: "Database connection failed: timeout after 30s" not just "Error".

**Catches:** Reading code and seeing `// TODO: fix this` comments that have been there for 2 years. A magic number like `86400` that's actually seconds per day but nobody knows without testing.

---

## Rule 4: Deployment Rules

**Applies to:** `vercel.json`, `Dockerfile`, `docker-compose*`, `Caddyfile`, `nginx.conf`, `.github/workflows/*`, `Makefile`

### What It Enforces

Staging-first deployments, documented rollback plans, health checks, environment separation, and cultural rules (like no Friday deploys).

### Why It Matters

Deployment is where code meets reality. The best code in the world can fail if deployment is chaotic.

### Constraints

#### 1. Always Stage Before Prod

**Pattern:** Deployment configuration, CI/CD workflows

- Every commit goes to staging first.
- Staging uses the same code, same infrastructure, same database schema as production (except the data is anonymized/non-production).
- Staging runs a full smoke test (critical paths verified):
  - Login works
  - Core feature works
  - API responses are correct
  - No errors in logs
- Only after staging passes does code go to production.
- Staging is deployed with every merge to the main branch. Production is deployed only after explicit approval.

**Catches:** Deploying to production and discovering your new feature breaks under real-world traffic patterns you didn't test on your laptop.

#### 2. Health Checks Are Required

**Pattern:** `*.ts`, `*.tsx`, `*.rs`, `Dockerfile`, `vercel.json`

- Every server exposes `GET /health` that returns `200 OK` with JSON body:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-03-09T12:34:56Z",
    "version": "1.2.3"
  }
  ```
- Health check includes basic dependencies:
  - Can connect to database (not full query, just a ping)
  - Can reach external APIs (if critical to functionality)
  - Disk space OK (if applicable)
- Load balancers and deployment tools use this to determine if a server is healthy.
- If health check returns non-200, the server is removed from rotation.

**Catches:** A database connection drops and nobody notices for 20 minutes because there's no health check. A server is running but the API is broken because it can't reach a dependency.

#### 3. Rollback Plan Is Documented Before Deploy

**Pattern:** Deployment configuration, runbooks, incident response docs

- Before any production deploy, document:
  - What's changing (feature, bugfix, config)
  - How to rollback (revert to previous version, no data loss)
  - How to verify the rollback succeeded
  - What monitoring to watch (error rates, latency, key metrics)
  - Who's on-call if it breaks
- Rollback is tested in staging before production deploy.
- If you can't rollback easily, you don't deploy.

**Catches:** A deploy goes out, breaks something, and nobody knows how to roll back quickly. A 4-hour incident that should have been 10 minutes.

#### 4. Environment Separation

**Pattern:** `.env.example`, `docker-compose*.yml`, CI/CD configuration

- Staging and production have separate databases. No shared data.
- Staging and production have separate secrets (API keys, encryption keys, database passwords).
- Staging uses a different domain than production (staging.example.com vs. example.com).
- You cannot copy production data to staging without anonymizing it first.
- Code is the same between staging and production. Data is not. Secrets are not.

**Catches:** Someone runs a test in staging that accidentally deletes data or runs on production instead because the databases were the same. Staging secrets leak because they were hardcoded in the CI/CD config.

#### 5. No Friday Deploys

**Pattern:** Cultural/operational rule, CI/CD configuration

- This is the only cultural rule, and it matters more than the technical ones.
- Production deploys don't happen on Friday, Saturday, or Sunday.
- If something breaks on Friday, you're dealing with it all weekend. If something breaks on Tuesday, you fix it Tuesday.
- Exception: critical security patches. Even then, have someone on-call for the full weekend.
- Plan: deploy Tuesday–Thursday. Monitor. If all is well for 48 hours, consider it stable.

**Catches:** A deploy on Friday at 4 PM. Breaks at 6 PM. On-call engineer doesn't see it until Monday. Weekend is ruined. Loss of customer trust.

---

## Rule 5: Quality Gates

**Applies to:** Project phases, development workflow, merge approval

### What It Enforces

Binary gates that separate "could ship" from "must ship" from "shouldn't ship."

### Why It Matters

Gates are decision points. Without them, you ship too early. With them, you ship only when you're genuinely ready.

### Constraints

#### Phase 3 Gate: Design Readiness (Go/No-Go)

**Trigger:** Before starting Phase 4 (Build)

**Checklist:**
- PRD (Product Requirements Document) is ≥90% complete: all major features documented, acceptance criteria defined, edge cases identified
- Architecture review: ≥90% of design decisions are justified (why this database, why this API pattern, why this deployment strategy)
- Risk register: all CRITICAL risks have documented mitigations. HIGH risks have a plan.
- Feasibility: zero technology unknowns. Have you prototyped the risky parts?

**Decision:** PASS (≥90%) or FAIL (<90%). Binary. No partial passes.

**If FAIL:** Fix the failures, re-do the gate.

**If PASS:** Green light to build.

**Catches:** Starting to build before you've thought through the architecture. Finding a critical blocker 40% through the build. Discovering the database choice was wrong after 10K lines of code.

#### Phase 5 Gate: Test & Security (Release Candidate)

**Trigger:** Before merging to main branch

**Checklist:**
- Test coverage: ≥80% line coverage, ≥75% branch coverage
- Security scan: zero CRITICAL vulnerabilities, zero HIGH vulnerabilities in production dependencies
- Design audit: ≥90% of WCAG 2.1 AA accessibility checks passed (keyboard nav, color contrast, screen reader support)
- Code review: zero blockers, all MAJOR comments resolved, at least one approving review

**Decision:** PASS or FAIL. If any item fails, the code doesn't merge.

**If FAIL:** Fix the failures, re-run tests/scans, resolve review comments.

**If PASS:** Code is production-ready (from a technical standpoint).

**Catches:** Shipping code with known security vulnerabilities. Shipping an inaccessible UI that locks out users with disabilities. Shipping untested code that breaks in production.

#### Phase 8 Gate: Launch Readiness (Go/No-Go for Real)

**Trigger:** Final check before production deploy

**Checklist:**
- All previous gates (Phase 3 and Phase 5) passed
- Runbook is documented and tested (can someone unfamiliar follow it and deploy?)
- Incident response plan is ready (how do we respond if something breaks?)
- Analytics and monitoring are live (do we have dashboards for key metrics?)
- Launch comms are prepared (who do we tell, when, in what order?)

**Decision:** PASS or FAIL.

**If FAIL:** Work through the blockers.

**If PASS:** Deploy to production.

**Catches:** A perfectly well-engineered feature that deploys with no monitoring. An incident happens and you have no idea what broke. No runbook means on-call engineers aren't sure how to deploy the rollback.

#### The Critical Rule

**Never start Phase 4 (Build) before Phase 3 passes 90%.** This is the single most important rule in the pipeline. It prevents the most common failure mode: building the wrong thing well.

---

## How to Write Your Own Rules

Rules live in `.claude/rules/` as Markdown files. Format:

```markdown
# Rule Name

**Applies to:** `*.ts`, `*.tsx`, `Dockerfile`

**Why it matters:** [1-2 sentences on the cost of not following it]

### Constraint 1: [Constraint Title]

[1-2 paragraphs explaining what's enforced and why]

- Specific requirement 1
- Specific requirement 2
- Specific requirement 3

**Catches:** [Example of what this constraint prevents]

### Constraint 2: [Next Constraint]

[Same structure]
```

Rules are:
- **Specific:** They say what to do, not just "be careful"
- **Scoped:** They apply to a specific file pattern, not everything
- **Justified:** They explain why, not just what
- **Actionable:** They tell you how to verify compliance

---

## Conclusion: Rules as Guardrails, Not Suggestions

A rule encoded in `.claude/rules/` is consulted by Claude Code on every session. You don't have to repeat yourself. The agent doesn't either.

This is constraint-based agent governance. You're not managing the agent through micromanagement ("do this, then do that"). You're setting boundaries and letting the agent work within them.

The five rules in this collection have prevented thousands of dollars in incidents. They're not overkill. They're the minimum bar for production-grade software built by you and AI working together.

Internalize them. Customize them to your context. Write your own. Make it impossible to ship garbage.

