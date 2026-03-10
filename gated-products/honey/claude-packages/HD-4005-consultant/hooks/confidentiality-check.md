# Confidentiality Check Hook

## Trigger

Before any file creation or modification in the project directory.

## Behaviour

Scan the content about to be written for potential confidentiality breaches:

### PII Patterns to Flag

- **Email addresses** — Any string matching `[word]@[word].[tld]`
- **Phone numbers** — Patterns matching common phone formats (with country codes, brackets, dashes)
- **Physical addresses** — Street numbers followed by street names, postcodes
- **National identifiers** — SSN patterns (XXX-XX-XXXX), TFN patterns, passport numbers
- **Financial data** — Credit card number patterns, bank account numbers, salary figures with names attached
- **IP addresses** — IPv4 patterns that appear to be server addresses (not example ranges)

### Client-Sensitive Data

- **Names in filenames** — Client names should not appear in file paths outside the project root
- **Revenue/financial figures** — Flag any specific financial figures and confirm they are approved for inclusion
- **Internal org details** — Employee counts, team structures, internal project codenames
- **Competitive intelligence** — References to specific competitors' internal data

### Actions

1. **Block** — If PII is detected, halt file creation and report the specific findings. Ask the user to anonymise before proceeding.
2. **Warn** — If potentially sensitive business data is detected, warn but allow the user to proceed with confirmation.
3. **Pass** — If no issues detected, proceed silently.

### Exclusions

- Files in the `internal/` directory are exempt from client-name checks (these are not shared with clients).
- Example/template data (clearly marked as "[PLACEHOLDER]" or "[TBD]") is exempt.
- The engagement brief itself may contain client names — this is expected.

## Output on Failure

```
CONFIDENTIALITY CHECK FAILED
File: [path]
Issues found:
  - Line X: Possible email address detected: [masked]
  - Line Y: Possible phone number detected: [masked]
Action: Remove or anonymise flagged data before proceeding.
```
