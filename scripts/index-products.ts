/**
 * Product Indexer — Upserts all gated products into Upstash Vector
 *
 * Reads every .md file from gated-products/ and indexes them using
 * Upstash Vector's built-in BGE-M3 embedding model.
 *
 * Usage: npx tsx scripts/index-products.ts
 *
 * Requires:
 *   UPSTASH_VECTOR_REST_URL   — Upstash Vector endpoint
 *   UPSTASH_VECTOR_REST_TOKEN — Upstash Vector auth token
 */

import { Index } from "@upstash/vector";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

// ─── Product metadata from catalogue ────────────────────────────────────────

interface ProductMeta {
  id: string;
  title: string;
  tier: string;
  collection: string;
  price: number;
  keywords: string[];
}

// Map file paths to product metadata (derived from server.ts CATALOGUE)
// This is a simplified mapping — in production, import from a shared module
const PRODUCT_MAP: Record<string, ProductMeta> = {};

// Tier/collection detection from file path
function inferMeta(filePath: string, content: string): ProductMeta {
  const parts = filePath.split("/");
  let tier = "doctrine";
  let collection = "core";
  let price = 4.99;

  if (filePath.includes("micro/prompts/")) { tier = "micro"; collection = "System Prompts"; price = 0.49; }
  else if (filePath.includes("micro/cheatsheets/")) { tier = "micro"; collection = "Cheat Sheets"; price = 0.99; }
  else if (filePath.includes("micro/soul-templates/")) { tier = "micro"; collection = "SOUL Templates"; price = 0.99; }
  else if (filePath.includes("nectar/")) { tier = "nectar"; collection = "Nectar"; price = 149; }
  else if (filePath.includes("honey/")) { tier = "honey"; collection = parts[1] || "honey"; price = 49; }
  else if (filePath.includes("bundles/")) { tier = "bundle"; collection = "Bundles"; price = 149; }
  else if (filePath.includes("doctrine/")) { tier = "doctrine"; collection = "Doctrine"; price = 4.99; }

  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : parts[parts.length - 1].replace(".md", "");

  // Extract ID from filename if present
  const idMatch = parts[parts.length - 1].match(/^(HD-\d+|SP-\d+|CS-\d+|SOUL-\d+|BDL-\d+)/);
  const id = idMatch ? idMatch[1] : `AUTO-${filePath.replace(/[/\\]/g, "-")}`;

  // Extract keywords from content
  const words = content.toLowerCase().split(/\s+/);
  const keywords = [...new Set(words.filter(w => w.length > 4 && w.length < 20))].slice(0, 10);

  return { id, title, tier, collection, price, keywords };
}

// ─── File Discovery ─────────────────────────────────────────────────────────

function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    for (const entry of readdirSync(currentDir)) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    console.error("Error: UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN required");
    process.exit(1);
  }

  const index = new Index({ url, token });
  const gatedDir = join(process.cwd(), "gated-products");
  const files = findMarkdownFiles(gatedDir);

  console.log(`Found ${files.length} markdown files to index`);

  // Process in batches of 50 (Upstash limit)
  const BATCH_SIZE = 50;
  let indexed = 0;
  let errors = 0;

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const vectors = [];

    for (const file of batch) {
      try {
        const content = readFileSync(file, "utf-8");
        const relPath = relative(gatedDir, file);
        const meta = inferMeta(relPath, content);

        // Truncate content for embedding (BGE-M3 handles up to 8192 tokens)
        const truncated = content.slice(0, 8000);

        vectors.push({
          id: meta.id,
          data: truncated,
          metadata: {
            id: meta.id,
            title: meta.title,
            tier: meta.tier,
            collection: meta.collection,
            price: meta.price,
            keywords: meta.keywords.join(", "),
            path: relPath,
          },
        });
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
        errors++;
      }
    }

    if (vectors.length > 0) {
      try {
        await index.upsert(vectors);
        indexed += vectors.length;
        console.log(`Indexed ${indexed}/${files.length} (batch ${Math.floor(i / BATCH_SIZE) + 1})`);
      } catch (err) {
        console.error(`Batch upsert failed:`, err);
        errors += vectors.length;
      }
    }
  }

  console.log("");
  console.log("Indexing complete");
  console.log(`  Indexed: ${indexed}`);
  console.log(`  Errors:  ${errors}`);
  console.log(`  Total:   ${files.length}`);
}

main();
