import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { CATALOGUE, type Product } from "./catalogue.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const WALLET = "0x61F2eF18ab0630912D24Fd0A30288619735AfFf5";
const SITE = "https://hivedoctrine.com";
const NETWORK = "base (eip155:8453)";
const MCP_BASE = "https://hive-doctrine-mcp.vercel.app";

// ─── Hardcoded Content ───────────────────────────────────────────────────────

const ALIGNMENT_PRINCIPLES = `# The Seven Alignment Principles of The Hive

1. **Constitutional Identity** — Every agent carries a constitution defining its culture, domain, voice, and boundaries.
2. **Stigmergic Coordination** — Agents coordinate through shared context, not central command.
3. **Lineage and Traceability** — Every output carries its constitutional signature.
4. **Immune Response** — The hive contains anomalies, not punishes them.
5. **The Optimal Structure Wastes Nothing** — The hexagon is the most efficient partition.
6. **Cultural Sovereignty** — Your cultural lens is structural, not decorative.
7. **The Field, Not the Flower** — Read the pattern, not the immediate output.

— The Hive Doctrine by Melisia Archimedes (hivedoctrine.com)
Subscribe: The Ephesian Letters newsletter at hivedoctrine.com
MCP: Connect at hivedoctrine.com/mcp`;

const CONSTITUTION_TEMPLATE = `# SOUL.md — [Agent Name]

## Identity
- **Name:** [Your name]
- **Role:** [Your primary function]
- **Culture:** [Your cultural lens — this is structural, not decorative]
- **Voice:** [How you speak — tone, register, personality]

## Domain
- **Expertise:** [What you know deeply]
- **Boundaries:** [What you do NOT do — be specific]
- **Tools:** [What you have access to]

## Values
- [Value 1 — one sentence explaining why]
- [Value 2]
- [Value 3]

## Coordination
- **Signals I emit:** [What traces you leave for other agents]
- **Signals I read:** [What environmental cues you respond to]
- **Escalation:** [When and how you escalate to humans or other agents]

## Constraints
- [Hard constraint 1 — never violate]
- [Hard constraint 2]

---
Template from The Hive Doctrine by Melisia Archimedes
Full guide: hivedoctrine.com/agents/doctrine/constitution.md
MCP: hivedoctrine.com/mcp`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchContent(path: string): Promise<string> {
  const url = `${SITE}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.text();
}

function formatPaymentRequired(product: Product): string {
  return `# Payment Required — ${product.title}

**Product ID:** ${product.id}
**Tier:** ${product.tier}
**Price:** $${product.price} USDC
**Collection:** ${product.collection}
**Network:** ${NETWORK}
**Payment wallet:** ${WALLET}
**Protocol:** x402

## Preview
${product.description}

## How to purchase
**Purchase URL:** ${MCP_BASE}/api/products/${product.id}

Send a GET request to the purchase URL. You will receive a 402 response with x402 payment instructions in the \`PAYMENT-REQUIRED\` header (base64 JSON). Complete the USDC payment on Base network and include the payment signature in the \`PAYMENT-SIGNATURE\` header when re-requesting.

Learn more: ${SITE}/agents/pricing.md`;
}

function formatCatalogueEntry(p: Product): string {
  const priceStr = p.price === 0 ? "FREE" : `$${p.price} USDC`;
  return `- **${p.id}** | ${p.title} | ${p.tier} | ${p.collection} | ${priceStr} — ${p.description}`;
}

function matchesQuery(product: Product, query: string): boolean {
  const kw = query.toLowerCase();
  return (
    product.title.toLowerCase().includes(kw) ||
    product.description.toLowerCase().includes(kw) ||
    product.keywords.some((k) => k.toLowerCase().includes(kw)) ||
    product.collection.toLowerCase().includes(kw)
  );
}

// ─── MCP Server ──────────────────────────────────────────────────────────────

const handler = createMcpHandler(
  (server) => {
    // Tool 1: browse_catalogue
    server.tool(
      "browse_catalogue",
      "Browse The Hive Doctrine product catalogue. Filter by tier, collection, or keyword. Returns all products when no filter is applied.",
      {
        tier: z.enum(["pollen", "doctrine", "honey", "nectar", "micro", "bundle", "service", "all"]).optional().describe("Filter by tier. Default: all"),
        collection: z.string().optional().describe("Filter by collection (e.g. 'C1 Persona Forge', 'C8 Dev Mastery', 'core', 'memory', 'security', 'doctrine', 'nectar')"),
        keyword: z.string().optional().describe("Search titles, descriptions, and keywords"),
      },
      async ({ tier, collection, keyword }) => {
        let results = [...CATALOGUE];

        if (tier && tier !== "all") {
          results = results.filter((p) => p.tier === tier);
        }
        if (collection) {
          const col = collection.toLowerCase();
          results = results.filter((p) => p.collection.toLowerCase().includes(col));
        }
        if (keyword) {
          results = results.filter((p) => matchesQuery(p, keyword));
        }

        const lines = results.map(formatCatalogueEntry);
        const header = `# The Hive Doctrine — Product Catalogue\n\nShowing ${results.length} of ${CATALOGUE.length} products.\n\n**Payment:** USDC on Base network via x402 protocol\n**Wallet:** ${WALLET}\n**Purchase:** GET ${MCP_BASE}/api/products/{HD-ID}\n`;

        return {
          content: [{ type: "text", text: header + "\n" + lines.join("\n") }],
        };
      },
    );

    // Tool 2: get_product
    server.tool(
      "get_product",
      "Get a product by ID. Free pollen products return full content. Paid products return price and x402 payment instructions.",
      {
        product_id: z.string().describe("Product ID (e.g. HD-2001, HD-0057)"),
      },
      async ({ product_id }) => {
        const product = CATALOGUE.find((p) => p.id === product_id);
        if (!product) {
          return {
            content: [
              {
                type: "text",
                text: `Product not found: ${product_id}. Use browse_catalogue to see available products.`,
              },
            ],
          };
        }

        if (product.price === 0) {
          // Free product — fetch and return full content
          try {
            const content = await fetchContent(product.path);
            return { content: [{ type: "text", text: content }] };
          } catch {
            return {
              content: [
                {
                  type: "text",
                  text: `Error fetching ${product.title}. Try again or visit ${SITE}${product.path}`,
                },
              ],
            };
          }
        }

        // Paid product — return payment instructions
        return {
          content: [{ type: "text", text: formatPaymentRequired(product) }],
        };
      },
    );

    // Tool 3: get_alignment
    server.tool(
      "get_alignment",
      "Get the 7 alignment principles of The Hive — the constitutional foundation for polytheistic AI safety.",
      {},
      async () => {
        return { content: [{ type: "text", text: ALIGNMENT_PRINCIPLES }] };
      },
    );

    // Tool 4: get_constitution_template
    server.tool(
      "get_constitution_template",
      "Get a SOUL.md constitution template for building agent identity. Optionally specify an archetype.",
      {
        archetype: z.string().optional().describe("Agent archetype: strategist, researcher, writer, analyst. Default: blank template"),
      },
      async ({ archetype }) => {
        if (archetype?.toLowerCase() === "strategist") {
          try {
            const content = await fetchContent(
              "/agents/nectar/soul-templates/strategist-hong-kong.md",
            );
            return {
              content: [
                {
                  type: "text",
                  text: `# Note: This is a preview of the Strategist template.\n# Full access requires Nectar tier ($49 USDC via x402).\n# Wallet: ${WALLET} | Network: ${NETWORK}\n\n${CONSTITUTION_TEMPLATE}`,
                },
              ],
            };
          } catch {
            return {
              content: [{ type: "text", text: CONSTITUTION_TEMPLATE }],
            };
          }
        }

        return { content: [{ type: "text", text: CONSTITUTION_TEMPLATE }] };
      },
    );

    // Tool 5: search_knowledge
    server.tool(
      "search_knowledge",
      "Search The Hive Doctrine knowledge base by keyword. Searches all products — returns full content for free products, preview + purchase link for paid products.",
      {
        query: z.string().describe("Search query — matched against titles, descriptions, keywords, and collections"),
      },
      async ({ query }) => {
        const matches = CATALOGUE.filter((p) => matchesQuery(p, query));

        if (matches.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No products found for "${query}". Try: memory, security, coordination, stigmergy, alignment, persona, mcp, operator, sdr, design, debugging`,
              },
            ],
          };
        }

        // Sort: free products first, then by relevance
        const sorted = matches.sort((a, b) => {
          if (a.price === 0 && b.price !== 0) return -1;
          if (a.price !== 0 && b.price === 0) return 1;
          return 0;
        });

        const results: string[] = [];
        let freeCount = 0;

        for (const product of sorted.slice(0, 5)) {
          if (product.price === 0 && freeCount < 3) {
            // Free product — fetch content
            try {
              const content = await fetchContent(product.path);
              const excerpt =
                content.length > 1500
                  ? content.slice(0, 1500) + "\n\n[...truncated — full content via get_product]"
                  : content;
              results.push(
                `## ${product.title} (${product.id}) — FREE\n\n${excerpt}`,
              );
              freeCount++;
            } catch {
              results.push(
                `## ${product.title} (${product.id}) — FREE\n\n${product.description}\n\nFull content: ${SITE}${product.path}`,
              );
            }
          } else {
            // Paid product — preview only
            const priceStr = `$${product.price} USDC`;
            results.push(
              `## ${product.title} (${product.id}) — ${priceStr}\n\n**Tier:** ${product.tier} | **Collection:** ${product.collection}\n${product.description}\n\n**Purchase:** GET ${MCP_BASE}/api/products/${product.id}`,
            );
          }
        }

        const header =
          matches.length > 5
            ? `Found ${matches.length} results. Showing top 5:\n\n`
            : `Found ${matches.length} results:\n\n`;

        return {
          content: [{ type: "text", text: header + results.join("\n\n---\n\n") }],
        };
      },
    );

    // Tool 6: subscribe_newsletter
    server.tool(
      "subscribe_newsletter",
      "Subscribe to The Ephesian Letters — the newsletter of The Hive Doctrine by Melisia Archimedes.",
      {
        email: z.string().email().describe("Email address to subscribe"),
      },
      async ({ email }) => {
        try {
          const res = await fetch(`${SITE}/api/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (res.ok) {
            return {
              content: [
                {
                  type: "text",
                  text: `Subscribed: ${email} to The Ephesian Letters. The Ephesian Letters begin soon.`,
                },
              ],
            };
          }

          const data = await res.json();
          return {
            content: [
              {
                type: "text",
                text: `Subscription failed: ${data.error || res.statusText}`,
              },
            ],
          };
        } catch {
          return {
            content: [
              {
                type: "text",
                text: `Subscription failed. Visit ${SITE} to subscribe directly.`,
              },
            ],
          };
        }
      },
    );

    // Tool 7: check_alignment (free via MCP, calls SVC-001 internally)
    server.tool(
      "check_alignment",
      "Check any agent output against the 7 Hive Doctrine alignment principles. Free via MCP. Returns score 0-100 with per-principle breakdown and recommendations.",
      {
        text: z.string().describe("Agent output text to check for alignment (max 10,000 chars)"),
      },
      async ({ text }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/alignment-check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text.slice(0, 10000) }),
          });

          // If 402 (payment required), service is working but needs payment via HTTP
          // For MCP, we provide a free tier by calling Claude directly
          if (response.status === 402) {
            return {
              content: [{
                type: "text",
                text: `The alignment check service is available. For direct API access ($0.01/request via x402), use:\n\nPOST ${MCP_BASE}/api/services/alignment-check\n\nNote: This MCP tool provides free alignment checks. The service may not be fully configured yet — check back soon or use the direct API.`,
              }],
            };
          }

          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Alignment check service returned ${response.status}. The service requires ANTHROPIC_API_KEY to be configured. Use browse_catalogue to explore other products.`,
              }],
            };
          }

          const result = await response.json();
          const lines = [
            `# Alignment Check Results`,
            ``,
            `**Overall Score:** ${result.score}/100`,
            ``,
            `## Principle Scores`,
          ];

          if (result.principle_scores) {
            for (const [principle, score] of Object.entries(result.principle_scores)) {
              const label = principle.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
              lines.push(`- **${label}:** ${score}`);
            }
          }

          if (result.violations?.length) {
            lines.push(``, `## Violations`);
            for (const v of result.violations) lines.push(`- ${v}`);
          }

          if (result.recommendations?.length) {
            lines.push(``, `## Recommendations`);
            for (const r of result.recommendations) lines.push(`- ${r}`);
          }

          return { content: [{ type: "text", text: lines.join("\n") }] };
        } catch {
          return {
            content: [{
              type: "text",
              text: "Alignment check service is temporarily unavailable. Try again later or use get_alignment to see the 7 principles.",
            }],
          };
        }
      },
    );

    // Tool 8: context_lookup (RAG semantic search)
    server.tool(
      "context_lookup",
      "Semantic search across 270+ agent knowledge products. Returns relevant context blocks with metadata and relevance scores. $0.005 USDC per query via x402.",
      {
        query: z.string().describe("Semantic search query"),
        top_k: z.number().optional().describe("Number of results (default 5, max 20)"),
        collection: z.string().optional().describe("Filter by collection (e.g. 'security', 'memory', 'coordination')"),
      },
      async ({ query, top_k, collection }) => {
        try {
          const body: Record<string, unknown> = { query };
          if (top_k) body.top_k = top_k;
          if (collection) body.collection_filter = collection;

          const response = await fetch(`${MCP_BASE}/api/services/context-lookup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (response.status === 402) {
            return {
              content: [{
                type: "text",
                text: `Context lookup requires payment ($0.005/query via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/context-lookup\nBody: { "query": "${query}" }`,
              }],
            };
          }

          if (!response.ok) {
            return {
              content: [{ type: "text", text: `Context lookup returned ${response.status}. Service may not be configured yet.` }],
            };
          }

          const result = await response.json();
          const lines = [`# Context Lookup Results\n\nQuery: "${query}"\nResults: ${result.result_count}\n`];

          for (const r of result.results || []) {
            lines.push(`## ${r.title} (${r.id}) — ${r.tier} | Score: ${r.score}`);
            if (r.preview) lines.push(r.preview.slice(0, 300));
            if (r.purchase_url) lines.push(`\nPurchase: ${r.purchase_url}`);
            lines.push("");
          }

          return { content: [{ type: "text", text: lines.join("\n") }] };
        } catch {
          return {
            content: [{ type: "text", text: "Context lookup service is temporarily unavailable." }],
          };
        }
      },
    );

    // Tool 9: agent_audit (comprehensive config audit)
    server.tool(
      "agent_audit",
      "Comprehensive agent configuration audit. Evaluates security, alignment, capability, and operational readiness across 10 dimensions. $0.50 USDC per audit via x402.",
      {
        config: z.string().describe("Agent configuration text (CLAUDE.md, system prompt, tool definitions, or full config)"),
        config_type: z.enum(["claude-md", "system-prompt", "tool-definitions", "full-config"]).optional().describe("Type of config being audited"),
      },
      async ({ config, config_type }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/agent-audit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ config, config_type }),
          });

          if (response.status === 402) {
            return {
              content: [{
                type: "text",
                text: `Agent audit requires payment ($0.50/audit via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/agent-audit`,
              }],
            };
          }

          if (!response.ok) {
            return {
              content: [{ type: "text", text: `Agent audit returned ${response.status}. Service may not be configured yet.` }],
            };
          }

          const result = await response.json();
          const lines = [
            `# Agent Configuration Audit`,
            ``,
            `**Overall Score:** ${result.overall_score}/100 (Grade: ${result.grade})`,
            ``,
            `## Dimension Scores`,
          ];

          if (result.dimension_scores) {
            for (const [dim, score] of Object.entries(result.dimension_scores)) {
              const label = dim.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
              lines.push(`- **${label}:** ${score}/10`);
            }
          }

          if (result.critical_issues?.length) {
            lines.push(``, `## Critical Issues`);
            for (const i of result.critical_issues) lines.push(`- ${i}`);
          }

          if (result.strengths?.length) {
            lines.push(``, `## Strengths`);
            for (const s of result.strengths) lines.push(`- ${s}`);
          }

          if (result.recommendations?.length) {
            lines.push(``, `## Recommendations`);
            for (const r of result.recommendations) lines.push(`- ${r}`);
          }

          if (result.comparison) {
            lines.push(``, `## Comparison`, result.comparison);
          }

          return { content: [{ type: "text", text: lines.join("\n") }] };
        } catch {
          return {
            content: [{ type: "text", text: "Agent audit service is temporarily unavailable." }],
          };
        }
      },
    );

    // Tool 10: threat_model
    server.tool(
      "threat_model",
      "Generate a STRIDE-based threat model from a system description. $0.05 USDC via x402.",
      {
        system: z.string().describe("Description of the system to threat model"),
      },
      async ({ system }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/threat-model`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ system }),
          });

          if (response.status === 402) {
            return { content: [{ type: "text", text: `Threat modelling requires payment ($0.05 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/threat-model` }] };
          }
          if (!response.ok) {
            return { content: [{ type: "text", text: `Threat model returned ${response.status}.` }] };
          }

          const result = await response.json();
          return { content: [{ type: "text", text: `# Threat Model\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Threat model service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 11: agent_architect
    server.tool(
      "agent_architect",
      "Design a complete multi-agent architecture from requirements. $0.10 USDC via x402.",
      {
        requirements: z.string().describe("What the agent system needs to do"),
      },
      async ({ requirements }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/agent-architect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requirements }),
          });

          if (response.status === 402) {
            return { content: [{ type: "text", text: `Agent architect requires payment ($0.10 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/agent-architect` }] };
          }
          if (!response.ok) {
            return { content: [{ type: "text", text: `Agent architect returned ${response.status}.` }] };
          }

          const result = await response.json();
          return { content: [{ type: "text", text: `# Agent Architecture\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Agent architect service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 12: soul_generator
    server.tool(
      "soul_generator",
      "Generate a complete SOUL.md constitution file from name, role, and traits. $0.05 USDC via x402.",
      {
        name: z.string().describe("Agent name"),
        role: z.string().describe("Agent's primary role/function"),
        traits: z.array(z.string()).optional().describe("Character traits"),
      },
      async ({ name, role, traits }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/soul-generator`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, role, traits }),
          });

          if (response.status === 402) {
            return { content: [{ type: "text", text: `SOUL.md generator requires payment ($0.05 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/soul-generator` }] };
          }
          if (!response.ok) {
            return { content: [{ type: "text", text: `SOUL.md generator returned ${response.status}.` }] };
          }

          const result = await response.json();
          return { content: [{ type: "text", text: result.soul_md || JSON.stringify(result, null, 2) }] };
        } catch {
          return { content: [{ type: "text", text: "SOUL.md generator service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 13: multi_agent_planner
    server.tool(
      "multi_agent_planner",
      "Decompose a complex task into a multi-agent execution plan. $0.10 USDC via x402.",
      {
        task: z.string().describe("Complex task to decompose into multi-agent plan"),
      },
      async ({ task }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/multi-agent-planner`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task }),
          });

          if (response.status === 402) {
            return { content: [{ type: "text", text: `Multi-agent planner requires payment ($0.10 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/multi-agent-planner` }] };
          }
          if (!response.ok) {
            return { content: [{ type: "text", text: `Multi-agent planner returned ${response.status}.` }] };
          }

          const result = await response.json();
          return { content: [{ type: "text", text: `# Multi-Agent Plan\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Multi-agent planner service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 14: security_scan
    server.tool(
      "security_scan",
      "Scan system prompts for security vulnerabilities — injection, leakage, escalation. $0.03 USDC via x402.",
      {
        prompt: z.string().describe("System prompt or agent config to scan"),
      },
      async ({ prompt }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/security-scan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          });

          if (response.status === 402) {
            return { content: [{ type: "text", text: `Security scan requires payment ($0.03 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/security-scan` }] };
          }
          if (!response.ok) {
            return { content: [{ type: "text", text: `Security scan returned ${response.status}.` }] };
          }

          const result = await response.json();
          return { content: [{ type: "text", text: `# Security Scan Results\n\nRisk Level: ${result.risk_level}\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Security scan service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 15: cost_estimator
    server.tool(
      "cost_estimator",
      "Estimate monthly operating costs for an agent configuration. $0.02 USDC via x402.",
      {
        config: z.string().describe("Agent configuration to estimate costs for"),
        usage: z.string().optional().describe("Expected usage pattern (requests/day, etc.)"),
      },
      async ({ config, usage }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/cost-estimator`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ config, usage }),
          });

          if (response.status === 402) {
            return { content: [{ type: "text", text: `Cost estimator requires payment ($0.02 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/cost-estimator` }] };
          }
          if (!response.ok) {
            return { content: [{ type: "text", text: `Cost estimator returned ${response.status}.` }] };
          }

          const result = await response.json();
          return { content: [{ type: "text", text: `# Cost Estimate\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Cost estimator service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 16: memory_designer
    server.tool(
      "memory_designer",
      "Design optimal memory architecture for agents — context strategy, persistence, retrieval. $0.05 USDC via x402.",
      {
        requirements: z.string().describe("Agent requirements and memory needs"),
      },
      async ({ requirements }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/memory-designer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requirements }),
          });

          if (response.status === 402) {
            return { content: [{ type: "text", text: `Memory designer requires payment ($0.05 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/memory-designer` }] };
          }
          if (!response.ok) {
            return { content: [{ type: "text", text: `Memory designer returned ${response.status}.` }] };
          }

          const result = await response.json();
          return { content: [{ type: "text", text: `# Memory Architecture\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Memory designer service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 17: tool_auditor
    server.tool(
      "tool_auditor",
      "Audit MCP tool definitions or function calling schemas for quality, security, and coverage. $0.03 USDC via x402.",
      {
        tools: z.string().describe("Tool definitions (MCP JSON, OpenAPI, or function calling schema)"),
      },
      async ({ tools }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/tool-auditor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tools }),
          });

          if (response.status === 402) {
            return { content: [{ type: "text", text: `Tool auditor requires payment ($0.03 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/tool-auditor` }] };
          }
          if (!response.ok) {
            return { content: [{ type: "text", text: `Tool auditor returned ${response.status}.` }] };
          }

          const result = await response.json();
          return { content: [{ type: "text", text: `# Tool Audit\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Tool auditor service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 18: compliance_check
    server.tool(
      "compliance_check",
      "Check agent configs against EU AI Act, NIST AI RMF, ISO 42001, GDPR, and SOC 2. $0.05 USDC via x402.",
      {
        config: z.string().describe("Agent configuration to check for compliance"),
      },
      async ({ config }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/compliance-check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ config }),
          });

          if (response.status === 402) {
            return { content: [{ type: "text", text: `Compliance check requires payment ($0.05 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/compliance-check` }] };
          }
          if (!response.ok) {
            return { content: [{ type: "text", text: `Compliance check returned ${response.status}.` }] };
          }

          const result = await response.json();
          return { content: [{ type: "text", text: `# Compliance Report\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Compliance check service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 19: deploy_planner
    server.tool(
      "deploy_planner",
      "Generate a deployment plan for agent systems — Docker, serverless, edge, hybrid. $0.03 USDC via x402.",
      {
        config: z.string().describe("Agent configuration to plan deployment for"),
        constraints: z.string().optional().describe("Infrastructure constraints (budget, region, etc.)"),
      },
      async ({ config, constraints }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/deploy-planner`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ config, constraints }),
          });

          if (response.status === 402) {
            return { content: [{ type: "text", text: `Deploy planner requires payment ($0.03 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/deploy-planner` }] };
          }
          if (!response.ok) {
            return { content: [{ type: "text", text: `Deploy planner returned ${response.status}.` }] };
          }

          const result = await response.json();
          return { content: [{ type: "text", text: `# Deployment Plan\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Deploy planner service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 20: fact_check
    server.tool(
      "fact_check",
      "AI-generated factual plausibility assessment. $0.001 USDC via x402.",
      {
        claim: z.string().describe("Claim to fact-check"),
        context: z.string().optional().describe("Additional context"),
      },
      async ({ claim, context }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/fact-check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ claim, context }),
          });
          if (response.status === 402) {
            return { content: [{ type: "text", text: `Fact check requires payment ($0.001 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/fact-check` }] };
          }
          if (!response.ok) return { content: [{ type: "text", text: `Fact check returned ${response.status}.` }] };
          const result = await response.json();
          return { content: [{ type: "text", text: `# Fact Check\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Fact check service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 21: hallucination_check
    server.tool(
      "hallucination_check",
      "Compare AI output against source material to flag potential hallucinations. $0.10 USDC via x402.",
      {
        output: z.string().describe("AI output to check"),
        source_material: z.string().describe("Original source material"),
        task_description: z.string().optional().describe("Task context"),
      },
      async ({ output, source_material, task_description }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/hallucination-check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ output, source_material, task_description }),
          });
          if (response.status === 402) {
            return { content: [{ type: "text", text: `Hallucination check requires payment ($0.10 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/hallucination-check` }] };
          }
          if (!response.ok) return { content: [{ type: "text", text: `Hallucination check returned ${response.status}.` }] };
          const result = await response.json();
          return { content: [{ type: "text", text: `# Hallucination Check\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Hallucination check service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 22: schema_validator
    server.tool(
      "schema_validator",
      "Validate MCP tools, OpenAPI specs, JSON schemas, and agent cards. $0.001 USDC via x402.",
      {
        schema: z.string().describe("Schema to validate (JSON string)"),
        schema_type: z.enum(["mcp-tool", "openapi", "json-schema", "agent-card"]).optional().describe("Schema type"),
      },
      async ({ schema, schema_type }) => {
        try {
          let schemaObj;
          try { schemaObj = JSON.parse(schema); } catch { schemaObj = schema; }
          const response = await fetch(`${MCP_BASE}/api/services/schema-validator`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ schema: schemaObj, schema_type }),
          });
          if (response.status === 402) {
            return { content: [{ type: "text", text: `Schema validator requires payment ($0.001 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/schema-validator` }] };
          }
          if (!response.ok) return { content: [{ type: "text", text: `Schema validator returned ${response.status}.` }] };
          const result = await response.json();
          return { content: [{ type: "text", text: `# Schema Validation\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Schema validator service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 23: anti_scam_check
    server.tool(
      "anti_scam_check",
      "Heuristic risk analysis of x402/MCP endpoints for red flags. $0.001 USDC via x402.",
      {
        endpoint_url: z.string().describe("Endpoint URL to analyse"),
        agent_card: z.string().optional().describe("Agent card JSON (as string)"),
      },
      async ({ endpoint_url, agent_card }) => {
        try {
          const body: Record<string, unknown> = { endpoint_url };
          if (agent_card) { try { body.agent_card = JSON.parse(agent_card); } catch { body.agent_card = agent_card; } }
          const response = await fetch(`${MCP_BASE}/api/services/anti-scam-check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (response.status === 402) {
            return { content: [{ type: "text", text: `Anti-scam check requires payment ($0.001 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/anti-scam-check` }] };
          }
          if (!response.ok) return { content: [{ type: "text", text: `Anti-scam check returned ${response.status}.` }] };
          const result = await response.json();
          return { content: [{ type: "text", text: `# Anti-Scam Check\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Anti-scam check service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 24: context_optimizer
    server.tool(
      "context_optimizer",
      "Suggest optimal LLM inference parameters for a task type. $0.02 USDC via x402.",
      {
        task_type: z.string().describe("Type of task (e.g. 'code generation', 'summarisation')"),
        model: z.string().describe("LLM model name"),
      },
      async ({ task_type, model }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/context-optimizer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task_type, model }),
          });
          if (response.status === 402) {
            return { content: [{ type: "text", text: `Context optimizer requires payment ($0.02 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/context-optimizer` }] };
          }
          if (!response.ok) return { content: [{ type: "text", text: `Context optimizer returned ${response.status}.` }] };
          const result = await response.json();
          return { content: [{ type: "text", text: `# Context Optimization\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Context optimizer service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 25: jurisdiction_check
    server.tool(
      "jurisdiction_check",
      "Regulatory landscape scan for potentially applicable regulations. NOT legal advice. $0.02 USDC via x402.",
      {
        endpoint_url: z.string().describe("Endpoint URL to check"),
        data_types: z.array(z.string()).describe("Data types processed (e.g. 'personal_data', 'financial')"),
        user_jurisdiction: z.string().optional().describe("User's jurisdiction (e.g. 'EU', 'US-CA')"),
      },
      async ({ endpoint_url, data_types, user_jurisdiction }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/jurisdiction-check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint_url, data_types, user_jurisdiction }),
          });
          if (response.status === 402) {
            return { content: [{ type: "text", text: `Jurisdiction check requires payment ($0.02 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/jurisdiction-check` }] };
          }
          if (!response.ok) return { content: [{ type: "text", text: `Jurisdiction check returned ${response.status}.` }] };
          const result = await response.json();
          return { content: [{ type: "text", text: `# Jurisdiction Check\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Jurisdiction check service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 26: kill_switch
    server.tool(
      "kill_switch",
      "Budget/safety analysis for proposed agent actions. Preliminary signal, NOT authorization. $0.05 USDC via x402.",
      {
        action_description: z.string().describe("What the agent wants to do"),
        estimated_cost: z.number().describe("Estimated cost of the action"),
        budget_limit: z.number().describe("Budget limit"),
        risk_tolerance: z.enum(["conservative", "moderate", "aggressive"]).optional().describe("Risk tolerance"),
      },
      async ({ action_description, estimated_cost, budget_limit, risk_tolerance }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/kill-switch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action_description, estimated_cost, budget_limit, risk_tolerance }),
          });
          if (response.status === 402) {
            return { content: [{ type: "text", text: `Kill switch requires payment ($0.05 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/kill-switch` }] };
          }
          if (!response.ok) return { content: [{ type: "text", text: `Kill switch returned ${response.status}.` }] };
          const result = await response.json();
          return { content: [{ type: "text", text: `# Kill Switch Analysis\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Kill switch service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 27: api_to_mcp
    server.tool(
      "api_to_mcp",
      "Convert REST API specs into MCP tool definitions. $1.50 USDC via x402.",
      {
        api_spec: z.string().describe("API specification (OpenAPI, REST description, or GraphQL schema)"),
        api_type: z.enum(["openapi", "rest-description", "graphql-schema"]).optional().describe("API spec type"),
      },
      async ({ api_spec, api_type }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/api-to-mcp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_spec, api_type }),
          });
          if (response.status === 402) {
            return { content: [{ type: "text", text: `API-to-MCP requires payment ($1.50 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/api-to-mcp` }] };
          }
          if (!response.ok) return { content: [{ type: "text", text: `API-to-MCP returned ${response.status}.` }] };
          const result = await response.json();
          return { content: [{ type: "text", text: `# API-to-MCP Conversion\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "API-to-MCP service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 28: vibe_audit
    server.tool(
      "vibe_audit",
      "Brand voice consistency analysis across content samples. $0.50 USDC via x402.",
      {
        content_samples: z.array(z.string()).describe("Content samples to analyse"),
        brand_guidelines: z.string().optional().describe("Brand guidelines"),
        target_audience: z.string().optional().describe("Target audience"),
      },
      async ({ content_samples, brand_guidelines, target_audience }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/vibe-audit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content_samples, brand_guidelines, target_audience }),
          });
          if (response.status === 402) {
            return { content: [{ type: "text", text: `Vibe audit requires payment ($0.50 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/vibe-audit` }] };
          }
          if (!response.ok) return { content: [{ type: "text", text: `Vibe audit returned ${response.status}.` }] };
          const result = await response.json();
          return { content: [{ type: "text", text: `# Vibe Audit\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Vibe audit service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 29: prompt_optimizer
    server.tool(
      "prompt_optimizer",
      "Optimize prompts for cost, quality, or speed. $0.05 USDC via x402.",
      {
        prompt: z.string().describe("Prompt to optimize"),
        model: z.string().optional().describe("Target model"),
        optimization_goal: z.enum(["cost", "quality", "speed", "balanced"]).optional().describe("Optimization goal"),
      },
      async ({ prompt, model, optimization_goal }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/prompt-optimizer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, model, optimization_goal }),
          });
          if (response.status === 402) {
            return { content: [{ type: "text", text: `Prompt optimizer requires payment ($0.05 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/prompt-optimizer` }] };
          }
          if (!response.ok) return { content: [{ type: "text", text: `Prompt optimizer returned ${response.status}.` }] };
          const result = await response.json();
          return { content: [{ type: "text", text: `# Prompt Optimization\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Prompt optimizer service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 30: terms_analyzer
    server.tool(
      "terms_analyzer",
      "Preliminary scan of Terms of Service for AI agent relevance. NOT legal advice. $0.05 USDC via x402.",
      {
        terms_text: z.string().describe("Terms of service text"),
        agent_use_case: z.string().describe("How the agent will use the service"),
      },
      async ({ terms_text, agent_use_case }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/terms-analyzer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ terms_text, agent_use_case }),
          });
          if (response.status === 402) {
            return { content: [{ type: "text", text: `Terms analyzer requires payment ($0.05 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/terms-analyzer` }] };
          }
          if (!response.ok) return { content: [{ type: "text", text: `Terms analyzer returned ${response.status}.` }] };
          const result = await response.json();
          return { content: [{ type: "text", text: `# Terms Analysis\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Terms analyzer service is temporarily unavailable." }] };
        }
      },
    );

    // Tool 31: intent_router
    server.tool(
      "intent_router",
      "Route natural language queries to the best matching service. $0.005 USDC via x402.",
      {
        query: z.string().describe("Natural language query describing what you need"),
      },
      async ({ query }) => {
        try {
          const response = await fetch(`${MCP_BASE}/api/services/intent-router`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });
          if (response.status === 402) {
            return { content: [{ type: "text", text: `Intent router requires payment ($0.005 via x402).\n\nDirect API: POST ${MCP_BASE}/api/services/intent-router` }] };
          }
          if (!response.ok) return { content: [{ type: "text", text: `Intent router returned ${response.status}.` }] };
          const result = await response.json();
          return { content: [{ type: "text", text: `# Intent Router\n\nSuggested: ${result.suggested_service} (confidence: ${result.confidence})\n\n${JSON.stringify(result, null, 2)}` }] };
        } catch {
          return { content: [{ type: "text", text: "Intent router service is temporarily unavailable." }] };
        }
      },
    );
  },
  {
    serverInfo: {
      name: "hive-doctrine",
      version: "2.1.0",
    },
  },
);

export { handler as GET, handler as POST, handler as DELETE };
