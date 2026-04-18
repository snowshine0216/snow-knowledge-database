---
tags: [rag, retrieval-augmented-generation, architecture, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/ggi4h/rag-architecture-overview
---

# 005 — RAG Architecture Overview

## Overview

The full RAG pipeline step-by-step, the advantages of RAG over a plain LLM, and a minimal code demo showing how retrieve + generate work together.

## The RAG Pipeline

```
User prompt
    ↓
[Retriever] ← queries → [Knowledge Base (documents DB)]
    ↓ returns top relevant docs
[Augmented Prompt builder]
    "Answer this: <prompt>. Here are relevant docs: <retrieved>"
    ↓
[LLM]
    ↓
Response
```

**User experience is identical** to a plain LLM — submit a prompt, get a response — with a small added latency from the retrieval side-route.

## Augmented Prompt Structure

```
Respond to the following prompt: [original user question]
Using the following information: [retrieved documents]
```

The LLM draws on both its training knowledge AND the retrieved context to generate its response.

## 5 Advantages of RAG

| Advantage | Detail |
|-----------|--------|
| **Access to private/new info** | Company policies, personal data, this morning's news — RAG is often the only way to make it available |
| **Reduced hallucinations** | Retrieved context grounds the LLM; less likely to generate generic/misleading text about topics not well-covered in training |
| **Up-to-date information** | Update the knowledge base (no retraining needed); LLM immediately uses the new data |
| **Source citation** | Retrieved document metadata can be passed to the LLM so it can cite sources in its response |
| **Separation of concerns** | Retriever handles fact-finding + filtering; LLM handles text generation — each component works in its area of greatest strength |

## Minimal Code Demo

```python
def retrieve(query: str) -> list[str]:
    # wrapper around retriever; returns relevant docs from knowledge base
    ...

def generate(prompt: str) -> str:
    # wrapper around LLM; returns text response
    ...

prompt = "Why are hotel prices in Vancouver super expensive this weekend?"

# Without RAG
response = generate(prompt)

# With RAG
retrieved_docs = retrieve(prompt)
augmented_prompt = f"Respond to: {prompt}\nUsing this information: {retrieved_docs}"
rag_response = generate(augmented_prompt)
```

## Learning Retention

### Pre-Test
1. What is added to the user's prompt in a RAG system before it reaches the LLM?
2. Name two advantages RAG has over using an LLM directly.

### Post-Test
1. Trace the full RAG pipeline from user prompt to final response (5 steps).
2. Why does RAG reduce hallucinations?
3. Why is RAG easier to keep current than retraining an LLM?

### Key Takeaway
RAG adds one side-route to the LLM call: the prompt goes to the retriever first, gets enriched with relevant documents, then reaches the LLM as an augmented prompt. Simple addition — major benefits in accuracy, freshness, and grounding.
