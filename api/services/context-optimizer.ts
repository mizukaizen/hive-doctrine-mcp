import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";
import { serviceMeta, STANDARD_DISCLAIMER } from "../_disclaimer.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an LLM configuration optimization tool. Given a task type and model, suggest inference parameters that may improve results. Consider: temperature (lower for factual tasks, higher for creative), top_p, max_tokens (to reduce waste), and context window strategy. Explain your reasoning and note tradeoffs. These are suggestions based on general best practices — actual optimal settings depend on the specific use case and should be tested.

Return ONLY valid JSON:
{
  "suggested": {
    "temperature": <number>,
    "top_p": <number>,
    "max_tokens": <number>,
    "context_window_strategy": "description"
  },
  "reasoning": "why these settings",
  "estimated_cost_impact": "how this affects cost",
  "quality_tradeoffs": "what quality changes to expect"
}
${STANDARD_DISCLAIMER}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { task_type: "code generation", model: "claude-sonnet-4-6", current_settings: {} },
  output: {
    example: { suggested: { temperature: 0.3, top_p: 0.9, max_tokens: 4096 }, reasoning: "..." },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const paid = await gatePayment(req, res, {
    price: "0.02",
    resource: "/api/services/context-optimizer",
    description: "Context Optimizer — $0.02 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { task_type, model, current_settings } = req.body || {};
  if (!task_type || typeof task_type !== "string" || !model || typeof model !== "string") {
    return res.status(400).json({ error: "task_type and model fields required (strings)" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    let userMsg = `Task type: ${task_type}\nModel: ${model}`;
    if (current_settings) userMsg += `\nCurrent settings: ${JSON.stringify(current_settings)}`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg.slice(0, 5000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json({ _meta: serviceMeta("context-optimizer"), ...result });
  } catch (err) {
    console.error("context-optimizer error:", err);
    return res.status(500).json({ error: "Service error" });
  }
}
