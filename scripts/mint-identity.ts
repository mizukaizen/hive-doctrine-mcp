/**
 * ERC-8004 Agent Identity Registration — ONE-TIME minting script
 *
 * Registers Hive Doctrine on the ERC-8004 Identity Registry (Base mainnet).
 * Creates an on-chain identity NFT pointing to the agent card JSON.
 *
 * Usage: npx tsx scripts/mint-identity.ts
 *
 * Requires:
 *   WALLET_PRIVATE_KEY — EOA private key with ETH on Base for gas
 *
 * The agent card is hosted at:
 *   https://hive-doctrine-mcp.vercel.app/.well-known/agent-card.json
 */

import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// ─── Configuration ──────────────────────────────────────────────────────────

const AGENT_CARD_URI = "https://hive-doctrine-mcp.vercel.app/.well-known/agent-card.json";

// ERC-8004 Identity Registry on Base mainnet
// Source: https://github.com/erc-8004/erc-8004-contracts
const IDENTITY_REGISTRY_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678" as const; // TODO: Replace with actual deployed address from erc-8004-contracts repo

const IDENTITY_REGISTRY_ABI = parseAbi([
  "function register(string agentURI, bytes metadata) external returns (uint256 agentId)",
  "event AgentRegistered(uint256 indexed agentId, address indexed owner, string agentURI)",
]);

// Metadata entries for on-chain storage
const metadata = {
  mcp_endpoint: "https://hive-doctrine-mcp.vercel.app/mcp",
  x402_wallet: "0x61F2eF18ab0630912D24Fd0A30288619735AfFf5",
  bazaar_listed: true,
  product_count: 270,
  network: "base",
  version: "2.0.0",
};

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.error("Error: WALLET_PRIVATE_KEY environment variable required");
    console.error("Usage: WALLET_PRIVATE_KEY=0x... npx tsx scripts/mint-identity.ts");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  console.log("ERC-8004 Agent Identity Registration");
  console.log("====================================");
  console.log(`Agent URI: ${AGENT_CARD_URI}`);
  console.log(`Owner: ${account.address}`);
  console.log(`Registry: ${IDENTITY_REGISTRY_ADDRESS}`);
  console.log("");

  // Encode metadata as JSON bytes
  const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata));
  const metadataHex = `0x${Array.from(metadataBytes).map(b => b.toString(16).padStart(2, "0")).join("")}` as `0x${string}`;

  console.log("Submitting registration transaction...");

  try {
    const hash = await walletClient.writeContract({
      address: IDENTITY_REGISTRY_ADDRESS,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: "register",
      args: [AGENT_CARD_URI, metadataHex],
    });

    console.log(`Transaction submitted: ${hash}`);
    console.log("Waiting for confirmation...");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Status: ${receipt.status}`);

    // Parse the AgentRegistered event to get the agentId
    if (receipt.logs.length > 0) {
      console.log("");
      console.log("Registration successful!");
      console.log(`Gas used: ${receipt.gasUsed}`);
      console.log("");
      console.log("IMPORTANT: Save the agentId from the transaction logs.");
      console.log("You'll need it for future Reputation Registry entries.");
      console.log(`View on BaseScan: https://basescan.org/tx/${hash}`);
    }
  } catch (error) {
    console.error("Registration failed:", error);
    process.exit(1);
  }
}

main();
