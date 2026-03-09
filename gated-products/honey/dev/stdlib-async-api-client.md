---
title: "Stdlib-Only Async API Client — Zero-Dependency Python for Locked-Down Agent Runtimes"
author: "Melisia Archimedes"
collection: "Dev Mastery"
tier: "honey"
price: 29
version: "1.0.0"
last_updated: "2026-03-09"
audience: "AI agent developers, Python developers working in constrained environments"
hive_doctrine_id: "HD-0066"
---

## Problem

You're building AI agent skills that need to call external APIs—image generation, inference endpoints, document processing—anything that works asynchronously. The problem: your runtime is locked down. No pip. No requests. No httpx. No third-party packages at all.

This isn't theoretical. Production agent sandboxes, isolated execution environments, and security-hardened containers all enforce this constraint. You get Python 3.8+ and stdlib. That's it.

The standard workaround is to wrap your async task in subprocess calls to curl or external binaries. That's fragile, slow, and introduces shell injection risks. You need a pure Python solution that fits in 100 lines of code and works inside the runtime you actually have.

## The Pattern

Build a single-class API client using only `urllib.request`, `json`, `time`, and `os`. No external dependencies. No async/await (it's not needed—you'll block and poll instead). The pattern handles the most common async API shape: submit job → poll status → fetch result.

```python
# skills/image_gen/client.py
import json
import time
import os
import urllib.request
import urllib.error
from typing import Optional, Dict, Any


class AsyncAPIClient:
    """
    Zero-dependency async API client for queue-based REST endpoints.
    Works in locked-down agent runtimes with no pip access.
    """

    def __init__(
        self,
        base_url: str,
        credentials_path: Optional[str] = None,
        poll_interval: float = 2.0,
        max_polls: int = 300,
    ):
        """
        Args:
            base_url: Root endpoint (e.g., "https://api.example.com")
            credentials_path: Path to JSON credentials file (defaults to ~/.agent-runtime/credentials.json)
            poll_interval: Seconds between status checks (default: 2)
            max_polls: Max polling attempts before timeout (default: 300 = 10 minutes)
        """
        self.base_url = base_url.rstrip("/")
        self.poll_interval = poll_interval
        self.max_polls = max_polls
        self.api_key = self._load_credentials(credentials_path)

    def _load_credentials(self, path: Optional[str]) -> str:
        """Load API key from credentials file at runtime, not import time."""
        if path is None:
            path = os.path.expanduser("~/.agent-runtime/credentials.json")

        if not os.path.exists(path):
            raise FileNotFoundError(
                f"Credentials file not found: {path}. "
                f"Create {path} with {{'api_key': 'your-key'}}"
            )

        with open(path, "r") as f:
            creds = json.load(f)
        return creds.get("api_key")

    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Low-level HTTP request using only urllib.request.
        The method= kwarg is the key to making this work—it's not widely known.
        """
        url = f"{self.base_url}{endpoint}"
        request_headers = {"Authorization": f"Bearer {self.api_key}"}
        if headers:
            request_headers.update(headers)

        body = None
        if data:
            request_headers["Content-Type"] = "application/json"
            body = json.dumps(data).encode("utf-8")

        req = urllib.request.Request(
            url, data=body, headers=request_headers, method=method
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            raise RuntimeError(
                f"API error {e.code}: {error_body}"
            ) from e
        except urllib.error.URLError as e:
            raise RuntimeError(f"Network error: {e.reason}") from e

    def submit_job(
        self,
        prompt: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Submit an async job to the queue. Returns request_id.
        Caller is responsible for polling status later.
        """
        payload = {"prompt": prompt}
        if params:
            payload.update(params)

        response = self._request("POST", "/v1/submit", data=payload)
        request_id = response.get("request_id")
        if not request_id:
            raise ValueError(f"No request_id in response: {response}")
        return request_id

    def get_status(self, request_id: str) -> Dict[str, Any]:
        """
        Poll the status endpoint. Returns status dict with at least:
          - status: one of {"SUBMITTED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"}
          - result: (optional) output data if status is COMPLETED
          - error: (optional) error message if status is FAILED
        """
        response = self._request("GET", f"/v1/status/{request_id}")
        return response

    def get_result(self, request_id: str) -> Dict[str, Any]:
        """
        Fetch the result of a completed job.
        Call this only after confirming status is COMPLETED.
        """
        response = self._request("GET", f"/v1/result/{request_id}")
        return response

    def wait_for_completion(
        self,
        request_id: str,
        terminal_states: Optional[set] = None,
    ) -> Dict[str, Any]:
        """
        Poll until the job reaches a terminal state.
        Default terminal states: {"COMPLETED", "FAILED", "CANCELLED"}
        Returns the final status dict.
        """
        if terminal_states is None:
            terminal_states = {"COMPLETED", "FAILED", "CANCELLED"}

        for attempt in range(self.max_polls):
            status_response = self.get_status(request_id)
            status = status_response.get("status")

            if status in terminal_states:
                return status_response

            if attempt < self.max_polls - 1:
                time.sleep(self.poll_interval)

        raise TimeoutError(
            f"Job {request_id} did not complete within {self.max_polls * self.poll_interval}s"
        )

    def generate_and_wait(
        self,
        prompt: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        One-shot wrapper: submit job, poll until done, fetch result.
        This is the right abstraction boundary for agent skills.
        Returns the result dict or raises on failure.
        """
        request_id = self.submit_job(prompt, params)
        final_status = self.wait_for_completion(request_id)

        if final_status.get("status") == "FAILED":
            raise RuntimeError(f"Job failed: {final_status.get('error', 'unknown error')}")

        if final_status.get("status") == "CANCELLED":
            raise RuntimeError("Job was cancelled")

        result = self.get_result(request_id)
        return result
```

## Key Insights

**1. The urllib.request.Request method= kwarg is not obvious.**
Most documentation shows it defaulting to POST based on data presence. You can pass `method="PUT"` or `method="DELETE"` explicitly—this is essential for queue APIs that use GET for status checks.

**2. Queue APIs need two endpoint shapes.**
Don't assume one URL does everything. Real async APIs separate submission (`/submit`) from polling (`/status/{id}`) from result fetching (`/result/{id}`). Design your client to match this split. Adapt the endpoint templates to your actual API.

**3. Load credentials at call time, not import time.**
This pattern matters in agent runtimes where the credentials file might not exist until the skill is first invoked. Use `_load_credentials()` in `__init__()`, not at module level. This also means rotating credentials doesn't require restarting the agent.

**4. Protect credential files with chmod 600.**
When you create `~/.agent-runtime/credentials.json`, set permissions immediately:
```bash
echo '{"api_key": "YOUR_KEY"}' > ~/.agent-runtime/credentials.json
chmod 600 ~/.agent-runtime/credentials.json
```
The client doesn't enforce this, but your deployment script should.

**5. The one-method wrapper is the right abstraction for skills.**
Agents calling this client should use `generate_and_wait()`, not orchestrate submit → poll → fetch themselves. This keeps the skill logic in one place and makes retries/timeouts predictable. The multi-step methods are there for advanced use cases.

**6. This pattern generalises to any queue-based async API.**
If you're calling a different service, change only:
- `submit_job()` endpoint and request payload shape
- `get_status()` endpoint and response field names
- `get_result()` endpoint and response unwrapping
- Terminal state names (some APIs use `succeeded` instead of `COMPLETED`)

The polling loop, error handling, and timeout logic stay the same.

## Implementation Example

Here's how an agent skill would use this client:

```python
# skills/image_gen/SKILL.md
"""
Generate an image using the image generation API.
Handles polling transparently—agents just pass a prompt and wait.
"""

from client import AsyncAPIClient


def generate_image(prompt: str, size: str = "1024x1024") -> dict:
    """
    Skill entry point for agent.
    Args:
        prompt: Description of image to generate
        size: Output dimensions (default: 1024x1024)
    Returns:
        dict with url, metadata
    """
    client = AsyncAPIClient(
        base_url="https://api.example.com",
        credentials_path=None,  # Uses ~/.agent-runtime/credentials.json
        poll_interval=2.0,
        max_polls=300,
    )

    result = client.generate_and_wait(
        prompt=prompt,
        params={"size": size},
    )

    return {
        "url": result.get("image_url"),
        "request_id": result.get("request_id"),
        "created_at": result.get("created_at"),
    }
```

Agents call it like any other skill:
```python
image_result = await agent.call_skill("generate_image", {
    "prompt": "A serene landscape with mountains and a lake",
    "size": "1024x1024"
})
print(image_result["url"])
```

The client handles the entire polling cycle behind the scenes. The agent doesn't need to know about request IDs, status checks, or timeouts.

## Advanced Patterns

**Custom terminal states:**
Some APIs use different status names. Adapt the terminal state set:
```python
final_status = client.wait_for_completion(
    request_id,
    terminal_states={"succeeded", "failed", "timed_out"}
)
```

**Configurable timeouts and intervals:**
Batch processing APIs might need longer waits and slower polling:
```python
client = AsyncAPIClient(
    base_url="...",
    poll_interval=10.0,  # Check every 10 seconds
    max_polls=1440,      # 4 hours max (10s * 1440)
)
```

**Streaming or webhook fallbacks:**
If your API supports webhooks, you can extend this client to register a callback URL and listen instead of polling. Keep the interface the same—only the implementation of `wait_for_completion()` changes.

**Credential rotation:**
Since credentials are loaded at call time, you can rotate keys by updating the JSON file without restarting. The next skill invocation picks up the new key.

## Packaging Notes

**File structure for your skills directory:**
```
skills/image-gen/
  ├── client.py          # The AsyncAPIClient class
  ├── SKILL.md           # Agent-facing skill definition
  └── _meta.json         # Skill metadata (name, version, description)
```

**_meta.json structure:**
```json
{
  "skill_id": "image-gen-v1",
  "name": "Image Generation",
  "version": "1.0.0",
  "description": "Generate images from text prompts",
  "requires": ["python3.8+"],
  "dependencies": [],
  "entry_point": "SKILL.md:generate_image",
  "credentials_required": true,
  "credentials_path": "~/.agent-runtime/credentials.json"
}
```

**Testing without credentials:**
```python
# In test code
client = AsyncAPIClient(
    base_url="http://localhost:8000",  # Local mock server
    credentials_path="/tmp/test-creds.json"
)
```

**Deployment checklist:**
- [ ] Credentials file created and chmod 600
- [ ] Base URL points to the right environment (staging vs production)
- [ ] Poll interval and max_polls tuned for expected job duration
- [ ] Error handling tested (network failures, API errors, timeouts)
- [ ] Skill tested with agent in its actual runtime
- [ ] Credentials rotated before deployment to production

## Why This Matters

Locked-down agent runtimes are becoming standard. Kubernetes pods with no outbound package downloads. Isolated VPCs. Sandboxes. As soon as you deploy beyond your local machine, you hit these constraints.

Building with stdlib only isn't a limitation—it's a superpower. Zero dependencies means:
- Faster cold starts (no install step)
- Smaller container images
- No supply chain risk from transitive dependencies
- Works in the most restricted environments

Once you've built this pattern, you can use it for any queue-based API. Inference endpoints, document processors, 3D renderers, video generation—anything with a submit→poll→fetch shape. Adapt the URLs and status field names, and you're done.

The key is internalising the pattern: one class, one polling loop, one error handler, unlimited reuse.
