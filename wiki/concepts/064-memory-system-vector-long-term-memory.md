---
tags: [memory-system, vector-database, long-term-memory, short-term-memory, langgraph, faiss, embeddings, agent, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=941180
---
# Memory System and Vector-Based Long-Term Memory Management

Memory management in AI agents splits into **short-term** (within a session) and **long-term** (across sessions) concerns. Managing context window limits and enabling personalisation are the two core problems this pattern addresses.

## Short-Term Memory

Short-term memory keeps relevant conversation history within a single [[langgraph]] thread. Because LLM context windows are finite, two retrieval strategies exist:

- **Recency window** — keep the N most recent messages. Simple but can drop the first (goal-defining) message.
- **Semantic retrieval** — store Q&A pairs in a [[vector-database]], retrieve top-K by cosine similarity. Surfaces relevant past exchanges but loses temporal ordering.

In LangGraph, `MemorySaver` + `thread_id` implement session isolation. Use `InMemorySaver` for development only; production requires a database-backed checkpointer.

**Thread ID design**: use `user_id + date + consistent hash` — unique, reproducible, and user-scoped. Pure UUIDs are unrecoverable; plain usernames collide.

## Long-Term Memory

Long-term memory persists user preferences and interaction patterns across sessions. The LLM builds a user profile by summarising previous exchanges and storing them in a persistent vector store. On future queries, semantically similar memories are retrieved and injected into the prompt context.

## Context Window Management

When accumulated history exceeds the model's context limit, two strategies apply:

| Strategy | Mechanism | Best for |
|---|---|---|
| Summarisation | LLM compresses old history; append new messages | Coding assistants, complex goal-tracking |
| Trimming | Drop oldest messages beyond N tokens | Translation tasks, stateless Q&A |

Choose by business scenario: coding agents need the first message preserved; translation agents need the style instructions preserved.

## Vector-Based Memory Storage

Memories are encoded as [[embeddings]] (e.g., DashScope `text-embedding-v4`) and stored in a vector index. On each new query, top-K most similar memories are retrieved via cosine similarity.

**In-memory store (dev):** `InMemoryVectorStore` — lost on process exit. Good for understanding the pattern.

**FAISS (persistent):** Index saved to `index.faiss` on disk. Load on startup, save on response completion and on process exit via `atexit` hook.

**Isolation:** All users share one index; filter by `user_id` metadata on every retrieval. Prefer per-user index files or separate namespaces to reduce leakage risk.

## Memory as Agent Tools

Save and recall functions are exposed as [[agent-tools]] in LangGraph, letting the LLM decide autonomously when to persist or retrieve memories.

## Code Structure

| File | Responsibility |
|---|---|
| `graph.py` | Workflow only |
| `configuration.py` | FAISS / search / logging config |
| `prompts.py` | Prompt templates |
| `tools.py` | Memory save & recall tools |

Encapsulate all vector store operations in a `MemoryManager` class to decouple LangGraph from storage details.

## Key Points

- Short-term memory = in-thread; long-term memory = cross-thread persistent store
- Summarisation and trimming are workarounds for LLM context limits, not features
- Vector retrieval improves personalisation but loses message ordering
- Always flush the FAISS index on agent response completion and process exit

## Related Concepts

- [[rag]] — same vector retrieval pattern reused for memory lookup
- [[langgraph]] — `MemorySaver`, thread state, graph nodes
- [[faiss]] — local persistent vector index
- [[embeddings]] — semantic encoding of memories
- [[context-window-management]] — summarisation and trimming strategies
