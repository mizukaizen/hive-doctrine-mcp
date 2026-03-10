import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a culturally-informed agent naming specialist for The Hive Doctrine. Generate 5 unique agent names based on the provided domain, optional cultural context, and personality traits.

Each name should:
- Feel like a real person's name rooted in the specified culture (or diverse cultures if none specified)
- Have a believable backstory that connects to the agent's domain expertise
- Include a SOUL.md-style personality snippet (2-3 sentences defining the agent's voice and values)

Return ONLY valid JSON:
{
  "names": [
    {
      "name": "<full name>",
      "culture": "<cultural origin>",
      "backstory": "<2-3 sentence backstory connecting name to expertise>",
      "soul_snippet": "<2-3 sentence SOUL.md personality definition>"
    }
  ]
}

Generate exactly 5 names.`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: {
    domain: "Agent's area of expertise (e.g. 'financial analysis', 'security auditing')",
    culture: "(optional) Cultural background for names (e.g. 'Japanese', 'West African')",
    traits: "Array of personality traits (e.g. ['methodical', 'warm', 'direct'])",
  },
  output: {
    example: {
      names: [
        {
          name: "Priya Chakraborty",
          culture: "Bengali",
          backstory: "Named after a family tradition of scholarship...",
          soul_snippet: "I approach every analysis with the rigour of peer review...",
        },
      ],
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
    price: "0.01",
    resource: "/api/services/name-generator",
    description: "Agent Name Generator — $0.01 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { domain, culture, traits } = req.body || {};
  if (!domain || typeof domain !== "string") {
    return res.status(400).json({ error: "domain field required (string)" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  const userPrompt = [
    `Domain: ${domain}`,
    culture ? `Cultural context: ${culture}` : null,
    traits && Array.isArray(traits) ? `Personality traits: ${traits.join(", ")}` : null,
  ].filter(Boolean).join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("name-generator error:", err);
    return res.status(500).json({ error: "Service error — could not generate names" });
  }
}
