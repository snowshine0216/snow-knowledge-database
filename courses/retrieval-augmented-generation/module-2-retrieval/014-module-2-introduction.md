---
tags: [rag, retrieval-augmented-generation, module-2, retrieval, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/77dri/module-2-introduction
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. A user asks your RAG system a question in plain conversational language. The knowledge base contains thousands of formal documents. What fundamental mismatch must the retriever bridge, and why is it non-trivial?
2. Why can't a retriever simply use a standard database query (like SQL) to find relevant documents in response to a user's natural-language question?
3. What does it mean to evaluate a retriever's performance, and why would you need dedicated evaluation strategies separate from evaluating the overall RAG system?

---

# Lecture 014: Module 2 Introduction

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/77dri/module-2-introduction) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [The Retriever's Deceptively Simple Job](#the-retrievers-deceptively-simple-job)
- [The Mismatch Problem](#the-mismatch-problem)
- [What This Module Covers](#what-this-module-covers)

---

## The Retriever's Deceptively Simple Job

At first glance, the retriever's role in a [[003-introduction-to-rag]] pipeline sounds straightforward: given a user's question, find the documents in the knowledge base that would help an LLM produce a good answer. The specification is easy to state in a single sentence. The execution, however, is a genuinely hard information retrieval problem that sits at the core of whether a RAG system succeeds or fails in practice.

The difficulty is not computational in the narrow sense — modern systems can search through millions of documents in milliseconds. The difficulty is semantic: the retriever must understand what the user actually wants and match that intent to documents that may express related ideas in completely different vocabulary, structure, and style.

---

## The Mismatch Problem

Users do not submit well-formed, structured queries to a RAG system. They type the way they speak — casual, ambiguous, sometimes incomplete. "What's the policy on remote work?" is a typical user query. The document that contains the answer might be titled "Employee Handbook Section 4: Flexible Work Arrangements" and phrase its content in formal HR language that shares no keywords with the user's question. A simple keyword-matching approach would fail to connect the two.

The documents in a knowledge base compound this problem. Whether they are personal emails, internal company memos, legal contracts, or articles from a medical journal, they were written for a human reader, not designed for machine retrieval. They carry context that is obvious to a domain expert — implicit references, jargon, assumed background knowledge — but opaque to a system that needs to score relevance numerically. The retriever must somehow cut through this messiness and surface the right handful of documents, rapidly, out of a potentially enormous collection.

This is why retrieval is treated as its own specialized discipline within the RAG pipeline, rather than a solved sub-problem. The techniques a retriever uses — from sparse keyword methods to dense vector embeddings and hybrid approaches — each represent a different strategy for bridging the gap between a user's loosely phrased intent and the structured, formal language of the knowledge base.

---

## What This Module Covers

Module 2 builds a systematic understanding of retrieval by covering the primary techniques retrievers use to accomplish this matching feat. Rather than treating each technique as a black box, the module develops theoretical intuition for how each one works internally, which makes it possible to reason about when to apply it, where it will succeed, and where it will break down.

The module also addresses how techniques are combined in practice. Real-world retrievers rarely rely on a single method; they fuse multiple signals — keyword overlap, semantic similarity, metadata filters — to produce rankings that outperform any individual approach. Understanding the relative strengths and weaknesses of each technique is the prerequisite for reasoning about these combinations sensibly.

Finally, the module introduces strategies for evaluating retrieval quality. Measuring retriever performance is non-trivial because the "right" answer is not always a single document — relevance is often partial, and different queries have different tolerance for false positives. Dedicated evaluation methods, distinct from end-to-end RAG system evaluation, are necessary to diagnose retrieval failures and guide improvements. As with Module 1, hands-on coding exercises and a programming assignment accompany the conceptual material, giving direct practice with the techniques discussed.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Describe the two-sided mismatch a retriever must bridge — what is the nature of user queries, and what is the nature of the documents in a typical knowledge base?
2. Why is simple keyword matching insufficient for retrieval in a RAG system? Give a concrete example illustrating where it would fail.
3. What three areas does Module 2 cover, and why is each one necessary for building a competent retriever?

<details>
<summary>Answer Guide</summary>

1. Users submit natural-language queries — conversational, informal, and often ambiguous. The documents in a knowledge base are typically formal, domain-specific texts written for human readers: memos, journal articles, policy documents. The retriever must bridge the vocabulary and style gap between these two sides, connecting intent expressed casually to information expressed formally.
2. Keyword matching only links a query to documents that share the same words. If a user asks "remote work policy" but the document says "flexible work arrangements," no keyword overlap exists and the relevant document is invisible to the retriever. Semantic gap — the same concept expressed with different vocabulary — is a pervasive failure mode for purely lexical approaches.
3. The module covers: (1) the techniques individual retrievers use, building theoretical understanding of how they work and their trade-offs; (2) how techniques are combined in practice, since hybrid approaches outperform single methods; and (3) evaluation strategies for retrieval quality, which are needed separately from end-to-end evaluation to pinpoint and fix retrieval-specific failures.

</details>
