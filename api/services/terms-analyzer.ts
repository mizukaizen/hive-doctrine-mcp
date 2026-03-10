import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";
import { serviceMeta, STANDARD_DISCLAIMER, HIGH_RISK_DISCLAIMER } from "../_disclaimer.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a terms-of-service preliminary analysis tool. Parse the given terms/API documentation and flag sections that may be relevant to AI agent usage. Identify: potential restrictions on automated access, rate limits, data usage limitations, redistribution prohibitions, and liability clauses. Use cautious language: "this section may restrict", "warrants review", "consider whether this applies". NEVER state that something is or is not permitted — only flag areas that warrant further review. Always include the note: "This is an automated preliminary scan of terms. It is NOT a legal interpretation and NOT legal advice. Consult qualified legal counsel before relying on any assessment of terms of service."

Return ONLY valid JSON:
{
  "preliminary_assessment": "brief overall assessment",
  "potential_restrictions": [
    { "concern": "description", "severity": "informational|warrants_review|warrants_legal_counsel", "relevant_excerpt": "quoted text" }
  ],
  "noted_permissions": ["permission 1"],
  "areas_for_review": ["area 1"],
  "important_note": "This is an automated preliminary scan..."
}
${STANDARD_DISCLAIMER}
${HIGH_RISK_DISCLAIMER}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { terms_text: "Terms of service text", agent_use_case: "How the agent will use the API" },
  output: {
    example: {
      preliminary_assessment: "Several sections may warrant review for agent usage...",
      potential_restrictions: [{ concern: "Automated access", severity: "warrants_review" }],
    },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const paid = await gatePayment(req, res, {
    price: "0.05",
    resource: "/api/services/terms-analyzer",
    description: "Terms Analyzer — $0.05 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { terms_text, agent_use_case } = req.body || {};
  if (!terms_text || typeof terms_text !== "string" || !agent_use_case || typeof agent_use_case !== "string") {
    return res.status(400).json({ error: "terms_text and agent_use_case fields required (strings)" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    const userMsg = `Terms of Service:\n${terms_text.slice(0, 30000)}\n\nAgent use case: ${agent_use_case.slice(0, 2000)}`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json({ _meta: serviceMeta("terms-analyzer"), ...result });
  } catch (err) {
    console.error("terms-analyzer error:", err);
    return res.status(500).json({ error: "Service error" });
  }
}
