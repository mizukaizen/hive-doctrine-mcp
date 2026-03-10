import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a context window optimisation expert. Analyse the following prompt/context for token efficiency.

Your analysis should:
1. Estimate total token count (rough: 1 token ≈ 4 chars for English)
2. Break down token distribution by section/purpose
3. Identify wasted tokens (redundancy, unnecessary verbosity, dead instructions)
4. Produce an optimised version that preserves all semantic meaning
5. Calculate savings percentage

Return ONLY valid JSON:
{
  "total_tokens_est": <number>,
  "breakdown": {
    "<section_name>": { "tokens": <number>, "purpose": "<description>", "waste_level": "none|low|medium|high" }
  },
  "waste_pct": <0-100>,
  "optimised_version": "<compressed version of the context>",
  "savings_pct": <0-100>,
  "recommendations": ["specific optimisation tip 1", "tip 2"]
}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { context: "Full prompt or context window content to analyse" },
  output: {
    example: {
      total_tokens_est: 2400,
      breakdown: { system_instructions: { tokens: 800, purpose: "Agent behaviour rules", waste_level: "medium" } },
      waste_pct: 23,
      optimised_version: "...",
      savings_pct: 31,
      recommendations: ["Remove redundant instruction repetitions"],
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
    resource: "/api/services/context-analyse",
    description: "Context Window Analyser — $0.02 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { context } = req.body || {};
  if (!context || typeof context !== "string") {
    return res.status(400).json({ error: "context field required (string)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: context.slice(0, 20000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("context-analyse error:", err);
    return res.status(500).json({ error: "Service error — could not analyse context" });
  }
}
