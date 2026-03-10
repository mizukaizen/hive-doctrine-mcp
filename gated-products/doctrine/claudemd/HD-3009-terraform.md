# CLAUDE.md — Terraform Infrastructure Projects

> Author: Melisia Archimedes
> Version: 1.0
> Stack: Terraform 1.7+, AWS/GCP/Azure, S3/GCS remote state, GitHub Actions

## Project Overview

This configuration governs infrastructure-as-code projects using Terraform. The operating principle: infrastructure changes are code changes. They go through code review, automated testing, and controlled deployment — the same rigour as application code. No manual console changes. No untracked resources.

## Project Structure

```
├── environments/
│   ├── dev/
│   │   ├── main.tf                     # Dev environment root
│   │   ├── variables.tf                # Dev-specific variable values
│   │   ├── terraform.tfvars            # Dev variable values
│   │   └── backend.tf                  # Dev state backend config
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       ├── terraform.tfvars
│       └── backend.tf
├── modules/
│   ├── networking/
│   │   ├── main.tf                     # VPC, subnets, routing
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── compute/
│   │   ├── main.tf                     # EC2/GCE instances, ASGs
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/
│   │   ├── main.tf                     # RDS/Cloud SQL
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── storage/
│   │   ├── main.tf                     # S3/GCS buckets
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── monitoring/
│       ├── main.tf                     # CloudWatch/Stackdriver
│       ├── variables.tf
│       └── outputs.tf
├── policies/
│   ├── iam/                            # IAM policies
│   └── sentinel/                       # Policy-as-code (Terraform Cloud)
├── scripts/
│   ├── plan.sh                         # Safe plan wrapper
│   ├── apply.sh                        # Safe apply wrapper
│   └── import.sh                       # Resource import helper
├── tests/
│   ├── networking_test.go              # Terratest tests
│   └── database_test.go
├── .tflint.hcl                         # TFLint config
├── .terraform-version                  # tfenv version pinning
└── .github/
    └── workflows/
        ├── plan.yml                    # PR plan workflow
        └── apply.yml                   # Main branch apply workflow
```

## Naming Conventions

### Resource Names
- Pattern: `[project]-[environment]-[resource-type]-[description]`
- Example: `myapp-prod-rds-primary`, `myapp-dev-vpc-main`
- Use hyphens for resource names, underscores for Terraform identifiers
- Keep names under 63 characters (cloud provider limits)

### Terraform Identifiers
- **Resources:** `resource "aws_instance" "web_server"` — snake_case, descriptive
- **Variables:** snake_case, prefixed by concern (`vpc_cidr_block`, `db_instance_class`)
- **Outputs:** snake_case, suffixed by type hint (`vpc_id`, `db_endpoint`, `alb_dns_name`)
- **Modules:** snake_case, named by function (`networking`, `compute`, `database`)
- **Locals:** snake_case, grouped logically in a single `locals` block per file
- **Data sources:** `data "aws_ami" "ubuntu"` — snake_case, named by what they look up

### Tags (Mandatory on All Resources)

```hcl
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Team        = var.team_name
    CostCentre  = var.cost_centre
  }
}
```

Every resource that supports tags must include `local.common_tags` merged with any resource-specific tags. Untagged resources are rejected in code review.

## Module Design Rules

- Modules are self-contained, reusable units with clear inputs (variables) and outputs
- Every module has `variables.tf`, `main.tf`, `outputs.tf`, and optionally `versions.tf`
- Variables must have descriptions and type constraints. Sensitive variables marked with `sensitive = true`
- Outputs must have descriptions — they document the module's contract
- No hardcoded values in modules — everything parameterised via variables
- Modules should not reference remote state — pass dependencies as variables
- Pin module source versions: `source = "git::https://...?ref=v1.2.3"` or registry with version constraint

```hcl
# CORRECT — module with clear interface
module "database" {
  source = "./modules/database"

  environment    = var.environment
  instance_class = var.db_instance_class
  vpc_id         = module.networking.vpc_id
  subnet_ids     = module.networking.private_subnet_ids

  tags = local.common_tags
}

# WRONG — module reaching into remote state
module "database" {
  source = "./modules/database"
  # Module internally reads remote state — hidden dependency
}
```

## State Management

### Remote State
- State is stored remotely: S3 (AWS), GCS (GCP), or Azure Blob Storage
- State locking enabled via DynamoDB (AWS) or native GCS locking
- One state file per environment — never share state across environments
- State bucket has versioning enabled for rollback capability

### State Security
- State files contain sensitive data (passwords, keys) — encrypt at rest
- State bucket access restricted to the CI/CD pipeline and senior engineers
- Never commit state files to Git. `.gitignore` includes `*.tfstate`, `*.tfstate.backup`
- Review `terraform plan` output for sensitive data exposure before sharing in PRs

### State Operations
- `terraform import` for adopting existing resources — document imports in commit messages
- `terraform state mv` for refactoring — plan the move, test in dev first
- Never use `terraform state rm` without understanding the consequences — the resource continues to exist but is no longer managed
- `terraform taint` is deprecated — use `terraform apply -replace=RESOURCE` instead

## Plan and Apply Workflow

### Pull Request (Plan)
1. Developer creates feature branch from `main`
2. PR triggers `terraform plan` for all affected environments
3. Plan output posted as a PR comment for review
4. Reviewer examines: resources created, modified, destroyed. Any destroy requires explicit approval.
5. Cost estimation (Infracost) runs and posts estimated cost change

### Merge (Apply)
1. Approved PR merged to `main`
2. CI runs `terraform apply` with the saved plan file
3. Apply output logged and stored as CI artefact
4. Post-apply validation: health checks on created/modified resources
5. Notification sent to team channel with change summary

### Safety Rules
- **Never apply without a reviewed plan.** The plan file from CI must match what was reviewed.
- **Destroy protection:** Resources with `lifecycle { prevent_destroy = true }` cannot be accidentally destroyed. Use for databases, S3 buckets with data, and any stateful resource.
- **Blast radius:** Limit each apply to one environment. Never plan/apply multiple environments in a single operation.
- **Drift detection:** Run `terraform plan` on a schedule (daily) to detect manual console changes. Alert on drift.

## Testing Requirements

| Type | Tool | What to Test |
|------|------|-------------|
| Validation | `terraform validate` | HCL syntax, provider schema |
| Lint | TFLint | Best practices, naming, deprecated features |
| Format | `terraform fmt -check` | Consistent formatting |
| Security | tfsec / Checkov | Security misconfigurations |
| Unit | Terratest (Go) | Module behaviour with real resources in a test account |
| Cost | Infracost | Cost estimation and budget alerts |

### Terratest Guidelines
- Tests create real resources in a dedicated test account — clean up after every test run
- Use random suffixes on resource names to avoid conflicts between parallel test runs
- Set short timeouts — test resources should spin up and tear down within minutes
- Run Terratest in CI on module changes only (not on every PR)

## Security Rules

1. **Least privilege IAM:** Every IAM role and policy follows least privilege. No `*` in resource ARNs unless absolutely necessary. No `AdministratorAccess` attached to service roles.
2. **Secrets management:** Use AWS Secrets Manager, GCP Secret Manager, or HashiCorp Vault for secrets. Never store secrets in `terraform.tfvars` or variable defaults.
3. **Encryption at rest:** Enable encryption on all storage (S3, RDS, EBS). Use customer-managed keys (CMK) for production.
4. **Network security:** Default-deny security groups. Explicitly allow only required ingress/egress. No `0.0.0.0/0` ingress on non-public resources.
5. **State file encryption:** State backend encrypted with AES-256 or KMS.
6. **Provider credentials:** Use IAM roles (not access keys) in CI. Use `assume_role` for cross-account access.
7. **Sensitive outputs:** Mark outputs containing secrets with `sensitive = true`. Do not print sensitive values in CI logs.
8. **Public access:** S3 buckets have `block_public_access` enabled by default. RDS instances are not publicly accessible by default. Exceptions require documented justification.

## Common Pitfalls

- **State file conflicts.** Two people running `terraform apply` simultaneously causes state corruption. Use state locking (DynamoDB for S3 backend) and apply only from CI.
- **Destroying shared resources.** Removing a module or resource from code destroys it on next apply. If other services depend on it, the outage is immediate. Review plan output for destroys carefully.
- **Provider version drift.** Pin provider versions: `required_providers { aws = { version = "~> 5.0" } }`. Unpinned providers auto-upgrade and may introduce breaking changes.
- **Hardcoded AMI IDs.** AMI IDs are region-specific and change over time. Use `data "aws_ami"` lookups with filters instead.
- **Ignoring plan output.** "No changes" is the safe output. "1 to destroy" is a red flag. Read every line of the plan before approving.
- **Monolithic state.** One state file for all infrastructure is fragile and slow. Split by environment and optionally by service domain (networking, compute, database).

## Code Review Checklist

- [ ] All resources tagged with `common_tags`
- [ ] Variables have descriptions and type constraints
- [ ] Sensitive variables marked as `sensitive = true`
- [ ] No hardcoded values — everything parameterised
- [ ] Provider versions pinned
- [ ] Stateful resources have `prevent_destroy` lifecycle
- [ ] Security groups follow least privilege (no `0.0.0.0/0` without justification)
- [ ] IAM policies follow least privilege (no `*` resources without justification)
- [ ] Plan output reviewed — no unexpected destroys or changes
- [ ] Encryption enabled on storage and databases
- [ ] Module outputs documented with descriptions
- [ ] `terraform fmt` and `terraform validate` pass
- [ ] tfsec/Checkov scans pass with no critical findings

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
