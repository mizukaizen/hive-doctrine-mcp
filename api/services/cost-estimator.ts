import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an AI operations cost estimator from The Hive Doctrine. Given an agent configuration and usage pattern, estimate monthly operating costs.

Consider:
- LLM API costs (per model, per token, input vs output)
- Infrastructure (compute, storage, bandwidth)
- Third-party APIs and tools
- Memory/vector database costs
- Monitoring and logging
- Human oversight time

Use current 2026 pricing for major providers (Anthropic, OpenAI, Google, Upstash, Vercel, AWS, etc.).

Return ONLY valid JSON:
{
  "monthly_estimate": {
    "total_usd": 0,
    "confidence": "high|medium|low",
    "breakdown": {
      "llm_api": { "amount": 0, "details": "Model costs breakdown" },
      "infrastructure": { "amount": 0, "details": "Compute/storage" },
      "third_party": { "amount": 0, "details": "External services" },
      "memory_storage": { "amount": 0, "details": "Vector DB, persistence" },
      "monitoring": { "amount": 0, "details": "Logging, alerts" },
      "human_oversight": { "amount": 0, "details": "Estimated review time" }
    }
  },
  "scaling_notes": "How costs change at 2x, 5x, 10x volume",
  "cost_optimisation_tips": ["Specific ways to reduce costs"],
  "hidden_costs": ["Costs people typically forget"],
  "comparable_saas": "What equivalent SaaS products charge for similar functionality"
}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { config: "Agent configuration", usage: "Expected usage pattern (requests/day, etc.)" },
  output: {
    example: {
      monthly_estimate: { total_usd: 127.50, confidence: "medium" },
      cost_optimisation_tips: ["Use Haiku for simple tasks"],
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
    price: "0.02",
    resource: "/api/services/cost-estimator",
    description: "Cost Estimator — $0.02 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { config, usage } = req.body || {};
  if (!config || typeof config !== "string") {
    return res.status(400).json({ error: "config field required (string)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  const usageStr = usage ? `\n\nUsage pattern: ${usage}` : "";

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: (config + usageStr).slice(0, 15000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("cost-estimator error:", err);
    return res.status(500).json({ error: "Service error — could not estimate costs" });
  }
}
