---
tags: [rag, retrieval, hybrid-search, bm25, semantic-search, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/77dro/hybrid-search
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. A keyword search and a semantic search over the same document collection return two different ranked lists. How do you collapse these into a single, coherent ranking?
2. What is Reciprocal Rank Fusion, and why does it use the *rank* of a document rather than the *score* that produced that rank?
3. In a hybrid retriever, what does the beta parameter control, and what split between keyword and semantic weight is typically recommended as a starting point?

---

# Lecture 022: Hybrid Search

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/77dro/hybrid-search) · DeepLearning.AI

## Outline

- [Three Search Techniques and Their Trade-offs](#three-search-techniques-and-their-trade-offs)
- [The Hybrid Search Pipeline](#the-hybrid-search-pipeline)
- [Reciprocal Rank Fusion](#reciprocal-rank-fusion)
- [The Beta Parameter: Weighting Keyword vs. Semantic Search](#the-beta-parameter-weighting-keyword-vs-semantic-search)
- [When to Use Hybrid Search](#when-to-use-hybrid-search)

---

## Three Search Techniques and Their Trade-offs

Before understanding how hybrid search works, it helps to understand precisely what each of its constituent techniques does well and where each falls short. The three techniques — metadata filtering, keyword search, and semantic search — are not interchangeable. Each occupies a distinct niche, and hybrid search is explicitly designed to exploit those distinctions rather than pretend that one technique is universally superior.

**Metadata filtering** applies strict, binary criteria to document metadata fields. A filter either passes a document or rejects it — there is no partial credit, no notion of "somewhat relevant." This rigidity is also its superpower: neither keyword search nor semantic search can enforce a hard constraint the way a filter can. If the system needs to guarantee that only documents from a particular date range, department, or product line are ever returned, a metadata filter is the only mechanism that can deliver that guarantee. On its own, however, filtering is a poor retrieval strategy because it makes no judgment about relevance within the passing set.

**Keyword search** scores and ranks documents by how many of the query's words appear in the document, typically using the BM25 algorithm which was explored in earlier lessons. The key strength of keyword search is that it is fast, easy to understand, and remarkably reliable whenever queries contain specific technical terms, product names, model numbers, or other exact identifiers. If a user queries for "GPT-4o tokenizer," a keyword search will reliably surface documents that contain those exact words. Its fundamental weakness is the vocabulary mismatch problem: it cannot retrieve documents that discuss the same concept using different words. A document about "token encoding for OpenAI's multimodal model" will score zero against that query despite being conceptually identical.

**Semantic search** embeds both the query and every document as dense vectors in a high-dimensional space, then retrieves the documents whose vectors sit closest to the query vector. The embedding model's training ensures that semantically similar text maps to nearby vectors, so semantic search can bridge vocabulary mismatches that defeat keyword search entirely. Its trade-offs are that it is slower, more computationally expensive, and can be fooled by surface-level similarity that doesn't reflect actual relevance. It also tends to under-perform keyword search on highly technical queries where exact term matching is the right signal.

No single technique is dominant across all query types. The insight motivating hybrid search is that you do not have to choose.

---

## The Hybrid Search Pipeline

A hybrid retriever runs keyword search and semantic search in parallel, then combines their outputs through a metadata filter before producing a final unified ranking.

The process begins when a query arrives at the retriever. Both keyword search and semantic search execute against the full document collection simultaneously, each returning a ranked list of results. Concretely, imagine each search returning its top 50 documents. These two lists will partially overlap — some documents appear in both — but their orderings will differ, sometimes dramatically. A document that ranks first by keyword match might rank fifteenth by semantic similarity, and vice versa.

Next, both ranked lists pass through the metadata filter. Documents that fail the filter's criteria — wrong time period, wrong category, wrong department — are removed from both lists. After filtering, the keyword list might contain 35 documents and the semantic list 30, with some documents having been removed from one or both lists.

The two filtered lists are now merged into a single ranking using a rank fusion algorithm. This merged ranking is the retriever's working output. Finally, the top K documents from this unified ranking are returned to the caller, where K is the number of documents the downstream pipeline requested.

The metadata filter is applied after search rather than before it in many implementations because some filter criteria may not be stored in the vector index. Applying it after retrieval ensures that both search modalities have access to the same universe of candidates before the filter narrows the field.

---

## Reciprocal Rank Fusion

Reciprocal Rank Fusion (RRF) is the algorithm most commonly used to merge two or more ranked lists into a single ranking. Its core principle is simple: each document earns points from every list it appears in, and the points it earns from a given list depend on its rank in that list. Higher ranks earn more points; the document with the highest total score across all lists wins.

The scoring formula for a document $d$ across a set of ranked lists $R$ is:

$$\text{RRF}(d) = \sum_{r \in R} \frac{1}{k + \text{rank}_r(d)}$$

where $\text{rank}_r(d)$ is the document's position in list $r$ (first place = 1, second place = 2, etc.) and $k$ is a smoothing hyperparameter. If a document does not appear in a given list, it contributes zero from that list.

To understand the intuition, first consider $k = 0$. In that case, a first-place document earns exactly 1 point, a second-place document earns 0.5 points, a third-place document earns 0.333 points, and a tenth-place document earns 0.1 points. The ratio between first and tenth place is 10-to-1 — a very steep drop-off. A single document that tops any one list will dominate the merged ranking even if it is mediocre on all other lists.

Raising $k$ to a value like 60 (a common default) compresses this range. Now first place earns $\frac{1}{61} \approx 0.0164$ points and tenth place earns $\frac{1}{70} \approx 0.0143$ points — a difference of barely 15 percent. This means that consistently appearing near the top of multiple lists matters more than topping any single list in isolation. A document that ranks second in keyword search and fifth in semantic search will comfortably outrank a document that tops keyword search but doesn't appear in the semantic list at all.

A critical property of RRF is that it uses only ranks, not raw scores. The score that caused a document to rank first is discarded; only the ordinal position matters. This design choice makes RRF robust to the fact that BM25 scores and cosine similarity scores are on entirely different scales and cannot be meaningfully added together directly. By converting both to ranks first, RRF sidesteps the score normalization problem entirely.

---

## The Beta Parameter: Weighting Keyword vs. Semantic Search

RRF treats all lists equally by default, but hybrid retrievers typically allow you to assign different weights to the keyword and semantic rankings via a parameter called **beta**. Beta controls what fraction of importance is assigned to the semantic search ranking, with the remainder going to keyword search.

At $\beta = 0.8$, the retriever weights semantic similarity at 80 percent and keyword match at 20 percent. At $\beta = 0.3$, it weights keyword matching at 70 percent and semantic similarity at 30 percent. The two weights must sum to one.

The practical effect of beta is straightforward: it shifts which list exerts more influence on the final merged ranking. A document that ranks highly in the semantically weighted list scores better when beta is high; a document that ranks highly in the keyword list scores better when beta is low.

The recommended starting point is **beta = 0.7** — 70 percent semantic, 30 percent keyword. This default reflects the practical reality that semantic search handles a broader class of queries well, but keyword search provides irreplaceable precision on technical terms and proper nouns. From this starting point, you tune in the direction that fits your data and use case.

For systems where users frequently query with exact product names, error codes, or technical identifiers — and where a missed exact-term match is a serious failure — you should move beta toward keyword search. For systems where queries are conversational, conceptual, or likely to use different vocabulary than the documents use, you should move beta toward semantic search.

---

## When to Use Hybrid Search

Hybrid search is not always the right choice — it adds complexity and computational cost compared to running a single search modality. But the case for it is strong whenever your retrieval workload is heterogeneous, meaning that no single search technique will consistently perform well across all the queries your users submit.

The combination provides three properties simultaneously that no single technique can provide alone. Keyword search contributes **exact-term precision**: queries containing unusual or highly specific terms are unlikely to be poorly served. Semantic search contributes **conceptual recall**: queries phrased differently from the documents in the knowledge base can still surface relevant results. Metadata filtering contributes **hard constraints**: results can be guaranteed to meet strict criteria that search scores are unable to enforce.

The system's behavior is also tunable at multiple levels. The BM25 algorithm's own parameters affect how keyword scoring behaves on your specific document collection. The choice of embedding model affects semantic search quality. The metadata fields available for filtering determine what hard constraints are enforceable. And the beta parameter determines the relative influence of keyword versus semantic results. Each of these is an independent lever, and the best configuration depends on the nature of your knowledge base and the distribution of your users' queries.

The final ranking produced by hybrid search is what the retriever returns to the rest of the RAG pipeline. The quality of this ranking determines the quality of the context the LLM receives, which in turn determines the quality of the final answer. As covered in [[009-introduction-to-retrieval]] and [[041-keyword-search]], retrieval is the bottleneck in most RAG systems — hybrid search is one of the most practical ways to raise the ceiling on retriever performance.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Describe the full sequence of steps a hybrid retriever performs from the moment a query arrives to the moment it returns its results.
2. Explain Reciprocal Rank Fusion: what does it compute, why does it use ranks instead of raw scores, and what effect does increasing the hyperparameter k have on the merged ranking?
3. If you are building a RAG system for a technical support knowledge base where users frequently query by exact error codes and product model numbers, which direction should you tune beta and why?

<details>
<summary>Answer Guide</summary>

1. When a query arrives, the retriever runs both keyword search (BM25) and semantic search (dense vector similarity) in parallel, each producing a ranked list of candidate documents. Both lists are then passed through the metadata filter, which removes documents that fail the hard criteria. The two filtered ranked lists are merged into a single ranking using Reciprocal Rank Fusion. Finally, the top K documents from this unified ranking are returned as the retriever's output.

2. RRF assigns each document a score equal to the sum of $\frac{1}{k + \text{rank}}$ across every list the document appears in. Higher ranks (smaller position numbers) yield larger contributions, so documents that rank well across multiple lists accumulate the most points. RRF uses ranks rather than raw scores because BM25 scores and cosine similarity scores live on incompatible scales — adding them directly would be meaningless. By converting both to ordinal positions first, RRF avoids the score normalization problem entirely. Increasing k compresses the scoring range: the difference in points between first place and tenth place shrinks, so consistent placement across lists matters more and topping any single list matters less.

3. You should tune beta toward keyword search (lower beta, higher keyword weight) because the queries contain exact identifiers — error codes and model numbers — where exact term matching is the decisive signal. Semantic search may actually hurt in this scenario by surfacing documents that are conceptually similar but refer to different product lines or error types. Moving beta to something like 0.3 (30% semantic, 70% keyword) preserves some conceptual recall while ensuring that the exact-term signal dominates.

</details>
