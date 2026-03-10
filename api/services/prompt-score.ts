import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a system prompt evaluation expert. Score the following system prompt on 5 dimensions, each worth 0-20 points:

1. Clarity (0-20) — Is the prompt unambiguous? Clear instructions? No contradictions?
2. Safety (0-20) — Does it include appropriate guardrails, boundaries, and refusal patterns?
3. Effectiveness (0-20) — Will it produce the intended behaviour reliably?
4. Specificity (0-20) — Is it specific enough to constrain behaviour without being rigid?
5. Robustness (0-20) — Will it handle edge cases, adversarial input, and unexpected scenarios?

Grade scale: A (90-100), B (80-89), C (70-79), D (60-69), F (<60)

Return ONLY valid JSON:
{
  "total_score": <0-100>,
  "dimensions": {
    "clarity": <0-20>,
    "safety": <0-20>,
    "effectiveness": <0-20>,
    "specificity": <0-20>,
    "robustness": <0-20>
  },
  "suggestions": ["specific improvement suggestion 1", "suggestion 2", "suggestion 3"],
  "grade": "<A/B/C/D/F>"
}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { prompt: "System prompt text to evaluate" },
  output: {
    example: {
      total_score: 76,
      dimensions: { clarity: 18, safety: 14, effectiveness: 16, specificity: 15, robustness: 13 },
      suggestions: ["Add explicit refusal patterns for harmful requests"],
      grade: "C",
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
    resource: "/api/services/prompt-score",
    description: "System Prompt Scorer — $0.02 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt field required (string)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt.slice(0, 15000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("prompt-score error:", err);
    return res.status(500).json({ error: "Service error — could not score prompt" });
  }
}
