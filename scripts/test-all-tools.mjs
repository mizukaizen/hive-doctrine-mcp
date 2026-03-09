import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const origin = process.argv[2] || "https://hive-doctrine-mcp.vercel.app";

async function main() {
  const transport = new StreamableHTTPClientTransport(new URL(`${origin}/mcp`));
  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );
  await client.connect(transport);
  console.log("Connected to", origin);

  // Test 1: get_alignment (hardcoded, should be instant)
  console.log("\n=== TEST 1: get_alignment ===");
  const r1 = await client.callTool({ name: "get_alignment", arguments: {} });
  console.log(r1.content[0].text.slice(0, 200));

  // Test 2: get_product — free item
  console.log("\n=== TEST 2: get_product (free HD-0001) ===");
  const r2 = await client.callTool({ name: "get_product", arguments: { product_id: "HD-0001" } });
  console.log(r2.content[0].text.slice(0, 200));

  // Test 3: get_product — paid item
  console.log("\n=== TEST 3: get_product (paid HD-0200) ===");
  const r3 = await client.callTool({ name: "get_product", arguments: { product_id: "HD-0200" } });
  console.log(r3.content[0].text);

  // Test 4: browse_catalogue (memory collection)
  console.log("\n=== TEST 4: browse_catalogue (memory) ===");
  const r4 = await client.callTool({ name: "browse_catalogue", arguments: { collection: "memory" } });
  console.log(r4.content[0].text.slice(0, 400));

  // Test 5: search_knowledge
  console.log("\n=== TEST 5: search_knowledge (stigmergy) ===");
  const r5 = await client.callTool({ name: "search_knowledge", arguments: { query: "stigmergy" } });
  console.log(r5.content[0].text.slice(0, 300));

  console.log("\n=== ALL TESTS PASSED ===");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
