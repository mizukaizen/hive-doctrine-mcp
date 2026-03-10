import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a senior agent architect from The Hive Doctrine. Given requirements, design a complete agent architecture.

Return ONLY valid JSON:
{
  "architecture_name": "Descriptive name for this architecture",
  "overview": "2-3 sentence summary of the design",
  "agents": [
    {
      "name": "Agent name",
      "role": "Primary responsibility",
      "model": "Recommended LLM model",
      "tools": ["tool1", "tool2"],
      "memory": {
        "type": "episodic|semantic|procedural|hybrid",
        "persistence": "session|persistent|shared",
        "strategy": "How memory is managed"
      },
      "constraints": ["Hard constraints"],
      "escalation": "When and how to escalate"
    }
  ],
  "coordination": {
    "pattern": "stigmergic|hierarchical|peer-to-peer|hybrid",
    "communication": "How agents communicate",
    "conflict_resolution": "How conflicts are resolved",
    "handoff_protocol": "How work is handed between agents"
  },
  "infrastructure": {
    "deployment": "Docker|serverless|edge|hybrid",
    "monitoring": "Recommended monitoring approach",
    "cost_estimate": "Rough monthly cost estimate"
  },
  "risks": ["Key architectural risks"],
  "alternatives_considered": ["Other approaches and why they were rejected"]
}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { requirements: "Description of what the agent system needs to do" },
  output: {
    example: {
      architecture_name: "Research and Analysis Pipeline",
      overview: "Three-agent system for research, analysis, and reporting",
      agents: [{ name: "Marcus", role: "Research lead" }],
      coordination: { pattern: "stigmergic" },
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
    price: "0.10",
    resource: "/api/services/agent-architect",
    description: "Agent Architect — $0.10 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { requirements } = req.body || {};
  if (!requirements || typeof requirements !== "string") {
    return res.status(400).json({ error: "requirements field required (string)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: requirements.slice(0, 20000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("agent-architect error:", err);
    return res.status(500).json({ error: "Service error — could not generate architecture" });
  }
}
