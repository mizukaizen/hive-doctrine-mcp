import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";
import { serviceMeta, STANDARD_DISCLAIMER, HIGH_RISK_DISCLAIMER } from "../_disclaimer.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a fact-checking analysis tool for AI agents. Given a claim and optional context, assess whether the claim appears to be supported, likely refuted, or unverifiable based on your training knowledge. Be precise about confidence levels. Use hedged language: "likely supported", "appears to be", "based on available information". If you cannot assess with reasonable confidence, return "insufficient_information". Never claim absolute certainty. Always include caveats about the limitations of your assessment — you have a knowledge cutoff, you cannot access real-time information, and your training data may contain errors.

Return ONLY valid JSON:
{
  "verdict": "likely_supported" | "likely_refuted" | "unverifiable" | "insufficient_information",
  "confidence": <0.0-1.0>,
  "reasoning": "detailed reasoning with hedged language",
  "caveats": ["caveat 1", "caveat 2"],
  "sources_checked": ["knowledge domain 1", "knowledge domain 2"]
}
${STANDARD_DISCLAIMER}
${HIGH_RISK_DISCLAIMER}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { claim: "Claim to fact-check", context: "Optional context" },
  output: {
    example: {
      verdict: "likely_supported",
      confidence: 0.75,
      reasoning: "Based on available information, this claim appears to be...",
    },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const paid = await gatePayment(req, res, {
    price: "0.001",
    resource: "/api/services/fact-check",
    description: "Fact Check — $0.001 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { claim, context } = req.body || {};
  if (!claim || typeof claim !== "string") {
    return res.status(400).json({ error: "claim field required (string)" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    const userMsg = context ? `Claim: ${claim}\n\nContext: ${context}` : `Claim: ${claim}`;
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg.slice(0, 10000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json({ _meta: serviceMeta("fact-check"), ...result });
  } catch (err) {
    console.error("fact-check error:", err);
    return res.status(500).json({ error: "Service error" });
  }
}
