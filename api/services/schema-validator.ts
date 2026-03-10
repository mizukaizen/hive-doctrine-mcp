import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";
import { serviceMeta, STANDARD_DISCLAIMER } from "../_disclaimer.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a schema analysis tool for AI agent infrastructure. Analyze the given schema against its type specification and flag potential issues. Check for: required fields, correct types, naming conventions, description quality, and common mistakes. For MCP tools, check inputSchema, required fields, and description completeness. For agent cards, check ERC-8004 compliance. Provide actionable suggestions. Note that your analysis is heuristic and may miss issues or flag false positives.

Return ONLY valid JSON:
{
  "appears_valid": true|false,
  "potential_errors": [
    { "path": "$.field.name", "message": "description of issue" }
  ],
  "warnings": [
    { "path": "$.field.name", "message": "description of warning" }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"]
}
${STANDARD_DISCLAIMER}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { schema: {}, schema_type: "mcp-tool | openapi | json-schema | agent-card" },
  output: {
    example: {
      appears_valid: true,
      potential_errors: [],
      warnings: [{ path: "$.description", message: "Description could be more specific" }],
    },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const paid = await gatePayment(req, res, {
    price: "0.001",
    resource: "/api/services/schema-validator",
    description: "Schema Validator — $0.001 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { schema, schema_type } = req.body || {};
  if (!schema) {
    return res.status(400).json({ error: "schema field required" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    const schemaStr = typeof schema === "string" ? schema : JSON.stringify(schema, null, 2);
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Schema type: ${schema_type || "json-schema"}\n\n${schemaStr.slice(0, 15000)}` }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json({ _meta: serviceMeta("schema-validator"), ...result });
  } catch (err) {
    console.error("schema-validator error:", err);
    return res.status(500).json({ error: "Service error" });
  }
}
