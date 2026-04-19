---
tags: [rag, retrieval-augmented-generation, information-retrieval, vector-database, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/11yp6/introduction-to-information-retrieval
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What two competing pressures must a retriever balance when deciding how many documents to return, and why does failing on either side hurt the final answer?
2. How does a retriever assign a numerical score to each document in the knowledge base — what is being measured?
3. Why are vector databases used instead of conventional relational databases in most production RAG systems?

---

# Lecture 009: Introduction to Information Retrieval

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/11yp6/introduction-to-information-retrieval) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [The Library Analogy](#the-library-analogy)
- [How the Retrieval Pipeline Works](#how-the-retrieval-pipeline-works)
- [The Precision and Recall Tradeoff](#the-precision-and-recall-tradeoff)
- [Information Retrieval as a Mature Field](#information-retrieval-as-a-mature-field)
- [Vector Databases in Production RAG](#vector-databases-in-production-rag)

---

## The Library Analogy

To understand what a retriever actually does, it helps to begin with a familiar institution: the library. A library is a collection of books organized so that a patron with a question can find the right material quickly. The shelves impose an index — grouping by topic, author, or genre — so that searching the whole collection does not require reading every page. A skilled librarian does more than point at a shelf; they interpret the patron's question, infer the underlying need, and retrieve specific sections from specific books that address that need.

The RAG retriever is the librarian made computational. The knowledge base plays the role of the book collection. The index is a data structure built at ingest time that makes the collection searchable without exhaustive scan. When a user prompt arrives, the retriever does not pattern-match on surface words — it processes the prompt to understand its underlying semantic meaning, then searches the index for documents whose meaning most closely aligns. Documents are scored numerically for similarity, ranked, and the top scorers are returned to be inserted into the augmented prompt that the LLM receives.

The analogy extends to the quality dimension: a librarian who returns a stack of forty loosely related books does the patron no favors. Equally, a librarian who returns only one book and omits three more relevant ones has failed in a different direction. Good retrieval is about returning the right material — enough of it, but not more.

---

## How the Retrieval Pipeline Works

The retrieval pipeline has four distinct stages, each of which can be tuned independently. Understanding them separately is important because failures tend to be stage-specific, and diagnosing a poorly performing RAG system requires knowing which stage broke down.

The first stage is **indexing**. Before any query arrives, the knowledge base documents are processed and organized into a searchable index. This is an offline or ingest-time operation. The form the index takes depends on the retrieval method: traditional keyword search builds an inverted index; semantic search builds a vector index where each document is represented as a high-dimensional embedding. Either way, the purpose is the same — make lookup fast and accurate without reading every document at query time.

The second stage is **prompt processing**. When the user's query arrives, the retriever does not pass the raw text string directly to the index. It first transforms the query into the same representation used by the index — typically a vector embedding — so that similarity can be computed in a consistent space. This step is where the retriever captures intent rather than just keywords.

The third stage is **scoring**. Every document in the index receives a numerical similarity score relative to the processed query. In vector-based systems this is typically cosine similarity or dot product between the query vector and each document's embedding vector. The score captures how semantically close a document is to what the user asked, not merely whether the same words appear.

The fourth stage is **ranking and returning**. Documents are sorted by their scores, and the top-k are selected to be passed forward. The value of k is a configurable parameter that directly governs the precision-recall tradeoff explored in the next section.

---

## The Precision and Recall Tradeoff

The central tension in retrieval design is between **precision** — returning only genuinely relevant documents — and **recall** — returning all the relevant documents that exist in the knowledge base. These two goals pull in opposite directions, and neither extreme is acceptable in practice.

If the retriever returns every document in the knowledge base, recall is perfect: every relevant document is guaranteed to be in the returned set. But precision collapses. The LLM receives a context window stuffed with irrelevant material alongside the relevant content. This is expensive in terms of tokens and inference cost, and it degrades generation quality because the model must reason through noise to find the signal. In severe cases the LLM hallucinates or ignores the relevant content entirely because it is buried.

If the retriever returns only the single highest-scoring document, precision is maximized in a narrow sense, but the relevant information may have been ranked second, third, or fourth. The LLM then generates an answer without the supporting context it needs and either hallucinates or produces an incomplete response.

The reality of retrieval systems is that the scoring and ranking are imperfect. A semantically similar but ultimately unhelpful document can outscore a highly relevant one in edge cases. Exact numbers depend on the embedding model, the chunking strategy, and the query distribution of the application. This means that the right value of k is not a universal constant — it is an empirical question that must be answered by monitoring retrieval performance over time and experimenting with retrieval settings on representative queries. A system that performs well at k=3 for a tightly scoped technical Q&A corpus may need k=8 for a broad customer support knowledge base.

---

## Information Retrieval as a Mature Field

It is easy to think of retrieval as a novel capability invented for RAG, but information retrieval is a field with decades of research predating large language models by a generation. Web search engines are the most visible instance: given a user query, they retrieve web pages ranked by relevance. SQL databases perform a structured form of retrieval: given a query predicate, they return rows that satisfy it. Recommendation systems retrieve items from a catalog that match inferred user preferences.

RAG borrows extensively from this existing foundation. The concept of an inverted index for keyword retrieval comes from classical IR research. The idea of representing documents as dense vectors and measuring similarity via inner product goes back to the vector space model from the 1970s, substantially extended by modern neural embeddings. BM25, a probabilistic ranking function still used in production systems today, was developed in the 1990s. Understanding RAG retrieval through this lens clarifies that many of its challenges — handling ambiguous queries, managing vocabulary mismatch between query and document, tuning the recall-precision balance — are well-studied problems with a rich literature of solutions.

This means that practitioners building RAG systems have access to a toolkit of proven techniques. Hybrid retrieval, which combines keyword and semantic search, exists precisely because neither alone is universally superior. Reranking with a cross-encoder model as a second-stage filter addresses the precision problem after a high-recall first retrieval pass. These patterns come from IR research, adapted for the LLM era.

---

## Vector Databases in Production RAG

Most production RAG retrievers are built on **vector databases** — specialized database systems optimized for storing high-dimensional embedding vectors and executing approximate nearest-neighbor search at scale. The approximate qualifier is important: exact nearest-neighbor search over millions of vectors is computationally prohibitive, so vector databases use indexing structures such as HNSW (Hierarchical Navigable Small World graphs) or IVF (Inverted File Index) that trade a small amount of recall for dramatic speedups.

Vector databases are not strictly required for RAG. A small knowledge base of a few thousand documents can be retrieved accurately using a simple in-memory vector store, and several open-source libraries support this. But at production scale — millions of documents, high query throughput, low latency requirements — a dedicated vector database becomes necessary.

An important practical point: many organizations already maintain their primary data in relational databases. The vector database does not replace those; it is an additional retrieval layer. Documents live in the primary store; their embeddings live in the vector database. At query time the vector database returns document identifiers or chunks, which may then be hydrated from the primary store. This architecture keeps the source of truth in the existing system while enabling semantic search over it.

The choice of vector database — Pinecone, Weaviate, Chroma, pgvector, Qdrant, and others — is an infrastructure decision that affects latency, cost, and operational complexity, but it does not fundamentally change the retrieval logic. Understanding the four-stage pipeline and the precision-recall tradeoff applies regardless of which vector database sits underneath.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. A retriever must balance two competing pressures when choosing how many documents to return. Name both, explain what goes wrong if you push too far in each direction, and describe how a practitioner resolves the tension in practice.
2. Walk through the four stages of the retrieval pipeline in order, explaining what each stage does and why it exists as a separate step.
3. Why do most production RAG systems use vector databases rather than relational databases for retrieval, and how do vector databases fit alongside existing relational infrastructure?

<details>
<summary>Answer Guide</summary>

1. The two pressures are precision (returning only relevant documents) and recall (returning all relevant documents). Returning too many documents destroys precision: the LLM context fills with noise, increasing cost and degrading generation quality. Returning too few documents destroys recall: the relevant content may be ranked just outside the cutoff and the LLM answers without it. Practitioners resolve this by treating k (the number of returned documents) as an empirical hyperparameter — monitoring retrieval quality on representative queries and tuning k based on measured performance rather than setting it once and leaving it.

2. The four stages are: (1) Indexing — documents are preprocessed at ingest time into a searchable data structure (inverted index or vector index) so queries do not require scanning every document; (2) Prompt processing — the incoming query is transformed into the same representation as the index (typically a vector embedding) so similarity can be computed consistently; (3) Scoring — every indexed document receives a numerical similarity score against the processed query, capturing semantic closeness rather than keyword overlap; (4) Ranking and returning — documents are sorted by score and the top-k are selected to be inserted into the augmented prompt.

3. Vector databases are specialized for high-dimensional embedding storage and approximate nearest-neighbor search, which is exactly the operation needed to find semantically similar documents at production scale. Relational databases are designed for structured predicate queries and cannot efficiently execute nearest-neighbor search over millions of vectors. In practice the two coexist: primary data stays in the relational store while embeddings live in the vector database. At query time the vector database returns chunk identifiers that are then fetched from the primary store.

</details>
