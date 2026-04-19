---
tags: [rag, retrieval-augmented-generation, retriever, architecture, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/jjf72/retriever-architecture-overview
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. A user types a question using slightly different words than those in any document in the knowledge base. What happens to keyword search, and what property of a second technique rescues the retrieval?
2. Why would a RAG system apply a metadata filter *after* running both keyword and semantic search, rather than filtering the knowledge base first before searching?
3. What specific problem does combining keyword and semantic search into a single "hybrid" ranked list solve that neither technique solves alone?

---

# Lecture 015: Retriever Architecture Overview

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/jjf72/retriever-architecture-overview) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [The Retriever's Role in a RAG System](#the-retrievers-role-in-a-rag-system)
- [Keyword Search: The Time-Tested Baseline](#keyword-search-the-time-tested-baseline)
- [Semantic Search: Matching Meaning, Not Words](#semantic-search-matching-meaning-not-words)
- [Metadata Filtering: Rigid Exclusion at the Boundaries](#metadata-filtering-rigid-exclusion-at-the-boundaries)
- [Hybrid Search: Combining All Three Techniques](#hybrid-search-combining-all-three-techniques)
- [Tuning the Balance](#tuning-the-balance)

---

## The Retriever's Role in a RAG System

When a user submits a prompt to a RAG system, the first component it reaches is not the LLM — it is the retriever. The retriever acts as the system's intelligent librarian: it has access to the full knowledge base, which can be thought of as a collection of text documents stored in a database, and its job is to quickly identify which subset of those documents is most relevant to the incoming prompt. Only after the retriever has done its work do the selected documents get forwarded to the LLM as part of the augmented prompt.

This sequencing matters. The retriever's output is the ceiling on the quality of the final answer. If it selects the wrong documents — or irrelevant ones — the LLM is left reasoning over noise. If it selects the right documents, the LLM has the raw material it needs to produce a grounded, accurate response. Understanding how the retriever works is therefore not a background technical detail; it is central to understanding why RAG systems succeed or fail in practice.

Most modern retrievers do not rely on a single search technique. Instead, they orchestrate several complementary techniques — keyword search, semantic search, and metadata filtering — into a unified pipeline. This lesson provides the mental model for how that pipeline fits together before the subsequent lessons dive into each technique individually.

---

## Keyword Search: The Time-Tested Baseline

The first technique in the retriever's toolkit is keyword search. The retriever scans documents in the knowledge base and looks for those that contain the exact words present in the user's prompt. A document that shares more vocabulary with the prompt ranks higher; documents that share none of the prompt's words are not returned at all.

Keyword search is not a new idea. It has powered information retrieval systems for decades — from early library catalog indices to the first generation of web search engines — and its longevity is a testament to how often it simply works. When a user asks about a specific product name, a proper noun, a technical term, or any other phrase unlikely to be paraphrased, keyword search will reliably surface documents that contain it. There is no ambiguity to resolve and no approximation to make: if the word is there, it matches.

The technique's weakness is the flip side of its strength. Because keyword search operates on exact lexical overlap, it is brittle in the face of language variation. A user who asks about "car insurance" will not retrieve a document that discusses "vehicle coverage" unless those exact words happen to co-occur. Synonyms, paraphrases, and conceptual equivalents are invisible to a pure keyword approach. This brittleness is the gap that semantic search fills.

---

## Semantic Search: Matching Meaning, Not Words

The second technique is semantic search. Rather than looking for shared vocabulary, semantic search looks for shared meaning. Documents that are conceptually similar to the prompt — that address the same idea, even in entirely different words — are surfaced, while documents that use the prompt's exact vocabulary but are topically unrelated are not.

Semantic search achieves this through vector embeddings. Both the documents in the knowledge base and the incoming query are converted into numerical vectors in a high-dimensional space, where the geometric distance between two vectors reflects the conceptual similarity between the two texts. A query about "buying a new car" will have a vector close to a document discussing "purchasing an automobile" because the underlying concepts are similar, even though the surface words differ. The retriever finds the documents whose vectors are nearest to the query vector and returns them as candidates.

This flexibility is what makes semantic search the crucial complement to keyword search. Together, they cover the space of user intent far more completely than either could alone. Keyword search ensures the system remains sensitive to the specific terms a user chose — which can be critical when those terms are technical, proprietary, or precisely defined. Semantic search ensures the system does not miss relevant content simply because the user phrased their question differently than the document author phrased the answer.

In a typical retrieval pipeline, each technique independently produces a candidate list of documents — perhaps twenty to fifty results each. These two lists are then processed further before being combined.

---

## Metadata Filtering: Rigid Exclusion at the Boundaries

After keyword search and semantic search have each produced their candidate lists, the retriever applies a third technique: metadata filtering. This step is qualitatively different from the two search techniques. Rather than ranking documents by relevance, metadata filtering applies hard, binary rules to exclude documents that are categorically inappropriate for the current user — regardless of how relevant they might otherwise appear.

Consider a company whose knowledge base contains documents intended for different departments. Some documents contain sensitive HR policies relevant only to the HR team; others contain engineering architecture decisions relevant only to engineers. When a member of the engineering team submits a query, the system knows which department they belong to. Metadata filtering uses that structured attribute to exclude all HR documents from the candidate lists before they can advance further in the pipeline. The filtered lists now contain only documents that the user is permitted to see and that are relevant to their role.

The power of metadata filtering lies precisely in its rigidity. Keyword and semantic search operate on gradients — they produce ranked lists where relevance is a matter of degree. Metadata filtering operates on absolutes — a document either passes the filter or it does not. This makes it the right tool for enforcing access controls, date ranges, document types, language codes, or any other categorical attribute where a yes/no decision is more appropriate than a relevance score.

---

## Hybrid Search: Combining All Three Techniques

After metadata filtering has been applied to both lists, the retriever holds two filtered candidate sets: one produced by keyword search and one produced by semantic search. These lists will overlap — many documents will appear in both — but they will also differ. The same document may be ranked near the top of one list and lower in the other, because the two search techniques evaluated relevance differently.

The final step merges these two filtered lists into a single unified ranking. This merged ranking combines the relevance signals from both techniques to produce an ordering that is more robust than either technique could produce alone. The top documents from this final merged list are what the retriever returns as output, and at that point retrieval is complete. These documents are forwarded to the next stage of the pipeline, where they will be incorporated into the augmented prompt sent to the LLM.

This entire approach — running multiple complementary search techniques in parallel and combining their outputs — is called **hybrid search**. The name reflects the architecture: no single technique dominates; instead, each contributes a distinct signal that the merged ranking integrates. Hybrid search is now the standard architecture for production RAG retrievers precisely because it inherits the strengths of each individual technique while mitigating their individual weaknesses.

---

## Tuning the Balance

Understanding that a retriever uses three techniques is only the beginning. A well-performing retriever requires careful calibration of how those techniques are weighted relative to one another.

Keyword search provides sensitivity to exact terminology — essential in domains where precise language matters, such as legal, medical, or technical fields. Semantic search provides flexibility — essential when users phrase queries conversationally or when the knowledge base uses inconsistent vocabulary. Metadata filtering provides categorical precision — essential when access control, recency, or document type must be enforced absolutely.

Each technique brings a different kind of value, and the optimal balance between them depends on the specific requirements of the application. A customer support system serving a general audience may weight semantic search heavily, because customers describe problems in natural language. A compliance system serving auditors may weight metadata filtering heavily, because only documents from a specific regulatory period are ever relevant. An enterprise code search tool may weight keyword search heavily, because function names and error codes must match exactly.

Designing a high-performing retriever is therefore an exercise in understanding what each technique contributes and then tuning the system to reflect the real-world distribution of queries and the real-world structure of the knowledge base. The subsequent lessons in this module examine each technique in depth, providing the foundation needed to make those tuning decisions with confidence.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Describe the end-to-end flow of a retriever from the moment a prompt arrives to the moment documents are returned. Name every major step in order.
2. A document about "vehicle coverage rates" is highly relevant to a user's query about "car insurance costs," but it contains none of the words in the query. Which retrieval technique would surface it, and why does the other technique miss it?
3. An HR document scores in the top 5 results of both keyword and semantic search for a given query. The user submitting the query is an engineer with no HR access. What happens to that document, and at what stage of the pipeline?

> [!example]- Answer Guide
> 
> #### Q1 — End-to-End Retriever Pipeline Flow
> 
> The prompt arrives at the retriever, which runs keyword search and semantic search in parallel against the knowledge base, each producing a candidate list of roughly 20–50 documents. Both lists are then filtered against the user's metadata attributes (role, permissions, date range, etc.), removing categorically inappropriate documents. The two filtered lists are merged into a single unified ranking that combines relevance signals from both techniques. The top-ranked documents from the merged list are returned by the retriever and forwarded to the augmented prompt stage.
> 
> #### Q2 — Semantic vs Keyword Lexical Gap
> 
> Semantic search surfaces the "vehicle coverage rates" document because it converts both the query and the document into vector embeddings representing their meaning, and the two meanings are geometrically close in that space — "car insurance costs" and "vehicle coverage rates" describe the same concept. Keyword search misses it entirely because keyword search operates on exact lexical overlap: it looks for documents containing the words "car," "insurance," and "costs," and finds none of those words in a document that uses "vehicle," "coverage," and "rates."
> 
> #### Q3 — Metadata Filtering and Access Control
> 
> The HR document is eliminated by metadata filtering, which occurs after both keyword and semantic search have produced their candidate lists. The system knows the user belongs to the engineering department and applies a filter that excludes all HR-designated documents. The HR document passes the relevance tests from both search techniques but fails the metadata filter, so it is removed from both candidate lists before those lists are merged. It never appears in the final ranked output returned to the pipeline.
