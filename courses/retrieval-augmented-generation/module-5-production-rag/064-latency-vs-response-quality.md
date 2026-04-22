---
tags: [rag, latency, optimization, production, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/99emrt/latency-vs-response-quality
---

## Pre-test

1. In a RAG pipeline, which component is most responsible for end-to-end latency — the vector database retrieval step or the LLM generation step?
2. What is semantic caching, and under what conditions does it offer the greatest latency benefit?
3. If you remove a query-rewriting step from a RAG pipeline to save latency, what metric should you measure first to confirm the trade-off is acceptable?

---

# Lecture 064: Latency vs Response Quality

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/99emrt/latency-vs-response-quality

## Outline

1. [The Core Trade-off](#the-core-trade-off)
2. [Context Determines the Target](#context-determines-the-target)
3. [Transformers as the Primary Latency Source](#transformers-as-the-primary-latency-source)
4. [Strategies to Reduce LLM Latency](#strategies-to-reduce-llm-latency)
5. [Trimming Other Transformer-Based Components](#trimming-other-transformer-based-components)
6. [Reducing Retriever Latency](#reducing-retriever-latency)

---

## The Core Trade-off

Every production RAG system must balance two competing objectives: how fast it responds and how good that response is. Latency is defined as the wall-clock time a user waits from submitting a query to receiving a complete answer. Response quality encompasses accuracy, completeness, relevance, and faithfulness to the retrieved context.

Adding a retriever to a vanilla LLM system already introduces some latency — the system must embed the query, search an index, and supply the retrieved chunks alongside the prompt before generation begins. As you layer in quality-improving components such as query rewriters, cross-encoder re-rankers, or multi-hop agentic loops (see [[057-what-makes-production-challenging]]), the latency budget grows further. Each new component adds value but also adds time.

Neither pole of the spectrum is universally correct. The relationship between latency and quality is not fixed — it is a design parameter you tune based on the requirements of your application and the expectations of your users.

---

## Context Determines the Target

Before reaching for any optimization technique, the first step is to understand how much latency your particular application can tolerate. This is a product and business question, not an engineering one.

Consider two contrasting examples. An e-commerce site's item recommendation feature competes for attention with every other element on the page; research consistently shows that users abandon slow-loading pages within seconds. For that use case you would accept a slightly imperfect recommendation in exchange for a sub-200 ms response. Conversely, a RAG system that helps clinicians diagnose rare diseases is used in a context where the cost of an incorrect answer far exceeds the cost of a few extra seconds of processing time. There, you would invest in re-ranking, multi-step reasoning, and verification loops even if that pushes latency toward several seconds.

Establishing your latency budget early prevents over-engineering. There is no point spending weeks shaving 100 ms off a pipeline whose users are already satisfied with 1.5 second responses. Similarly, adding a fast but shallow retrieval strategy to a medical application because it "feels slow" could introduce patient safety risks.

---

## Transformers as the Primary Latency Source

Once you have set a latency target, diagnosing where time is actually spent becomes critical. A useful heuristic from the lecture is: almost all RAG pipeline latency comes from running a transformer. This single observation dramatically simplifies the optimization search space.

Vector databases have matured to the point where approximate nearest-neighbor search over millions of embeddings typically completes in single-digit milliseconds. Modern managed vector stores are highly parallelised, cache hot index segments in memory, and are designed from the ground up for low-latency search. Unless your database is severely under-provisioned or your index is enormous, retrieval is rarely the bottleneck.

By contrast, autoregressive decoding in a large language model is inherently sequential — each output token depends on all previous tokens, limiting parallelism. A model with tens of billions of parameters running on shared GPU infrastructure can easily consume hundreds of milliseconds per generation. If your pipeline contains multiple LLM calls (e.g., a router LLM, a query rewriter, the main generation model, and a self-critique step), these costs compound. The same logic applies to cross-encoder re-rankers that use a transformer to score each candidate passage: fast individually but significant when scoring dozens of passages.

With observability tooling in place (see [[057-what-makes-production-challenging]]), you can confirm this empirically by timing each stage. In virtually every well-instrumented RAG pipeline, LLM calls will account for 80 to 95 percent of total latency.

---

## Strategies to Reduce LLM Latency

Given that the LLM is the dominant cost centre, this is where optimization efforts should begin.

**Switch to a smaller model.** Smaller open-weight models and quantized variants of larger models run faster on the same hardware, provided sufficient memory is available for the model weights and KV cache. A 7B-parameter model will decode significantly faster than a 70B model; an 8-bit quantized model will decode faster than its full-precision counterpart. The relevant question is whether the smaller model maintains acceptable response quality on your task — which is why pairing this change with a rigorous evaluation suite (see [[063-cost-vs-response-quality]]) is essential.

**Use a router LLM.** Rather than sending every query through your most capable and slowest model, introduce a lightweight router that classifies each incoming query by complexity. Simple factual lookups, greeting-style exchanges, or queries that can be answered with minimal reasoning are routed to a small, fast model. Only queries that require complex multi-step reasoning or synthesis across many documents are forwarded to the large model. This keeps average latency low while preserving quality for the queries that genuinely need it. The router itself should be small enough that its overhead does not cancel out the savings.

**Implement semantic caching.** Many production RAG deployments receive a long tail of semantically similar queries. A customer support bot, for instance, may receive dozens of slight variations of "how do I reset my password?" each day. Semantic caching stores recent prompt-response pairs and computes embedding similarity between each new incoming query and the cached entries. If a close enough match is found — typically determined by a cosine similarity threshold — the cached response is returned immediately, bypassing the retrieval and generation steps entirely. The result can be an order-of-magnitude latency reduction for the fraction of traffic that hits the cache.

For applications that need mild personalization despite caching, a hybrid approach works well: retrieve the nearest cached response and feed both the cached answer and the live user prompt to a small, fast LLM that makes minimal adjustments to the wording. This preserves most of the latency benefit while injecting just enough contextual relevance to satisfy the user.

Tuning the similarity threshold is the central challenge of semantic caching. A threshold that is too loose returns incorrect cached answers; one that is too tight provides few cache hits. Measure cache hit rate and response quality together to find the sweet spot for your workload. See also [[045-choosing-your-llm]] for guidance on selecting models suited to different pipeline roles.

---

## Trimming Other Transformer-Based Components

After addressing the core generation model, turn your attention to the supporting transformer-based components in the pipeline. Common candidates include:

- **Query rewriters** — transform the raw user query into a better search string, often using an LLM call.
- **Cross-encoder re-rankers** — re-score candidate passages from the first-stage retriever using a transformer to push the most relevant chunks to the top.
- **Router LLMs** — already discussed above, but the router itself contributes latency and should be kept as small as possible.
- **Agentic sub-calls** — tool-calling loops where the LLM iteratively selects actions and processes results.

The key insight is that each component's latency cost must be weighed against its incremental quality benefit. You should measure both metrics in isolation: first establish a baseline for your core LLM without the component, then add the component and re-evaluate quality. If a query rewriter raises retrieval precision by only a few percentage points but adds 300 ms of latency, the trade-off may not be worthwhile. On the other hand, a re-ranker that substantially improves answer faithfulness at the cost of 100 ms may be well worth keeping.

This analysis requires a robust evaluation framework with clear quality metrics — RAGAS scores, answer correctness, hallucination rate — so that you are comparing numbers rather than intuitions. Remove components whose measured benefit does not justify their latency cost, and keep the ones that do. This process is inherently iterative and should be revisited whenever query distributions shift or new model options become available.

---

## Reducing Retriever Latency

While retrieval is rarely the primary bottleneck, at scale it can still contribute meaningfully, and there are clean engineering solutions to address it.

**Binary-quantized embeddings.** Standard dense embeddings are stored as 32-bit or 16-bit floating-point vectors. Binary quantization maps each embedding dimension to a single bit (positive → 1, negative → 0), compressing a 768-dimensional float vector from 3 KB to around 96 bytes. Distance calculations over binary vectors use fast bitwise XOR and popcount operations rather than floating-point arithmetic, yielding significantly faster search. The trade-off is a small drop in retrieval precision that must be validated against your quality requirements. Many vector database providers expose binary quantization as a first-class option.

**Sharding.** As a knowledge base grows — from millions to hundreds of millions of documents — a single vector index instance may become a throughput bottleneck. Horizontal sharding distributes the index across multiple independent instances, allowing searches to run in parallel against each shard and merge results. Most managed vector database services handle sharding automatically or offer it as a configuration option. This mirrors the standard approach to scaling any database and does not require changes to application code beyond connection configuration.

These retriever-level optimizations are additive: you can apply both together. In practice, the gains from retriever optimization are most noticeable at large scale; for typical RAG deployments with document counts in the low millions, they will have minimal impact relative to LLM-level savings.

---

## Post-test

1. You have a RAG pipeline whose p95 latency is 2.4 seconds. Instrumentation shows that 1.9 seconds is spent in the main generation LLM call, 0.3 seconds in a cross-encoder re-ranker, and 0.2 seconds in vector retrieval. In what order should you attempt optimizations, and why?
2. A semantic cache is returning stale answers to users because the similarity threshold is too low. What is the correct direction to adjust the threshold, and what secondary metric should you track to confirm the adjustment is working?
3. Describe a scenario in which removing a query-rewriting component from a RAG pipeline would be the wrong optimization choice even if it measurably reduces latency.

> [!example]- Answer Guide
> 
> #### Q1 — Optimize by Largest Latency First
> 
> Start with the main generation LLM (1.9 s, the largest contributor) — try a smaller or quantized model, or a router to direct simple queries to a faster model. Next, evaluate the cross-encoder re-ranker (0.3 s) by measuring its incremental quality benefit; if the gain is small, consider removing it or replacing it with a lighter bi-encoder re-ranker. Address retrieval (0.2 s) last and only if the above changes are insufficient, since it is already the smallest share of latency. This ordering follows the heuristic: optimize transformers first, largest cost centre first.
> 
> #### Q2 — Correcting Semantic Cache Threshold
> 
> The threshold is too low (too permissive), causing semantically distant queries to be treated as matches. Raise the threshold to require higher similarity before serving a cached response. Track cache hit rate alongside answer correctness or user satisfaction — a higher threshold will reduce hit rate, so the goal is to find the point where hit rate is still meaningful but wrong-answer rate is negligible.
> 
> #### Q3 — When Query Rewriting Stays Justified
> 
> If the user query distribution contains many ambiguous, misspelled, or semantically underspecified queries that rely on the rewriter to map them to well-formed retrieval strings, removing the rewriter will cause a significant drop in retrieval precision and answer quality. For example, a domain-specific knowledge base where users write informal shorthand (e.g., "how 2 fix err 503 prod svc") would produce poor embeddings without rewriting. In this scenario, the latency cost of the rewriter is justified by the quality it enables.
