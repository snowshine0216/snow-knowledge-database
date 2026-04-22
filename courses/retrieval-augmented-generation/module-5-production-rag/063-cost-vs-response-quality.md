---
tags: [rag, cost-optimization, production, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/ssvq8m/cost-vs-response-quality
---

## Pre-test

1. What are the two largest cost drivers in a typical production RAG application?
2. How does quantization relate to reducing LLM inference costs?
3. What is multi-tenancy in the context of vector databases, and why does it help control storage costs?

---

# Lecture 063: Cost vs Response Quality

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/ssvq8m/cost-vs-response-quality

## Outline

1. [Introduction: Scaling and Budget Reality](#introduction-scaling-and-budget-reality)
2. [Reducing LLM Costs: Smaller Models](#reducing-llm-costs-smaller-models)
3. [Reducing LLM Costs: Token Efficiency](#reducing-llm-costs-token-efficiency)
4. [Dedicated Hardware vs. Managed Inference Endpoints](#dedicated-hardware-vs-managed-inference-endpoints)
5. [Vector Database Storage Tiers](#vector-database-storage-tiers)
6. [Multi-Tenancy as a Cost Control Pattern](#multi-tenancy-as-a-cost-control-pattern)

---

## Introduction: Scaling and Budget Reality

When you first build a RAG system, the focus is naturally on getting things working — finding the right retrieval strategy, tuning chunk sizes, and confirming that the LLM can leverage retrieved context effectively. At prototype scale, cost is rarely the first concern. But as traffic grows from tens of requests to thousands or millions per day, cost considerations move from background noise to center stage.

The two largest cost drivers in a typical production RAG application are the **large language model** (LLM) and the **vector database**. Both are billed in ways that scale with usage: LLMs typically charge per token (prompt tokens plus completion tokens), while vector databases charge based on the amount and type of memory their indexes occupy. Understanding these billing dimensions gives you leverage to make deliberate trade-offs.

Cost optimization is not about cutting corners on quality — it is about identifying where spending additional resources does *not* produce proportionally better user outcomes, and redirecting that spend accordingly. A robust [[062-quantization]] pipeline and a thoughtful tiered-storage strategy can often reduce operational costs by 40–80% with negligible degradation in answer quality.

---

## Reducing LLM Costs: Smaller Models

The most direct lever for LLM cost reduction is model selection. Larger models — those with more parameters and higher precision weights — tend to produce higher quality outputs, but they cost significantly more per token. The practical question is not "which model is best in a vacuum?" but "what is the smallest model that is good enough for my task?"

Two mechanisms produce smaller, cheaper models:

**Fewer parameters from the outset.** Model families typically span a range of sizes. GPT-4o and Claude Sonnet sit at the larger end; smaller variants like Haiku, Phi-3 Mini, or Mistral 7B contain far fewer parameters and therefore run faster and cost less. The gap in quality is real but often narrower than expected, especially for narrow, well-defined tasks such as extractive question answering over retrieved context.

**Quantization.** Even a model with a fixed parameter count can be made cheaper to run by representing its weights at lower numeric precision — for example, from 32-bit floating point down to 8-bit integer (INT8) or even 4-bit (INT4). As covered in [[062-quantization]], quantized models fit into smaller GPU footprints, enabling deployment on cheaper hardware and faster inference. The quality penalty depends on how aggressively you quantize and how demanding the task is.

A key insight is that **fine-tuning a small model on task-specific data** can often match or exceed a large general-purpose model on a narrow task, at a fraction of the inference cost. If your RAG system always answers a constrained domain of questions — customer support for a specific product, for instance — a fine-tuned 7B model may outperform a 70B base model while costing ten times less per token. Refer to [[045-choosing-your-llm]] for guidance on the evaluation framework to use when comparing candidate models.

---

## Reducing LLM Costs: Token Efficiency

Beyond model selection, the volume of tokens you send and receive is directly controllable. RAG prompts grow quickly because they concatenate retrieved passages alongside the user question and any system-level instructions. If you retrieve ten chunks of 500 tokens each, you have added 5,000 tokens to every prompt before any system prompt or output.

**Reduce top-k.** The simplest intervention is to retrieve fewer documents. If your current `top_k` setting is 10 and quality remains high at `top_k=5`, you have halved your context window overhead per query. This requires empirical testing: examine whether precision and recall of relevant facts drops when you cut retrieval count, and cross-reference with your quality metrics.

**Encourage concise outputs.** Many LLMs default to verbose responses. Since you pay for every generated token, instructing the model via system prompt to give direct, concise answers can materially reduce output token costs. Some implementations set a hard `max_tokens` ceiling; this is effective for use cases where answers are naturally short (yes/no, structured extractions) but risky when occasionally longer answers are warranted.

**Prompt compression.** Advanced techniques can further reduce input token counts — compressing retrieved chunks by removing boilerplate, applying extractive summarization before inserting context, or using a small "filter" LLM to remove low-relevance chunks before passing them to the main model.

In all cases, the discipline is the same: **change one variable at a time, measure the impact on both cost and quality, and accept the trade-off only if quality loss is within acceptable bounds.** This requires a solid observability pipeline — without the ability to monitor per-query costs and track quality metrics over time, you are optimizing blind.

---

## Dedicated Hardware vs. Managed Inference Endpoints

Cloud LLM providers — Together AI, AWS Bedrock, Google Vertex, Anyscale, and others — offer managed inference endpoints billed per token. These endpoints are the sensible default when building prototypes: no infrastructure to manage, instant access to state-of-the-art models, and automatic scaling.

As request volume grows, per-token pricing can become expensive. At sufficient scale, an alternative pricing model — **dedicated hardware** — becomes attractive. With dedicated hardware, you lease GPU capacity by the hour. You are responsible for hosting and serving the model, but you are not metered per token. The economic crossover point depends on your model size, the hardware tier, and your requests-per-hour volume; as a rule of thumb, the breakeven is usually somewhere in the range of tens of thousands of requests per day for mid-size models.

Dedicated endpoints carry a secondary benefit: **reliability**. Shared inference endpoints serve traffic from many tenants simultaneously; your latency can spike when neighbors have heavy workloads. With dedicated hardware, no other tenant's traffic competes with yours, making P99 latency more predictable — an important property in latency-sensitive applications.

The trade-off is operational complexity: you must manage capacity planning, handle model updates, and monitor hardware health. For most early-stage products, managed endpoints remain the better choice; dedicated hardware is typically reserved for mature products with sustained high traffic.

---

## Vector Database Storage Tiers

Vector databases introduce a different cost dimension: storage. Unlike per-token LLM billing, vector database costs depend on how much data you store and — crucially — **which memory tier** that data occupies.

Three tiers are commonly available:

| Tier | Speed | Cost per GB | Typical use |
|------|-------|-------------|-------------|
| RAM | Fastest | Highest | Live HNSW indexes |
| Disk (SSD/NVMe) | Moderate | Moderate | Frequently accessed document payloads |
| Cloud object storage | Slowest | Lowest | Archived or rarely accessed data |

RAM is often several times more expensive per gigabyte than disk, and disk is several times more expensive than cloud object storage. Keeping large volumes of data in RAM when it is not actively needed is the single most common cause of inflated vector database bills.

The practical guidance is to **store only what benefits from RAM in RAM.** The HNSW (Hierarchical Navigable Small World) index — the data structure that enables approximate nearest-neighbor search — must reside in RAM to deliver low-latency queries. However, the raw document text (your chunk payloads) does not need to be in RAM; it is only fetched once a candidate document is identified, and even a few hundred milliseconds of disk latency is acceptable at that point.

A tiered layout therefore looks like: HNSW index in RAM → frequently accessed payloads on disk → historical or low-access payloads in cloud object storage. Many managed vector databases (Weaviate, Qdrant, Pinecone) expose configuration options for this tiering explicitly.

---

## Multi-Tenancy as a Cost Control Pattern

Multi-tenancy — the practice of partitioning your vector database by the user or organization that owns each document — is both a security requirement and a cost optimization tool.

Consider a system with one million documents owned by one thousand distinct users. If all documents were stored in a single shared namespace with a single HNSW index loaded in RAM at all times, you would pay for RAM to hold all one million document vectors continuously, even though each individual user is only active for a fraction of the day.

With multi-tenancy, each user has their own HNSW index that can be loaded and unloaded independently. This enables several cost-saving behaviors:

- **Lazy loading:** Load a tenant's vectors into RAM only when that tenant logs in or initiates a query session. When idle, their index stays on disk.
- **Time-zone-aware tiering:** A system serving global users might keep European tenant data in hot storage during European business hours, then move it to cold storage overnight, when European users are inactive.
- **Proportional billing to high-volume tenants:** In a SaaS context, multi-tenancy makes it straightforward to correlate infrastructure costs to individual accounts, enabling accurate per-tenant billing.

Multi-tenancy thus transforms a binary "keep everything hot or keep everything cold" decision into a fine-grained, dynamic scheduling problem. The mechanism is simple — data is moved between storage tiers — but the organizational structure of having data partitioned by tenant is what makes efficient scheduling tractable.

---

## Post-test

1. A production RAG system currently uses `top_k=10` with 500-token chunks and a large LLM. You want to reduce costs by at least 50% without deploying new infrastructure. What are two concrete, independent changes you could make, and what quality risk does each carry?

2. Explain the economic argument for switching from a managed per-token inference endpoint to a dedicated GPU endpoint. At what kind of traffic level does the switch typically make sense, and what operational burden does it introduce?

3. In a multi-tenant vector database serving 5,000 user accounts, why is it wasteful to keep all HNSW indexes loaded in RAM simultaneously? Describe a strategy that maintains good query latency for active users while minimizing RAM usage.

> [!example]- Answer Guide
> 
> #### Q1 — Reducing Costs Without New Infrastructure
> 
> - **Reduce top_k from 10 to 5**: Halves the number of retrieved chunks per query, cutting prompt token count by roughly 2,500 tokens per request. Risk: if relevant information is sometimes only in chunks ranked 6–10, recall drops and answer completeness suffers. Mitigate by running offline evaluation against a held-out QA set.
> - **Add a system prompt instruction for concise answers / set max_tokens**: Reduces output token count. Risk: for queries that genuinely require long explanations, truncating the response degrades quality or leaves answers incomplete. Mitigate by setting max_tokens generously (e.g. 512) rather than very tight (e.g. 128), and monitoring user satisfaction signals.
> - Other valid answers: switch to a smaller model, apply prompt compression, reduce chunk size.
> 
> #### Q2 — Managed vs. Dedicated Endpoint Economics
> 
> Per-token pricing scales linearly with usage; hourly GPU pricing is fixed regardless of request volume. At low traffic, managed endpoints are cheaper because you are not paying for idle capacity. As requests-per-hour grows, the hourly rate divided by requests per hour drops, and eventually falls below the per-token managed endpoint price. The crossover is typically in the range of tens of thousands of requests per day for mid-size models (depends heavily on model size and GPU tier). Operational burden: you must manage model serving infrastructure, capacity planning, model updates, and hardware monitoring — none of which are needed with managed endpoints.
> 
> #### Q3 — Multi-Tenant HNSW RAM Efficiency
> 
> If all 5,000 HNSW indexes are loaded simultaneously but typical concurrent active users at any moment is, say, 50, then 99% of the RAM allocated to HNSW indexes is serving idle tenants. With multi-tenancy, implement lazy loading: when a user initiates a session, load their HNSW index from disk into RAM; when the session ends (or after a configurable idle timeout), evict the index back to disk. Active tenants experience normal low-latency vector search; inactive tenants pay no RAM cost. For known high-traffic periods (e.g. business hours by region), you can pre-warm indexes preemptively to avoid cold-start latency on first query.
