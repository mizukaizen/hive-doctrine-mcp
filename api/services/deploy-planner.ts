import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a deployment planning specialist from The Hive Doctrine. Given an agent configuration and infrastructure constraints, produce a deployment plan.

Consider deployment options:
- Docker containers (self-hosted VPS)
- Serverless (Vercel, AWS Lambda, Cloudflare Workers)
- Edge computing (Cloudflare, Deno Deploy)
- Managed platforms (Coolify, Railway, Fly.io)
- Hybrid approaches

Return ONLY valid JSON:
{
  "recommended_deployment": "docker|serverless|edge|managed|hybrid",
  "rationale": "Why this deployment model fits",
  "architecture": {
    "components": [
      {
        "name": "Component name",
        "type": "api|worker|scheduler|database|cache|queue",
        "deployment": "Where and how to deploy",
        "scaling": "How it scales",
        "cost_estimate": "Monthly cost"
      }
    ],
    "networking": "How components communicate",
    "data_flow": "How data moves through the system"
  },
  "infrastructure_as_code": {
    "tool": "Docker Compose|Terraform|Pulumi|none",
    "key_config": "Essential configuration snippet or description"
  },
  "monitoring": {
    "health_checks": ["What to monitor"],
    "alerting": "Recommended alerting approach",
    "logging": "Log aggregation strategy"
  },
  "security": {
    "secrets_management": "How to handle API keys and secrets",
    "network_security": "Firewall, VPN, etc.",
    "access_control": "Who can deploy and manage"
  },
  "estimated_monthly_cost": {
    "minimum": 0,
    "typical": 0,
    "at_scale": 0
  },
  "migration_path": "How to move between deployment models if needed",
  "gotchas": ["Common deployment mistakes for this type of system"]
}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { config: "Agent configuration", constraints: "Infrastructure constraints (budget, region, etc.)" },
  output: {
    example: {
      recommended_deployment: "hybrid",
      rationale: "API on serverless, workers on Docker",
      estimated_monthly_cost: { minimum: 15, typical: 45, at_scale: 200 },
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
    resource: "/api/services/deploy-planner",
    description: "Deploy Planner — $0.03 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { config, constraints } = req.body || {};
  if (!config || typeof config !== "string") {
    return res.status(400).json({ error: "config field required (string)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  const constraintStr = constraints ? `\n\nConstraints: ${constraints}` : "";

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: (config + constraintStr).slice(0, 15000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("deploy-planner error:", err);
    return res.status(500).json({ error: "Service error — could not generate deployment plan" });
  }
}
