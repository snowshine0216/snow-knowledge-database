---
tags: [rag, production, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/hhtjq1/module-5-introduction
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. Once a RAG system is technically working in development, what major new category of concerns emerges before it is ready for production — and why does passing local tests not address them?
2. What is the difference between evaluating individual RAG components versus evaluating the overall end-to-end system, and why might you need both?
3. If a RAG system costs too much to run or responds too slowly for real users, what class of strategies does Module 5 offer — and what must you be careful not to sacrifice in the process?

---

# Lecture 056: Module 5 Introduction

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/hhtjq1/module-5-introduction) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [From Working to Production-Ready](#from-working-to-production-ready)
- [Evaluation, Logging, and Observability](#evaluation-logging-and-observability)
- [Trade-offs: Cost, Memory, and Latency](#trade-offs-cost-memory-and-latency)
- [Multimodal RAG](#multimodal-rag)

---

## From Working to Production-Ready

By the end of Module 4 — covered in [[041-module-4-introduction]] — you had developed the skills to build a complete RAG pipeline: a retriever that indexes, searches, and ranks relevant chunks, combined with an LLM that reads those chunks and generates a grounded response. At that stage, the system works. It produces answers. Tests pass. The architecture is sound.

But a working system and a production-ready system are two very different things. Module 5 is the bridge between them. It asks a different class of question: not "does this produce correct answers in my test cases?" but "will this perform reliably, efficiently, and observably when it is serving real user traffic at scale?"

This distinction matters because development and production differ in fundamental ways. In development you control the inputs — you test against queries you have written, documents you have chosen, and edge cases you have already thought of. In production, users bring their own queries, their own unexpected phrasings, and their own combinations of context that you have never seen. Some of those queries will expose weaknesses in your retriever, your chunking strategy, your prompt design, or your LLM's tendency to hallucinate. Without the ability to detect, measure, and trace those failures systematically, you cannot improve your system. You are flying blind.

Module 5 therefore shifts the engineer's perspective from construction to operations. The topics it introduces — evaluation, logging, observability, efficiency trade-offs, and multimodal data — are all concerned with the question of how a RAG system behaves in the real world, not just in a notebook. This is the production engineering discipline for RAG, and it is as important as the algorithmic work that precedes it.

---

## Evaluation, Logging, and Observability

The first major section of Module 5 addresses evaluation in three connected layers.

The first layer is **component-level evaluation**. A RAG system has multiple moving parts: the retriever, the chunker, the re-ranker, the prompt template, and the LLM generation step. Each component can be evaluated independently. The retriever can be assessed on whether it returns the most relevant chunks for a given query — using metrics such as precision@k, recall@k, or mean reciprocal rank. The LLM's generation can be assessed on faithfulness (does it stay within the retrieved context?), answer relevance (does it address the question?), and correctness (is it factually accurate against a reference?). Component evaluation is useful for diagnosing where in the pipeline quality is breaking down, but it does not tell you the full story.

The second layer is **end-to-end system evaluation**. Even if each component scores well individually, the pipeline may fail because of how the components interact. A retriever that returns the right chunks may still produce a bad final answer if the LLM's prompt is poorly structured. End-to-end evaluation treats the system as a whole, measuring whether the user's question receives a satisfactory answer, regardless of which component is responsible for any observed failure. Module 5 introduces evaluation platforms and frameworks that support both layers, allowing practitioners to instrument their systems and track quality metrics over time rather than as a one-time check.

The third layer is **logging and tracing**. Evaluation tells you whether your system is performing well on average. Logging tells you what happened in a specific failure case. Module 5 introduces logging strategies that trace individual calls through the RAG pipeline — recording which query was submitted, which chunks were retrieved, what prompt was constructed, and what response the LLM produced. This call-level tracing is indispensable for diagnosing the root cause of low-quality responses. Without it, a bad answer from the system is a mystery; with it, you can inspect every step and identify whether the problem was in retrieval, prompt construction, or generation.

The third layer of evaluation goes further still: Module 5 teaches how to **build custom evaluation datasets from real application traffic**. Rather than relying solely on synthetic benchmarks or manually curated test sets, you can sample actual user queries from your production logs, annotate them with expected answers (or use an LLM judge to rate them), and use this dataset to test whether changes to your RAG system improve or degrade performance on the queries that real users actually ask. This is a powerful discipline: it grounds your evaluation in the distribution of real-world use rather than your own assumptions about what users will ask.

---

## Trade-offs: Cost, Memory, and Latency

The second major section of Module 5 addresses the practical engineering constraints that every production RAG system must navigate: cost, memory footprint, and latency.

In development, these concerns are easy to ignore. Running a hundred test queries against an LLM API is cheap. Loading an entire vector index into memory on your development machine is feasible. Waiting two seconds for a response is fine when you are the only user. None of these remain true at scale. When a RAG system is serving thousands of users per day, a small per-query cost compounds quickly; a vector index that fit in memory may not fit when the knowledge base grows; a two-second response time may be unacceptable for an interactive assistant.

Module 5 introduces a range of strategies for managing these trade-offs. On the cost side, these include techniques for reducing the number of tokens sent to the LLM — by compressing retrieved context, summarizing chunks rather than passing them verbatim, or using smaller models for classification steps that do not require full LLM capability. On the memory side, techniques include approximate nearest neighbor indexing configurations, quantization of embeddings, and tiered storage strategies that keep the most frequently accessed embeddings in memory while offloading others. On the latency side, strategies include caching embeddings for repeated queries, batching requests, and choosing between retrieval strategies based on their speed-quality profile.

The critical constraint across all of these optimizations is that they must not significantly degrade response quality. This is why Module 5 treats efficiency as a design problem rather than a pure engineering problem: every trade-off must be evaluated against the quality metrics established in the evaluation section. A system that responds in half the time but produces demonstrably worse answers has not been optimized — it has been broken. The skill Module 5 develops is the judgment to find configurations that align the system with the project's practical needs while preserving the quality that makes it useful. This theme connects back to the foundations introduced in [[003-introduction-to-rag]], where the core value proposition of RAG — grounded, accurate, context-aware responses — must be protected even as the system is made more efficient.

---

## Multimodal RAG

The final section of Module 5 extends the RAG paradigm beyond text. Standard RAG systems operate on text-based knowledge bases: documents, articles, code, transcripts. But many real-world knowledge bases include image files, PDF documents with embedded diagrams, charts, scanned pages, or other visual content that cannot be captured by text extraction alone. Multimodal RAG addresses this gap.

Module 5 introduces cutting-edge approaches for incorporating images and PDFs into the retrieval pipeline. This includes techniques for embedding visual content so that it can be retrieved alongside or instead of text, as well as vision-language models (VLMs) that can both interpret images and generate text responses that incorporate visual information. The result is a RAG system that can answer questions by drawing from a knowledge base that includes diagrams, screenshots, scanned documents, and other non-textual artifacts — substantially expanding the range of knowledge that can be made retrievable.

Multimodal RAG represents the leading edge of what production RAG systems are becoming. While text-only RAG is already widely deployed, the move to multimodal knowledge bases is ongoing in research and industry alike, driven by the practical reality that most enterprise knowledge is not stored exclusively in plain text.

Module 5 closes, as each module has, with a programming assignment in which students implement the skills from the module — putting evaluation, efficiency optimization, and multimodal retrieval into practice in a working system.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why a RAG system that works well in development may still not be production-ready, naming at least two specific concerns that development environments obscure.
2. Describe the three layers of evaluation introduced in Module 5. What does each layer measure, and why is each necessary even when the others are already in place?
3. What is the central constraint that must govern all efficiency optimizations in a production RAG system, and what does Module 5 provide to ensure practitioners respect that constraint?

> [!example]- Answer Guide
> 
> #### Q1 — Development vs Production Failure Modes
> 
> Development obscures real-world failure modes in at least two ways. First, developers control test inputs — they test against queries they have written, which do not reflect the full distribution of what real users will ask. Second, scale-related constraints (cost, memory, latency) are invisible at low volumes: a few hundred test queries are cheap and fast, but thousands of daily users expose cost, memory, and latency problems that simply do not appear in a notebook. A working development system may also lack logging and observability, meaning that failures in production are untraceable without additional engineering.
> 
> #### Q2 — Three Layers of RAG Evaluation
> 
> The three layers are:
> 
> **(1) Component-level evaluation** — measures how well individual pipeline components perform in isolation (e.g., retriever recall@k or LLM faithfulness); useful for diagnosing which component is causing a failure.
> 
> **(2) End-to-end evaluation** — treats the full pipeline as a unit and measures whether the user's question receives a satisfactory final answer, capturing interaction effects between components that component-level evaluation cannot see.
> 
> **(3) Custom dataset evaluation from production traffic** — grounds evaluation in the actual distribution of real user queries rather than synthetic benchmarks, ensuring that improvements measured in testing transfer to production.
> 
> #### Q3 — Central Constraint on Efficiency Optimizations
> 
> The central constraint is that efficiency optimizations must not significantly degrade response quality. Every cost, memory, or latency optimization must be evaluated against the system's quality metrics — a system that is faster but produces worse answers has been degraded, not improved. Module 5 provides the evaluation frameworks established in its first section as the instrument for enforcing this constraint: practitioners can measure quality before and after each optimization and accept only those changes that preserve acceptable quality levels.
