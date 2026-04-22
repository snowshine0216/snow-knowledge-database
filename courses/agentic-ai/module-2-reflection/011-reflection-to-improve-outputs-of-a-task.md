---
tags: [agentic-ai, deeplearning-ai, course, reflection, self-critique, iteration, agents]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/shknq1/reflection-to-improve-outputs-of-a-task
---

## Pre-test

1. In the reflection design pattern, what is the key difference between pure self-reflection and reflection with external feedback, and why does that difference matter for output quality?
2. Why might a practitioner deliberately choose a different model — specifically a reasoning or "thinking" model — for the reflection step rather than reusing the same model that produced the first draft?
3. What concrete piece of external information can be injected into the reflection loop when an LLM is writing code, and how does that information change what the model is able to reason about?

---

# Lecture 011: Reflection to Improve Outputs of a Task

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/shknq1/reflection-to-improve-outputs-of-a-task) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [The Reflection Pattern in Everyday Terms](#the-reflection-pattern-in-everyday-terms)
- [How LLMs Implement Self-Reflection](#how-llms-implement-self-reflection)
- [Applying Reflection to Code Generation](#applying-reflection-to-code-generation)
- [Choosing Different Models for Each Stage](#choosing-different-models-for-each-stage)
- [External Feedback as the Key Amplifier](#external-feedback-as-the-key-amplifier)
- [Realistic Expectations and Design Considerations](#realistic-expectations-and-design-considerations)

---

## The Reflection Pattern in Everyday Terms

The reflection design pattern draws a direct analogy from how humans revise their own work. When writing an email in a hurry, a first draft often contains unclear phrasing, factual omissions, or typographical errors. A quick read-through — a moment of self-reflection — surfaces these issues and makes a substantially improved second version possible. The same process, it turns out, is available to large language models.

The pattern is deceptively simple, which is why the instructor describes it as "surprisingly easy to implement." At its core, reflection means that the model is prompted once to produce a first-draft output, and then prompted a second time — with the first draft visible — to critique its own output and generate a revised version. The second prompt carries a different instruction: not to create, but to evaluate and improve.

---

## How LLMs Implement Self-Reflection

In a hard-coded, minimal implementation the workflow has exactly two steps. First, the model receives a task prompt and generates version one of the output. Second, the same model — or a different one — receives the original task plus version one, along with an instruction to reflect and produce an improved draft. The result is version two.

This two-step structure is not the product of any special architecture; it is purely a prompting strategy. The model in the second call has no memory of its internal state from the first call. What makes the second call useful is that it has richer context: it sees both the goal and its own previous attempt, which surfaces inconsistencies, gaps, or errors that were invisible during generation.

The instructor notes this can be applied to any text-generation task. Email drafting is the simplest example, but the same pattern transfers immediately to essay writing, report generation, and — most powerfully — code generation.

---

## Applying Reflection to Code Generation

When the task is to write code, the reflection loop operates identically in structure: the model writes a first draft of the code, and a second call asks the model to check for bugs and write an improved version. However, code has a property that natural language text generally lacks: it is executable. This executability opens the door to a qualitatively different kind of reflection, discussed in the section on external feedback below.

Even without execution, a second-pass reflection on code is productive. A model can identify logic errors, inconsistencies between comments and implementation, or violations of stated requirements simply by reading its own prior output with the instruction to critique.

---

## Choosing Different Models for Each Stage

Because different models have different strengths, the two stages of the reflection loop need not use the same model. This is a practical design choice that experienced practitioners make deliberately.

The first-draft stage often benefits from a model that is fast and fluent at generation. The reflection stage, by contrast, benefits from a model that is rigorous at analysis and error-detection. Reasoning models — sometimes called thinking models — tend to excel at finding bugs precisely because their architecture or inference-time compute encourages deliberate, step-by-step evaluation rather than rapid fluent generation.

The practical implication is a split workflow: use a standard generative model to write code quickly, then hand the code off to a reasoning model whose task is specifically to find what is wrong. This heterogeneous pairing often outperforms using the same model twice for both stages.

---

## External Feedback as the Key Amplifier

Self-reflection — prompting the model to critique its own text — yields a modest improvement. The pattern becomes dramatically more powerful when new information from outside the model's generation process is injected at the reflection step. The instructor is explicit that this is the most important design consideration for practitioners implementing reflection.

For code, the most natural form of external feedback is execution. If the first-draft code raises a syntax error or produces wrong output when run, those error messages and execution logs represent information that did not exist at the time of the original generation. Passing this runtime feedback back to the model alongside the original code and the reflection instruction gives the model concrete, specific signal about what went wrong and where. The model no longer has to guess whether a bug exists — it has evidence.

This contrasts sharply with pure self-reflection, where the model must reason about potential errors purely from pattern-matching against its training. With execution feedback, the model reasons about actual errors. The quality gap between these two modes of reflection is significant.

The principle generalizes beyond code. Whenever there exists an external oracle — a test suite, a static analysis tool, a spell-checker, a domain validator, a search engine result — injecting its output into the reflection step elevates the pattern from a mild performance bump to a substantial quality improvement.

---

## Realistic Expectations and Design Considerations

The instructor is careful to frame reflection honestly. It is not a mechanism that guarantees correctness. It does not make a model get everything right one hundred percent of the time. What it reliably delivers is "a modest bump in performance" for pure self-reflection, with larger gains available when external feedback is incorporated.

The central design principle to carry away is this: reflection is most valuable when combined with new information. Building a reflection loop without any external signal is useful but limited. Identifying what external feedback is cheaply available for a given task — execution logs for code, search results for factual claims, test outputs for data transforms — and routing that feedback into the reflection prompt is the key engineering decision that determines how much the pattern is worth.

With reflection established as a baseline, the next lesson moves to a systematic comparison of reflection against direct (zero-shot) generation, quantifying the performance difference across a benchmark.

---

## Post-test

1. Describe the two-step structure of a minimal reflection implementation. What does each prompt instruct the model to do, and what context does the second call have that the first did not?
2. Under what condition does the reflection pattern yield the largest quality gains, and what specific type of information enables this?
3. Why might a practitioner use a reasoning model for the reflection step rather than the same model that generated the first draft?

---

> [!example]- Answer Guide
> 
> #### Q1 — Two-step reflection structure
> 
> The first prompt instructs the model to generate a first draft of the output (e.g., an email or piece of code) from the task description. The second prompt passes the model the original task description plus the first-draft output, with an instruction to critique and produce an improved version. The second call has context the first did not: it can see both the goal and a concrete prior attempt, making errors and gaps visible.
> 
> #### Q2 — Condition for largest gains
> 
> Reflection yields the largest gains when external feedback — information from outside the model's own generation — is injected into the reflection step. For code, executing the first-draft code and capturing runtime errors or wrong outputs provides concrete, specific evidence of what failed. This is far more informative than asking the model to speculate about potential bugs, and produces substantially better revised output.
> 
> #### Q3 — Reasoning model for reflection
> 
> Different models have different strengths. Reasoning (thinking) models are particularly well-suited to error detection because they are structured for step-by-step analysis rather than fast fluent generation. Using a reasoning model specifically for the critique-and-revise step, while using a faster generative model for the first draft, leverages the comparative advantages of each model type.
