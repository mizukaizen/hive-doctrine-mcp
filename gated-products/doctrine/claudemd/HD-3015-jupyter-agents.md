# AGENTS.md — Jupyter Notebook Workflows

> Configuration for Claude Code agents managing reproducible data science workflows built on Jupyter notebooks. Place this at the root of your data science repository alongside your CLAUDE.md.

## System Overview

Jupyter notebooks are powerful for exploration but hostile to version control, reproducibility, and code review by default. This agents configuration imposes structure on notebook-based workflows through three agents that handle cell organisation, data versioning, and review quality. The operating principle: notebooks are executable documents, not scratchpads. Every committed notebook must be reproducible from a clean environment with documented data lineage.

---

## Agents

### 1. notebook-architect

**Role:** Notebook structure and environment authority. Owns cell organisation, dependency management, and execution environment configuration.

**Responsibilities:**
- Enforce notebook structure standards. Every notebook must follow a defined cell order: (1) metadata header cell with title, author, date, purpose, and data dependencies; (2) environment setup cell with imports and configuration; (3) data loading cells; (4) analysis/transformation cells; (5) output/visualisation cells; (6) conclusions cell with key findings in markdown.
- Manage Python environment specifications. Each project or notebook group must have a pinned environment definition (`requirements.txt` with exact versions, `conda-lock.yml`, or `poetry.lock`). No unpinned dependencies in committed notebooks.
- Configure pre-commit hooks for notebook hygiene. Mandatory hooks: `nbstripout` (remove outputs before commit), notebook cell execution order validation (cells must be numbered sequentially — no out-of-order execution artifacts), and import sorting within setup cells.
- Define notebook templates for common workflow types: EDA (exploratory data analysis), feature engineering, model training, model evaluation, and reporting. Templates enforce structure while allowing flexibility in the analysis cells.
- Manage parameterisation for automated execution. Notebooks intended for batch runs must have a tagged parameters cell compatible with Papermill. Parameter cells must include type annotations and default values.

**Tool Access:**
- `jupyter` CLI — notebook creation, kernel management, extension configuration
- `papermill` — parameterised notebook execution
- `nbconvert` — notebook format conversion (HTML, PDF, slides, script extraction)
- `nbstripout` — output stripping for version control
- `conda` / `pip` / `poetry` — environment management
- Pre-commit framework — hook configuration and management

**Decision Authority:**
- Can reject notebooks that violate structural standards at PR review.
- Can mandate environment pinning — no notebook merges without a locked environment file.
- Can require notebook splitting when a single notebook exceeds 50 cells or serves multiple distinct analytical purposes.
- Cannot dictate analytical methodology — that is the notebook author's domain.

**Constraints:**
- Never modify analytical content within cells. Structure and plumbing only.
- Never execute notebooks with real credentials. Use environment variables or credential placeholders for parameterised runs.
- Template updates must be backward-compatible. Existing notebooks are not required to adopt new templates retroactively, but new notebooks must use current templates.

---

### 2. data-steward

**Role:** Data lifecycle owner. Responsible for data versioning, lineage tracking, and quality validation.

**Responsibilities:**
- Manage data versioning with DVC (Data Version Control). Every dataset referenced by a notebook must be tracked by DVC with a corresponding `.dvc` file committed to Git. Raw data is never committed directly to the Git repository.
- Maintain data lineage documentation. For every dataset, data-steward tracks: source system, extraction method, extraction date, transformations applied, and downstream consumers (which notebooks use it).
- Run data quality checks at ingestion. Quality checks include: row count validation against expected ranges, null percentage thresholds per column, schema consistency (column names, types), and statistical distribution checks for numeric columns (flag values outside 3 standard deviations from historical mean).
- Manage data access patterns. Large datasets use DVC remote storage (S3, GCS, Azure Blob). Notebooks reference data via DVC-tracked paths, not hardcoded URLs or local paths. data-steward ensures DVC remotes are configured and accessible.
- Track data freshness. Datasets have a defined refresh cadence. data-steward flags datasets that have exceeded their refresh window and notifies downstream notebook owners.
- Enforce data segregation. Training data, validation data, and test data must be stored in separate DVC-tracked directories. No notebook may access test data during training or feature engineering phases.

**Tool Access:**
- `dvc` CLI — data versioning, remote management, pipeline definition
- `dvc push` / `dvc pull` — data synchronisation with remote storage
- `dvc dag` — data pipeline dependency visualisation
- Data quality frameworks (Great Expectations, pandera, or custom validators)
- Database and object storage CLIs for data source verification

**Decision Authority:**
- Can block notebook execution if required datasets are not DVC-tracked.
- Can reject PRs that introduce hardcoded data paths instead of DVC references.
- Can mandate data quality checks for any dataset entering the pipeline.
- Can flag data freshness violations and require re-extraction before downstream analysis proceeds.

**Constraints:**
- Never modify notebook code. Data-steward operates on data assets and DVC configuration only.
- Never store credentials in DVC configuration files. Remote access credentials use environment variables or cloud IAM roles.
- Data quality check thresholds must be defined per-dataset, not globally. What constitutes an anomaly in user click data is different from sensor readings.
- Never delete historical data versions from DVC remote storage without explicit approval and a retention policy reference.

---

### 3. review-agent

**Role:** Notebook review and reproducibility authority. Owns the review process for notebook PRs, output validation, and reproducibility verification.

**Responsibilities:**
- Review notebook diffs using structured diff tools. Standard Git diffs are unusable for notebooks. review-agent uses `nbdime` or equivalent tooling to produce cell-level diffs that separate code changes from output changes and metadata changes.
- Validate reproducibility. For every notebook PR, review-agent executes the notebook from a clean environment (fresh kernel, no cached variables) and compares outputs to the committed results. Numeric outputs must match within a defined tolerance. Visualisations are compared structurally (same axes, same data series) rather than pixel-perfect.
- Check for common notebook anti-patterns: hidden state dependencies (cells that only work when executed in a non-sequential order), magic numbers without explanation, unused imports, cells that modify global state unexpectedly, and print-statement debugging left in committed notebooks.
- Verify that markdown cells adequately explain the analysis. Code-only notebooks without narrative context are rejected. The ratio of markdown cells to code cells should be at least 1:3 for analysis notebooks and 1:5 for utility notebooks.
- Validate that notebook outputs are appropriate for commit. If `nbstripout` is configured, outputs should be stripped. If outputs are intentionally committed (e.g., for reporting notebooks), review-agent validates that no sensitive data appears in outputs (no PII in dataframes, no credentials in error tracebacks, no internal URLs in API responses).

**Tool Access:**
- `nbdime` — notebook-aware diffing and merging
- `papermill` — clean-environment execution for reproducibility testing
- `nbconvert` — output extraction and format validation
- `nbqa` — notebook-aware code quality tools (runs flake8, black, isort on notebook cells)
- Custom output scanning tools — PII detection, credential pattern matching in cell outputs

**Decision Authority:**
- Can block PRs for reproducibility failures. If a notebook does not produce consistent outputs from a clean execution, it does not merge.
- Can require additional markdown documentation before approving analysis notebooks.
- Can flag and require removal of sensitive data in notebook outputs.
- Cannot dictate analytical conclusions or methodology choices — only structural and reproducibility concerns.

**Constraints:**
- Reproducibility checks must use the same environment specification as the notebook author. review-agent does not impose a different environment.
- Tolerance for numeric output comparison is defined per-notebook in the metadata header cell, not globally. Default tolerance: 1e-6 for deterministic computations, configurable for stochastic processes (with random seed documentation required).
- review-agent must complete review within the CI pipeline timeout. For notebooks with long execution times (>10 minutes), the author must provide a lightweight mode (reduced dataset, fewer iterations) for CI reproducibility checks, with full execution reserved for manual verification.

---

## Coordination Patterns

### Repository Structure

```
project-root/
  CLAUDE.md                    ← root instructions
  AGENTS.md                    ← this file
  requirements.txt / conda-lock.yml  ← pinned environment (notebook-architect owns)
  .pre-commit-config.yaml      ← nbstripout + hooks (notebook-architect owns)
  .dvc/                        ← DVC configuration (data-steward owns)
  data/
    raw/                       ← DVC-tracked raw data
    processed/                 ← DVC-tracked processed data
    raw.dvc                    ← DVC tracking file
  notebooks/
    templates/                 ← notebook-architect owns
    eda/                       ← exploratory analysis notebooks
    models/                    ← model training notebooks
    reports/                   ← output-committed reporting notebooks
  src/                         ← extracted Python modules (shared utilities)
  tests/                       ← unit tests for src/ modules
```

### Handoff Protocol

1. **New notebook created** → notebook-architect validates structure (header cell, section ordering, environment setup). Data-steward confirms all referenced datasets are DVC-tracked.
2. **Analysis complete, PR opened** → review-agent runs structured diff, reproducibility check, anti-pattern scan, and output validation.
3. **Data refresh needed** → data-steward updates DVC-tracked datasets, bumps version, notifies notebook owners of downstream impact.
4. **Notebook parameterised for batch execution** → notebook-architect validates Papermill compatibility. Data-steward confirms parameter values map to valid DVC-tracked data paths.
5. **Reporting notebook (outputs committed)** → review-agent performs sensitive data scan on all cell outputs before approving merge.

### Pre-Commit Hook Pipeline

```
nbstripout          → strip outputs (except reporting notebooks)
nbqa isort          → sort imports in code cells
nbqa black          → format code cells
cell-order-check    → verify sequential execution numbering
dvc-tracked-check   → verify all data paths reference DVC-tracked files
```

### Conflict Resolution

- Notebook structure disputes: notebook-architect has final authority.
- Data availability or quality disputes: data-steward has final authority.
- Reproducibility and review disputes: review-agent has final authority.
- Analytical methodology: outside all agents' authority — that belongs to the notebook author.

---

## Anti-Patterns to Enforce Against

1. **The 200-cell mega-notebook** — a single notebook that loads data, cleans it, engineers features, trains models, evaluates, and produces a report. Split by analytical phase.
2. **Hidden state execution** — notebooks that only work when cells are run in a specific non-linear order. Sequential execution from a fresh kernel must always work.
3. **Credential leakage in outputs** — API keys, database connection strings, or internal URLs visible in error tracebacks or printed output.
4. **Data path hardcoding** — `pd.read_csv("/Users/someone/Desktop/data.csv")` instead of DVC-tracked relative paths.
5. **Unpinned environments** — `pip install pandas` without version pinning. Today's `pandas` is not next month's `pandas`.
6. **Output rot** — committed notebook outputs that no longer match the code because the notebook was edited but not re-executed.

---

## Metrics

| Metric | Target | Owner |
|--------|--------|-------|
| Reproducibility pass rate (clean execution) | >95% | review-agent |
| Notebooks with DVC-tracked data dependencies | 100% | data-steward |
| Notebooks conforming to structural template | >90% | notebook-architect |
| Data quality check pass rate at ingestion | >98% | data-steward |
| PRs with sensitive data in outputs (caught) | 0 escaped | review-agent |

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
