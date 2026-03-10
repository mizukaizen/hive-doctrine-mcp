import type { VercelRequest, VercelResponse } from "@vercel/node";
import { HTTPFacilitatorClient } from "@x402/core/http";
import { createFacilitatorConfig } from "@coinbase/x402";
import { declareDiscoveryExtension } from "@x402/extensions";

// ─── Constants ───────────────────────────────────────────────────────────────

export const WALLET = "0x61F2eF18ab0630912D24Fd0A30288619735AfFf5";
export const NETWORK: `${string}:${string}` = "eip155:8453"; // Base mainnet
export const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// ─── CDP Facilitator ─────────────────────────────────────────────────────────

// Use CDP production when keys are available, fall back to x402.org testnet
const cdpKeyId = process.env.CDP_API_KEY_ID;
const cdpKeySecret = process.env.CDP_API_KEY_SECRET;

const facilitatorConfig = cdpKeyId && cdpKeySecret
  ? createFacilitatorConfig(cdpKeyId, cdpKeySecret)
  : { url: "https://x402.org/facilitator" };

export const facilitator = new HTTPFacilitatorClient(facilitatorConfig);

// ─── Bazaar Discovery ────────────────────────────────────────────────────────

export function bazaarExtension(config: {
  method: "GET" | "POST";
  input?: Record<string, unknown>;
  output?: { example?: unknown; schema?: Record<string, unknown> };
  bodyType?: "json";
}) {
  if (config.method === "POST") {
    return declareDiscoveryExtension({
      bodyType: config.bodyType ?? "json",
      input: config.input,
      output: config.output,
    });
  }
  return declareDiscoveryExtension({
    input: config.input,
    output: config.output,
  });
}

// ─── USDC Helpers ────────────────────────────────────────────────────────────

/** Convert dollar price to USDC smallest unit (6 decimals) */
export function priceToSmallestUnit(price: string | number): string {
  const dollars = typeof price === "number" ? price : parseFloat(price);
  return Math.round(dollars * 1_000_000).toString();
}

/** Convert dollar amount to x402 Price format */
export function toX402Price(dollars: string | number): string {
  return `$${typeof dollars === "number" ? dollars : parseFloat(dollars)}`;
}

// ─── CORS + Method Helpers ───────────────────────────────────────────────────

export function setCorsHeaders(res: VercelResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-PAYMENT, PAYMENT-SIGNATURE, Authorization");
  res.setHeader("Cache-Control", "no-store");
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

// ─── x402 Payment Gating ─────────────────────────────────────────────────────

export interface PaymentGateConfig {
  price: string | number;
  resource: string;
  description: string;
  extensions?: Record<string, unknown>;
}

/**
 * Check for x402 payment. Returns true if payment is verified (proceed with response).
 * Returns false if 402/error response was already sent.
 */
export async function gatePayment(
  req: VercelRequest,
  res: VercelResponse,
  config: PaymentGateConfig,
): Promise<boolean> {
  const paymentHeader =
    (req.headers["payment-signature"] as string) ||
    (req.headers["x-payment"] as string);

  const amountRequired = priceToSmallestUnit(config.price);

  if (!paymentHeader) {
    // No payment — return 402 with x402 payment instructions
    const paymentRequired = {
      x402Version: 2,
      accepts: [
        {
          scheme: "exact",
          network: NETWORK,
          maxAmountRequired: amountRequired,
          resource: config.resource,
          description: config.description,
          payTo: WALLET,
          asset: USDC_BASE,
          maxTimeoutSeconds: 300,
          extra: {},
        },
      ],
      ...(config.extensions ? { extensions: config.extensions } : {}),
      error: "Payment required. Send USDC on Base via x402 protocol.",
    };

    const encoded = Buffer.from(JSON.stringify(paymentRequired)).toString("base64");
    res.setHeader("PAYMENT-REQUIRED", encoded);
    res.status(402).json(paymentRequired);
    return false;
  }

  // Payment header present — verify via facilitator
  try {
    const paymentPayload = JSON.parse(
      Buffer.from(paymentHeader, "base64").toString("utf-8"),
    );

    const paymentRequirements = {
      scheme: "exact",
      network: NETWORK,
      amount: amountRequired,
      payTo: WALLET,
      asset: USDC_BASE,
      maxTimeoutSeconds: 300,
      extra: {},
    };

    const verification = await facilitator.verify(paymentPayload, paymentRequirements);

    if (!verification.isValid) {
      res.status(402).json({
        error: "Payment verification failed",
        reason: verification.invalidReason,
        hint: "Ensure correct amount sent to correct wallet on Base.",
      });
      return false;
    }

    // Payment verified — settle asynchronously (don't block content delivery)
    facilitator.settle(paymentPayload, paymentRequirements).then((settlement) => {
      if (settlement.success) {
        const paymentResponse = Buffer.from(JSON.stringify(settlement)).toString("base64");
        // Note: headers may already be sent, this is best-effort
        try { res.setHeader("PAYMENT-RESPONSE", paymentResponse); } catch {}
      }
    }).catch((err) => {
      console.error("Settlement failed but content delivered:", err);
    });

    return true;
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ error: "Payment verification service unavailable" });
    return false;
  }
}
