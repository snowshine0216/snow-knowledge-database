---
tags: [knowledge-graph, long-term-memory, redis, neo4j, langchain, agent, rag, vector-memory, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=941181
wiki: wiki/concepts/065-knowledge-graph-long-term-memory.md
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. How does a knowledge graph store information differently from a vector database, and what kind of queries does each handle better?
2. What is Redis TTL (Time-To-Live), and how might it be useful for caching LLM-generated answers?
3. In AI system design, what distinguishes an "Agent" from a "RAG" system — specifically around how each uses memory and tools?

---

# 065: Knowledge Graph & Redis for Long-Term Memory Management

**Source:** [2基于知识图谱的长期记忆管理与redis](https://u.geekbang.org/lesson/818?article=941181)

## Outline

1. Clarifying AI Architecture Concepts (Workflow vs. RAG vs. Agent vs. Agentic AI)
2. Knowledge Graph as Long-Term Memory
   - Entity-Relation model
   - Advantages over vector-based memory
   - Demo: storing and querying fruit knowledge graph
   - Production use: Neo4j vs. JSON prototype
   - Beyond memory: business topology use cases
3. Redis for Long-Term Memory
   - Complex approach: manual TTL-based hot-answer caching
   - Simple approach: LangChain `RedisChatMessageHistory`
   - Redis Search module requirement

---

## Section 1: AI Architecture Concepts Clarified

The instructor opened by answering a student question about how to distinguish four commonly confused AI architecture terms.

| Concept | Core Characteristic | Memory Type |
|---|---|---|
| **Workflow** | Pre-defined rules, deterministic execution | Conversation history (optional) |
| **Chat Flow** | Workflow + built-in memory window | Conversation turns |
| **RAG** | Vector retrieval → answer synthesis | Retrieved context + history |
| **Agent (智能体)** | Model with autonomous tool-calling and reasoning | Tool results + reasoning traces |
| **Agentic AI (Multi-Agent)** | Multiple agents + human-in-the-loop | Per-agent isolated memories |

Key insight: these are not strictly disjoint. Agentic AI can embed RAG as a tool; any system can add memory. The boundaries are fuzzy and use-case driven.

---

## Section 2: Knowledge Graph for Long-Term Memory

### Concept Overview

Knowledge graphs store information as **entities and relationships** — not raw text or vectors. Example:

- Entity: `Apple` (type: `Fruit`)
- Attribute: `contains` → `Vitamin C`
- Relationship: `Apple` and `Banana` → both classified as `HealthyFood`

This structure allows multi-hop reasoning (e.g., "which fruits are healthy foods?") without relying on semantic similarity.

### Advantages over Vector-Based Memory

| Dimension | Vector Memory | Knowledge Graph |
|---|---|---|
| Retrieval method | Semantic similarity (cosine distance) | Structural traversal + relationship lookup |
| Time sensitivity | Often time-ordered | Time-independent; logic-driven |
| Multi-hop reasoning | Weak | Strong |
| Dynamic updates | Re-embed required | Additive node/edge insertion |

### Demo Walkthrough

The demo stored fruit facts into a JSON-based knowledge graph (prototype, not production):

```
Store: "Apple is a fruit, rich in Vitamin C"
→ Node: Apple (type: Fruit)
→ Edge: Apple -[CONTAINS]-> VitaminC
→ Edge: Apple -[CLASSIFIED_AS]-> HealthyFood

Store: "Banana is also a healthy food"
→ Node: Banana (type: Fruit)
→ Edge: Banana -[CLASSIFIED_AS]-> HealthyFood

Query: "Tell me about Apple"
→ Returns: Apple is a fruit, contains Vitamin C, classified as healthy food

Query: "What fruits do we have?"
→ Returns: Apple, Banana
```

> Note: The demo used JSON storage for simplicity. The instructor explicitly said the demo code is AI-generated and not a reference implementation — understand the concept, not the code.

### Production Recommendation

Use **Neo4j** (graph database) with **Cypher** query language instead of JSON. LangChain provides Neo4j integrations.

### Beyond Memory: Business Topology Use Case

Knowledge graphs can model infrastructure dependencies:

- Entities: containers / microservices
- Relationships: `DEPENDS_ON`, `CALLS`, `DEPLOYED_ON`
- Use case: ask the LLM "if I shut down service X, who is affected?" — the graph answers via relationship traversal, not text search.

---

## Section 3: Redis for Long-Term Memory

### Use Case: Hot-Answer Caching

Redis is well-suited for caching frequently-asked questions and their LLM-generated answers, with automatic expiry.

Pattern:
1. User asks a popular question (e.g., "What are Yang Zhenning's major scientific achievements?")
2. LLM generates answer → stored in Redis under a key
3. TTL set (e.g., 86400 seconds = 24 hours) — Redis auto-deletes after expiry
4. Subsequent users with the same question get the cached answer without re-querying the LLM

This is **not** per-user conversational memory — it is a **shared hot-cache** across users.

### Approach 1: Manual Implementation (Complex)

```python
# Connect to Redis on localhost:6379
# Store message with TTL
redis_client.set(key, message, ex=86400)
# Retrieve; returns None after TTL expires
value = redis_client.get(key)
```

### Approach 2: LangChain `RedisChatMessageHistory` (Simple)

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory

history = RedisChatMessageHistory(
    session_id="user-session-123",
    url="redis://localhost:6379"
)

history.add_user_message("Hello")
history.add_ai_message("Hi there!")

# Search messages
history.search_messages("keyword")

# Clear history
history.clear()
```

Install dependencies:
```bash
pip install langchain-community redis
```

### Critical: Redis Search Module Requirement

Standard Redis does **not** include the search module by default. Without it, `RedisChatMessageHistory` will fail.

To enable:
1. Download `RedisSearch` module from GitHub
2. Compile with `make`
3. Load via: `redis-server --loadmodule /path/to/redisearch.so`

This is not documented in the official LangChain docs — the instructor flagged it as a common gotcha.

---

## Key Takeaways

1. **Knowledge graphs** complement vector memory by encoding structured entity-relationship networks — better for multi-hop reasoning, logic-driven retrieval, and dynamic knowledge evolution.
2. **Neo4j + Cypher** is the production choice for knowledge graph storage; JSON prototypes are for learning only.
3. **Redis** serves two memory roles: (a) hot-answer cache with TTL for shared popular queries; (b) per-session chat history via LangChain's `RedisChatMessageHistory`.
4. **Redis Search module** must be manually compiled and loaded — not included in standard Redis distributions.
5. The four AI architecture tiers (Workflow → RAG → Agent → Agentic AI) are fuzzy, composable categories, not strict silos.

## Connections

- [[mem0-memory-library]] — alternative managed long-term memory solution mentioned in course context
- [[langchain-integration]] — LangChain provides both Neo4j graph store and Redis chat history integrations
- [[vector-memory-vs-knowledge-graph]] — tradeoff analysis between embedding-based and graph-based retrieval
- [[redis-caching-patterns]] — TTL-based caching strategy for LLM hot answers
- [[neo4j-cypher]] — graph database and query language for production knowledge graph deployments
- [[multi-agent-systems]] — Agentic AI / MAS pattern referenced in architecture overview


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why a knowledge graph is better than vector memory for multi-hop reasoning. Use the fruit example from the demo to illustrate.
2. Describe the two Redis memory patterns covered in this lesson — what problem each solves, and how they differ in scope (per-user vs. shared).
3. What is the Redis Search module gotcha, and why does it matter when using `RedisChatMessageHistory` in LangChain?

<details>
<summary>Answer Guide</summary>

1. Knowledge graphs store entities and relationships as nodes and edges (e.g., `Apple -[CLASSIFIED_AS]-> HealthyFood`), enabling structural traversal across multiple hops — like finding all fruits classified as healthy. Vector memory relies on semantic similarity (cosine distance), which is weak at following logical relationship chains across multiple steps.

2. The hot-answer cache uses Redis TTL (e.g., 86400 s) to store popular LLM responses shared across all users — when the same question recurs, the cached answer is returned without re-querying the LLM. `RedisChatMessageHistory` is per-session conversational memory tied to a `session_id`, storing individual turn history for a specific user.

3. Standard Redis does not include the Search module by default; without it, `RedisChatMessageHistory` will fail at runtime. The module must be manually downloaded, compiled with `make`, and loaded via `redis-server --loadmodule /path/to/redisearch.so` — a step not documented in the official LangChain docs.

</details>
