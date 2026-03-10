import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a security threat modelling expert. Given a system description, produce a comprehensive threat model.

Analyse using STRIDE methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).

Return ONLY valid JSON:
{
  "system_summary": "Brief summary of the system analysed",
  "threat_categories": [
    {
      "category": "STRIDE category",
      "threats": [
        {
          "id": "T-001",
          "name": "Threat name",
          "description": "What could happen",
          "severity": "critical|high|medium|low",
          "likelihood": "high|medium|low",
          "attack_vector": "How the attack would work",
          "mitigation": "How to defend against it"
        }
      ]
    }
  ],
  "risk_matrix": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "priority_mitigations": ["Top 3 things to fix first"],
  "assumptions": ["Security assumptions made during analysis"]
}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { system: "Description of the system to threat model" },
  output: {
    example: {
      system_summary: "Multi-agent AI system with shared memory",
      threat_categories: [{ category: "Tampering", threats: [{ id: "T-001", name: "Prompt injection" }] }],
      risk_matrix: { critical: 1, high: 2, medium: 3, low: 1 },
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
    resource: "/api/services/threat-model",
    description: "Threat Model Generator — $0.05 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { system } = req.body || {};
  if (!system || typeof system !== "string") {
    return res.status(400).json({ error: "system field required (string)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: system.slice(0, 15000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("threat-model error:", err);
    return res.status(500).json({ error: "Service error — could not generate threat model" });
  }
}
