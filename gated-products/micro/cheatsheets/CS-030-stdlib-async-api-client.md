---
title: "Stdlib Async API Client — Cheat Sheet"
hive_doctrine_id: HD-0066
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-0066
full_product_price: 29
---

# Stdlib Async API Client — Cheat Sheet

## What It Is

A zero-dependency Python async API client built entirely on stdlib (`urllib.request`, `json`, `time`, `os`). No `requests`, no `httpx`, no `aiohttp`.

## Why Zero Dependencies

- Works in any Python 3.x environment without `pip install`
- No supply chain risk from third-party packages
- Deploys in locked-down environments (Docker scratch, Lambda, restricted servers)
- Smaller attack surface for security audits

## Core Class: AsyncAPIClient

```python
import urllib.request
import json
import time
import os

class AsyncAPIClient:
    def __init__(self, base_url, api_key=None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key or os.environ.get('API_KEY')

    def _request(self, method, path, data=None):
        url = f"{self.base_url}{path}"
        headers = {'Content-Type': 'application/json'}
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'
        body = json.dumps(data).encode() if data else None
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
```

## Key Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `submit_job(payload)` | Submit async job | `job_id` |
| `get_status(job_id)` | Check job status | `status` string |
| `get_result(job_id)` | Fetch completed result | Result data |
| `wait_for_completion(job_id, timeout=300)` | Poll until done | Result data |
| `generate_and_wait(payload)` | Submit + wait (convenience) | Result data |

## Polling Pattern

```python
def wait_for_completion(self, job_id, timeout=300, interval=2):
    start = time.time()
    while time.time() - start < timeout:
        status = self.get_status(job_id)
        if status == 'completed':
            return self.get_result(job_id)
        if status == 'failed':
            raise RuntimeError(f"Job {job_id} failed")
        time.sleep(interval)
    raise TimeoutError(f"Job {job_id} timed out after {timeout}s")
```

## Usage

```python
client = AsyncAPIClient('https://api.example.com', api_key='...')
result = client.generate_and_wait({'prompt': 'Hello world'})
```

## When to Use This vs. `requests`

| Scenario | Use Stdlib Client | Use `requests` |
|----------|-------------------|----------------|
| Locked-down environment | Yes | No |
| Security audit required | Yes | Maybe |
| Complex auth (OAuth) | No | Yes |
| File uploads | No | Yes |
| Simple JSON API | Yes | Either |

---

*This is the condensed version. The full guide (HD-0066, $29) covers the complete AsyncAPIClient class with error handling, retry logic, and production deployment patterns. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
