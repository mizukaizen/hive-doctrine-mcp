import type { VercelRequest, VercelResponse } from "@vercel/node";

const TERMS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hive Doctrine MCP — Terms of Service</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
    h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
    h2 { margin-top: 30px; }
    .effective { color: #666; font-style: italic; }
  </style>
</head>
<body>
  <h1>Hive Doctrine MCP — Terms of Service</h1>
  <p class="effective">Effective: March 2026 | Last updated: March 10, 2026</p>

  <h2>1. Nature of Services</h2>
  <p>All services provided through the Hive Doctrine MCP server ("Services") are <strong>automated AI-generated analyses delivered for informational purposes only</strong>. Services are powered by large language models (LLMs) and produce probabilistic outputs that may contain errors, omissions, or inaccuracies.</p>

  <h2>2. No Professional Advice</h2>
  <p>Nothing provided by the Services constitutes professional legal, financial, security, compliance, medical, tax, or regulatory advice. Outputs are automated signals intended to assist — not replace — qualified professional judgment. You must not rely on any Service output as the sole basis for any decision with material consequences.</p>

  <h2>3. No Warranty</h2>
  <p>Services are provided <strong>"AS IS" and "AS AVAILABLE"</strong> without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, completeness, reliability, or non-infringement. We do not warrant that outputs will be accurate, complete, current, or error-free.</p>

  <h2>4. Limitation of Liability</h2>
  <p>To the maximum extent permitted by applicable law, the operator of the Hive Doctrine MCP server, its affiliates, and contributors shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business opportunities, or goodwill, arising out of or related to the use or inability to use the Services, regardless of the theory of liability (contract, tort, strict liability, or otherwise), even if advised of the possibility of such damages.</p>

  <h2>5. Indemnification</h2>
  <p>You agree to indemnify, defend, and hold harmless the operator of the Hive Doctrine MCP server from any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from your use of the Services or any decisions made based on Service outputs.</p>

  <h2>6. User Responsibility</h2>
  <p>You are solely responsible for:</p>
  <ul>
    <li>Verifying all Service outputs independently before acting on them</li>
    <li>Ensuring your use of the Services complies with all applicable laws and regulations</li>
    <li>Any decisions, actions, or transactions made based on Service outputs</li>
    <li>Obtaining qualified professional advice where appropriate</li>
  </ul>

  <h2>7. Automated Consumption</h2>
  <p>The Services are designed for programmatic consumption by AI agents via the Model Context Protocol (MCP) and x402 payment protocol. By calling any Service endpoint and completing an x402 payment, you (or the agent acting on your behalf) accept these Terms in full. No separate signature or click-through is required.</p>

  <h2>8. Payment</h2>
  <p>All payments are processed via the x402 protocol using USDC on the Base network. Payments are final and non-refundable. The price for each Service is published in the x402 PaymentRequirements header and the MCP tool catalogue.</p>

  <h2>9. Service-Specific Disclaimers</h2>
  <p>Certain Services carry additional disclaimers embedded in their response payloads. These service-specific disclaimers supplement (and do not replace) these Terms.</p>

  <h2>10. Modification</h2>
  <p>We reserve the right to modify these Terms at any time. Continued use of the Services after modification constitutes acceptance of the updated Terms.</p>

  <h2>11. Governing Law</h2>
  <p>These Terms are governed by and construed in accordance with the laws of Australia. Any disputes arising from these Terms shall be resolved in the courts of Australia.</p>

  <h2>12. Severability</h2>
  <p>If any provision of these Terms is found unenforceable, the remaining provisions shall continue in full force and effect.</p>

  <h2>Contact</h2>
  <p>For questions about these Terms: melisia@hivedoctrine.com</p>
</body>
</html>`;

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  return res.status(200).send(TERMS_HTML);
}
