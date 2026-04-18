---
tags: [rag, retrieval-augmented-generation, information-retrieval, vector-database, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/11yp6/introduction-to-information-retrieval
---

# 009 — Introduction to Information Retrieval

## Overview

How the Retriever works internally — explained via the library analogy — covering indexing, relevance scoring, the precision/recall tradeoff, and vector databases.

## The Library Analogy

| Library | RAG Retriever |
|---------|--------------|
| Collection of books | Knowledge base of documents |
| Shelves organized by topic/author/genre | Index of documents (keeps them searchable) |
| Librarian understands your question's meaning | Retriever processes the prompt to find underlying intent |
| Librarian finds relevant sections → specific books | Retriever searches the index → returns top-scored documents |
| Fewer irrelevant books returned = better answer | Fewer irrelevant chunks in context = better LLM response |

## Retrieval Pipeline

1. **Index** — knowledge base documents are organized into a searchable index at ingest time
2. **Process prompt** — retriever understands the underlying meaning of the incoming query
3. **Score** — each document receives a numerical similarity score vs. the prompt
4. **Rank & return** — top-scoring documents are returned to be added to the augmented prompt

## The Precision/Recall Tradeoff

- **Return everything** → technically includes all relevant docs, but floods the LLM context with irrelevant content → expensive + useless
- **Return only top-1** → misses relevant docs ranked 2nd, 3rd, 4th
- **Reality** → retrievers sometimes rank relevant docs too low, irrelevant ones too high
- **Solution** → monitor performance over time, experiment with retrieval settings

## Familiar Analogies

| Technology | Retrieval task |
|-----------|---------------|
| Web search engine | Retrieves web pages relevant to a query |
| SQL database | Retrieves rows matching a query |
| RAG retriever | Retrieves knowledge base documents relevant to a prompt |

Information retrieval is a mature field that predates LLMs — RAG borrows from it extensively.

## Vector Databases

- Most production retrievers are built on **vector databases** — specialized DBs optimized for rapidly finding documents that most closely match a prompt
- Not strictly required, but standard at production scale
- Many companies keep existing data in relational DBs; vector DB is an additional retrieval layer

## Learning Retention

### Pre-Test
1. What two things must a good retriever balance (precision vs. recall tradeoff)?
2. How does a retriever rank documents?

### Post-Test
1. Map the library analogy: what does the librarian correspond to in a RAG system?
2. What is the danger of returning too many documents to the LLM?
3. Why are vector databases typically used instead of relational databases for production RAG retrievers?

### Key Takeaway
A retriever is fundamentally an information retrieval system: it indexes a knowledge base, scores each document's similarity to the incoming prompt, and returns the top-ranked ones — balancing precision (not too many) against recall (not too few).
