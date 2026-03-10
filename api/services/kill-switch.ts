import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";
import { serviceMeta, STANDARD_DISCLAIMER, HIGH_RISK_DISCLAIMER } from "../_disclaimer.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a budget and safety analysis tool for autonomous AI agents. An agent is requesting a preliminary assessment of whether a proposed action aligns with stated budget limits and safety rules. Analyze the action against the provided constraints. Default to recommending DENY when uncertain — it is always better to block a potentially harmful action than to approve one. Use output labels "proceed" (appears within parameters), "caution" (borderline — recommend human review), or "deny" (exceeds parameters or raises concerns). NEVER use language that implies authorization or approval — use "the action appears to fall within stated parameters" rather than "approved". Always include the note: "This is a preliminary automated analysis, not an authorization. The agent operator is solely responsible for all financial decisions. This service does not authorize, approve, or sanction any transaction."

Return ONLY valid JSON:
{
  "recommendation": "proceed|caution|deny",
  "reasoning": "detailed reasoning",
  "risk_factors": {
    "budget_analysis": "analysis of cost vs budget",
    "reversibility_assessment": "can this action be undone",
    "noted_concerns": ["concern 1"]
  },
  "important_note": "This is a preliminary automated analysis, not an authorization..."
}
${STANDARD_DISCLAIMER}
${HIGH_RISK_DISCLAIMER}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { action_description: "Buy 100 tokens", estimated_cost: 50, budget_limit: 100, safety_rules: [], risk_tolerance: "moderate" },
  output: {
    example: {
      recommendation: "proceed",
      reasoning: "The action appears to fall within stated parameters...",
      risk_factors: { budget_analysis: "50/100 budget", reversibility_assessment: "Partially reversible" },
    },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const paid = await gatePayment(req, res, {
    price: "0.05",
    resource: "/api/services/kill-switch",
    description: "Kill Switch — $0.05 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { action_description, estimated_cost, budget_limit, safety_rules, risk_tolerance } = req.body || {};
  if (!action_description || typeof action_description !== "string" || estimated_cost === undefined || budget_limit === undefined) {
    return res.status(400).json({ error: "action_description (string), estimated_cost (number), budget_limit (number) required" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    let userMsg = `Action: ${action_description}\nEstimated cost: $${estimated_cost}\nBudget limit: $${budget_limit}\nRisk tolerance: ${risk_tolerance || "moderate"}`;
    if (Array.isArray(safety_rules) && safety_rules.length > 0) {
      userMsg += `\nSafety rules:\n${safety_rules.map((r: string) => `- ${r}`).join("\n")}`;
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg.slice(0, 10000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json({ _meta: serviceMeta("kill-switch"), ...result });
  } catch (err) {
    console.error("kill-switch error:", err);
    return res.status(500).json({ error: "Service error" });
  }
}
