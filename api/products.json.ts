import type { VercelRequest, VercelResponse } from "@vercel/node";
import { CATALOGUE, type Product } from "./catalogue.js";

const VALID_TIERS = ["pollen", "doctrine", "honey", "nectar", "micro", "bundle", "service"] as const;
type Tier = typeof VALID_TIERS[number];

function setCors(res: VercelResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tier, free } = req.query;

  let results: Product[] = CATALOGUE;

  // Filter by tier
  if (tier) {
    const tierValue = Array.isArray(tier) ? tier[0] : tier;
    if (!VALID_TIERS.includes(tierValue as Tier)) {
      return res.status(400).json({
        error: `Invalid tier. Valid tiers: ${VALID_TIERS.join(", ")}`,
      });
    }
    results = results.filter((p) => p.tier === tierValue);
  }

  // Filter by free
  if (free === "true") {
    results = results.filter((p) => p.price === 0);
  }

  const output = results.map((p) => ({
    id: p.id,
    name: p.title,
    description: p.description,
    tier: p.tier,
    price: p.price,
    tags: p.keywords,
  }));

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({
    total: output.length,
    products: output,
  });
}
