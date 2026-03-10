# Reproducibility Check Hook

## Trigger

Before committing any analysis code or scripts in the `analysis/` directory.

## Behaviour

Scan analysis files for reproducibility issues:

### Checks

1. **Random seeds.** Any code using random number generation, sampling, or stochastic algorithms must set a random seed. Look for:
   - `random`, `sample`, `shuffle`, `bootstrap`, `permutation`
   - `np.random`, `torch.manual_seed`, `set.seed`, `random_state`
   - If found without a corresponding seed setting, flag it.

2. **Absolute file paths.** Scan for hardcoded absolute paths:
   - `/Users/`, `/home/`, `C:\`, `D:\`
   - These break reproducibility on other machines. Require relative paths or environment variables.

3. **Package versions.** Check for a requirements file or environment specification:
   - `requirements.txt`, `environment.yml`, `Pipfile.lock`, `renv.lock`
   - If none exists and the analysis uses external packages, warn that versions are not pinned.

4. **Data provenance.** Check that analysis scripts reference data files that exist in the project:
   - Data files referenced in code should exist in `data/` directory.
   - If external data sources are used, they should be documented in `data/codebook.md`.

5. **Hardcoded results.** Flag any analysis file that contains hardcoded numeric results rather than computing them. Look for patterns like:
   - Comments containing "p = 0.03" or "d = 0.5" without associated computation
   - Variables assigned specific result values without a calculation

### Actions

1. **Block** — If random operations lack seeds or absolute paths are found, halt the commit. These must be fixed.
2. **Warn** — If package versions are not pinned or data provenance is unclear, warn but allow with confirmation.
3. **Pass** — If all checks pass, proceed silently.

## Output on Failure

```
REPRODUCIBILITY CHECK: [N] issues found

MISSING RANDOM SEEDS:
  - [file]:L[line] — random operation without seed: [code snippet]

ABSOLUTE PATHS:
  - [file]:L[line] — hardcoded path: [path]

MISSING VERSION PINS:
  - No requirements.txt or equivalent found. Pin package versions for reproducibility.

Action: Fix blocking issues before committing analysis code.
```
