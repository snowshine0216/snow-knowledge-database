---
tags: [agentic-ai, deeplearning-ai, course, optimization, latency, cost, caching, parallelism]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/154qpa/latency-cost-optimization
---

## Pre-test

1. When building an agentic workflow, what is the recommended priority order among output quality, latency, and cost, and why?
2. What specific technique does the instructor recommend as the first step when latency becomes a problem in an agentic workflow?
3. How do LLM API providers typically charge for usage, and what does this imply for cost optimization strategy?

---

# Lecture 033: Latency Cost Optimization

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/154qpa/latency-cost-optimization) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

1. [Priority Order: Quality First](#priority-order-quality-first)
2. [Benchmarking Latency by Step](#benchmarking-latency-by-step)
3. [Strategies for Reducing Latency](#strategies-for-reducing-latency)
4. [Benchmarking Cost by Step](#benchmarking-cost-by-step)
5. [Practical Takeaway](#practical-takeaway)

---

## Priority Order: Quality First

When building agentic workflows, teams are advised to focus first on achieving high-quality outputs before worrying about cost and latency. The reasoning is straightforward: getting output quality right is typically the hardest part. Latency and cost matter, but optimizing them prematurely can distract from the core challenge of making the system work well.

In practice, cost often becomes a real concern only after a workflow is shipped and user adoption scales. A team may find themselves scrambling to reduce cost per user only after the product has already succeeded. This is, as the instructor notes, a good problem to have. Latency receives similar treatment — it warrants attention, but it trails behind correctness and output quality in the development priority queue.

This does not mean ignoring cost and latency entirely. It means deferring focused optimization until there is a clear signal that they are limiting factors.

## Benchmarking Latency by Step

Once latency does become a bottleneck, the first recommended step is to instrument and time each component of the workflow. In a multi-step research agent, for example, individual stages such as generating search terms, performing web searches, processing documents, and writing a final report each consume different amounts of time.

A concrete illustration: generating search terms might take seven seconds, a web search five seconds, document processing three seconds, an intermediate reasoning step eleven seconds, and final essay generation eighteen seconds. By laying out this timeline, it becomes immediately clear which components are the dominant contributors to overall latency. Without measurement, optimization efforts risk targeting the wrong steps.

This benchmarking exercise is clarifying in a specific way: it often reveals that many components are not material contributors to latency and can safely be deprioritized.

## Strategies for Reducing Latency

Once the timing breakdown is visible, several concrete levers are available.

**Parallelism:** Steps that are currently sequential but logically independent — such as fetching multiple documents simultaneously — can often be restructured to run in parallel. This is frequently an overlooked optimization and can yield significant gains when multiple network-bound operations are involved.

**Smaller or faster models:** If a particular LLM call accounts for a large share of latency, it is worth experimenting with a smaller model for that step. A less capable model may still perform adequately for tasks that do not require the full power of a frontier model, while responding considerably faster.

**Alternative LLM providers:** Different API providers serve the same underlying models at different speeds, often due to specialized inference hardware. Benchmarking the same model call across providers can reveal meaningful latency differences that are worth exploiting without any change to the underlying logic.

The key principle is that measurement precedes optimization. Without knowing which step is slow, any of these tactics might be applied in the wrong place.

## Benchmarking Cost by Step

A parallel analysis applies to cost. Many LLM providers charge per token — separately for input and output — while external APIs such as web search charge per call. Other pipeline steps such as PDF-to-text conversion carry their own pricing.

For a research agent, this cost breakdown might look like: the initial search-term generation LLM call costs 0.004 cents on average, each web search API call costs 1.6 cents, document processing costs vary, and the final essay generation step — due to its long output — may be the most expensive LLM step. Mapping out these figures step by step exposes which components account for the bulk of per-run cost.

With this data, optimization decisions become empirical rather than intuitive. The team can ask whether a cheaper model could serve a given step, whether an expensive API call can be replaced or cached, or whether the most costly step can be restructured to reduce token usage.

## Practical Takeaway

Benchmarking — whether for latency or cost — is the foundational practice that makes optimization tractable. By quantifying the contribution of each step, teams avoid wasted effort and can make targeted, evidence-based improvements. The broader lesson is that optimization is a second-phase concern: reach it only after the system is producing high-quality outputs, and then let measurement guide every decision.

---

## Post-test

1. In the example research agent, which step was identified as the largest single contributor to latency, and what was its measured duration?
2. Name two strategies the instructor recommends for reducing the latency of a step where an LLM call is the bottleneck.
3. What are the two main pricing dimensions that most LLM API providers use to charge for usage?

> [!example]- Answer Guide
> 
> #### Q1 — Largest Latency Contributor
> 
> Final essay generation was the largest single contributor to latency at approximately eighteen seconds on average, compared to seven seconds for search-term generation and other shorter steps earlier in the pipeline.
> 
> #### Q2 — Strategies to Reduce LLM-Call Latency
> 
> Two strategies for reducing LLM-call latency: (a) switch to a smaller, faster model for that step if the task does not require a frontier model's full capability; (b) try a different LLM provider that offers faster inference through specialized hardware, even when serving the same underlying model.
> 
> #### Q3 — LLM API Pricing Dimensions
> 
> Most LLM API providers charge based on two dimensions: input token count and output token count, each billed at a per-token rate. Longer prompts and longer generated responses both increase cost independently.
