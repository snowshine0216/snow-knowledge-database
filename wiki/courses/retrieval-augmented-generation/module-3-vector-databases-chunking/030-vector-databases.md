---
tags: [rag, vector-databases, weaviate, embeddings, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/zzkt7/vector-databases
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. Why do standard relational databases perform poorly at semantic search, and what property of vector databases makes them better suited for it?
2. What is the difference between sparse vectors and dense vectors in a vector database context, and which type of search does each power?
3. In a hybrid search with an alpha parameter of 0.25, which search type is weighted more heavily — keyword or vector — and why would a production system prefer hybrid over either alone?

---

# Lecture 030: Vector Databases

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/zzkt7/vector-databases) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [What a Vector Database Is and Why It Exists](#what-a-vector-database-is-and-why-it-exists)
- [Setting Up Weaviate and Creating Collections](#setting-up-weaviate-and-creating-collections)
- [Loading Data and Performing Vector Search](#loading-data-and-performing-vector-search)
- [Keyword Search with BM25 and Hybrid Search](#keyword-search-with-bm25-and-hybrid-search)
- [Applying Filters and the End-to-End Loop](#applying-filters-and-the-end-to-end-loop)

---

## What a Vector Database Is and Why It Exists

In a production RAG system, the retrieval step requires storing and querying hundreds of thousands — sometimes millions — of high-dimensional embedding vectors efficiently. A standard relational database is fundamentally ill-suited for this task. Relational databases are optimized for exact matches and range queries over structured columns. When you need to find the most semantically similar document to a query, you are asking the database to compute distances between high-dimensional vectors, which requires algorithms that relational systems were never designed to accelerate. A naive linear scan through every stored vector to find the nearest neighbors is computationally expensive at scale, with performance that degrades sharply as the corpus grows.

A **vector database** is a database purpose-built from the ground up to store high-dimensional vector data and to execute vector-oriented algorithms efficiently — most importantly, the approximate nearest neighbors (ANN) algorithms introduced in [[009-ann-hnsw-and-faiss]]. Rather than treating vectors as opaque blobs stored in a generic column, a vector database understands the geometric structure of vector space and builds specialized indexes — like the HNSW proximity graph you encountered earlier in the course — directly into its storage layer. This means that tasks like constructing and traversing the proximity graph, or computing cosine and Euclidean distances in bulk, run at hardware-optimized speeds rather than through a general-purpose query engine.

Vector databases grew to prominence in the early 2020s alongside the explosion of large language model deployment and the widespread adoption of embedding-based techniques like semantic search. As more organizations built RAG pipelines, the need for a dedicated store that could handle both the indexing and querying phases of retrieval at production scale became clear. The alternative — bolting vector search onto an existing relational or document database — invariably produces inferior performance because the underlying data structures were not designed with proximity search in mind.

The vector database used in this course is **Weaviate**, an open-source system that can be deployed locally or in the cloud. The concepts and workflows demonstrated with Weaviate transfer directly to other vector databases — Pinecone, Qdrant, Milvus, Chroma, and others — because they all expose similar abstractions: collections, indexing, and the same trio of search modes (vector, keyword, hybrid).

---

## Setting Up Weaviate and Creating Collections

Getting a vector database ready for retrieval involves several steps, some of which Weaviate handles automatically. The full sequence is: connect to or create a database instance, create a collection to hold your documents, configure the embedding model that will generate dense vectors, load your documents, and then run searches. Understanding this pipeline as a unit matters because each step produces state that the next step depends on.

The first step is establishing a **connection** to a Weaviate instance. This can be a locally running container or a managed cloud endpoint; the client API is the same either way. Once connected, the second step is creating a **collection**. A collection in Weaviate is roughly analogous to a table in a relational database — it defines the schema for the objects you will store. A collection named `Article`, for example, might define two text properties: `title` and `body`. Crucially, the collection configuration also specifies which **vectorizer** (embedding model) Weaviate should use to generate dense vectors for each object added to the collection. By declaring the vectorizer at collection creation time, you ensure that every document is embedded using the same model, so that query vectors and document vectors live in the same embedding space and their distances are meaningful.

This configuration step is doing more work than it might appear. Behind the scenes, Weaviate is also setting up an **inverted index** — the sparse data structure required for keyword search — automatically. You do not need to create this separately. By the time a collection is configured, Weaviate is ready to accept both kinds of data: the text properties that will be tokenized for keyword search, and the vectors that will power semantic search.

---

## Loading Data and Performing Vector Search

With the collection configured, you can insert documents using Weaviate's **batch API**. The batch method is preferred over single-object insertion for bulk loading because it amortizes network round-trips and provides built-in error tracking. Each call to `batch.add_object()` adds one object to the collection, but the batch wrapper counts and surfaces errors as they accumulate, making it possible to detect and correct failures mid-load or abort the loop if the error rate becomes unacceptable. This robustness is important in production pipelines where partial failures are the norm rather than the exception.

Once data is inserted, you can perform a **vector (semantic) search** by passing a natural-language text query to the collection. Weaviate automatically embeds the query using the same vectorizer configured for the collection, producing a query vector. It then runs an ANN search — using the HNSW index — to find the stored document vectors closest to the query vector in high-dimensional space. The returned objects are ranked by proximity, and you can request that Weaviate include a **distance** metadata field with each result, which tells you exactly how close each returned document was to the query. A lower distance indicates a more semantically similar match.

This is the core payoff of the entire indexing pipeline: a question phrased in natural language can retrieve documents that are conceptually related even if they share no exact words with the query. A user asking "What were the effects of the 2008 financial crisis on employment?" might retrieve an article discussing "job losses following the subprime mortgage collapse" — documents that match on meaning rather than surface vocabulary. This semantic flexibility is what distinguishes vector search from traditional information retrieval.

---

## Keyword Search with BM25 and Hybrid Search

Alongside vector search, Weaviate also supports **keyword search** via BM25 — the same retrieval algorithm discussed in [[041-keyword-search-and-tf-idf]]. When documents are added to a collection, Weaviate automatically builds an inverted index that maps every distinct term in the corpus to the documents it appears in and records term frequency information. A BM25 query uses this index to rank documents by how well they match the query's specific vocabulary, rewarding documents where the query terms appear frequently relative to the document's total length and penalizing terms that are common across the entire corpus. BM25 is fast, transparent, and excels at queries where exact terminology matters — product codes, proper nouns, technical jargon, legal phrases — which are cases where semantic search over dense vectors may fail to distinguish close synonyms.

The two search modes are complementary. Vector search understands meaning but can be confused by specificity; keyword search enforces exact vocabulary but misses semantic similarity. This is why the majority of production RAG systems use **hybrid search** — a mode in which Weaviate runs both keyword and vector search in parallel in the background, then merges their results using a configurable weighting parameter called **alpha**.

The alpha parameter controls the balance between the two signals. With `alpha=0.25`, vector search contributes 25% of the score and keyword search contributes 75%, making the results weighted toward exact-match precision. With `alpha=0.75`, the weighting flips, emphasizing semantic similarity. The merged scores are used to re-rank all candidate documents, and the top-N results are returned. In practice, the optimal alpha depends on the nature of the queries and the corpus: general question-answering tasks tend to benefit from a higher vector weight, while technical or domain-specific queries often perform better with a higher keyword weight. Tuning alpha is one of the key levers for improving retrieval quality without modifying the underlying models.

Hybrid search represents the practical consensus in production RAG deployments. It captures the complementary strengths of both retrieval paradigms and gracefully handles the diversity of real-world queries, where some questions hinge on exact terminology and others demand semantic understanding.

---

## Applying Filters and the End-to-End Loop

On top of hybrid search, Weaviate supports **metadata filters** that constrain the search space before or after scoring. A filter specifies a property of the collection and a condition to check — for example, returning only articles from a particular publication, or only documents tagged with a specific category. Objects that fail the filter condition are excluded from the result set entirely, regardless of their relevance score. Filters are useful when the corpus contains documents from multiple contexts and you need to scope retrieval to a meaningful subset — for instance, a multi-tenant RAG system where users should only see their own organization's documents.

The end-to-end sequence for a production-ready vector database integration can be summarized as a three-phase loop. First, **configure**: create a Weaviate instance, define your collection with appropriate properties and a vectorizer, and ensure the inverted index is set up. Second, **load and index**: use the batch API to insert documents; Weaviate automatically generates dense embeddings via the configured vectorizer, builds the HNSW index for ANN search, and populates the inverted index for BM25 — all in the background as documents are ingested. Third, **query**: construct a search call that combines hybrid search (with a tuned alpha) and any applicable metadata filters; receive the top-N ranked results for injection into the RAG prompt.

This three-phase structure maps cleanly onto the broader RAG pipeline. The database layer is responsible for one thing: given a query, return the most relevant chunks from the knowledge base as quickly and accurately as possible. Everything upstream (document ingestion, chunking, embedding model selection) and downstream (prompt construction, LLM generation) can be developed and optimized independently, because each component has a clear interface. Understanding the vector database's role precisely — and its internal mechanics of ANN indexing, inverted indexes, and hybrid re-ranking — is what allows practitioners to diagnose retrieval failures and improve system performance systematically.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain why a relational database is a poor fit for semantic search, and identify the specific internal data structure that makes a vector database significantly faster for this task.
2. When loading documents into Weaviate using the batch API, what two indexes does Weaviate automatically build, and what type of search does each enable?
3. A colleague suggests setting alpha=0.9 for a hybrid search on a corpus of legal contracts where queries involve precise clause names and legal terminology. Would you agree or disagree, and why?

<details>
<summary>Answer Guide</summary>

1. A relational database is optimized for exact matches and range queries over structured columns; finding the nearest neighbors among high-dimensional vectors requires computing distances across the entire corpus, which a relational system handles via an expensive linear scan. A vector database builds an HNSW (hierarchical navigable small world) proximity graph as its index, allowing approximate nearest neighbor search to navigate to the closest vectors in sub-linear time instead of scanning every entry.
2. When documents are inserted, Weaviate automatically builds two indexes: an HNSW vector index over the dense embedding vectors (which enables semantic/vector search via ANN), and an inverted index over the document text (which maps terms to documents and enables BM25 keyword search). Both are built automatically from the same insertion call — no separate indexing step is needed.
3. Disagree. An alpha of 0.9 weights vector search at 90% and keyword search at only 10%. For legal contracts where queries rely on precise clause names and specific legal terminology, exact vocabulary matching via BM25 is critical — semantic search may blur distinctions between similar-sounding but legally distinct phrases. A lower alpha (more weight to keyword) would be more appropriate here, preserving the precision of BM25 while still benefiting slightly from vector search's semantic flexibility.

</details>
