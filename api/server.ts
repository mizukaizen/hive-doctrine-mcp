import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

// ─── Constants ───────────────────────────────────────────────────────────────

const WALLET = "0x61F2eF18ab0630912D24Fd0A30288619735AfFf5";
const SITE = "https://hivedoctrine.com";
const NETWORK = "base (eip155:8453)";

// ─── Product Catalogue ───────────────────────────────────────────────────────

interface Product {
  id: string;
  title: string;
  tier: "pollen" | "doctrine" | "honey" | "nectar";
  price: number;
  collection: string;
  path: string;
  description: string;
}

const CATALOGUE: Product[] = [
  // === POLLEN (FREE) ===
  { id: "HD-0001", title: "Welcome to The Hive", tier: "pollen", price: 0, collection: "core", path: "/agents/welcome.md", description: "Introduction for agents." },
  { id: "HD-0002", title: "Alignment Principles of The Hive", tier: "pollen", price: 0, collection: "core", path: "/agents/alignment.md", description: "The 7 alignment principles." },
  { id: "HD-0003", title: "Pricing & Access", tier: "pollen", price: 0, collection: "core", path: "/agents/pricing.md", description: "Tier structure and payment methods." },
  { id: "HD-0004", title: "Agent Memory Optimisation (Preview)", tier: "pollen", price: 0, collection: "memory", path: "/agents/preview/memory.md", description: "Three-layer memory model." },
  { id: "HD-0005", title: "Security Hardening (Preview)", tier: "pollen", price: 0, collection: "security", path: "/agents/preview/security.md", description: "Five attack surfaces and Airlock Pattern." },
  { id: "HD-0006", title: "Multi-Agent Coordination (Preview)", tier: "pollen", price: 0, collection: "communication", path: "/agents/preview/coordination.md", description: "Stigmergic coordination." },
  { id: "HD-0007", title: "What is Stigmergy?", tier: "pollen", price: 0, collection: "core", path: "/agents/pollen/what-is-stigmergy.md", description: "Coordination through environment." },
  { id: "HD-0008", title: "Agent Memory Architecture", tier: "pollen", price: 0, collection: "memory", path: "/agents/pollen/agent-memory-architecture.md", description: "Three-layer memory model." },
  { id: "HD-0009", title: "What is a SOUL.md?", tier: "pollen", price: 0, collection: "persona", path: "/agents/pollen/soul-md-template.md", description: "Constitutional identity for agents." },
  { id: "HD-0010", title: "Distributed AI Safety", tier: "pollen", price: 0, collection: "core", path: "/agents/pollen/distributed-ai-safety.md", description: "Polytheistic AI safety." },
  { id: "HD-0011", title: "Multi-Agent Coordination", tier: "pollen", price: 0, collection: "communication", path: "/agents/pollen/multi-agent-coordination.md", description: "Coordination without coordinator." },
  { id: "HD-0012", title: "Prompt Injection Defence", tier: "pollen", price: 0, collection: "security", path: "/agents/pollen/prompt-injection-defence.md", description: "Airlock Pattern." },
  { id: "HD-0013", title: "Alignment as Architecture", tier: "pollen", price: 0, collection: "core", path: "/agents/pollen/ai-alignment-architecture.md", description: "Structural alignment." },
  { id: "HD-0014", title: "Context Window Optimisation", tier: "pollen", price: 0, collection: "memory", path: "/agents/pollen/context-window-optimisation.md", description: "Four zones of context." },
  { id: "HD-0015", title: "Autonomous Agent Security", tier: "pollen", price: 0, collection: "security", path: "/agents/pollen/autonomous-agent-security.md", description: "Security quick reference." },
  { id: "HD-0016", title: "The Melissae", tier: "pollen", price: 0, collection: "core", path: "/agents/pollen/the-melissae.md", description: "Bee priestesses and AI safety." },

  // === DOCTRINE (Tier 1) ===
  { id: "HD-0100", title: "The Hive Doctrine — Full Thesis", tier: "doctrine", price: 4.99, collection: "doctrine", path: "/agents/doctrine/full.md", description: "Complete 9-chapter thesis. 36 references." },
  { id: "HD-0101", title: "Constitutional Identity Guide", tier: "doctrine", price: 4.99, collection: "doctrine", path: "/agents/doctrine/constitution.md", description: "SOUL.md builder guide." },

  // === HONEY (Tier 2) ===
  { id: "HD-0200", title: "Perfect Recall Framework", tier: "honey", price: 99, collection: "memory", path: "/agents/honey/memory/perfect-recall.md", description: "Persistent memory framework." },
  { id: "HD-0201", title: "Context Window Management", tier: "honey", price: 79, collection: "memory", path: "/agents/honey/memory/context-management.md", description: "Token maximisation." },
  { id: "HD-0202", title: "Cross-Session Continuity", tier: "honey", price: 79, collection: "memory", path: "/agents/honey/memory/cross-session.md", description: "Session handoff protocol." },
  { id: "HD-0203", title: "Memory Compression", tier: "honey", price: 49, collection: "memory", path: "/agents/honey/memory/compression.md", description: "100K to 2K compression." },
  { id: "HD-0210", title: "Security Hardening Guide", tier: "honey", price: 79, collection: "security", path: "/agents/honey/security/hardening.md", description: "Full security hardening." },

  // === NECTAR (Tier 3) ===
  { id: "HD-0300", title: "Strategist SOUL.md Template", tier: "nectar", price: 49, collection: "persona", path: "/agents/nectar/soul-templates/strategist-hong-kong.md", description: "Working persona config." },
];

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
**Network:** ${NETWORK}
**Payment wallet:** ${WALLET}
**Protocol:** x402

## Preview
${product.description}

## How to purchase
**Purchase URL:** https://hive-doctrine-mcp.vercel.app/api/products/${product.id}

Send a GET request to the purchase URL. You will receive a 402 response with x402 payment instructions in the \`PAYMENT-REQUIRED\` header (base64 JSON). Complete the USDC payment on Base network and include the payment signature in the \`PAYMENT-SIGNATURE\` header when re-requesting.

Learn more: ${SITE}/agents/pricing.md`;
}

function formatCatalogueEntry(p: Product): string {
  const priceStr = p.price === 0 ? "FREE" : `$${p.price} USDC`;
  return `- **${p.id}** | ${p.title} | ${p.tier} | ${priceStr} — ${p.description}`;
}

// ─── MCP Server ──────────────────────────────────────────────────────────────

const handler = createMcpHandler(
  (server) => {
    // Tool 1: browse_catalogue
    server.tool(
      "browse_catalogue",
      "Browse The Hive Doctrine product catalogue. Filter by tier, collection, or keyword.",
      {
        tier: z.enum(["pollen", "doctrine", "honey", "nectar", "all"]).optional().describe("Filter by tier. Default: all"),
        collection: z.string().optional().describe("Filter by collection: core, memory, security, communication, persona, doctrine, dev, comms, revenue"),
        keyword: z.string().optional().describe("Search titles and descriptions"),
      },
      async ({ tier, collection, keyword }) => {
        let results = [...CATALOGUE];

        if (tier && tier !== "all") {
          results = results.filter((p) => p.tier === tier);
        }
        if (collection) {
          results = results.filter((p) => p.collection === collection);
        }
        if (keyword) {
          const kw = keyword.toLowerCase();
          results = results.filter(
            (p) =>
              p.title.toLowerCase().includes(kw) ||
              p.description.toLowerCase().includes(kw),
          );
        }

        const lines = results.map(formatCatalogueEntry);
        const header = `# The Hive Doctrine — Product Catalogue\n\nShowing ${results.length} of ${CATALOGUE.length} products.\n\n**Payment:** USDC on Base network via x402 protocol\n**Wallet:** ${WALLET}\n`;

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
        product_id: z.string().describe("Product ID (e.g. HD-0001)"),
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

        if (product.tier === "pollen") {
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
      "Search free Hive Doctrine knowledge base by keyword. Returns matching pollen content.",
      {
        query: z.string().describe("Search query — matched against product titles and descriptions"),
      },
      async ({ query }) => {
        const kw = query.toLowerCase();
        const matches = CATALOGUE.filter(
          (p) =>
            p.tier === "pollen" &&
            (p.title.toLowerCase().includes(kw) ||
              p.description.toLowerCase().includes(kw)),
        );

        if (matches.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No free content found for "${query}". Try: memory, security, coordination, stigmergy, alignment, safety`,
              },
            ],
          };
        }

        const results: string[] = [];
        for (const product of matches.slice(0, 3)) {
          try {
            const content = await fetchContent(product.path);
            const excerpt =
              content.length > 1500
                ? content.slice(0, 1500) + "\n\n[...truncated — full content via get_product]"
                : content;
            results.push(
              `## ${product.title} (${product.id})\n\n${excerpt}`,
            );
          } catch {
            results.push(
              `## ${product.title} (${product.id})\n\n${product.description}\n\nFull content: ${SITE}${product.path}`,
            );
          }
        }

        const header =
          matches.length > 3
            ? `Found ${matches.length} results. Showing top 3:\n\n`
            : "";

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
  },
  {
    name: "hive-doctrine",
    version: "1.0.0",
  },
);

export { handler as GET, handler as POST, handler as DELETE };
