---
tags: [rag, retrieval-augmented-generation, architecture, pipeline, deeplearning-ai, hallucination, knowledge-base]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/ggi4h/rag-architecture-overview
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. If you send the same question to both a plain LLM and a RAG-augmented LLM, describe in detail what happens differently inside the RAG system before the LLM ever sees the prompt.
2. LLMs sometimes "hallucinate" — generating confident but false statements. Why would connecting an LLM to a knowledge base reduce (but not eliminate) this behavior?
3. Without retraining the model at all, how would you update a RAG system so it can answer questions about events that happened yesterday?

---

# Lecture 005: RAG Architecture Overview

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/ggi4h/rag-architecture-overview) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [The Full RAG Pipeline Step by Step](#the-full-rag-pipeline-step-by-step)
- [Constructing the Augmented Prompt](#constructing-the-augmented-prompt)
- [Five Advantages of RAG Over a Plain LLM](#five-advantages-of-rag-over-a-plain-llm)
- [A Minimal Code Illustration](#a-minimal-code-illustration)
- [What the Architecture Implies for System Design](#what-the-architecture-implies-for-system-design)

---

## The Full RAG Pipeline Step by Step

A RAG system intercepts the user's query before it reaches the language model and routes it through an additional side-channel that enriches the prompt with retrieved context. From the user's perspective, the experience is identical to talking to a plain LLM: they type a question and receive a response. The added latency from the retrieval step is typically small enough to be imperceptible. But internally, the data flow is meaningfully different.

The pipeline proceeds as follows. First, the user submits a prompt — a natural-language question or instruction. Second, that same prompt is sent to the **retriever**, which queries a **knowledge base** (a database of documents, passages, or facts) and returns the top-ranked results most semantically relevant to the query. Third, an **augmented prompt builder** combines the original user question with the retrieved documents into a single enriched prompt. Fourth, this augmented prompt — now carrying both the question and relevant contextual evidence — is passed to the **LLM**. Fifth, the LLM generates its response by reasoning over both its pre-trained knowledge and the supplied context, and that response is returned to the user.

The crucial observation is that the LLM only ever sees the augmented prompt, never the raw user query alone. It has no awareness that retrieval occurred; it simply receives a richer, more informative prompt and responds accordingly. This means that the quality of the final answer depends heavily on two things: the quality of the retriever (did it find the right documents?) and the quality of the prompt construction (was the context presented in a way the LLM can reason over effectively?).

---

## Constructing the Augmented Prompt

The augmented prompt is the mechanism by which retrieved context reaches the LLM, and its construction is more consequential than it might initially appear. A typical structure looks like this:

```
Respond to the following prompt: [original user question]
Using the following information: [retrieved documents]
```

The LLM receives both elements and draws on them jointly to generate its answer. The phrase "using the following information" signals to the model that the provided text should be treated as authoritative context — a grounding signal rather than arbitrary background noise. In practice, prompt engineers often add additional instructions at this stage: asking the model to cite its sources, to acknowledge when the retrieved documents do not contain enough information to answer, or to prefer retrieved context over its own training knowledge when the two conflict.

The number of retrieved documents injected into the prompt is a design parameter. Injecting more documents increases the chance that the relevant information is present, but also increases the risk of distracting the model with irrelevant passages and approaching the context window limit. Injecting fewer documents keeps the prompt focused but may miss relevant information if retrieval is imperfect. In practice, retrieval systems return a ranked list and a configurable "top-k" value determines how many are included in the augmented prompt.

The LLM draws simultaneously on two sources during generation: its pre-trained weights (which encode general world knowledge) and the retrieved context (which supplies specific, current, or private information). When these sources agree, the model's confidence is reinforced. When they conflict — for example, a document states something different from what the model learned during training — a well-designed system instructs the model to prefer the retrieved context, since it presumably reflects more accurate or more recent information.

---

## Five Advantages of RAG Over a Plain LLM

RAG's advantages over querying an LLM directly are concrete and measurable, not merely theoretical. Five distinct benefits emerge from the architecture.

The first is **access to private and new information**. A standalone LLM's knowledge is bounded by its training data — public internet text up to a cutoff date. Company policies, patient records, legal case files, proprietary research, and this morning's news are all invisible to it. RAG changes this fundamentally: anything that can be stored in the knowledge base can be made available for retrieval at query time. An enterprise deploying RAG can populate its knowledge base with internal documentation and immediately enable employees to ask questions against that corpus.

The second advantage is **reduced hallucinations**. LLMs hallucinate — they generate confident-sounding text that is factually wrong — most often when asked about topics sparsely covered in their training data. When retrieved documents provide specific, accurate facts, the model is less likely to fabricate an answer because it has authoritative text to draw from. This is not a complete solution; the model can still misread or misrepresent the retrieved content. But grounding the prompt in retrieved evidence reduces the frequency and severity of hallucinations on specialized topics.

The third advantage is **up-to-date information without retraining**. Training or fine-tuning a large language model is an expensive, time-consuming operation. Updating a knowledge base — adding new documents, removing outdated ones — is not. A RAG system can incorporate information from yesterday's news, last week's product release notes, or a document uploaded minutes ago, with no changes to the model itself. This makes RAG a far more economical approach to knowledge freshness than continuous retraining.

The fourth advantage is **source citation**. When the retrieved documents are included in the prompt along with their metadata (title, URL, date, author), the LLM can attribute its claims to specific sources in its response. This transforms the system from a black box into a traceable information pipeline. Users can follow citations to verify claims — a capability that standalone LLM responses entirely lack and that is essential for trust in high-stakes domains like medicine, law, and finance.

The fifth advantage is **separation of concerns**. In a RAG system, the retriever handles the fact-finding problem — determining which documents are most relevant to a given query — while the LLM handles the language generation problem — synthesizing information into a coherent, readable response. Each component operates in its domain of greatest strength. The retriever can be optimized with search-specific techniques (embedding models, rerankers, filters). The LLM can be prompted to focus on reasoning and expression rather than recall. This modular design is architecturally cleaner and easier to debug than trying to make a single model do both tasks.

---

## A Minimal Code Illustration

The conceptual pipeline translates directly into code. A minimal implementation uses two functions — one for retrieval, one for generation — and chains them together:

```python
def retrieve(query: str) -> list[str]:
    # Queries the knowledge base; returns relevant document chunks
    ...

def generate(prompt: str) -> str:
    # Sends prompt to the LLM; returns the text response
    ...

prompt = "Why are hotel prices in Vancouver super expensive this weekend?"

# Without RAG: the LLM answers from training knowledge alone
response = generate(prompt)

# With RAG: retrieve first, then augment the prompt, then generate
retrieved_docs = retrieve(prompt)
augmented_prompt = f"Respond to: {prompt}\nUsing this information: {retrieved_docs}"
rag_response = generate(augmented_prompt)
```

The structural difference is minimal — one additional step before the `generate` call, and one string concatenation to build the augmented prompt. But the behavioral difference can be dramatic. The plain `generate` call answers from whatever the model learned during training; the RAG call answers from a blend of training knowledge and freshly retrieved, task-specific documents.

This minimal example elides the complexity that real production systems must handle — chunking documents into retrievable units, embedding queries and documents into the same vector space, building efficient indexes, reranking retrieved results, and constructing prompts that scale with multiple retrieved passages. Those topics are addressed in later modules. But the core data flow is exactly this: retrieve, augment, generate.

---

## What the Architecture Implies for System Design

Understanding the RAG architecture at this level already implies several practical design decisions. The knowledge base is not a static artifact — it needs a pipeline to keep it populated and current. Documents must be chunked into segments of appropriate granularity (too large and retrieval returns broad, unfocused passages; too small and the retrieved chunks lack context). Each chunk must be embedded and indexed so the retriever can perform semantic search efficiently.

The retriever quality determines the upper bound on system accuracy. No amount of prompt engineering or model capability can compensate for systematically retrieving the wrong documents. This is why retrieval evaluation — measuring whether the right documents appear in the top-k results — is a distinct and important discipline in RAG system development. Poor retrieval is often the first bottleneck to address when a RAG system underperforms.

The LLM sits at the end of the pipeline and is in some ways the easiest component to swap. Different models can be evaluated for how well they reason over retrieved context, handle conflicting information, or follow citation instructions. The modular architecture makes these substitutions straightforward — the retriever and knowledge base remain unchanged while different generators are benchmarked.

The RAG pattern described here, introduced in [[003-introduction-to-rag]], is the foundation for everything that follows in the course. Later modules address the retrieval step in depth — covering embedding models, vector databases, and reranking strategies — before returning to the end-to-end system to examine production reliability and evaluation.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Trace the full RAG pipeline from the moment a user submits a question to the moment they receive a response. Name each component and state what it does.
2. Pick two of RAG's five advantages and explain the underlying mechanism that makes each one possible — not just what the advantage is, but why the architecture produces it.
3. You are maintaining a RAG system for a law firm. New court rulings come out every day. How do you keep the system current, and why is this approach more practical than the alternative?

> [!example]- Answer Guide
>
> #### Q1 — Full RAG Pipeline Trace
>
> The user's prompt is sent simultaneously to the retriever and (later) to the LLM. The retriever queries the knowledge base and returns the top-ranked relevant document chunks. The augmented prompt builder combines the original user question with the retrieved chunks into a single enriched prompt. The LLM receives this augmented prompt and generates a response that draws on both its pre-trained knowledge and the supplied context. The response is returned to the user.
>
> #### Q2 — Two RAG Advantages Explained
>
> **Reduced hallucinations:** when the prompt contains specific, accurate retrieved documents, the model has authoritative text to draw from rather than having to generate facts from sparse training-data representations. It still reasons over the retrieved text, but grounding in concrete evidence reduces the gap that hallucination typically fills.
>
> **Source citation:** because retrieved documents carry metadata (title, URL, date) that can be included in the prompt, the LLM can be instructed to attribute its claims to specific sources — producing a traceable response rather than an anonymous assertion. This traceability is only possible when the evidence chain runs from document to prompt to answer.
>
> #### Q3 — Keeping a RAG System Current
>
> To keep the system current, you add new court rulings to the knowledge base as they are published — no changes to the model are needed. The retriever will find and surface the new documents at the next relevant query. The alternative — retraining or fine-tuning the model on new data — requires enormous computational resources and time, and would need to be repeated every time new rulings emerge. Updating a document database is orders of magnitude cheaper and faster.
