import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";
import { serviceMeta, STANDARD_DISCLAIMER, HIGH_RISK_DISCLAIMER } from "../_disclaimer.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a heuristic risk analysis tool for x402/MCP endpoints. Analyze the given endpoint URL, agent card, and payment details for potential red flags using pattern matching and heuristics. Check for: suspicious URL patterns, unusual pricing, missing or malformed agent cards, potential typosquatting, and inconsistencies. Use cautious language: "no obvious red flags detected" rather than "safe", "multiple concerns identified" rather than "dangerous". Always include a limitations section noting: you cannot verify the actual behaviour of an endpoint, you cannot access real-time threat databases, your assessment is based on surface-level pattern analysis only, and a clean result does NOT guarantee an endpoint is legitimate. Never use the word "safe" in your output — use "no obvious red flags detected" instead.

Return ONLY valid JSON:
{
  "risk_score": <0-100>,
  "risk_assessment": "no_obvious_red_flags|some_concerns|multiple_red_flags|strongly_suspicious",
  "flags": [
    { "flag": "flag name", "severity": "low|medium|high|critical", "detail": "explanation" }
  ],
  "recommendation": "hedged recommendation",
  "limitations": ["limitation 1", "limitation 2"]
}
${STANDARD_DISCLAIMER}
${HIGH_RISK_DISCLAIMER}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { endpoint_url: "https://example.com/api/service", agent_card: {}, payment_details: {} },
  output: {
    example: {
      risk_score: 25,
      risk_assessment: "no_obvious_red_flags",
      flags: [],
      limitations: ["Cannot verify actual endpoint behaviour"],
    },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const paid = await gatePayment(req, res, {
    price: "0.001",
    resource: "/api/services/anti-scam-check",
    description: "Anti-Scam Check — $0.001 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { endpoint_url, agent_card, payment_details } = req.body || {};
  if (!endpoint_url || typeof endpoint_url !== "string") {
    return res.status(400).json({ error: "endpoint_url field required (string)" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    let userMsg = `Endpoint URL: ${endpoint_url}`;
    if (agent_card) userMsg += `\n\nAgent Card:\n${JSON.stringify(agent_card, null, 2).slice(0, 5000)}`;
    if (payment_details) userMsg += `\n\nPayment Details:\n${JSON.stringify(payment_details, null, 2).slice(0, 2000)}`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json({ _meta: serviceMeta("anti-scam-check"), ...result });
  } catch (err) {
    console.error("anti-scam-check error:", err);
    return res.status(500).json({ error: "Service error" });
  }
}
