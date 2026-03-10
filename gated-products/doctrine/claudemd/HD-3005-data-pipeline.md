# CLAUDE.md — Data Pipeline Projects

> Author: Melisia Archimedes
> Version: 1.0
> Stack: dbt, Airflow, PostgreSQL/BigQuery/Snowflake, Great Expectations, Python

## Project Overview

This configuration governs analytics data pipeline projects built with dbt for transformation and Airflow for orchestration. The goal is trustworthy, testable, documented data that analysts and downstream systems can rely on. If the pipeline breaks silently, the data warehouse is a liability, not an asset.

## Project Structure

```
├── dbt/
│   ├── models/
│   │   ├── staging/                    # 1:1 source table mirrors
│   │   │   ├── stg_stripe__charges.sql
│   │   │   ├── stg_stripe__customers.sql
│   │   │   └── _stg_stripe__models.yml  # Tests + docs for staging
│   │   ├── intermediate/               # Business logic joins
│   │   │   ├── int_orders__pivoted.sql
│   │   │   └── _int_orders__models.yml
│   │   ├── marts/                      # Business-facing tables
│   │   │   ├── finance/
│   │   │   │   ├── fct_revenue.sql
│   │   │   │   ├── dim_customers.sql
│   │   │   │   └── _finance__models.yml
│   │   │   └── marketing/
│   │   │       ├── fct_campaigns.sql
│   │   │       └── _marketing__models.yml
│   │   └── utilities/                  # Date spine, helpers
│   ├── macros/                         # Reusable SQL macros
│   ├── seeds/                          # CSV reference data
│   ├── snapshots/                      # SCD Type 2 history
│   ├── tests/                          # Custom singular tests
│   ├── analyses/                       # Ad hoc analytical queries
│   ├── dbt_project.yml
│   └── profiles.yml                    # Connection profiles (gitignored)
├── airflow/
│   ├── dags/
│   │   ├── daily_pipeline.py           # Main daily DAG
│   │   ├── hourly_sync.py             # High-frequency syncs
│   │   └── maintenance.py             # Cleanup, snapshots
│   ├── plugins/
│   │   ├── operators/                  # Custom Airflow operators
│   │   └── hooks/                      # Custom connection hooks
│   ├── tests/
│   └── docker-compose.yml              # Airflow local dev
├── great_expectations/                  # Data quality framework
│   ├── expectations/
│   ├── checkpoints/
│   └── great_expectations.yml
├── scripts/
│   ├── seed_dev.sh                     # Seed dev environment
│   └── run_full_refresh.sh             # Full refresh with safety checks
└── .env.example
```

## Naming Conventions

### dbt Models
- **Staging:** `stg_[source]__[table].sql` — one model per source table, prefixed with source system name
- **Intermediate:** `int_[entity]__[verb].sql` — business logic transformations (`int_orders__pivoted.sql`)
- **Facts:** `fct_[event/action].sql` — immutable event records (`fct_revenue.sql`, `fct_page_views.sql`)
- **Dimensions:** `dim_[entity].sql` — descriptive attributes (`dim_customers.sql`, `dim_products.sql`)
- **YAML files:** `_[directory]__models.yml` — underscore prefix keeps them sorted first

### Columns
- **Primary keys:** `[entity]_id` (`customer_id`, `order_id`)
- **Foreign keys:** `[referenced_entity]_id`
- **Timestamps:** `[event]_at` for specific moments (`created_at`, `shipped_at`), `[period]_date` for dates (`order_date`)
- **Booleans:** `is_[condition]` or `has_[thing]` (`is_active`, `has_subscription`)
- **Amounts:** `[description]_amount` with currency suffix if multi-currency (`total_amount_usd`)
- **Counts:** `[entity]_count` (`order_count`, `item_count`)

### Airflow DAGs
- **DAG IDs:** `[frequency]_[domain]_[description]` (`daily_finance_revenue_pipeline`)
- **Task IDs:** `[verb]_[noun]` (`extract_stripe_charges`, `transform_orders`, `test_revenue_model`)

## Data Modelling Rules

### Staging Layer
- One staging model per source table — no joins, no business logic
- Rename columns to consistent naming conventions
- Cast data types explicitly (do not rely on implicit casting)
- Filter out soft-deleted records
- Materialised as views (cheap, always fresh)

### Intermediate Layer
- Join staging models together, apply business logic
- Break complex transformations into multiple intermediate models
- Not exposed to analysts directly — these are internal building blocks
- Materialised as ephemeral (CTE) or views

### Marts Layer
- Business-facing tables that analysts query directly
- Star schema: fact tables (events, transactions) + dimension tables (entities, attributes)
- Materialised as tables (or incremental for large datasets)
- Every mart model has documentation and tests in its YAML file
- Column descriptions are mandatory for every column in a mart

### Incremental Models
- Use incremental materialisation for tables with more than 10 million rows
- Define a reliable `updated_at` or event timestamp for the incremental filter
- Always include a `--full-refresh` safety mechanism
- Test incremental logic by comparing against full refresh results periodically

```sql
-- Incremental model pattern
{{ config(materialized='incremental', unique_key='event_id') }}

SELECT
    event_id,
    user_id,
    event_type,
    occurred_at

FROM {{ ref('stg_events__raw') }}

{% if is_incremental() %}
WHERE occurred_at > (SELECT MAX(occurred_at) FROM {{ this }})
{% endif %}
```

## Testing Requirements

### dbt Tests
- **Every primary key:** `unique` and `not_null` tests (no exceptions)
- **Every foreign key:** `relationships` test to the referenced model
- **Every enum column:** `accepted_values` test
- **Every amount/count:** custom test for non-negative values where business logic demands it
- **Row count:** custom test that row counts do not drop more than 20% between runs (catch broken sources)

### Data Quality (Great Expectations)
- Run after dbt completes, before downstream consumers are notified
- Validate source data freshness (alert if source tables have not updated)
- Validate row counts against expected ranges
- Validate statistical distributions for numeric columns (catch upstream schema changes)
- Store validation results for audit trail

### Pipeline Tests
- Unit tests for custom Airflow operators
- DAG integrity tests: verify all DAGs parse without errors, no import cycles
- Test task dependencies are correct (no orphan tasks, no cycles)

| Type | Tool | What to Test |
|------|------|-------------|
| Schema | dbt test | Primary keys, foreign keys, not null, accepted values |
| Data quality | Great Expectations | Freshness, row counts, distributions, custom expectations |
| Business logic | dbt singular tests | Revenue totals match source, customer counts are reasonable |
| Pipeline | pytest | DAG parsing, operator logic, task dependencies |
| Contract | dbt contracts | Column names, types, and constraints match expectations |

## Environment Management

| Environment | Database | dbt Target | Purpose |
|-------------|----------|-----------|---------|
| Local | Dev schema (`dev_[username]`) | `dev` | Individual development |
| CI | Ephemeral schema (`ci_pr_123`) | `ci` | PR validation |
| Staging | Staging schema | `staging` | Pre-production validation with production-like data |
| Production | Production schema | `prod` | Serves analysts and downstream systems |

- Each developer works in their own schema — never develop against production
- CI creates a temporary schema per PR, runs dbt build + test, then drops the schema
- Production runs are triggered by Airflow on merge to `main`
- Schema names are set in `profiles.yml` (gitignored) and CI environment variables

## Deployment Workflow

1. **Branch:** Feature branches from `main`, named `feat/`, `fix/`, `refactor/`
2. **Develop:** Run `dbt build --select state:modified+` against your dev schema
3. **CI:** PR triggers dbt build in a temporary CI schema — all tests must pass
4. **Review:** PR requires review from a data team member — check SQL logic, test coverage, documentation
5. **Merge:** Merge to `main` triggers Airflow DAG for production dbt run
6. **Monitor:** Airflow alerts on failure, Great Expectations alerts on data quality issues

### CI Pipeline
```yaml
# Runs on every PR
- dbt deps                    # Install packages
- dbt seed --target ci        # Load reference data
- dbt build --target ci       # Run models + tests
- dbt docs generate           # Verify docs compile
# Drop CI schema after run
```

## Security Rules

1. **PII handling:** Identify PII columns (email, name, phone, IP address) in source documentation. Hash or mask PII in staging models unless the downstream use case explicitly requires raw values. Use dbt macros for consistent hashing.
2. **Access controls:** Production schemas have role-based access. Analysts get read access to marts only. Staging and intermediate schemas are restricted to the data engineering team.
3. **Credentials:** Database credentials in environment variables or secrets manager. Never in `profiles.yml` committed to Git. The `profiles.yml` file is always gitignored.
4. **Source freshness:** Monitor source table freshness. Alert if a source has not been updated within its expected SLA (e.g., Stripe data should refresh every hour).
5. **Data retention:** Define retention policies per table. Archive or delete data older than the retention period. Document retention in model YAML.
6. **Audit trail:** Log every dbt run with its results (pass/fail, row counts, duration). Store in a metadata table for compliance.

## Common Pitfalls

- **No tests on staging models.** Staging models are the foundation. If a primary key is not unique at the staging layer, every downstream model is wrong. Test staging models rigorously.
- **Hardcoded date filters.** Never use hardcoded dates like `WHERE date > '2024-01-01'`. Use dbt variables or incremental logic. Hardcoded dates rot silently.
- **Missing source freshness checks.** If the source system stops sending data, your pipeline runs successfully with stale data. No errors, just wrong numbers. Source freshness checks catch this.
- **Over-materialising.** Not every model needs to be a table. Staging models as views, intermediate as ephemeral. Only materialise as tables when query performance demands it.
- **Circular dependencies.** dbt does not allow circular refs, but complex intermediate layers can create logical cycles that are hard to debug. Keep the DAG flowing in one direction: staging to intermediate to marts.
- **Undocumented models.** A model without documentation is a model that will be misunderstood. Every mart column must have a description. Use `dbt docs serve` to review documentation coverage.

## Code Review Checklist

- [ ] Model follows naming conventions (stg_, int_, fct_, dim_)
- [ ] Primary key has `unique` and `not_null` tests
- [ ] Foreign keys have `relationships` tests
- [ ] All columns in mart models have descriptions in YAML
- [ ] Incremental models have correct `unique_key` and timestamp filter
- [ ] No hardcoded dates or environment-specific values
- [ ] PII columns are hashed or documented as intentionally raw
- [ ] SQL is readable: CTEs named descriptively, no deeply nested subqueries
- [ ] Model materialisation is appropriate (view/ephemeral/table/incremental)
- [ ] Source freshness is configured for new sources
- [ ] dbt build passes in CI with all tests green
- [ ] DAG dependencies are correct (no orphan models, clear lineage)

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
