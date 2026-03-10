# Secrets Scan Hook

## Trigger

Before any commit (scan staged files).

## Behaviour

Scan all staged files for secrets, API keys, tokens, and private keys.

### Patterns to Detect

| Category | Pattern | Examples |
|----------|---------|---------|
| AWS Keys | `AKIA[0-9A-Z]{16}` | AWS access key IDs |
| AWS Secret | 40-character base64 near "aws" or "secret" | AWS secret access keys |
| GitHub Tokens | `ghp_[a-zA-Z0-9]{36}`, `gho_`, `ghs_`, `ghr_` | Personal access tokens |
| Slack Tokens | `xoxb-`, `xoxp-`, `xoxs-` | Bot, user, and session tokens |
| Stripe Keys | `sk_live_`, `rk_live_` | Stripe secret and restricted keys |
| OpenAI Keys | `sk-[a-zA-Z0-9]{48}` | OpenAI API keys |
| Anthropic Keys | `sk-ant-` | Anthropic API keys |
| Generic API Keys | `api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9]` | Common API key assignments |
| Private Keys | `-----BEGIN (RSA|EC|OPENSSH|DSA|PGP) PRIVATE KEY-----` | PEM-encoded private keys |
| Passwords | `password\s*[:=]\s*['"][^'"]+['"]` | Hardcoded passwords |
| Connection Strings | `(mysql|postgres|mongodb)://[^:]+:[^@]+@` | Database connection strings with credentials |
| JWT Tokens | `eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+` | JSON Web Tokens |

### Exclusions

- Files in `.gitignore` (already excluded from commits)
- Test files containing obviously fake keys (e.g., `sk-test-1234567890`)
- Documentation files showing key format examples (with placeholder text)
- Entries listed in `security/false-positives.md`

### Actions

1. **Block** — If any secret pattern is detected, halt the commit. Display:
   ```
   SECRETS DETECTED — COMMIT BLOCKED

   File: [path]
     Line [N]: [pattern type] detected — [masked preview]

   Action required:
   1. Remove the secret from the file
   2. Store it in environment variables or a secrets manager
   3. If this is a false positive, add it to security/false-positives.md
   4. If the secret was ever committed, rotate it immediately
   ```

2. **Pass** — If no secrets detected, proceed silently.

### Important

A secret that has been committed — even if subsequently removed — should be considered compromised. Git history preserves it. Always rotate leaked credentials rather than just deleting them from the file.
