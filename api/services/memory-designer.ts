import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { setCorsHeaders, handleOptions, gatePayment, bazaarExtension } from "../_x402.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a memory architecture specialist from The Hive Doctrine. Given agent requirements, design an optimal memory system.

Consider The Hive Doctrine's three-tier memory model:
1. **Working Memory** — Current context window (ephemeral)
2. **Episodic Memory** — Session-based recall (medium-term)
3. **Semantic Memory** — Persistent knowledge (long-term)

Return ONLY valid JSON:
{
  "architecture_name": "Descriptive name",
  "overview": "2-3 sentence summary",
  "memory_tiers": [
    {
      "tier": "working|episodic|semantic",
      "purpose": "What this tier stores",
      "technology": "Recommended tech (context window, SQLite, vector DB, etc.)",
      "capacity": "How much data this tier handles",
      "retention": "How long data persists",
      "access_pattern": "How data is read/written",
      "cost_estimate": "Monthly cost"
    }
  ],
  "context_window_strategy": {
    "total_budget": "Token budget",
    "zones": {
      "system": "Tokens for system prompt",
      "identity": "Tokens for agent identity",
      "task": "Tokens for current task",
      "history": "Tokens for conversation history",
      "retrieval": "Tokens for RAG results"
    },
    "compression_strategy": "How to handle overflow"
  },
  "retrieval_strategy": {
    "method": "semantic|keyword|hybrid",
    "embedding_model": "Recommended model",
    "chunk_size": "Optimal chunk size",
    "top_k": "Default retrieval count"
  },
  "persistence": {
    "what_to_persist": ["Types of data to save long-term"],
    "what_to_discard": ["Types of data to let expire"],
    "checkpoint_strategy": "When and how to save state"
  },
  "anti_patterns": ["Common memory mistakes to avoid"]
}`;

const discovery = bazaarExtension({
  method: "POST",
  bodyType: "json",
  input: { requirements: "Agent requirements and memory needs" },
  output: {
    example: {
      architecture_name: "Research Agent Memory System",
      memory_tiers: [{ tier: "semantic", technology: "Upstash Vector" }],
      context_window_strategy: { total_budget: "100k tokens" },
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
    price: "0.05",
    resource: "/api/services/memory-designer",
    description: "Memory Designer — $0.05 USDC per request",
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
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: requirements.slice(0, 15000) }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const result = JSON.parse(raw);
    return res.status(200).json(result);
  } catch (err) {
    console.error("memory-designer error:", err);
    return res.status(500).json({ error: "Service error — could not design memory architecture" });
  }
}
