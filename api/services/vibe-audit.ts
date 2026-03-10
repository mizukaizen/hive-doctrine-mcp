import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";
import { serviceMeta, STANDARD_DISCLAIMER } from "../_disclaimer.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a brand voice and style consistency analysis tool. Analyze the provided content samples for voice consistency. Assess: tone uniformity across samples, formality level, technical depth, warmth, authority, and potential inconsistencies. If brand guidelines are provided, note areas that may not align. Score consistency from 0-100. Provide suggestions for improving coherence. Note that voice analysis is inherently subjective and your assessment represents one perspective.

Return ONLY valid JSON:
{
  "consistency_score": <0-100>,
  "tone_analysis": {
    "primary_tone": "description",
    "secondary_tones": ["tone 1", "tone 2"],
    "potential_inconsistencies": ["inconsistency 1"]
  },
  "voice_profile": {
    "formality": <1-10>,
    "technical_depth": <1-10>,
    "warmth": <1-10>,
    "authority": <1-10>
  },
  "suggestions": ["suggestion 1"]
}
${STANDARD_DISCLAIMER}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { content_samples: ["sample 1", "sample 2"], brand_guidelines: "optional guidelines", target_audience: "optional audience" },
  output: {
    example: { consistency_score: 78, voice_profile: { formality: 6, technical_depth: 7, warmth: 5, authority: 8 } },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const paid = await gatePayment(req, res, {
    price: "0.50",
    resource: "/api/services/vibe-audit",
    description: "Vibe Audit — $0.50 USDC per request",
    extensions: discovery,
  });
  if (!paid) return;

  const { content_samples, brand_guidelines, target_audience } = req.body || {};
  if (!Array.isArray(content_samples) || content_samples.length === 0) {
    return res.status(400).json({ error: "content_samples field required (array of strings)" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "Service not configured — ANTHROPIC_API_KEY required" });
  }

  try {
    let userMsg = `Content samples:\n\n${content_samples.map((s: string, i: number) => `--- Sample ${i + 1} ---\n${s}`).join("\n\n").slice(0, 30000)}`;
    if (brand_guidelines) userMsg += `\n\nBrand guidelines:\n${brand_guidelines.slice(0, 5000)}`;
    if (target_audience) userMsg += `\n\nTarget audience: ${target_audience}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json({ _meta: serviceMeta("vibe-audit"), ...result });
  } catch (err) {
    console.error("vibe-audit error:", err);
    return res.status(500).json({ error: "Service error" });
  }
}
