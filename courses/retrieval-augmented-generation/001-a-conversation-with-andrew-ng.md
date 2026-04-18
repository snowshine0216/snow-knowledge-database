---
tags: [rag, retrieval-augmented-generation, deeplearning-ai, andrew-ng, course-intro]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/rrngb/a-conversation-with-andrew-ng
---

# 001 — A Conversation with Andrew Ng

## Overview

Andrew Ng introduces the RAG course with instructor Zain Hassan (formerly of Weaviate), covering why RAG is the most widely used LLM improvement technique and where the field is heading.

## Key Points

### What RAG Solves
- LLMs trained only on public internet data can't answer questions about proprietary/private documents
- RAG provides the model access to additional data at inference time
- Powers features like "searching the web" in ChatGPT, Claude, Gemini

### Instructor Background
- Zain Hassan: AI/ML engineer, researcher, educator
- Former Weaviate (leading vector database company) and Ticket.ai

### Course Scope
- Balance of foundational concepts (search systems + LLMs) and practical implementation tips
- Topics: data preparation, prompt engineering, evaluation, monitoring
- Advanced: multimodal RAG, reasoning models, agentic RAG, RAG vs fine-tuning

### RAG in Industry
- Most common type of LLM-based application today
- Enterprise use cases: customer Q&A on products, internal policy lookup
- Startups: healthcare (medical Q&A), education (tutoring), many verticals

### RAG is Evolving With LLMs
- Newer models are better at staying grounded → hallucination rates trending down
- Longer context windows → less pressure on chunk-size hyperparameters
- Agentic document extraction → easier RAG on PDFs, slides, diverse documents
- RAG as a component in multi-step agentic workflows

### Agentic RAG (Highlighted as Key Frontier)
- Traditional RAG: human engineer hard-codes retrieval logic (chunk size, # chunks, retrieval method)
- Agentic RAG: AI agent decides what to retrieve, when, and how (web search vs. specialized DB vs. re-retrieval)
- Agents can self-correct: if first retrieval insufficient, route back and retry
- Makes systems far more flexible and resilient to real-world messiness

## Concepts Introduced

| Concept | Brief Definition |
|---------|-----------------|
| RAG | Pairing classical search with LLM reasoning to answer questions from external data |
| Retriever | Component that finds relevant chunks from a knowledge base |
| Context window | The input the LLM can process at once — larger windows ease RAG design |
| Chunk size | Hyperparameter: how long each document segment is when splitting for retrieval |
| Agentic RAG | LLM agent autonomously decides retrieval strategy rather than following hard-coded rules |

## Learning Retention

### Pre-Test (answer before watching)
1. What problem does RAG solve that a base LLM can't handle alone?
2. Why does a larger LLM context window change RAG design decisions?
3. How does agentic RAG differ from traditional RAG?

### Post-Test (answer after watching)
1. Name two real-world industry verticals where RAG is commonly deployed.
2. What trend has caused LLM hallucination rates in RAG systems to decrease?
3. In agentic RAG, what specifically does the agent get to decide that a human engineer previously had to hard-code?

### Key Takeaway
RAG is the foundational LLM application pattern — and it's evolving from static retrieval pipelines into autonomous agent-driven systems that self-direct what information to fetch.
