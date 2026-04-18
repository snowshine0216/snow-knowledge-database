---
tags: [rag, llm, pageindex, retrieval, hierarchical-index, vectorless-rag]
source: https://github.com/VectifyAI/PageIndex
---

# PageIndex

PageIndex is an open-source Python library by VectifyAI that replaces traditional [[Vectorless RAG|vector-based RAG]] with **LLM-driven reasoning over a hierarchical document tree**. Instead of embedding chunks and running similarity search, PageIndex builds a nested JSON index of a document's natural structure (chapters, sections, subsections) and uses an LLM to navigate that tree at query time.

## How It Works

PageIndex follows a two-phase workflow:

1. **Offline tree generation** -- The library reads a PDF or Markdown file and builds a tree where each node contains a title, page range, LLM-generated summary, and child nodes. This step requires LLM calls and should be cached.
2. **Online retrieval** -- Given a query, the LLM reads node titles and summaries (not full text), reasons about which sections are relevant, and returns specific node IDs. Full text is fetched only after the navigation decision.

The retrieval path through the tree is fully traceable -- every result cites page numbers and section paths.

## Key Properties

| Property | Detail |
|---|---|
| Language | Python |
| LLM backend | Any provider via LiteLLM (OpenAI, Anthropic, Gemini, local) |
| Deployment modes | Self-hosted, SaaS, MCP server, REST API, enterprise on-prem |
| Input formats | PDF, Markdown |
| Benchmark | 98.7% on FinanceBench (with full Mafin 2.5 system) |

## When to Use PageIndex

- Documents are **long with rich hierarchy** (SEC filings, legal contracts, technical manuals)
- **Accuracy matters more than cost** -- vector similarity produces wrong chunks for multi-hop questions
- **Traceability is required** -- audit trails with page and section references
- Building **agentic workflows** where the LLM controls retrieval decisions
- Already using [[Claude Code Tips Collection|MCP-capable tools]] -- PageIndex offers an MCP integration path

## When NOT to Use

- Documents are short or flat (no internal hierarchy)
- Sub-second retrieval at massive scale (millions of documents) -- tree search is LLM-driven, slower than ANN
- Cost per query must be minimal -- every retrieval step incurs LLM inference cost

## Limitations

- **LLM cost at both index and query time** -- tree generation requires summarization calls; each query requires reasoning calls
- **PDF parsing quality** -- complex layouts (tables, multi-column, scanned) may degrade tree quality; premium OCR is cloud-only
- **Single-document focus** -- multi-document cross-collection search is under development
- **Model quality dependency** -- weak reasoning models produce bad tree navigation decisions

## Practical Notes

- The core architectural insight: RAG as a *reasoning task over structured indexes* rather than *similarity search over embeddings*
- The FinanceBench 98.7% was achieved with the full Mafin 2.5 system, not bare PageIndex -- treat it as a ceiling, not a baseline
- Compare against [[LLM Knowledge Base|GraphRAG]] and LlamaIndex tree index before committing -- benchmark on your own corpus
- The OpenAI Agents SDK example (`agentic_vectorless_rag_demo.py`) is the most practical starting point for agent builders

## See Also

- [[Vectorless RAG]] -- the broader concept and decision framework
- [[LLM Knowledge Base]] -- related retrieval approaches
