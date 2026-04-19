---
tags: [agentic-ai, deeplearning-ai, course, llm, agents, benefits, productivity]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/k2vehc/benefits-of-agentic-ai
---

## Pre-test

1. On the HumanEval coding benchmark, GPT-3.5 in a non-agentic setting scores around 40%. When the same model is wrapped in an agentic workflow using techniques like reflection, roughly what kind of performance improvement would you expect — and how does that compare to the jump from GPT-3.5 to GPT-4?
2. Describe a concrete scenario where an agentic workflow can parallelize work that a human researcher would have to perform sequentially, and explain precisely which step enables that parallelism.
3. Why does the modular design of agentic workflows offer a practical advantage when refining or productionizing a system, and what three categories of components are typically swappable?

---

# Lecture 004: Benefits of Agentic AI

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/k2vehc/benefits-of-agentic-ai) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [Performance Lift: The HumanEval Benchmark Story](#performance-lift-the-humaneval-benchmark-story)
- [Parallelism: Doing in Seconds What Humans Do Sequentially](#parallelism-doing-in-seconds-what-humans-do-sequentially)
- [Modularity: Swapping and Upgrading Components](#modularity-swapping-and-upgrading-components)
- [Summary](#summary)

---

## Performance Lift: The HumanEval Benchmark Story

The single most compelling reason to adopt agentic workflows is raw performance — the ability to accomplish tasks that were simply not achievable with a single, direct prompt to a language model. To make this concrete, the instructor presents data from HumanEval, a widely used coding benchmark that measures how accurately a model can generate correct programs to satisfy a set of functional specifications.

In a standard, non-agentic setting — where a model receives a problem and must produce the answer in one shot — GPT-3.5 achieves roughly 40% on HumanEval. GPT-4, a substantially more powerful model representing a full generation of progress, pushes that figure to around 67%. The jump of roughly 27 percentage points between these two models is already impressive and reflects enormous investment in pretraining, data curation, and alignment.

Yet even that generational leap is surpassed by something far more accessible: wrapping GPT-3.5 in an agentic loop. Using techniques such as iterative reflection — where the model writes code, critiques its own output, and revises — GPT-3.5 climbs well above its non-agentic baseline, ultimately outperforming even GPT-4 in the direct-generation setting. GPT-4 inside an agentic workflow does better still. The implication is striking: the performance gain from adding an agentic workflow around an older model exceeds the gain achieved by upgrading to the next generation of model entirely.

This finding reframes how practitioners should think about model selection. Rather than waiting for the next frontier model release, teams can often unlock dramatic improvements today by restructuring how they use existing models.

## Parallelism: Doing in Seconds What Humans Do Sequentially

A second benefit is speed through parallelism. Agentic workflows can dispatch multiple subtasks simultaneously in a way that a single human researcher cannot.

Consider the task of writing a research essay on black holes. A human following a methodical research process would: formulate search queries one at a time, execute those searches, open the most promising results, read each page sequentially, synthesize notes, and finally compose the essay. Every step waits on the previous one.

An agentic workflow restructures this pipeline. Three LLMs can run in parallel to generate candidate search query terms. Those three queries are dispatched to a search engine simultaneously, and the top results from each query — say, three pages per query, yielding nine pages total — can all be fetched concurrently. Rather than a human reading nine pages one after another, the workflow downloads all nine in parallel and then passes the aggregated content into a single LLM call to compose the essay.

Although this multi-step agentic pipeline takes longer than a single direct generation, it is substantially faster than the human equivalent, precisely because the bottleneck operations — web fetching and page reading — are parallelized. This is a general pattern: wherever independent subtasks exist, an agentic workflow can exploit that independence to compress wall-clock time.

## Modularity: Swapping and Upgrading Components

The third benefit is architectural: agentic workflows are naturally modular. Because the pipeline is composed of discrete, interchangeable components — LLMs, search engines, retrieval tools, code executors — each component can be evaluated, upgraded, or replaced independently without redesigning the whole system.

In the essay-writing example, the web search step is a natural candidate for experimentation. One might start with a standard search API and later try alternatives such as Bing, DuckDuckGo, Tavily, or You.com, all of which offer interfaces designed specifically for programmatic LLM use. At a different point in the pipeline, a specialist news search engine might be substituted to surface the most recent scientific breakthroughs rather than general background material.

The same flexibility applies to the models themselves. Different steps in a workflow may favor different LLMs — a step requiring precise logical deduction might benefit from one provider, while a step requiring creative summarization might perform better with another. By treating each component as a plug-in rather than a fixed assumption, practitioners can continuously improve the pipeline by benchmarking individual stages in isolation. This composability is a practical superpower: it means the system can be tuned incrementally without starting over.

## Summary

Agentic workflows deliver three compounding advantages. First and most important, they produce dramatically better performance on tasks compared to single-pass prompting — often exceeding the improvement achievable by upgrading to a newer model generation. Second, they can parallelize independent subtasks, achieving speeds that a sequential human workflow cannot match. Third, their modular design enables incremental improvement: individual components such as search engines, retrieval tools, and base LLMs can be swapped or upgraded without rebuilding the entire pipeline.

Together, these three properties explain why agentic design has become a central strategy in serious LLM application development.

---

## Post-test

1. The HumanEval benchmark result showed that wrapping GPT-3.5 in an agentic workflow outperforms GPT-4 in a non-agentic setting. What does this tell us about the relative leverage of workflow design versus model capability, and what is the practical implication for engineering teams?
2. In the black-hole essay example, which specific step is responsible for the speed advantage over a human researcher, and why is that step particularly suited to parallelization in an agentic context?
3. Name the three categories of components that practitioners commonly swap when iterating on an agentic workflow, and give one concrete example from the lecture for each category.

> [!example]- Answer Guide
> 
> #### Q1 — Workflow Design vs Model Capability
> 
> The benchmark data shows that workflow design can deliver larger performance gains than a full model-generation upgrade. GPT-3.5 with agentic techniques (e.g., iterative reflection) outperforms GPT-4 in direct-generation mode, even though GPT-4 represents a substantial improvement in raw model capability. The practical implication is that engineering teams should invest in agentic workflow design rather than simply waiting for or paying for a stronger base model — the returns on workflow architecture can exceed the returns on model substitution.
> 
> #### Q2 — Parallelism Source in Essay Workflow
> 
> The speed advantage comes from the web-page fetching step. After running three parallel search queries and identifying a set of result URLs (up to nine in the example), the agentic workflow downloads all nine pages simultaneously. A human must open and read pages one at a time; the workflow has no such constraint because HTTP requests are independent — fetching one page does not require waiting for another. This makes web retrieval an ideal target for parallelization.
> 
> #### Q3 — Three Swappable Component Categories
> 
> - **Search engines**: The lecture names Google (via API), Bing, DuckDuckGo, Tavily, and You.com as interchangeable web search providers.
> - **Specialized retrieval tools**: A news search engine is cited as a drop-in replacement for the general web search step when recency matters (e.g., latest breakthroughs in black hole science).
> - **LLMs / model providers**: Different large language models from different providers can be tried at each step to find which delivers the best result for that particular subtask.
