---
tags: [agentic-ai, deeplearning-ai, course, evals, evaluation, llm-as-judge]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/pu5xbl/evaluations-evals
---

## Pre-test

Before reading, answer these 3 questions from memory:

1. Why is it recommended to build a "quick and dirty" agentic AI prototype before designing evaluations?
2. What are the two main axes used to categorize evaluation types in agentic AI systems?
3. When would you choose an LLM-as-judge approach over a code-based evaluation?

---

# Lecture 027: Evaluations (Evals)

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai) · DeepLearning.AI

## Outline

- Why to build a quick prototype first and inspect outputs before designing evals
- Invoice processing example: code-based eval with per-example ground truth
- Marketing copy assistant example: code-based eval without per-example ground truth
- Research agent example: LLM-as-judge eval with per-example ground truth
- The 2×2 eval taxonomy: (code vs. LLM judge) × (per-example ground truth vs. shared rubric)
- Practical tips for designing and iterating on end-to-end evals

## Start with a Quick Prototype, Then Look at the Output

One of the most important habits when building agentic AI systems is resisting the urge to theorize extensively before writing any code. Because it is genuinely difficult to predict in advance exactly where an agentic workflow will succeed and where it will fail, the most effective strategy is to build even a rough, minimal version of the system quickly — in a safe and responsible way that avoids data leaks — and then examine its outputs directly. This first pass at looking at real outputs gives developers a grounded, empirical sense of where the system is falling short, which is far more actionable than upfront speculation.

The process of reviewing outputs manually, even for just ten to twenty examples, typically reveals specific and recurring failure modes rather than vague impressions. A developer who reviews twenty invoices processed by a workflow might notice that the system frequently confuses the invoice issue date with the payment due date. This concrete discovery immediately tells the developer both what to fix and what to measure. Without that inspection step, they might have spent weeks designing evaluations for the wrong failure modes, such as biller address extraction errors that never actually materialized in practice.

This "build, look, then evaluate" loop is the foundation of the iterative development approach advocated in this lesson. The goal is not to build a perfect system on the first attempt, but to generate enough signal from real outputs to make subsequent development focused and efficient.

## Invoice Processing: Code-Based Eval with Per-Example Ground Truth

The invoice processing workflow — which extracts four required fields from uploaded invoices and saves them to a database — serves as the first concrete example of building an evaluation. After building the prototype and reviewing twenty invoices, a developer might discover that a common error mode is mixing up the invoice issue date with the payment due date. The system is tasked with extracting the due date specifically, because that is what triggers timely payments downstream.

To create an evaluation set for date extraction accuracy, the developer selects ten to twenty invoices and manually records the correct due date for each one in a standardized format — for example, `YYYY-MM-DD`. Standardizing the format is a deliberate design choice: it allows a simple regular expression to extract the LLM's output reliably, rather than parsing free-form date strings. The LLM's prompt is also updated to instruct it to always return dates in this canonical format.

The evaluation then works by running each invoice through the system, extracting the date field from the output via regex, and comparing it to the manually annotated ground truth. The metric is straightforward: the percentage of invoices where the extracted date matches the correct date exactly. This simple setup — twenty examples, a regex, and a string comparison — is sufficient to track progress as prompts and pipeline components are adjusted. The key characteristic of this eval is that it has a **per-example ground truth**: each invoice has its own correct due date, so each example carries a distinct expected answer.

## Marketing Copy Assistant: Code-Based Eval Without Per-Example Ground Truth

The second example shifts to a different kind of workflow: a marketing copy assistant that generates Instagram captions for product images. The marketing team has specified that captions must be at most ten words long. After deploying the prototype, the developer reviews outputs and finds that the system frequently violates this constraint — producing captions of eleven, fourteen, or seventeen words depending on the product image.

To track and improve length adherence, the developer constructs an evaluation set of ten to twenty product prompts, covering items such as sunglasses, coffee machines, hats, and blenders. For each prompt, the system generates a caption, and a short Python function counts the words in the output. The metric is the fraction of captions that fall within the ten-word limit.

This example differs fundamentally from the invoice case in one important structural way: there is **no per-example ground truth**. The target — ten words or fewer — is identical for every single example. The evaluation does not require the developer to annotate a specific correct answer for each product; instead, the constraint itself serves as the evaluation criterion. This makes the eval easier to set up (no manual annotation needed) but also means it measures only constraint satisfaction, not the quality or creativity of the generated text.

## Research Agent: LLM-as-Judge Eval with Per-Example Ground Truth

The third example revisits a research agent that writes long-form articles in response to prompts such as "recent breakthroughs in black hole science" or "renting versus buying a home in Seattle." Upon reviewing outputs, the developer notices that the agent sometimes omits highly publicized, important findings that an expert human writer would have included. This is not a simple formatting or length issue — it requires understanding whether specific ideas were adequately addressed in a long essay.

To evaluate this, the developer curates a set of example prompts and for each one manually identifies three to five gold-standard discussion points — the most important facts or arguments that any high-quality response on that topic should include. These gold-standard points differ for each prompt, making this another **per-example ground truth** evaluation. However, unlike the invoice case, it would be impractical to check coverage of these talking points using simple string matching or a regular expression, because the essay might discuss the same concept in many different ways without using the exact expected phrase.

This is precisely the scenario where an **LLM-as-judge** approach is most appropriate. The developer crafts a meta-prompt that provides the original essay, the gold-standard talking points, and instructions for the judging model to count how many of the points were adequately covered. The judge returns a JSON object with a score from zero to five and an explanation. This allows systematic, scalable coverage tracking across the entire evaluation set, leveraging the LLM's ability to understand paraphrase and conceptual equivalence — capabilities that regex-based checks fundamentally lack.

## The 2×2 Evaluation Taxonomy

The three examples illustrate a useful two-dimensional framework for thinking about evaluation design. The first axis concerns the **evaluation method**: either code-based (objective, deterministic) or LLM-as-judge (subjective, flexible). The second axis concerns whether the evaluation requires a **per-example ground truth** (where each test case has its own expected answer) or operates with a **shared rubric** (where the same criterion applies to every example).

Mapping the examples onto this grid: invoice date extraction is code-based with per-example ground truth; marketing copy length checking is code-based with a shared rubric; research agent coverage is LLM-as-judge with per-example ground truth. The fourth quadrant — LLM-as-judge with a shared rubric — also arises in practice. An example from earlier in the course is grading data visualizations against a universal rubric (clear axis labels, appropriate chart type, legible legends), where every chart is judged by the same criteria but the model must interpret the chart to determine whether the criteria are met.

These are also called **end-to-end evaluations** because they measure the system from user input (one end) to final output (the other end), treating the entire pipeline as a black box. This is in contrast to component-level evaluations, which assess individual steps within the workflow. End-to-end evals are the right starting point because they reflect the metric that ultimately matters: whether the overall system delivers correct and useful outputs to users.

## Practical Tips for End-to-End Eval Design

Several practical principles emerge from this lesson for teams building their first evaluations. The most important is to start with quick and dirty evals rather than waiting until a comprehensive evaluation framework is in place. Many teams become paralyzed by the belief that building evals is a massive multi-week undertaking. In reality, ten to twenty examples with simple code checks or a basic LLM-as-judge prompt can provide immediately useful signal. Just as the agentic workflow itself is expected to improve iteratively, the evaluation infrastructure should also improve incrementally over time.

When the initial eval set seems insufficient — perhaps because it does not cover important edge cases, or because the metric fails to agree with the developer's intuitive judgment about which system version is better — that is a signal to expand or refine the eval rather than to abandon it. If a prompt update seems clearly to improve the system by inspection but the eval score does not reflect the improvement, the right response is to examine the eval itself: add more examples, update the gold-standard annotations, or rethink the evaluation method.

Finally, evaluations serve a motivational and strategic function beyond pure measurement. By systematically comparing the system's performance against that of an expert human on the same tasks, developers can identify where the largest quality gaps remain. These gaps often provide the most productive targets for the next round of development. The combination of manual inspection of outputs and metric-based tracking creates a feedback loop that steadily raises the quality of the agentic system over time.

## Post-test

1. What specific workflow error was discovered in the invoice processing example, and how was an eval designed to track it?
2. How does the marketing copy eval differ structurally from the invoice date extraction eval, and what does that difference imply about annotation requirements?
3. Why is an LLM-as-judge approach more suitable than regex matching for evaluating the research agent's coverage of gold-standard talking points?

> [!tip] Answer Guide
> **Q1: What specific workflow error was discovered in the invoice processing example, and how was an eval designed to track it?**
> The system was confusing the invoice issue date with the payment due date. An eval was designed by manually annotating the correct due date for 10–20 invoices in `YYYY-MM-DD` format, prompting the LLM to output dates in that format, extracting the date via regex, and comparing it to the annotation. The metric was the percentage of invoices where the extracted date matched exactly.
>
> **Q2: How does the marketing copy eval differ structurally from the invoice date extraction eval, and what does that difference imply about annotation requirements?**
> The marketing copy eval has no per-example ground truth — the ten-word limit applies equally to every test case, so no individual annotation is needed. In contrast, the invoice eval requires a unique correct date label for each invoice. This means the marketing copy eval is cheaper to set up because no manual labeling per example is required; the shared constraint acts as the evaluation criterion.
>
> **Q3: Why is an LLM-as-judge approach more suitable than regex matching for evaluating the research agent's coverage of gold-standard talking points?**
> A research essay can discuss the same concept using many different words, phrases, or framings that regex patterns would miss. An LLM judge can understand semantic equivalence and paraphrase, determining whether a talking point was "adequately mentioned" even when the exact expected phrase does not appear. This flexibility is essential when evaluating long-form, subjective content where surface-level text matching is insufficient.
