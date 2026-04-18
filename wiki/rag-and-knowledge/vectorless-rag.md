---
tags: [rag, llm, retrieval, vectorless-rag, vector-db, pageindex]
source: https://pub.towardsai.net/vectorless-rag-your-rag-pipeline-doesnt-need-a-vector-database-0a0839feabd9
---

# Vectorless RAG

Vectorless RAG is a retrieval architecture that replaces the traditional embedding-search-chunk pipeline with **LLM-driven reasoning over a hierarchical document tree**. The approach eliminates vector databases entirely, using structured indexes and chain-of-thought navigation instead of similarity search.

## The Problem with Vector RAG

Traditional vector RAG optimizes for **similarity**, not **truth**. Key failure modes:

- Chunks that mention the right topic but come from the wrong clause or section
- Cross-references split across chunk boundaries
- Definitions separated from their dependencies
- No traceable reasoning for why a chunk was retrieved -- only opaque embedding distances

These failures are most damaging in domains where precision matters: finance, legal, and technical documentation.

## How Vectorless RAG Works

The approach uses two steps with only **two LLM calls per query**:

### Step 1: Build a Tree Index

[[PageIndex]] (or a similar tool) reads the document and produces a nested JSON tree. Each node contains:

- Title and `node_id`
- Page range
- LLM-generated summary
- Child nodes

### Step 2: Reason Over the Tree

The LLM receives node titles and summaries (not full text) and outputs:

- A `thinking` field (chain-of-thought reasoning about which sections are relevant)
- A `node_list` (specific node IDs to retrieve)

Full text is fetched only after the navigation decision is made.

### Design Decisions

- **`temperature=0` for retrieval** -- same document + same question should always retrieve the same section
- **Chain-of-thought before node selection** -- the `thinking` field forces reasoning before committing, producing better navigation decisions
- **Titles + summaries only in the prompt** -- keeps the navigation call lean and cheap

## Decision Guide

| Use Vectorless RAG | Use Vector RAG |
|---|---|
| Document has clear hierarchy (10-Ks, contracts, manuals) | Large collections (thousands of documents) |
| Accuracy matters; wrong answer has consequences | Broad semantic queries ("find everything about X") |
| Need audit trail (section + page + reasoning) | High query volume, strict latency budget |
| Single-document QA per query | Documents are poorly formatted or lack structure |

## Trade-offs

| Dimension | Vectorless RAG | Vector RAG |
|---|---|---|
| **Retrieval quality** | Reasoning-level precision on structured docs | Good for broad semantic matching |
| **Latency** | Extra LLM call adds meaningful latency | Near-instant after indexing |
| **Cost at scale** | LLM call per query -- real budget line at volume | Near-zero marginal cost post-indexing |
| **Explainability** | Full reasoning trace, page + section citations | Embedding distance scores only |
| **Model dependency** | Weak models = bad navigation | Embedding model quality matters less |

## Hard Requirements

- **Structured documents are a hard dependency** -- scanned PDFs, poorly-formatted exports, and presentation decks produce flat trees with weak summaries
- **Multi-document RAG is unsolved** -- the approach is designed for single-document QA; cross-collection search is still in development

## Practical Advice

> "Run 20-30 real questions from your actual use case on both approaches. One day of evaluation beats months of architecture debate."

Implementation requires approximately 50 lines of Python using the [[PageIndex]] library.

## See Also

- [[PageIndex]] -- the primary open-source implementation
- [[LLM Knowledge Base]] -- broader context on retrieval approaches
