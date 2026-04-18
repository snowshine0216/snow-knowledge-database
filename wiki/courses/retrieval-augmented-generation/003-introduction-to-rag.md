---
tags: [rag, retrieval-augmented-generation, deeplearning-ai, fundamentals]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/oo48h/introduction-to-rag
---

# 003 — Introduction to RAG

## Overview

Core explanation of what RAG is and why it works, using an intuitive question-answering analogy. Introduces the retriever + knowledge base architecture.

## The Core Analogy

Three questions that illustrate when retrieval is needed:

| Question | Info needed | Analogy |
|----------|-------------|---------|
| "Why are hotels expensive on weekends?" | None — general knowledge | LLM answers from training |
| "Why are Vancouver hotels expensive *this* weekend?" | Specific recent info (Taylor Swift concert) | LLM needs retrieval |
| "Why doesn't Vancouver have more downtown hotel capacity?" | Deep specialized research | LLM needs extensive retrieval |

**Pattern:** Collect information → Reason over it → Generate response. RAG formalizes this for LLMs.

## How RAG Works

1. **LLM limitation**: Trained only on data from the public internet; misses private data, recent events, specialized knowledge
2. **Core insight**: You can *modify the prompt before sending it to the LLM* — add retrieved context alongside the user's question
3. **Augmented prompt structure**: `[original question] + [retrieved relevant information]` → LLM now has what it needs to respond accurately

## Key Components

| Component | Role |
|-----------|------|
| **Retriever** | Manages a knowledge base; finds and retrieves most relevant chunks for any given prompt |
| **Knowledge base** | Trusted, relevant, possibly private information store |
| **LLM (Generator)** | Receives the augmented prompt; reasons over retrieved context to produce the response |

## Why "Retrieval Augmented Generation"

- **Retrieval** — fetch relevant info from the knowledge base
- **Augmented** — enhance/augment the prompt with that info
- **Generation** — LLM generates a response using the augmented prompt

## Learning Retention

### Pre-Test
1. What two limitations of LLMs does RAG address?
2. What is the single most important thing a RAG system does to a user's prompt before sending it to the LLM?

### Post-Test
1. In the Vancouver/Taylor Swift analogy, which of the three questions requires retrieval, and why?
2. What is the retriever component responsible for?
3. Complete: RAG = ______ + Augmented + ______

### Key Takeaway
RAG is simple: intercept the user's prompt, add relevant retrieved information from a knowledge base, then send the augmented prompt to the LLM. The LLM doesn't need retraining — it just needs better context.
