---
tags: [memory-management, agent, langgraph, long-term-memory, short-term-memory, redis, vector-database, session-management, retry-policy, production]
source: https://u.geekbang.org/lesson/818?article=941182
---
# Memory Management Common Problems (AI Engineering 066)

Production pitfalls in Agent memory management, covering persistence, retries, distributed storage, session ID design, and no-code memory integration.

## Core Problems and Solutions

### 1. Conversation History Lost on Restart

LangGraph defaults to `InMemorySaver` — an in-memory checkpointer that is wiped on process restart. In production, replace it with `AsyncPostgresSaver` backed by a PostgreSQL connection pool.

Key points:
- Use **async** mode — sync memory writes can block the agent process
- Use a **connection pool** to avoid connection exhaustion
- Official docs scatter this solution across multiple pages; developers frequently miss it

### 2. Node Failures and Retry Policies

Import `retry_policy` from LangGraph and attach it to nodes that interact with external storage or tools. Configure:
- Trigger conditions (e.g., `OperationError`, resource unavailable)
- `max_retries` (e.g., 3–5)
- Exponential backoff with a multiplier factor (e.g., 1s → 2s → 3s)

When retries are exhausted, the graph transitions to an error node for graceful degradation.

### 3. Vector Store Node Failures (FAISS)

A single-node local FAISS index is fragile. For production:
- **Sharding**: Use `IVF_FLAT` index type; deploy FAISS across multiple hosts communicating via socket ports
- **Replicas**: Set `index_replicas` (e.g., 2) and place replicas on different physical machines
- **Persistence**: Call FAISS `save()` periodically to flush in-memory data to disk

Caution: too many shards can cause broadcast storms — balance shard count against network topology.

### 4. Memory in No-Code Platforms (Dify)

When direct LangGraph development is restricted, Dify supports memory via:
- **Chatflow** (not Workflow): built-in per-session memory window, configurable in the LLM node
- **mem0 plugin**: for global cross-session memory. Flow pattern: `mem0 search` → `LLM` → `mem0 store`. Requires a mem0 API key (max 256MB stored on mem0 servers).

### 5. Session ID Design

Two common anti-patterns:
- **Raw User ID**: concurrent sessions from the same user share one ID → conversation histories collide
- **Pure random UUID**: no link to user → impossible to recover history on reconnect

**Correct pattern — Composite Session ID:**

```
session_id = user_id + session_uuid
# or
session_id = user_id + timestamp + conversation_index
```

This ensures uniqueness across concurrent sessions while remaining traceable to a specific user.

## Key Rules

| Rule | Why |
|---|---|
| Never use `InMemorySaver` in production | History wiped on restart |
| Always configure retry policies | Transient failures are inevitable |
| Use composite session IDs | Prevents collision and enables history recovery |
| Prefer async memory writes | Sync writes can deadlock the agent |
| Shard + replicate vector stores | Single-node FAISS fails at scale |

## Related

- [[langgraph-checkpointers]] — PostgreSQL and other persistent checkpointers
- [[faiss-vector-store]] — FAISS index types and configuration
- [[mem0-memory-plugin]] — mem0 cross-session memory service
- [[redis-caching]] — Redis for agent intermediate caching
- [[retry-policy-patterns]] — retry and error handling in Agents
