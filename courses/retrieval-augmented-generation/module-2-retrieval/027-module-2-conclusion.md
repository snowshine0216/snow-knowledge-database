---
tags: [rag, retrieval, module-2, conclusion, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/nnrir/module-2-conclusion
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. A retriever can only use one search technique at a time — either keyword or semantic — because combining them would produce conflicting results. True or false, and why?
2. What unique property of embedding vectors makes semantic search possible, and what does "similar meaning" actually look like in the vector space?
3. Why would you use metadata filtering in a retrieval pipeline, and at what stage of hybrid search does it apply?

---

# Lecture 027: Module 2 Conclusion

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/nnrir/module-2-conclusion) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [What Module 2 Established](#what-module-2-established)
- [Hybrid Search: The Three Techniques Unified](#hybrid-search-the-three-techniques-unified)
- [Evaluating Retrieval Quality](#evaluating-retrieval-quality)
- [What Lies Ahead](#what-lies-ahead)

---

## What Module 2 Established

Module 2 opened the retriever and examined its internals. The key insight is that production retrievers do not rely on a single search strategy. They use a **hybrid** of three complementary techniques — keyword search, semantic search, and metadata filtering — each contributing something the others cannot provide on their own. Understanding why each technique exists, and what limitation it compensates for, is the practical foundation for building and tuning a real retrieval pipeline.

---

## Hybrid Search: The Three Techniques Unified

**Keyword search** is the most mature of the three. It ranks documents by the frequency with which they contain the exact keywords found in the user's prompt. Its primary value is precision: if the user asks for a specific product name, a code symbol, or an acronym, keyword search ensures documents containing that literal string surface at the top. No model inference is required, and the logic is fully interpretable.

**Semantic search** operates at the level of meaning rather than literal tokens. It depends on an **embedding model**, which maps pieces of text to vectors in a high-dimensional space. The critical property of these vectors is that texts with similar meaning are embedded close to one another — proximity in vector space corresponds to conceptual relatedness. This allows semantic search to match a query to relevant documents even when they share no words in common, covering the flexibility that keyword search lacks.

**Metadata filtering** works differently from the other two. Rather than ranking documents by relevance, it **excludes** documents that fail strict criteria attached to each document's metadata — for example, filtering to documents scoped to a particular user, date range, or department. It typically runs after keyword and semantic retrieval have each produced a candidate list, trimming both lists before their results are merged.

**Hybrid search** combines all three. The pipeline runs keyword and semantic search independently across the knowledge base, applies the metadata filter to prune each result set, and then merges the two filtered lists into a single ranked list. The top matches from this merged list are what the retriever returns to the augmented prompt. This design means no single technique's weaknesses become a system-level failure: keyword search handles exact matches, semantic search handles paraphrase and conceptual queries, and metadata filtering enforces hard eligibility constraints that relevance scoring should not override.

---

## Evaluating Retrieval Quality

Module 2 also introduced the measurement side of retrieval. Retrieval is not a component you set and forget — it has tunable hyperparameters (embedding model choice, keyword weighting, filter logic, the number of documents returned), and changes to any of these can improve or degrade results. A set of standard metrics exists precisely to detect these changes. By running retrieval over a held-out evaluation set and computing these metrics before and after adjusting a hyperparameter, you can make principled decisions about which configuration actually serves the downstream task better. This closes the loop between building a retriever and validating that it works as intended.

---

## What Lies Ahead

Module 2 covered retrieval at the conceptual and algorithmic level — what the techniques are, how they combine, and how to measure them. The next module moves from concept to production scale. The lessons ahead examine how these retrieval principles are applied inside a **production-scale retriever**: the infrastructure choices, the operational constraints, and the engineering decisions that separate a working prototype from a system reliable enough to serve real users. With a solid grounding in the why behind hybrid search (see [[021-introduction-to-retrieval]], [[022-keyword-search]], [[023-semantic-search]], [[024-metadata-filtering]], [[025-hybrid-search]]) and retrieval evaluation (see [[026-evaluating-retrieval]]), the engineering module that follows will have the context to make those design decisions legible.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Describe the full hybrid search pipeline from query receipt to returning results — name every technique, the order it applies, and what each one contributes.
2. Why is the "close in vector space" property of embeddings necessary for semantic search to work? What would break if embeddings were assigned randomly?
3. A colleague proposes removing metadata filtering from the pipeline to simplify it, arguing that semantic search will naturally deprioritize irrelevant documents. What failure mode does this create, and why does filtering need to be a hard constraint rather than a soft ranking signal?

<details>
<summary>Answer Guide</summary>

1. The pipeline runs keyword search and semantic search in parallel across the knowledge base. Keyword search ranks documents by exact token overlap with the query; semantic search ranks documents by embedding-vector proximity. A metadata filter is then applied to both result sets, removing documents that fail strict eligibility criteria (e.g., wrong user, wrong date range). The two filtered lists are merged into a single ranked list, and the top documents from that list are returned to the augmented prompt. No single technique dominates — each handles a class of queries the others handle poorly.

2. If embeddings were random, a query vector would be equally distant from all document vectors regardless of meaning. The only reason semantic search can retrieve conceptually related documents that share no keywords is that the embedding model has learned to place semantically similar texts near each other. Proximity is the signal; without it, there is no information to retrieve on.

3. Metadata filtering enforces hard eligibility constraints — documents that must not appear for a given user or context (e.g., documents belonging to another tenant, or documents outside an authorized date range). Semantic search produces a ranking, not a binary gate. A document that is highly semantically relevant to a query but belongs to the wrong user might rank very highly and slip through — a ranking signal cannot prevent this. Metadata filtering operates as a binary exclude/include decision that relevance scores cannot override, which is exactly the behavior required for security, privacy, and scope constraints.

</details>
