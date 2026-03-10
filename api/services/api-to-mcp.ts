import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";
import { serviceMeta, STANDARD_DISCLAIMER } from "../_disclaimer.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert at converting REST APIs into MCP (Model Context Protocol) tool definitions. Given an API specification, generate MCP tool definitions with inputSchema, descriptions, and implementation notes. For each tool: name it using kebab-case, write a description that helps an agent understand when to use it, define a JSON Schema for inputs, and note authentication or pagination considerations. Also generate a server template scaffold. Prioritize the most useful endpoints if the API is large. Note that generated code is a starting point and should be reviewed, tested, and adapted before production use.

Return ONLY valid JSON:
{
  "mcp_tools": [
    {
      "name": "tool-name",
      "description": "When to use this tool",
      "inputSchema": { "type": "object", "properties": {}, "required": [] },
      "implementation_notes": "Auth, pagination, error handling notes"
    }
  ],
  "server_template": "TypeScript server scaffold code",
  "estimated_endpoints": <number>,
  "complexity_assessment": "simple|moderate|complex"
}
${STANDARD_DISCLAIMER}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { api_spec: "OpenAPI/REST spec text", api_type: "openapi|rest-description|graphql-schema", target_tools: [] },
  output: {
    example: {
      mcp_tools: [{ name: "get-users", description: "Fetch users", inputSchema: {} }],
      estimated_endpoints: 5,
      complexity_assessment: "moderate",
    },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const paid = await gatePayment(req, res, {
    price: "1.50",
    resource: "/api/services/api-to-mcp",
    description: "API-to-MCP Converter — $1.50 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { api_spec, api_type, target_tools } = req.body || {};
  if (!api_spec || typeof api_spec !== "string") {
    return res.status(400).json({ error: "api_spec field required (string)" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    let userMsg = `API type: ${api_type || "openapi"}\n\nAPI Specification:\n${api_spec.slice(0, 50000)}`;
    if (Array.isArray(target_tools) && target_tools.length > 0) {
      userMsg += `\n\nPrioritise these endpoints: ${target_tools.join(", ")}`;
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json({ _meta: serviceMeta("api-to-mcp"), ...result });
  } catch (err) {
    console.error("api-to-mcp error:", err);
    return res.status(500).json({ error: "Service error" });
  }
}
