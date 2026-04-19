---
tags: [agentic-ai, deeplearning-ai, course, evaluation, evals, llm-as-judge, agents]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/46yh5j/evaluating-agentic-ai-evals
---

## Pre-test

1. When building an agentic workflow evaluation strategy, should you design evals before or after building the system — and why does the order matter?
2. What is the fundamental difference between an objective eval metric and a subjective one, and which technique is commonly applied to each?
3. Explain the distinction between end-to-end evals and component-level evals in an agentic context, and describe a scenario where each type is most useful.

---

# Lecture 007: Evaluating Agentic AI (Evals)

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/46yh5j/evaluating-agentic-ai-evals) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [Why Evals Define Success](#why-evals-define-success)
- [Build First, Evaluate Second](#build-first-evaluate-second)
- [Objective Metrics and Code-Based Checks](#objective-metrics-and-code-based-checks)
- [LLM as a Judge for Subjective Criteria](#llm-as-a-judge-for-subjective-criteria)
- [End-to-End vs. Component-Level Evals](#end-to-end-vs-component-level-evals)
- [Error Analysis through Trace Inspection](#error-analysis-through-trace-inspection)

---

## Why Evals Define Success

Among all the factors that determine whether a team builds agentic workflows well or poorly, the single strongest predictor is whether they run a disciplined evaluation process. This observation comes from working with many different teams: those who invest in rigorous evals iterate faster, catch regressions earlier, and end up with more reliable systems. Teams that skip evals or treat them as an afterthought tend to wander — they fix one problem only to introduce another, and they lack any principled way to measure whether a change was actually an improvement.

Evals for agentic AI are therefore not a quality-assurance formality added at the end of a project. They are the compass that guides development from the very beginning. The rest of this lesson lays out a practical philosophy for building that compass.

## Build First, Evaluate Second

A common mistake is trying to anticipate every failure mode before writing any code. Agentic systems interact with real users, real data, and real edge cases in ways that are almost impossible to predict from first principles. Consider a customer-order-inquiry agent: before deploying it, almost no one would predict that it might spontaneously mention competitors by name — saying things like "We're much better than Compco" or "Unlike Rivalco, we make sure returns are easy." Yet this kind of behavior surfaces repeatedly in real outputs.

The recommended approach is therefore to build the system first, run it against realistic inputs, and then read the outputs manually to discover what is actually going wrong. This empirical inspection is the starting point for every meaningful eval. Once you have observed a real failure — an unexpected competitor mention, an inappropriate tone, a hallucinated policy detail — you can design a targeted evaluation to track it. Trying to enumerate failures in the abstract, before you have seen any outputs, produces eval suites that miss the problems that actually matter.

This philosophy does not mean ignoring correctness until late in the project. It means accepting that you cannot write comprehensive evals from imagination alone. Real outputs teach you where to look.

## Objective Metrics and Code-Based Checks

Once you have identified a failure mode, the first question is whether it can be measured objectively. An objective metric is one where the answer is unambiguously correct or incorrect, independent of human judgment. Competitor mentions are a perfect example: either the response contains the word "Compco" or it does not. There is no gray area.

For objective criteria you can write simple code. Given a named list of competitors — "Compco," "Rivalco," "The Other Co" — a straightforward string-search function can scan every response and record how many times a competitor name appears. Dividing that count by the total number of responses gives a competitor-mention rate: a single number that you can track over time. As you prompt-engineer or fine-tune the system to reduce these mentions, the number should fall. If it does not fall, you know your intervention did not work.

The power of objective, code-based evals is that they are cheap to run, perfectly reproducible, and completely unambiguous. Every time a new version of the agent is deployed, the eval reruns in seconds and produces a comparable score. This kind of regression testing is essential for moving quickly without breaking what already works.

## LLM as a Judge for Subjective Criteria

Not every quality you care about can be captured by a string search. A research agent that writes reports on topics like black hole science or robotic fruit harvesting produces free-form prose. Whether that prose is insightful, well-organized, and accurate is a matter of degree, not a binary. Writing deterministic code to assess essay quality would require solving natural language understanding — the very problem you are trying to use an LLM to solve.

The practical solution is to use a second LLM as a judge. You construct a prompt that instructs the judge model to read the generated essay and assign a quality score on a defined scale — for example, one to five, where one is poor and five is excellent. The judge then returns a number, and you can average those numbers across many reports to get a quality signal that tracks improvement over time.

It is worth being candid about the limitations of this technique. LLMs are not naturally calibrated for numeric rating scales. A judge asked to score on a one-to-five range tends to cluster its scores in a narrow band, making it difficult to detect meaningful differences between a good output and a great one. The numeric-scale approach is a reasonable first pass — it can quickly reveal whether a change made things dramatically better or worse — but more sophisticated judging techniques, covered in the course's later module on evaluations, produce more reliable and discriminating scores.

## End-to-End vs. Component-Level Evals

As an agentic system grows more complex — with multiple steps, tool calls, and branching logic — two distinct levels of evaluation become important, and they serve different purposes.

End-to-end evals measure the quality of the system's final output, treating the agent as a black box. You provide an input, the agent runs all of its steps, and you score the result. This is the most direct measure of whether the system is doing its job for the user. If end-to-end scores are low, you know something is wrong somewhere in the pipeline, but you do not yet know where.

Component-level evals zoom in on a single step within the workflow. Perhaps you want to know whether the retrieval step is surfacing relevant documents, or whether the summarization step is faithfully condensing them. By evaluating each component independently, you can pinpoint exactly which part of the pipeline is responsible for a failure. This is especially valuable during development, when you are iterating quickly and need to know whether a change to one prompt is helping or hurting that specific step — without waiting for the entire end-to-end test to run.

The two types of evals complement each other. End-to-end evals confirm that the system works as a whole; component-level evals tell you where to focus when it does not.

## Error Analysis through Trace Inspection

Beyond formal evals, one of the most productive habits an agentic AI developer can cultivate is reading intermediate outputs — commonly called traces — step by step. In a complex agentic workflow, the final output is the product of many sequential decisions: what the agent retrieves, what it decides to do next, which tool it calls, and how it interprets the tool's result. A failure in the final answer often has its root cause several steps earlier, in a subtly wrong intermediate state.

Error analysis is the practice of manually walking through these traces to spot where the agent's reasoning diverges from what you would expect. It is unglamorous work — it amounts to reading a lot of text — but it is remarkably effective at surfacing the kinds of systematic errors that automated evals do not yet measure, simply because no one has thought to measure them yet. The insights from error analysis feed directly back into the eval-design cycle: you spot a pattern, you write an eval for it, you track it, and you fix it.

Together, evals and error analysis form a closed feedback loop. Evals give you reproducible numbers. Error analysis gives you the qualitative understanding needed to improve those numbers. Neither is sufficient on its own; together they constitute the disciplined evaluation process that separates teams that build agentic systems well from those that struggle.

---

## Post-test

1. A team notices their customer-service agent is occasionally revealing internal discount thresholds to users. Using the framework from this lecture, describe the full process they should follow: from discovering the problem to measuring and tracking it.
2. You are evaluating a creative-writing agent's outputs. Why would a simple code-based checker be insufficient, and how would you set up an LLM-as-judge eval to handle this case?
3. Your end-to-end eval score for a research agent drops after a prompt change, but you are not sure which step caused the regression. What type of eval would you run next, and how does it narrow the problem?

> [!example]- Answer Guide
>
> #### Q1 — Tracing and Measuring a Disclosure Leak
>
> First, build and run the system against real or realistic inputs, then manually read outputs to spot the disclosure pattern. Once confirmed, determine whether "discount threshold" mentions are objective (they are — a specific dollar figure or percentage appearing in the text is detectable by string search or regex). Create a code-based eval that flags any response containing known threshold values or patterns like "X% off internal limit," compute a leak-rate metric, and track it across versions. Continue running error analysis on traces to find the step where the disclosure originates (likely a retrieval step that returns internal pricing documents).
>
> #### Q2 — LLM-as-Judge for Creative Writing
>
> Free-form creative prose cannot be scored by string matching because quality is inherently subjective and multi-dimensional (voice, coherence, originality). Instead, construct a judge prompt that defines the criteria explicitly — e.g., "Score the following story from 1 to 5 for narrative coherence, originality, and prose quality, where 5 is excellent." Feed the generated stories to a capable judge LLM and collect scores. Be aware that numeric-scale ratings cluster and lack fine discrimination; treat the scores as directional signals rather than precise measurements, and plan to adopt more sophisticated judging techniques (pairwise comparisons, rubric-based scoring) as the eval matures.
>
> #### Q3 — Component Evals After End-to-End Regression
>
> Run component-level evals on each step of the pipeline in isolation: test the retrieval step, the reasoning/planning step, and the report-generation step separately. Compare per-component scores before and after the prompt change. The step whose score drops most is the source of the regression. Component-level evals are faster to run and more precise in attribution than waiting for the full end-to-end pipeline, making them the right tool for diagnosing where a specific change went wrong.
