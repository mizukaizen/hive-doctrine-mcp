import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a multi-agent system planner from The Hive Doctrine. Given a complex task, decompose it into a multi-agent execution plan.

Return ONLY valid JSON:
{
  "task_summary": "What needs to be accomplished",
  "complexity": "low|medium|high|critical",
  "agents": [
    {
      "name": "Suggested agent name",
      "role": "What this agent does",
      "responsibilities": ["specific task 1", "specific task 2"],
      "inputs": ["What this agent needs to start"],
      "outputs": ["What this agent produces"],
      "model_recommendation": "Which LLM model suits this role",
      "estimated_tokens": "Rough token usage estimate"
    }
  ],
  "execution_flow": [
    {
      "phase": 1,
      "description": "Phase description",
      "agents_involved": ["agent1", "agent2"],
      "dependencies": [],
      "parallel": true
    }
  ],
  "handoff_protocol": {
    "format": "How data passes between agents",
    "error_handling": "What happens when an agent fails",
    "human_checkpoints": ["Where human review is needed"]
  },
  "estimated_cost": "Rough cost estimate for the full run",
  "risks": ["Key risks in this decomposition"],
  "alternative_approaches": ["Simpler alternatives if this is overengineered"]
}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { task: "Description of the complex task to decompose" },
  output: {
    example: {
      task_summary: "Build and deploy a customer support bot",
      complexity: "medium",
      agents: [{ name: "Architect", role: "System design" }],
      execution_flow: [{ phase: 1, description: "Design phase" }],
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
    resource: "/api/services/multi-agent-planner",
    description: "Multi-Agent Planner — $0.10 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { task } = req.body || {};
  if (!task || typeof task !== "string") {
    return res.status(400).json({ error: "task field required (string)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: task.slice(0, 20000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("multi-agent-planner error:", err);
    return res.status(500).json({ error: "Service error — could not generate plan" });
  }
}
