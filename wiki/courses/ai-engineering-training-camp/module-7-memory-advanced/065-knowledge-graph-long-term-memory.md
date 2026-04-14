---
tags: [knowledge-graph, long-term-memory, redis, neo4j, langchain, agent, rag, vector-memory, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=941181
---

# Knowledge Graph & Redis for Long-Term Memory Management

Long-term memory in AI agents can be implemented via two complementary approaches beyond simple vector stores: **knowledge graphs** (structured entity-relation networks) and **Redis** (TTL-based hot caching or session history).

## AI Architecture Taxonomy

Four composable (not mutually exclusive) tiers:

| Tier | Definition |
|---|---|
| Workflow | Pre-defined rule execution; deterministic |
| RAG | Vector retrieval + prompt synthesis |
| Agent (智能体) | Autonomous tool-calling + reasoning traces |
| Agentic AI | Multi-agent system with human-in-the-loop |

These categories nest and compose — RAG can be a tool inside an Agent; Agents can form Agentic AI systems.

## Knowledge Graph Memory

Stores information as **entity → relationship → entity** triples rather than text chunks or embeddings.

**Advantages over vector memory:**
- Multi-hop reasoning across relationship chains
- Time-independent; logic-driven (not recency-biased)
- Explicit attribute modelling (entity properties)
- Additive updates without re-embedding

**Example triple set:**
```
Apple -[IS_A]-> Fruit
Apple -[CONTAINS]-> VitaminC
Apple -[CLASSIFIED_AS]-> HealthyFood
Banana -[CLASSIFIED_AS]-> HealthyFood
```

Query: "which entities are HealthyFood?" → traverses edges, returns Apple + Banana.

**Production stack:** [[neo4j-cypher]] with Cypher query language. LangChain provides graph store integrations.

**Beyond memory:** Knowledge graphs can model microservice/container dependency topologies — enabling LLM-driven impact analysis ("who depends on service X?").

## Redis Memory Patterns

### Hot-Answer Cache (Shared)

LLM answers to popular questions are stored under a Redis key with a TTL (e.g., 86400 s). After expiry the key auto-deletes. Suitable for high-traffic, question-stable queries shared across many users — not for per-user personalized memory.

### Per-Session Chat History (LangChain)

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory

history = RedisChatMessageHistory(session_id="abc", url="redis://localhost:6379")
history.add_user_message("Hello")
history.add_ai_message("Hi!")
history.clear()
```

Requires `pip install langchain-community redis`.

### Critical Gotcha: Redis Search Module

`RedisChatMessageHistory` requires the **RedisSearch** module, which is **not** bundled with standard Redis. Must be compiled from source and loaded:

```bash
redis-server --loadmodule /path/to/redisearch.so
```

Or use Docker images that include the module (e.g., `redis/redis-stack`).

## Key Tradeoffs

| | Vector Memory | Knowledge Graph | Redis Cache |
|---|---|---|---|
| Best for | Semantic similarity | Relational reasoning | Hot/shared answers |
| Retrieval | Cosine distance | Graph traversal | Exact key lookup |
| Update cost | Re-embed chunks | Insert node/edge | Overwrite key |
| Expiry | Manual | Manual | Native TTL |

## Related

- [[mem0-memory-library]] — managed long-term memory alternative
- [[langchain-integration]] — provides both Neo4j and Redis integrations
- [[multi-agent-systems]] — Agentic AI pattern with per-agent memory isolation
