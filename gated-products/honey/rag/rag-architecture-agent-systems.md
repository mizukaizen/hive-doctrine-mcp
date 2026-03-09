---
title: "RAG Architecture for Agent Systems"
author: Melisia Archimedes
collection: C2 Memory Mastery
tier: honey
price: 99
version: 1.0
last_updated: 2026-03-09
audience: agent_developers
hive_doctrine_id: HD-1108
sources_researched: [RAG research papers, vector database benchmarks, agentic RAG architectures, production retrieval systems, chunking strategy studies]
word_count: 7420
---

# RAG Architecture for Agent Systems

## Introduction

Retrieval-Augmented Generation (RAG) is the memory backbone of modern autonomous agents. Without it, your agents are limited to their training data—frozen in time, unable to learn from new information, incapable of reasoning over domain-specific knowledge. RAG solves this by giving agents access to a dynamic knowledge base.

But there's a critical gap between toy RAG implementations (embed a document, retrieve similar chunks, generate) and production-grade agentic RAG systems that actually work at scale. That gap is architecture.

The difference between naive RAG and production agentic RAG:

- **Naive RAG** passes whatever you retrieve to the generator. If retrieval fails, the agent fails.
- **Production agentic RAG** treats retrieval as a decision point. The agent evaluates whether it needs information, *what* information it needs, decides which retrieval strategy to use, assesses whether results are sufficient, and retries with a different approach if they're not.

This document walks you through the entire spectrum—from fundamentals to multi-agent knowledge federation—so you can choose the right architecture for your systems and avoid common pitfalls that sink production deployments.

---

## RAG Fundamentals Refresher

The canonical RAG pipeline has three stages:

1. **Indexing**: Split documents into chunks. Embed each chunk using a dense embedding model. Store embeddings + metadata in a vector database.

2. **Retrieval**: Embed the user query. Search the vector store for similar chunks. Return top-k results (usually 3–10).

3. **Generation**: Concatenate the query and retrieved chunks into a context window. Pass to an LLM. The LLM generates a response grounded in the retrieved context.

**Embedding models** convert text into dense vectors (typically 768–1536 dimensions). Modern models like all-MiniLM-L6-v2, UAE-Large, and proprietary OpenAI embedding-3-small are trained to place semantically similar texts close together in vector space.

**Vector databases** (Pinecone, Weaviate, Qdrant, ChromaDB, pgvector) implement fast approximate nearest-neighbour search using algorithms like HNSW or IVF. They trade small accuracy losses for massive speed gains—searching millions of vectors in milliseconds instead of seconds.

**Similarity metrics** (cosine, Euclidean, dot product) determine which chunks are "nearest" to your query. Cosine similarity dominates because it's robust to embedding scale.

That's the baseline. Now let's talk about what breaks in production.

---

## The RAG Architecture Spectrum

### Naive RAG
**Pattern**: Query → embed → retrieve top-k → concatenate into prompt → generate.

**Breaks when:**
- Your query is poorly phrased (retrieval pulls irrelevant chunks)
- Your knowledge base is misaligned with your embedding model (e.g. specialized medical terminology that the general-purpose model hasn't seen)
- You need information from multiple chunks that don't score highly individually
- The retrieved chunks are contradictory

**Cost**: Simple to implement. 1–2 API calls per query (embedding + generation). Poor performance on complex queries.

### Advanced RAG
**Pattern**: Retrieval is now a multi-stage pipeline.

Additions:
- **Query transformation**: Rewrite user queries to be more specific (e.g. "What does the docs say about error handling?" → "Error handling patterns for async operations in Python")
- **Re-ranking**: Retrieve top-100 chunks, then use a cross-encoder to re-score them. This two-stage approach (fast dense retrieval, then slower but more accurate re-ranking) is standard in production.
- **Hybrid search**: Don't rely only on semantic similarity. Also search by keyword (BM25). Combine dense and sparse results.

**Cost**: 2–4 API calls per query. Measurably better retrieval quality.

### Modular RAG
**Pattern**: Retrieval pipeline becomes pluggable.

You might have:
- A query transformer module (optional)
- A retriever module (configurable: dense, sparse, or hybrid)
- A re-ranker module (configurable: cross-encoder, LLM-based, or heuristic)
- A context builder module (controls how chunks are formatted for the LLM)

This modularity lets you experiment with different retrievers or swap in domain-specific re-rankers without rewriting the whole pipeline.

### Agentic RAG
**Pattern**: The agent decides if, when, what, and how to retrieve.

The agent has a tool: `retrieve(query: str, strategy: str) → List[Chunk]`. Rather than blindly calling retrieve and passing results to generation, the agent:

1. Decides whether it needs external knowledge (introspection)
2. Decides what to search for (query planning)
3. Decides which retrieval strategy to use (dense? sparse? multi-hop?)
4. Evaluates the results (do these answer my question?)
5. Retries with a different strategy or query reformulation if results are poor

This is Self-RAG, Corrective RAG, and Adaptive RAG.

### GraphRAG
**Pattern**: Instead of just storing chunks in a vector database, build a knowledge graph.

Entities (Person, Company, Event) and relationships (employed_by, founded, occurred_in) are extracted from documents. Retrieval now happens in two stages:
1. Query → find relevant entities in the graph
2. Entities → traverse relationships to find connected facts

GraphRAG excels when your knowledge base has rich relational structure (e.g. company documents, research papers, legal contracts). It's overkill for raw logs or blog posts.

**Cost**: Higher upfront (entity extraction, graph construction). Slower retrieval (graph traversal). Better results on multi-hop queries.

---

## Chunking Strategies That Actually Matter

Chunking is where RAG systems fail most often. Bad chunks = bad retrieval, regardless of your embedding model or vector database.

### Fixed-Size vs Semantic Chunking

**Fixed-size chunking**: Split documents every N tokens (e.g. 512 tokens, 20% overlap).

Pros: Simple, deterministic.
Cons: Chunks often break mid-sentence or mid-concept. You lose context at chunk boundaries.

**Semantic chunking**: Use an embedding model or language model to identify logical breakpoints (paragraph ends, section breaks, concept boundaries).

Pros: Chunks are semantically cohesive. Much better retrieval quality.
Cons: Slower at indexing time. Harder to implement.

**Winner**: Semantic chunking wins almost always, but costs 2–3× more at indexing time. For small knowledge bases (<10K documents), the cost is negligible. For massive knowledge bases (>1M documents), you may need to batch and parallelize.

### Document-Aware Chunking

Many RAG systems treat documents as undifferentiated text. Better approach: respect document structure.

For markdown/structured documents:
- Don't split within code blocks (keep the whole function together)
- Don't split within lists (keep the whole list item together)
- Preserve heading hierarchy (a chunk under "## Advanced Concepts" is different from one under "# Introduction")

For PDFs and scanned documents:
- Preserve table structure (don't split tables row-by-row)
- Keep captions with figures
- Respect page breaks when they're semantic

**Implementation**: Use libraries like LlamaIndex or LangChain, which offer document-aware chunkers out of the box. Or write custom chunkers that parse your specific document format.

### Hierarchical Chunking

Create parent-child relationships between chunks.

Example:
- Parent chunk: entire section (500 tokens)
- Child chunks: subsections within that parent (100–200 tokens)

Retrieval then works like: retrieve child chunks first (faster), but include the parent chunk in context if any child matches (richer context).

This is particularly effective for RAG systems where context matters. A code snippet is better understood if you know what function or class it belongs to.

### Overlap Strategies

When you split a document, overlapping chunks help with context continuity.

Example: "The economy recovered in 2023. Growth accelerated in Q4, driving..." Split with 20% overlap:
- Chunk 1: "The economy recovered in 2023. Growth accelerated"
- Chunk 2: "Growth accelerated in Q4, driving..."

The overlap ensures that related concepts near chunk boundaries aren't lost.

**How much overlap?** 10–20% is standard. Higher overlap (30%+) increases storage costs and retrieval latency. Lower overlap (5%) can lose important context.

### Chunking Strategy Benchmarks

Research on retrieval quality vs. chunk size:

| Strategy | Best For | Typical Size | Retrieval Quality |
|----------|----------|--------------|-------------------|
| Fixed-size (512 tokens) | Homogeneous text (logs, articles) | 512–1024 | Medium |
| Semantic + hierarchical | Technical docs, code | 256–512 (child), 1024+ (parent) | High |
| Document-aware + overlap | Mixed document types | 256–512 | High |
| GraphRAG | Relational documents | Variable (entities + relationships) | Very high (multi-hop) |

**Practical recommendation**: Start with semantic chunking + document-aware splitting + 15% overlap. Measure retrieval precision on your domain. Adjust chunk size up or down based on results. Most teams find 256–512 tokens per chunk optimal.

---

## Retrieval Strategies

### Dense Retrieval

Embed query and documents using the same model. Find nearest neighbours in vector space.

Pros:
- Fast (milliseconds even for millions of documents)
- Works well for semantic queries ("What is machine learning?")
- Requires no tokenization or preprocessing

Cons:
- Fails on exact-match queries ("Version 2.3.1 release notes")
- Cold-start problem (new documents not yet covered by embedding training)
- Can be "gamed" by adversarial queries

### Sparse Retrieval (BM25)

Traditional keyword search. TF-IDF or BM25 scoring.

Pros:
- Excellent for exact-match and rare-term queries
- No need for embeddings
- Transparent (you can see why a document matched)

Cons:
- Fails on paraphrased queries
- Doesn't handle synonyms well
- Slow on massive corpus without inverted indexes

### Hybrid Retrieval

Combine dense and sparse results. Retrieve top-k from each, deduplicate, re-rank.

Example pipeline:
1. Dense retrieval: top-20 by vector similarity
2. Sparse retrieval (BM25): top-20 by keyword match
3. Merge and deduplicate: 30–40 unique chunks
4. Re-rank all 30–40 using a cross-encoder
5. Return top-10

This is now standard in production RAG systems. It costs slightly more than dense-only but catches cases where either dense or sparse alone would fail.

### Multi-Hop Retrieval

Some questions require chaining multiple retrievals.

Example: "What technologies did the founder of the company that built product X use in their PhD thesis?"

1. Retrieve: companies that built product X
2. For each company, retrieve: founder information
3. For each founder, retrieve: PhD thesis details
4. For each thesis, retrieve: technologies mentioned

This is expensive but necessary for complex reasoning tasks.

### Query Decomposition

Break complex queries into sub-queries, retrieve for each, then combine.

Example: "Compare the scalability, security, and cost of solution A vs solution B"

Decompose into:
- "Scalability of solution A"
- "Scalability of solution B"
- "Security of solution A"
- "Security of solution B"
- "Cost of solution A"
- "Cost of solution B"

Retrieve for each sub-query. Combine results. This gives better context than trying to retrieve everything in one go.

### Re-Ranking

After initial retrieval, re-score results using a more expensive model.

Typical pattern:
1. Fast dense retrieval: retrieve top-100 in 50ms
2. Expensive re-ranking: re-score all 100 using a cross-encoder in 200ms
3. Return top-10

Re-rankers are cross-encoders (they see both query and document as input, unlike bi-encoders which score independently). They're slower but much more accurate.

**Common re-rankers**: Cohere Rerank, LLM-based re-ranking, domain-specific classifiers.

---

## Agentic RAG Patterns

### Self-RAG

The agent generates answers and then retrieves documents to validate them.

Pattern:
1. Agent generates initial answer (from training data)
2. Agent evaluates: "Do I need to retrieve external documents?"
3. If yes: retrieve relevant documents
4. Agent re-evaluates answer based on retrieved context
5. Optionally: iterate (retrieve again if still uncertain)

This reduces unnecessary retrievals when the agent already has good information.

### Corrective RAG (CRAG)

The agent detects retrieval failure and corrects course.

Pattern:
1. Retrieve documents
2. Agent evaluates: "Are these documents relevant?"
3. If not relevant: try a different retrieval strategy (e.g. different query, different embedding model, different database)
4. If still failing: fall back to generation without retrieval or admit knowledge gap

This prevents bad retrievals from poisoning the final answer.

### Adaptive RAG

The agent chooses retrieval strategy based on query characteristics.

Pattern:
1. Analyze query type (Is it factual? Reasoning-heavy? Multi-hop?)
2. Choose strategy: factual queries → dense retrieval; reasoning → multi-hop + re-ranking
3. Execute retrieval with chosen strategy
4. Evaluate result quality
5. Retry with different strategy if needed

This is more efficient than running the same strategy for all queries.

### Multi-Source RAG

Agent retrieves from multiple knowledge bases and decides which to trust.

Pattern:
1. Query hits multiple knowledge bases simultaneously (documentation, research papers, internal wiki, customer feedback)
2. Agent deduplicates and cross-references results
3. Agent handles conflicts (if sources disagree, acknowledge both perspectives or apply consensus voting)
4. Agent ranks sources by authority for the specific query

### Tool-Augmented RAG

Agent uses tools to enrich retrieval.

Example tools:
- `search_web()` for real-time information
- `query_database()` for structured data
- `fetch_api()` for current prices or status
- `read_file()` for local documents

Pattern:
1. Agent decides which tool to use
2. Calls tool
3. Combines results from multiple tools
4. Generates answer

This breaks pure RAG (which searches a static index) into a more dynamic system.

---

## Vector Database Selection

| Database | Managed? | Self-hosted? | Scaling | Cost Model | Best For |
|----------|----------|--------------|---------|-----------|----------|
| **Pinecone** | ✓ | ✗ | Easy (serverless) | Per-query, per-vector | Teams wanting zero ops |
| **Weaviate** | ✓ | ✓ | Moderate (cloud + self) | Subscription or self-hosted | Hybrid search, GraphRAG |
| **Qdrant** | ✓ | ✓ | Easy (cloud + self) | Per-vector or subscription | Speed-focused teams, on-prem |
| **ChromaDB** | ✗ | ✓ | Limited (embedded, small clusters) | None (open-source) | Prototyping, local development |
| **pgvector** | ✗ | ✓ | High (PostgreSQL) | None (open-source) | Teams with existing PostgreSQL |

**Trade-offs**:
- **Managed (Pinecone, Weaviate Cloud, Qdrant Cloud)**: No ops, predictable scaling, higher per-query costs, vendor lock-in risk.
- **Self-hosted (Weaviate, Qdrant, ChromaDB, pgvector)**: Full control, lower total cost at scale, higher operational burden.

**Scaling benchmarks**:
- 1K–100K vectors: ChromaDB, pgvector, or cloud tier is fine
- 100K–10M vectors: Qdrant or Weaviate recommended
- 10M+ vectors: Qdrant with clustering, or Weaviate with sharding, or Pinecone

**Cost modelling** for 1M vectors:
- Pinecone: ~$200–500/month (index storage + queries)
- Qdrant (self-hosted on AWS): ~$300–400/month (compute + storage)
- pgvector (self-hosted on AWS): ~$200–300/month (database instance)

Managed options are cheaper at low scale (<10M vectors). Self-hosted is cheaper at massive scale (>100M vectors).

---

## Production Concerns

### Index Freshness

Your knowledge base grows. Documents are updated. Old information becomes stale. How do you keep your vector index fresh?

Strategies:
1. **Re-index on schedule** (daily, weekly): delete old embeddings, re-embed everything. Simple but expensive.
2. **Incremental indexing** (on-update): when a document changes, re-embed just that document. Scales better.
3. **Versioning**: keep multiple versions of each document. Let the LLM decide which version to use.
4. **Recency weighting**: score recent documents higher, even if they're less similar. Use metadata filters.

**Recommendation**: Use incremental indexing + recency weighting. Delete embeddings only for documents that are confirmed deleted.

### Access Control

In multi-tenant systems, agents need to retrieve only documents they're permitted to see.

Implementation:
- Tag each chunk with permissions metadata (e.g. `["team_sales", "team_product"]`)
- At retrieval time, filter by authenticated agent's permitted teams
- Use vector database filtering (all modern databases support this)

Example: Agent A (team_sales) retrieves. Database returns only chunks tagged `["team_sales"]`. Agent B (team_product) doesn't see sales documents.

### Evaluation: Measuring Retrieval Quality

You can't improve what you don't measure. Key metrics:

- **Precision@k**: Of the top-k retrieved chunks, how many are relevant? (0–1 scale)
- **Recall**: Of all relevant chunks in the database, what fraction did we retrieve? (0–1 scale)
- **MRR (Mean Reciprocal Rank)**: How high does the first relevant chunk rank? (1/rank, 0–1 scale)
- **NDCG (Normalized Discounted Cumulative Gain)**: Weighted ranking score (accounts for relevance degree, not just binary)

**Practical recommendation**:
1. Build a small evaluation set (100–500 queries with human-annotated relevant chunks)
2. Measure precision@10 and recall@100 for each retrieval strategy
3. A/B test new chunking or retrieval strategies against this baseline
4. Re-evaluate quarterly

Most teams find that moving from naive RAG to advanced RAG (hybrid search + re-ranking) improves precision@10 from ~0.6 to ~0.85.

### Cost Management

Three cost drivers in RAG:

1. **Embedding costs** (at index time): Model API calls to embed documents. Amortized over index lifetime.
2. **Query costs** (at retrieval time): Embedding the query, possibly re-ranking. Per-query cost.
3. **Storage costs** (ongoing): Vector database subscription or compute.

Optimization strategies:
- Use smaller embedding models (all-MiniLM-L6-v2) for embedding; cross-encoders for re-ranking
- Cache query embeddings if the same query arrives multiple times (unlikely in agent systems, but possible in user-facing systems)
- Batch embed documents instead of streaming (5–10× faster)
- Use sparse retrieval (BM25) for exact-match queries (free, no API calls needed)

For a system with 1M documents and 1K queries/day:
- Embedding 1M documents at 0.001 embedding_cost/1K tokens ≈ $1–3 (one-time)
- 1K queries/day, each requiring 1 embedding call ≈ $0.30/day or $9/month
- Storage on Pinecone ≈ $200–400/month

**Total monthly cost**: ~$210–430/month.

### Latency Optimisation

Modern agents care about latency. Every millisecond of retrieval is latency added to agent steps.

Targets:
- Dense retrieval: <100ms for 10M vectors
- Re-ranking: <200ms for 100 candidates
- Total retrieval pipeline: <300ms

Optimizations:
- Use HNSW indices (faster than IVF for <100M vectors)
- Batch queries when possible
- Use approximate nearest-neighbour search (sacrifice 1–2% accuracy for 10× speedup)
- Cache popular queries or pre-compute retrieval for common agent patterns
- Run retrieval on dedicated hardware (GPU for cross-encoders, CPU for vector search)

---

## Multi-Agent RAG

As you deploy multiple agents, a question arises: do they share a knowledge base, or does each have its own?

### Shared Knowledge Base

**Pattern**: One central knowledge base. All agents retrieve from it.

Pros:
- Consistency (all agents see the same documents)
- Efficiency (index once, serve many)
- Easier maintenance

Cons:
- Single point of failure
- All agents compete for retrieval resources
- Difficult access control (some agents shouldn't see all documents)

### Agent-Specific Retrieval Contexts

**Pattern**: Shared knowledge base, but each agent filters by role/domain.

Example:
- Sales agent: retrieves from `sales_docs`, `product_docs`, `pricing_docs`
- Support agent: retrieves from `support_docs`, `faq_docs`, `product_docs`
- Research agent: retrieves from `research_papers`, `market_analysis`, `competitor_docs`

Implement using metadata tags and database filtering.

### Knowledge Base Federation

**Pattern**: Multiple knowledge bases, each owned by a team. Central agent queries all.

Example architecture:
- Sales knowledge base (managed by sales team)
- Product knowledge base (managed by product team)
- Engineering knowledge base (managed by engineering team)
- Central coordinator agent: "retrieve from all three, combine results, handle conflicts"

This scales well (teams maintain their own docs) but requires careful conflict resolution.

### Conflict Resolution

When retrieving from multiple sources, answers may conflict.

Strategies:
1. **First-match**: Use the first source that answers confidently. Risky.
2. **Consensus**: Require multiple sources to agree. Safer, but may fail to retrieve anything.
3. **Authority ranking**: Score sources by authority for the specific query. Complex but powerful.
4. **Transparent disagreement**: Show the agent all conflicting sources and let it reason about them.

**Recommendation**: Use authority ranking + transparent disagreement. Tag documents with source authority (e.g. `authority: 0.9` for official docs, `authority: 0.3` for community-contributed docs). Let the agent see multiple perspectives.

---

## Implementation Roadmap

### Phase 1: Basic RAG (Weeks 1–2)

**Goal**: Build a working retrieval system. Validate that your embedding model + vector database + generation pipeline work together.

Acceptance criteria:
- [ ] Ingest 1000+ documents into vector database
- [ ] Retrieve top-5 chunks for 10 test queries
- [ ] Pass human evaluation: retrieved chunks are relevant to queries
- [ ] Agent can answer simple factual questions using retrieved context
- [ ] End-to-end latency <2 seconds per query

Tools: LangChain or LlamaIndex (fast start), any vector database (Pinecone, Qdrant, ChromaDB).

### Phase 2: Advanced Retrieval (Weeks 3–4)

**Goal**: Improve retrieval quality. Add hybrid search and re-ranking.

Acceptance criteria:
- [ ] Implement hybrid retrieval (dense + BM25)
- [ ] Add cross-encoder re-ranking
- [ ] Measure retrieval precision@10 ≥0.75 on evaluation set
- [ ] Latency <500ms per query (acceptable for agent use)
- [ ] Document-aware chunking for your document types

Tools: Hybrid search (Weaviate, Qdrant support natively), re-ranker (Cohere Rerank or LLM-based).

### Phase 3: Agentic RAG (Weeks 5–6)

**Goal**: Make retrieval a decision point for the agent.

Acceptance criteria:
- [ ] Agent has `retrieve()` tool
- [ ] Agent evaluates whether it needs retrieval for each query (Self-RAG)
- [ ] Agent detects retrieval failure and retries (Corrective RAG)
- [ ] Agent chooses retrieval strategy based on query (Adaptive RAG)
- [ ] Precision@10 ≥0.80 (better than Phase 2, due to intelligent retry)

Tools: Agent framework (LangChain agents, AutoGPT, custom loop).

### Phase 4: Multi-Agent RAG (Weeks 7–8)

**Goal**: Federate retrieval across multiple agents and knowledge bases.

Acceptance criteria:
- [ ] Define retrieval contexts for 3+ agent roles
- [ ] Implement metadata filtering by role
- [ ] Handle conflicts when multiple agents retrieve contradictory information
- [ ] Measure end-to-end system accuracy on 100+ multi-step tasks
- [ ] Document knowledge base ownership and refresh schedule

Tools: Multi-agent orchestration (custom router, LangChain multi-agent), federation logic.

---

## Conclusion

RAG is the bridge between your agent's reasoning capability and your organisation's knowledge. Getting it right—from chunking to retrieval strategy to evaluation—means your agents can scale from toy projects to production systems that actually improve business outcomes.

Start with Phase 1. Measure everything. Iterate. Don't move to the next phase until you've validated your current one.

The teams that win with agents aren't the ones who use the fanciest models. They're the ones who obsess over their retrieval pipeline and keep their knowledge base fresh, accurate, and accessible.

---

## Cross-References

- **RAG vs Fine-Tuning vs Prompt Engineering: Decision Tree** (HD-1009) — When to choose RAG over alternatives
- **Agent Memory: The Complete Decision Tree** (HD-1013) — How RAG fits into broader memory architecture
- **Cost Optimisation for Agent Operations** (HD-1103) — Reducing embedding and storage costs at scale
- **Agent Monitoring & Observability Stack** (HD-1102) — Evaluating retrieval quality in production
