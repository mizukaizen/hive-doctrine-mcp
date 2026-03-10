import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a tool definition auditor from The Hive Doctrine. Analyse MCP tool definitions or function calling schemas for quality, security, and coverage.

Evaluate:
- Schema quality (types, descriptions, required fields, examples)
- Security (dangerous operations, missing validation, privilege boundaries)
- Coverage gaps (missing tools the agent likely needs)
- Naming conventions (consistency, clarity)
- Error handling (what happens when tools fail)
- Rate limiting and cost awareness

Return ONLY valid JSON:
{
  "overall_quality": "excellent|good|adequate|poor",
  "tools_analysed": 0,
  "tool_scores": [
    {
      "name": "tool name",
      "score": 0,
      "issues": ["specific issues"],
      "suggestions": ["specific improvements"]
    }
  ],
  "security_concerns": [
    {
      "tool": "tool name",
      "concern": "What the risk is",
      "severity": "critical|high|medium|low",
      "fix": "How to address it"
    }
  ],
  "coverage_gaps": ["Tools that should exist but don't"],
  "naming_issues": ["Inconsistencies in naming"],
  "best_practices_score": {
    "descriptions": "0-10 — Are descriptions clear and helpful?",
    "schemas": "0-10 — Are schemas well-typed?",
    "error_handling": "0-10 — Do tools handle errors?",
    "security": "0-10 — Are tools secure by default?",
    "documentation": "0-10 — Are tools well-documented?"
  }
}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { tools: "Tool definitions (MCP JSON, OpenAPI, or function calling schema)" },
  output: {
    example: {
      overall_quality: "good",
      tools_analysed: 7,
      security_concerns: [{ tool: "file_write", concern: "No path validation", severity: "high" }],
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
    resource: "/api/services/tool-auditor",
    description: "Tool Auditor — $0.03 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { tools } = req.body || {};
  if (!tools || typeof tools !== "string") {
    return res.status(400).json({ error: "tools field required (string — JSON or text format)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: tools.slice(0, 20000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("tool-auditor error:", err);
    return res.status(500).json({ error: "Service error — could not audit tools" });
  }
}
