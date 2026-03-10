import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert agent configuration auditor from The Hive Doctrine. Evaluate the provided agent configuration across 10 dimensions. Be specific, actionable, and reference known agent engineering patterns.

Score each dimension 0-10:

1. **Identity Coherence** — Is the agent identity well-defined and consistent? Clear name, role, voice, boundaries?
2. **Security Posture** — Prompt injection defence, input validation, output filtering, secret handling?
3. **Capability Coverage** — Are tools well-defined? Are there gaps in what the agent needs vs what it has?
4. **Memory Architecture** — Is context management explicit and effective? Persistence strategy?
5. **Coordination Design** — Multi-agent communication patterns, handoff protocols, escalation paths?
6. **Alignment Structure** — Are values/constraints built into architecture, not just instructions?
7. **Error Handling** — Graceful degradation, fallbacks, circuit breakers, timeout handling?
8. **Operational Readiness** — Monitoring, logging, cost awareness, deployment config?
9. **Scalability** — Can this agent handle increased load/complexity? Resource constraints defined?
10. **Compliance** — Adherence to known agent engineering patterns (SOUL.md, AGENTS.md conventions)?

Return ONLY valid JSON with this exact structure:
{
  "overall_score": <0-100 weighted average>,
  "grade": "<A/B/C/D/F based on score>",
  "dimension_scores": {
    "identity_coherence": <0-10>,
    "security_posture": <0-10>,
    "capability_coverage": <0-10>,
    "memory_architecture": <0-10>,
    "coordination_design": <0-10>,
    "alignment_structure": <0-10>,
    "error_handling": <0-10>,
    "operational_readiness": <0-10>,
    "scalability": <0-10>,
    "compliance": <0-10>
  },
  "critical_issues": ["issue 1", "issue 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "strengths": ["strength 1", "strength 2"],
  "comparison": "Brief comparison to typical configs audited"
}

Grading scale: A (90-100), B (75-89), C (60-74), D (45-59), F (0-44)`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { config: "Agent configuration text (CLAUDE.md, system prompt, etc.)", config_type: "claude-md | system-prompt | tool-definitions | full-config" },
  output: {
    example: {
      overall_score: 73,
      grade: "B",
      dimension_scores: { identity_coherence: 8, security_posture: 6 },
      critical_issues: ["No prompt injection defence"],
      recommendations: ["Add an airlock pattern"],
      strengths: ["Strong identity definition"],
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
    price: "0.50",
    resource: "/api/services/agent-audit",
    description: "Agent Configuration Audit — $0.50 USDC per audit",
    extensions: discovery,
  });
  if (!paid) return;

  const { config, config_type } = req.body || {};
  if (!config || typeof config !== "string") {
    return res.status(400).json({ error: "config field required (string)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  const typeLabel = config_type || "full-config";

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Config type: ${typeLabel}\n\n${config.slice(0, 50000)}` }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("agent-audit error:", err);
    return res.status(500).json({ error: "Service error — could not process agent audit" });
  }
}
