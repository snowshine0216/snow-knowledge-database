---
tags: [rag, retrieval, semantic-search, embeddings, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/aam1t/semantic-search---introduction
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. A keyword search cannot match "happy" to "glad" even though they are synonyms. What fundamental property of semantic search allows it to solve this problem?
2. Why is cosine similarity preferred over Euclidean distance when comparing high-dimensional embedding vectors?
3. What does an embedding model actually output, and how is that output used to rank documents against a query?

---

# Lecture 019: Semantic Search - Introduction

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/aam1t/semantic-search---introduction) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [Why Keyword Search Falls Short](#why-keyword-search-falls-short)
- [Embedding Models: Mapping Meaning to Space](#embedding-models-mapping-meaning-to-space)
- [Dimensionality and the Geometry of Meaning](#dimensionality-and-the-geometry-of-meaning)
- [Measuring Similarity: Distance Metrics](#measuring-similarity-distance-metrics)
- [The Semantic Search Pipeline](#the-semantic-search-pipeline)

---

## Why Keyword Search Falls Short

As introduced in [[003-introduction-to-rag]], the retriever is the component whose quality sets the ceiling on a RAG system's answer quality. The simplest retrieval strategy — keyword search — maps every document to a vector by counting how often each word appears in the text. This sparse representation works well for exact-match lookups but breaks down in two common and complementary ways.

The first failure mode is **missed synonyms**. A user who asks about "happy outcomes" will not retrieve documents that discuss "glad results" or "joyful conclusions," even though the meaning is identical. The keyword vectors for these phrases share no non-zero components, so no overlap is measured. The second failure mode is **incorrect homograph matching**: a search for "Python" intended to find programming tutorials will also pull documents about the snake, because both share the same token. The keyword vector cannot distinguish between these senses. Together, these failures mean that keyword search is unreliable when natural language allows the same concept to be expressed in multiple ways — which is nearly always.

Semantic search solves both problems by replacing word-count vectors with vectors derived from an **embedding model**, a learned mathematical function that maps pieces of text to locations in a continuous vector space. The critical property of this space is that semantically similar texts land close together, while dissimilar texts land far apart. Once this spatial representation exists, retrieval becomes a nearest-neighbor search in vector space rather than an exact-token matching operation.

---

## Embedding Models: Mapping Meaning to Space

An embedding model takes a piece of text as input and outputs a single fixed-length numerical vector — a list of numbers that encodes the meaning of that text as coordinates in a high-dimensional space. The model might, for example, embed the word "pizza" at coordinates (3, 1) and the word "bear" at coordinates (5, 2) if one were working in two dimensions.

The almost magical property of well-trained embedding models is **semantic clustering**: words and phrases with similar meanings end up mapped to nearby regions of this space. "Food" and "cuisine" would cluster together; "trombone" and "cat" would be far apart. This is not programmed by hand — it emerges from training the model on enormous amounts of text, learning which concepts tend to appear in similar contexts. The coordinate axes in this space do not correspond to simple human-interpretable categories like "food" or "animal." Instead, the geometry encodes a complex web of relational meaning that would be impossible to describe with a small set of named dimensions.

Embedding models exist for different scales of text input. Some models are designed to embed individual words, others are optimized for sentences, and others handle entire documents. Regardless of input length, each model outputs a single vector. The same clustering principle applies at every scale: two sentences with similar meaning will be embedded closer together than two sentences with different meanings. For example, "He spoke softly in class" and "He whispered quietly during class" would end up near each other in the embedding space, while "Her daughter brightened the gloomy day" would be embedded far from both, reflecting the genuine difference in subject matter.

---

## Dimensionality and the Geometry of Meaning

A two-dimensional embedding space is easy to visualize — each vector is simply a point on the x-y plane — but it is far too constrained to capture the richness of natural language. Language has enormously many independent dimensions of meaning: grammatical role, topic, sentiment, formality, domain, temporal reference, and hundreds of others. Attempting to separate all semantically distinct concepts in only two dimensions would force unrelated clusters to overlap.

Adding a third dimension provides more room for distinct clusters to form without crowding, and capturing subtler relationships becomes possible. Real embedding models go much further: their output vectors typically have hundreds or even thousands of components. A common benchmark embedding model might produce 768-dimensional vectors; some produce 1536 or more. This high dimensionality gives the model an enormous amount of geometric freedom to place each concept in a unique, well-separated region of space while preserving all the relational structure present in the training data.

It is impossible to visualize or intuitively grasp a 768-dimensional space, but all the same geometric principles that hold in two or three dimensions hold in any number of dimensions. Vectors still have coordinates, distances still measure separation, and two vectors can still point in the same or opposite directions. The mathematical machinery scales cleanly to thousands of dimensions, even if human intuition does not.

---

## Measuring Similarity: Distance Metrics

Once every document and query has been embedded into a vector, ranking documents by relevance reduces to measuring how close each document vector is to the query vector. Several distance metrics exist, and understanding them helps in both interpreting results and choosing the right one for a given system.

**Euclidean distance** is the most familiar: it measures the straight-line distance between two points in space, which is mathematically the multi-dimensional extension of the Pythagorean theorem. It works correctly in lower-dimensional spaces, but in very high-dimensional spaces a problem known as the curse of dimensionality causes all pairwise distances to converge toward a similar value, making it hard to distinguish near from far neighbors.

**Cosine similarity** is the most commonly used metric for high-dimensional embeddings. Rather than measuring how far apart two vectors are in absolute terms, cosine similarity measures the angle between them — equivalently, whether they point in the same direction through the origin. The vectors (1, 1) and (100, 100), for instance, are far apart in Euclidean terms but have a cosine similarity of 1.0 because they point in exactly the same direction. Cosine similarity ranges from −1 (vectors pointing in exactly opposite directions) to +1 (vectors pointing in exactly the same direction), with 0 indicating orthogonality. For semantic retrieval, higher cosine similarity means more similar meaning.

**Dot product** is a related measure. It calculates the length of the projection of one vector onto another, producing larger values when two vectors are both long and point in similar directions. If two vectors point in exactly the same direction, the dot product is large and positive; if they are orthogonal, it is zero; if they point in opposite directions, it is negative. The dot product differs from cosine similarity in that it is sensitive to vector magnitude — a long vector in the same direction scores higher than a short vector in the same direction. In practice, many embedding models normalize their output vectors to unit length, in which case the dot product and cosine similarity produce identical rankings.

Practitioners rarely need to implement these formulas directly. The important takeaway is the directionality: for both cosine similarity and dot product, **higher values indicate more similar meaning**, so the retrieval problem becomes: find the documents with the highest similarity score to the query.

---

## The Semantic Search Pipeline

With embedding models and distance metrics in hand, the semantic search pipeline can be stated concisely. It unfolds in two stages: an offline indexing stage and an online retrieval stage.

During indexing, every document in the knowledge base is passed through the embedding model to produce its vector representation. Because similar documents cluster together in the resulting space, the geometry of the indexed vectors already encodes the relationships among the knowledge base contents. This step is performed once when the knowledge base is built and repeated only when documents are added or updated.

During retrieval, the user's query is passed through the same embedding model to produce a query vector. The system then measures the similarity between the query vector and every indexed document vector. Documents are ranked by their similarity score — highest similarity first — and the top-ranked documents are returned as the retrieval result. Because the embedding model guarantees that semantic similarity corresponds to spatial proximity, the retrieved documents are the ones whose meaning most closely matches the query, regardless of whether they share any specific words with it.

This pipeline is why semantic search can match "happy" to "glad" and distinguish "Python the language" from "Python the snake": the embedding model has learned, from vast amounts of text, that certain words carry similar meanings in similar contexts. That learned structure is what gets preserved as geometric proximity in the vector space. All the apparent complexity of natural language — synonymy, polysemy, context-dependence — gets absorbed by the embedding model during training, leaving retrieval as a clean nearest-neighbor computation.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Without using the words "vector" or "embedding," explain why semantic search can match a query about "joyful outcomes" to a document about "happy results" when keyword search cannot.
2. Why do practitioners prefer cosine similarity over Euclidean distance for comparing embedding vectors, and what is the numerical range of cosine similarity scores?
3. Walk through the two stages of a semantic search pipeline — what happens at indexing time and what happens at query time?

> [!example]- Answer Guide
> #### Q1 — Semantic Search Matches Synonyms
> 
> Semantic search uses a learned model that maps text to positions in a mathematical space. That model was trained on enormous amounts of text and learned that "joyful" and "happy" appear in similar contexts — so it places them close to each other in that space. When the query is processed by the same model, it lands near documents about happiness, regardless of exact word overlap. Keyword search can only count shared tokens, so synonyms always score zero similarity against each other.
> 
> #### Q2 — Cosine vs Euclidean Distance
> 
> In high-dimensional spaces, Euclidean distances between points tend to converge, making it hard to distinguish near neighbors from far ones. Cosine similarity avoids this by measuring the angle between vectors — whether they point in the same direction — rather than their absolute separation. This directional measure remains discriminative even in thousands of dimensions. Cosine similarity ranges from −1 (opposite directions, maximally dissimilar) to +1 (same direction, maximally similar), with 0 indicating no directional relationship.
> 
> #### Q3 — Indexing and Query Pipeline Stages
> 
> At indexing time, every document in the knowledge base is run through an embedding model to produce its numerical vector, and those vectors are stored. This happens once when the knowledge base is built. At query time, the user's query is run through the same model to produce a query vector, and the system computes similarity scores between the query vector and every document vector. Documents are then ranked highest-similarity-first, and the top results are returned as the relevant context for the RAG system.
