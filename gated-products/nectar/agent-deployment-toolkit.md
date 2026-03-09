---
title: "Agent Deployment Toolkit: Docker, VPS, and Monitoring"
author: Melisia Archimedes
collection: C4 Infrastructure
tier: nectar
price: 149
version: 1.0
last_updated: 2026-03-09
audience: agent_operators
hive_doctrine_id: HD-1204
sources_researched: [Docker best practices, VPS hosting benchmarks, agent monitoring platforms, production deployment case studies, infrastructure-as-code patterns]
word_count: 9847
---

# Agent Deployment Toolkit: Docker, VPS, and Monitoring

## Introduction: From Laptop to Production

You've built an agent. It runs flawlessly on your machine. You push it to a VPS and it becomes fragile, unreliable, or disappears entirely.

This is the deployment gap—the chasm between local development and production infrastructure. Most agent operators miss it because they're focused on agent logic, not infrastructure. The gap costs time, money, and credibility when agents fail silently in production.

This toolkit closes that gap. It's a complete, template-driven guide to deploying agents safely, reliably, and cost-effectively. You'll learn deployment patterns, infrastructure setup, monitoring architecture, and operational procedures that work whether you're running one agent or twenty.

**What you'll get:**
- Five battle-tested deployment architectures with decision matrices
- Complete Docker and VPS configuration templates
- Three monitoring stacks (lightweight to enterprise)
- Backup, recovery, and disaster response procedures
- CI/CD pipelines for agent deployments
- A 30-point production launch checklist

**Who this is for:** Agent operators scaling from development to production. You understand your agent's logic; this teaches you the infrastructure that keeps it alive.

---

## Part 1: Deployment Architecture Patterns

Production agents run in one of five patterns. Choose based on scale, complexity, and cost tolerance.

### Pattern 1: Single Agent on VPS (Simplest)

**Architecture:** One VPS, one container, one agent.

**When to use:**
- First agent moving to production
- Single-purpose, non-critical workload
- Budget under $50/month

**Setup:**
```
┌─────────────────────────────┐
│      VPS (Hetzner CCX11)    │
│  - 2vCPU, 4GB RAM, 40GB SSD │
│                             │
│  ┌─────────────────────────┐│
│  │  Docker Container       ││
│  │  - Agent application    ││
│  │  - Health endpoint      ││
│  │  - Logging to stdout    ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │  Caddy Reverse Proxy    ││
│  │  - SSL/TLS              ││
│  │  - Rate limiting        ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

**Advantages:**
- Simple to provision and manage
- Low cost (~$12/month VPS + API costs)
- Easy to debug (single point of failure is clear)
- Straightforward monitoring

**Disadvantages:**
- No redundancy; agent downtime = operation downtime
- Limited capacity for multiple parallel tasks
- Scaling requires architectural redesign

**Cost estimate:** VPS $12–20/month + API calls.

---

### Pattern 2: Multi-Agent on Single VPS (Docker Compose)

**Architecture:** One VPS, Docker Compose, 3–5 agents in separate containers, shared backing services.

**When to use:**
- 2–5 related agents (coordination needed)
- Agents share common infrastructure (DB, cache, logs)
- Team of 2–3 agent operators
- Budget under $100/month

**Setup:**
```
┌─────────────────────────────────────────────┐
│      VPS (Hetzner CCX23)                    │
│  - 4vCPU, 8GB RAM, 80GB SSD                 │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │  Docker Compose Network                 ││
│  │                                         ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────┐  ││
│  │  │  Agent A │  │  Agent B │  │Agent │  ││
│  │  │ (research)  │(execution) │(logger) ││
│  │  └────┬───────┘  └────┬──────┘ └──┬───┘  ││
│  │       │               │           │     ││
│  │  ┌────┴───────────────┴───────────┴──┐  ││
│  │  │  Shared Services                  │  ││
│  │  │  - PostgreSQL (state)             │  ││
│  │  │  - Redis (cache, queues)          │  ││
│  │  │  - Elasticsearch (logs)           │  ││
│  │  │  - Caddy (reverse proxy)          │  ││
│  │  └───────────────────────────────────┘  ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**Advantages:**
- Single deployment unit for coordinated agents
- Shared database and cache reduce data duplication
- Network isolated on single VPS (no latency between services)
- Easier to manage than multiple VPS deployments

**Disadvantages:**
- If VPS goes down, all agents fail (no redundancy)
- Resource contention (one agent can starve others)
- Scaling one agent requires scaling the entire VPS

**Cost estimate:** VPS $30–50/month + shared API calls.

---

### Pattern 3: Multi-Agent on Multiple VPS (Distributed)

**Architecture:** 2–5 VPS, one or two agents per VPS, shared orchestrator.

**When to use:**
- 5+ agents in production
- Agents are independent (minimal coordination)
- Fault isolation critical (one agent failure doesn't affect others)
- Organisation has 3+ team members
- Budget $200+/month

**Setup:**
```
┌──────────────────────────────────────────────────┐
│          Load Balancer / Orchestrator            │
│  - Caddy or Nginx (routing + SSL)                │
│  - Monitoring aggregation                        │
│  - Deployment coordinator                        │
└──────────────────┬───────────────────────────────┘
                   │
      ┌────────────┼────────────┬───────────────┐
      │            │            │               │
┌─────▼──────┐ ┌──▼────────┐ ┌─▼────────────┐ │
│ VPS-Agent1 │ │VPS-Agent2 │ │VPS-Agent3   │ │
│ (2vCPU,4GB)│ │(2vCPU,4GB)│ │(2vCPU,4GB) │ │
│            │ │           │ │            │ │
│ ┌────────┐ │ │┌────────┐│ │┌──────────┐ │ │
│ │Agent-A │ │ ││Agent-B ││ ││Agent-C  │ │ │
│ └────────┘ │ │└────────┘│ │└──────────┘ │ │
│            │ │           │ │            │ │
│ ┌────────┐ │ │┌────────┐│ │            │ │
│ │Logging │ │ ││Monitor ││ │            │ │
│ └────────┘ │ │└────────┘│ │            │ │
└────────────┘ └───────────┘ └────────────┘ │
                                             │
      ┌──────────────────────────────────────┘
      │
┌─────▼──────────────────────────────┐
│  Shared Services (Managed/Cloud)   │
│  - PostgreSQL (RDS or self-hosted) │
│  - Redis (ElastiCache or self-hst) │
│  - Observability stack             │
└────────────────────────────────────┘
```

**Advantages:**
- Fault isolation (one VPS failure doesn't cascade)
- Independent scaling per agent
- Easier operational visibility (metrics per agent)
- Supports large deployments

**Disadvantages:**
- More expensive (multiple VPS)
- Operational complexity (5+ machines to manage)
- Network latency between agents (if they coordinate)

**Cost estimate:** 3× VPS at $15–25 each = $45–75/month, plus shared services $50–100/month.

---

### Pattern 4: Serverless Agent Deployment (Lambda/Workers)

**Architecture:** Agents run on AWS Lambda, Cloudflare Workers, or Google Cloud Functions. Triggered by events (HTTP, cron, queue).

**When to use:**
- Agents triggered by events (not continuous)
- Low to medium request volume (< 100 req/sec per agent)
- Budget under $100/month (low volume)
- Don't want to manage infrastructure

**Setup:**
```
┌──────────────────────────────────────────────────┐
│        Event Triggers                            │
│  - HTTP (API Gateway)                            │
│  - Cron (EventBridge)                            │
│  - SQS/Webhook                                   │
└────────────────┬─────────────────────────────────┘
                 │
      ┌──────────┴──────────┬──────────────┐
      │                     │              │
┌─────▼──────┐  ┌──────────▼──┐  ┌───────▼──┐
│Lambda-AgentA│  │Lambda-AgentB│  │Lambda-AgentC
│ (128MB–3GB)│  │ (512MB–1GB) │  │(512MB–2GB)│
│ Python 3.11│  │ Node 18     │  │Python 3.11│
└─────┬──────┘  └──────────┬──┘  └───────┬──┘
      │                    │             │
      └────────────────────┼─────────────┘
                           │
      ┌────────────────────┼─────────────────┐
      │                    │                 │
  ┌───▼────┐        ┌──────▼───┐      ┌──────▼──┐
  │RDS     │        │S3 Logs   │      │DynamoDB │
  │(state) │        │(archives)│      │(state)  │
  └────────┘        └──────────┘      └─────────┘
```

**Advantages:**
- Zero infrastructure management
- Pay-per-execution (cheap for low volume)
- Automatic scaling
- Built-in redundancy

**Disadvantages:**
- Cold start latency (100–500ms first invocation)
- Limited execution time (5–15 min depending on platform)
- Harder to debug (distributed logs)
- Unpredictable costs at scale

**Cost estimate:** $0–50/month for low volume; $200+ if high invocation frequency.

---

### Pattern 5: Hybrid (Orchestrator + Serverless Workers)

**Architecture:** Coordinator agent runs on VPS. Worker agents run serverless. Coordinator distributes work to workers.

**When to use:**
- Complex workflows with decision logic (coordinator)
- Parallel execution needed (workers scale automatically)
- Mix of continuous and event-driven agents
- Mid-stage teams scaling up

**Setup:**
```
┌─────────────────────────────────────────────────┐
│  VPS Orchestrator (Hetzner CCX11)               │
│  - Decision logic                               │
│  - Job queue management                         │
│  - Result aggregation                           │
│  - Monitoring centralization                    │
└────────────────────────┬────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼──────┐ ┌─────▼─────┐ ┌──────▼───┐
    │SQS Queue  │ │DynamoDB   │ │RDS State │
    │(jobs)     │ │(progress) │ │(results) │
    └───────────┘ └───────────┘ └──────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
     ┌───▼───┐       ┌───▼───┐      ┌──▼──┐
     │Lambda │       │Lambda │      │Lambda│
     │Worker1│       │Worker2│      │Work3 │
     └───────┘       └───────┘      └──────┘
```

**Advantages:**
- Orchestrator stays warm (low latency decisions)
- Workers scale automatically (cost-effective for variable load)
- Good balance of control and elasticity

**Disadvantages:**
- More operational complexity
- Debugging distributed execution is harder
- Requires careful queue and state management

**Cost estimate:** VPS $20/month + Lambda $30–100/month depending on volume.

---

### Decision Matrix: Which Pattern?

| Factor | Pattern 1 | Pattern 2 | Pattern 3 | Pattern 4 | Pattern 5 |
|--------|-----------|-----------|-----------|-----------|-----------|
| **Agent count** | 1 | 2–5 | 5+ | 1–3 | 2+ |
| **Coordination** | N/A | Tight | Loose | None | Mixed |
| **Monthly cost** | $20 | $60 | $150 | $30 | $80 |
| **Operational load** | Low | Low | Medium | Very low | Medium |
| **Startup latency** | <1s | <1s | <1s | 200–500ms | <1s |
| **Redundancy** | None | None | Good | Built-in | Good |
| **Team size** | 1 | 1–2 | 3+ | 1 | 2+ |

**Quick decision tree:**
- Running one agent? → **Pattern 1**
- Running 2–5 related agents? → **Pattern 2**
- Running 5+ independent agents? → **Pattern 3**
- Agents triggered by events, low volume? → **Pattern 4**
- Decision logic + variable workload? → **Pattern 5**

---

## Part 2: VPS Selection and Setup

If you've chosen a VPS-based pattern (1, 2, 3, or 5), use this section.

### Provider Comparison

| Provider | Best for | Specs | Price | Notes |
|----------|----------|-------|-------|-------|
| **Hetzner** | Cost/performance | 2vCPU, 4GB, 40GB ~$8/mo | ★★★★★ | EU-based, excellent I/O. Default choice. |
| **DigitalOcean** | Simplicity | 2vCPU, 4GB, 60GB ~$24/mo | ★★★★ | Great docs, app platform (managed). Premium pricing. |
| **Linode** | Reliability | 2vCPU, 4GB, 81GB ~$12/mo | ★★★★ | Solid uptime, responsive support. Mid-tier pricing. |
| **AWS Lightsail** | Integration | 2vCPU, 4GB, 80GB ~$20/mo | ★★★ | Works with AWS ecosystem (RDS, etc.). Pricier. |
| **Vultr** | Flexibility | 2vCPU, 4GB, 55GB ~$12/mo | ★★★★ | Good global presence, good performance. |

**Recommendation for agents:** Hetzner (best value) or Linode (best reliability). Both have excellent uptime, responsive support, and competitive pricing.

### Sizing Guide

**Memory requirements:**
- Small agent (basic LLM calls, no local models): 512MB–1GB
- Medium agent (local small model, caching): 2–4GB
- Large agent (large local model, vector DB): 4–8GB+

**CPU requirements:**
- Mostly I/O (API calls, database): 1 vCPU sufficient
- CPU-heavy (local inference, data processing): 2–4 vCPU

**Storage requirements:**
- Agent code + logs: 10–20GB
- Model cache (local LLM): 10–50GB per model
- Vector DB or similar: variable (50GB–500GB+)

**Recommended starting specs:** 2vCPU, 4GB RAM, 40GB SSD (costs ~$8–15/month).

### Initial Server Hardening

After receiving VPS credentials, run this immediately:

```bash
#!/bin/bash
# SSH hardening and security baseline
# Run as root on fresh VPS

# 1. Update system
apt-get update && apt-get upgrade -y

# 2. Create non-root user for deployments
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy

# 3. Generate and install SSH key (paste your public key)
mkdir -p /home/deploy/.ssh
cat >> /home/deploy/.ssh/authorized_keys <<EOF
ssh-ed25519 AAAAC3Nz... (your public key)
EOF
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# 4. Disable password authentication, root SSH
sed -i 's/#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# 5. Firewall (ufw)
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw enable

# 6. Fail2ban (brute force protection)
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# 7. Unattended upgrades (auto-patch security)
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

echo "✓ Server hardened. SSH login: ssh deploy@<IP>"
```

### Docker Installation

```bash
# Run as deploy user with sudo

# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.1/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Verify
docker --version
docker-compose --version

echo "✓ Docker installed and configured"
```

### Reverse Proxy: Caddy Template

Caddy handles SSL/TLS automatically and is simpler than Nginx for most agent use cases.

**File: `/home/deploy/Caddyfile`**
```caddy
# Caddy configuration for agent API

api.example.com {
    reverse_proxy localhost:8000 {
        header_uri -Authorization
        timeout 30s
    }

    # Rate limiting: 100 requests per second
    rate_limit {
        zone dynamic {
            key {
                {remote_host}
            }
            window 1s
            limit 100
        }
    }

    # Gzip compression
    encode gzip

    # Security headers
    header X-Frame-Options "DENY"
    header X-Content-Type-Options "nosniff"
    header Referrer-Policy "strict-origin-when-cross-origin"
}
```

**Run Caddy:**
```bash
docker run -d \
  --name caddy \
  --restart always \
  -p 80:80 \
  -p 443:443 \
  -v /home/deploy/Caddyfile:/etc/caddy/Caddyfile:ro \
  -v caddy_data:/data \
  -v caddy_config:/config \
  caddy:latest
```

---

## Part 3: Docker Configuration Templates

### Single Agent Dockerfile

```dockerfile
# Dockerfile for a single agent
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy agent code
COPY . .

# Non-root user
RUN useradd -m agent
USER agent

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run agent
EXPOSE 8000
CMD ["python", "main.py"]
```

### Multi-Agent Docker Compose

```yaml
# docker-compose.yml for 3-agent deployment
version: '3.9'

services:
  # Agent 1: Research
  agent-research:
    build:
      context: ./agents/research
      dockerfile: Dockerfile
    container_name: agent-research
    restart: unless-stopped
    ports:
      - "8001:8000"
    environment:
      - LOG_LEVEL=INFO
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=postgresql://agent:${DB_PASSWORD}@postgres:5432/agents
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - research-cache:/app/cache
      - ./logs/research:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - agent-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Agent 2: Execution
  agent-execution:
    build:
      context: ./agents/execution
      dockerfile: Dockerfile
    container_name: agent-execution
    restart: unless-stopped
    ports:
      - "8002:8000"
    environment:
      - LOG_LEVEL=INFO
      - DATABASE_URL=postgresql://agent:${DB_PASSWORD}@postgres:5432/agents
      - REDIS_URL=redis://redis:6379/1
    volumes:
      - execution-cache:/app/cache
      - ./logs/execution:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - agent-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s

  # Agent 3: Logger
  agent-logger:
    build:
      context: ./agents/logger
      dockerfile: Dockerfile
    container_name: agent-logger
    restart: unless-stopped
    ports:
      - "8003:8000"
    environment:
      - LOG_LEVEL=DEBUG
      - ELASTICSEARCH_URL=http://elasticsearch:9200
    volumes:
      - ./logs/logger:/app/logs
    depends_on:
      elasticsearch:
        condition: service_started
    networks:
      - agent-network

  # PostgreSQL for state
  postgres:
    image: postgres:15-alpine
    container_name: postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: agent
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: agents
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - agent-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agent"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis for caching/queues
  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    volumes:
      - redis-data:/data
    networks:
      - agent-network
    command: redis-server --appendonly yes

  # Elasticsearch for logs (optional)
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    container_name: elasticsearch
    restart: unless-stopped
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    networks:
      - agent-network

volumes:
  postgres-data:
  redis-data:
  elasticsearch-data:
  research-cache:
  execution-cache:

networks:
  agent-network:
    driver: bridge
```

**Environment file: `.env.production`**
```bash
# Copy to VPS, set strict permissions: chmod 600 .env.production
OPENAI_API_KEY=sk-...
DB_PASSWORD=generate-strong-password-here
POSTGRES_USER=agent
LOG_LEVEL=INFO
ENVIRONMENT=production
```

### Resource Limits

Add to each container in docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'        # Max 1 CPU
      memory: 2G       # Max 2GB RAM
    reservations:
      cpus: '0.5'      # Reserve 0.5 CPU
      memory: 1G       # Reserve 1GB RAM
```

---

## Part 4: Monitoring Stack Setup

### Option A: Lightweight Monitoring

**For:** Single agent, < 100 requests/day, budget-conscious.

**Components:**
- Custom HTTP health endpoint (`/health`)
- Uptime checker (UptimeRobot, StatusPage, Betteruptime)
- Email alerts on failure
- Manual log review

**Health endpoint (Flask example):**
```python
from flask import Flask, jsonify
import psutil
import requests

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    # Check agent process
    try:
        agent_response = requests.get('http://localhost:5000/status', timeout=2)
        agent_ok = agent_response.status_code == 200
    except:
        agent_ok = False

    # Check system resources
    cpu_percent = psutil.cpu_percent(interval=1)
    mem_percent = psutil.virtual_memory().percent

    health_status = {
        'status': 'healthy' if agent_ok and cpu_percent < 80 else 'degraded',
        'agent': 'ok' if agent_ok else 'error',
        'cpu_percent': cpu_percent,
        'memory_percent': mem_percent,
        'timestamp': datetime.utcnow().isoformat()
    }

    return jsonify(health_status), (200 if health_status['status'] == 'healthy' else 503)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001)
```

**Uptime monitoring:** Add to UptimeRobot (free):
- URL: `https://api.example.com/health`
- Interval: Every 5 minutes
- Alert on: 2 consecutive failures
- Notify: Email, Slack

**Cost:** $0–20/month (mostly free tools).

---

### Option B: Medium Monitoring (Prometheus + Grafana)

**For:** 2–5 agents, 100–10k requests/day, want custom dashboards.

**Setup:**
```yaml
# docker-compose-monitoring.yml
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
    depends_on:
      - prometheus
```

**Prometheus config: `prometheus.yml`**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'agent-research'
    static_configs:
      - targets: ['localhost:8001']
    metrics_path: '/metrics'

  - job_name: 'agent-execution'
    static_configs:
      - targets: ['localhost:8002']

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
```

**Instrument agent (Python):**
```python
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time

# Metrics
request_count = Counter('agent_requests_total', 'Total requests', ['agent_name'])
request_duration = Histogram('agent_request_duration_seconds', 'Request duration')
active_tasks = Gauge('agent_active_tasks', 'Currently active tasks')

@app.route('/api/task', methods=['POST'])
def run_task():
    request_count.labels(agent_name='research').inc()

    with request_duration.time():
        active_tasks.inc()
        try:
            result = agent.process(request.json)
        finally:
            active_tasks.dec()

    return jsonify(result)

# Start metrics server on port 8001
start_http_server(8001)
```

**Grafana dashboard queries:**
```
# Error rate
rate(agent_requests_total{status="error"}[5m])

# Average latency
rate(agent_request_duration_seconds_sum[5m]) / rate(agent_request_duration_seconds_count[5m])

# Memory usage
process_resident_memory_bytes

# Active tasks
agent_active_tasks
```

**Cost:** $0 (self-hosted) + VPS resources.

---

### Option C: Full Enterprise (OpenTelemetry + Arize)

**For:** 5+ agents, high-stakes operations, AI-specific observability needed.

**Components:**
- **OpenTelemetry SDK:** Collect traces, metrics, logs from agents
- **Arize or Langfuse:** AI-specific dashboard (prompt versions, token usage, latency by model)
- **Jaeger/Datadog:** Distributed tracing (if multi-agent coordination)
- **PagerDuty:** Incident alerting

**Basic OpenTelemetry instrumentation:**
```python
from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Setup tracer
jaeger_exporter = JaegerExporter(agent_host_name="localhost", agent_port=6831)
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(jaeger_exporter))

tracer = trace.get_tracer(__name__)

# Use in code
with tracer.start_as_current_span("process_request") as span:
    span.set_attribute("agent_name", "research")
    span.set_attribute("input_tokens", 150)
    result = agent.process(data)
    span.set_attribute("output_tokens", 280)
```

**Langfuse integration (LLM tracking):**
```python
from langfuse import Langfuse

langfuse = Langfuse(public_key="pk_...", secret_key="sk_...")

# Log LLM call
langfuse.log_llm_call(
    name="research_query",
    model="gpt-4",
    prompt_tokens=150,
    completion_tokens=280,
    total_tokens=430,
    cost_usd=0.015
)
```

**Cost:** $0–300/month (depending on volume).

---

## Part 5: Logging Architecture

### Structured Logging Format

All agent logs should follow JSON format for aggregation:

```python
import json
import logging

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'correlation_id': getattr(record, 'correlation_id', 'N/A'),
            'agent_name': getattr(record, 'agent_name', 'unknown'),
            'duration_ms': getattr(record, 'duration_ms', None),
            'status': getattr(record, 'status', 'INFO'),
        }
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        return json.dumps(log_data)

# Configure
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger = logging.getLogger()
logger.addHandler(handler)
```

### Log Rotation

Docker handles log rotation via `--log-opt`:
```bash
docker run -d \
  --name agent \
  --log-driver json-file \
  --log-opt max-size=50m \
  --log-opt max-file=3 \
  agent-image
```

### Log Aggregation (Elasticsearch + Kibana)

```yaml
# In docker-compose.yml
kibana:
  image: docker.elastic.co/kibana/kibana:8.10.0
  ports:
    - "5601:5601"
  environment:
    ELASTICSEARCH_HOSTS: http://elasticsearch:9200
  depends_on:
    - elasticsearch
```

**Search logs in Kibana:**
```
agent_name: "research" AND level: "ERROR" AND timestamp: [now-1h TO now]
```

### Compliance: What to Keep

- **Keep 30 days:** INFO and above (rotation)
- **Keep 1 year:** ERROR and CRITICAL (archived to S3)
- **PII rules:** Never log API keys, passwords, or personal data

---

## Part 6: Backup and Recovery

### Database Backup: PostgreSQL

```bash
#!/bin/bash
# backup-postgres.sh - run daily via cron

BACKUP_DIR="/home/deploy/backups/postgres"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DB_CONTAINER="postgres"

mkdir -p $BACKUP_DIR

# Dump database
docker exec $DB_CONTAINER pg_dump -U agent agents > \
  $BACKUP_DIR/agents-${TIMESTAMP}.sql

# Compress
gzip $BACKUP_DIR/agents-${TIMESTAMP}.sql

# Keep only 14 days
find $BACKUP_DIR -name "agents-*.sql.gz" -mtime +14 -delete

# Upload to S3
aws s3 cp $BACKUP_DIR/agents-${TIMESTAMP}.sql.gz \
  s3://backups-example/postgres/ --sse AES256

echo "✓ Backup complete: agents-${TIMESTAMP}.sql.gz"
```

**Cron job: `0 2 * * * /home/deploy/backup-postgres.sh`** (2 AM daily)

### Database Backup: SQLite (WAL Checkpoint)

```bash
#!/bin/bash
# backup-sqlite.sh

DB_FILE="/app/data/agent.db"
BACKUP_DIR="/home/deploy/backups/sqlite"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Checkpoint WAL (write pending changes to main DB)
sqlite3 $DB_FILE "PRAGMA wal_checkpoint(TRUNCATE);"

# Copy database
cp $DB_FILE $BACKUP_DIR/agent-${TIMESTAMP}.db

# Compress and upload
gzip $BACKUP_DIR/agent-${TIMESTAMP}.db
aws s3 cp $BACKUP_DIR/agent-${TIMESTAMP}.db.gz s3://backups-example/sqlite/

echo "✓ SQLite backup: agent-${TIMESTAMP}.db.gz"
```

### Recovery Procedure

```bash
# Restore PostgreSQL from backup
docker exec postgres psql -U agent -d agents < \
  /home/deploy/backups/postgres/agents-20240309-020000.sql

# Restore SQLite
cp /home/deploy/backups/sqlite/agent-20240309-020000.db.gz .
gunzip agent-*.db.gz
# Replace in container volume
```

---

## Part 7: CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml

name: Test, Build, Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python 3.11
        uses: actions/setup-python@v4
        with:
          python-version: 3.11

      - name: Install dependencies
        run: |
          pip install -r requirements-dev.txt

      - name: Run tests
        run: |
          pytest tests/ --cov=agents --cov-report=term

      - name: Lint with flake8
        run: |
          flake8 agents/ --max-line-length=120

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: |
          docker build -t registry.example.com/agent:${GITHUB_SHA:0:7} .
          docker tag registry.example.com/agent:${GITHUB_SHA:0:7} registry.example.com/agent:latest

      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_REGISTRY_TOKEN }}" | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin registry.example.com
          docker push registry.example.com/agent:${GITHUB_SHA:0:7}
          docker push registry.example.com/agent:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/deploy/agent-production
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T agent curl http://localhost:8000/health
```

**Blue-Green Deployment (zero downtime):**

```bash
#!/bin/bash
# Deploy with blue-green switching

BLUE_PORT=8001
GREEN_PORT=8002
LIVE_PORT=8000

# Start green environment
docker-compose -f docker-compose.green.yml up -d
sleep 10

# Health check green
if curl -f http://localhost:${GREEN_PORT}/health; then
  # Switch traffic to green
  docker run -d --name caddy-switch \
    -p 8000:8000 \
    -e GREEN_PORT=${GREEN_PORT} \
    caddy-load-balancer

  # Stop blue
  docker-compose -f docker-compose.blue.yml down

  echo "✓ Deployed successfully (blue→green)"
else
  echo "✗ Health check failed, keeping blue active"
  exit 1
fi
```

---

## Part 8: Security Hardening

### Network Security

**Firewall rules template:**
```bash
# UFW rules for agent infrastructure

ufw default deny incoming
ufw default allow outgoing

# SSH (your office IP only)
ufw allow from 203.0.113.0/32 to any port 22

# HTTP/HTTPS (public)
ufw allow 80/tcp
ufw allow 443/tcp

# Agent API (private network only)
ufw allow from 10.0.0.0/8 to any port 8000:8999

# Database (container network only, no external access)
# PostgreSQL and Redis stay internal to docker network

# Monitoring (private network)
ufw allow from 10.0.0.0/8 to any port 9090  # Prometheus
ufw allow from 10.0.0.0/8 to any port 3000  # Grafana

ufw enable
```

### Container Security

**Dockerfile best practices:**
```dockerfile
FROM python:3.11-slim

# Create non-root user
RUN useradd -m -u 1000 agent
USER agent

# No secrets in image
COPY --chown=agent:agent requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Read-only filesystem (where possible)
RUN mkdir -p /tmp /app/temp && chown agent /tmp /app/temp

# Copy app
COPY --chown=agent:agent . .

# Run as non-root
EXPOSE 8000
CMD ["python", "main.py"]
```

**Docker-compose security:**
```yaml
services:
  agent:
    # ... other config ...
    security_opt:
      - no-new-privileges:true
    read_only: true  # Read-only root filesystem
    tmpfs:
      - /tmp
      - /app/temp
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### Secret Management

**Never:**
- Commit secrets to git (use `.gitignore`)
- Embed secrets in Docker images
- Log secrets in application output

**Do:**
- Store in environment variables (CI/CD secrets)
- Use secret stores (HashiCorp Vault, AWS Secrets Manager)
- Rotate API keys regularly

**Example (AWS Secrets Manager):**
```python
import boto3
import json

client = boto3.client('secretsmanager')

def get_secret(secret_name):
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

openai_key = get_secret('prod/openai-api-key')['api_key']
```

---

## Part 9: Cost Management

### Cost Calculator Template

```
Monthly cost estimate for 2-agent deployment:

Infrastructure:
  - VPS (Hetzner CCX23)        = $30
  - PostgreSQL backup (S3)      = $1
  Total infrastructure          = $31

API Costs (estimate):
  - OpenAI (agent-research)     = 2000 req/day × $0.001 = $60
  - OpenAI (agent-execution)    = 500 req/day × $0.002 = $30
  - Embedding calls             = 1000/day × $0.00001 = $0.30
  Total API calls               = $90.30

Observability:
  - Prometheus + Grafana (self) = $0
  - Logs (local storage)        = $0
  Total observability           = $0

Miscellaneous:
  - DNS                         = $1
  - Email alerts                = $0
  Total misc                    = $1

TOTAL MONTHLY                   = $122.30
COST PER AGENT                  = $61.15
```

### Auto-Scaling Strategy

Scale up when:
- CPU > 70% sustained (5 min average)
- Memory > 80% sustained
- Request latency > 2 seconds (5 min p95)

Scale down when:
- CPU < 30% for 15 minutes
- Memory < 50% for 15 minutes
- Request volume drops 50%

**Example (AWS Auto Scaling):**
```bash
# Scale up
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name agent-asg \
  --desired-capacity 3

# Scale down
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name agent-asg \
  --desired-capacity 1
```

---

## Part 10: Operational Runbook

### Daily Checks (5 minutes, 8 AM)

```
□ SSH to VPS
□ Check docker status: docker ps
□ Verify all containers running (status UP)
□ Check disk usage: df -h (< 80% used?)
□ Check memory: free -h (headroom available?)
□ Verify API health: curl https://api.example.com/health
□ Check error logs: grep ERROR logs/*.log | wc -l (< 10?)
□ Verify backup completed: ls -lh backups/ (< 2 hours old?)
```

**Troubleshoot if issues:**
```bash
# Container crashed?
docker logs agent-research | tail -50

# Memory leak?
docker stats agent-research

# Disk full?
docker system prune -a  # Remove unused images/volumes
```

### Weekly Maintenance (30 minutes, Monday morning)

```
□ Review error logs (last 7 days)
□ Check VPS resource trends (CPU, memory, disk growth)
□ Verify backups are uploading to S3
□ Test recovery procedure on staging
□ Review uptime metrics (target: > 99.5%)
□ Check API rate limits not exceeded
□ Scan for unused containers/volumes: docker system df
□ Review security updates available: apt list --upgradable
□ Update monitoring dashboards if needed
```

### Monthly Review (1 hour, first Monday)

```
□ Cost review: actual vs budget
□ Performance analysis: latency, throughput, errors
□ Security audit: failed SSH logins, firewall logs
□ Capacity planning: is scaling needed in next 3 months?
□ Backup rotation: old backups being deleted properly?
□ Incident review: any outages? Root cause analysis?
□ Update runbooks based on learnings
□ Plan any infrastructure improvements
□ Review API usage by agent (which is most expensive?)
```

### Incident Response

**When agent is down (health check failing):**
```bash
# 1. Immediate diagnosis (< 2 min)
ssh deploy@api.example.com
docker logs agent-research | tail -100

# 2. Quick fixes (< 5 min)
docker restart agent-research

# 3. If restart doesn't work
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d

# 4. If services stay down (escalate)
- Check VPS disk/memory (df -h, free -h)
- Check network connectivity: ping 8.8.8.8
- Check Docker daemon: systemctl status docker
- Review recent changes: git log -5 --oneline

# 5. Rollback if needed
git revert HEAD
docker-compose down && docker-compose up -d
```

**Escalation path:**
1. Auto-resolve: Restart container
2. Manual: SSH and diagnose (5 min)
3. Rollback: Revert last deployment (10 min)
4. Nuclear: Restore from backup (30 min)

---

## Part 11: Production Launch Checklist

**Critical: All 30 items must be completed before going live.**

### Infrastructure (7 items)
- [ ] VPS provisioned and hardened (SSH keys, firewall, fail2ban)
- [ ] Docker and Docker Compose installed and tested
- [ ] Reverse proxy (Caddy) configured with SSL/TLS
- [ ] Backup automation configured and tested (restore verified)
- [ ] Log rotation configured (no logs older than 30 days)
- [ ] Monitoring dashboard set up (health checks visible)
- [ ] Alert channels configured (email/Slack/PagerDuty)

### Security (6 items)
- [ ] All secrets stored in CI/CD system (zero secrets in git)
- [ ] Firewall rules deployed (SSH restricted, API exposed)
- [ ] Container running as non-root user
- [ ] Database password changed from defaults
- [ ] API authentication configured (if needed)
- [ ] Security scan passed (no CRITICAL vulnerabilities)

### Agent Code (5 items)
- [ ] Agent tested locally (works on developer laptop)
- [ ] Docker image builds without errors
- [ ] Health endpoint responds correctly
- [ ] Error handling in place (graceful failures, no crashes)
- [ ] Logs structured JSON format

### Observability (4 items)
- [ ] Logs visible in aggregation system (Kibana or equivalent)
- [ ] Metrics visible in dashboard (latency, throughput, errors)
- [ ] Alerts configured (critical path issues trigger notifications)
- [ ] False positive rate < 10% on alerts

### Operational (5 items)
- [ ] Runbook written and reviewed
- [ ] Incident response procedure documented
- [ ] Team trained on monitoring and escalation
- [ ] On-call schedule established
- [ ] Stakeholders notified of launch

### Testing (3 items)
- [ ] Load test passed (can handle expected peak traffic)
- [ ] Failover test passed (agent recovers from restart)
- [ ] Backup/restore test passed (data recovery works)

---

## Conclusion: From Development to Production

The gap between local agent development and production is real. This toolkit bridges it with proven patterns, templates, and checklists that work at scale.

**Next steps:**
1. Choose your deployment pattern (Part 1)
2. Set up VPS following Part 2
3. Deploy using templates from Part 3
4. Pick a monitoring stack (Part 4)
5. Work through the launch checklist (Part 11)

**Related products in the Hive Doctrine:**
- **Agent Security Checklist** (HD-1004): Deep dive on hardening agent deployments
- **Agent Monitoring & Observability Stack** (HD-1102): Advanced telemetry and tracing
- **Agent Onboarding Playbook** (HD-1105): Training your team on operational procedures
- **Cost Optimisation for Agent Operations** (HD-1103): Reduce infrastructure spend
- **On-Device vs Cloud Agents** (HD-1014): Architecture decision framework

---

**Author:** Melisia Archimedes
**Last updated:** 2026-03-09
**Version:** 1.0
**Product ID:** HD-1204
