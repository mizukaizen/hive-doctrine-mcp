# CLAUDE.md — Kubernetes Deployment Projects

> Author: Melisia Archimedes
> Version: 1.0
> Stack: Kubernetes 1.29+, Helm 3, ArgoCD, Prometheus, Grafana, Istio/Linkerd

## Project Overview

This configuration governs Kubernetes deployment projects — from Helm chart development through GitOps delivery to production observability. Kubernetes gives you powerful primitives. It also gives you powerful ways to take down production. This file encodes the patterns that keep clusters healthy and deployments safe.

## Project Structure

```
├── charts/
│   ├── app/                              # Main application Helm chart
│   │   ├── Chart.yaml                    # Chart metadata
│   │   ├── values.yaml                   # Default values
│   │   ├── values-dev.yaml               # Dev overrides
│   │   ├── values-staging.yaml           # Staging overrides
│   │   ├── values-production.yaml        # Production overrides
│   │   ├── templates/
│   │   │   ├── _helpers.tpl              # Template helpers
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   ├── ingress.yaml
│   │   │   ├── hpa.yaml                  # Horizontal Pod Autoscaler
│   │   │   ├── pdb.yaml                  # Pod Disruption Budget
│   │   │   ├── configmap.yaml
│   │   │   ├── secret.yaml               # ExternalSecret reference
│   │   │   ├── serviceaccount.yaml
│   │   │   ├── networkpolicy.yaml
│   │   │   └── tests/
│   │   │       └── test-connection.yaml  # Helm test
│   │   └── crds/                         # Custom Resource Definitions
│   └── shared/                           # Shared sub-charts (logging, monitoring)
├── argocd/
│   ├── applications/
│   │   ├── app-dev.yaml                  # ArgoCD Application for dev
│   │   ├── app-staging.yaml
│   │   └── app-production.yaml
│   ├── projects/
│   │   └── team-project.yaml             # ArgoCD Project (RBAC)
│   └── appsets/
│       └── multi-env.yaml                # ApplicationSet for multi-env
├── manifests/
│   ├── namespaces/                       # Namespace definitions
│   ├── rbac/                             # Roles, RoleBindings, ClusterRoles
│   ├── network-policies/                 # Cluster-wide network policies
│   └── resource-quotas/                  # Namespace resource limits
├── observability/
│   ├── prometheus/
│   │   ├── rules/                        # Alerting rules
│   │   └── serviceMonitors/              # ServiceMonitor CRDs
│   ├── grafana/
│   │   └── dashboards/                   # Dashboard JSON files
│   └── alertmanager/
│       └── config.yaml                   # Alert routing
├── scripts/
│   ├── port-forward.sh                   # Local debugging helper
│   ├── rollback.sh                       # Rollback wrapper
│   └── sealed-secret.sh                  # Secret encryption helper
├── tests/
│   ├── helm/                             # Helm unittest plugin tests
│   └── kind/                             # kind cluster test configs
└── .github/
    └── workflows/
        ├── helm-lint.yml                 # PR chart validation
        └── image-build.yml               # Container image build
```

## Naming Conventions

### Kubernetes Resources
- **Namespaces:** `[team]-[environment]` (`payments-production`, `auth-staging`)
- **Deployments:** `[app-name]` (`api-gateway`, `order-service`)
- **Services:** same as Deployment name
- **ConfigMaps:** `[app-name]-config`
- **Secrets:** `[app-name]-secrets`
- **ServiceAccounts:** `[app-name]-sa`
- **Ingress:** `[app-name]-ingress`

### Labels (Mandatory on All Resources)

```yaml
labels:
  app.kubernetes.io/name: order-service
  app.kubernetes.io/instance: order-service-production
  app.kubernetes.io/version: "1.2.3"
  app.kubernetes.io/component: backend
  app.kubernetes.io/part-of: ecommerce-platform
  app.kubernetes.io/managed-by: helm
```

Every resource must carry the standard Kubernetes labels. These enable consistent querying, monitoring, and service mesh routing.

### Helm Values
- Use camelCase for value keys
- Group by concern: `replicaCount`, `image.repository`, `image.tag`, `resources.limits.cpu`
- Boolean values: `enabled` suffix (`autoscaling.enabled`, `serviceMonitor.enabled`)

## Resource Configuration

### Resource Limits and Requests (Mandatory)

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

- Every container must have resource requests and limits defined. No exceptions.
- Requests: what the scheduler guarantees. Set based on average usage.
- Limits: the ceiling. Set based on peak usage + 20% headroom.
- CPU limits: set to 2-5x requests (CPU is compressible — throttling is preferable to OOM)
- Memory limits: set to 1.5-2x requests (memory is not compressible — OOM kill is abrupt)
- Start conservative, tune based on metrics after running in production

### Horizontal Pod Autoscaler (HPA)

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

- Minimum 2 replicas in production (availability during node failure)
- Scale on CPU utilisation as primary metric, memory as secondary
- Custom metrics (requests per second, queue depth) via Prometheus adapter for more accurate scaling
- Scale-down stabilisation: 5 minutes (prevent flapping)

### Pod Disruption Budget (PDB)

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: order-service-pdb
spec:
  minAvailable: 1    # Or maxUnavailable: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: order-service
```

- Every production Deployment with 2+ replicas must have a PDB
- Ensures at least one pod remains available during voluntary disruptions (node drain, cluster upgrade)
- Without a PDB, a cluster upgrade can take down all replicas simultaneously

## GitOps (ArgoCD)

### Principles
- Git is the source of truth for cluster state. No `kubectl apply` in production.
- All changes go through PR review before ArgoCD syncs them
- ArgoCD auto-syncs dev environment. Staging and production require manual sync approval.
- Self-healing enabled: ArgoCD reverts manual `kubectl` changes to match Git state

### Application Configuration

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: order-service-production
  namespace: argocd
spec:
  project: ecommerce
  source:
    repoURL: https://github.com/org/k8s-manifests.git
    targetRevision: main
    path: charts/app
    helm:
      valueFiles:
        - values.yaml
        - values-production.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: payments-production
  syncPolicy:
    automated:
      prune: false           # Do not auto-delete removed resources in production
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

### Deployment Strategy
- **Rolling update:** Default. `maxSurge: 1`, `maxUnavailable: 0` — zero-downtime deployments
- **Blue-green:** For database migrations or breaking changes. Use ArgoCD Rollouts.
- **Canary:** Progressive traffic shifting. Use ArgoCD Rollouts with analysis (Prometheus metrics)
- Rollback: `argocd app rollback` or revert the Git commit — ArgoCD syncs the previous state

## Network Policies

Default deny all ingress and egress. Explicitly allow required communication.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: order-service-network-policy
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: order-service
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: api-gateway
      ports:
        - port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: postgres
      ports:
        - port: 5432
    - to:                    # Allow DNS resolution
        - namespaceSelector: {}
      ports:
        - port: 53
          protocol: UDP
```

## Observability

### Prometheus
- Every service exposes a `/metrics` endpoint (Prometheus format)
- ServiceMonitor CRD registers the service with Prometheus for scraping
- Alert rules defined in `observability/prometheus/rules/`
- Critical alerts: pod crash looping, high error rate (>1%), high latency (P99 > 2s), disk pressure

### Grafana
- Dashboard per service: request rate, error rate, latency (RED method)
- Infrastructure dashboard: node CPU, memory, disk, network
- Store dashboards as JSON in Git — do not create dashboards manually in Grafana UI
- Use variables for environment/namespace filtering

### Logging
- Structured JSON logs from all applications
- Centralised logging: Loki, Elasticsearch, or cloud-native (CloudWatch, Stackdriver)
- Log correlation: include request ID, trace ID, user ID in every log entry
- Log levels: ERROR (pages someone), WARN (investigate later), INFO (normal operations), DEBUG (development only)

## Testing Requirements

| Type | Tool | What to Test |
|------|------|-------------|
| Lint | `helm lint` | Chart syntax and best practices |
| Template | `helm template` | Rendered manifest correctness |
| Unit | helm-unittest plugin | Template logic, conditional resources |
| Security | kubesec, Trivy | Manifest security, image vulnerabilities |
| Integration | kind cluster | Full deployment in ephemeral cluster |
| Smoke | Helm test hook | Post-deploy connectivity and health |

### Helm Unit Test Example
```yaml
# tests/deployment_test.yaml
suite: Deployment tests
templates:
  - deployment.yaml
tests:
  - it: should set resource limits
    asserts:
      - isNotNull:
          path: spec.template.spec.containers[0].resources.limits
  - it: should have at least 2 replicas in production
    set:
      replicaCount: 2
    asserts:
      - equal:
          path: spec.replicas
          value: 2
```

## Security Rules

1. **Pod Security Standards:** Enforce `restricted` security context in production. No root containers, no privilege escalation, read-only root filesystem.
2. **Image scanning:** Scan container images with Trivy in CI. Block deployment of images with CRITICAL or HIGH CVEs.
3. **Image provenance:** Use signed images (cosign/Notary). Pull only from trusted registries. Never use `:latest` tag — always pin to specific digest or semantic version.
4. **Secrets encryption:** Use Sealed Secrets or External Secrets Operator. Never store plaintext secrets in Git. Never use `kubectl create secret` manually in production.
5. **RBAC:** Principle of least privilege. Service accounts get only the permissions they need. No `cluster-admin` for application workloads.
6. **Network policies:** Default deny. Explicitly allow only required pod-to-pod and pod-to-external communication.
7. **Runtime security:** Consider Falco for runtime anomaly detection. Alert on unexpected process execution, file access, or network connections.
8. **Supply chain:** Pin base image versions in Dockerfiles. Use multi-stage builds to minimise attack surface. No build tools in production images.

## Common Pitfalls

- **No resource limits.** A container without limits can consume all node resources, evicting other pods. Every container gets limits. No exceptions.
- **Missing health probes.** Without liveness and readiness probes, Kubernetes cannot detect unhealthy pods or route traffic correctly. Define probes for every container.
- **Using `:latest` tag.** `:latest` is mutable — the same tag can point to different images. Rollbacks do not work with `:latest`. Pin to immutable tags or digests.
- **No PDB.** Without a Pod Disruption Budget, cluster maintenance (node upgrades, scaling) can kill all your replicas simultaneously. Define PDBs for all production workloads.
- **`kubectl apply` in production.** Manual applies bypass GitOps, create drift, and are not auditable. All production changes go through Git and ArgoCD.
- **Single replica in production.** One replica means one point of failure. Minimum 2 replicas for any production workload, with anti-affinity to spread across nodes.

## Code Review Checklist

- [ ] All containers have resource requests and limits
- [ ] Liveness and readiness probes defined
- [ ] PDB configured for multi-replica deployments
- [ ] Standard Kubernetes labels applied to all resources
- [ ] Image tag pinned to specific version (not `:latest`)
- [ ] Network policies restrict ingress and egress
- [ ] Security context: non-root, read-only root filesystem, no privilege escalation
- [ ] Secrets managed via Sealed Secrets or External Secrets (not plaintext in Git)
- [ ] HPA configured with sensible min/max replicas and scaling metrics
- [ ] ServiceMonitor configured for Prometheus scraping
- [ ] Helm lint and unit tests pass
- [ ] Values files per environment are consistent and reviewed

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
