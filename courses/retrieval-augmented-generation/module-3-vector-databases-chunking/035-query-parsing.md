---
tags: [rag, query-parsing, retrieval-augmented-generation, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/oo48qx/query-parsing
---

## Pre-test

1. **Hypothetical Document Embeddings (HyDE)** converts a user question into a hypothetical answer document before embedding. Why does this theoretically improve retrieval precision compared to embedding the raw question directly?

2. **Named entity recognition** can be applied to an incoming query before it reaches the retriever. What two distinct downstream steps can the extracted entities inform, and why does each benefit?

3. A medical RAG system rewrites "my shoulder hurts after my dog yanked the leash" into "persistent shoulder numbness and paresthesia in fingers post-traction injury — possible nerve impingement or brachial plexopathy." Which specific properties of a good retrieval query does this rewrite satisfy, and which common failure modes of raw conversational text does it correct?

---

# Lecture 035: Query Parsing

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/oo48qx/query-parsing | DeepLearning.AI | Retrieval-Augmented Generation Course

## Outline

1. [Why Conversational Prompts Are Poor Search Queries](#1-why-conversational-prompts-are-poor-search-queries)
2. [Query Rewriting: The Foundation Technique](#2-query-rewriting-the-foundation-technique)
3. [Named Entity Recognition for Structured Extraction](#3-named-entity-recognition-for-structured-extraction)
4. [Hypothetical Document Embeddings (HyDE)](#4-hypothetical-document-embeddings-hyde)
5. [Choosing the Right Technique for Your System](#5-choosing-the-right-technique-for-your-system)

---

## 1. Why Conversational Prompts Are Poor Search Queries

The single most important insight in query parsing is that **the language humans use when talking to an AI is almost never the language that retrieval systems are optimized for.** Users interact with RAG-powered applications as though they are conversing with another person — they provide context, backstory, emotional framing, and tangential detail. A vector database, however, is looking for semantic alignment between the query embedding and the document embeddings stored in its index. The richer and more idiomatic the conversational text, the harder it becomes for a retriever to isolate the core semantic signal that would match relevant documents.

Consider a user who types: "I was out walking my dog, a beautiful black lab named Poppy, when she raced away from me and yanked on her leash hard while I was holding it. Three days later, my shoulder is still numb and my fingers are all pins and needles. What's going on?" The retriever must somehow bridge the gap between this narrative and indexed documents that describe *shoulder neuropathy, brachial plexus traction injury,* or *peripheral nerve impingement.* The anecdote about the dog's breed, its name, and the act of walking is all semantically inert relative to the clinical knowledge base. Worse, it may actively steer the embedding in a direction that reduces cosine similarity to the most relevant documents.

This is why **query parsing** — the preprocessing step that transforms a raw user prompt into a retrieval-optimized query before it reaches the vector store — is considered a key architectural component of any production RAG system. Rather than treating the user's raw text as a search query, the retriever pipeline interposes a transformation stage that can rewrite, restructure, or augment the prompt to improve retrieval quality. The lesson covered here surveys the main families of techniques, from simple LLM-based rewriting to advanced methods like named entity recognition and hypothetical document generation.

---

## 2. Query Rewriting: The Foundation Technique

**Query rewriting** is the simplest and most widely deployed form of query parsing, and for the majority of production systems it is the only technique required. The mechanism is straightforward: an LLM is prompted with an instruction that specifies the target domain of the knowledge base and a set of transformation rules, and the raw user prompt is appended to that instruction. The LLM's output becomes the query that is actually submitted to the retriever.

The power of this approach lies in how precisely the instruction can be tuned to the domain. A well-crafted rewriting prompt for a medical RAG system might instruct the LLM to: clarify ambiguous lay descriptions into clinical terminology, add relevant synonyms that broaden recall, strip irrelevant personal narrative, and expand acronyms or colloquial shorthand. Applying such a prompt to the dog-walking example yields something like: "Experiencing a sudden forceful pull on the shoulder, resulting in persistent shoulder numbness and finger numbness for three days. What are the potential causes or diagnoses such as neuropathy or nerve impingement?" This transformed query eliminates the biographical noise, introduces domain-specific vocabulary (*neuropathy, nerve impingement*), and surfaces the true clinical question.

The cost of query rewriting is a single additional LLM call per user query. In practice, this overhead is modest — especially when a fast, small model can be used for the rewriting step rather than the full generation model — and the retrieval quality gains typically justify the expense by a wide margin. Because better retrieval means better context for the final generation step, the quality of the system's answers also improves proportionally. As emphasized in the lesson, iteration on the rewriting prompt itself is both easy and high-leverage: small adjustments to the instruction can yield measurable improvements in downstream retrieval precision without any changes to the embedding model, the vector index, or the chunking strategy.

Query rewriting connects directly to the broader discussion of retrieval quality covered in [[022-hybrid-search]] and [[015-retriever-architecture-overview]], where the same principle applies: the closer the semantic alignment between query and document, the more reliable the retrieval step becomes regardless of the underlying search algorithm.

---

## 3. Named Entity Recognition for Structured Extraction

While query rewriting operates holistically on the entire prompt, **named entity recognition (NER)** takes a more surgical approach by identifying and labeling specific categories of information within the query text. A NER model analyzes the input and returns a structured set of labeled spans — indicating, for example, that a particular substring refers to a *person*, a *location*, a *date*, a *fictional character*, or a *medical condition*. These labeled entities can then be used to augment or guide the retrieval step in ways that simple rewriting cannot accomplish.

The key distinction is that NER transforms the query from unstructured prose into partially structured data. Once you know that a query contains a date reference, you can pass that date as a *metadata filter* on the vector search — confining the candidate documents to those timestamped within the relevant period. Similarly, if a query names a specific person, you can add an author or entity filter rather than relying solely on semantic similarity to find the right documents. This is especially valuable in hybrid retrieval systems where metadata filtering can dramatically narrow the candidate set before the vector similarity scoring stage.

The lesson highlights **GLiNER** as a concrete example of a general-purpose, efficient NER model that can be run inline in a retrieval pipeline. GLiNER accepts both the input text and a user-specified list of entity types to look for, returning a labeled output in which identified spans are tagged with their category. Because the model is lightweight, running it on every incoming query adds only modest latency while potentially improving retrieval quality significantly. The tradeoff calculus here is favorable: NER extraction is computationally cheap relative to an LLM call, and the structured output it provides enables retrieval strategies — particularly metadata-filtered search — that pure embedding similarity cannot achieve alone. The use of extracted entities for metadata filtering integrates naturally with the vector database capabilities discussed in [[030-vector-databases]].

---

## 4. Hypothetical Document Embeddings (HyDE)

**Hypothetical Document Embeddings**, abbreviated **HyDE**, represents the most conceptually elegant of the advanced query parsing techniques. The core insight behind HyDE is that a user's question and the documents that answer it are fundamentally *different kinds of text*. A question is typically short, interrogative, and framed from the perspective of someone who lacks information. The ideal answer document is longer, declarative, and written from the perspective of domain expertise. When a retriever embeds both and computes cosine similarity between them, it is effectively comparing two distributions that are not well-aligned in embedding space — an *apples-to-oranges* comparison, as the lesson describes it.

HyDE resolves this mismatch by inserting an LLM-based generation step *before* the embedding and search step. Given the user's query, an LLM is prompted to generate a hypothetical document that represents what an ideal answer would look like — not a real document from the knowledge base, but a plausible, well-written response in the style of the target corpus. This hypothetical document is then embedded, and its vector representation is used as the actual search query against the vector index. Because the hypothetical document is written in the same register, vocabulary, and structure as real knowledge-base documents, the embedding comparison is now between two texts of the same type: *apples to apples*.

In the medical example from the lesson, instead of embedding "What are the causes of shoulder numbness and finger tingling after a sudden traction event?", the system would embed a generated passage like "Sudden traction on the shoulder can cause brachial plexus stretch injuries, resulting in peripheral nerve impingement and presenting as numbness or paresthesia radiating into the hand and fingers. Differentials include cervical nerve root compression and thoracic outlet syndrome." The generated passage closely resembles the kind of clinical text that would appear in the knowledge base, leading to better semantic alignment and — empirically — improved retrieval performance.

The cost of HyDE is non-trivial: generating the hypothetical document requires a full LLM call with a non-trivial output length, adding latency and compute expense to every query. The technique is therefore best reserved for systems where retrieval precision is particularly critical and where the query-document distributional gap is large. Experimentation is essential, as the gains from HyDE are not uniform across domains or knowledge base structures.

---

## 5. Choosing the Right Technique for Your System

The practical guidance the lesson offers on technique selection is worth internalizing as a decision framework. **Query rewriting should be the default starting point** for any RAG system that accepts natural-language input from end users. It is low-cost to implement, easy to iterate on, and reliably improves retrieval quality across a wide range of domains. There is almost no scenario in which some form of query cleaning is not beneficial, and basic LLM-based rewriting delivers the bulk of the available gain.

Named entity recognition is worth adding when the knowledge base has structured metadata — particularly timestamps, named persons, locations, or other categorical attributes — and when the retrieval pipeline is already configured to support metadata filtering. In those cases, NER effectively gives the retriever an additional signal that complements semantic similarity, and the compute cost is low enough that the tradeoff is usually favorable.

HyDE and other generation-based augmentation methods should be treated as optimization techniques to be evaluated experimentally. The additional LLM call required to generate a hypothetical document introduces both latency and cost. Whether the retrieval improvement justifies these costs depends heavily on the specific knowledge base, the typical query distribution, and the quality of the embedding model in use. The lesson's recommendation is to treat advanced techniques as hypotheses: implement them in a controlled branch of the retrieval pipeline, measure their impact on retrieval quality metrics, and let the data decide whether the complexity is warranted.

This empirical, measure-first approach to query parsing is consistent with the broader philosophy of RAG system design: the pipeline is composed of multiple interacting components, each with its own quality-cost tradeoff, and the right configuration for one system may be wrong for another. Query parsing is no exception — it is a lever to be calibrated by measurement, not a setting to be fixed by convention. For a broader view of how query parsing fits into the end-to-end retrieval architecture, see [[015-retriever-architecture-overview]].

---

## Post-test

1. What is the fundamental reason why raw conversational user prompts make poor vector search queries, and what property of natural language causes this mismatch?

2. Describe the mechanism by which HyDE improves retrieval performance. What specific distributional problem does it solve, and what cost does it introduce?

3. Named entity recognition can inform two distinct stages of the retrieval pipeline. Name both stages and explain what the extracted entities contribute to each.

> [!example]- Answer Guide
> 
> #### Q1 — Why Raw Prompts Fail Vector Search
> 
> Conversational prompts contain biographical context, emotional framing, filler narrative, and colloquial language that carry no semantic signal relevant to the knowledge base. The embedding of such text is pulled in the direction of the irrelevant content, reducing cosine similarity to the most relevant documents. The mismatch arises because conversational language is optimized for human communication, not for semantic proximity to expert-domain documents.
> 
> #### Q2 — HyDE Mechanism and Distributional Fix
> 
> HyDE addresses the distributional mismatch between interrogative question text and declarative document text in embedding space. It generates a hypothetical "ideal answer" document using an LLM, then embeds that document rather than the raw question. Because the hypothetical document is stylistically and lexically similar to real knowledge-base documents, the embedding comparison becomes apples-to-apples rather than apples-to-oranges, improving semantic alignment. The cost is an additional LLM generation call per query, adding latency and compute expense.
> 
> #### Q3 — NER in Two Pipeline Stages
> 
> First, extracted entities can be passed to the **vector search** stage to augment or guide the query — for example, including a recognized medical term as an additional search signal. Second, entities can be used for **metadata filtering** — for example, using an extracted date to constrain the search to documents within a specific time range, or using a recognized person's name to filter by author or subject tag. Each benefit is distinct: the first enriches the semantic query; the second narrows the candidate set using structured attributes.
