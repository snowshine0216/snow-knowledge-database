---
tags: [rag, retrieval-augmented-generation, deeplearning-ai, fundamentals, llm, knowledge-base]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/oo48h/introduction-to-rag
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. An LLM trained on the entire public internet still fails to answer questions about events from last week. What is the fundamental architectural reason for this failure?
2. If you wanted an LLM to answer a question about your company's internal HR policy document — something never published online — what would you need to do?
3. What does the word "augmented" mean in the phrase "Retrieval Augmented Generation"?

---

# Lecture 003: Introduction to RAG

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/oo48h/introduction-to-rag) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [The Problem RAG Solves](#the-problem-rag-solves)
- [An Intuition Through Analogy](#an-intuition-through-analogy)
- [How RAG Works: The Core Mechanism](#how-rag-works-the-core-mechanism)
- [The Three Components of a RAG System](#the-three-components-of-a-rag-system)
- [Why the Name "Retrieval Augmented Generation"](#why-the-name-retrieval-augmented-generation)

---

## The Problem RAG Solves

Large language models are trained on enormous snapshots of text — crawled web pages, books, code repositories, and more — but that snapshot is frozen at a point in time. Once training concludes, the model's internal knowledge does not update. This means that any event, document, or fact that postdates the training cutoff is simply invisible to the model. More critically, the model has never seen private information: your company's internal documentation, a hospital's patient records, a law firm's proprietary case files, or a user's personal notes. No amount of prompting can coax out information the model was never trained on.

This is not a minor limitation to be papered over with clever prompt engineering. It is a structural constraint: the model's weights encode a static distribution over public internet text. When a user asks "Why are hotel prices in Vancouver so expensive *this* weekend?" the model cannot know about the Taylor Swift concert that sold out the city unless that information appears somewhere in its training data. And even if some news article about it was scraped, the model may not confidently retrieve that specific fact on demand.

The consequence is that raw LLMs, without augmentation, are unreliable for questions that require fresh, specific, or private information. Organizations deploying LLMs for real use cases — customer support, internal knowledge search, research assistance — need a mechanism to supply that missing context at query time, without retraining the model from scratch every time the world changes.

---

## An Intuition Through Analogy

The course introduces RAG through three questions that sit at different points on a spectrum of required prior knowledge. Consider the first: "Why are hotel prices higher on weekends than weekdays?" A general-knowledge LLM can answer this confidently from training data — the phenomenon is well-documented in economic literature, travel journalism, and countless web discussions. The model needs no external information.

Now consider the second question: "Why are hotel prices in Vancouver so expensive *this* weekend?" The answer requires specific, recent, local knowledge — perhaps a major concert or sporting event. A model without retrieval will either hallucinate a plausible-sounding reason or give an unhelpfully generic response about high-demand weekends. It cannot know about this specific weekend without access to current information.

The third question escalates further: "Why doesn't Vancouver have more downtown hotel capacity?" This requires deep, specialized knowledge about urban planning regulations, land costs, historical development decisions, and civic policy. Even if some of this information exists in the model's training data, answering it well may require pulling together many specific documents — feasibility studies, zoning records, policy analyses — that are too diffuse and specialized to be reliably encoded in model weights.

The pattern across these three questions reveals the general structure of the RAG use case. When a question requires information the model reliably has, retrieval adds no value. When a question requires information the model doesn't have — because it's too recent, too private, or too specialized — retrieval becomes essential. RAG formalizes this pattern into a reusable pipeline.

---

## How RAG Works: The Core Mechanism

The central insight of RAG is deceptively simple: **you can modify the prompt before it reaches the LLM**. Instead of sending the user's raw question directly to the model, you first retrieve relevant information from an external knowledge base, then construct an augmented prompt that contains both the original question and the retrieved context. The LLM then answers based on both its pre-trained knowledge and the supplied context.

This works because LLMs are extremely capable at reasoning over and synthesizing provided text. They do not need the information baked into their weights — they can read it from the prompt context window and integrate it into their response. The key is ensuring that the right information is retrieved and provided. A well-constructed augmented prompt might look like: "Answer the following question: [user question]. Here is relevant information to help you: [retrieved documents]." The model treats the retrieved documents as authoritative context and grounds its answer accordingly.

The practical beauty of this approach is that it decouples two concerns that would otherwise be expensive to handle together. Keeping the model's knowledge current does not require retraining — it only requires updating the knowledge base. New documents can be added to the knowledge base at any time, and they immediately become available for retrieval at the next query. The model itself remains unchanged. This makes RAG dramatically cheaper to maintain than the alternative of continuously fine-tuning or retraining a model on updated data.

---

## The Three Components of a RAG System

A RAG system has three distinct components, each with a well-defined role. Understanding these roles separately is important because each component can be swapped, upgraded, or optimized independently.

The first component is the **knowledge base** — a store of trusted, relevant documents. This is the information that the LLM would not otherwise have access to. The knowledge base might be a set of company policy documents, a curated collection of research papers, a database of product manuals, or a continuously updated news feed. Its defining characteristic is that it contains information too specific, too private, or too recent to be reliably encoded in model weights. The knowledge base is the source of ground truth that makes RAG systems more accurate than standalone LLMs on specialized queries.

The second component is the **retriever** — the system responsible for taking a user's query and finding the most relevant chunks of information from the knowledge base. The retriever must solve a non-trivial search problem: given thousands or millions of documents, identify the handful that are most relevant to this specific question. Early retrieval systems relied on keyword matching; modern RAG systems typically use **semantic search** based on dense vector embeddings, which can match documents that are conceptually similar to the query even when they share no exact words. The retriever's quality directly determines the ceiling on the RAG system's answer quality — if the wrong documents are retrieved, the LLM will reason over irrelevant context and produce poor answers.

The third component is the **LLM (generator)** — the language model that receives the augmented prompt and generates the final response. The LLM does not need to be specially trained for RAG; any capable generative model can serve this role. Its job is to synthesize the retrieved context with its own pre-trained knowledge and produce a coherent, accurate answer. The LLM should ideally be capable of citing or attributing its claims to the retrieved documents, providing traceability that standalone LLM responses lack entirely.

---

## Why the Name "Retrieval Augmented Generation"

The name is a precise description of the mechanism, read backwards from output to input. **Generation** is what the LLM does — it generates text. **Augmented** describes how the prompt that reaches the LLM has been enriched beyond the user's raw query. **Retrieval** names the process that produces that enrichment — fetching relevant documents from the knowledge base.

Each word in the name maps to a distinct step in the pipeline. First, retrieval happens: the user's query is sent to the retriever, which searches the knowledge base and returns the most relevant documents. Second, augmentation happens: those documents are combined with the original question to form an enriched prompt. Third, generation happens: the augmented prompt is passed to the LLM, which generates a grounded response.

This naming also implicitly clarifies what RAG is not. It is not "Retrieval-Only" — the LLM's generative capability is essential for synthesizing retrieved information into a coherent answer. It is not "Generation-Only" — without retrieval, the model has no access to the private, recent, or specialized information that makes RAG valuable. The combination of retrieval and generation, with augmentation as the bridge, is what gives the technique its power. As covered in [[001-a-conversation-with-andrew-ng]], this architecture represents one of the most practically impactful patterns in applied LLM engineering today.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain, without using the word "training," why a powerful LLM still cannot answer questions about events from last week or about your company's internal documents.
2. In the Vancouver hotel analogy, which question illustrates the RAG use case most clearly, and what specific property of that question makes retrieval necessary?
3. Describe the three components of a RAG system and the distinct role each one plays.

<details>
<summary>Answer Guide</summary>

1. An LLM's knowledge is frozen in its weights at the moment training ended. Its weights only encode patterns from data it was exposed to — public internet text up to a cutoff date. Private documents and recent events were never part of that data, so the model has no representation of them. No prompting technique can extract information the model was never shown.
2. The second question — "Why are hotel prices in Vancouver expensive *this* weekend?" — most clearly illustrates the RAG use case. The word "this" signals that the answer depends on current, specific, local information (such as a particular event happening that weekend). That information is too recent and too specific to be reliably encoded in model weights, making retrieval from an up-to-date knowledge base the only viable path to a correct answer.
3. The knowledge base stores the trusted, relevant documents the LLM would otherwise lack — private, recent, or specialized information. The retriever takes the user's query and searches the knowledge base to find the most relevant chunks, solving a semantic search problem. The LLM (generator) receives the augmented prompt combining the original question with retrieved context, and synthesizes them into a coherent, grounded response.

</details>
