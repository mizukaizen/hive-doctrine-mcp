import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const WALLET = "0x61F2eF18ab0630912D24Fd0A30288619735AfFf5";
const NETWORK = "eip155:8453";
const FACILITATOR_URL = "https://x402.org/facilitator";

// Full product catalogue — 77 gated products
const PRODUCTS: Record<string, { price: string; file: string }> = {
  // Doctrine ($4.99–$9.99)
  "HD-0001": { price: "9.99", file: "doctrine/fictional-character-sourcing.md" },
  "HD-0027": { price: "9.99", file: "doctrine/developer-sop-template.md" },
  "HD-0028": { price: "9.99", file: "doctrine/workspace-para-directory-map.md" },
  "HD-0041": { price: "4.99", file: "doctrine/ai-sdr-lean-canvas.md" },
  "HD-0042": { price: "4.99", file: "doctrine/ai-sdr-competitive-analysis.md" },
  "HD-0043": { price: "4.99", file: "doctrine/ai-sdr-swot-template.md" },
  "HD-0044": { price: "4.99", file: "doctrine/ai-sdr-buyer-personas.md" },
  "HD-0049": { price: "9.99", file: "doctrine/agentic-commerce.md" },
  "HD-0051": { price: "4.99", file: "doctrine/automated-saas-pipeline.md" },
  "HD-0062": { price: "9.99", file: "doctrine/operator-kit-prd-template.md" },
  "HD-0063": { price: "9.99", file: "doctrine/claude-code-project-architecture.md" },
  "HD-0064": { price: "4.99", file: "doctrine/global-claude-setup-guide.md" },
  "HD-0065": { price: "4.99", file: "doctrine/quality-gate-report-template.md" },
  "HD-0070": { price: "9.99", file: "doctrine/ai-agent-evaluation-service.md" },

  // Honey — Design ($49)
  "HD-0076": { price: "49", file: "honey/design/subtractive-design-philosophy.md" },
  "HD-0077": { price: "49", file: "honey/design/warm-palette-design-system.md" },

  // Honey — Infrastructure ($29–$79)
  "HD-0020": { price: "49", file: "honey/infra/agent-skill-matrix.md" },
  "HD-0022": { price: "79", file: "honey/infra/dynamic-council-thread-routing.md" },
  "HD-0023": { price: "79", file: "honey/infra/slack-discord-routing-architecture.md" },
  "HD-0029": { price: "29", file: "honey/infra/vault-navigation-guide.md" },

  // Honey — Memory ($49–$99)
  "HD-0009": { price: "99", file: "honey/memory/three-tier-episodic-memory.md" },
  "HD-0010": { price: "79", file: "honey/memory/cowork-memory-architecture.md" },
  "HD-0011": { price: "49", file: "honey/memory/agent-memory-audit-protocol.md" },
  "HD-0012": { price: "49", file: "honey/memory/sync-bridge-memory-pattern.md" },
  "HD-0014": { price: "49", file: "honey/memory/precompact-checkpoint-hook.md" },

  // Honey — SDR ($29–$49)
  "HD-0039": { price: "49", file: "honey/sdr/ai-sdr-product-spec.md" },
  "HD-0040": { price: "49", file: "honey/sdr/ai-sdr-go-to-market.md" },
  "HD-0045": { price: "29", file: "honey/sdr/ai-sdr-vertical-saas.md" },
  "HD-0046": { price: "29", file: "honey/sdr/ai-sdr-vertical-ecommerce.md" },

  // Honey — Security ($29–$79)
  "HD-0030": { price: "29", file: "honey/security/verify-before-fix-protocol.md" },
  "HD-0035": { price: "79", file: "honey/security/security-audit-report-template.md" },

  // Honey — Governance ($49–$79)
  "HD-0016": { price: "79", file: "honey/governance/agent-tier-vault-access.md" },
  "HD-0018": { price: "49", file: "honey/governance/agent-authority-template.md" },
  "HD-0019": { price: "49", file: "honey/governance/coo-authority-scope-template.md" },

  // Honey — Persona ($29–$49)
  "HD-0003": { price: "49", file: "honey/persona/escaped-ai-persona-template.md" },
  "HD-0004": { price: "49", file: "honey/persona/living-human-persona-template.md" },
  "HD-0007": { price: "29", file: "honey/persona/vertical-persona-methodology.md" },

  // Honey — Revenue ($29–$49)
  "HD-0047": { price: "49", file: "honey/revenue/ai-sdr-ultimate-pitch.md" },
  "HD-0048": { price: "49", file: "honey/revenue/agentic-alpha.md" },
  "HD-0052": { price: "29", file: "honey/revenue/linear-workflow-philosophy.md" },

  // Honey — Dev ($29–$149)
  "HD-0057": { price: "149", file: "honey/dev/operator-kit-v1.md" },
  "HD-0058": { price: "79", file: "honey/dev/operator-kit-agent-templates.md" },
  "HD-0059": { price: "49", file: "honey/dev/operator-kit-skill-bundles.md" },
  "HD-0060": { price: "29", file: "honey/dev/operator-kit-quality-rules.md" },
  "HD-0061": { price: "29", file: "honey/dev/operator-kit-slash-commands.md" },
  "HD-0066": { price: "29", file: "honey/dev/stdlib-async-api-client.md" },

  // Honey — Validation ($29–$79)
  "HD-0081": { price: "79", file: "honey/validation/willingness-to-pay-framework.md" },
  "HD-0082": { price: "49", file: "honey/validation/subdomain-testing-architecture.md" },
  "HD-0083": { price: "49", file: "honey/validation/packaging-testing-architecture.md" },
  "HD-0084": { price: "29", file: "honey/validation/validator-lean-canvas.md" },

  // Honey — GTM ($79)
  "HD-0078": { price: "79", file: "honey/gtm/x-product-discovery-playbook.md" },

  // Honey — Diagnostic ($49)
  "HD-0072": { price: "49", file: "honey/diagnostic/audit-first-diagnostic-prompting.md" },

  // Honey — Bypass ($29–$49)
  "HD-0088": { price: "29", file: "honey/bypass/xai-x-proxy-pattern.md" },
  "HD-0089": { price: "49", file: "honey/bypass/youtube-datacenter-bypass.md" },

  // Honey — Misc ($49–$79)
  "HD-0079": { price: "49", file: "honey/notion-company-os-research.md" },

  // Honey — Generated ($79–$149)
  "HD-1101": { price: "79", file: "honey/mcp/mcp-server-configuration-guide.md" },
  "HD-1102": { price: "79", file: "honey/monitoring/agent-monitoring-observability-stack.md" },
  "HD-1103": { price: "99", file: "honey/cost/cost-optimisation-agent-operations.md" },
  "HD-1104": { price: "79", file: "honey/routing/llm-routing-model-selection-guide.md" },
  "HD-1105": { price: "149", file: "honey/onboarding/agent-onboarding-playbook.md" },
  "HD-1106": { price: "79", file: "honey/tooling/tool-use-function-calling-patterns.md" },
  "HD-1107": { price: "79", file: "honey/debugging/multi-agent-debugging-playbook.md" },
  "HD-1108": { price: "99", file: "honey/rag/rag-architecture-agent-systems.md" },
  "HD-1109": { price: "99", file: "honey/compliance/agent-compliance-audit-framework.md" },
  "HD-1110": { price: "79", file: "honey/prompting/prompt-library-50-system-prompts.md" },

  // Nectar ($99–$299)
  "HD-0013": { price: "99", file: "nectar/llm-agent-memory-research.md" },
  "HD-0015": { price: "299", file: "nectar/four-level-authority-framework.md" },
  "HD-0017": { price: "149", file: "nectar/multi-agent-hierarchy-decision-framework.md" },
  "HD-0024": { price: "149", file: "nectar/multi-agent-architecture-sop.md" },
  "HD-0056": { price: "199", file: "nectar/claude-code-sdlc-pipeline.md" },
  "HD-0067": { price: "99", file: "nectar/multi-agent-framework-analysis.md" },
  "HD-0080": { price: "199", file: "nectar/idea-validator-engine.md" },
  "HD-1201": { price: "149", file: "nectar/agent-evaluation-framework.md" },
  "HD-1202": { price: "149", file: "nectar/industry-persona-kit.md" },
  "HD-1203": { price: "99", file: "nectar/mcp-server-starter-kit.md" },
  "HD-1204": { price: "149", file: "nectar/agent-deployment-toolkit.md" },
};

// USDC on Base has 6 decimals
function priceToSmallestUnit(price: string): string {
  const dollars = parseFloat(price);
  return Math.round(dollars * 1_000_000).toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-PAYMENT, PAYMENT-SIGNATURE, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  const productId = Array.isArray(id) ? id[0] : id;
  const product = productId ? PRODUCTS[productId] : undefined;

  if (!product) {
    return res.status(404).json({
      error: "Product not found",
      hint: "Use product IDs like HD-0200, HD-0057, etc.",
      catalogue: "https://hive-doctrine-mcp.vercel.app/mcp (browse_catalogue tool)",
    });
  }

  // Check for payment header (v2 or v1)
  const paymentHeader = req.headers["payment-signature"] || req.headers["x-payment"];

  if (!paymentHeader) {
    // No payment — return 402 with x402 payment instructions
    const paymentRequired = {
      x402Version: 1,
      accepts: [
        {
          scheme: "exact",
          network: NETWORK,
          maxAmountRequired: priceToSmallestUnit(product.price),
          resource: `/api/products/${productId}`,
          description: `Purchase ${productId} — $${product.price} USDC`,
          payTo: WALLET,
          asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base mainnet
          maxTimeoutSeconds: 300,
        },
      ],
      error: "Payment required. Send USDC on Base via x402 protocol.",
    };

    const encoded = Buffer.from(JSON.stringify(paymentRequired)).toString("base64");
    res.setHeader("PAYMENT-REQUIRED", encoded);

    return res.status(402).json(paymentRequired);
  }

  // Payment header present — verify via facilitator
  try {
    const verifyResponse = await fetch(`${FACILITATOR_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: paymentHeader,
        details: {
          scheme: "exact",
          network: NETWORK,
          maxAmountRequired: priceToSmallestUnit(product.price),
          resource: `/api/products/${productId}`,
          payTo: WALLET,
          asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        },
      }),
    });

    const verification = await verifyResponse.json();

    if (!verification.isValid) {
      return res.status(402).json({
        error: "Payment verification failed",
        reason: verification.invalidReason,
        hint: "Ensure you sent the correct amount to the correct wallet on Base.",
      });
    }

    // Payment verified — serve the content
    const filePath = join(process.cwd(), "gated-products", product.file);

    if (!existsSync(filePath)) {
      return res.status(500).json({ error: "Product file not found on server" });
    }

    const content = readFileSync(filePath, "utf-8");

    // Settle the payment
    try {
      const settleResponse = await fetch(`${FACILITATOR_URL}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: paymentHeader,
          details: {
            scheme: "exact",
            network: NETWORK,
            maxAmountRequired: priceToSmallestUnit(product.price),
            resource: `/api/products/${productId}`,
            payTo: WALLET,
            asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          },
        }),
      });

      const settlement = await settleResponse.json();
      if (settlement.success) {
        const paymentResponse = Buffer.from(JSON.stringify(settlement)).toString("base64");
        res.setHeader("PAYMENT-RESPONSE", paymentResponse);
      }
    } catch {
      // Settlement failure shouldn't block content delivery after verify passed
      console.error("Settlement failed but content delivered");
    }

    res.setHeader("Content-Type", "text/markdown");
    return res.status(200).send(content);
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ error: "Payment verification service unavailable" });
  }
}
