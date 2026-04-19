---
tags: [agentic-ai, deeplearning-ai, course, development-process, iteration, workflow, best-practices]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/hl2aj7/development-process-summary
---

## Pre-test

1. In the iterative development cycle for agentic systems, what two major activities does the instructor identify as taking up most of a builder's time, and why is the second one often undervalued by less experienced teams?
2. At what point in a system's maturity does the instructor recommend beginning to build formal evaluations with a small dataset, and what size dataset is suggested as a starting point?
3. Why does the instructor often build custom evaluations rather than relying solely on third-party monitoring and tracing tools, even though those tools work well?

---

# Lecture 034: Development Process Summary

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/hl2aj7/development-process-summary) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [Two Core Activities: Building and Analysis](#two-core-activities-building-and-analysis)
- [The Iterative Development Loop](#the-iterative-development-loop)
- [Maturing a System Through Increasingly Rigorous Analysis](#maturing-a-system-through-increasingly-rigorous-analysis)
- [A Common Pitfall: Underinvesting in Analysis](#a-common-pitfall-underinvesting-in-analysis)
- [Tooling and Custom Evaluations](#tooling-and-custom-evaluations)

## Two Core Activities: Building and Analysis

Building an agentic AI system involves two major, recurring activities: writing software to improve the system, and performing analysis to decide where to focus improvement efforts next. These two activities are not sequential phases — they interleave continuously throughout the project lifecycle.

The building activity feels intuitive because it produces tangible artifacts: new prompts, improved components, restructured workflows. Analysis, by contrast, can feel like it is not making progress. Examining traces, counting errors, and computing metrics does not change the system directly. Yet analysis is equally important to building, because it determines where building effort will have the greatest impact. Without disciplined analysis, engineering time is likely to be spent on the wrong components.

## The Iterative Development Loop

When starting a new agentic workflow, a practical first step is to build a quick end-to-end implementation — even a rough, "quick and dirty" version — as early as possible. This initial system is not expected to perform well; its purpose is to produce outputs and traces that can be examined. Reading through a small number of traces manually gives an experienced developer a gut sense of which components are failing and which aspects of the pipeline deserve attention first.

Based on these early observations, the developer then tunes individual components or adjusts the overall end-to-end system. The process then repeats: build, examine, tune, examine again. This back-and-forth is the normal rhythm of agentic development rather than an exception to a linear plan.

## Maturing a System Through Increasingly Rigorous Analysis

As the system improves, the analysis methods become progressively more formal. Early on, manual inspection of a handful of outputs is sufficient. Once the system is more stable, it becomes worthwhile to construct a small evaluation dataset — even just ten to twenty examples — and use it to compute end-to-end performance metrics. These metrics provide a more principled view of overall system quality than individual trace reviews alone.

As the system matures further, error analysis becomes more systematic. The developer examines outputs across the dataset and tallies how frequently each individual component contributed to a subpar final result. This counting exercise is more rigorous than gut-based inspection and directly informs decisions about which component to prioritize next.

At the most advanced stage of maturity, component-level evaluations are built. These allow targeted measurement of individual components in isolation, enabling efficient, focused improvement without the noise of end-to-end variability.

The overall trajectory is: end-to-end manual inspection → end-to-end metrics on a small dataset → systematic error analysis → component-level evals. However, the developer does not march linearly through these stages; they continually bounce between tuning the end-to-end system and tuning individual components as insights dictate.

## A Common Pitfall: Underinvesting in Analysis

Less experienced teams tend to spend a disproportionate amount of time building relative to analyzing. They write code, add features, and modify prompts without pausing to examine which changes are actually needed. The consequence is that engineering effort is diffused across many parts of the system rather than concentrated where it would have the most effect.

The analysis activities — reading traces, performing error analysis, building and running evaluations — are precisely the practices that make building efficient. They are not overhead imposed on top of development; they are what enables development to be directed correctly.

## Tooling and Custom Evaluations

A variety of third-party tools exist to assist with trace monitoring, logging, cost tracking, and runtime observability. These tools work well and many of DeepLearning.AI's short-course partners offer them. They are worth using, and the instructor uses some of them.

However, for most of the agentic workflows the instructor works on, the systems are custom enough that off-the-shelf tooling does not fully capture the specific failure modes of each application. As a result, a significant portion of evaluation infrastructure ends up being custom-built to match the precise behaviors and error patterns of the specific system under development. The recommendation is not to avoid third-party tools, but to recognize that custom evaluations will likely remain necessary alongside them.

Module 4 concludes here. The instructor notes that implementing even a fraction of the practices from this module — disciplined error analysis, systematic evaluation, iterative component improvement — puts a developer well ahead of the majority of practitioners building agentic systems today. Module 5 will address more advanced design patterns for highly autonomous agents.

## Post-test

1. What is the recommended first step when beginning a new agentic workflow, and what is its primary purpose?
2. Describe the four progressive stages of analysis rigor that the instructor outlines as a system matures from early prototype to production-grade.
3. What is the stated reason that even developers who use third-party tracing and monitoring tools still end up building substantial custom evaluation infrastructure?

<details><summary>Answer Guide</summary>

**Post-test Q1:** The recommended first step is to quickly build a rough end-to-end implementation — even a "quick and dirty" version. Its primary purpose is not to perform well, but to produce outputs and execution traces that can be manually inspected to gain an early intuition about which components are failing and where improvement effort should be directed.

**Post-test Q2:** The four progressive stages are: (1) manual inspection of a small number of outputs and traces to gain intuition; (2) constructing a small evaluation dataset (10–20 examples) and computing end-to-end metrics; (3) systematic error analysis that counts how frequently each component contributed to subpar outputs; and (4) building component-level evaluations that measure individual components in isolation for targeted, efficient improvement.

**Post-test Q3:** Most agentic workflows are highly custom, meaning they have specific failure modes and correctness criteria that generic third-party tools are not designed to capture. Because the relevant bugs and edge cases are unique to each application, developers need custom evaluations tailored to exactly what goes wrong in their particular system — even when general-purpose tooling is also in use.

</details>
