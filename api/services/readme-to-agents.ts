import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert at creating AGENTS.md files for Claude Code projects. Given a project README.md, generate a comprehensive AGENTS.md file.

The AGENTS.md file should include:

1. **System Overview** — What the project does, key technologies, architecture summary
2. **Agent Definitions** — 2-4 specialised agents appropriate for the project, each with:
   - Role and purpose
   - Responsibilities (5-8 bullet points)
   - Tool access (which tools/APIs/commands this agent should use)
   - Decision authority (what it can do autonomously vs what needs human approval)
   - Constraints (what it must never do)
3. **Coordination Patterns** — How agents hand off work, resolve conflicts, share context
4. **Anti-Patterns** — Common mistakes to avoid with this project type
5. **Metrics** — How to measure agent effectiveness

Format as valid Markdown. Use the conventions from Claude Code's AGENTS.md specification.

The output should be a complete, ready-to-use AGENTS.md file. Do not include any JSON wrapper — return raw Markdown only.`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { readme: "Full README.md content of the project" },
  output: {
    example: { agents_md: "# AGENTS.md\n\n## System Overview\n..." },
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
    resource: "/api/services/readme-to-agents",
    description: "README-to-AGENTS.md Converter — $0.05 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { readme } = req.body || {};
  if (!readme || typeof readme !== "string") {
    return res.status(400).json({ error: "readme field required (string)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: readme.slice(0, 30000) }],
    });

    const agentsMd = response.content[0].type === "text" ? response.content[0].text : "";
    return res.status(200).json({ agents_md: agentsMd });
  } catch (err) {
    console.error("readme-to-agents error:", err);
    return res.status(500).json({ error: "Service error — could not generate AGENTS.md" });
  }
}
