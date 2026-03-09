import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");
  res.status(404).json({
    error: "oauth_not_supported",
    error_description:
      "This MCP server does not require authentication. Connect directly to /mcp.",
  });
}
