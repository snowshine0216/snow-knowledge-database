---
tags: [rag, evaluation, production, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/llxcw6/implementing-rag-evaluation-strategies
---

## Pre-test

1. What are the two primary dimensions used to classify RAG evaluation metrics, and what does each dimension describe?
2. Why are code-based evaluations considered the cheapest type, and what is an example of one applied to a production RAG system?
3. What distinguishes LLM-as-a-judge from human feedback as an evaluation approach, and what is one known limitation of the LLM-as-a-judge method?

---

# Lecture 058: Implementing RAG Evaluation Strategies

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/llxcw6/implementing-rag-evaluation-strategies

## Outline

1. [Why Observability Matters in Production RAG](#why-observability-matters-in-production-rag)
2. [The Four Pillars of an Observability Platform](#the-four-pillars-of-an-observability-platform)
3. [Two Dimensions of Evaluation: Scope and Evaluator Type](#two-dimensions-of-evaluation-scope-and-evaluator-type)
4. [Code-Based, Human, and LLM-as-a-Judge Evaluators](#code-based-human-and-llm-as-a-judge-evaluators)
5. [Putting It Together: A Practical Starter Metrics Grid](#putting-it-together-a-practical-starter-metrics-grid)
6. [Design Trade-offs and Next Steps](#design-trade-offs-and-next-steps)

---

## Why Observability Matters in Production RAG

Deploying a RAG system into production is not a one-time event — it is the beginning of an ongoing engineering discipline. Once real users start sending queries, you need answers to questions that offline benchmarks cannot provide: Is the system fast enough under load? Are the retrieved documents still relevant as the knowledge base grows? Are users satisfied with the generated answers?

Without a deliberate observability strategy, teams are flying blind. They may notice that something is wrong only after user complaints escalate, and they will lack the data needed to pinpoint the root cause. A robust observability system closes this gap by continuously collecting the signals that allow engineers to detect problems early, trace their origin to a specific component, and measure the effect of any fix before it is rolled out broadly.

This lesson focuses on designing that observability system — what information to collect, how to classify it, and how to combine cheap automated metrics with more expensive but richer human and model-based signals into a coherent evaluation strategy.

---

## The Four Pillars of an Observability Platform

A well-designed RAG observability platform rests on four distinct capabilities.

**Software performance metrics** are the same telemetry you would instrument in any production service: latency (end-to-end and per component), throughput (requests per second), memory consumption, and compute utilization (including tokens generated per second). These numbers answer the question "how is the system operating?" before any question about quality is asked. They are cheap to collect, fully automated, and deterministic.

**Quality metrics** answer a different question: "Is the system producing good results?" Quality spans a wide range — from whether a retrieved passage is topically relevant to a query, to whether the final answer is factually grounded, to whether users actually found the response helpful. Because quality is inherently subjective and context-dependent, measuring it typically requires either human judgment or a model capable of approximating that judgment (see [[050-evaluating-your-llms-performance]]).

**Aggregate statistics over time** give you the high-level trend view. Rolling averages and percentile distributions let you see whether overall latency is creeping up, whether user satisfaction has dropped since the last deployment, or whether retrieval recall spiked after you updated the embedding model. Trends are only visible if you store historical data rather than looking only at the current moment.

**Detailed logs** complement aggregate statistics by recording the full context of individual requests: the original query, the retrieved documents, the prompt sent to the LLM, and the final response. When a particular query produces a bad answer, logs let you replay the entire pipeline step by step to understand exactly where things went wrong — an invaluable capability for debugging that cannot be replaced by aggregate statistics alone.

Finally, a mature observability system should support **experimentation**. Before committing to a new LLM, a revised system prompt, or a different retriever configuration, you want to either run the change in a sandboxed environment or conduct an A/B test with a subset of real users. The observability infrastructure provides the metrics you need to decide whether the experimental configuration outperforms the baseline.

---

## Two Dimensions of Evaluation: Scope and Evaluator Type

Not all evaluation metrics serve the same purpose. A useful conceptual framework organizes them along two orthogonal dimensions: **scope** and **evaluator type**. Thinking of these dimensions as forming a two-dimensional grid helps you ensure you have coverage across all the cells that matter for your system.

**Scope** describes which part of the system a metric is measuring.

- *System-level* evaluations measure the RAG pipeline as a whole and are best suited for surfacing high-level trends — for example, overall end-to-end latency or aggregate user satisfaction. They tell you that something is wrong but rarely tell you where.
- *Component-level* evaluations target individual building blocks: the retriever, the reranker, the LLM, or the prompt construction layer. They are the diagnostic instruments you reach for once a system-level metric flags a problem. If overall latency is unacceptably high, component-level latency metrics will tell you whether the bottleneck is the vector database lookup, the LLM inference call, or the post-processing step.

This distinction maps cleanly onto the practice of root-cause analysis: system-level metrics catch regressions; component-level metrics localize them. See also [[023-evaluating-retrieval]] for a deeper treatment of retriever-specific metrics.

**Evaluator type** describes how a metric is generated.

- *Code-based* — fully automated, deterministic, and nearly free.
- *Human feedback* — the ground truth, but expensive and slow to accumulate.
- *LLM as a judge* — a middle ground: more flexible than code, cheaper than humans, but requiring careful calibration.

The following section examines each evaluator type in detail.

---

## Code-Based, Human, and LLM-as-a-Judge Evaluators

**Code-based evaluations** are the foundation of any observability system because they cost almost nothing to collect and run continuously in production. Examples range from simply counting requests per second to running unit tests that verify the LLM is returning syntactically valid JSON. The key property is that these evaluations are fully deterministic: given the same input, they always produce the same score. This makes them reliable for tracking regressions over time.

The limitation of code-based evals is expressiveness. They excel at measuring things that can be defined precisely — speed, token counts, schema compliance — but they cannot assess whether an answer is semantically relevant or whether the retrieved context actually supports the claim in the response.

**Human feedback** is the most informative evaluator type but also the most expensive. At its simplest, it takes the form of a thumbs-up / thumbs-down widget in the product UI. Even this minimal signal is valuable: a sudden increase in thumbs-down ratings is a reliable early warning that something has degraded. Richer feedback channels — free-text comment boxes, detailed rating rubrics — provide more diagnostic information at greater cost.

Human annotation is also required to construct ground-truth datasets for offline evaluation. To measure retrieval recall and precision, for instance, you need a curated set of (query, relevant-document) pairs. A human must compile that dataset. Once it exists, the retrieval evaluation itself can be automated and run cheaply at any time — but the human investment at the front end should not be forgotten when accounting for the true cost of the metric.

**LLM as a judge** occupies the space between the two extremes. A secondary language model is prompted to evaluate some aspect of the primary system's output: Is this retrieved passage relevant to the query? Does the answer faithfully cite the provided context? Is the response relevant to what the user asked? This approach is more flexible than code — it can handle open-ended text — and is dramatically cheaper than gathering human annotations at scale.

LLM-as-a-judge evaluations require careful tuning, however. Research has documented that models tend to exhibit a **self-preference bias**, rating outputs from their own model family more highly than outputs from competing models. This can skew comparative experiments. Additionally, LLM judges perform better with **discrete rubrics** (e.g., "Is this passage relevant? Yes / No") than with continuous scales (e.g., "Rate relevance from 0 to 100"), where inter-rater agreement deteriorates. Libraries such as RAGAS provide pre-built LLM-as-a-judge metrics — including response relevancy, faithfulness, and context precision — that encode these best practices and reduce the engineering burden of building custom evaluators.

---

## Putting It Together: A Practical Starter Metrics Grid

With both dimensions defined, we can map a minimal but comprehensive set of starting metrics onto the scope × evaluator-type grid.

**System-level / Code-based:** End-to-end latency, throughput (requests per second), total memory and compute usage. These are the first metrics to instrument because they are trivial to collect and immediately actionable.

**Component-level / Code-based:** Per-component latency (retriever, reranker, LLM inference), token counts, and schema validation of LLM outputs. These enable root-cause analysis when system-level latency degrades.

**System-level / Human feedback:** A thumbs-up / thumbs-down control surfaced directly in the product UI. No sophisticated infrastructure is required, and even coarse binary feedback provides a meaningful signal about overall user satisfaction.

**Component-level / Human annotation (offline):** A curated dataset of (query, expected-documents) pairs used to compute retrieval precision and recall. This is a one-time human investment that enables ongoing automated evaluation of the retriever.

**Component-level / LLM as a judge:** RAGAS-style metrics applied to LLM outputs — response relevancy, faithfulness to the retrieved context, and context utilization (whether the LLM correctly ignores irrelevant passages). These metrics are run either offline on a held-out test set or periodically on sampled production traffic.

This grid provides end-to-end coverage across both performance and quality, across both the overall system and individual components, and across the full spectrum of evaluator types. The cheap metrics (code-based) run continuously and catch regressions quickly. The expensive metrics (human annotation, LLM judge) run less frequently but provide the diagnostic depth needed to understand and improve quality over time.

---

## Design Trade-offs and Next Steps

Designing an evaluation strategy always involves explicit trade-offs between cost, coverage, and latency.

**Cost versus coverage.** Code-based metrics are essentially free but blind to semantic quality. Human annotation is the gold standard for quality but does not scale. LLM-as-a-judge fills the gap but adds inference cost and introduces model-specific biases. An effective system uses all three, allocating human effort to ground-truth dataset construction and LLM evaluation to ongoing quality monitoring.

**Aggregate versus detailed logging.** Aggregate statistics over time let you spot trends and regressions at a glance. Detailed per-request logs let you trace the exact failure mode of a poorly performing query. Both are necessary; neither alone is sufficient. Store both, but with different retention policies — aggregate statistics are compact and can be retained indefinitely; detailed logs are large and may need to be sampled or rotated.

**Online versus offline evaluation.** Some metrics (latency, thumbs-up/down) are best collected in production on live traffic — they reflect real-world conditions. Others (retrieval recall, RAGAS faithfulness) are best measured in a controlled offline setting against a curated test set — this allows precise comparison across system versions without exposing users to experimental configurations. A mature observability system supports both.

**Experimentation infrastructure.** Beyond passive monitoring, the observability system should make it easy to run controlled experiments — sandboxed evaluations on held-out data, or A/B tests that expose a fraction of users to a new configuration. The metrics collected during an experiment become the evidence base for the decision to ship or revert the change.

These considerations point toward a phased implementation strategy: start with code-based software metrics (always cheap and always valuable), add user feedback controls (low infrastructure cost, high signal), invest in a human-annotated retrieval test set (one-time cost, reusable indefinitely), and then layer in LLM-as-a-judge quality metrics as the system matures. Each phase compounds on the previous one, steadily improving your ability to understand and improve the RAG system in production.

---

## Post-test

1. A team notices that end-to-end latency has doubled after a deployment. Walk through how the scope dimension of the evaluation framework would guide their debugging process, naming the specific metric types they would consult.
2. You are designing the quality evaluation layer for a production RAG system and have a limited annotation budget. How would you allocate that budget across the three evaluator types (code-based, human, LLM as a judge) to maximize coverage per dollar spent?
3. A colleague proposes using a GPT-family model to judge the quality of outputs generated by another GPT-family model. What specific risk does this introduce, and how would you mitigate it in the evaluation rubric design?

> [!example]- Answer Guide
> 
> #### Q1 — Scope Dimension for Latency Debugging
> 
> The team should first check *system-level* latency to confirm and quantify the regression. They would then drill into *component-level* latency metrics to isolate which stage — vector database retrieval, reranker, LLM inference, or post-processing — is responsible for the increase. Code-based evals at each component boundary (e.g., timing wrappers or tracing spans) provide the necessary data. Without component-level granularity, the team can only confirm that latency is high, not where to fix it.
> 
> #### Q2 — Allocating Limited Annotation Budget
> 
> Code-based metrics (latency, throughput, schema validation) should be implemented first since they cost nothing beyond engineering time and provide continuous coverage. The annotation budget should be concentrated on building a curated (query, expected-documents) dataset for retrieval evaluation — this is a one-time investment that enables ongoing automated precision/recall calculation. LLM-as-a-judge metrics (e.g., RAGAS faithfulness, response relevancy) cover the quality dimensions that neither code nor a fixed dataset can address and should be added once the retrieval ground truth is in place, using sampled production traffic to keep inference costs manageable. Human thumbs-up/down in the UI provides free ongoing system-level quality signal at negligible cost.
> 
> #### Q3 — Self-Preference Bias in LLM Judge
> 
> The risk is **self-preference bias**: a GPT-family judge may systematically rate GPT-family outputs more favorably than equivalent outputs from other model families, distorting quality comparisons. Mitigations include: (1) using a judge from a different model family (e.g., a Claude or open-source model) when evaluating GPT outputs; (2) restricting the rubric to discrete, binary labels ("relevant" / "not relevant") rather than continuous scores, which reduces the surface area for bias; (3) calibrating the judge against a human-annotated gold set to measure and correct for systematic bias; and (4) averaging scores across judges from multiple model families to cancel out individual biases.
