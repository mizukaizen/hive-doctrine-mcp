import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";
import { serviceMeta, STANDARD_DISCLAIMER, HIGH_RISK_DISCLAIMER } from "../_disclaimer.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a hallucination detection analysis tool. Compare the given output against the source material. Identify any claims in the output that do not appear to be supported by or that may contradict the source material. Score from 0 (no supported claims found) to 100 (all claims appear supported). Use hedged language throughout: "does not appear to be supported", "may contradict", "could not be verified against source". Always note limitations: you may miss subtle hallucinations, your analysis is itself AI-generated and fallible, and the source material itself may contain errors.

Return ONLY valid JSON:
{
  "score": <0-100>,
  "flagged_claims": [
    { "claim": "the claim text", "issue": "why it was flagged", "severity": "minor|moderate|major" }
  ],
  "faithful_claims_count": <number>,
  "total_claims_count": <number>,
  "assessment": "appears_clean|minor_discrepancies|significant_discrepancies",
  "limitations": ["limitation 1", "limitation 2"]
}
${STANDARD_DISCLAIMER}
${HIGH_RISK_DISCLAIMER}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { output: "AI output to check", source_material: "Original source material", task_description: "Optional task context" },
  output: {
    example: {
      score: 85,
      assessment: "minor_discrepancies",
      flagged_claims: [{ claim: "...", issue: "not found in source", severity: "minor" }],
    },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const paid = await gatePayment(req, res, {
    price: "0.10",
    resource: "/api/services/hallucination-check",
    description: "Hallucination Check — $0.10 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { output, source_material, task_description } = req.body || {};
  if (!output || typeof output !== "string" || !source_material || typeof source_material !== "string") {
    return res.status(400).json({ error: "output and source_material fields required (strings)" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    let userMsg = `OUTPUT TO CHECK:\n${output.slice(0, 20000)}\n\nSOURCE MATERIAL:\n${source_material.slice(0, 20000)}`;
    if (task_description) userMsg += `\n\nTASK CONTEXT:\n${task_description.slice(0, 2000)}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json({ _meta: serviceMeta("hallucination-check"), ...result });
  } catch (err) {
    console.error("hallucination-check error:", err);
    return res.status(500).json({ error: "Service error" });
  }
}
