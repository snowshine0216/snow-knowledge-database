---
tags: [agentic-ai, deeplearning-ai, course, reflection, evaluation, evals, quality-metrics]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/vtzr25/evaluating-the-impact-of-reflection
---

## Pre-test

1. Why does using an LLM to directly compare two outputs (A/B pairwise ranking) often produce unreliable results, and what systematic bias is commonly observed?
2. How does a rubric-based evaluation strategy differ from asking an LLM to score something on a scale of 1–5, and why does it yield more consistent results?
3. When designing evals for a reflection workflow that generates SQL queries, what constitutes a ground truth example and how do you operationalize the metric?

---

# Lecture 015: Evaluating the Impact of Reflection

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/vtzr25/evaluating-the-impact-of-reflection) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [Why Evaluate Reflection?](#why-evaluate-reflection)
- [Objective Evals: Database Query Example](#objective-evals-database-query-example)
- [Subjective Evals: LLM as a Judge](#subjective-evals-llm-as-a-judge)
- [Rubric-Based Evaluation](#rubric-based-evaluation)
- [Choosing Between Objective and Subjective Evals](#choosing-between-objective-and-subjective-evals)

## Why Evaluate Reflection?

Reflection frequently improves a system's outputs, but it also introduces latency — an extra LLM call is required before the final answer is produced. Before committing to a reflection workflow in production, it is worth measuring how much the additional step actually moves the quality needle. Building evaluations (evals) gives you that measurement and, just as importantly, gives you a principled way to keep tuning your prompts once the workflow is live.

The general pattern is simple: run the same set of representative test cases through your pipeline twice — once without reflection, once with — and compare the results on some quality metric. The challenge lies in defining "quality" appropriately for the task at hand.

## Objective Evals: Database Query Example

For tasks where there is a single correct answer, objective evaluation is straightforward. Consider a retail-store assistant that translates natural-language questions into SQL queries and executes them against a database. A question such as "how many items were sold in May 2025?" has one right numeric answer.

To build an eval for this workflow you collect roughly 10–15 representative questions and record the ground truth answer for each one. You then run the workflow in two configurations: without reflection (the SQL from the first LLM is executed directly) and with reflection (a second LLM reviews and revises the SQL before execution). The eval metric is simply the percentage of questions answered correctly under each configuration.

In the example from this lecture, the no-reflection baseline achieves 87% accuracy while the reflection variant reaches 95% — a meaningful improvement that justifies the extra latency. Once this eval harness exists, you can also use it to compare different versions of the generation prompt or the reflection prompt without guesswork; you just re-run the suite and read off the numbers.

## Subjective Evals: LLM as a Judge

Not every task has a binary right/wrong answer. In the chart-generation workflow covered in earlier lessons, reflection changes a stacked bar chart into a different visual. Determining which chart is "better" involves aesthetic and communicative judgments rather than factual correctness.

A natural first instinct is to feed both images into a multimodal LLM and ask it to choose the better one. In practice this approach is unreliable for several reasons. The ranking is sensitive to the exact wording of the judge prompt, and the ordering in which the two options are presented matters: many LLMs exhibit a strong position bias, preferring whichever option they see first regardless of actual quality. Because of this bias, the pairwise comparison often fails to correlate well with human expert judgment.

## Rubric-Based Evaluation

A more reliable alternative replaces pairwise comparison with single-sample rubric scoring. Instead of asking "which of A or B is better?", you ask an LLM to evaluate a single output against an explicit checklist of quality criteria. For a data visualization, the rubric might include:

- Does the plot have a clear, descriptive title?
- Are axis labels present and readable?
- Is the chart type appropriate for the data being shown?
- Is the color scheme distinguishable?
- Is the key or legend present where needed?

Each criterion is answered as a binary (0 or 1) judgment rather than a continuous score. Binary scoring sidesteps the calibration problem that plagues 1–5 or 1–10 scales, where LLMs tend to cluster answers in a narrow range or apply inconsistent thresholds. The individual binary scores are then summed to produce a total rubric score. Five criteria yield a 0–5 scale; ten criteria yield a 0–10 scale.

Applied to the reflection workflow, you run the visualization task across a set of 10–15 user queries in both the no-reflection and reflection configurations, score each resulting image with the rubric, and compare average rubric scores. This gives a quantitative signal for whether reflection is improving quality, and it remains reusable whenever you want to iterate on either the generation prompt or the reflection prompt.

## Choosing Between Objective and Subjective Evals

The lecture closes with a practical heuristic: when the task has an objectively correct answer, code-based evaluation is simpler and more reliable. You record ground truth, write a comparison function, and let code decide correctness. When the task involves inherently subjective quality judgments, an LLM-as-judge approach is necessary, but it requires more care in prompt design — particularly the development of an explicit rubric — to ensure the judge is well-calibrated and produces stable scores across runs.

Both styles of eval serve the same function: they create a systematic feedback loop so that changes to any part of the agentic pipeline (generation prompt, reflection prompt, model choice) can be assessed empirically rather than by intuition. This discipline becomes increasingly important as workflows grow more complex in later modules, where reflection will be augmented with the ability to pull in additional external information before revising outputs.

## Post-test

1. In the SQL query reflection example, what were the measured accuracy rates without and with reflection, and what do these numbers reveal about the value of the eval harness?
2. What is position bias in LLM-as-judge evaluations, and why does it undermine the pairwise comparison approach?
3. Why does replacing a single 1–5 score with several binary rubric criteria yield more consistent LLM evaluations?

> [!example]- Answer Guide
> 
> #### Q1 — Accuracy rates and eval harness value
> 
> Without reflection the system answered correctly 87% of the time; with reflection the rate rose to 95%. Beyond confirming that reflection helps, the eval harness is valuable because it lets you re-run the same benchmark whenever you modify the generation or reflection prompt, giving you a data-driven way to choose between prompt variants rather than relying on guesswork.
> 
> #### Q2 — Position bias in pairwise comparison
> 
> Position bias is the tendency for many LLMs to favor whichever option appears first in a pairwise comparison prompt, regardless of actual quality. This means that if you always put output A before output B, the judge will disproportionately call A the winner — a result that reflects prompt order rather than quality. Because this bias can dominate the signal, pairwise LLM comparison often correlates poorly with human expert judgment.
> 
> #### Q3 — Binary rubric vs. continuous scale
> 
> LLMs are poorly calibrated on continuous scales like 1–5 — they tend to cluster scores in a narrow band or shift thresholds depending on wording. Binary (yes/no) questions anchor each judgment to a concrete, verifiable criterion, making it much harder for the model to hedge. Summing several binary scores produces a meaningful total while keeping each individual judgment precise and auditable.
