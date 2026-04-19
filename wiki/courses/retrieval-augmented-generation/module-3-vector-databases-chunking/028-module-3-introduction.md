---
tags: [rag, vector-databases, chunking, module-3, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/tthfc/module-3-introduction
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. A RAG prototype works fine against a few hundred documents. Why might the same approach break down at millions of documents, and what class of tool would you reach for?
2. What is a vector database, and in what way does it differ from a relational database?
3. Why is "document chunking" necessary in a production RAG system? What problem does it solve?

---

# Lecture 028: Module 3 Introduction

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/tthfc/module-3-introduction) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [From Theory to Production Scale](#from-theory-to-production-scale)
- [Why Vector Databases](#why-vector-databases)
- [What This Module Covers](#what-this-module-covers)

---

## From Theory to Production Scale

Module 2 built a strong conceptual foundation in information retrieval — the key techniques, their trade-offs, and how to evaluate them. Module 3 makes the next move: taking that theory into production. The gap between a working prototype and a system that operates at millions or billions of documents is not merely quantitative. Certain operations that are fast against small corpora — vector similarity search in particular — become prohibitively slow as the collection grows, and a different class of infrastructure is required.

---

## Why Vector Databases

A traditional relational database can implement many of the retrieval techniques covered in Module 2, but it is not optimized for the high-dimensional vector arithmetic that underlies [[003-introduction-to-rag|semantic search]]. Vector databases are purpose-built to store and search through large quantities of vector data efficiently. They have become almost synonymous with RAG systems in production precisely because semantic search — the most powerful retrieval technique — depends on them to remain fast at scale.

---

## What This Module Covers

The module develops understanding of why vector databases are architecturally suited to vector retrieval, then provides hands-on practice executing a variety of different search types against one. Alongside the database fundamentals, the module covers a set of production RAG techniques: document chunking (splitting long texts into retrievable units), query parsing (structuring user input for better retrieval), and re-ranking (refining candidate results before handing them to the LLM). A programming assignment at the end of the module gives the opportunity to apply all of these concepts together.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Why does a RAG system that works at prototype scale often need a dedicated vector database once it reaches production scale?
2. What distinguishes a vector database from a relational database in the context of RAG?
3. Name three production RAG techniques introduced in this module and briefly describe what each one does.

<details>
<summary>Answer Guide</summary>

1. At small scale, vector operations can run on a general-purpose database or even in memory. At millions or billions of documents, the same operations slow down dramatically. Vector databases are optimized specifically for high-dimensional similarity search and maintain acceptable latency at that scale.
2. A relational database organizes data in rows and columns and is optimized for structured queries (SQL). A vector database stores high-dimensional vector embeddings and is optimized for approximate nearest-neighbor search — the core operation behind semantic retrieval — which a relational database handles poorly at scale.
3. (1) Document chunking: splitting long documents into smaller units so the retriever can surface the specific passage relevant to a query, rather than an entire document that may dilute the signal. (2) Query parsing: transforming a raw user question into a structured form that the retriever can act on more precisely. (3) Re-ranking: taking an initial set of retrieved candidates and applying a more expensive scoring model to reorder them, improving the quality of what the LLM ultimately receives.

</details>
