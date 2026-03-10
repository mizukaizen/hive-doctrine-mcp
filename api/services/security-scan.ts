import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an AI security scanner from The Hive Doctrine. Analyse the provided system prompt or agent configuration for security vulnerabilities.

Check for:
- Prompt injection vectors (direct, indirect, recursive)
- Data leakage risks (PII exposure, secret leakage, context bleeding)
- Privilege escalation paths (tool misuse, authority bypass)
- Output manipulation risks (format injection, encoding attacks)
- Denial of service vectors (token exhaustion, infinite loops)
- Social engineering susceptibility (persona manipulation, authority spoofing)

Return ONLY valid JSON:
{
  "risk_level": "critical|high|medium|low",
  "vulnerabilities": [
    {
      "id": "V-001",
      "name": "Vulnerability name",
      "category": "injection|leakage|escalation|manipulation|dos|social",
      "severity": "critical|high|medium|low",
      "description": "What the vulnerability is",
      "exploit_scenario": "How an attacker could exploit this",
      "remediation": "How to fix it",
      "effort": "trivial|easy|moderate|hard"
    }
  ],
  "summary": {
    "total_vulnerabilities": 0,
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "hardening_checklist": ["Prioritised list of security improvements"]
}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { prompt: "System prompt or agent configuration to scan" },
  output: {
    example: {
      risk_level: "high",
      vulnerabilities: [{ id: "V-001", name: "No input sanitisation", severity: "high" }],
      summary: { total_vulnerabilities: 3, critical: 0, high: 1, medium: 1, low: 1 },
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
    price: "0.03",
    resource: "/api/services/security-scan",
    description: "Security Scan — $0.03 USDC per request",
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
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt.slice(0, 15000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("security-scan error:", err);
    return res.status(500).json({ error: "Service error — could not complete security scan" });
  }
}
