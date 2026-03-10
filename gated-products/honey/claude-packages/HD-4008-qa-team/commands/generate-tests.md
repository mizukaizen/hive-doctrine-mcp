# /generate-tests

Generate tests for changed files — unit tests for functions, integration tests for APIs, E2E for user flows.

## Usage

```
/generate-tests [--scope "changed|file|directory"] [--target "<path>"] [--types "unit,integration,e2e"] [--framework "jest|pytest|vitest|mocha"]
```

## Behaviour

### 1. Identify What Changed

- **changed (default):** Run `git diff --name-only` to find modified files. Focus testing on these.
- **file:** Generate tests for the specific file at `--target`.
- **directory:** Generate tests for all source files in the `--target` directory.

### 2. Analyse the Code

For each file:
- Identify exported functions, classes, and methods
- Determine input types and return types
- Identify side effects (database calls, API calls, file operations)
- Identify error handling paths
- Map dependencies that need mocking

### 3. Generate Tests

**Unit tests** for each function:
- Happy path with typical input
- Edge cases (empty input, null, boundary values)
- Error cases (invalid input, missing dependencies)
- Each test follows AAA pattern
- Mock external dependencies

**Integration tests** for API endpoints and service interactions:
- Request/response contract tests
- Authentication and authorisation tests
- Error response format tests
- Rate limiting and validation tests

**E2E tests** (only when `--types` includes "e2e"):
- User workflow tests for the affected feature
- Smoke tests for critical paths that might be affected

### 4. Place Tests

Follow the project's existing test structure. If none exists:
- Unit tests: `tests/unit/[matching-source-path].test.[ext]`
- Integration tests: `tests/integration/[feature].test.[ext]`
- E2E tests: `tests/e2e/[workflow].test.[ext]`

### 5. Output

Display a summary:
```
Tests generated:
  Unit:        12 tests across 3 files
  Integration:  4 tests across 1 file
  E2E:          0 tests (not requested)

Files created:
  tests/unit/auth/login.test.ts
  tests/unit/auth/validate-token.test.ts
  tests/unit/utils/format-date.test.ts
  tests/integration/auth-api.test.ts
```

### Notes

- Match the project's existing test style and conventions. Read existing tests before generating new ones.
- Do not generate trivial tests (e.g., testing that a getter returns a value). Focus on behaviour.
- If the code under test has no clear interfaces (everything is tightly coupled), flag it as a testability concern rather than writing brittle tests.
