# Test Generation Skill

Use when generating tests for code changes. Analyses diff, identifies testable units, generates comprehensive test cases.

## When to Activate

- User asks to "write tests", "add test coverage", or "test this code"
- The `/generate-tests` command is invoked
- User asks "how should I test this?" or "what tests are missing?"

## Process

1. **Read the code under test.** Understand what it does before writing tests. Identify:
   - Public interface (exported functions, class methods, API endpoints)
   - Input parameters and their types
   - Return values and their types
   - Side effects (database writes, API calls, file operations, event emissions)
   - Error conditions and how they are handled
   - Dependencies that will need mocking

2. **Read existing tests.** Before writing new tests:
   - Check if tests already exist for this code
   - Match the existing test style and conventions
   - Identify gaps in existing coverage
   - Use the same test framework and assertion library

3. **Plan the test cases.** For each function/method, identify:

   | Category | What to Test |
   |----------|-------------|
   | Happy path | Normal input, expected output |
   | Boundary | Min/max values, empty collections, zero, one |
   | Invalid input | Wrong type, null, undefined, out of range |
   | Error handling | Network failures, missing data, permission denied |
   | State changes | Side effects verified (DB updated, event emitted) |
   | Concurrency | Race conditions, concurrent access (if applicable) |

4. **Generate tests following AAA pattern.**

   Each test must:
   - Have a descriptive name that explains the scenario and expected outcome
   - Set up exactly the state needed (no more, no less)
   - Perform exactly one action
   - Assert exactly one behaviour
   - Clean up after itself if it modifies shared state

5. **Generate test fixtures.** If the tests need test data:
   - Create factory functions or fixtures in the `fixtures/` directory
   - Use realistic but not real data
   - Make fixtures composable (base fixture + overrides)

6. **Verify the tests.** After generation:
   - Do the tests actually test the intended behaviour, or just the implementation?
   - Would the tests break if the implementation changed but the behaviour stayed the same? (If yes, they are too tightly coupled.)
   - Are there any tests that would pass even if the code under test was deleted? (If yes, they are testing the mock, not the code.)

## Anti-patterns

- Do not test private implementation details. Test the public interface.
- Do not write tests that verify the exact sequence of internal calls. Test outcomes, not process.
- Do not copy-paste the implementation logic into the test. If the test has the same bug as the code, it will still pass.
- Do not write tests that always pass regardless of the code's behaviour. Every test should be able to fail.
