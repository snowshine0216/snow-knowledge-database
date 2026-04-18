---
tags: [rag, llm, retrieval, pageindex, vector-db]
source: https://pub.towardsai.net/vectorless-rag-your-rag-pipeline-doesnt-need-a-vector-database-0a0839feabd9
---

## Article Info

- **URL:** https://pub.towardsai.net/vectorless-rag-your-rag-pipeline-doesnt-need-a-vector-database-0a0839feabd9
- **Title:** Vectorless RAG: Your RAG Pipeline Doesn't Need a Vector Database
- **Subtitle:** How reasoning-based retrieval beats similarity search on structured documents, and how to build it with PageIndex
- **Author:** Divy Yadav
- **Published:** 2026-03-20
- **Reading time:** ~12 min (2,865 words)
- **Access mode:** cookie-authenticated

---

## Key Takeaways

- **Vector RAG's core flaw:** It optimizes for *similarity*, not *truth* — returning chunks that mention the right topic but often from the wrong clause/section.
- **Chunking breaks meaning:** Cross-references split across chunks, definitions separated from dependencies, no traceable reasoning for why something was retrieved.
- **Vectorless RAG replaces the entire embedding-search-chunk pipeline** with LLM-driven reasoning over a hierarchical document tree (JSON structure with titles, page ranges, and LLM-generated summaries per section).
- **Two-step process:**
  1. Build a tree index: PageIndex reads the PDF and builds a nested JSON where each node = section with title, `node_id`, page range, summary, and child nodes.
  2. Reason over the tree: LLM reads titles+summaries (not full text), outputs a `thinking` field (chain-of-thought) and `node_list` (specific IDs to retrieve).
- **Only 2 LLM calls per query:** one for tree navigation, one for answer generation.
- **Full implementation in ~50 lines of Python** using the `pageindex` library (open-source, free tier available).
- **Retrieval is auditable:** You can read the model's step-by-step navigation reasoning and trace any error back to a specific decision — something vector similarity scores cannot provide.
- **Not universal:** Designed for structured documents (10-Ks, legal contracts, academic papers, technical manuals), not large heterogeneous collections.

---

## Insights

- **Chain-of-thought before node selection is deliberate:** The `thinking` field forces the LLM to reason before committing to node IDs — same mechanism as CoT prompting. This produces measurably better navigation decisions vs. directly asking for node IDs.
- **`temperature=0` is intentional for retrieval:** Consistency over creativity. Same document + same question should always retrieve the same section. Don't use non-zero temperature in the navigation step.
- **Tree search sends only titles+summaries, not full text:** Keeps the prompt lean and cheap. Full text only fetched *after* navigation decision is made.
- **The structured document assumption is a hard dependency:** Scanned PDFs, poorly-formatted exports, and presentation decks will produce flat trees with weak summaries — garbage in, garbage out.
- **Practical evaluation advice:** Run 20–30 real questions from your actual use case on both approaches. "One day of evaluation beats months of architecture debate."
- **Multi-document RAG is still unsolved here:** PageIndex explicitly documents single-document QA as the primary use case; multi-document cross-collection search is listed as in development.

---

## Decision Guide: Vectorless vs Vector RAG

| Use Vectorless RAG when... | Use Vector RAG when... |
|---|---|
| Document has clear hierarchy (10-Ks, contracts, manuals) | Large collections (thousands of docs) |
| Accuracy matters; wrong answer has consequences | Broad semantic queries ("find everything about X") |
| Need audit trail (section + page + reasoning) | High query volume, strict latency budget |
| Single-document QA per query | Documents are poorly formatted / lack structure |

---

## Caveats

- **Latency:** Extra LLM call for tree navigation adds meaningful latency vs. standard vector search — noticeable in conversational products.
- **Cost at scale:** Vector similarity search has near-zero marginal cost post-indexing. Tree navigation costs one LLM call per query — becomes a real budget line at high volume.
- **Model quality directly affects retrieval quality:** Weak reasoning models = bad tree navigation. Test small/local models carefully before trusting in production.
- **Article is partial access:** Full text was extracted via cookie-authenticated session; all code examples and benchmarks appear to be present.
- **No head-to-head benchmarks provided:** The article argues by reasoning and example, not by presenting recall/precision numbers comparing vectorless vs vector RAG on a benchmark dataset.

---

## Sources

- Original article: https://pub.towardsai.net/vectorless-rag-your-rag-pipeline-doesnt-need-a-vector-database-0a0839feabd9
- PageIndex library (open-source): https://github.com/VectifyAI/PageIndex
- PageIndex API dashboard (free tier): https://dash.pageindex.ai/api-keys
- DeepSeek-R1 paper (used as demo document): https://arxiv.org/pdf/2501.12948.pdf
