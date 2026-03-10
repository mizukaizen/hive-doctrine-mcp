import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Index } from "@upstash/vector";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const MCP_BASE = "https://hive-doctrine-mcp.vercel.app";

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { query: "semantic search query", top_k: 5, collection_filter: "optional collection name" },
  output: {
    example: {
      results: [
        {
          id: "HD-2001",
          title: "What is Stigmergy?",
          tier: "pollen",
          collection: "core",
          score: 0.92,
          preview: "Coordination through environment...",
          purchase_url: "https://hive-doctrine-mcp.vercel.app/api/products/HD-2001",
        },
      ],
    },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const paid = await gatePayment(req, res, {
    price: "0.005",
    resource: "/api/services/context-lookup",
    description: "Context Lookup — $0.005 USDC per query",
    extensions: discovery,
  });
  if (!paid) return;

  const { query, top_k, collection_filter } = req.body || {};
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query field required (string)" });
  }

  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (!url || !token) {
    return res.status(503).json({ error: "Service not configured — vector index not available" });
  }

  try {
    const index = new Index({ url, token });

    const queryOpts: { data: string; topK: number; includeMetadata: boolean; filter?: string } = {
      data: query,
      topK: Math.min(top_k || 5, 20),
      includeMetadata: true,
    };

    if (collection_filter && typeof collection_filter === "string") {
      queryOpts.filter = `collection = '${collection_filter.replace(/'/g, "")}'`;
    }

    const results = await index.query(queryOpts);

    const enriched = results.map((r: any) => {
      const meta = r.metadata || {};
      const isFree = meta.tier === "pollen" || meta.price === 0;

      return {
        id: meta.id || r.id,
        title: meta.title || "Unknown",
        tier: meta.tier || "unknown",
        collection: meta.collection || "unknown",
        price: meta.price || 0,
        score: Math.round((r.score || 0) * 1000) / 1000,
        preview: isFree
          ? (r.data || "").slice(0, 500)
          : (meta.title ? `${meta.title} — ${meta.collection}. ` : "") + "Purchase for full content.",
        purchase_url: isFree ? null : `${MCP_BASE}/api/products/${meta.id || r.id}`,
        keywords: meta.keywords || "",
      };
    });

    return res.status(200).json({
      query,
      result_count: enriched.length,
      results: enriched,
    });
  } catch (err) {
    console.error("context-lookup error:", err);
    return res.status(500).json({ error: "Service error — could not query vector index" });
  }
}
