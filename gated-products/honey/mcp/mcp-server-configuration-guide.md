---
title: "MCP Server Configuration Guide: From Development to Production"
author: Melisia Archimedes
collection: C4 Infrastructure
tier: honey
price: 79
version: 1.0
last_updated: 2026-03-09
audience: developers
hive_doctrine_id: HD-1101
sources_researched: [MCP specification v2025-11-25, SDK documentation, production deployment guides, security best practices, OAuth 2.1 specs]
word_count: 6122
---

# MCP Server Configuration Guide: From Development to Production

The Model Context Protocol has become the de facto standard for extending Claude and other language models with custom capabilities. Yet most documentation treats MCP as either a trivial addition or a mysterious black box. This guide fills that gap: it's the practical resource you wish existed when you first tried to move an MCP server from your laptop to production.

Building an MCP server is straightforward in theory: define tools, expose resources, handle requests. But moving from "it works on my laptop" to "it runs reliably in production handling 1000 requests per minute" requires discipline in multiple areas: authentication, error handling, testing, monitoring, and deployment infrastructure.

The stakes are high. A flaky MCP server can introduce errors into the model's reasoning. Poor error handling can leak sensitive information. Unmonitored memory leaks will cause cascading failures. This guide addresses all of these.

We'll walk the entire lifecycle from zero to deployed, with working code at every step. You'll learn:

- **Core architecture**: the JSON-RPC protocol, capability negotiation, transport options
- **Development workflow**: project structure, testing strategy, hot reloading
- **Security**: OAuth 2.1 authentication, input validation, secret management
- **Resilience**: error handling, retry strategies, circuit breakers
- **Deployment**: Docker, Kubernetes, load balancing, graceful shutdown
- **Operations**: monitoring, logging, alerting, runbooks for common failures
- **Advanced patterns**: tool composition, dynamic registration, versioning

By the end, you'll have a production-hardened MCP server template that scales from a few requests per second to thousands.

---

## 1. MCP Architecture Overview

### Foundation: JSON-RPC 2.0 over Multiple Transports

The Model Context Protocol is built on JSON-RPC 2.0, the battle-tested request-response standard used by Bitcoin, Ethereum, and language server implementations. A client sends a request to a server. The server responds. It's synchronous at the protocol level, though transports can implement async patterns beneath.

Every MCP interaction follows this shape:

```json
{
  "jsonrpc": "2.0",
  "id": "req-12345",
  "method": "resources/list",
  "params": {}
}
```

The server replies:

```json
{
  "jsonrpc": "2.0",
  "id": "req-12345",
  "result": {
    "resources": [
      {
        "uri": "database://products/table1",
        "name": "Products Table",
        "description": "Live product inventory"
      }
    ]
  }
}
```

Or, on error:

```json
{
  "jsonrpc": "2.0",
  "id": "req-12345",
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": { "details": "Database connection failed" }
  }
}
```

This structure seems simple because it is. The power emerges from **capability negotiation**: the client tells the server what it understands, the server responds with what it offers, and they settle on a shared dialect.

### Three Capability Types

An MCP server exposes functionality through three capability types:

**Resources** are documents or data the model can read. They're named by URI and organised hierarchically (like a filesystem). Your server advertises available resources; the client asks to read them. Resources are read-only from the protocol perspective (though your server can implement refresh patterns).

Example: `database://metrics/cpu_usage` might return timeseries data. `file://docs/architecture` might return markdown documentation.

**Tools** are functions the model can invoke with structured inputs. You define the tool's name, description, and input schema (JSON Schema). When called, your server executes logic and returns a structured result. Tools are the workhorse for actions: database queries, API calls, external service integration.

**Prompts** are pre-written instruction templates the client can request and use. Think of them as "canned agent instructions"—the model can ask for a prompt by name, and your server returns the text. Useful for embedding domain expertise or complex workflows into the server.

### Transport Options

MCP supports three transport mechanisms:

**Stdio** is the simplest. The client spawns your server as a subprocess and communicates via stdin/stdout. No network, no authentication plumbing. Perfect for local development and distribution as a single executable. This is how the SDK ships.

**Streamable HTTP** is the modern standard for remote servers. Your server listens on a TCP port, implements OAuth 2.1 authentication (mandatory since March 2025), and speaks JSON-RPC over HTTP POST. The client connects, authenticates, and maintains a session. Supports streaming responses for long-running operations.

**WebSocket** extends HTTP with persistent bidirectional connections. Less common but required for certain deployment topologies (Cloudflare Workers, edge runtimes).

For this guide, we'll focus on stdio development and HTTP production.

---

## 2. Development Environment Setup

### Node.js/TypeScript Foundation

The Model Context Protocol SDK is officially maintained for Node.js. Start here:

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk typescript ts-node @types/node zod

# Create directory structure
mkdir -p src/tools src/resources src/prompts
touch src/server.ts tsconfig.json
```

Configure TypeScript for strict type safety:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

The strict compiler flags catch errors at build time rather than runtime. In production, this saves debugging headaches. For a production MCP server, strict mode is non-negotiable.

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit"
  }
}
```

### Version Management

MCP servers often integrate with systems that have their own versioning requirements. Consider semantic versioning for your server:

- **Major** (1.0.0 → 2.0.0): breaking changes to tool signatures, removed tools, incompatible resource formats
- **Minor** (1.0.0 → 1.1.0): new tools, new resources, new prompts (backward compatible)
- **Patch** (1.0.0 → 1.0.1): bug fixes, security patches, performance improvements

Store the version in `package.json` and surface it in your Initialize response:

```typescript
const packageJson = require("../package.json");

server.setRequestHandler(Initialize, async () => ({
  protocolVersion: "2025-11-25",
  serverInfo: {
    name: "my-server",
    version: packageJson.version
  }
}));
```

This allows clients to detect version mismatches and handle incompatibilities gracefully.

### Python Alternative: FastMCP

If you prefer Python, the FastMCP library (built on FastAPI) offers a similar DX:

```bash
pip install mcp[cli,testing] fastapi uvicorn pydantic
```

FastMCP handles boilerplate, leaving you to decorate functions:

```python
from mcp.server.fastmcp import FastMCP
import httpx

mcp = FastMCP("my-server")

@mcp.tool()
def fetch_data(url: str) -> str:
    """Fetch data from a URL."""
    response = httpx.get(url)
    return response.text
```

Run with `mcp run my_server.py`.

### Project Structure for Scale

As your server grows, organise it:

```
my-mcp-server/
├── src/
│   ├── server.ts              # main entrypoint
│   ├── tools/
│   │   ├── database.ts
│   │   ├── api.ts
│   │   └── index.ts
│   ├── resources/
│   │   ├── docs.ts
│   │   └── metrics.ts
│   ├── prompts/
│   │   └── templates.ts
│   ├── auth/
│   │   └── oauth.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── logging.ts
│   │   └── errors.ts
│   └── config.ts
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── docker-compose.yml
└── Dockerfile
```

Hot reloading during development saves iteration time. With `ts-node`, your changes to `src/` are reflected on restart. For long-running servers, use `nodemon`:

```bash
npm install -D nodemon
npx nodemon --exec ts-node src/server.ts
```

---

## 3. Building Your First Server

### Complete Example: Database Query Server

Here's a working MCP server that exposes database tables as resources and query tools:

```typescript
// src/server.ts
import {
  Server,
  StdioServerTransport,
  Tool,
  TextContent,
  CallToolRequest,
  ListResourcesRequest,
  ReadResourceRequest
} from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";

// In-memory store (replace with real DB connection)
const TABLES = {
  users: [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" }
  ],
  products: [
    { id: 101, name: "Widget", price: 29.99 },
    { id: 102, name: "Gadget", price: 49.99 }
  ]
};

const server = new Server({
  name: "database-server",
  version: "1.0.0"
});

// Define tools with Zod schemas for validation
const QuerySchema = z.object({
  table: z.enum(["users", "products"]),
  filter: z.string().optional()
});

server.setRequestHandler(CallToolRequest, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "query_table") {
    const parsed = QuerySchema.parse(args);
    const table = TABLES[parsed.table as keyof typeof TABLES];

    let results = table;
    if (parsed.filter) {
      // Simple substring filter
      results = table.filter(row =>
        JSON.stringify(row).includes(parsed.filter)
      );
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Declare what tools this server offers
server.setRequestHandler(Tool.List, async () => ({
  tools: [
    {
      name: "query_table",
      description: "Query a database table with optional filtering",
      inputSchema: {
        type: "object" as const,
        properties: {
          table: {
            type: "string",
            enum: ["users", "products"],
            description: "Table name"
          },
          filter: {
            type: "string",
            description: "Optional substring to filter results"
          }
        },
        required: ["table"]
      }
    }
  ]
}));

// Expose tables as resources
server.setRequestHandler(ListResourcesRequest, async () => ({
  resources: [
    {
      uri: "database://users",
      name: "Users Table",
      description: "User accounts and contact info"
    },
    {
      uri: "database://products",
      name: "Products Table",
      description: "Available products and pricing"
    }
  ]
}));

server.setRequestHandler(ReadResourceRequest, async (request) => {
  const { uri } = request.params;

  if (uri === "database://users") {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(TABLES.users, null, 2)
        }
      ]
    };
  }

  if (uri === "database://products") {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(TABLES.products, null, 2)
        }
      ]
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Start the server on stdio
const transport = new StdioServerTransport();
server.connect(transport);
```

Run it: `npm run dev`. The server is now ready to receive requests from an MCP client.

### Input Validation with Zod

Always validate incoming arguments. Zod provides runtime type checking:

```typescript
const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
});

// In your tool handler:
try {
  const validated = CreateUserSchema.parse(args);
  // Safe to use validated.name, validated.email, etc.
} catch (error) {
  throw new Error(`Validation failed: ${error.message}`);
}
```

### Resource Patterns

Resources can be dynamic. For instance, returning different data based on query parameters:

```typescript
server.setRequestHandler(ReadResourceRequest, async (request) => {
  const { uri } = request.params;
  const url = new URL(`http://example.com${uri}`);
  const limit = url.searchParams.get("limit") || "10";

  // Fetch data, apply limit
  return {
    contents: [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify({ data: [], limit })
      }
    ]
  };
});
```

---

## 4. Authentication & Security

### OAuth 2.1 for HTTP Transport

As of March 2025, the MCP spec mandates OAuth 2.1 authentication for all HTTP-based servers. This prevents unauthorised clients from invoking your tools.

Typical flow:

1. **Client requests capabilities** → unauthenticated handshake
2. **Server returns auth requirements** → OAuth 2.1 endpoints
3. **Client performs OAuth flow** → redirects user to your login page, obtains access token
4. **Client includes Bearer token in requests** → `Authorization: Bearer <token>`
5. **Server validates token** → allows tool invocation only if token is valid

Implementation with Express and `jsonwebtoken`:

```typescript
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const SECRET_KEY = process.env.JWT_SECRET || "dev-secret";

// OAuth token endpoint (simplified; use a proper OAuth library in production)
app.post("/auth/token", express.json(), (req, res) => {
  const { client_id, client_secret } = req.body;

  if (client_secret !== process.env.CLIENT_SECRET) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ client_id }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ access_token: token, token_type: "Bearer", expires_in: 3600 });
});

// Middleware to verify Bearer token
function verifyToken(req: any, res: any, next: any) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");

  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Protected MCP endpoint
app.post("/mcp", verifyToken, express.json(), (req, res) => {
  // Handle JSON-RPC request
  res.json({ jsonrpc: "2.0", id: req.body.id, result: {} });
});

app.listen(3000);
```

For production, integrate with a proper OAuth provider (Auth0, Okta, Keycloak) or build on top of Passport.js.

### Rate Limiting and Request Throttling

Protect against abuse:

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests, please try again later."
});

app.use("/mcp", limiter);
```

For tool-specific limits, track per-tool:

```typescript
const toolLimits: { [key: string]: number[] } = {};

function checkToolRate(toolName: string): boolean {
  const now = Date.now();
  const window = now - 60000; // 1 minute

  if (!toolLimits[toolName]) toolLimits[toolName] = [];
  toolLimits[toolName] = toolLimits[toolName].filter(t => t > window);

  if (toolLimits[toolName].length >= 10) return false; // 10 calls/min max

  toolLimits[toolName].push(now);
  return true;
}
```

### Input Sanitisation

Always treat inputs as untrusted. Use parameterised queries for databases:

```typescript
// BAD: vulnerable to SQL injection
const query = `SELECT * FROM users WHERE email = '${args.email}'`;

// GOOD: parameterised
const query = "SELECT * FROM users WHERE email = $1";
db.query(query, [args.email]);
```

For external API calls, validate URLs:

```typescript
import { URL } from "url";

function isSafeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

if (!isSafeUrl(args.url)) {
  throw new Error("Invalid URL");
}
```

### Secret Management

Never hardcode secrets. Use environment variables or a secret manager:

```typescript
const DB_PASSWORD = process.env.DB_PASSWORD;
if (!DB_PASSWORD) {
  throw new Error("DB_PASSWORD not set");
}

// For production, use Doppler, HashiCorp Vault, or AWS Secrets Manager:
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const client = new SecretManagerServiceClient();
const [version] = await client.accessSecretVersion({
  name: `projects/123/secrets/db-password/versions/latest`
});
const secret = version.payload?.data?.toString();
```

---

## 5. Error Handling & Resilience

### Structured Error Responses

The LLM benefits from structured, actionable error messages. Instead of vague errors, provide context:

```typescript
interface ErrorResponse {
  code: number; // JSON-RPC error code
  message: string;
  data?: {
    type: "validation" | "not_found" | "rate_limit" | "internal";
    details?: string;
    retryAfter?: number;
  };
}

function handleToolError(error: any): ErrorResponse {
  if (error instanceof z.ZodError) {
    return {
      code: -32602,
      message: "Invalid params",
      data: {
        type: "validation",
        details: error.errors.map(e => `${e.path}: ${e.message}`).join("; ")
      }
    };
  }

  if (error.code === "ENOTFOUND") {
    return {
      code: -32603,
      message: "Resource not found",
      data: { type: "not_found" }
    };
  }

  if (error.status === 429) {
    return {
      code: -32603,
      message: "Rate limited",
      data: { type: "rate_limit", retryAfter: 60 }
    };
  }

  return {
    code: -32603,
    message: "Internal error",
    data: { type: "internal" }
  };
}
```

### Retry Strategies

Some failures are transient. Implement exponential backoff:

```typescript
async function retryWithBackoff(
  fn: () => Promise<any>,
  maxRetries = 3,
  initialDelayMs = 100
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const delayMs = initialDelayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

// Usage:
const data = await retryWithBackoff(() => fetchFromDatabase());
```

### Circuit Breaker Pattern

If a dependency fails repeatedly, stop calling it for a while:

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: "closed" | "open" | "half-open" = "closed";

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      const timeSinceFailure = Date.now() - (this.lastFailureTime || 0);
      if (timeSinceFailure > 60000) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures > 5) {
        this.state = "open";
      }

      throw error;
    }
  }

  private reset() {
    this.failures = 0;
    this.state = "closed";
  }
}

const breaker = new CircuitBreaker();
try {
  await breaker.call(() => externalApiCall());
} catch (err) {
  // Handle: circuit open, service unavailable, etc.
}
```

### Timeout Handling

Long-running tools should have explicit timeouts:

```typescript
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs)
    )
  ]);
}

// Usage:
const result = await withTimeout(
  expensiveQuery(),
  30000 // 30 second timeout
);
```

---

## 6. Testing Strategy

### Unit Tests for Tool Handlers

Test each tool in isolation with mocked dependencies. This is where the bulk of your test effort should be:

```typescript
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { queryTool } from "./tools/database";

describe("queryTool", () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      query: jest.fn().mockResolvedValue([{ id: 1, name: "Test" }])
    };
  });

  it("returns results for valid table", async () => {
    const result = await queryTool(mockDb, "users");
    expect(result).toEqual([{ id: 1, name: "Test" }]);
    expect(mockDb.query).toHaveBeenCalledWith("SELECT * FROM users");
  });

  it("throws for invalid table", async () => {
    await expect(queryTool(mockDb, "invalid")).rejects.toThrow();
  });

  it("handles database errors gracefully", async () => {
    mockDb.query.mockRejectedValueOnce(new Error("Connection timeout"));
    await expect(queryTool(mockDb, "users")).rejects.toThrow("Connection timeout");
  });

  it("validates input with Zod schemas", async () => {
    const result = await queryTool(mockDb, "users", { filter: "" });
    expect(result).toBeDefined();
  });
});
```

Aim for at least 80% line coverage on tool handlers. Use Istanbul or similar to measure:

```bash
npm install --save-dev jest @types/jest ts-jest istanbul
npx jest --coverage
```

### Integration Tests with Mock Client

Test the full server lifecycle without external dependencies:

```typescript
import { Client, StdioClientTransport } from "@modelcontextprotocol/sdk/client/index.js";
import { spawn, ChildProcess } from "child_process";

describe("MCP Server Integration", () => {
  let client: Client;
  let serverProcess: ChildProcess;

  beforeAll(async () => {
    serverProcess = spawn("npm", ["run", "dev"]);
    const transport = new StdioClientTransport({
      command: "npm",
      args: ["run", "dev"]
    });
    client = new Client({ name: "test-client" });
    await client.connect(transport);

    // Wait for server to initialise
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it("initialises with correct version", async () => {
    const info = await client.initialize();
    expect(info.serverInfo.version).toBeDefined();
  });

  it("lists available tools", async () => {
    const tools = await client.listTools();
    expect(tools.length).toBeGreaterThan(0);
    expect(tools).toContainEqual(
      expect.objectContaining({ name: "query_table" })
    );
  });

  it("executes a tool call", async () => {
    const result = await client.callTool("query_table", { table: "users" });
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });

  it("returns structured errors for invalid input", async () => {
    try {
      await client.callTool("query_table", { table: "nonexistent" });
      fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toMatch(/not found|invalid/i);
    }
  });

  afterAll(async () => {
    await client.close();
    serverProcess.kill();
  });
});
```

### Load Testing

Use `artillery` to simulate realistic user load and identify bottlenecks:

```yaml
# load-test.yml
config:
  target: "http://localhost:3000"
  http:
    timeout: 30
  phases:
    - duration: 30
      arrivalRate: 5
      name: "Ramp up"
    - duration: 60
      arrivalRate: 20
      name: "Sustained load"
    - duration: 30
      arrivalRate: 50
      name: "Peak load"
    - duration: 30
      arrivalRate: 0
      name: "Ramp down"

scenarios:
  - name: "Database Query Workload"
    weight: 7
    flow:
      - post:
          url: "/mcp"
          headers:
            Authorization: "Bearer {{ $randomString(32) }}"
          json:
            jsonrpc: "2.0"
            id: "{{ $uuid() }}"
            method: "tools/call"
            params:
              name: "query_table"
              arguments:
                table: "users"
                filter: "{{ $randomString(10) }}"
          expect:
            - statusCode: 200

  - name: "List Resources"
    weight: 3
    flow:
      - post:
          url: "/mcp"
          headers:
            Authorization: "Bearer {{ $randomString(32) }}"
          json:
            jsonrpc: "2.0"
            id: "{{ $uuid() }}"
            method: "resources/list"
            params: {}
```

Run with: `artillery run load-test.yml --target http://localhost:3000`

Review the HTML report:

```bash
artillery report artillery-report-*.json
```

Target metrics:
- **P95 latency < 2s** for typical tool calls
- **Error rate < 0.5%** under sustained load
- **Memory growth < 10% over 5 minutes** (watch for leaks)

---

## 7. Deployment Patterns

### Local (Stdio) for Development

The simplest path. Your client spawns your server as a subprocess:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/dist/server.js"]
    }
  }
}
```

Perfect for local development and testing.

### Single-Server HTTP Deployment

For small production workloads, a single server instance works:

```typescript
import express from "express";
import { ExpressServerTransport } from "@modelcontextprotocol/sdk/server/express.js";

const app = express();
const transport = new ExpressServerTransport({ app });
server.connect(transport);

app.listen(3000, () => {
  console.log("MCP server listening on port 3000");
});
```

Deploy on Heroku, Render, or Railway:

```bash
# Procfile
web: node dist/server.js
```

Environment variables via `.env`:

```
JWT_SECRET=your-secret-here
DB_URL=postgresql://user:password@db.example.com/dbname
CLIENT_SECRET=client-secret-here
```

### Multi-Server with Load Balancing

For higher load, run multiple instances behind a load balancer (nginx, AWS ALB):

```nginx
upstream mcp_servers {
  server mcp-1.internal:3000;
  server mcp-2.internal:3000;
  server mcp-3.internal:3000;
}

server {
  listen 80;
  server_name mcp.example.com;

  location / {
    proxy_pass http://mcp_servers;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Authorization $http_authorization;
  }
}
```

Ensure your tools are **idempotent** where possible. If a request is retried, it should produce the same result.

### Docker Containerisation

Package your server for container orchestration. A production-grade Dockerfile includes security best practices:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /build
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production image
FROM node:20-alpine

# Run as non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled code from builder
COPY --from=builder --chown=nodejs:nodejs /build/dist ./dist

USER nodejs
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/server.js"]
```

The multi-stage build reduces final image size by excluding TypeScript and build tools. Running as a non-root user (`nodejs`) prevents privilege escalation if the container is compromised.

Build and push to your registry:

```bash
docker build -t mcp-server:1.0.0 .
docker tag mcp-server:1.0.0 registry.example.com/mcp-server:1.0.0
docker push registry.example.com/mcp-server:1.0.0
```

Run locally with environment variables:

```bash
docker run -p 3000:3000 \
  -e JWT_SECRET=your-secret \
  -e DB_URL=postgresql://user:pass@db.example.com/dbname \
  -e LOG_LEVEL=info \
  --memory="512m" \
  --cpus="0.5" \
  registry.example.com/mcp-server:1.0.0
```

The `--memory` and `--cpus` flags prevent runaway resource consumption.

### Kubernetes Deployment

For production on Kubernetes, define a complete deployment with resource requests, probes, and auto-scaling:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mcp-config
data:
  LOG_LEVEL: "info"
  NODE_ENV: "production"
---
apiVersion: v1
kind: Secret
metadata:
  name: mcp-secrets
type: Opaque
stringData:
  JWT_SECRET: "your-jwt-secret-here"
  DB_URL: "postgresql://user:pass@db.example.com/dbname"
  CLIENT_SECRET: "your-client-secret"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-server
  labels:
    app: mcp-server
    version: "1.0.0"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: mcp-server
  template:
    metadata:
      labels:
        app: mcp-server
    spec:
      serviceAccountName: mcp-server
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: mcp-server
        image: registry.example.com/mcp-server:1.0.0
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        env:
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: mcp-config
              key: LOG_LEVEL
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: mcp-config
              key: NODE_ENV
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: mcp-secrets
              key: JWT_SECRET
        - name: DB_URL
          valueFrom:
            secretKeyRef:
              name: mcp-secrets
              key: DB_URL
        - name: CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: mcp-secrets
              key: CLIENT_SECRET
        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 30
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 2
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
              - ALL
        volumeMounts:
        - name: tmp
          mountPath: /tmp
      volumes:
      - name: tmp
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: mcp-server
  labels:
    app: mcp-server
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: mcp-server
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mcp-server
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mcp-server
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

Key production patterns:

- **Resource requests/limits**: prevent noisy neighbors and ensure predictable scaling
- **Rolling updates**: zero-downtime deployments (maxSurge: 1, maxUnavailable: 0)
- **Liveness/readiness probes**: Kubernetes restarts unhealthy pods automatically
- **HorizontalPodAutoscaler**: scales from 3 to 10 replicas based on CPU/memory
- **SecurityContext**: runs as non-root, read-only filesystem (except `/tmp`), drops all capabilities
- **ConfigMaps and Secrets**: separates configuration from image, enables rapid re-deployment

### Cloudflare Workers for Serverless

Deploy your MCP server on Cloudflare Workers with minimal infrastructure:

```typescript
// src/index.ts
import { Hono } from "hono";

const app = new Hono();

app.post("/mcp", async (c) => {
  const request = await c.req.json();

  // Handle JSON-RPC request
  return c.json({
    jsonrpc: "2.0",
    id: request.id,
    result: { /* response */ }
  });
});

export default app;
```

Deploy with Wrangler:

```bash
wrangler publish
```

Workers scale automatically and require no server management.

---

## 8. Production Monitoring and Observability

### Health Checks

Expose two separate health check endpoints: liveness and readiness. Kubernetes uses these to manage the pod lifecycle.

```typescript
import express from "express";

const app = express();
let isShuttingDown = false;

// Liveness probe: is the process alive?
app.get("/health", (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: "shutting_down" });
  }

  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: packageJson.version
  });
});

// Readiness probe: can it handle traffic?
app.get("/ready", async (req, res) => {
  try {
    if (isShuttingDown) {
      return res.status(503).json({ ready: false, reason: "shutting_down" });
    }

    // Check critical dependencies
    await Promise.race([
      db.query("SELECT 1"),
      new Promise((_, r) => setTimeout(() => r(new Error("timeout")), 2000))
    ]);

    res.json({ ready: true });
  } catch (err) {
    res.status(503).json({
      ready: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  isShuttingDown = true;
  console.log("SIGTERM received, draining requests...");

  // Stop accepting new requests
  server.close(async () => {
    // Close database connections
    await db.close();
    process.exit(0);
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    console.error("Forced exit after graceful shutdown timeout");
    process.exit(1);
  }, 30000);
});
```

Return HTTP 503 (Service Unavailable) during shutdown so load balancers remove the pod from rotation.

### Structured Logging

Structured logs (JSON format) enable grep-friendly filtering and downstream log aggregation:

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: "mcp-server",
    version: packageJson.version,
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 10
    })
  ]
});

// Instrument all tool calls
server.setRequestHandler(CallToolRequest, async (request) => {
  const { name, arguments: args } = request.params;
  const requestId = request.id || crypto.randomUUID();
  const startTime = Date.now();

  logger.info("Tool called", {
    requestId,
    toolName: name,
    argumentsHash: crypto.createHash("sha256").update(JSON.stringify(args)).digest("hex"),
    timestamp: new Date().toISOString()
  });

  try {
    const result = await invokeTool(name, args);
    const duration = Date.now() - startTime;

    logger.info("Tool succeeded", {
      requestId,
      toolName: name,
      duration,
      resultSize: JSON.stringify(result).length
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error("Tool failed", {
      requestId,
      toolName: name,
      duration,
      error: error.message,
      stack: error.stack
    });

    throw error;
  }
});
```

Log levels:
- **error**: tool execution failures, authentication errors, database connection loss
- **warn**: slow operations (P95 > 2s), rate limit approaching, deprecated feature usage
- **info**: successful tool calls, server startup, configuration changes
- **debug**: tool arguments, detailed state transitions, cache hits/misses

### OpenTelemetry for Distributed Tracing

For complex systems with multiple services, distributed tracing connects logs across boundaries:

```typescript
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "mcp-server",
    [SemanticResourceAttributes.SERVICE_VERSION]: packageJson.version
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces"
  }),
  instrumentations: [getNodeAutoInstrumentations()]
});

otelSDK.start();

// Automatic instrumentation now tracks HTTP, database, and other operations
```

Every HTTP request, database query, and tool invocation is automatically traced. Queries like "show me all requests that took > 5s" become trivial.

### Alert Thresholds

Set up alerts in Prometheus, Datadog, or similar:

```yaml
groups:
  - name: mcp-server
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(mcp_tool_errors_total[5m]) > 0.05
        annotations:
          summary: "Error rate > 5%"

      - alert: SlowP95Latency
        expr: histogram_quantile(0.95, mcp_tool_duration_seconds_bucket) > 5
        annotations:
          summary: "P95 latency > 5 seconds"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes{pod=~"mcp-server.*"} / container_spec_memory_limit_bytes > 0.8
        annotations:
          summary: "Memory usage > 80% of limit"

      - alert: FrequentTimeouts
        expr: increase(mcp_tool_timeouts_total[1h]) > 10
        annotations:
          summary: "More than 10 timeouts in the last hour"
```

---

## 9. Advanced Patterns and Operational Excellence

### Multi-Tool Composition

Chain tools together for complex workflows. This pattern is essential when a single tool call isn't sufficient:

```typescript
server.setRequestHandler(CallToolRequest, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "build_report") {
    try {
      // Composite tool: chains other tools, handles failures gracefully
      const userData = await retryWithBackoff(() =>
        this.callTool("fetch_users", { id: args.userId })
      );

      const metrics = await retryWithBackoff(() =>
        this.callTool("fetch_metrics", { userId: args.userId })
      );

      const summary = await withTimeout(
        this.callTool("summarize", { data: metrics }),
        10000
      );

      return {
        content: [{
          type: "text",
          text: `Report for ${userData.name}:\n\n${summary}`
        }]
      };
    } catch (error) {
      // Partial failure: return what we have
      return {
        content: [{
          type: "text",
          text: `Report generation failed: ${error.message}`
        }]
      };
    }
  }
});
```

Key principle: composite tools should be resilient to individual tool failures. Consider partial results.

### Dynamic Tool Registration

Register tools at runtime based on feature flags, environment, or discovered capabilities. This enables safe rollout of new tools:

```typescript
const toolRegistry: Map<string, Tool> = new Map();
const toolHandlers: Map<string, Function> = new Map();

function registerTool(name: string, definition: Tool, handler: Function) {
  // Validate name uniqueness
  if (toolRegistry.has(name)) {
    throw new Error(`Tool '${name}' already registered`);
  }

  toolRegistry.set(name, definition);
  toolHandlers.set(name, handler);

  logger.info("Tool registered", { name, version: definition.meta?.version });
}

// Conditional registration based on feature flags
if (process.env.ENABLE_BETA_TOOLS === "true") {
  registerTool("experimental_tool", betaToolDef, betaToolHandler);
}

// Load plugins at startup
async function loadPlugins() {
  const pluginDir = process.env.PLUGIN_DIR || "./plugins";
  const files = await fs.promises.readdir(pluginDir);

  for (const file of files) {
    if (!file.endsWith(".js")) continue;
    const plugin = await import(path.join(pluginDir, file));
    plugin.register(registerTool);
  }
}

await loadPlugins();

server.setRequestHandler(Tool.List, async () => ({
  tools: Array.from(toolRegistry.values())
}));

server.setRequestHandler(CallToolRequest, async (request) => {
  const { name, arguments: args } = request.params;

  if (!toolHandlers.has(name)) {
    throw new Error(`Unknown tool: ${name}`);
  }

  return await toolHandlers.get(name)!(args);
});
```

This pattern enables A/B testing, gradual rollouts, and zero-downtime tool updates.

### Versioning and Deprecation Strategy

Signal capability changes transparently:

```typescript
server.setRequestHandler(Initialize, async () => ({
  protocolVersion: "2025-11-25",
  capabilities: {
    resources: {},
    tools: {},
    prompts: {}
  },
  serverInfo: {
    name: "my-server",
    version: packageJson.version
  },
  meta: {
    deprecations: [
      {
        tool: "old_query_tool",
        message: "Use 'query_table' instead (available since 1.5.0)",
        sunsetDate: "2026-06-01",
        replacement: "query_table"
      }
    ],
    compatibility: {
      minClientVersion: "2.0.0",
      recommendedClientVersion: "2.1.0"
    }
  }
}));
```

Include sunset dates. Clients can warn users about deprecated tools months before removal.

### Tool Annotations for Safety

Tag tools to indicate risk level and constraints. The client and user can use these hints:

```typescript
{
  name: "delete_resource",
  description: "Permanently delete a resource. This action cannot be undone.",
  inputSchema: {
    type: "object",
    properties: {
      resource_id: { type: "string" },
      confirm: { type: "boolean" }
    },
    required: ["resource_id", "confirm"]
  },
  meta: {
    destructive: true,
    requiresConfirmation: true,
    undoable: false,
    riskLevel: "critical",
    auditLogged: true,
    example: {
      description: "Delete a user account",
      arguments: { resource_id: "user-123", confirm: true }
    }
  }
}
```

---

## 10. Operational Runbooks

### Troubleshooting High Error Rates

When error rate exceeds 5%, follow this checklist:

1. **Check health endpoint**: `curl http://localhost:3000/health`
   - If unhealthy, check logs for startup errors
   - Verify environment variables are set correctly
   - Check database connectivity

2. **Identify failing tool**: grep error logs for tool name
   ```bash
   grep '"toolName":' logs/error.log | grep -oP '"toolName":"[^"]*"' | sort | uniq -c
   ```

3. **Check recent deployments**: if error rate spiked after a deploy, rollback
   ```bash
   kubectl rollout undo deployment/mcp-server
   ```

4. **Monitor dependent services**: database, external APIs
   ```bash
   # Check DB connectivity
   psql $DB_URL -c "SELECT 1;"

   # Check external API health
   curl https://api.external-service.com/health
   ```

5. **Scale up and investigate**: if under heavy load, temporarily increase replicas while investigating
   ```bash
   kubectl scale deployment mcp-server --replicas=5
   ```

### Handling Memory Leaks

Memory growth over time indicates a leak:

1. **Get baseline**: note memory usage on a fresh pod
2. **Generate load**: run your load test for 5+ minutes
3. **Inspect heap**: Node.js has built-in heap snapshots
   ```bash
   kubectl exec -it pod/mcp-server-abc123 -- kill -USR2 1
   # Generates heapdump file in the container
   ```

4. **Check for circular references**: use clinodejs or similar to analyze the heap dump
5. **Common culprits**:
   - Event listeners not cleaned up
   - Caches without eviction
   - Timers that never fire
   - Streams that never close

### Rapid Rollback

If a deployment is causing widespread issues:

```bash
# View rollout history
kubectl rollout history deployment/mcp-server

# Rollback to previous version
kubectl rollout undo deployment/mcp-server

# Rollback to specific version
kubectl rollout undo deployment/mcp-server --to-revision=2

# Monitor rollback progress
kubectl rollout status deployment/mcp-server
```

Rollback should take < 1 minute if your health checks are configured correctly.

---

## 11. Dependency Management and Security

### Managing Dependencies at Scale

Your MCP server will accumulate dependencies. Managing them is critical for security and stability.

**Lock dependencies strictly.** Use `npm ci` (clean install) in production, never `npm install`:

```dockerfile
# In Dockerfile
COPY package*.json ./
RUN npm ci --only=production  # Uses package-lock.json exactly
```

This ensures every deployment runs the exact same dependency versions, preventing subtle bugs from transitive dependency updates.

**Audit for vulnerabilities regularly:**

```bash
# Check for known vulnerabilities in dependencies
npm audit

# Fix vulnerabilities automatically where possible
npm audit fix

# In CI/CD, fail the build on vulnerabilities
npm audit --audit-level=moderate
```

Configure your CI/CD to run `npm audit` on every pull request:

```yaml
# .github/workflows/security.yml
name: Security Audit
on: [pull_request, push]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm audit --audit-level=high
      - run: npm test
```

**Keep dependencies up to date.** Outdated dependencies are a security risk. Use Dependabot (GitHub) or Renovate to automatically create pull requests for updates:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    allow:
      - dependency-type: "all"
    reviewers:
      - "your-username"
    commit-message:
      prefix: "chore(deps):"
```

Test each dependency update in CI before merging.

### Container Image Security

Build minimal images without unnecessary tools. The smaller the attack surface, the better:

```dockerfile
# Remove build tools and unnecessary packages
FROM node:20-alpine

RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Don't run as root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs
```

Scan your images for vulnerabilities before pushing:

```bash
# Using Trivy (free, open-source)
trivy image registry.example.com/mcp-server:1.0.0

# Using Docker Scout
docker scout cves registry.example.com/mcp-server:1.0.0
```

Automate this in your CI/CD pipeline:

```yaml
# .github/workflows/image-security.yml
name: Container Image Security
on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### Secrets Management in Production

Never hardcode secrets. Use environment variables, but store them securely:

- **Development**: use `.env` files (add to `.gitignore`)
- **Staging/Production**: use a secrets manager (AWS Secrets Manager, HashiCorp Vault, Doppler, 1Password)

Example with AWS Secrets Manager:

```typescript
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

async function getSecret(secretName: string): Promise<string> {
  const client = new SecretManagerServiceClient();

  const name = client.secretVersionPath(
    process.env.GCP_PROJECT_ID!,
    secretName,
    "latest"
  );

  const [version] = await client.accessSecretVersion({ name });
  return version.payload?.data?.toString() || "";
}

// Usage
const jwtSecret = await getSecret("jwt-secret");
const dbUrl = await getSecret("database-url");
```

In Kubernetes, use native Secret resources:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mcp-secrets
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  DB_URL: <base64-encoded-url>
```

Mount them into your pod:

```yaml
env:
- name: JWT_SECRET
  valueFrom:
    secretKeyRef:
      name: mcp-secrets
      key: JWT_SECRET
```

### API Rate Limiting and DDoS Mitigation

Protect your public endpoints from abuse:

```typescript
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "redis";

const redisClient = redis.createClient({ host: "localhost", port: 6379 });

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: "rl:"
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  keyGenerator: (req) => req.ip, // by IP address
  skip: (req) => req.user?.isAdmin, // skip for admin users
  message: "Too many requests, please try again later."
});

app.use("/mcp", limiter);

// Per-tool rate limiting
const toolLimiters: { [key: string]: any } = {};

function getToolLimiter(toolName: string) {
  if (!toolLimiters[toolName]) {
    toolLimiters[toolName] = rateLimit({
      windowMs: 60 * 1000,
      max: 10, // 10 calls per minute
      keyGenerator: (req) => req.ip + ":" + toolName
    });
  }
  return toolLimiters[toolName];
}

server.setRequestHandler(CallToolRequest, async (request) => {
  const { name } = request.params;

  // Rate limit per tool
  const limiter = getToolLimiter(name);
  const rateLimitResult = await new Promise((resolve) => {
    limiter(request.req, request.res, resolve);
  });

  if (request.res.statusCode === 429) {
    throw new Error("Rate limit exceeded");
  }

  // Continue with tool execution
  return await invokeTool(name, request.params.arguments);
});
```

---

## Closing Thoughts

MCP servers are straightforward to build once you understand the architecture. The difficulty lies not in the protocol, but in the surrounding disciplines: authentication, error handling, monitoring, and deployment.

Start local. Test thoroughly. Deploy to a single server. Monitor carefully. Scale when you hit limits—not before.

The resources linked throughout this guide (specification, SDKs, community examples) form a solid foundation. What you're building next will become part of that foundation for others. Build with care.

---

## Quick Reference

**Stdio Server** (development):
```bash
npm run dev
```

**HTTP Server** (production):
```bash
npm run build && npm start
```

**Docker**:
```bash
docker build -t mcp-server . && docker run -p 3000:3000 mcp-server
```

**Test**:
```bash
npm test
```

**Load Test**:
```bash
artillery run load-test.yml
```

**Validate with Client**:
```bash
mcp client <server-config-json>
```

---

## Related Resources

- **pollen tier**: MCP Tool Design Patterns (HD-1102)
- **honey tier**: HTTP Server Deployment on Kubernetes (HD-1103)
- **honey tier**: OAuth 2.1 Integration Guide (HD-1104)
- **MCP Specification**: https://modelcontextprotocol.io/specification
- **SDK Documentation**: https://github.com/modelcontextprotocol/python-sdk

