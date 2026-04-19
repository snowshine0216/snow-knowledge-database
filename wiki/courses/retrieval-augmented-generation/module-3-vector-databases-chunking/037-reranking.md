---
tags: [rag, reranking, retrieval-augmented-generation, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/ggi4nx/reranking
---

## Pre-test

**Question 1.** A cross-encoder re-ranker is applied to 50 candidate chunks retrieved by a bi-encoder. If the cross-encoder assigns the highest relevance score to chunk #47, what does the final system return to the LLM, and why does this differ from what a pure bi-encoder pipeline would have returned?

**Question 2.** Why is it computationally infeasible to use a cross-encoder as the *primary* retrieval mechanism over a knowledge base of 10 million documents, but perfectly acceptable to use it as a re-ranker on a shortlist of 20–100 documents?

**Question 3.** LLM-based re-ranking and cross-encoder re-ranking share a fundamental efficiency bottleneck. What is that bottleneck, and how does it constrain where in the RAG pipeline both techniques can be deployed?

---

# Lecture 037: Reranking

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/ggi4nx/reranking | DeepLearning.AI | Retrieval-Augmented Generation

## Outline

1. [What Re-ranking Is and Where It Sits in the Pipeline](#what-re-ranking-is-and-where-it-sits-in-the-pipeline)
2. [Why the Initial Vector Search Falls Short](#why-the-initial-vector-search-falls-short)
3. [The Over-Fetch Strategy](#the-over-fetch-strategy)
4. [Cross-Encoder Architecture for Re-ranking](#cross-encoder-architecture-for-re-ranking)
5. [LLM-Based Re-ranking](#llm-based-re-ranking)
6. [Practical Guidance: When and How to Add Re-ranking](#practical-guidance-when-and-how-to-add-re-ranking)

---

## What Re-ranking Is and Where It Sits in the Pipeline

**Re-ranking** is a post-retrieval, pre-generation step that improves the quality of documents sent to the LLM by re-scoring an already-retrieved candidate set with a more capable — and more expensive — model. The critical insight is positional: re-ranking sits *after* the vector database has returned its initial results and *before* those results are assembled into the prompt context. This placement is not incidental; it is what makes the technique tractable. Because the candidate pool has already been dramatically narrowed by the first-pass retrieval, computationally intensive scoring models become economically viable.

The word "re-ranking" signals a two-stage process. Stage one is fast and approximate — a bi-encoder vector search sweeps over potentially millions of documents in milliseconds. Stage two is slow and precise — a re-ranker examines only the small shortlist that survived stage one, assigning new relevance scores and reordering the results. The documents ultimately handed to the LLM are drawn from the re-ranked list rather than the original vector search ranking. This division of labor is the engineering principle that makes high-quality retrieval scalable.

---

## Why the Initial Vector Search Falls Short

Vector similarity search is powerful, but it operates on compressed semantic representations — embeddings — that inevitably lose nuance. When a user asks "What is the capital of Canada?", a bi-encoder embeds both the query and each document into the same vector space and retrieves documents whose embeddings are geometrically close. The problem is that proximity in embedding space does not guarantee direct relevance to the question. A chunk stating "Toronto is in Canada" is semantically related to the query because it shares key entities, yet it does not answer the question. Similarly, "The capital of France is Paris" shares the structural pattern *capital of X is Y* and therefore lands nearby in embedding space. "Canada is the maple syrup capital of the world" exploits the term "capital" itself.

None of these documents answer the question "What is the capital of Canada?" but all of them might rank highly under cosine similarity. This is the *semantic gap problem*: embeddings capture topical relatedness but struggle with *answerability* — whether a document actually satisfies the information need expressed by the query. A well-trained re-ranker models the interaction between query and document explicitly, which is precisely why it can separate "Ottawa is the capital of Canada" from the topically adjacent but unhelpful alternatives above. See [[036-cross-encoders-and-colbert]] for the architectural reason cross-encoders can model this interaction while bi-encoders cannot.

---

## The Over-Fetch Strategy

The standard operational pattern for re-ranking is deliberate over-fetching. Rather than asking the vector database for the five or ten documents you ultimately want to pass to the LLM, you request a much larger set — typically 20 to 100 documents or chunks — using a standard [[022-hybrid-search]] or dense retrieval approach. This over-fetched set is the input to the re-ranker.

The re-ranker scores every document in the candidate set against the query, producing a new relevance ordering. The final documents delivered to the LLM are the top five to ten from this re-ranked list, not the top five to ten from the original vector search. The practical consequence is significant: a document that the bi-encoder ranked fiftieth might be the most genuinely relevant piece of text in the corpus, and re-ranking is the mechanism that promotes it to first place before the LLM ever sees any context.

Why fetch more than you need in the first round? Because the bi-encoder's ranking errors are not distributed evenly — the truly relevant document is likely *somewhere* in the top 50 or 100 results, just not necessarily at position 1. Over-fetching buys the re-ranker enough material to find signal that the bi-encoder buried. The cost is a modest increase in the number of scoring operations the re-ranker must perform, which is accepted as worthwhile given the relevance gains.

---

## Cross-Encoder Architecture for Re-ranking

Most production re-rankers are built on the **cross-encoder** architecture. Recall from [[036-cross-encoders-and-colbert]] that a cross-encoder takes a *concatenated* query-document pair as input and produces a single relevance score, rather than encoding query and document independently into separate vectors. This joint encoding allows the model's attention mechanism to directly compare tokens from the query against tokens from the document, which is why cross-encoders substantially outperform bi-encoders on relevance judgments.

The reason cross-encoders could not serve as the primary retrieval mechanism is that scoring requires the query to be present — you cannot precompute document representations offline and then retrieve by nearest-neighbor lookup. Every query-document pair must be scored at query time, which means latency scales linearly with the size of the corpus. For a knowledge base of millions of documents this is completely infeasible; every query would take minutes.

In a re-ranking context, however, the corpus has already been reduced to 20–100 candidates. A cross-encoder now needs to run only 20–100 forward passes, each on a short concatenated sequence, which adds a modest but acceptable amount of latency. The trade-off — a small number of additional milliseconds in exchange for a substantial improvement in retrieval precision — is almost universally worth accepting. The architecture therefore turns a prohibitive weakness (poor scalability) into a manageable cost by exploiting the work already done by the first-stage retriever.

---

## LLM-Based Re-ranking

A more recent variant replaces the specialized cross-encoder with a general-purpose *large language model* fine-tuned or prompted to output numerical relevance scores. The input format is conceptually identical: the model receives a query-document pair and must return a score indicating how well the document answers the query. LLMs well-suited for this task can perform nuanced semantic analysis, reason about implication and paraphrase, and handle long-context passages more gracefully than a typical cross-encoder.

Despite the intuitive appeal, **LLM-based re-ranking** shares the same structural bottleneck as cross-encoder re-ranking: scoring cannot begin until the query arrives, and each document must be processed individually through a large model. The computational cost per document is roughly comparable to — or in many cases higher than — a cross-encoder forward pass, because modern LLMs have far more parameters than a typical BERT-scale cross-encoder. This means LLM-based re-ranking provides no scalability advantage over cross-encoder re-ranking; it simply replaces one post-retrieval scoring mechanism with another.

The practical consequence is that LLM-based re-ranking remains a stage-two technique — it can only be applied after a first-pass retriever has narrowed the candidate pool. Applying it to millions of documents directly would be even slower than applying a cross-encoder to millions of documents. Whether the quality improvement over cross-encoders justifies the additional cost is an active area of refinement, but the architectural role is fixed: it is a re-ranking technique, not a retrieval technique.

---

## Practical Guidance: When and How to Add Re-ranking

Re-ranking does not require deep infrastructure changes, which is one of its most important practical virtues. Many vector databases expose re-ranking as a first-class query parameter — enabling it can be as simple as adding a single field to an existing search call. Because the integration cost is so low, re-ranking should be among the first improvements you attempt when the quality of a RAG pipeline's retrieved context is unsatisfactory.

A reasonable starting configuration is to over-fetch 15 to 25 documents in the initial vector search and then re-rank across all of them before selecting the final 5 to 10 for the prompt. This regime captures most of the relevance benefit while keeping re-ranking latency predictable. The latency overhead is real — scoring 25 document-query pairs through a cross-encoder adds milliseconds to every query — but for the vast majority of RAG applications operating at human conversation timescales, this overhead is imperceptible.

It is worth emphasizing that re-ranking interacts constructively with hybrid search. The dense semantic search and the sparse keyword-based BM25 component of [[022-hybrid-search]] may each surface different relevant documents; re-ranking can then unify and properly order results that arrived through both channels. The combined pipeline — hybrid retrieval followed by cross-encoder re-ranking — represents a practical high-quality baseline that outperforms either technique in isolation, and it remains tractable at the document volumes typical of enterprise RAG deployments.

---

## Post-test

**Question 1.** In a two-stage RAG retrieval pipeline, what is the role of re-ranking and at what point does it execute relative to the vector database query and the LLM generation step?

**Question 2.** Explain why a cross-encoder is suitable as a re-ranker on a 50-document shortlist but unsuitable as the primary retrieval mechanism over a million-document corpus.

**Question 3.** What operational pattern (in terms of fetch count) should you use when adding a re-ranker to an existing RAG pipeline, and roughly how many documents should be passed to the LLM after re-ranking?

<details><summary>Answer guide</summary>

**Answer 1.** Re-ranking is a post-retrieval, pre-generation step. After the vector database returns its initial candidate set (e.g., top 20–100 documents), the re-ranker re-scores and reorders those candidates using a more capable model. Only the top-ranked subset from this new ordering is then included in the LLM's prompt context. It runs after the vector DB query completes and before the LLM receives any retrieved text.

**Answer 2.** A cross-encoder takes a concatenated query-document pair and cannot pre-compute document representations offline. Every scoring operation must happen at query time, so cost scales linearly with corpus size. Applied to one million documents per query, latency would be prohibitive (minutes per query). Applied to a 50-document shortlist, only 50 forward passes are needed, adding milliseconds — an acceptable trade-off for the substantial relevance gain.

**Answer 3.** The standard pattern is to *over-fetch* in the first stage: retrieve 15–25 (up to 100) candidate documents from the vector database, then re-rank all of them. From the re-ranked list, pass only the top 5–10 documents to the LLM. This ensures that genuinely relevant documents buried in the initial ranking are promoted before the LLM sees them.

</details>
