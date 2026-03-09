---
title: "Complete MCP Server Starter Kit"
author: Melisia Archimedes
collection: C4 Infrastructure
tier: nectar
price: 99
version: 1.0
last_updated: 2026-03-09
audience: agent_developers
hive_doctrine_id: HD-1203
sources_researched: ["MCP specification v2025-11-25", "MCP SDK documentation", "production MCP server examples", "OAuth 2.1 for MCP", "deployment patterns", "agent security standards"]
word_count: 8237
---

# Complete MCP Server Starter Kit

## What You're Getting

This kit is your blueprint for building production-grade MCP servers from scratch. Whether you're exposing internal tools to agents, wrapping external APIs, querying databases, or managing file systems, you'll find templates, architecture patterns, and deployment playbooks here.

The Model Context Protocol (MCP) is the interface layer between autonomous agents and the systems they need to control. An MCP server is the service you build to make those integrations happen. This kit gives you five complete server templates, authentication patterns, testing frameworks, and a deployment matrix covering localhost to cloud.

**Who should use this:** Agent developers, platform engineers, and infrastructure architects building systems that autonomous agents need to interact with.

---

## 1. Architecture Overview

### What is an MCP Server?

An MCP server is a service that speaks the Model Context Protocol. Clients (agents, chat interfaces, other tooling) connect to your server and ask it what it can do. You tell them via capability declarations. They invoke those capabilities. You process the request and return structured results.

The protocol is transport-agnostic:
- **Stdio:** Standard input/output, used for local development and tight coupling. The parent process (e.g., an agent runtime) spawns the MCP server as a subprocess and communicates via stdin/stdout. This is the simplest option for local integrations.
- **HTTP+SSE:** HTTP for request, Server-Sent Events for response streaming, used for web deployment. Clients send requests to an HTTP endpoint. The server responds with Server-Sent Events for streaming results. This transport is stateless and works well behind load balancers.
- **Streamable HTTP:** Bidirectional streaming over HTTP/2+, used for high-throughput systems. Full-duplex communication over a single TCP connection. Ideal for real-time data pipelines.

Each transport has different security, performance, and deployment implications. Stdio is simplest but limited to local deployment. HTTP+SSE scales better but requires careful authentication. Streamable HTTP is the most efficient but requires HTTP/2 support throughout your infrastructure.

### MCP Capability Types

Every MCP server exposes one or more of these:

**Tools** — Functions the agent can call. Each tool has:
- A name (e.g., `query_database`)
- An input schema (JSON Schema defining parameters)
- A description
- An invocation handler

Tools are stateless. The agent calls them, you process, you return a result. The agent decides what to do next.

**Resources** — Read-only data the agent can fetch. Each resource has:
- A URI (e.g., `file://data/config.json`)
- A MIME type (text/plain, application/json, etc.)
- A description
- A fetch handler

Resources are for exposing data, not functions. Use them for configuration, reference material, or large documents the agent should read into context.

**Prompts** — Reusable prompt templates the agent can invoke. Each prompt has:
- A name (e.g., `code_review_prompt`)
- Parameters it accepts
- A generation handler that returns the expanded prompt text

Prompts let you codify domain expertise. Instead of the agent writing the prompt from scratch, it calls your server to get a pre-tuned prompt for the task.

### Server Lifecycle

1. **Discovery:** Agent connects and asks "What can you do?" Server responds with capability list. This typically happens once when the connection is established. The response includes tool schemas, resource URIs, and prompt templates.
2. **Invocation:** Agent selects a tool/resource/prompt and sends request with parameters. The request includes the capability name and a parameters object matching the declared schema.
3. **Processing:** Server validates input, executes logic, handles errors. This includes checking that parameters conform to the schema, applying rate limits or permission gates, and executing business logic.
4. **Response:** Server returns structured result (tool output, resource data, or expanded prompt). Results are serialized as JSON and may include metadata like execution time or cache status.
5. **Cleanup:** Connection closes or server shuts down gracefully. Resources are released, file handles closed, database connections returned to pool.

The typical request-response flow is synchronous within a single tool invocation, but multiple tools may be called in sequence. A single agent task may trigger dozens of tool calls across multiple server connections.

---

## 2. Template 1: Basic Tool Server

This is the simplest server. It exposes three tools and handles the full discovery and invocation lifecycle.

```
PSEUDOCODE: BASIC MCP TOOL SERVER

// Server initialization
Initialize MCP Server
  Set name = "example-tool-server"
  Set version = "1.0.0"
  Register transport (stdio or HTTP+SSE)

// Tool declarations
Define tool "add_numbers"
  Input schema: {type: object, properties: {a: {type: number}, b: {type: number}}}
  Description: "Adds two numbers and returns the sum"

Define tool "format_text"
  Input schema: {type: object, properties: {text: {type: string}, style: {type: string, enum: ["uppercase", "lowercase", "title"]}}}
  Description: "Formats text according to specified style"

Define tool "get_system_info"
  Input schema: {type: object, properties: {detail_level: {type: string, enum: ["basic", "full"]}}}
  Description: "Returns system information"

// Discovery handler (agent asks "what can you do?")
On receive discovery request:
  Respond with:
    - Server name and version
    - List of available tools with schemas and descriptions
    - Supported resources (if any)
    - Supported prompts (if any)

// Tool invocation handlers
On receive tool invocation "add_numbers":
  Extract parameters a and b from request
  Validate that both are numbers
  If validation fails:
    Return error object {error: "Invalid input", message: "Both a and b must be numbers"}
  Else:
    Calculate sum = a + b
    Return result {success: true, output: sum}

On receive tool invocation "format_text":
  Extract parameters text and style
  Validate that text is non-empty string
  Validate that style is one of: uppercase, lowercase, title
  If validation fails:
    Return error object with validation details
  Else:
    formatted = apply(style, text)
    Return result {success: true, output: formatted}

On receive tool invocation "get_system_info":
  Extract parameter detail_level
  If detail_level == "basic":
    Gather: OS type, CPU count, memory available
  Else:
    Gather: OS type, CPU count, memory, disk, network, running processes
  Return result {success: true, output: system_info}

// Error handling (global)
On any uncaught error:
  Log error with stack trace to stderr
  Return error response {error: "Internal server error", request_id: uuid()}

// Graceful shutdown
On receive SIGTERM or SIGINT:
  Log "Server shutting down"
  Close all client connections
  Release resources
  Exit with code 0
```

**What this template covers:**
- Server initialization and naming
- Tool discovery protocol
- Input validation with JSON Schema
- Error handling with structured responses
- Graceful shutdown

---

## 3. Template 2: Database Query Server

This server exposes a read-only database as queryable tools, with an optional write capability behind a permission gate.

```
PSEUDOCODE: DATABASE QUERY MCP SERVER

// Configuration
Config:
  database_path = "data/business.db"
  max_query_size = 5000  // characters
  query_timeout = 30     // seconds
  allowed_tables = ["products", "customers", "orders"]
  write_permission_token = environment("DB_WRITE_TOKEN")
  enable_write_mode = write_permission_token != null

// Database connection pool
Connection pool:
  max_connections = 10
  idle_timeout = 300 seconds
  Initialize pool at server start

// Tool declarations
Define tool "query_database"
  Input schema: {
    type: object,
    properties: {
      sql: {type: string, description: "SQL query (SELECT only)"},
      params: {type: array, description: "Query parameters for bound statements"}
    },
    required: ["sql"]
  }
  Description: "Execute a read-only SELECT query against the database"

Define tool "list_tables"
  Input schema: {}
  Description: "List all accessible tables and their schemas"

Define tool "write_database" (conditional, only if write enabled)
  Input schema: {
    type: object,
    properties: {
      sql: {type: string},
      params: {type: array},
      auth_token: {type: string, description: "Write permission token"}
    },
    required: ["sql", "auth_token"]
  }
  Description: "Execute INSERT/UPDATE/DELETE (requires valid auth token)"

// SQL injection prevention
Function sanitize_query(sql_string, allowed_tables_list):
  // Parse SQL to identify table names
  parsed_tables = extract_table_names(sql_string)

  For each table in parsed_tables:
    If table not in allowed_tables_list:
      Throw error "Access denied to table: {table}"

  // Verify query is SELECT only (for read tool)
  If not sql_string.uppercase().starts_with("SELECT"):
    Throw error "Only SELECT queries allowed"

  // Check for comment injection
  If sql_string contains "--" or "/*" or "*/":
    Throw warning "SQL comments detected"

  Return true

// Tool handlers
On receive "query_database":
  Extract sql and params from request

  Validate:
    If sql length > max_query_size:
      Return error "Query exceeds maximum length"
    Call sanitize_query(sql, allowed_tables)
    If params is array:
      Verify params count matches placeholders in sql

  Get connection from pool:
    Set timeout to query_timeout
    Execute prepared statement with params (prevents injection)
    Collect result rows
    Return on timeout: error "Query timeout exceeded"

  Transform results:
    Convert rows to JSON array
    Include column names and types

  Release connection back to pool
  Return {success: true, row_count: count, data: results}

On receive "list_tables":
  Query database schema information
  Filter to allowed_tables only
  For each table:
    Get column names and types

  Return {success: true, tables: schema_info}

On receive "write_database" (if enabled):
  Extract sql, params, auth_token

  If not auth_token matches write_permission_token:
    Log security event "Invalid write token attempt"
    Return error "Authentication failed"

  If not (sql.starts_with("INSERT") or starts_with("UPDATE") or starts_with("DELETE")):
    Return error "Only INSERT/UPDATE/DELETE allowed in write mode"

  Call sanitize_query (adapted for write mode)

  Get connection from pool
  Begin transaction:
    Execute prepared statement with params
    Commit transaction
    Log audit entry {timestamp, token, sql, rows_affected}

  On error during transaction:
    Rollback transaction
    Log error
    Return error response

  Return {success: true, rows_affected: count}

// Connection pooling and cleanup
On server shutdown:
  For each open connection in pool:
    Close connection
  Flush audit log to disk
```

**Key patterns:**
- Parameterized queries to prevent SQL injection
- Query whitelisting by allowed tables
- Write mode gating behind token authentication
- Connection pooling for efficiency
- Audit logging for all write operations

---

## 4. Template 3: API Gateway Server

This server wraps external REST/GraphQL APIs as MCP tools, adding rate limiting, caching, and authentication pass-through.

```
PSEUDOCODE: API GATEWAY MCP SERVER

// Configuration
Config:
  upstream_api_base_url = environment("API_BASE_URL")
  upstream_api_key = environment("API_KEY")
  rate_limit_requests = 100
  rate_limit_window = 60  // seconds
  cache_ttl = 300  // seconds
  cache_max_size = 100  // entries
  timeout = 15  // seconds

// Rate limiter
Rate limiter:
  requests_by_client = {}  // client_id -> [timestamps]

  Function should_allow_request(client_id):
    current_time = now()
    window_start = current_time - rate_limit_window

    // Purge old requests
    requests_by_client[client_id] = filter requests after window_start

    count = length(requests_by_client[client_id])
    If count >= rate_limit_requests:
      Return false, retry_after = rate_limit_window - (current_time - requests_by_client[client_id][0])

    // Record this request
    requests_by_client[client_id].append(current_time)
    Return true, retry_after = null

// Response cache
Cache:
  entries = {}  // cache_key -> {data, timestamp}

  Function get_cache_key(endpoint, params):
    Return hash(endpoint + serialize(params))

  Function get(cache_key):
    If cache_key in entries:
      entry = entries[cache_key]
      age = now() - entry.timestamp
      If age < cache_ttl:
        Return entry.data
    Return null

  Function set(cache_key, data):
    If length(entries) >= cache_max_size:
      // Evict least recently used
      oldest_key = find key with oldest timestamp
      Delete entries[oldest_key]

    entries[cache_key] = {data: data, timestamp: now()}

// Tool declarations
Define tool "api_call"
  Input schema: {
    type: object,
    properties: {
      endpoint: {type: string, description: "/users/{id}, /products?category=books"},
      method: {type: string, enum: ["GET", "POST", "PUT", "DELETE"]},
      body: {type: object, description: "Request body for POST/PUT"},
      cache_override: {type: boolean, description: "Skip cache and fetch fresh"}
    },
    required: ["endpoint", "method"]
  }
  Description: "Call the upstream REST API"

Define tool "graphql_query"
  Input schema: {
    type: object,
    properties: {
      query: {type: string, description: "GraphQL query string"},
      variables: {type: object},
      operation_name: {type: string}
    },
    required: ["query"]
  }
  Description: "Execute a GraphQL query against the upstream API"

// Tool handlers
On receive "api_call":
  Extract endpoint, method, body, cache_override
  client_id = request.client_id  // from connection context

  // Rate limiting
  allowed, retry_after = should_allow_request(client_id)
  If not allowed:
    Return error {error: "Rate limit exceeded", retry_after: retry_after}

  // Caching (GET requests only)
  cache_key = get_cache_key(endpoint, {method: method, body: body})
  If method == "GET" and not cache_override:
    cached_data = cache.get(cache_key)
    If cached_data != null:
      Return {success: true, data: cached_data, from_cache: true}

  // Build upstream request
  full_url = upstream_api_base_url + endpoint
  headers = {
    "Authorization": "Bearer " + upstream_api_key,
    "Content-Type": "application/json",
    "User-Agent": "MCP-API-Gateway/1.0"
  }

  // Execute with timeout
  Try:
    Set request timeout to timeout seconds
    response = make_http_request(method, full_url, headers, body)

    If response.status_code >= 400:
      error_detail = response.body
      Return error {error: "Upstream API error", status: response.status_code, detail: error_detail}

    result = parse_json(response.body)

    // Cache successful responses
    If method == "GET":
      cache.set(cache_key, result)

    Return {success: true, data: result, from_cache: false}

  Catch timeout_error:
    Return error {error: "Upstream API timeout", timeout_seconds: timeout}

  Catch network_error:
    Return error {error: "Network error connecting to upstream API"}

On receive "graphql_query":
  Extract query, variables, operation_name
  client_id = request.client_id

  // Rate limiting
  allowed, retry_after = should_allow_request(client_id)
  If not allowed:
    Return error {error: "Rate limit exceeded", retry_after: retry_after}

  // Cache key includes query hash
  cache_key = hash(query + serialize(variables))
  cached_data = cache.get(cache_key)
  If cached_data != null:
    Return {success: true, data: cached_data, from_cache: true}

  // Build GraphQL request
  full_url = upstream_api_base_url + "/graphql"
  request_body = {
    query: query,
    variables: variables,
    operationName: operation_name
  }
  headers = {
    "Authorization": "Bearer " + upstream_api_key,
    "Content-Type": "application/json"
  }

  Try:
    response = make_http_request("POST", full_url, headers, request_body)
    result = parse_json(response.body)

    // Check for GraphQL errors
    If result.errors exists and length > 0:
      Return {success: false, errors: result.errors, data: result.data}

    // Cache on success
    cache.set(cache_key, result.data)
    Return {success: true, data: result.data, from_cache: false}

  Catch error as e:
    Return error {error: "GraphQL request failed", message: e.message}

// Health check
Define tool "health_check" (optional, for monitoring)
  Input schema: {}
  Description: "Check upstream API connectivity"

  Try:
    response = make_http_request("GET", upstream_api_base_url + "/health", headers)
    If response.status_code == 200:
      Return {success: true, upstream_status: "healthy"}
    Else:
      Return {success: false, upstream_status: "unhealthy", status_code: response.status_code}
  Catch:
    Return {success: false, upstream_status: "unreachable"}
```

**Key patterns:**
- Rate limiting per client to prevent abuse
- Response caching with TTL and LRU eviction
- Parameterized routing to upstream APIs
- Authentication header injection
- Timeout and error handling
- Support for REST and GraphQL

---

## 5. Template 4: File System Server

This server provides file read/write/search capabilities, sandboxed to specific directories with audit logging.

```
PSEUDOCODE: FILE SYSTEM MCP SERVER

// Configuration
Config:
  sandbox_root = environment("SANDBOX_ROOT", default: "/data/files")
  max_file_size = 100 * 1024 * 1024  // 100 MB
  allowed_extensions = [".txt", ".md", ".json", ".yaml", ".csv", ".log"]
  audit_log_path = "audit/filesystem.log"
  enable_write = true

// Path validation
Function validate_path(requested_path):
  // Resolve symlinks and normalize
  real_path = resolve_symlinks_and_normalize(requested_path)
  sandbox_real = resolve_symlinks_and_normalize(sandbox_root)

  // Ensure path is within sandbox (prevent directory traversal)
  If not real_path.starts_with(sandbox_real):
    Throw error "Access denied: path outside sandbox"

  // Check file extension if file
  If is_file(real_path):
    extension = get_file_extension(real_path)
    If extension not in allowed_extensions:
      Throw error "File type not allowed"

  Return real_path

Function audit_log(operation, path, user_id, success, details):
  entry = {
    timestamp: now_iso8601(),
    operation: operation,
    path: path,
    user_id: user_id,
    success: success,
    details: details
  }
  Append entry to audit_log_path as JSON line
  Log to stderr as well

// Tool declarations
Define tool "read_file"
  Input schema: {
    type: object,
    properties: {
      path: {type: string, description: "Path relative to sandbox root"},
      encoding: {type: string, enum: ["utf-8", "base64"], default: "utf-8"}
    },
    required: ["path"]
  }
  Description: "Read file contents"

Define tool "write_file"
  Input schema: {
    type: object,
    properties: {
      path: {type: string},
      content: {type: string},
      encoding: {type: string, enum: ["utf-8", "base64"], default: "utf-8"},
      create_dirs: {type: boolean, description: "Create parent directories if missing"}
    },
    required: ["path", "content"]
  }
  Description: "Write file contents"

Define tool "delete_file"
  Input schema: {
    type: object,
    properties: {
      path: {type: string},
      confirm: {type: boolean, description: "Must be true to confirm deletion"}
    },
    required: ["path", "confirm"]
  }
  Description: "Delete a file"

Define tool "list_directory"
  Input schema: {
    type: object,
    properties: {
      path: {type: string, description: "Directory to list, or empty for root"},
      recursive: {type: boolean, description: "Include subdirectories"}
    }
  }
  Description: "List files in a directory"

Define tool "search_files"
  Input schema: {
    type: object,
    properties: {
      pattern: {type: string, description: "Filename pattern (glob or regex)"},
      search_content: {type: boolean, description: "Search inside file content"},
      content_pattern: {type: string}
    },
    required: ["pattern"]
  }
  Description: "Search for files by name or content"

// Tool handlers
On receive "read_file":
  Extract path, encoding
  user_id = request.user_id

  Try:
    real_path = validate_path(path)

    If not file_exists(real_path):
      audit_log("read_file", path, user_id, false, "File not found")
      Return error "File not found"

    If is_directory(real_path):
      audit_log("read_file", path, user_id, false, "Path is directory")
      Return error "Path is a directory, not a file"

    content = read_file(real_path)

    If encoding == "base64":
      content = base64_encode(content)

    audit_log("read_file", path, user_id, true, "bytes: " + length(content))
    Return {success: true, content: content, encoding: encoding}

  Catch error as e:
    audit_log("read_file", path, user_id, false, e.message)
    Return error {error: e.message}

On receive "write_file":
  Extract path, content, encoding, create_dirs
  user_id = request.user_id

  If not enable_write:
    audit_log("write_file", path, user_id, false, "Write mode disabled")
    Return error "Write operations are disabled"

  Try:
    real_path = validate_path(path)

    // Check file size
    content_bytes = content if encoding == "utf-8" else base64_decode(content)
    If length(content_bytes) > max_file_size:
      audit_log("write_file", path, user_id, false, "File exceeds max size")
      Return error "File exceeds maximum size"

    // Create parent directories if requested
    parent_dir = get_directory(real_path)
    If create_dirs and not directory_exists(parent_dir):
      create_directories(parent_dir)
    Else if not directory_exists(parent_dir):
      audit_log("write_file", path, user_id, false, "Parent directory not found")
      Return error "Parent directory does not exist"

    // Decode if needed
    If encoding == "base64":
      content_bytes = base64_decode(content)

    // Write to temporary file first (atomic write)
    temp_path = real_path + ".tmp"
    write_file(temp_path, content_bytes)
    rename_file(temp_path, real_path)

    audit_log("write_file", path, user_id, true, "bytes: " + length(content_bytes))
    Return {success: true, bytes_written: length(content_bytes)}

  Catch error as e:
    audit_log("write_file", path, user_id, false, e.message)
    Return error {error: e.message}

On receive "delete_file":
  Extract path, confirm
  user_id = request.user_id

  If not enable_write:
    Return error "Write operations are disabled"

  If not confirm:
    Return error "Deletion requires confirm: true"

  Try:
    real_path = validate_path(path)

    If not file_exists(real_path):
      audit_log("delete_file", path, user_id, false, "File not found")
      Return error "File not found"

    delete_file(real_path)
    audit_log("delete_file", path, user_id, true, "Deleted")
    Return {success: true, deleted: true}

  Catch error as e:
    audit_log("delete_file", path, user_id, false, e.message)
    Return error {error: e.message}

On receive "list_directory":
  Extract path, recursive
  user_id = request.user_id

  Try:
    dir_path = if path is empty then sandbox_root else validate_path(path)

    If not directory_exists(dir_path):
      Return error "Directory not found"

    entries = list_files(dir_path, recursive: recursive)

    result = []
    For each entry in entries:
      item = {
        name: entry.name,
        type: entry.is_directory ? "directory" : "file",
        size: entry.size,
        modified: entry.modified_time
      }
      result.append(item)

    audit_log("list_directory", path, user_id, true, "files: " + length(result))
    Return {success: true, entries: result}

  Catch error as e:
    audit_log("list_directory", path, user_id, false, e.message)
    Return error {error: e.message}

On receive "search_files":
  Extract pattern, search_content, content_pattern
  user_id = request.user_id

  Try:
    matches = []

    // File name search
    all_files = list_all_files(sandbox_root, recursive: true)
    For each file in all_files:
      If filename_matches_pattern(file.name, pattern):
        matches.append(file)

    // Content search (if requested)
    If search_content and content_pattern:
      filtered_matches = []
      For each file in matches:
        If can_search_content(file):  // text files only
          content = read_file(file)
          If content_contains_pattern(content, content_pattern):
            filtered_matches.append(file)
      matches = filtered_matches

    result = []
    For each match in matches:
      result.append({
        path: relative_path(match, sandbox_root),
        size: match.size,
        modified: match.modified_time
      })

    audit_log("search_files", pattern, user_id, true, "results: " + length(result))
    Return {success: true, results: result}

  Catch error as e:
    Return error {error: e.message}
```

**Key patterns:**
- Directory traversal prevention via path validation
- Sandboxed operations within a single root directory
- Extension whitelisting
- File size limits
- Atomic writes using temporary files
- Complete audit logging of all operations
- User tracking for all filesystem operations

---

## 6. Template 5: Multi-Capability Server

This advanced server exposes tools, resources, AND prompts together.

```
PSEUDOCODE: MULTI-CAPABILITY MCP SERVER

// Configuration
Config:
  server_name = "multi-capability-server"
  version = "1.0.0"

// Tool definitions
Tools:
  "analyse_code"
    Description: "Analyse code and return metrics"
    Input: {type: object, properties: {code: {type: string}}}

  "generate_docs"
    Description: "Generate documentation from code"
    Input: {type: object, properties: {code: {type: string}, style: {type: string}}}

// Resource definitions
Resources:
  "file://templates/code_review.md"
    Description: "Code review template"
    MIME type: "text/markdown"

  "file://style_guide.json"
    Description: "Coding standards style guide"
    MIME type: "application/json"

// Prompt definitions
Prompts:
  "code_review"
    Description: "Code review prompt with instructions"
    Parameters: {language: string, codebase_type: string}

  "security_audit"
    Description: "Security audit checklist"
    Parameters: {scope: string}

// Discovery
On receive discovery request:
  Return {
    server: {
      name: server_name,
      version: version
    },
    capabilities: {
      tools: [
        {
          name: "analyse_code",
          description: "Analyse code and return metrics",
          inputSchema: {type: object, properties: {...}}
        },
        {
          name: "generate_docs",
          description: "Generate documentation from code",
          inputSchema: {type: object, properties: {...}}
        }
      ],
      resources: [
        {
          uri: "file://templates/code_review.md",
          name: "Code review template",
          description: "Standard code review template",
          mimeType: "text/markdown"
        },
        {
          uri: "file://style_guide.json",
          name: "Style guide",
          description: "Coding standards",
          mimeType: "application/json"
        }
      ],
      prompts: [
        {
          name: "code_review",
          description: "Code review prompt",
          arguments: [
            {name: "language", description: "Programming language"},
            {name: "codebase_type", description: "e.g. web, backend, library"}
          ]
        },
        {
          name: "security_audit",
          description: "Security audit checklist",
          arguments: [
            {name: "scope", description: "what to audit"}
          ]
        }
      ]
    }
  }

// Tool invocation
On receive tool "analyse_code":
  Extract code from request
  Validate code is non-empty

  metrics = {
    line_count: count_lines(code),
    complexity: calculate_cyclomatic_complexity(code),
    has_error_handling: contains_try_catch(code),
    has_logging: contains_logging(code),
    potential_issues: []
  }

  // Check for common issues
  If has_hardcoded_secrets(code):
    metrics.potential_issues.append("Hardcoded credentials detected")

  If has_sql_injection_patterns(code):
    metrics.potential_issues.append("Potential SQL injection")

  Return {success: true, metrics: metrics}

On receive tool "generate_docs":
  Extract code and style
  Validate parameters

  // Parse code structure
  functions = extract_functions(code)
  classes = extract_classes(code)

  // Generate documentation
  docs = "# Auto-generated Documentation\n\n"

  For each class in classes:
    docs += "## Class: " + class.name + "\n"
    docs += class.docstring or "(No description)\n"
    For each method in class.methods:
      docs += "### Method: " + method.name + "\n"
      docs += method.description

  For each func in functions:
    docs += "## Function: " + func.name + "\n"
    docs += func.description

  Return {success: true, documentation: docs}

// Resource fetching
On receive resource fetch request:
  Extract resource URI

  If URI == "file://templates/code_review.md":
    content = read_file("templates/code_review.md")
    Return {
      uri: URI,
      mimeType: "text/markdown",
      contents: content
    }

  If URI == "file://style_guide.json":
    content = read_file("style_guide.json")
    Return {
      uri: URI,
      mimeType: "application/json",
      contents: content
    }

  Return error "Resource not found"

// Prompt generation
On receive prompt "code_review":
  Extract parameters language and codebase_type

  prompt_text = """
  You are a code reviewer specializing in {language}.

  This is a {codebase_type} project.

  Review the provided code for:
  - Correctness and logic errors
  - Performance issues
  - Security vulnerabilities
  - Code style and readability
  - Test coverage

  Provide specific, actionable feedback.
  """

  prompt_text = interpolate(prompt_text, {language: language, codebase_type: codebase_type})

  Return {success: true, messages: [{role: "user", content: prompt_text}]}

On receive prompt "security_audit":
  Extract parameter scope

  prompt_text = """
  Perform a security audit of {scope}.

  Check for:
  - Input validation gaps
  - Authentication/authorization issues
  - Data leakage
  - Dependency vulnerabilities
  - API security
  - Encryption and secrets management

  Format findings as:
  - CRITICAL: [description]
  - HIGH: [description]
  - MEDIUM: [description]
  """

  prompt_text = interpolate(prompt_text, {scope: scope})

  Return {success: true, messages: [{role: "user", content: prompt_text}]}

// Error handling
On any invalid request:
  Log error
  Return error response with clear message
```

**Key patterns:**
- Tool invocation handlers
- Resource URI-based fetching
- Prompt templates with parameter interpolation
- Unified discovery response listing all capabilities

---

## 7. Authentication and Security

### OAuth 2.1 for HTTP Transport

As of March 2025, HTTP transport MCP servers must implement OAuth 2.1 for client authentication. Stdio servers don't need OAuth (they're local and trust the parent process).

```
PSEUDOCODE: OAUTH 2.1 AUTHENTICATION

// OAuth configuration
OAuth config:
  authorization_endpoint = "https://your-auth-provider.com/authorize"
  token_endpoint = "https://your-auth-provider.com/token"
  client_id = environment("OAUTH_CLIENT_ID")
  client_secret = environment("OAUTH_CLIENT_SECRET")
  redirect_uri = environment("OAUTH_REDIRECT_URI", default: "http://localhost:8080/callback")
  scopes = ["mcp:server:tools", "mcp:server:resources"]
  token_cache = {}  // client_id -> {access_token, refresh_token, expires_at}

// Token validation
Function validate_access_token(token):
  Try:
    // Decode JWT (if token is self-issued)
    decoded = jwt_decode(token, using client_secret)

    If decoded.exp < current_timestamp():
      Return false, "Token expired"

    If decoded.aud != server_name:
      Return false, "Invalid audience"

    Return true, decoded

  Catch:
    // If not JWT, check against remote provider
    response = make_http_request(
      "POST",
      token_endpoint + "/introspect",
      headers: {"Authorization": "Basic " + base64(client_id + ":" + client_secret)},
      body: {token: token}
    )

    If response.status == 200 and response.active == true:
      Return true, response

    Return false, "Token invalid or revoked"

// Middleware (applied to every request)
On receive HTTP request:
  Extract authorization header

  If header not present:
    Return error 401 "Missing Authorization header"

  If not header.starts_with("Bearer "):
    Return error 401 "Invalid authorization format"

  token = header.substring(7)  // Remove "Bearer "

  valid, token_data = validate_access_token(token)

  If not valid:
    Log security event "Invalid token attempt"
    Return error 401 "Unauthorized"

  // Attach token data to request context
  request.context.user_id = token_data.sub
  request.context.scopes = token_data.scope.split(" ")
  request.context.token_expires = token_data.exp

  // Check scope for requested capability
  required_scope = determine_required_scope(request.capability)

  If required_scope not in request.context.scopes:
    Log security event "Insufficient scope: " + required_scope
    Return error 403 "Insufficient permissions"

  // Continue to handler
  Continue with request processing

// Scope-to-capability mapping
Function determine_required_scope(capability):
  Mapping = {
    "analyse_code": "mcp:server:tools",
    "list_files": "mcp:server:tools",
    "write_file": "mcp:server:tools:write",
    "delete_file": "mcp:server:tools:write",
    "fetch_resource": "mcp:server:resources"
  }

  Return mapping[capability]

// Token refresh
Function refresh_token(refresh_token):
  response = make_http_request(
    "POST",
    token_endpoint,
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
      client_id: client_id,
      client_secret: client_secret
    }
  )

  If response.status == 200:
    token_data = parse_json(response.body)
    Return {
      access_token: token_data.access_token,
      refresh_token: token_data.refresh_token,
      expires_in: token_data.expires_in
    }

  Throw error "Token refresh failed"
```

### Input Validation and Sanitisation

```
PSEUDOCODE: INPUT VALIDATION

// Validation registry
Validators = {
  "string": function(value) {
    If not is_string(value):
      Throw error "Expected string"
    If length(value) == 0:
      Throw error "String cannot be empty"
    Return true
  },

  "string:max_length:N": function(value, N) {
    If length(value) > N:
      Throw error "String exceeds max length " + N
    Return true
  },

  "number": function(value) {
    If not is_number(value):
      Throw error "Expected number"
    Return true
  },

  "number:min:N": function(value, N) {
    If value < N:
      Throw error "Number must be >= " + N
    Return true
  },

  "email": function(value) {
    If not matches_email_regex(value):
      Throw error "Invalid email format"
    Return true
  },

  "url": function(value) {
    If not matches_url_regex(value):
      Throw error "Invalid URL"
    Return true
  }
}

// Sanitisation
Function sanitise_string(value, type):
  If type == "html":
    // Remove HTML tags
    Return value.replace(/<[^>]*>/g, "")

  If type == "sql":
    // Escape SQL special characters (use parameterized queries instead)
    Return value.replace(/['";\\]/g, "\\$&")

  If type == "json":
    // Validate JSON structure
    Try:
      parse_json(value)
    Catch:
      Throw error "Invalid JSON"
    Return value

  Return value

// Apply validation to request
Function validate_request(request, schema):
  errors = []

  For each required_field in schema.required:
    If required_field not in request:
      errors.append("Missing required field: " + required_field)

  For each field in request:
    If field not in schema.properties:
      errors.append("Unknown field: " + field)
      Continue

    field_schema = schema.properties[field]
    Try:
      validate(request[field], field_schema.validation_rules)
      request[field] = sanitise_string(request[field], field_schema.sanitise_as)
    Catch error as e:
      errors.append(field + ": " + e.message)

  If length(errors) > 0:
    Return false, errors

  Return true, request
```

---

## 8. Testing Framework

```
PSEUDOCODE: MCP SERVER TESTING

// Test client mock
Class MockMCPClient:
  Function __init__(server):
    this.server = server
    this.connected = true

  Function discover():
    Return server.handle_discovery_request()

  Function call_tool(tool_name, params):
    Try:
      result = server.handle_tool_invocation(tool_name, params)
      Return {success: true, result: result}
    Catch error as e:
      Return {success: false, error: e.message}

  Function fetch_resource(uri):
    Try:
      result = server.handle_resource_fetch(uri)
      Return {success: true, result: result}
    Catch error as e:
      Return {success: false, error: e.message}

// Unit tests
Test suite "Basic Tool Server":
  Setup:
    server = new MCP_BasicToolServer()
    client = new MockMCPClient(server)

  Test "add_numbers returns correct result":
    result = client.call_tool("add_numbers", {a: 5, b: 3})
    Assert result.success == true
    Assert result.result.output == 8

  Test "add_numbers rejects non-numeric input":
    result = client.call_tool("add_numbers", {a: "five", b: 3})
    Assert result.success == false
    Assert result.error contains "number"

  Test "format_text uppercase":
    result = client.call_tool("format_text", {text: "hello", style: "uppercase"})
    Assert result.result.output == "HELLO"

  Test "discovery returns tool list":
    discovery = client.discover()
    Assert length(discovery.tools) == 3
    Assert discovery.tools[0].name == "add_numbers"

Test suite "Database Query Server":
  Setup:
    server = new MCP_DatabaseServer(":memory:")
    server.initialize_test_data()
    client = new MockMCPClient(server)

  Test "query_database SELECT succeeds":
    result = client.call_tool("query_database", {sql: "SELECT * FROM products LIMIT 1"})
    Assert result.success == true
    Assert result.result.row_count >= 0

  Test "query_database blocks INSERT":
    result = client.call_tool("query_database", {sql: "INSERT INTO products VALUES (1, 'test')"})
    Assert result.success == false

  Test "query_database blocks unauthorized table":
    result = client.call_tool("query_database", {sql: "SELECT * FROM admin_users"})
    Assert result.success == false

  Test "query_database parameterized queries prevent injection":
    result = client.call_tool("query_database", {
      sql: "SELECT * FROM products WHERE id = ?",
      params: ["1' OR '1'='1"]
    })
    // Should treat param as literal string, not SQL
    Assert result.success == true

Test suite "File System Server":
  Setup:
    server = new MCP_FileSystemServer("/tmp/mcp_test")
    client = new MockMCPClient(server)
    create_test_files()

  Test "read_file succeeds":
    result = client.call_tool("read_file", {path: "test.txt"})
    Assert result.success == true
    Assert result.result.content contains "test"

  Test "read_file blocks path traversal":
    result = client.call_tool("read_file", {path: "../../etc/passwd"})
    Assert result.success == false
    Assert result.error contains "sandbox"

  Test "write_file creates file":
    result = client.call_tool("write_file", {
      path: "new_file.txt",
      content: "test content"
    })
    Assert result.success == true

  Test "write_file blocks unauthorized extension":
    result = client.call_tool("write_file", {
      path: "malicious.exe",
      content: "virus"
    })
    Assert result.success == false

Test suite "API Gateway Server":
  Setup:
    server = new MCP_APIGatewayServer()
    server.mock_upstream_api()
    client = new MockMCPClient(server)

  Test "rate limiting blocks excess requests":
    For i = 0 to 101:
      result = client.call_tool("api_call", {endpoint: "/users", method: "GET"})
      If i <= 100:
        Assert result.success == true
      Else:
        Assert result.success == false
        Assert result.error contains "rate limit"

  Test "caching returns cached result":
    result1 = client.call_tool("api_call", {endpoint: "/users", method: "GET"})
    result2 = client.call_tool("api_call", {endpoint: "/users", method: "GET"})

    Assert result1.result.from_cache == false
    Assert result2.result.from_cache == true
    Assert result1.result.data == result2.result.data

// Load testing
Test suite "Load Testing":
  Setup:
    server = new MCP_Server()
    concurrent_clients = 50
    requests_per_client = 100

  Test "server handles 5000 concurrent requests":
    results = []
    For i = 0 to concurrent_clients:
      client = new MockMCPClient(server)
      For j = 0 to requests_per_client:
        result = client.call_tool("analyse_code", {code: test_code})
        results.append(result)

    successful = count where results[].success == true
    Assert successful / length(results) > 0.99  // 99% success rate

    Log "Average response time: " + average_response_time(results) + "ms"
```

---

## Advanced Patterns: Caching, Batching, and Resource Management

### Response Caching Strategy

Caching is critical for production MCP servers. Not all requests should hit your backend.

```
PSEUDOCODE: INTELLIGENT CACHING

Cache tiers:
  L1 In-memory: Fast, limited size, survives request but not reboot
  L2 Persistent: Redis or memcached, shared across instances
  L3 Persistent disk: SQLite, survives restarts

Invalidation strategy:
  Time-based (TTL): Simple, suitable for reference data (e.g., style guides, code templates)
  Event-based: Invalidate when underlying data changes
  Manual: Explicit invalidation via admin API
  Dependency-based: Invalidate when dependency cache expires

Cache key generation:
  Use hash(request_fingerprint) to avoid collisions
  Include schema version in key to handle breaking changes
  Consider request scope (per-user, per-organization, global)

Example: Database query caching
  Cache key = hash(query + params + user_id)
  TTL = 5 minutes for read-only queries
  Invalidate on INSERT/UPDATE/DELETE to affected tables
  Use bloom filter to quickly check if data is cached before computing
```

### Batching and Pipeline Mode

Some agents will send multiple tool calls in quick succession. Support batching to reduce overhead.

```
PSEUDOCODE: BATCH REQUEST HANDLING

On receive batch request:
  Extract list of tool calls: [
    {tool: "analyse_code", params: {...}},
    {tool: "generate_docs", params: {...}},
    {tool: "analyse_code", params: {...}}
  ]

  Validate batch size <= MAX_BATCH_SIZE (e.g., 50)

  Process in parallel (if tools are independent):
    results = parallel_map(invoke_tool, batch)

  Or sequential (if tools have dependencies):
    results = []
    For each call in batch:
      output = invoke_tool(call.tool, call.params)
      if output.success:
        results.append(output)
      else:
        // Option 1: Stop on first error
        // Option 2: Continue and return partial results
        // Your choice based on use case

  Return batch response:
    {
      batch_id: uuid(),
      total_requests: batch.length,
      successful: count(successful_results),
      failed: count(failed_results),
      results: results,
      execution_time_ms: elapsed
    }
```

### Resource Pooling and Connection Management

For servers that connect to databases or external services:

```
PSEUDOCODE: CONNECTION POOL MANAGEMENT

Connection pool:
  min_connections = 2
  max_connections = 10
  connection_timeout = 5 seconds
  idle_timeout = 300 seconds
  max_lifetime = 3600 seconds (1 hour)

  available_connections = Queue()
  in_use = Set()
  connection_stats = {
    total_acquired: 0,
    total_released: 0,
    average_acquire_time_ms: 0,
    average_lifetime_ms: 0
  }

Function acquire_connection():
  If available_connections.not_empty():
    conn = available_connections.pop()
    // Verify connection is still alive
    If not ping_connection(conn):
      close_connection(conn)
      return acquire_connection()  // Try next one
    in_use.add(conn)
    return conn

  If in_use.size < max_connections:
    conn = create_new_connection()
    in_use.add(conn)
    return conn

  // Wait for available connection (with timeout)
  Wait for available_connections with timeout
  If timeout:
    Throw error "Connection pool exhausted"

Function release_connection(conn):
  in_use.remove(conn)
  If not ping_connection(conn) or conn.lifetime > max_lifetime:
    close_connection(conn)
  Else:
    available_connections.push(conn)

// Background maintenance
Every 30 seconds:
  For each idle connection > idle_timeout:
    close_connection(conn)
    available_connections.remove(conn)

  Maintain min_connections:
    While available_connections.size < min_connections:
      create_and_add_connection()
```

---

## 9. Deployment Patterns

### Docker Deployment

```yaml
# docker-compose.yml for MCP server

version: '3.8'

services:
  mcp-server:
    build:
      context: .
      dockerfile: Dockerfile

    container_name: mcp-server

    environment:
      - API_PORT=8080
      - LOG_LEVEL=info
      - OAUTH_CLIENT_ID=${OAUTH_CLIENT_ID}
      - OAUTH_CLIENT_SECRET=${OAUTH_CLIENT_SECRET}
      - DATABASE_URL=${DATABASE_URL}
      - SANDBOX_ROOT=/data/files

    ports:
      - "8080:8080"

    volumes:
      - ./data:/data
      - ./logs:/logs

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    restart: unless-stopped

    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "3"

    networks:
      - mcp-network

  # Optional: Caddy reverse proxy for HTTPS
  caddy:
    image: caddy:latest
    container_name: mcp-caddy

    ports:
      - "80:80"
      - "443:443"

    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config

    networks:
      - mcp-network

    depends_on:
      - mcp-server

networks:
  mcp-network:
    driver: bridge

volumes:
  caddy_data:
  caddy_config:
```

### Caddyfile Template

```
# Caddyfile for reverse proxy + TLS

mcp-server.example.com {
    reverse_proxy http://mcp-server:8080 {
        header_uri -Authorization
        health_uri /health
        health_interval 10s
    }

    # OAuth middleware (optional, if using external provider)
    forward_auth http://auth-server:9000 {
        uri /auth/mcp
        copy_headers Authorization X-User-ID
    }

    # Rate limiting
    rate_limit / 100r/m

    # Logging
    log {
        output file /logs/caddy.log {
            roll_size 100mb
            roll_keep 3
        }
    }
}
```

### Cloudflare Workers Deployment

```
// MCP server running as Cloudflare Worker

export default {
  async fetch(request, env, ctx) {
    // CORS headers
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type'
        }
      });
    }

    // Token validation
    const auth_header = request.headers.get('Authorization');
    if (!auth_header || !auth_header.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = auth_header.substring(7);

    try {
      // Validate token against KV store or external provider
      const token_valid = await validateToken(token, env.KV_STORE);
      if (!token_valid) {
        return new Response('Invalid token', { status: 401 });
      }
    } catch (e) {
      return new Response('Token validation failed', { status: 500 });
    }

    // Route requests
    const url = new URL(request.url);

    if (url.pathname === '/mcp/discover') {
      return handleDiscovery();
    }

    if (url.pathname === '/mcp/call') {
      return await handleToolInvocation(await request.json());
    }

    return new Response('Not found', { status: 404 });
  }
};

async function handleDiscovery() {
  const capabilities = {
    tools: [
      {
        name: 'query_data',
        description: 'Query data from database',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' }
          }
        }
      }
    ]
  };

  return new Response(JSON.stringify(capabilities), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleToolInvocation(request) {
  const { tool, params } = request;

  try {
    let result;

    switch (tool) {
      case 'query_data':
        result = await queryDatabase(params.query);
        break;
      default:
        return new Response('Tool not found', { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function queryDatabase(query) {
  // Query worker KV or external API
  // Return results
}

async function validateToken(token, kv) {
  // Check token validity
  return true;
}
```

### Serverless (AWS Lambda / Google Cloud Functions)

Serverless is ideal for event-driven MCP servers that don't need persistent connections.

```
PSEUDOCODE: LAMBDA MCP SERVER

export handler = async (event, context) => {
  // Cold start initialization
  if (not SERVER_INITIALIZED):
    Initialize server once (database connections, caches)
    SERVER_INITIALIZED = true

  // Parse incoming request
  const request = parse_api_gateway_event(event)

  // Set timeout to leave margin for response serialisation
  const timeout = context.getRemainingTimeInMillis() - 1000

  try {
    let response

    if (request.path == '/discover') {
      response = handleDiscovery()
    }
    else if (request.path == '/invoke') {
      response = await handleToolInvocation(
        request.body,
        { timeout: timeout }
      )
    }
    else {
      response = { statusCode: 404, body: 'Not found' }
    }

    return {
      statusCode: response.statusCode || 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    }
  }
  catch (error) {
    // Log to CloudWatch
    console.error('MCP handler error:', error)

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        request_id: context.awsRequestId
      })
    }
  }
}

// Resource cleanup
context.callbackWaitsForEmptyEventLoop = false
```

Key considerations for serverless:
- Cold start time matters. Keep dependencies minimal.
- No persistent connections to databases (use connection proxies like PgBouncer).
- Environment variables for secrets and configuration.
- Separate discovery from invocation paths to avoid timeout on complex schema generation.
- Use structured logging for post-mortem debugging (CloudWatch Logs).

---

## 10. Monitoring and Observability

Production MCP servers need visibility into their behaviour.

```
PSEUDOCODE: STRUCTURED LOGGING AND METRICS

Log structure:
  timestamp: ISO8601
  level: INFO|WARN|ERROR|DEBUG
  service: "mcp-server-name"
  request_id: uuid (propagate through entire request)
  user_id: if authenticated
  tool: "tool_name" (if in tool context)
  duration_ms: execution time
  status: success|error
  error_code: (if error)
  message: human-readable

Example log entries:

// Discovery
{
  timestamp: "2026-03-09T10:23:45.123Z",
  level: "INFO",
  service: "api-gateway-server",
  request_id: "req_abc123",
  message: "Discovery request",
  tools_count: 8,
  resources_count: 3,
  duration_ms: 12
}

// Tool invocation
{
  timestamp: "2026-03-09T10:23:46.456Z",
  level: "INFO",
  service: "api-gateway-server",
  request_id: "req_def456",
  tool: "api_call",
  status: "success",
  http_status: 200,
  duration_ms: 234,
  cached: true,
  bytes_returned: 4521
}

// Error
{
  timestamp: "2026-03-09T10:23:47.789Z",
  level: "ERROR",
  service: "api-gateway-server",
  request_id: "req_ghi789",
  tool: "api_call",
  status: "error",
  error_code: "RATE_LIMIT_EXCEEDED",
  duration_ms: 45,
  message: "Rate limit exceeded for client",
  retry_after_seconds: 23
}

Metrics to track:
  - Request count by tool (success and error)
  - Response time percentiles (p50, p95, p99)
  - Error rate by tool
  - Cache hit rate
  - Tool execution time distribution
  - Authentication failures
  - Rate limit hits
  - Resource usage (memory, CPU, disk)
  - Database connection pool stats
  - Upstream API health
```

---

## 11. Integration with Agent Frameworks

MCP servers are called by agent runtimes. Understanding how frameworks use them helps you design better servers.

```
PSEUDOCODE: TYPICAL AGENT FRAMEWORK INTEGRATION

Agent framework workflow:

1. Bootstrap phase:
   - Load MCP server configuration
   - Establish connection (stdio, HTTP, etc.)
   - Call /discover endpoint
   - Parse server capabilities
   - Build tool registry

2. Planning phase:
   - Agent reasons about task
   - Identifies which tools from registry are relevant
   - Plans sequence of tool calls

3. Execution phase:
   For each planned tool call:
     - Validate tool exists in server capabilities
     - Format parameters according to tool schema
     - Call tool on server
     - Parse response
     - Feed response back to agent
     - Agent reasons about result
     - Decide if more tools needed or task complete

4. Completion phase:
   - Close server connection
   - Clean up resources

Best practices for MCP server design given this flow:

1. Tool names should be semantic (not generic_tool_1)
2. Descriptions must be precise (agent relies on them for relevance)
3. Error responses must be specific (helps agent retry differently)
4. Tool outputs should be structured (helps agent parse and reason)
5. Avoid dependencies between tools (agent may call them out of order)
6. Provide context-agnostic results (don't assume agent's previous state)
```

---

## Production Checklist

- [ ] **Security:** OAuth 2.1 implemented and tested for HTTP endpoints
- [ ] **Security:** Input validation on all tool parameters
- [ ] **Security:** SQL injection prevention via parameterized queries
- [ ] **Security:** Path traversal prevention for file operations
- [ ] **Security:** Rate limiting configured and tested
- [ ] **Security:** Secrets (API keys, tokens) stored in environment variables
- [ ] **Performance:** Response time <500ms for 95% of requests
- [ ] **Performance:** Memory usage <500MB under normal load
- [ ] **Performance:** Connection pooling configured for databases
- [ ] **Reliability:** Health check endpoint implemented
- [ ] **Reliability:** Graceful shutdown handling implemented
- [ ] **Reliability:** Automatic restart on crash (supervisor, systemd, or Docker)
- [ ] **Monitoring:** Structured logging with timestamps and severity levels
- [ ] **Monitoring:** Error tracking and alerting configured
- [ ] **Monitoring:** Audit log of all sensitive operations
- [ ] **Documentation:** API documentation with examples for all tools
- [ ] **Documentation:** Deployment runbook with troubleshooting steps
- [ ] **Testing:** Unit tests with >80% code coverage
- [ ] **Testing:** Integration tests with mock clients
- [ ] **Deployment:** CI/CD pipeline configured for automated testing and deployment

---

## Common Pitfalls and Best Practices

### Pitfall 1: Stateful Tools

Many developers make tools stateful, expecting the agent to remember previous context. This breaks scaling and reliability.

**Wrong approach:**
```
Tool "set_context": Sets internal state
Tool "query": Uses previously set context
```

The agent may call these tools out of order, or on different server instances (if you're scaled). Always make tools self-contained.

**Right approach:**
```
Tool "query": Accepts full context as parameter
Tool "query_with_context": Takes current_context + query parameters
```

### Pitfall 2: Unbounded Response Size

If you return massive responses (e.g., entire database dumps), you'll hit memory limits and timeouts.

**Set reasonable response limits:**
- Default page size for list operations (e.g., 100 items max)
- Streaming for large datasets instead of loading all in memory
- Summarisation before returning (return summary + link to full data)
- Compression for text-heavy responses

### Pitfall 3: Not Validating Schema Conformance

Your input validation is only as good as your test coverage. Make sure you actually test:
- Missing required fields
- Wrong data types
- Values outside allowed enums
- String length extremes (empty, 10MB)
- Null values where not allowed

### Pitfall 4: Treating HTTP+SSE Like WebSocket

HTTP+SSE is one-way: client sends request, server responds with stream. It's not true bidirectional. Don't design tools expecting the agent to send data while you're streaming responses.

### Pitfall 5: Ignoring Network Failures

Network calls fail. Timeouts happen. Handle them explicitly:

```
PSEUDOCODE: RESILIENT NETWORK CALLS

Function call_with_retry(endpoint, params, max_retries=3):
  For attempt = 0 to max_retries:
    Try:
      response = http_request(endpoint, params, timeout=10s)
      Return response

    Catch timeout_error:
      If attempt < max_retries:
        Wait exponential_backoff(attempt) seconds
        Continue
      Else:
        Throw error "Upstream timeout after 3 retries"

    Catch connection_error:
      If attempt < max_retries:
        Wait exponential_backoff(attempt) seconds
        Continue
      Else:
        Throw error "Cannot reach upstream service"

    Catch http_error (status >= 500):
      If attempt < max_retries and status in [502, 503, 504]:
        Wait exponential_backoff(attempt) seconds
        Continue
      Else:
        Throw error "Upstream server error: " + status

Exponential backoff:
  wait_time = min(2^attempt + random(0, 1), 30)
  // Avoids thundering herd on service recovery
```

### Pitfall 6: Missing Audit Trails

Especially for write operations, you need audit logs. Don't just log errors—log all state changes.

```
Audit log entry format:
  timestamp, user_id, tool_name, action, before_state, after_state, success, error

Example:
  2026-03-09T10:23:45Z, user_123, write_file, CREATE,
  (no file), (500 bytes), true, null
```

### Best Practice 1: Progressive Error Transparency

Don't return cryptic error codes. Be specific:

```
WRONG:
{error: "invalid input"}

RIGHT:
{
  error: "validation_failed",
  field: "email",
  reason: "must be valid email format",
  received: "not-an-email",
  expected_format: "user@example.com"
}
```

### Best Practice 2: Capability Versioning

As you evolve your tools, you need to version them. Use semantic versioning.

```
Tools:
  - query_database@v1
    deprecated: true
    migration_guide: "Use query_database_v2, parameters changed"

  - query_database@v2
    latest: true
    breaking_changes_from_v1: ["params.sql renamed to params.query"]
```

### Best Practice 3: Server Health Signals

Beyond a simple health check endpoint, expose metrics the agent can use to make decisions.

```
GET /health response:
  {
    status: "healthy" | "degraded" | "unhealthy",
    uptime_seconds: 3600,
    request_count: 1523,
    error_rate: 0.02,  // 2%
    average_response_time_ms: 234,
    cache_hit_rate: 0.67,
    database_connection_pool: {
      available: 7,
      in_use: 2,
      max: 10
    },
    upstream_services: {
      "external_api": {status: "healthy"},
      "database": {status: "healthy"},
      "cache": {status: "degraded"}
    }
  }
```

This helps agents decide whether to try a call or use a fallback.

### Best Practice 4: Explicit Scope and Permissions

Be clear about what each tool can do and what it can't.

```
Tool "delete_file":
  description: "Delete a file"
  limitations: [
    "Cannot delete directories",
    "Cannot delete outside /data/user_files",
    "Requires valid auth token",
    "Cannot recover deleted files"
  ]
  permissions_required: ["files:write", "files:delete"]
  risk_level: "high"
```

### Best Practice 5: Graceful Degradation

When a dependency fails, decide whether to fail the tool or degrade gracefully.

```
Example: API gateway server where upstream is down

Option 1 (Fail fast):
  Return error "Upstream service unavailable"

Option 2 (Degrade gracefully):
  Return cached result from 1 hour ago
  Mark response as {cached: true, cache_age_seconds: 3600}
  Include note: "This data is stale; upstream API is currently unavailable"

Option 3 (Circuit breaker):
  Count consecutive failures
  After 5 failures, stop trying for 60 seconds
  Return error "Service temporarily unavailable; try again in 60s"
  This prevents hammering the upstream service while it recovers
```

---

## 12. Troubleshooting Guide

**Issue 1: Client can't connect to server**

Check: Is the server listening on the configured port? Run `netstat -tuln | grep PORT` to verify. Check firewall rules if deploying behind a proxy. Verify OAuth credentials are correct.

**Issue 2: Tools returning "Input validation failed"**

Check: Ensure request parameters match the schema exactly. Review error message for specific field. Test with a simpler input first. Check parameter types (string vs number).

**Issue 3: Rate limiting rejecting legitimate requests**

Check: Verify rate limit window and request count in config. Consider if rate limit is too aggressive for your use case. Check for request retry loops in client code. Consider per-user or per-scope rate limits instead of global.

**Issue 4: Database connection timeouts**

Check: Verify database is reachable. Check connection pool size. Reduce query timeout if queries are long-running. Review slow query logs. Consider query caching.

**Issue 5: Memory leak in long-running server**

Check: Review error handling for unclosed connections. Check for unbounded cache growth. Monitor heap size during operation. Look for event listener leaks.

**Issue 6: File operations failing with permission errors**

Check: Verify sandbox directory exists and is readable/writable. Check file permissions. Verify running process has correct user privileges. Review audit log for denied paths.

**Issue 7: API gateway getting upstream errors**

Check: Is upstream service healthy? Verify API credentials are correct. Check upstream rate limits. Review upstream error responses in logs. Add circuit breaker pattern if upstream is flaky.

**Issue 8: OAuth token validation failing**

Check: Verify token hasn't expired. Check token issuer matches configuration. Verify signing key is correct. Review token scopes. Check time synchronisation between servers.

**Issue 9: Server using excessive CPU**

Check: Profile slow tools. Review infinite loops in logic. Check for tight polling loops. Consider async/await patterns for I/O.

**Issue 10: Clients receiving incomplete responses**

Check: Verify response timeout is sufficient. Check for streaming issues on HTTP+SSE transport. Review error handling in response serialisation. Test with different client libraries.

---

## Real-World Example: Building a Complete Server

Let's walk through building a complete MCP server for a fictional analytics platform. This example ties together multiple concepts from this kit.

**Requirements:**
- Expose a read-only database as queryable tools
- Cache frequently-accessed queries
- Support OAuth for HTTP access
- Log all query operations
- Scale to thousands of agents

**Architecture decision matrix:**

| Decision | Option A | Option B | We Choose |
|----------|----------|----------|-----------|
| **Transport** | Stdio | HTTP+SSE | HTTP+SSE (need to scale across agents) |
| **Database** | PostgreSQL | SQLite | PostgreSQL (concurrent agent access) |
| **Caching** | Redis | In-memory | Redis (shared across instances) |
| **Auth** | API key | OAuth 2.1 | OAuth 2.1 (requirement as of Mar 2025) |
| **Scaling** | Single server | Load-balanced cluster | Load-balanced cluster (high agent volume) |

**Server definition:**

```
Server name: analytics-query-server
Version: 1.0.0

Tools:
  1. query_analytics
     Input: {query: string (max 1000 chars), params: array, cache_override: boolean}
     Output: {rows: array, row_count: number, execution_time_ms: number, from_cache: boolean}
     Permissions: analytics:read

  2. list_tables
     Input: {schema: string (optional)}
     Output: {tables: array of {name, columns, row_count}}
     Permissions: analytics:read

  3. get_query_history
     Input: {limit: number (max 100)}
     Output: {queries: array of {timestamp, user_id, query, result_count}}
     Permissions: analytics:read:history

Resources:
  file://schemas/analytics.json
    Description: Full schema of analytics database
    MIME: application/json
```

**Implementation overview:**

```
PSEUDOCODE: ANALYTICS QUERY SERVER FULL STACK

Class AnalyticsQueryServer extends MCPServer:
  Function __init__():
    Initialize database connection pool (PostgreSQL)
    Initialize Redis cache client
    Load schema from database
    Register tools: query_analytics, list_tables, get_query_history

  Function handle_discovery():
    Return {
      tools: [full tool definitions],
      resources: [file://schemas/analytics.json],
      capabilities: [tools, resources]
    }

  On tool invocation "query_analytics":
    // Authentication
    token = request.context.token
    scopes = validate_oauth_token(token)
    require_scope(scopes, "analytics:read")

    // Extract parameters
    query = request.params.query
    params = request.params.params
    cache_override = request.params.cache_override

    // Input validation
    if length(query) > 1000:
      return error "Query too long"
    if length(params) > 50:
      return error "Too many parameters"

    // Rate limiting
    client_id = request.context.user_id
    allowed = rate_limiter.check(client_id, "query_analytics")
    if not allowed:
      return error {error: "rate_limit_exceeded", retry_after: 60}

    // Caching
    cache_key = hash(query + serialize(params))
    if not cache_override:
      cached = redis_client.get(cache_key)
      if cached:
        return {
          success: true,
          rows: cached.rows,
          row_count: cached.row_count,
          from_cache: true,
          execution_time_ms: 0
        }

    // Execute query
    start_time = now()
    try:
      conn = db_pool.acquire()
      cursor = conn.prepare_statement(query)
      rows = cursor.execute_with_params(params)
      conn.close()
      execution_time = now() - start_time

      // Cache result
      redis_client.set_with_ttl(
        cache_key,
        {rows: rows, row_count: length(rows)},
        ttl: 300  // 5 minutes
      )

      // Audit log
      audit_log({
        timestamp: now(),
        user_id: request.context.user_id,
        tool: "query_analytics",
        action: "query_executed",
        query_length: length(query),
        param_count: length(params),
        row_count: length(rows),
        execution_time_ms: execution_time,
        success: true
      })

      return {
        success: true,
        rows: rows,
        row_count: length(rows),
        execution_time_ms: execution_time,
        from_cache: false
      }

    catch error as e:
      audit_log({
        timestamp: now(),
        user_id: request.context.user_id,
        tool: "query_analytics",
        action: "query_failed",
        error: e.message,
        success: false
      })

      if e.type == "timeout":
        return error "Query timeout (max 30 seconds)"
      if e.type == "connection_error":
        return error "Database unavailable"
      if e.type == "sql_error":
        return error "Invalid SQL: " + e.detail
      return error "Query failed: " + e.message

  On resource fetch "file://schemas/analytics.json":
    // Return cached schema
    schema = redis_client.get("schema:analytics")
    if schema:
      return {uri, mime_type: "application/json", contents: schema}

    // Or fetch fresh from database
    schema = introspect_database()
    redis_client.set("schema:analytics", schema, ttl: 3600)
    return {uri, mime_type: "application/json", contents: schema}

  Function on_shutdown():
    // Graceful shutdown
    log "Shutting down analytics query server"
    db_pool.close_all()
    redis_client.disconnect()
    close_log_file()
```

This example demonstrates:
- OAuth authentication and scope checking
- Input validation and rate limiting
- Caching strategy (Redis with TTL)
- Connection pooling (PostgreSQL)
- Comprehensive audit logging
- Graceful error handling
- Resource fetching with schema caching

---

## Cross-References

- **HD-1001:** How to Set Up an MCP Server from Scratch
- **HD-1008:** How Agents Discover and Use Tools: MCP Explained
- **HD-1101:** MCP Server Configuration Guide
- **HD-1106:** Tool Use and Function Calling Patterns
- **HD-1004:** Agent Security Checklist

---

## Version History

| Version | Date       | Changes |
|---------|-----------|---------|
| 1.0     | 2026-03-09 | Initial release. Five templates, auth, testing, deployment, troubleshooting. |

---

**Author:** Melisia Archimedes
**Collection:** C4 Infrastructure
**Tier:** Nectar (Premium)
**Price:** $99 USD
**Audience:** Agent developers, platform engineers, infrastructure architects
**Last Updated:** 2026-03-09
**Hive Doctrine ID:** HD-1203
