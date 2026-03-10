import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";
import { serviceMeta, STANDARD_DISCLAIMER } from "../_disclaimer.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AVAILABLE_SERVICES = [
  "alignment-check", "prompt-score", "context-analyse", "name-generator", "readme-to-agents",
  "context-lookup", "agent-audit", "threat-model", "agent-architect", "soul-generator",
  "multi-agent-planner", "security-scan", "cost-estimator", "memory-designer", "tool-auditor",
  "compliance-check", "deploy-planner", "fact-check", "hallucination-check", "schema-validator",
  "anti-scam-check", "context-optimizer", "jurisdiction-check", "kill-switch", "api-to-mcp",
  "vibe-audit", "prompt-optimizer", "terms-analyzer",
];

const SYSTEM_PROMPT = `You are a service routing tool for the Hive Doctrine MCP ecosystem. Given a natural language query, suggest which service in the catalogue may best match the intent.

Available services: ${AVAILABLE_SERVICES.join(", ")}

Suggest the best match and alternatives. If no service clearly matches, say so.

Return ONLY valid JSON:
{
  "suggested_service": "service-name",
  "confidence": <0.0-1.0>,
  "reasoning": "why this service matches",
  "alternatives": [
    { "service": "service-name", "relevance": <0.0-1.0> }
  ],
  "suggested_input": {}
}
${STANDARD_DISCLAIMER}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { query: "Natural language query describing what you need", available_services: [] },
  output: {
    example: {
      suggested_service: "security-scan",
      confidence: 0.85,
      reasoning: "Query mentions prompt security...",
      alternatives: [{ service: "threat-model", relevance: 0.6 }],
    },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const paid = await gatePayment(req, res, {
    price: "0.005",
    resource: "/api/services/intent-router",
    description: "Intent Router — $0.005 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { query, available_services } = req.body || {};
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query field required (string)" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    let userMsg = `Query: ${query.slice(0, 5000)}`;
    if (Array.isArray(available_services) && available_services.length > 0) {
      userMsg += `\n\nLimit to these services: ${available_services.join(", ")}`;
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json({ _meta: serviceMeta("intent-router"), ...result });
  } catch (err) {
    console.error("intent-router error:", err);
    return res.status(500).json({ error: "Service error" });
  }
}
