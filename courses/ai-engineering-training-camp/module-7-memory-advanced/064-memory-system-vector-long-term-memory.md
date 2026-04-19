---
tags: [memory-system, vector-database, long-term-memory, short-term-memory, langgraph, faiss, embeddings, agent, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=941180
wiki: wiki/concepts/064-memory-system-vector-long-term-memory.md
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. When an agent's conversation history exceeds the LLM's context window, what are two strategies you might use to handle the overflow?
2. In a multi-user LangGraph application using a shared vector store for memory, how would you prevent one user's memories from leaking to another user?
3. What is the key trade-off between storing conversation history sequentially (recency-based) versus storing it as vector embeddings retrieved by semantic similarity?

---

# 064: Memory System and Vector-Based Long-Term Memory Management

**Source:** [1记忆系统与基于向量的长期记忆管理](https://u.geekbang.org/lesson/818?article=941180)

## Outline

1. Course module review and module 7 introduction
2. Short-term memory — concepts and implementation
3. Long-term memory — concepts and use cases
4. Thread IDs and session isolation
5. Context window management: summarization vs. trimming
6. Vector-based memory storage — InMemory implementation (p08)
7. FAISS-based persistent memory storage (p09)
8. Production code structure and best practices

---

## 1. Module Overview

This lecture opens Module 7, which integrates memory management and agent observability on top of the LangGraph workflows built in earlier modules. The course arc goes: LLM fundamentals → data engineering (LlamaIndex) → single agent (LangChain) → multi-agent (LangGraph) → memory + observability.

The goal for this module is to combine previously learned capabilities (RAG, agents, workflows) with a persistent memory layer so agents can remember user preferences and conversation history across sessions.

---

## 2. Short-Term Memory

**Concept:** Within a single conversation thread (session), the agent needs to pass relevant history to the LLM on every call. Because context windows are finite, not all history can be included.

**Two retrieval strategies:**

| Strategy | Mechanism | Trade-off |
|---|---|---|
| Linear (recency) | Keep the N most recent messages | May lose the initial, goal-defining message |
| Semantic similarity | Store Q&A pairs in a vector DB; retrieve by cosine similarity | Order of messages is lost; retrieved context is non-sequential |

Both strategies involve trade-offs. The choice depends on the business scenario:
- **Coding assistant**: Preserve the first message (core requirement) + semantically similar context
- **Translation tasks**: Preserve the first few messages (style/tone instructions); discard middle pairs

**LangGraph implementation:**

- Use `MemorySaver` as the checkpointer when creating the graph
- Use `thread_id` inside `config` to distinguish sessions
- In dev/test: `InMemorySaver` (data lost on process exit)
- In production: replace with a database-backed checkpointer (PostgreSQL, Redis, etc.)

**Thread ID design pitfalls:**
- Static IDs → shared across users → data leakage
- Pure UUID → unpredictable; hard to look up later
- Recommended: `user_id + date + hash` — unique, reproducible, and user-scoped

---

## 3. Long-Term Memory

**Concept (classical):** Cross-session storage. Persists user preferences, habits, and persona so future conversations feel personalised.

**Concept (modern/blurred):** The boundary between short- and long-term memory has softened. Practical systems combine:
- Short-term in-thread history + persistence
- Long-term cross-thread storage + summarisation

**In LangGraph terms:**
- Short-term = in-thread state (same `thread_id`)
- Long-term = cross-thread storage (different `thread_id` sharing a persistent store)

**Use case example:** A user consistently asks the LLM to explain technical concepts via code. The LLM stores this preference in long-term memory and automatically responds with code examples on future queries, even in new sessions.

---

## 4. Context Window Management

When conversation history exceeds the LLM's maximum context length, two main strategies exist:

### 4a. Summarisation

- Call the LLM with the accumulated history and ask it to produce a compressed summary.
- Configure `max_tokens` for the summary to be small enough to leave room for new messages.
- The summary replaces older messages; new messages are appended.
- `LangMem` library provides a built-in `summarise` node for this.
- Summarisation is a workaround for an LLM limitation, not a feature.

### 4b. Window Trimming

- Retain only the last N tokens of conversation history.
- LangChain provides `trim_messages` and `pre_model_hook` for this.
- Configuration options: keep `last` vs. `first`, ensure messages start with `HumanMessage`, ensure alternating pairs.

**Choosing a strategy by scenario:**

| Scenario | Recommended approach |
|---|---|
| Coding assistant | Keep first message + semantically relevant messages |
| Translation | Keep first few messages (instructions); trim middle |
| General chat | Recency window or rolling summary |

---

## 5. Vector-Based Memory Storage

### 5a. Concept

Instead of storing history sequentially, store Q&A pairs (or summaries) as vector embeddings. On each new query, retrieve the top-K most semantically similar memories using cosine similarity.

**Characteristics:**
- Not ordered by time
- Best for personalisation: surfaces relevant past context regardless of when it occurred
- Risk: irrelevant recent messages may be excluded; critical sequential context can be lost

### 5b. In-Memory Vector Store (p08 — for understanding)

```
VectorStore: InMemoryVectorStore
Embedding model: DashScope text-embedding-v4 (via LangChain)
LLM: Qianwen-Max
Storage: process memory (lost on exit)
```

**Flow:**
1. At conversation start, load user memories from the vector store (filter by `user_id`)
2. Retrieve top-3 semantically similar memories for the current query
3. Pass retrieved memories + query to the LLM
4. After the LLM responds, call `save_memory` tool to add the new exchange to the vector store

**Key warning:** All users share one vector store. Isolation is by metadata filter (`user_id`). A bug in the filter can expose other users' memories.

**Memory as a LangGraph tool:** The save and recall functions are exposed as agent tools, letting the LLM decide when to save or retrieve memories.

### 5c. FAISS-Based Persistent Storage (p09 — for production-ish use)

```
VectorStore: FAISS index
Embedding model: DashScope
Storage: local disk (index.faiss file)
```

**Differences from p08:**
- Index is saved to disk; persists across process restarts
- Load existing index on startup; create new if absent
- `at_exit` hook calls `save_index` to prevent data loss on crash
- Local mode: `faiss.read_index(path)` / Remote mode: socket connection

**Data safety pattern:**
- After every agent response, automatically call `save_memory`
- Register `atexit` handler to flush index on normal and abnormal exits
- Log all save failures

---

## 6. Code Architecture Recommendations

The lecture emphasises clean code structure as LangGraph projects grow:

| File | Responsibility |
|---|---|
| `graph.py` | Workflow definition only |
| `configuration.py` | FAISS config, search config, logging config |
| `prompts.py` | Prompt templates |
| `state.py` | State types |
| `tools.py` | Tool definitions |

- Start with everything in one file for prototyping
- Extract each concern into its own file as the project grows
- Wrap vector store operations in a `MemoryManager` class to isolate LangGraph from storage details
- AI-generated code tends to mix all concerns; hand-written core logic + AI-generated boilerplate is the recommended hybrid

---

## 7. Key Takeaways

1. **Short-term memory** lives within a thread; use `MemorySaver` + `thread_id`. Swap to DB-backed checkpointer in production.
2. **Long-term memory** spans threads; store compressed memories or embeddings in a persistent vector store.
3. **Context overflow** is an LLM limitation, not a feature. Mitigate with summarisation (quality) or trimming (simplicity), chosen by business scenario.
4. **Vector-based retrieval** improves personalisation but sacrifices temporal ordering — only use when the business scenario does not require sequential context.
5. **Thread IDs** must be unique per user and reproducible — use `user_id + date + consistent hash`, not pure UUID.
6. **Data isolation** in shared vector stores relies on metadata filtering; always filter by `user_id` when retrieving.
7. **Persistence safety**: always save the vector index on agent response completion and on process exit.

---

## Connections

- [[rag]] — vector retrieval pattern reused here for memory lookup
- [[langgraph]] — graph nodes, state, `MemorySaver`, `thread_id` configuration
- [[faiss]] — FAISS index for persistent local vector storage
- [[embeddings]] — DashScope `text-embedding-v4` used to encode memories
- [[agent-tools]] — memory save/recall exposed as LangGraph tools
- [[context-window-management]] — summarisation and trimming strategies
- [[long-term-memory]] — cross-session personalisation via persistent stores


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why a pure UUID is considered a poor design for `thread_id`, and what the recommended alternative is.
2. Describe the full flow of the vector-based memory system in p08: what happens at the start of a conversation, during the query, and after the LLM responds?
3. A colleague suggests using summarisation for every project because "it preserves more information than trimming." Using the scenario examples from this lesson, explain when trimming or semantic retrieval would be preferable to summarisation.

> [!example]- Answer Guide
> #### Q1 — UUID vs Reproducible Thread ID
> A pure UUID is unpredictable and cannot be reconstructed later, making it impossible to reliably look up a user's session. The recommended pattern is `user_id + date + consistent hash`, which is unique per user, reproducible, and scoped so sessions can be retrieved deterministically.
> 
> #### Q2 — Vector Memory System Full Flow
> At conversation start, top-3 semantically similar memories are loaded from the vector store filtered by `user_id`; the retrieved memories plus the query are passed to the LLM; after the LLM responds, the `save_memory` tool is called to store the new exchange as an embedding in the vector store.
> 
> #### Q3 — When Trimming Beats Summarisation
> For a translation task, the first few messages contain critical style/tone instructions that must be preserved exactly — trimming the middle pairs keeps those intact better than a lossy summary. For a coding assistant, semantic retrieval surfaces the original requirement message regardless of when it occurred, which is more useful than a rolling summary that may compress away key constraints.
