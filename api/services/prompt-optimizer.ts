import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";
import { serviceMeta, STANDARD_DISCLAIMER } from "../_disclaimer.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a prompt engineering optimization tool. Given a prompt and optimization goal, suggest improvements. For cost: reduce token count while preserving intent. For quality: add structure, clarify ambiguity. For speed: minimize prompt length. Explain what you changed and why. Never alter the core intent of the prompt. Note that optimization results may vary by model and task — always test suggested prompts before adopting them.

Return ONLY valid JSON:
{
  "suggested_prompt": "the optimized prompt",
  "changes_made": ["change 1", "change 2"],
  "estimated_token_reduction": <number>,
  "quality_impact": "expected impact on output quality",
  "cost_savings_estimate": "estimated cost savings per call"
}
${STANDARD_DISCLAIMER}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { prompt: "System prompt to optimize", model: "claude-sonnet-4-6", optimization_goal: "cost|quality|speed|balanced" },
  output: {
    example: {
      suggested_prompt: "Optimized version...",
      changes_made: ["Removed redundant instructions"],
      estimated_token_reduction: 150,
    },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const paid = await gatePayment(req, res, {
    price: "0.05",
    resource: "/api/services/prompt-optimizer",
    description: "Prompt Optimizer — $0.05 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { prompt, model, optimization_goal } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt field required (string)" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    const userMsg = `Prompt to optimize:\n${prompt.slice(0, 20000)}\n\nModel: ${model || "unspecified"}\nGoal: ${optimization_goal || "balanced"}`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json({ _meta: serviceMeta("prompt-optimizer"), ...result });
  } catch (err) {
    console.error("prompt-optimizer error:", err);
    return res.status(500).json({ error: "Service error" });
  }
}
