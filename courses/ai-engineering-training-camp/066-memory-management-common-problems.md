---
tags: [memory-management, agent, langgraph, long-term-memory, short-term-memory, redis, vector-database, session-management, retry-policy, production]
source: https://u.geekbang.org/lesson/818?article=941182
wiki: wiki/concepts/066-memory-management-common-problems.md
---
# 066: Memory Management Common Problems

**Source:** [3记忆管理中的常见问题](https://u.geekbang.org/lesson/818?article=941182)

## Outline

1. Problem 1: Conversation history lost on process restart
2. Problem 2: Node failures and retry policies
3. Problem 3: Storage node failures and vector index sharding
4. Problem 4: Using memory in no-code tools (Dify)
5. Problem 5: Session ID design pitfalls
6. Summary of common production pitfalls

---

## Problem 1: Conversation History Lost on Process Restart

The default checkpointer in LangGraph uses an **in-memory store** (`InMemorySaver`). This is the most common production pitfall because:

- During development and testing, the process stays alive and history appears to work
- Once the process exits and restarts, all conversation history is wiped
- Official documentation only mentions this in fine print — most developers miss it

**Solution:** Replace `InMemorySaver` with a persistent checkpointer backed by PostgreSQL.

Key implementation notes:
- Install the required Python packages for `psycopg` (PostgreSQL adapter)
- Specify the database connection URI (DB URI)
- Use a **connection pool** to avoid repeated connection creation and pool exhaustion
- Prefer **async** over sync mode — synchronous memory writes can block the process and cause hangs
- Switch from `InMemoryCheckpointer` → `AsyncPostgresSaver` connected via an async connection pool

The official LangGraph docs do provide this solution but it is scattered across multiple pages — the instructor consolidated the correct approach for production use.

---

## Problem 2: Node Failures and Retry Policies

LangGraph nodes (tools, memory writes, etc.) can fail. The framework provides a built-in `retry_policy` mechanism.

**How to configure:**
- Import `retry_policy` from the LangGraph library
- Define conditions under which retry should trigger (e.g., `OperationError`)
- Set `max_retries` (example: 5 attempts) on the node
- Configure exponential backoff: start at 1 second, then 2 seconds, 3 seconds, etc., with a multiplier factor to avoid thundering herd

**Failure scenarios covered:**
- Memory write full (buffer exhaustion)
- Resource unavailable errors
- Transient network errors

**Example flow:**
- Normal result (success) → retry not triggered
- ~40% failure rate → sometimes triggers retry
- ~90% failure rate → almost always triggers retry, falls through to error node after max retries

When max retries are exceeded, the graph transitions to an **error node** that handles the failure gracefully.

---

## Problem 3: Storage Node Failures and Vector Index Sharding (FAISS)

When using FAISS (or similar local vector stores) for long-term memory, running a **single-node, local** index is fragile in production:

- Network jitter between client and server can drop connections
- A single physical node can fail

**Solutions:**

1. **Distributed sharding:** Deploy FAISS across multiple hosts, communicate via socket ports. Use `IVF_FLAT` index type to split the dataset across shards instead of keeping it all in one place.

2. **Replica sets:** Use `index_replicas` parameter when creating the FAISS index to specify the number of replicas (e.g., 2 replicas). Place replicas on different physical hosts.

3. **Periodic persistence:** Call FAISS's `save` function regularly to flush in-memory index data to disk, reducing data loss on node crash.

**Caution with sharding:** Too many shards can cause broadcast storms during node communication — balance shard count against network load.

This mirrors standard database sharding and replication concepts applied to vector storage.

---

## Problem 4: Using Memory in No-Code Tools (Dify)

For teams or companies that restrict custom LangGraph development, Dify provides memory capabilities through its built-in flow types:

- **Workflow**: No memory — stateless execution
- **Chatflow**: Has memory — scoped to the current conversation session. The memory window is the number of conversation turns, configurable in the LLM node settings.

For **global/cross-session memory** within Dify:
- Install the **mem0** plugin from the Dify marketplace
- Flow structure: `Memory Search (mem0)` → `LLM Node` → `Store to mem0`
- This mirrors the manual implementation pattern: retrieve relevant memories before the model, store new memories after
- Requires a **mem0 API key** (data is stored on mem0's servers, max 256MB per account)
- For workflow (non-chatflow) graphs, the memory nodes can be added transparently — the LLM node itself does not need to be aware

This is the "last resort" approach when direct Agent/LangGraph development is not permitted.

---

## Problem 5: Session ID Design Pitfalls

Session IDs (also called "thread IDs" in LangGraph) are a common source of bugs. Two anti-patterns:

### Anti-pattern A: Using raw User ID as Session ID
- If a user opens two browser tabs simultaneously, both tabs share the same session ID
- LangGraph treats them as the same session → conversation histories get mixed/corrupted

### Anti-pattern B: Using pure random UUID as Session ID
- Each session gets a new random ID with no link to the user
- If the user disconnects and reconnects, there is no way to retrieve the original session
- Impossible to maintain continuity or audit user history

**Correct approach: Composite Session ID**

Combine the user ID with additional context:
- `user_id + session_id` (where session_id is a UUID generated at session start)
- `user_id + timestamp + conversation_index`

This ensures:
- The session is traceable back to a specific user (for history retrieval)
- Concurrent sessions from the same user do not collide
- Reconnecting users can recover their session if the composite key is stored

---

## Problem 6: Other Production Considerations (Brief)

- **Tool call failures**: Covered in previous lectures — use retry policies
- **Node-level caching**: Use Redis to cache intermediate results and conversation history to reduce redundant LLM calls
- **Streaming output**: Async streaming responses
- **Observability**: Monitoring and tracing agent execution (mentioned as an upcoming topic)

---

## Key Takeaways

1. **Never use `InMemorySaver` in production** — always switch to a persistent store (PostgreSQL, Redis, etc.)
2. **Always configure retry policies** for nodes that interact with external storage or tools
3. **Vector stores need distributed architecture** for production scale — sharding + replicas + periodic persistence
4. **Session IDs must be composite** (user_id + session_id) — pure user ID causes session collisions; pure random ID breaks history continuity
5. **No-code platforms can integrate long-term memory** via plugins like mem0 when direct LangGraph development is not permitted
6. **Async over sync** for memory operations — sync writes can block the entire agent process

## Connections

- [[065-memory-management]] — previous lecture on memory management fundamentals
- [[langgraph-checkpointers]] — LangGraph checkpointer types
- [[faiss-vector-store]] — FAISS index configuration
- [[mem0-memory-plugin]] — mem0 memory management service
- [[redis-caching]] — Redis for agent caching
- [[retry-policy-patterns]] — retry and error handling patterns in Agents
