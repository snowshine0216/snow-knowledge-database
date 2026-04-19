---
tags: [rag, retrieval-augmented-generation, deeplearning-ai, module-intro]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/qq2xz/module-1-introduction
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What are the two fundamental components of a RAG system, and what distinct job does each one perform?
2. Why might a course on RAG begin with a "simple" RAG implementation before introducing vector databases and advanced retrieval?
3. What would a production RAG system need beyond just a retriever and an LLM — what operational concerns arise once the system is deployed?

---

# Lecture 002: Module 1 Introduction

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/qq2xz/module-1-introduction) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [The Purpose of Module 1](#the-purpose-of-module-1)
- [What RAG Is: A High-Level View](#what-rag-is-a-high-level-view)
- [The Module 1 Curriculum Arc](#the-module-1-curriculum-arc)
- [What You Will Build: The Five-Module Progression](#what-you-will-build-the-five-module-progression)

---

## The Purpose of Module 1

Every complex engineering system becomes learnable once you have a clear mental model of its essential structure. Module 1 of this course is dedicated to building exactly that: a precise, concrete understanding of what a RAG system is, why it is structured the way it is, and how its two central components — the retriever and the language model — interact to produce grounded answers. Everything that follows in subsequent modules — more sophisticated retrieval, vector database integration, advanced prompting, and monitoring — is an elaboration on the foundation established here.

The module is not merely conceptual. It pairs every architectural explanation with working code, so the learner moves from mental model to executable implementation within the first module. By the time the programming assignment at the end of Module 1 is complete, the learner will have built a functioning RAG system from scratch — simple by design, but complete and operational. That system becomes the baseline that each subsequent module extends.

This sequencing reflects a deliberate pedagogical principle: understanding a simple working system is worth more than a theoretical survey of every advanced technique. When you later add a vector database or swap in a more sophisticated retrieval algorithm, you will understand exactly which part of the architecture you are improving and why, because you built the simpler version yourself.

---

## What RAG Is: A High-Level View

Retrieval-Augmented Generation is an architecture that pairs a classical information retrieval system with a large language model, giving the LLM access to knowledge stored in external documents at query time rather than relying solely on facts compressed into its weights during pre-training. The core insight is that LLMs are excellent at language understanding, synthesis, and generation, but poor at reliably recalling specific factual details — especially details from private, proprietary, or recently updated sources. Classical search systems are excellent at finding relevant text given a query, but cannot synthesize that text into a coherent, contextually appropriate answer. RAG combines the strengths of both.

In the RAG pattern, a user submits a question. The retriever searches a prepared knowledge base — which might be a collection of company documents, medical records, legal filings, or any other corpus — and returns the chunks of text most likely to contain the answer. Those chunks are then assembled into a prompt alongside the original question and passed to the LLM, which reads the retrieved evidence and generates a response grounded in that text. The LLM's role is not to recall information from memory but to read and reason over the provided documents, just as a human expert would consult a reference before answering a technical question.

This distinction — reasoning over retrieved text versus recalling from weights — is what gives RAG its reliability advantage for knowledge-intensive tasks. It also makes the system auditable: when the LLM's answer can be traced back to specific retrieved passages, developers and users can verify that the answer is grounded rather than fabricated.

---

## The Module 1 Curriculum Arc

Module 1 is structured to move from motivation to architecture to production context to hands-on implementation. The first lessons establish the conceptual foundation: what RAG is, why it improves LLM response quality, and what problem it is designed to solve. This is the "why" before the "how" — understanding the problem space deeply makes every subsequent architectural decision legible rather than arbitrary.

The curriculum then descends into each component of the RAG architecture in turn. The retriever receives dedicated attention: how documents are chunked, how chunks are encoded into representations that support semantic search, what "relevance" means in the context of retrieval, and how retrieval quality affects the quality of the final answer. The language model component receives equal attention: how to structure the prompt so the LLM uses retrieved evidence rather than ignoring it, how to handle cases where no retrieved chunk is relevant, and how prompt design interacts with the model's instruction-following behavior.

Following the architectural deep dive, Module 1 surveys production RAG deployments across a range of industries. These examples serve a dual purpose: they illustrate the breadth of problems RAG can address, and they encourage learners to identify similar retrieval-over-documents patterns in their own professional contexts. RAG is not a research curiosity — it is a production engineering pattern deployed at scale across healthcare, finance, legal services, customer support, and internal knowledge management. Seeing real examples before writing code connects the implementation to genuine stakes.

The module concludes with a programming assignment in which the learner implements a simple but complete RAG system. This is the first executable artifact of the course, and it is deliberately minimal: a retriever that finds relevant chunks and an LLM that generates an answer from those chunks, with sample code throughout the module to build familiarity before the assignment.

---

## What You Will Build: The Five-Module Progression

The course is structured as an incremental build: each module takes the system left by the previous module and extends it with a new capability. Understanding this progression before beginning Module 1 is valuable because it shows exactly where the simple RAG system is headed and why each addition is necessary.

Module 1 produces a simple RAG system — the baseline. It has a retriever and an LLM, and it can answer questions from a small, static document corpus. It is functional but fragile: retrieval quality depends on basic similarity, there is no persistent index, and there is no mechanism to catch degraded performance over time.

Module 2 introduces a robust retriever. Basic similarity search works well when queries and documents share vocabulary, but fails for paraphrased questions, domain-specific terminology, or sparse data. A robust retriever applies more sophisticated encoding and ranking strategies that handle these cases, substantially improving the accuracy of what gets passed to the LLM.

Module 3 integrates a vector database. The simple RAG system from Module 1 holds its document index in memory — fine for a prototype, impractical for production workloads with millions of documents, multiple users, and persistence requirements. A vector database provides scalable, queryable storage for document embeddings with the performance characteristics needed for real deployments.

Module 4 introduces advanced LLM techniques. Beyond the basic "retrieve then prompt" pattern, there are strategies for improving how the LLM uses retrieved context: reranking retrieved chunks before prompting, using the LLM to assess retrieval quality, structured output generation, and chain-of-thought reasoning over multi-hop questions that require synthesizing evidence from several documents.

Module 5 adds monitoring, evaluation, and production hardening. A RAG system that works well in development can degrade silently in production as the underlying document corpus drifts, query distributions shift, or model updates change behavior. Module 5 provides the observability and evaluation infrastructure needed to detect and diagnose these regressions — the operational layer that separates a prototype from a maintained production system.

The arc from Module 1 to Module 5 is the arc from understanding to deployment. Module 1 is where that arc begins.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words what each of the two core RAG components — the retriever and the LLM — is responsible for, and why neither alone is sufficient.
2. Why does Module 1 start with a simple RAG system rather than immediately introducing a vector database and advanced retrieval techniques?
3. Trace the five-module progression: what specific limitation of the Module 1 system does each subsequent module address?

> [!example]- Answer Guide
> #### Q1 — Retriever vs LLM Roles
> The retriever's job is to find relevant document chunks from a knowledge base given a user's query — it excels at locating text but cannot synthesize a coherent answer. The LLM's job is to read the retrieved evidence and generate a grounded, contextually appropriate response — it excels at language understanding and synthesis but cannot reliably recall specific private or up-to-date facts from memory. RAG combines both: retrieval provides the facts, the LLM provides the reasoning and articulation.
> #### Q2 — Why Start Simple
> Building a simple working system first gives the learner a concrete mental model of the architecture's essential structure before complexity is introduced. When vector databases, advanced retrieval, and monitoring are added in later modules, the learner understands exactly which part of the system is being improved and why, because they built the simpler version themselves. A purely theoretical survey of advanced techniques without this foundation produces fragile understanding.
> #### Q3 — Five-Module Progression
> Module 2 improves retrieval robustness — basic similarity fails on paraphrased or domain-specific queries. Module 3 adds a vector database — in-memory indexing from Module 1 cannot scale to production workloads. Module 4 introduces advanced LLM techniques — the basic "retrieve then prompt" pattern does not handle multi-hop questions or assess retrieval quality. Module 5 adds monitoring and evaluation — a system that works in development can degrade silently in production without observability infrastructure.
