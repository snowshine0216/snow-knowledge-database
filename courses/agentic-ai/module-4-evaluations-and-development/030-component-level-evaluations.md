---
tags: [agentic-ai, deeplearning-ai, course, evaluation, component-evals, unit-testing, evals]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/fwxyds/component-level-evaluations
---

## Pre-test

1. Why can running end-to-end evaluations every time you change a single component be problematic in a complex agentic workflow?
2. What is a "gold standard" resource list, and how is it used to build a component-level eval for web search?
3. In what way do component-level evals benefit teams that are split across different parts of a multi-component system?

---

# Lecture 030: Component-Level Evaluations

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/fwxyds/component-level-evaluations) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [Motivation: the cost of end-to-end evals](#motivation-the-cost-of-end-to-end-evals)
- [Designing a component-level eval for web search](#designing-a-component-level-eval-for-web-search)
- [Benefits of component-level evals](#benefits-of-component-level-evals)
- [When to apply component-level evals](#when-to-apply-component-level-evals)

## Motivation: the cost of end-to-end evals

When debugging a complex agentic workflow — such as a research agent that sometimes misses key points — the natural first instinct is to run the entire pipeline end-to-end and measure the outcome. This works, but it has two serious drawbacks.

First, end-to-end evals are expensive. If a developer suspects that the web search component is the culprit, confirming that hypothesis requires running the full workflow from start to finish every time a parameter is changed. Second, the noise introduced by the randomness of other components in the pipeline can obscure small improvements. A genuinely better web search engine might only produce a modest quality gain, but that signal can be drowned out by variance elsewhere in the system, making it impossible to tell whether a change actually helped.

## Designing a Component-Level Eval for Web Search

The alternative is to build an eval that measures only the component under investigation. For web search, this means creating a set of gold standard resources: for a representative sample of queries, a domain expert identifies the most authoritative web pages that an ideal search should surface. Any of those pages would be considered a correct result.

With that ground truth in place, it becomes straightforward to write code that captures how many of a search engine's returned results overlap with the expert-curated list. Standard information-retrieval metrics — such as the F1 score — quantify exactly this overlap in a principled way. The F1 score combines precision (how many returned results are relevant) with recall (how many relevant results were returned) into a single number, giving a clear picture of retrieval quality without requiring the rest of the system to run at all.

Once this targeted eval exists, iterating on the web search component is far faster. A developer can swap in different search engines (Google, Bing, DuckDuckGo, and others), vary the number of results returned, or adjust the date range over which results are filtered, and immediately see whether any of those changes move the metric in the right direction. Only after the component metric has been optimized through this rapid iteration cycle does it make sense to run a final end-to-end eval to confirm that the component improvement translates into better overall system performance.

## Benefits of Component-Level Evals

Component-level evals offer three concrete advantages over relying exclusively on end-to-end measurement.

**Clearer signal.** Because the evaluation is scoped to a single component, a change that improves that component produces a detectable effect in the metric. The noise contributed by unrelated components is eliminated from the measurement entirely.

**Faster iteration.** Running a focused eval takes a fraction of the time and compute that a full end-to-end run requires. This allows developers to explore a much larger space of hyperparameter settings — engine choice, result count, date range, and so on — in the same wall-clock time.

**Team parallelism.** In projects where different teams own different components, each team can define and track its own component metric independently. A team responsible for web search does not need to coordinate with the team responsible for synthesis or formatting every time it wants to test a change. Each team works on a smaller, more targeted problem and can move faster as a result.

## When to Apply Component-Level Evals

The decision to build a component-level eval is itself a judgment call. It is worth the upfront investment when a specific component is suspected of limiting overall quality and when iterating on that component requires running many experiments. The cost of constructing the gold standard and writing the evaluation code is amortized across all the experiments that follow.

Once the component has been tuned using its dedicated metric, a final end-to-end eval should always be run as a sanity check. This confirms that the improvements to the isolated component actually propagate through the full system and produce the expected gains in the metric that ultimately matters: the end-to-end output quality.

## Post-test

1. What two specific problems make end-to-end evals insufficient as the sole evaluation method when tuning a single component?
2. Describe, step by step, how you would construct a gold standard dataset and an F1-based eval for a web search component.
3. After iterating on a component using a component-level eval and achieving improved scores, what final step should always be performed, and why?

> [!example]- Answer Guide
> 
> #### Q1 — Two Problems with End-to-End Evals
> 
> - They are expensive: every change to one component requires re-running the entire workflow.
> - They introduce measurement noise: variance from other components in the pipeline can mask small improvements to the component being tuned, making it hard to detect genuine gains.
> 
> #### Q2 — Constructing Gold Standard and F1 Eval
> 
> - Select a representative set of queries that the system is expected to handle.
> - Have a domain expert review each query and compile a list of the most authoritative, correct web pages that a good search should return — this is the gold standard.
> - For each query, run the web search component and collect its returned results.
> - Compute the overlap between the returned results and the gold standard list using precision (fraction of returned results that are in the gold standard), recall (fraction of gold standard results that were returned), and the F1 score (harmonic mean of precision and recall).
> - Aggregate F1 scores across all queries to produce a single component-level quality metric.
> 
> #### Q3 — Final Step After Component Tuning
> 
> - Run a full end-to-end eval on the complete system. This is necessary because a component-level metric only confirms improvement within that component's scope. The end-to-end eval verifies that the component improvement actually translates into better overall system output, catching any cases where the component change inadvertently interacts poorly with other parts of the pipeline.
