---
title: "RAG Architecture for Agent Systems — Cheat Sheet"
hive_doctrine_id: HD-1107
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-1107
full_product_price: 99
---

# RAG Architecture for Agent Systems — Cheat Sheet

## What It Is

The RAG architecture spectrum from naive to agentic, chunking strategies, retrieval strategies, and multi-agent RAG patterns.

## RAG Architecture Spectrum

| Level | Description | When to Use |
|-------|-------------|-------------|
| **Naive** | Chunk → embed → retrieve → generate | Prototypes, simple Q&A |
| **Advanced** | + query rewriting, re-ranking, hybrid search | Production single-agent |
| **Modular** | Swappable components (retriever, ranker, generator) | Multi-use-case systems |
| **Agentic** | Agent decides when/how to retrieve | Complex multi-step reasoning |
| **GraphRAG** | Knowledge graph + vector retrieval | Relationship-heavy domains |

## Agentic RAG Variants

- **Self-RAG:** Agent evaluates retrieval quality and re-retrieves if insufficient
- **Corrective RAG:** Agent fact-checks its own generation against retrieved docs
- **Adaptive RAG:** Agent chooses retrieval strategy based on query complexity

## Chunking Strategies

| Strategy | Method | Best For |
|----------|--------|----------|
| **Fixed** | Split every N tokens | Uniform documents |
| **Semantic** | Split at topic boundaries | Articles, reports |
| **Document-Aware** | Split by headers, sections | Structured docs (markdown, HTML) |
| **Hierarchical** | Parent chunks contain child chunks | Long documents with sub-sections |

**Rule:** Document-aware chunking beats fixed chunking in almost every case. Use it by default.

## Retrieval Strategies

| Strategy | Method | Strength |
|----------|--------|----------|
| **Dense** | Embedding similarity (cosine) | Semantic matching |
| **Sparse** | BM25 / keyword search | Exact term matching |
| **Hybrid** | Dense + Sparse combined | Best of both |
| **Multi-hop** | Retrieve → reason → retrieve again | Complex questions |
| **Re-ranking** | Retrieve N, re-rank to top K | Precision |

**Best practice:** Hybrid retrieval (dense + sparse) with re-ranking.

## Vector DB Comparison

| DB | Self-Hosted | Managed | Best For |
|----|-------------|---------|----------|
| Chroma | Yes | No | Prototyping |
| Pinecone | No | Yes | Production (managed) |
| Weaviate | Yes | Yes | Multi-modal |
| Qdrant | Yes | Yes | Performance |
| pgvector | Yes | Yes | Already using PostgreSQL |

## 4-Phase Implementation

| Phase | Focus |
|-------|-------|
| 1 | Naive RAG with fixed chunking (get it working) |
| 2 | Add hybrid retrieval + re-ranking (improve quality) |
| 3 | Document-aware chunking + evaluation pipeline |
| 4 | Agentic RAG (agent decides retrieval strategy) |

---

*This is the condensed version. The full guide (HD-1107, $99) covers the complete RAG spectrum, all chunking and retrieval strategies, vector DB comparison, and multi-agent RAG patterns. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
