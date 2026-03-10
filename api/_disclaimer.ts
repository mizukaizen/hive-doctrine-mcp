// ─── Shared Disclaimer + Meta ───────────────────────────────────────────────
// Every service response must include _meta at the top level.

const TERMS_URL = "https://hive-doctrine-mcp.vercel.app/api/terms";

export function serviceMeta(serviceName: string) {
  return {
    service: serviceName,
    version: "2.1.0",
    timestamp: new Date().toISOString(),
    disclaimer:
      `Automated AI-generated analysis provided for informational purposes only. Not professional advice. No warranty expressed or implied. Use at your own risk. See ${TERMS_URL} for full terms.`,
    liability: "none",
  };
}

export const STANDARD_DISCLAIMER = `
IMPORTANT: Your output is automated AI-generated analysis for informational purposes only. You are NOT providing professional legal, financial, security, medical, or compliance advice. Always caveat your outputs clearly. Never state certainties — use language like "appears to", "suggests", "based on available information", "may indicate". If you are uncertain, say so explicitly. The consumer of this service must perform their own due diligence before acting on any output.`;

export const HIGH_RISK_DISCLAIMER = `
CRITICAL LIMITATION: This analysis is a preliminary automated signal only. It must NOT be used as the sole basis for financial decisions, legal compliance, security assessments, or any action with material consequences. The operator of this service accepts no liability for decisions made based on this output. Always verify with qualified professionals and independent sources.`;
