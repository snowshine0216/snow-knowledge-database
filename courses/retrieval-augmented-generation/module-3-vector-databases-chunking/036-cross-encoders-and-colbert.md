---
tags: [rag, reranking, cross-encoder, colbert, retrieval-augmented-generation, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/44o52k/cross-encoders-and-colbert
---

## Pre-test

1. A cross-encoder concatenates the query and each candidate document before scoring them. Why does this design make it impossible to pre-compute document representations at index time — and what specific consequence does that have for retrieval latency at scale?

2. ColBERT stores one dense vector per token rather than one vector per document. Explain the *MaxSim* scoring mechanism step by step, and derive why the number of similarity computations scales as O(|P| × |D|) for a prompt of length |P| and a document of length |D|.

3. Given a corpus of ten million documents averaging 512 tokens each, compare the total vector storage required by a bi-encoder (one 768-dim vector per document) versus ColBERT (one 768-dim vector per token). How does this change the infrastructure cost trade-off, and under what domain conditions might teams accept that cost?

---

# Lecture 036: Cross-Encoders and ColBERT

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/44o52k/cross-encoders-and-colbert | DeepLearning.AI | Retrieval-Augmented Generation

## Outline

1. [The Bi-Encoder Baseline and Its Limits](#the-bi-encoder-baseline-and-its-limits)
2. [Cross-Encoders: Deep Contextual Interaction at a Cost](#cross-encoders-deep-contextual-interaction-at-a-cost)
3. [Why Cross-Encoders Cannot Scale Alone](#why-cross-encoders-cannot-scale-alone)
4. [ColBERT: Contextualized Late Interaction](#colbert-contextualized-late-interaction)
5. [MaxSim Scoring in Detail](#maxsim-scoring-in-detail)
6. [Architecture Trade-offs: A Comparative View](#architecture-trade-offs-a-comparative-view)

---

## The Bi-Encoder Baseline and Its Limits

Every semantic search system studied so far in this course — from the introduction in [[019-semantic-search-introduction]] to the embedding model deep-dive in [[020-semantic-search-embedding-model-deepdive]] — depends on a fundamental design choice: the **bi-encoder**. A bi-encoder passes each document through an embedding model independently, producing a single dense vector that summarises the entire document's meaning. When a query arrives, the system embeds it through the same model, producing its own single vector. Retrieval then reduces to finding the vectors whose cosine similarity (or inner product) is highest relative to the query vector, a task that approximate-nearest-neighbour (ANN) indexes accomplish in milliseconds even over hundreds of millions of documents.

The term *bi-encoder* captures the architectural fact that the document side and the query side are encoded separately and never interact during the embedding step. This separation is not merely a technical detail — it is the property that makes the entire system tractable. Because no query is needed when documents are indexed, all document embeddings can be computed days or weeks before any user ever types a search term. At query time the only fresh computation is a single forward pass for the query itself, followed by a fast ANN lookup. This asymmetry between expensive offline indexing and cheap online retrieval is why bi-encoders have become the default architecture for production semantic search.

The limitation that follows from this separation is equally fundamental. When a model embeds a document without any knowledge of the query, it must compress all of the document's information into a fixed-size vector. That vector cannot know which aspects of the document will matter to a future query. A document about "New York dining" gets the same representation whether the eventual query is "great restaurants in Manhattan" or "street food vendors near Times Square." The bi-encoder does a good job on average, but it necessarily loses fine-grained query-document interactions that could sharply improve ranking precision.

---

## Cross-Encoders: Deep Contextual Interaction at a Cost

The most direct way to recover those lost interactions is the **cross-encoder**. Rather than embedding the query and document in isolation, a cross-encoder concatenates the two texts — placing the query first, then the document — and feeds the combined sequence into a single BERT-style transformer. Because both texts appear together in the same forward pass, every layer of the transformer can compute attention weights between query tokens and document tokens simultaneously. The model is then trained to output a single scalar: a *relevancy score* ranging from 0 to 1 that can be interpreted as the probability of a meaningful match between the query and the document.

This design produces significantly higher ranking quality than a bi-encoder on standard benchmarks. The reason is straightforward from the architecture. When the model sees "eat" from the query "great places to eat in New York" and "cuisine" in a candidate document in the same attention context, it can form a soft alignment between those tokens during encoding. A bi-encoder, having committed each side to its own vector before they ever meet, cannot form such alignments — it must rely on the geometric proximity of independently produced embeddings.

The relevancy score a cross-encoder produces is not a cosine similarity between two pre-existing vectors; it is a learned judgment about the specific pairing in front of it. This is a categorical shift in how relevance is computed. A bi-encoder answers the question "are these two vectors near each other?" while a cross-encoder answers the question "given all the text of both the query and the document together, does this document satisfy this query?" The second question is harder and more expensive to answer, but it is the right question.

---

## Why Cross-Encoders Cannot Scale Alone

The quality advantage of cross-encoders comes at a cost that makes them unsuitable as a primary retrieval mechanism at any real-world scale. The fundamental problem is that cross-encoders cannot pre-compute anything. Because a cross-encoder needs the query to score any document, no document embedding can be produced until after the user has submitted their query. Every search request therefore requires running a separate forward pass through the cross-encoder for every document in the corpus.

A knowledge base with a million documents would require a million forward passes per query. A knowledge base with a billion documents — entirely common for enterprise or web-scale applications — would require a billion forward passes. Even on modern GPU hardware, this is computationally infeasible for interactive search where responses are expected in under a second. A bi-encoder reduces the online computation to one forward pass plus a fast index lookup regardless of corpus size; a cross-encoder scales that computation linearly with corpus size. These two curves diverge catastrophically as the corpus grows.

This limitation does not make cross-encoders useless, however. It makes them most valuable as a *reranking* stage rather than as a primary retrieval mechanism. The practical pattern explored later in this course is a two-stage pipeline: a fast bi-encoder retrieves the top-K candidate documents (where K might be 20 to 100), and a cross-encoder then reranks those K candidates with high-quality contextual scoring. Because K is small and fixed regardless of corpus size, the cross-encoder's per-pair computation cost stays bounded. The result is a system that inherits the scalability of the bi-encoder for the bulk of the work and the ranking quality of the cross-encoder for the final selection that actually reaches the user.

---

## ColBERT: Contextualized Late Interaction

**ColBERT** — which stands for *Contextualized Late Interaction over BERT* — is an architecture designed to capture most of the cross-encoder's quality advantage while preserving most of the bi-encoder's scalability. It achieves this by changing how documents and queries are represented, not by abandoning the principle of offline document processing.

In a bi-encoder, a document with 1000 tokens is compressed into a single dense vector. ColBERT instead produces one dense vector per token, so that same 1000-token document is represented by 1000 vectors. Each token vector is computed by a transformer that has full access to all other tokens in the same document through self-attention — meaning each vector is *contextualised* by its surrounding text rather than being a static lookup in an embedding table. These per-token vectors are computed at index time, before any query arrives, exactly like bi-encoder document embeddings.

When a query arrives, it is processed in the same way: each token in the query is embedded into its own dense vector using the same ColBERT model. A 10-token query therefore becomes 10 vectors. The critical architectural insight is that the interaction between query and document is deferred to this *late interaction* step, where the per-token query vectors are compared against the per-token document vectors. This deferral — computing representations independently but interacting them at scoring time — gives the architecture its name: contextualised *late* interaction.

The late interaction approach means that document representations are still pre-computable, satisfying the key constraint that makes the system scale. Yet because the scoring step operates on individual token vectors rather than single aggregate vectors, it can capture fine-grained alignments between query tokens and document tokens that a single-vector bi-encoder would miss entirely.

---

## MaxSim Scoring in Detail

The scoring function ColBERT uses is called **MaxSim** (maximum similarity), and understanding it precisely explains why the architecture achieves its quality level. Given a query with tokens q₁, q₂, …, q_n and a document with tokens d₁, d₂, …, d_m, the algorithm constructs an n-by-m grid of similarity scores. Each cell (i, j) in the grid contains the cosine similarity between the vector for query token qᵢ and the vector for document token dⱼ.

For each query token qᵢ, the algorithm scans across its entire row of the grid and finds the maximum similarity value — that is, the document token most similar to that query token. This maximum is the query token's *best match* in the document. The final relevancy score for the document is the sum of these per-query-token maxima across all query tokens.

The intuition is that every word in the query deserves to find its best possible match in the document. The query token "eat" should be able to find "cuisine" or "dining" in the document, even if those words are far apart from each other or embedded in different sentence contexts. The MaxSim operation enables this by looking at all cross-token similarities without requiring the model to route every signal through a single compressed vector. For the example query "great places to eat in New York," the tokens "New" and "York" can independently find their best-matching tokens in a document about New York City, while "eat" independently finds the highest-similarity food-related token — and the total relevancy score reflects all of these individual alignments simultaneously.

This mechanism gives ColBERT a richer signal than a bi-encoder cosine similarity computed over whole-document vectors, while remaining computationally tractable because the per-token document vectors are precomputed and the MaxSim operation over a bounded candidate set can be parallelised efficiently on modern hardware.

---

## Architecture Trade-offs: A Comparative View

Understanding when to use each architecture requires holding the full trade-off profile of all three clearly in mind. The standard bi-encoder as introduced in [[019-semantic-search-introduction]] offers the best combination of speed and storage efficiency. A single dense vector per document means both retrieval latency and index size grow modestly with corpus size, and ANN indexes like those discussed in [[029-approximate-nearest-neighbors-algorithms-ann.md]] keep query time sub-linear in corpus size. Quality is good for most general-purpose applications but is bounded by the information loss inherent in single-vector compression.

Cross-encoders offer the highest ranking quality of any of the three architectures, demonstrating what is possible when the model has full contextual access to both query and document simultaneously. The price is complete inability to pre-compute document representations, making the computational cost at query time linear in corpus size. Cross-encoders are therefore never deployed as primary retrieval mechanisms in production systems; they are deployed as reranking stages operating over small candidate sets.

ColBERT occupies the middle ground deliberately. It pre-computes document representations offline (matching the bi-encoder in that respect), but produces per-token vectors rather than a single aggregate vector (approaching the cross-encoder in representation richness). The MaxSim scoring step introduces more computation per document than a simple cosine similarity, but it remains far cheaper per document than a full cross-encoder forward pass, and can be batched and accelerated. The trade-off ColBERT accepts is storage: a 2000-token document requires 2000 vectors instead of one, expanding the vector index by approximately three orders of magnitude compared to a bi-encoder over the same corpus.

This storage overhead is the reason ColBERT has not displaced bi-encoders as the default. In domains where search precision carries high stakes — legal discovery, clinical decision support, technical patent search — the accuracy gains justify the infrastructure investment, and an increasing number of vector databases are adding native ColBERT support to serve these use cases. For general-purpose applications where approximate retrieval quality is sufficient and storage costs matter, the bi-encoder remains the sensible default. The practical lesson is not that one architecture is universally superior, but that each is suited to a different position in the system depending on where in the retrieval pipeline it is applied and what constraints the deployment environment imposes.

---

## Post-test

1. Describe exactly what a cross-encoder does differently from a bi-encoder when computing a relevancy score, and explain why this difference produces higher quality rankings.

2. Walk through the ColBERT MaxSim scoring procedure for a query of 5 tokens and a document of 50 tokens. How many individual similarity computations are performed, and how is the final document score derived from them?

3. A team building a medical literature search system is evaluating whether to use a bi-encoder, cross-encoder, or ColBERT as their primary retrieval architecture. What recommendation would you give, and what is the key cost they would need to accept?

<details><summary>Answer guide</summary>

**Post-test 1:** A bi-encoder embeds the query and document independently into separate vectors, then scores them by computing cosine similarity between those two vectors. A cross-encoder concatenates the query and document into a single input sequence and passes that combined sequence through a transformer, allowing every attention layer to compute cross-attention between query tokens and document tokens. Because the model sees both texts simultaneously, it can learn fine-grained token-level alignments — e.g. "eat" aligning to "cuisine" — that a bi-encoder collapses into aggregate vector geometry. This richer contextual interaction produces higher ranking quality at the cost of not being able to pre-compute document representations.

**Post-test 2:** ColBERT embeds each of the 5 query tokens into a dense vector and each of the 50 document tokens into a dense vector (all precomputed at index time for the document). At scoring time, the algorithm computes the similarity between every pair: 5 × 50 = 250 similarity scores arranged in a 5-by-50 grid. For each of the 5 query tokens, the algorithm finds the maximum similarity across its 50 document-token scores (5 max operations). The 5 per-query-token maxima are then summed to produce the final relevancy score for the document.

**Post-test 3:** The recommendation is ColBERT as the primary retrieval architecture, supplemented by a cross-encoder reranker on the top candidates. Medical literature search requires high precision and deep contextual understanding — ColBERT's per-token representations and MaxSim scoring capture nuanced domain-specific term alignments that a bi-encoder misses. The key cost the team must accept is a substantially larger vector index: with per-token storage, the index grows by roughly the average token length of documents compared to a bi-encoder, typically two to three orders of magnitude more vectors. This requires significantly more memory and may necessitate specialised vector database infrastructure with native ColBERT support.

</details>
