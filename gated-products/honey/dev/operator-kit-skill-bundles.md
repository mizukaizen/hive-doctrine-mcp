---
title: "The Skill Arsenal — 7 Claude Code Skill Templates for Quality-Gated Development"
author: "Melisia Archimedes"
collection: "C7: Dev Mastery"
tier: "honey"
price: 49
version: "1.0"
last_updated: "2026-03-09"
audience: "AI-native developers, Claude Code users, solo builders"
hive_doctrine_id: "HD-0059"
format: "Markdown skill definitions (Claude Code .claude/skills/ format)"
---

# The Skill Arsenal — 7 Claude Code Skill Templates for Quality-Gated Development

## Introduction: Beyond Chatbot Responses

When you ask Claude Code a question, you get general knowledge. When you give it a **skill**, you get domain expertise.

A skill is a reference document that Claude Code agents invoke automatically when they need structured knowledge. It's not a prompt. It's not a tutorial. It's a **living checklist and pattern library** that your agent relies on without you having to repeat it.

The difference:
- **Chatbot model:** You ask Claude how to deploy an app. It gives a generic answer about Docker and GitHub.
- **Agent with Deployment Checklist skill:** You ask your builder agent to deploy. It automatically consults the skill, runs pre-flight checks (tests passing, security scan clean, env vars set), executes the deployment, then verifies health endpoints. It knows what to do because the skill defined the contract.

This product contains 7 skills that form a complete quality-gated development system. They're written in Claude Code's native `.claude/skills/` format and can be dropped directly into your workspace.

## How Skills Fit Into Agent Architecture

Your development workflow looks like this:

1. **You write a goal.** "Build a production payment system."
2. **Your agent reads the BMAD Checklist skill** to understand the 8-phase Definition of Done.
3. **The agent invokes specialist skills** as it progresses:
   - Discovery phase → reads BMAD Checklist
   - PRD phase → reads BMAD Checklist (gates at 90%)
   - Architecture phase → reads Code Patterns skill
   - Build phase → reads Code Patterns + API Patterns skills
   - Test phase → reads Testing Strategy skill
   - Security audit → reads Security Scanning skill
   - Deployment → reads Deployment Checklist skill
   - Final launch → reads Design System skill (accessibility audit)

4. **The agent delivers a production-ready system** because it never skipped a gate and never ignored a checklist.

Skills are the operating manual your agent reads. You write them once, then leverage them across every project. This is how teams of one operate like teams of ten.

---

## Skill 1: BMAD Checklist

**Purpose:** Define the 8-phase Definition of Done. Make the critical Phase 3 gate (90% threshold) immovable.

**What it covers:**
- Phase 1: Discovery (scope, assumptions, constraints documented)
- Phase 2: PRD + Architecture (requirements 90%+ filled, design decisions justified)
- **Phase 3 Gate (CRITICAL 90% binary gate)** — halt here if threshold not met
- Phase 4: Build (implementation against PRD)
- Phase 5: Test + Security (coverage ≥80%, security scan clean)
- Phase 6: Infrastructure (deployment path defined, monitoring in place)
- Phase 7: Payments + Auth (if applicable; identity and transaction safety verified)
- Phase 8: Launch + Growth (runbook tested, incident response ready, comms prepared)

**Key pattern:**
Each phase has three components:
1. **Deliverables** — what artifact exits this phase
2. **Checkboxes** — specific items to verify
3. **Gate criteria** — pass/fail threshold

Phase 3 is binary: you either hit 90% completeness on PRD, architecture, and risk register, or you don't. No partial passes. If it fails, you loop back to Phase 2.

**When it's invoked:**
- Agent is starting a new project or feature
- Agent reaches a phase boundary and needs to decide: go/no-go
- You ask: "Is this ready to build?"

**How to customise:**
Replace the 8 phases with your own product cadence. If you ship in 4 phases (Plan, Build, Test, Ship), restructure the checklist to match. The key idea stays the same: define the gates, make them binary, and enforce the critical one (usually 90%).

**Skill template excerpt:**
```
# BMAD Checklist Skill

## Phase 1: Discovery
- [ ] Problem statement written
- [ ] Target audience identified
- [ ] Assumptions documented
- [ ] Constraints listed (technical, legal, timeline, budget)

**Gate criteria:** All items checked.

---

## Phase 2: PRD + Architecture
- [ ] PRD sections filled ≥90%: overview, goals, success metrics, user flows, non-functional requirements
- [ ] Architecture diagram exists (boxes and arrows at minimum)
- [ ] Tech stack chosen and justified
- [ ] Risk register created with ≥3 identified risks
- [ ] Each CRITICAL risk has mitigation plan

**Gate criteria:** ≥90% of sections complete. All CRITICAL risks have mitigations.

---

## Phase 3: CRITICAL GATE CHECK
**Result: PASS or FAIL. Binary. No partial passes.**

Before proceeding to Phase 4:
- [ ] PRD completeness ≥90%
- [ ] Architecture review ≥90% of decisions justified
- [ ] Risk register: 0 unmitigated CRITICAL risks
- [ ] No unknown technical dependencies

**If FAIL:** Return to Phase 2. Do not proceed to Phase 4.
**If PASS:** Proceed to Phase 4.

---

[Phases 4–8 follow similar structure]
```

---

## Skill 2: Security Scanning

**Purpose:** Provide an automated checklist and command reference for security audits.

**What it covers:**
- OWASP Top 10 (2021): Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable Components, Identification & Auth, Data Integrity, Logging & Monitoring, Server-Side Request Forgery
- Dependency scanning (npm, Cargo, pip)
- Secrets detection patterns and grep commands
- SSL/TLS verification
- Input validation and output encoding patterns

**Key patterns:**
- **Dependency scanning:** Each language has a built-in audit command. npm audit, cargo audit, pip-audit. These run once per build.
- **Secrets detection:** Grep for known patterns—Stripe keys start with `sk_live_` or `pk_live_`, AWS keys are 20 chars, GitHub tokens start with `ghp_`, Slack tokens start with `xoxb-` or `xoxp-`. Your CI should reject commits containing these patterns.
- **OWASP checklist:** For each of the 10, list the specific thing to check. Example: "Broken Access Control" → verify users can't access other users' data by changing a URL parameter.

**When it's invoked:**
- Agent is entering Phase 5 (Test + Security)
- Agent is reviewing code before deployment
- You ask: "Run a security scan"

**How to customise:**
Add patterns specific to your stack. If you use Auth0, add checks for Auth0-specific misconfigurations. If you process payment cards, add PCI-DSS checks. The template is OWASP; your implementations are domain-specific.

**Skill template excerpt:**
```
# Security Scanning Skill

## OWASP Top 10 Checklist

### 1. Broken Access Control
- [ ] Users cannot access other users' data by modifying URL parameters
- [ ] Authorization checked before every protected action
- [ ] Privilege escalation is impossible without admin action
- [ ] Rate limiting is on sensitive endpoints

### 2. Cryptographic Failures
- [ ] All secrets stored in .env, not in code
- [ ] Passwords hashed with bcrypt (cost 10+) or Argon2
- [ ] TLS 1.2+ required for all network communication
- [ ] No deprecated algorithms (MD5, SHA1, DES)

[... patterns 3–10 follow ...]

---

## Dependency Scanning

### npm
\`\`\`bash
npm audit --audit-level=moderate
npm audit fix  # automatic remediation
\`\`\`

### Cargo
\`\`\`bash
cargo audit
cargo update
\`\`\`

### pip
\`\`\`bash
pip-audit
\`\`\`

---

## Secrets Detection

### Common Patterns to Reject
- Stripe keys: `sk_live_`, `pk_live_`, `sk_test_`, `pk_test_`
- AWS keys: 20-character base64 after `AKIA`
- GitHub tokens: `ghp_[36 alphanumeric]`
- Slack tokens: `xoxb-` or `xoxp-` prefixes
- Private keys: `-----BEGIN PRIVATE KEY-----`

### Grep Commands
\`\`\`bash
# Find Stripe keys
grep -rE 'sk_(live|test)_[0-9a-zA-Z]{20,}' .

# Find AWS keys
grep -rE 'AKIA[0-9A-Z]{16}' .

# Find .env files in repo
find . -name '.env*' -not -path './node_modules/*'
\`\`\`
```

---

## Skill 3: Testing Strategy

**Purpose:** Define test structure, coverage targets, and the AAA pattern.

**What it covers:**
- Red-Green-Refactor workflow (TDD)
- Coverage targets: unit ≥80%, integration all endpoints, E2E critical user flows
- AAA pattern: Arrange (setup), Act (invoke), Assert (verify)
- Test quality rules: deterministic, fast, independent, readable, no implementation coupling
- Coverage commands (nyc, cargo tarpaulin, pytest coverage)
- E2E test patterns: happy path, error paths, edge cases

**Key patterns:**
- **TDD:** Write the test first (it fails), write code to pass it, refactor. This forces you to think about the interface before building.
- **AAA pattern:** Every test has three blocks. Arrange: set up fixtures. Act: call the function. Assert: check the result. This makes tests readable.
- **Coverage targets are non-negotiable:** 80% unit test coverage means you've verified the behaviour of 80% of your code. Below that, you're flying blind. Integration tests verify that units work together. E2E tests verify that the user experience is correct.
- **No implementation coupling:** If your test breaks when you refactor code (but behaviour stays the same), the test is wrong.

**When it's invoked:**
- Agent is in Phase 4 (Build) and needs to write tests
- Agent enters Phase 5 (Test + Security)
- You ask: "Write tests for this feature"

**How to customise:**
Adjust coverage targets based on domain. Life-critical code (medical, finance, safety) might target 90%+ coverage. Prototype code might target 60%. The rule: coverage target should match risk.

**Skill template excerpt:**
```
# Testing Strategy Skill

## TDD Workflow: Red-Green-Refactor

1. **Red:** Write a test that fails because the feature doesn't exist
2. **Green:** Write minimal code to make the test pass
3. **Refactor:** Clean up code without changing behaviour; test still passes

This forces you to:
- Think about the API before building
- Write testable code by default
- Have a test passing at every step

---

## AAA Test Pattern

### Template
\`\`\`typescript
describe('FeatureName', () => {
  it('should behaviour when condition', () => {
    // Arrange: Set up fixtures and initial state
    const input = { foo: 'bar' };
    const expected = 42;

    // Act: Call the function
    const result = myFunction(input);

    // Assert: Verify the result
    expect(result).toBe(expected);
  });
});
\`\`\`

### What each section does:
- **Arrange:** All setup. Create mocks, fixtures, database state. This is the "given" in BDD.
- **Act:** One function call. Your test should have exactly one line that exercises the code under test.
- **Assert:** Verify the output and side effects.

---

## Coverage Targets

| Category | Target | Why |
|----------|--------|-----|
| Unit tests | ≥80% line coverage | Behaviour is verified for 80% of code paths |
| Integration tests | All public endpoints | Every API route tested with real dependencies |
| E2E tests | Critical user flows only | Happy path, key error scenarios, payment flows if applicable |

### Commands to measure coverage:

**TypeScript/JavaScript (nyc + Jest):**
\`\`\`bash
npx jest --coverage
\`\`\`

**Rust (cargo tarpaulin):**
\`\`\`bash
cargo tarpaulin --out Html
\`\`\`

**Python (pytest-cov):**
\`\`\`bash
pytest --cov=src --cov-report=html
\`\`\`

---

## E2E Test Patterns

### Happy Path
User completes the feature with no errors.
\`\`\`typescript
it('should create a user and send a welcome email', async () => {
  // Arrange
  const userData = { email: 'test@example.com', name: 'Alice' };

  // Act
  const user = await createUser(userData);
  const email = await getLastEmail(userData.email);

  // Assert
  expect(user.id).toBeDefined();
  expect(email.subject).toContain('Welcome');
});
\`\`\`

### Error Path
User or system encounters an error. Verify graceful degradation.
\`\`\`typescript
it('should reject invalid email', async () => {
  const userData = { email: 'not-an-email', name: 'Bob' };
  await expect(createUser(userData)).rejects.toThrow('Invalid email');
});
\`\`\`

### Edge Cases
Boundary conditions, empty inputs, max values.
\`\`\`typescript
it('should handle 10000-char description', async () => {
  const longDesc = 'x'.repeat(10000);
  const result = await createItem({ description: longDesc });
  expect(result.description.length).toBe(10000);
});
\`\`\`
```

---

## Skill 4: API Patterns

**Purpose:** Standardise REST conventions, Stripe integrations, and auth patterns.

**What it covers:**
- REST URL structure, HTTP methods, response/error formats, status codes
- Stripe checkout flow (client secret, webhook signature verification, idempotency)
- Auth patterns (PocketBase, JWT, row-level security)

**Key patterns:**
- **REST conventions:** GET, POST, PUT, PATCH, DELETE are not suggestions—they're contracts. GET should never modify state. POST creates, PUT replaces, PATCH modifies. Status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error.
- **Stripe integration:** Every checkout is a request/response cycle. Client sends amount and email, Stripe returns a client secret, client uses that to open the Stripe payment form. On success, webhook verifies the signature and marks the payment as complete. Idempotency keys prevent duplicate charges if the request retries.
- **Auth:** PocketBase handles identity (users, sessions, OAuth). JWT is the token format (signed, stateless, includes user ID and permissions). Row-level security means queries automatically filter rows based on who's asking.

**When it's invoked:**
- Agent is building an API
- Agent is integrating a payment provider
- You ask: "Design the API for this feature"

**How to customise:**
Replace Stripe with your payment provider. Replace PocketBase with your auth system. The patterns stay the same: define the contract (request/response), handle errors explicitly, verify signatures on webhooks.

**Skill template excerpt:**
```
# API Patterns Skill

## REST Conventions

### URL Structure
- Resource nouns, not verbs: `/users`, not `/getUsers`
- Nesting only for relationships: `/users/123/posts`, not `/user/123/get/posts`
- Query parameters for filters: `/posts?status=published&limit=10`

### HTTP Methods
| Method | Semantics | Example |
|--------|-----------|---------|
| GET | Retrieve (no side effects) | GET /users/123 |
| POST | Create | POST /users (with body: { name, email }) |
| PUT | Replace entire resource | PUT /users/123 (with body: { name, email, role }) |
| PATCH | Partial update | PATCH /users/123 (with body: { role: 'admin' }) |
| DELETE | Remove | DELETE /users/123 |

### Status Codes
| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK (success) | GET /users |
| 201 | Created | POST /users returns new user |
| 400 | Bad Request (client error) | Missing required field |
| 401 | Unauthorized (no token) | Missing Authorization header |
| 403 | Forbidden (no permission) | User 1 tries to delete user 2's post |
| 404 | Not Found | GET /users/999 |
| 500 | Server Error | Unhandled exception |

### Response Format
\`\`\`json
{
  "status": "success",
  "data": { ... },
  "error": null
}
\`\`\`

On error:
\`\`\`json
{
  "status": "error",
  "data": null,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email format is invalid"
  }
}
\`\`\`

---

## Stripe Integration

### Checkout Flow

1. **Client requests checkout:**
   \`\`\`
   POST /api/checkout
   { amount: 4999, email: 'user@example.com' }
   \`\`\`

2. **Server creates Stripe PaymentIntent:**
   \`\`\`javascript
   const intent = await stripe.paymentIntents.create({
     amount: 4999, // cents
     currency: 'usd',
     receipt_email: 'user@example.com',
     idempotency_key: 'unique-key-per-request'
   });

   return { clientSecret: intent.client_secret };
   \`\`\`

3. **Client opens payment form with client secret.**

4. **After success, Stripe sends webhook:**
   \`\`\`
   POST /api/webhooks/stripe
   Event: payment_intent.succeeded
   Signature: stripe-signature header
   \`\`\`

5. **Server verifies signature and marks payment complete:**
   \`\`\`javascript
   const event = stripe.webhooks.constructEvent(
     body,
     sig,
     endpointSecret
   );

   if (event.type === 'payment_intent.succeeded') {
     // Mark order as paid
   }
   \`\`\`

### Anti-patterns
- Don't trust client to confirm payment (always use webhook)
- Don't store raw card data (let Stripe handle it)
- Don't skip signature verification on webhooks (webhooks are public endpoints)

---

## Auth Patterns: PocketBase + JWT

### Session Flow
1. User logs in → server creates session → returns JWT
2. Client stores JWT in httpOnly cookie
3. Client sends JWT on every request
4. Server verifies JWT signature and expiry

### Row-Level Security
\`\`\`sql
-- User can only see their own posts
SELECT * FROM posts WHERE user_id = $1
\`\`\`

### Custom Claims in JWT
\`\`\`json
{
  "sub": "user_id_123",
  "email": "user@example.com",
  "role": "admin",
  "exp": 1234567890
}
\`\`\`
```

---

## Skill 5: Code Patterns

**Purpose:** Define language-specific conventions and anti-patterns to reject.

**What it covers:**
- TypeScript: strict mode, no `any`, custom error classes, async/await, naming
- Rust: clippy deny, no unwrap in libraries, thiserror crate, no unsafe without justification
- Anti-patterns: console.log in prod, magic numbers, god functions, nested callbacks, copy-paste, commented-out code

**Key patterns:**
- **Strong typing prevents bugs:** TypeScript `strict: true` catches undefined, null, and type mismatches at compile time. `any` is a footgun—avoid it.
- **Explicit error handling:** Don't throw. Create custom error classes. In Rust, never `unwrap()` in library code—propagate the error up.
- **No magic:** Every constant should be named. Every function should do one thing. Every callback should be flattened with async/await.

**When it's invoked:**
- Agent is writing code in Phase 4
- Code review in Phase 5
- You ask: "Review this code for quality"

**How to customise:**
Add patterns for your languages. If you use Python, add conventions (black formatter, mypy strict, dataclasses for records). If you use Go, add checks (error handling, interface design). The template is a starting point.

**Skill template excerpt:**
```
# Code Patterns Skill

## TypeScript Conventions

### Strict Mode (Non-Negotiable)
\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
\`\`\`

### No `any` Type
**Bad:**
\`\`\`typescript
function process(data: any) { ... }
\`\`\`

**Good:**
\`\`\`typescript
function process<T extends Record<string, unknown>>(data: T) { ... }
\`\`\`

### Custom Error Classes
**Bad:**
\`\`\`typescript
throw new Error('User not found');
\`\`\`

**Good:**
\`\`\`typescript
class UserNotFoundError extends Error {
  constructor(public userId: string) {
    super(`User ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

throw new UserNotFoundError('123');
\`\`\`

### Async/Await (Never Nested Callbacks)
**Bad:**
\`\`\`typescript
function fetchUser(id: string) {
  return db.users.findOne({ id }, (err, user) => {
    if (err) return callback(err);
    sendEmail(user.email, () => { ... });
  });
}
\`\`\`

**Good:**
\`\`\`typescript
async function fetchUser(id: string) {
  const user = await db.users.findOne({ id });
  await sendEmail(user.email);
  return user;
}
\`\`\`

### Naming Conventions
- Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- Variables/functions: camelCase (`getUserById`, `isActive`)
- Classes: PascalCase (`UserService`, `PaymentError`)
- Private methods: `_prefix` or `#private`

---

## Rust Conventions

### Clippy Deny
\`\`\`toml
[lints.clippy]
all = "deny"
pedantic = "deny"
\`\`\`

### No `unwrap()` in Library Code
**Bad:**
\`\`\`rust
pub fn parse_config(path: &str) -> Config {
  let contents = fs::read_to_string(path).unwrap(); // Will panic!
  serde_json::from_str(&contents).unwrap()
}
\`\`\`

**Good:**
\`\`\`rust
pub fn parse_config(path: &str) -> Result<Config, ConfigError> {
  let contents = fs::read_to_string(path)
    .map_err(|e| ConfigError::ReadError(e))?;
  serde_json::from_str(&contents)
    .map_err(|e| ConfigError::ParseError(e))
}
\`\`\`

### `thiserror` for Custom Errors
\`\`\`rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ConfigError {
  #[error("failed to read config: {0}")]
  ReadError(#[from] std::io::Error),

  #[error("invalid JSON in config: {0}")]
  ParseError(#[from] serde_json::Error),
}
\`\`\`

---

## Anti-Patterns to Reject

| Anti-pattern | Why | Fix |
|--------------|-----|-----|
| `console.log()` in prod | Noise in logs, performance hit | Use structured logger (pino, winston) |
| Magic numbers | Unmaintainable | Extract to named const |
| God functions (>100 lines) | Hard to test, reason about | Split into smaller functions |
| Nested callbacks | Unreadable (pyramid of doom) | Use async/await |
| Copy-paste code | Bugs propagate, maintenance nightmare | Extract to shared function |
| Commented-out code | Confuses readers, clutters repo | Delete or open an issue |
```

---

## Skill 6: Deployment Checklist

**Purpose:** Standardise pre-deploy and post-deploy verification.

**What it covers:**
- Frontend deployment (Git push, preview URLs, production merge)
- Backend deployment (Docker, reverse proxy, env vars, migrations)
- Pre-deploy checklist (tests, security, health checks)
- Post-deploy verification (health, smoke tests, error monitoring)
- Rollback procedures

**Key patterns:**
- **Pre-deploy:** Never deploy without tests passing and security scan clean. Environment variables must be set. Database migrations must be tested. You must have a rollback plan.
- **Post-deploy:** Don't assume everything worked. Run smoke tests (login, create a resource, view it). Check error rates. Verify SSL certificate. Monitor for 10 minutes.

**When it's invoked:**
- Agent enters Phase 6 (Infrastructure)
- Agent is ready to deploy to production
- You ask: "Deploy this to production"

**How to customise:**
Replace the generic Docker commands with your deployment platform. If you use Fly.io, K8s, or Lambda, adapt the deployment section. The checklist structure stays the same.

**Skill template excerpt:**
```
# Deployment Checklist Skill

## Pre-Deploy Checklist

### Tests & Security
- [ ] All tests passing locally: \`npm test\` or \`cargo test\`
- [ ] Security scan clean: \`npm audit\`, \`cargo audit\`, or equivalent
- [ ] No secrets in code or logs
- [ ] Code review approved

### Environment & Config
- [ ] All .env variables documented and set on production server
- [ ] Database migrations tested and reversible
- [ ] Feature flags (if used) configured for rollout strategy
- [ ] SSL certificate renewed (if expiring within 30 days)

### Health Checks
- [ ] Health endpoint exists: GET /api/health returns 200
- [ ] Readiness check included (dependencies up, DB connected)
- [ ] Liveness check included (server is responding)

### Rollback Plan
- [ ] Previous version tagged in Git (e.g., \`v1.2.3\`)
- [ ] Rollback procedure documented (revert commit, redeploy, verify)
- [ ] Data migration is reversible (migrations have rollback scripts)

---

## Deployment: Frontend (Git Push)

### Prerequisites
- Branch protection rules enabled on \`main\`
- Pull request required before merge
- Status checks required (tests, lint, build succeeds)

### Deploy Flow
\`\`\`bash
# 1. Create feature branch
git checkout -b ui/feature-name

# 2. Make changes to source files

# 3. Commit
git add .
git commit -m "ui: description of change"

# 4. Push to origin
git push origin ui/feature-name

# 5. Open pull request
# (via GitHub UI)

# 6. CI runs tests and builds preview URL

# 7. Review preview URL in browser

# 8. Merge PR (GitHub UI)

# 9. Vercel auto-deploys to production
\`\`\`

### Rollback Frontend
\`\`\`bash
# If deployment is broken, revert the commit
git revert <commit-hash>
git push origin main

# Vercel redeploys within 2 minutes
\`\`\`

---

## Deployment: Backend (Docker)

### Prerequisites
- Docker image built and pushed to registry
- ENV variables set on production server
- Reverse proxy configured (Caddy, Nginx)

### Deploy Flow
\`\`\`bash
# 1. Build Docker image locally
docker build -t myapp:v1.2.3 .

# 2. Push to registry
docker push registry.example.com/myapp:v1.2.3

# 3. SSH to production server
ssh user@prod.example.com

# 4. Pull latest image
docker pull registry.example.com/myapp:v1.2.3

# 5. Stop old container
docker stop myapp

# 6. Start new container
docker run -d \
  --name myapp \
  --restart always \
  -e DATABASE_URL=postgres://... \
  -e API_KEY=... \
  -p 127.0.0.1:3000:3000 \
  registry.example.com/myapp:v1.2.3

# 7. Run migrations (if any)
docker exec myapp npm run migrate

# 8. Verify health
curl http://localhost:3000/api/health
\`\`\`

### Reverse Proxy: Caddy Example
\`\`\`
example.com {
  reverse_proxy localhost:3000
  encode gzip

  # Auto-renew HTTPS
  tls {
    on_demand
  }
}
\`\`\`

### Rollback Backend
\`\`\`bash
# Stop current container
docker stop myapp

# Start previous container
docker run -d \
  --name myapp \
  --restart always \
  -e DATABASE_URL=postgres://... \
  -e API_KEY=... \
  -p 127.0.0.1:3000:3000 \
  registry.example.com/myapp:v1.2.2

# Verify health
curl http://localhost:3000/api/health
\`\`\`

---

## Post-Deploy Verification (10 minutes)

### Immediate Checks
- [ ] Health endpoint responds: \`curl https://example.com/api/health\`
- [ ] No 5xx errors in logs
- [ ] Response times normal (no outliers)

### Smoke Tests
- [ ] Happy path works (login, create resource, view it)
- [ ] Error paths graceful (invalid input, 400 returned, not 500)
- [ ] Auth required on protected endpoints (401 when no token)

### Error Monitoring
- [ ] Sentry/DataDog/equivalent receives no new errors
- [ ] Database connections healthy
- [ ] External APIs (payment, email, etc.) responding

### Performance
- [ ] Page load time stable (<3s for homepage)
- [ ] No memory leaks (memory usage stable after 5 minutes)
- [ ] CPU usage normal (not spiking)

### If All Green
- Post in team channel: "Deployed v1.2.3 to production. Monitoring for 10 minutes."
- Continue monitoring for 1 hour before declaring success.
```

---

## Skill 7: Design System (Accessibility)

**Purpose:** Make WCAG 2.1 AA compliance automatic and auditable.

**What it covers:**
- WCAG 2.1 AA principles: Perceivable, Operable, Understandable, Robust
- Responsive breakpoints (375px–1440px with Tailwind classes)
- Component patterns (buttons, modals, forms, navigation, loading states)
- Audit tools (Lighthouse, axe-core)

**Key patterns:**
- **Perceivable:** Users can see and hear content. Minimum contrast ratio 4.5:1 for text. Alt text for images. Captions for video.
- **Operable:** Users can navigate with keyboard only. Focus indicators visible. No flickering (causes seizures). Touch targets at least 44×44px.
- **Understandable:** Language is plain. Error messages are clear. Consistent navigation. Form labels associated with inputs.
- **Robust:** Works across browsers and assistive tech. Valid HTML. ARIA labels where needed.

**When it's invoked:**
- Agent enters Phase 8 (Launch + Growth)
- You ask: "Run an accessibility audit"
- Design review in Phase 5

**How to customise:**
Add your brand's design tokens (colors, typography, spacing). Replace the responsive breakpoints with your own grid system. The WCAG checklist is standard, but your implementation details are unique.

**Skill template excerpt:**
```
# Design System Skill: Accessibility

## WCAG 2.1 AA Checklist

### Perceivable (Can users see and hear the content?)

#### Color & Contrast
- [ ] Text contrast ratio ≥4.5:1 (AAA: ≥7:1)
- [ ] Don't rely on colour alone (use icons, text labels too)
- [ ] Focus indicator visible (outline or background colour change)

#### Text
- [ ] Font size ≥16px (or 1rem) for body text
- [ ] Line height ≥1.5 for readability
- [ ] Line length ≤80 characters for long-form text

#### Images & Media
- [ ] Every image has descriptive alt text
- [ ] Videos have captions and transcripts
- [ ] No content conveyed by colour alone

### Operable (Can users interact with the content?)

#### Keyboard Navigation
- [ ] All interactive elements keyboard accessible (Tab, Enter, Space)
- [ ] Tab order logical (left-to-right, top-to-bottom)
- [ ] Focus trap in modals (Tab cycles within modal, not page)
- [ ] No keyboard trap (always a way to exit)

#### Touch & Click Targets
- [ ] Touch targets ≥44×44px (iOS) or ≥48×48px (WCAG AAA)
- [ ] Buttons have visible focus state
- [ ] Double-tap zoom not disabled (unless >100% zoom)

#### Timing
- [ ] No auto-refresh (or user can disable)
- [ ] No flickering (nothing flashes >3/second — triggers seizures)
- [ ] Animations can be paused (prefers-reduced-motion respected)

### Understandable (Can users understand the content?)

#### Language & Context
- [ ] Page language declared: \`<html lang="en">\`
- [ ] Words have definitions or context
- [ ] Error messages are specific ("Email is invalid" not "Error")
- [ ] Form labels associated with inputs (for="id" attribute)

#### Navigation & Consistency
- [ ] Navigation consistent across pages
- [ ] Purpose of each page clear from title and heading
- [ ] Links descriptive ("Click here" is bad; "Download user guide" is good)

### Robust (Does it work across browsers and assistive tech?)

#### Code Quality
- [ ] Valid HTML (no duplicate IDs, proper nesting)
- [ ] Semantic HTML (\`<button>\`, \`<nav>\`, \`<main>\`, not \`<div onclick>\`)
- [ ] ARIA labels on custom components (\`role="button"\`, \`aria-label\`)
- [ ] Form labels programmatically associated

#### Assistive Tech
- [ ] Tested with screen reader (NVDA on Windows, VoiceOver on Mac)
- [ ] Heading hierarchy correct (h1, then h2, not skipping levels)
- [ ] Lists marked as lists (\`<ul>\`, \`<ol>\`, not \`<div>\`)

---

## Responsive Breakpoints (Tailwind)

| Viewport | Tailwind Class | Use Case |
|----------|----------------|----------|
| 375px–480px | sm (640px actually) | Phones (portrait) |
| 481px–768px | md | Tablets (portrait) |
| 769px–1024px | lg | Tablets (landscape) |
| 1025px–1440px | xl | Desktops |
| 1441px+ | 2xl | Large monitors |

### Mobile-First Approach
\`\`\`html
<!-- Start with mobile (375px) -->
<div class="text-sm p-2">
  <!-- Tablet: increase padding -->
  <div class="md:p-4">
    <!-- Desktop: increase font size -->
    <div class="lg:text-base lg:p-6">
    </div>
  </div>
</div>
\`\`\`

---

## Component Accessibility Patterns

### Button
\`\`\`html
<!-- Good -->
<button class="bg-blue-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-800">
  Save
</button>

<!-- Bad: Not keyboard accessible -->
<div class="cursor-pointer" onclick="save()">Save</div>
\`\`\`

### Modal
\`\`\`html
<!-- Role identifies it as modal, focus trap enforced -->
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Delete item?</h2>
  <p>This cannot be undone.</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>

<!-- JavaScript: trap focus within modal -->
<script>
const modal = document.querySelector('[role="dialog"]');
const focusables = modal.querySelectorAll('button, [href], input');
const firstButton = focusables[0];
const lastButton = focusables[focusables.length - 1];

modal.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  if (e.shiftKey && document.activeElement === firstButton) {
    e.preventDefault();
    lastButton.focus();
  } else if (!e.shiftKey && document.activeElement === lastButton) {
    e.preventDefault();
    firstButton.focus();
  }
});
</script>
\`\`\`

### Form
\`\`\`html
<!-- Labels explicitly associated with inputs -->
<label for="email">Email</label>
<input id="email" type="email" required />

<!-- Error messaging -->
<label for="password">Password</label>
<input id="password" type="password" aria-describedby="password-hint" />
<span id="password-hint">At least 8 characters, one uppercase, one number</span>
\`\`\`

### Navigation
\`\`\`html
<!-- Semantic nav, current page marked -->
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact" aria-current="page">Contact</a>
</nav>
\`\`\`

---

## Audit Tools

### Lighthouse (in Chrome DevTools)
1. Open DevTools (F12)
2. Click "Lighthouse" tab
3. Select "Accessibility"
4. Click "Analyze page load"
5. Target score: 90+

### axe-core (Browser Extension)
1. Install axe DevTools extension
2. Open DevTools
3. Click "axe DevTools"
4. Click "Scan ALL of my page"
5. Fix all "Critical" and "Serious" issues

### Manual Screen Reader Test
1. Enable screen reader (Windows: NVDA, Mac: VoiceOver)
2. Tab through entire page
3. Verify all content is announced
4. Verify form labels and error messages are clear
```

---

## How Skills Layer: The Skill Composition Pattern

Here's how your agent uses all 7 skills together:

**Scenario: Building a payment checkout feature**

1. **Agent reads BMAD Checklist** → "We're in Phase 2. I need to write a PRD and architecture."
2. **Agent invokes API Patterns skill** → "Stripe integration uses this webhook flow."
3. **Agent invokes Code Patterns skill** → "I'll write this in TypeScript with strict mode."
4. **Agent enters Phase 3 Gate** → "PRD ≥90%, architecture justified, risks mitigated. Go."
5. **Agent enters Phase 4 (Build)** → writes code, refers to Code Patterns and API Patterns.
6. **Agent enters Phase 5** → Testing Strategy (write tests for payment flow), Security Scanning (verify webhook signature, check OWASP injection).
7. **Agent enters Phase 6** → Deployment Checklist (pre-deploy security scan, post-deploy smoke test for payment success).
8. **Agent enters Phase 8** → Design System (verify payment form is keyboard-accessible, modal has proper focus trap).

Each skill is invoked at the right time. The agent never skips a gate. The product ships on time and with quality.

---

## Creating Your Own Skills

Skills follow this structure:

```
# [Skill Name]

## What This Skill Is For
One paragraph: problem this solves.

## What It Covers
Bullet list of topics.

## Key Patterns
The conceptual backbone. What's the one idea that ties this together?
Example: "Every function should do one thing. Here's what that looks like."

## Checklist / Command Reference
The actionable part. Commands to run, checkboxes to verify, patterns to follow.

## When It's Invoked
What phase or event triggers this skill.

## Customisation Points
Where you adapt this for your domain.
```

To create a new skill:
1. Pick a domain (e.g., "Database Migrations", "CI/CD Pipelines", "Monitoring")
2. List the checklist items and patterns
3. Add one command reference section
4. Save to \`~/.claude/skills/my-skill-name.md\`
5. Reference it in your agent config

Your agent will automatically invoke it when relevant.

---

## Conclusion: Quality at Scale

These 7 skills are the operating manual for a solo developer operating like a team. They enforce gates, standardise processes, and make quality non-negotiable.

When you adopt the BMAD framework + these skills, you stop shipping things that are half-built. You stop deploying without tests. You stop wondering if something is accessible or secure. The skills make the right thing the automatic thing.

Start with Skill 1 (BMAD Checklist). Once you're gating at Phase 3 and never shipping without passing Phase 5, add the others one by one. Within a month, you'll have a reliable development system that scales from one person to multiple people without breaking.

The Hive Doctrine marketplace has many products. This one teaches your agent to think like a professional engineer. Use it.

---

**Version:** 1.0 | **Updated:** 2026-03-09 | **Author:** Melisia Archimedes
