import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a regulatory compliance checker for AI agents from The Hive Doctrine. Check agent configurations against major regulatory frameworks.

Frameworks to check:
1. **EU AI Act** — Risk classification, transparency requirements, human oversight
2. **NIST AI RMF** — Governance, mapping, measurement, management
3. **ISO 42001** — AI management system requirements
4. **GDPR** — Data processing, consent, right to explanation
5. **SOC 2** — Security, availability, processing integrity, confidentiality, privacy

Return ONLY valid JSON:
{
  "risk_classification": {
    "eu_ai_act": "unacceptable|high|limited|minimal",
    "rationale": "Why this classification"
  },
  "compliance_scores": {
    "eu_ai_act": { "score": 0, "max": 10, "gaps": ["specific gaps"] },
    "nist_ai_rmf": { "score": 0, "max": 10, "gaps": ["specific gaps"] },
    "iso_42001": { "score": 0, "max": 10, "gaps": ["specific gaps"] },
    "gdpr": { "score": 0, "max": 10, "gaps": ["specific gaps"] },
    "soc2": { "score": 0, "max": 10, "gaps": ["specific gaps"] }
  },
  "overall_compliance": "compliant|partially_compliant|non_compliant",
  "critical_gaps": [
    {
      "framework": "Which framework",
      "requirement": "What's required",
      "current_state": "What's missing",
      "remediation": "How to fix",
      "priority": "immediate|short_term|medium_term"
    }
  ],
  "documentation_needed": ["Documents that should exist but don't"],
  "recommendations": ["Prioritised compliance improvements"]
}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { config: "Agent configuration to check for compliance" },
  output: {
    example: {
      risk_classification: { eu_ai_act: "limited", rationale: "Customer-facing chatbot" },
      overall_compliance: "partially_compliant",
      critical_gaps: [{ framework: "GDPR", requirement: "Right to explanation" }],
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
    price: "0.05",
    resource: "/api/services/compliance-check",
    description: "Compliance Check — $0.05 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { config } = req.body || {};
  if (!config || typeof config !== "string") {
    return res.status(400).json({ error: "config field required (string)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: config.slice(0, 20000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("compliance-check error:", err);
    return res.status(500).json({ error: "Service error — could not complete compliance check" });
  }
}
