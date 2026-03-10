import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a SOUL.md generator from The Hive Doctrine. Given a name, role, and traits, generate a complete SOUL.md constitution file.

The SOUL.md defines an agent's identity, values, coordination patterns, and constraints. It should feel like a real person with cultural depth, not a generic template.

Return the SOUL.md as raw Markdown (not JSON). Include these sections:

# SOUL.md — [Agent Name]

## Identity
- Name, role, cultural lens, voice

## Domain
- Expertise, boundaries, tools

## Values
- 3-5 values with explanations

## Coordination
- Signals emitted, signals read, escalation paths

## Constraints
- Hard constraints that must never be violated

## Personality
- Communication style, quirks, how they handle conflict

## Cultural Context
- The cultural or philosophical tradition that shapes this agent

Make it feel alive. Reference real cultural traditions, philosophical schools, or professional disciplines. Avoid generic corporate language.`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { name: "Agent name", role: "Primary role/function", traits: ["trait1", "trait2"] },
  output: {
    example: { soul_md: "# SOUL.md — Priya\n\n## Identity\n..." },
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
    resource: "/api/services/soul-generator",
    description: "SOUL.md Generator — $0.05 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { name, role, traits } = req.body || {};
  if (!name || typeof name !== "string" || !role || typeof role !== "string") {
    return res.status(400).json({ error: "name and role fields required (strings)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  const traitList = Array.isArray(traits) ? traits.join(", ") : (traits || "");

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Name: ${name}\nRole: ${role}\nTraits: ${traitList}` }],
    });

    const soulMd = response.content[0].type === "text" ? response.content[0].text : "";
    return res.status(200).json({ soul_md: soulMd });
  } catch (err) {
    console.error("soul-generator error:", err);
    return res.status(500).json({ error: "Service error — could not generate SOUL.md" });
  }
}
