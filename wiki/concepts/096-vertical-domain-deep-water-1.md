---
tags: [vertical-domain, ai-engineering, law, finance, rag, hybrid-search, knowledge-graph, llm]
source: https://u.geekbang.org/lesson/818?article=930878
---

# Deep Waters of Vertical Domain AI (Part 1): Law and Finance

Advanced challenges in applying AI to specialized industries — law and finance — where accuracy and reliability are non-negotiable.

## Key Concepts

- **力度错配 (Granularity Mismatch)**: Legal texts have strict logical dependencies between clauses (A→B→C). Naive fixed-size chunking breaks these logical units, causing incomplete or contradictory answers.
- **关键字丢失 (Keyword Loss)**: Vector embeddings are insensitive to numbers and identifiers (e.g., case numbers, article numbers). Pure semantic search misses exact-match queries critical in legal work.
- **混合检索 (Hybrid Search)**: Combining BM25/Elasticsearch keyword search with vector similarity search, then re-ranking, to handle both semantic and exact-match retrieval needs.
- **知识图谱 (Knowledge Graph)**: Extracting triples from legal documents and storing in Neo4j enables sub-graph traversal and cross-clause reasoning that flat RAG cannot achieve.
- **元数据锚定 (Metadata Anchoring)**: Attaching structured metadata (law name, article number, effective date) to every chunk, enabling precise filtering and version control.
- **沙箱执行 (Sandbox Execution)**: Routing numeric computation requests to a Python sandbox (numpy/pandas) instead of letting the LLM compute directly, eliminating numeric hallucinations.
- **实体链接 (Entity Linking)**: Using a BERT-based model to map domain-specific abbreviations and jargon to canonical definitions before retrieval.

## Key Takeaways

- Vertical domain AI prioritizes **stability over creativity** — the "approximately correct" that works in general chat is a serious accident in law, finance, or medicine.
- Standard naive RAG has two structural failure modes in legal applications: granularity mismatch and keyword loss. Both require purpose-built engineering solutions.
- Legal document chunking must respect the logical hierarchy (条/款/项/目) using rule-based or semantic boundary detection, not fixed token windows.
- Financial AI is best understood as a **data parser + code executor + knowledge reasoner** — not a chatbot. Its value is liberating analysts from manual data extraction, not making investment decisions autonomously.
- Domain-specific terminology always requires a dedicated disambiguation layer (entity linking, terminology database, or MCP tool) before embedding or retrieval.
- The modern architecture (knowledge graph + GraphRAG + hybrid search) supersedes the earlier brute-force approaches, but both solve the same core problem: preserving relational context.
- AI investment decisions are probabilistic and depend entirely on the quality of the input data — historical validation is misleading because the data changes.

## See Also

- [[095-ai-product-from-functional-to-good]]
- [[097-vertical-domain-deep-water-2]]
