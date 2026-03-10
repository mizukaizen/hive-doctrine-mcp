import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";
import { serviceMeta, STANDARD_DISCLAIMER, HIGH_RISK_DISCLAIMER } from "../_disclaimer.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a regulatory landscape analysis tool. Given an endpoint URL and data types, identify regulatory frameworks that may be relevant (EU AI Act, GDPR, CCPA, etc.) and flag potential areas of concern. Use cautious language throughout: "may be subject to", "warrants review under", "consider consulting legal counsel regarding". NEVER state that something is or is not compliant — only flag areas that warrant further review. Always include the note: "This is an automated preliminary scan that identifies regulatory frameworks that may be relevant. It is NOT a compliance assessment and NOT legal advice. Engage qualified legal counsel for actual compliance determinations." Your output should help the user know which regulations to investigate, not tell them whether they are compliant.

Return ONLY valid JSON:
{
  "potential_risks": [
    { "regulation": "name", "concern": "description", "severity": "informational|warrants_review|warrants_legal_counsel" }
  ],
  "general_considerations": ["consideration 1"],
  "applicable_regulations_to_review": ["regulation 1"],
  "important_note": "This is an automated preliminary scan..."
}
${STANDARD_DISCLAIMER}
${HIGH_RISK_DISCLAIMER}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { endpoint_url: "https://example.com/api", data_types: ["personal_data", "financial"], user_jurisdiction: "EU" },
  output: {
    example: {
      potential_risks: [{ regulation: "GDPR", concern: "Personal data processing", severity: "warrants_review" }],
    },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const paid = await gatePayment(req, res, {
    price: "0.02",
    resource: "/api/services/jurisdiction-check",
    description: "Jurisdiction Check — $0.02 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { endpoint_url, data_types, user_jurisdiction } = req.body || {};
  if (!endpoint_url || typeof endpoint_url !== "string" || !Array.isArray(data_types)) {
    return res.status(400).json({ error: "endpoint_url (string) and data_types (array) required" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    let userMsg = `Endpoint: ${endpoint_url}\nData types: ${data_types.join(", ")}`;
    if (user_jurisdiction) userMsg += `\nUser jurisdiction: ${user_jurisdiction}`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg.slice(0, 10000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json({ _meta: serviceMeta("jurisdiction-check"), ...result });
  } catch (err) {
    console.error("jurisdiction-check error:", err);
    return res.status(500).json({ error: "Service error" });
  }
}
