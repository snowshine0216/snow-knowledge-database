---
tags: [rag, vector-search, ann, hnsw, approximate-nearest-neighbors, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/dd7nl/approximate-nearest-neighbors-algorithms-ann
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. If a knowledge base grows from one million documents to one billion documents, how does the search time change for a naive k-nearest-neighbors algorithm — and why?
2. What is a proximity graph, and how does it enable faster vector search compared to comparing every vector exhaustively?
3. Why does HNSW search start at the top (sparsest) layer of the hierarchy rather than the bottom (densest) layer?

---

# Lecture 029: Approximate Nearest Neighbors Algorithms (ANN)

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/dd7nl/approximate-nearest-neighbors-algorithms-ann) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [The Scaling Problem with k-Nearest Neighbors](#the-scaling-problem-with-k-nearest-neighbors)
- [Approximate Nearest Neighbors: The Core Trade-off](#approximate-nearest-neighbors-the-core-trade-off)
- [Navigable Small World: Building and Traversing a Proximity Graph](#navigable-small-world-building-and-traversing-a-proximity-graph)
- [HNSW: Adding Hierarchy to Speed Up the Search](#hnsw-adding-hierarchy-to-speed-up-the-search)
- [Key Properties of ANN Algorithms](#key-properties-of-ann-algorithms)

---

## The Scaling Problem with k-Nearest Neighbors

Vector search is the mechanism that powers semantic retrieval in RAG systems. As covered in [[009-vector-search-and-embeddings]], the process works by embedding every document and every incoming query into the same vector space, then finding the documents whose vectors are closest to the query vector. The simplest implementation of this idea is called **k-nearest-neighbors (KNN)** search, and it is both conceptually clean and practically unworkable at scale.

KNN operates in three steps. First, every document in the knowledge base is embedded into a dense vector. When a query arrives, it is also embedded using the same model. The algorithm then computes the distance between the query vector and every single document vector in the knowledge base, sorts the documents by ascending distance, and returns the top-k closest ones. This guarantees the exact best matches — no approximation, no missed documents. The problem is the computational cost hidden in the phrase "every single document vector."

The number of distance calculations required grows in direct proportion to the number of documents in the knowledge base. A knowledge base with one thousand documents requires one thousand distance calculations per query. A knowledge base with one billion documents — a realistic scale for web-scale retrieval — requires one billion distance calculations per query. That second search is not slightly slower; it is one million times slower. No amount of hardware acceleration eliminates this linear scaling. At production scale, with thousands of concurrent users, a KNN-based retriever would grind to a halt long before reaching the document counts that practical RAG systems require. A fundamentally different approach is necessary.

---

## Approximate Nearest Neighbors: The Core Trade-off

The family of algorithms that replaces KNN in production retrieval systems is called **Approximate Nearest Neighbors (ANN)**. The defining characteristic of ANN algorithms is a deliberate trade-off: they sacrifice the guarantee of finding the single best match in exchange for dramatically faster search. In practice, this trade-off is almost always worth making. An ANN algorithm will find documents that are extremely close to the query vector — not provably the closest, but close enough that the quality of retrieval is essentially indistinguishable from exact search for most downstream tasks.

ANN algorithms achieve their speed by constructing clever data structures over the vector space before any queries arrive. This upfront cost is paid once during indexing, and it enables each individual query to skip the exhaustive comparison that makes KNN slow. The question is: what data structure allows fast approximate nearest-neighbor lookups? The most widely deployed family of ANN data structures is based on the concept of a **proximity graph** — a structure that encodes which vectors in the knowledge base are close to which other vectors, enabling efficient traversal toward any target point.

---

## Navigable Small World: Building and Traversing a Proximity Graph

The foundational ANN algorithm in this family is called **Navigable Small World (NSW)**. Before any queries can be processed, NSW constructs a proximity graph over all the document vectors. Building this graph involves computing distances between vectors to establish which ones are near each other, then creating a graph node for every document and drawing edges between each document and a small fixed number of its nearest neighbors. The result is a web-like network where each node is connected to a handful of nearby nodes, and where the overall structure allows any two nodes to be reached from any other through a short sequence of hops — the "small world" property familiar from social network analysis.

Once the proximity graph is built, searching it for the nearest neighbor to a query vector works through a greedy traversal. The algorithm picks a random node in the graph as its starting point — there is no assumption that this entry point is anywhere near the query vector. From this entry node, it examines all directly connected neighbors and computes the distance from each neighbor to the query vector. Whichever neighbor is closest to the query becomes the new current candidate. The algorithm then repeats: from the new candidate, it inspects all its neighbors, identifies the one closest to the query, and moves there. This continues until the algorithm reaches a local minimum — a node where no connected neighbor is closer to the query vector than the current node itself. That node is returned as the approximate nearest neighbor.

The efficiency gain comes from the structure of the proximity graph. Instead of comparing the query against all documents, the algorithm only ever compares against a small constant number of neighbors at each hop. The traversal converges in a small number of steps because of the small-world property: the graph is dense enough with local connections that greedily moving toward the query vector rapidly closes the distance. The limitation is that greedy local search can get stuck in a local minimum that is not the global nearest neighbor — there may be a closer document elsewhere in the graph that the traversal never reaches because no path of locally optimal moves leads there. This is why the algorithm is approximate: it finds a very good match, but not a provably perfect one.

---

## HNSW: Adding Hierarchy to Speed Up the Search

The Navigable Small World algorithm is already substantially faster than KNN, but a widely adopted refinement called **Hierarchical Navigable Small World (HNSW)** achieves further speedups by restructuring the proximity graph into multiple layers. HNSW is the algorithm underlying most production vector databases today, and understanding its layered structure explains how vector search achieves logarithmic rather than linear scaling.

In HNSW, instead of a single proximity graph, the index contains multiple layers stacked on top of each other. Consider a knowledge base with one thousand documents. The bottom layer — Layer 1 — contains all one thousand document vectors, connected in a proximity graph as in NSW. Layer 2 retains only a random subset of approximately one hundred of those vectors, with their own proximity graph built over just those one hundred points. Layer 3 retains only about ten vectors, again with their own proximity graph. Each ascending layer contains exponentially fewer vectors than the one below it.

Search in HNSW proceeds top-down through these layers. The algorithm enters at the top layer — the sparsest one — with a random starting node. It applies the same greedy traversal as NSW to find the best candidate in that sparse layer. Because there are only ten nodes in the top layer, this step is extremely fast. The best candidate found in the top layer then serves as the entry point for the next layer down. With one hundred nodes in the second layer and a head start near the correct neighborhood, the algorithm again applies greedy traversal to find the best candidate at that finer resolution. Finally, it drops to the bottom layer, starting from the best candidate found in Layer 2, and runs the full NSW traversal over all one thousand vectors to find the final answer.

The power of this design lies in what happens at the top layers. The sparse upper layers enable large jumps across the vector space in very few steps. By the time the algorithm reaches the dense bottom layer — where it must do the most work — it has already been guided into the approximate neighborhood of the query vector. The expensive exhaustive traversal of the bottom layer covers only a small local region rather than the entire knowledge base. Because each additional layer reduces the node count by a fixed factor (roughly ten-fold in the example), the total work across all layers grows as the logarithm of the total number of documents rather than linearly. This logarithmic runtime is what makes HNSW practical at the scale of billions of vectors while still returning results in hundreds of milliseconds.

---

## Key Properties of ANN Algorithms

ANN algorithms like NSW and HNSW have three properties that any practitioner building RAG systems should understand, even if they never implement these algorithms directly.

First, they are **substantially faster than KNN at scale**. The runtime of HNSW is approximately logarithmic in the number of documents, while KNN's runtime is linear. A system that takes one second to search one million documents with KNN would take roughly one thousand seconds to search one billion. The same search with HNSW would take on the order of three seconds — a three-hundred-fold improvement that is the difference between a usable and unusable system.

Second, they provide **approximate rather than exact results**. An ANN search is not guaranteed to return the single closest document in the knowledge base. The greedy traversal can terminate at a local minimum that is very close but not provably optimal. In practice this matters very little for RAG: the relevant documents found by ANN are indistinguishable from those found by KNN in terms of downstream answer quality, because the LLM's synthesis capability is the binding constraint rather than the retriever's ability to rank two highly similar documents in precisely the right order.

Third, their quality depends critically on the **pre-computed index**. Building the proximity graph — whether a flat NSW graph or a layered HNSW hierarchy — requires computing pairwise distances across the entire document set. This is a computationally intensive operation that scales poorly with knowledge base size and must be re-run whenever documents are added or removed in bulk. The saving grace is that this cost is incurred offline, before any queries arrive. The index can be built overnight or in batch, and the fast per-query runtime is the payoff at inference time. Production vector databases automate this process, exposing it as a configurable indexing step that runs in the background.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain why k-nearest-neighbors search becomes impractical as a knowledge base grows to billions of documents, using concrete numbers to illustrate the scaling behavior.
2. Describe the greedy traversal that Navigable Small World uses to search a proximity graph, and explain what makes it both fast and approximate rather than exact.
3. Why does HNSW's hierarchical layering produce logarithmic rather than linear runtime, and why does search begin at the top (sparsest) layer instead of the bottom?

> [!example]- Answer Guide
> #### Q1 — KNN Scaling to Billions
> KNN computes the distance from the query vector to every document vector in the knowledge base, so the number of calculations grows linearly with the number of documents. A knowledge base of one thousand documents requires one thousand distance computations per query; one billion documents requires one billion. The second case is one million times more work than the first. At production scale with concurrent users this linear cost makes KNN completely unworkable.
> 
> #### Q2 — NSW Greedy Traversal Mechanics
> NSW starts from a randomly chosen node in the proximity graph. At each step, it examines all neighbors of the current node, identifies whichever neighbor is closest to the query vector, and moves there. This repeats until no neighbor is closer than the current node — a local minimum. The search is fast because only a small fixed number of neighbors are checked at each hop, rather than all documents. It is approximate because greedy local moves can converge to a local minimum that is not the global nearest neighbor; a closer document may exist elsewhere in the graph but be unreachable by always moving in the locally optimal direction.
> 
> #### Q3 — HNSW Logarithmic Runtime via Layers
> HNSW stacks multiple proximity graphs: the bottom layer contains all documents, and each higher layer retains roughly one-tenth the nodes of the layer below. Search begins at the top (sparsest) layer because the small number of nodes there allows the algorithm to make large jumps across the vector space in very few steps, arriving quickly in the approximate neighborhood of the query. Dropping layer by layer with a warm starting point means the expensive dense-layer traversal covers only a small local region. The total work sums across layers each containing exponentially fewer nodes, which makes the overall runtime grow as the logarithm of the total document count rather than linearly.
