---
tags: [agentic-ai, deeplearning-ai, course, reflection, feedback, external-feedback, tool-use]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/txqmf0/using-external-feedback
---

## Pre-test

1. Why does reflection that relies solely on the LLM itself tend to hit a performance ceiling, and what structural change breaks through that ceiling?
2. Name three concrete software tools or techniques described in the lecture that can supply external feedback to a reflection loop, and explain what information each one contributes.
3. Why are LLMs considered unreliable for enforcing exact word limits, and how does a word-count tool integrated into a reflection loop address this weakness?

---

# Lecture 016: Using External Feedback

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/txqmf0/using-external-feedback) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [The Performance Curve Problem](#the-performance-curve-problem)
- [Why External Feedback Breaks the Plateau](#why-external-feedback-breaks-the-plateau)
- [Practical Sources of External Feedback](#practical-sources-of-external-feedback)
  - [Code Execution](#code-execution)
  - [Pattern Matching for Unwanted Content](#pattern-matching-for-unwanted-content)
  - [Web Search for Fact-Checking](#web-search-for-fact-checking)
  - [Word Count Enforcement](#word-count-enforcement)
- [Transition to Tool Use](#transition-to-tool-use)

## The Performance Curve Problem

When building an LLM-powered application using only zero-shot or direct-generation prompting, the performance improvement curve follows a recognizable shape: initial prompt tuning produces meaningful gains, but the curve flattens as diminishing returns set in. No matter how carefully the prompt is refined, there is a ceiling imposed by the fact that the model is always reasoning over the same fixed information it was given at inference time.

Adding self-reflection — where the LLM critiques and rewrites its own output — can push performance above that plateau. Tuning the reflection prompt then becomes an additional lever. However, self-reflection still draws on nothing beyond what the model already knows, so a second, higher ceiling tends to emerge.

## Why External Feedback Breaks the Plateau

The key insight of this lesson is that the LLM's reflection loop becomes far more powerful when it receives genuinely new information from outside itself rather than simply rereading the same context. When external signals are fed back into the loop at each iteration, the performance curve can be lifted to a substantially higher trajectory. The model is no longer just reconsidering its prior output; it is responding to objective facts it could not have inferred on its own.

This framing suggests a practical heuristic for engineers who feel stuck after extensive prompt tuning: first consider whether self-reflection has been applied, and if gains from reflection have also plateaued, look for an external feedback source that can inject new, verifiable information into the loop.

## Practical Sources of External Feedback

### Code Execution

One of the earliest and most natural sources of external feedback is running the code an LLM generates and feeding the resulting output — or error messages — back into the model. The execution environment acts as an impartial judge: it produces facts (stack traces, return values, test outcomes) that the model cannot fabricate or rationalize away. The model then uses those facts to reason about what needs to change before rewriting the code.

### Pattern Matching for Unwanted Content

For tasks such as drafting marketing copy or customer emails, a common quality problem is the model inadvertently mentioning competitors' names. A simple regular-expression scanner applied to the model's output can detect every instance reliably. When a competitor name is found, that finding is passed back to the model as explicit criticism: "The following competitor names appeared — rewrite without them." Because the signal is binary and objective, the model can act on it precisely, without needing to guess at the standard.

### Web Search for Fact-Checking

LLMs can hallucinate or imprecisely state historical and factual details. The lecture uses the Taj Mahal as an illustration: a model might write that it was "built in 1648," which captures the completion date but omits that construction was commissioned in 1631. A web search retrieves an authoritative snippet — with the exact dates and context — and that snippet is injected into the reflection prompt. The model can then revise the passage to reflect the full, accurate history rather than an inference from its training data.

### Word Count Enforcement

LLMs are notably unreliable at hitting exact word-count targets. When generating abstracts, blog posts, or summaries with a strict length requirement, the model may overshoot or undershoot by a significant margin. Integrating a simple programmatic word counter resolves this: after each draft is produced, the count is calculated deterministically, and if it exceeds the limit the exact count is reported back to the model alongside a request to try again. The model uses that concrete number to calibrate its next attempt, iterating until the constraint is met.

## Transition to Tool Use

Each of the three external-feedback examples above — code execution, pattern matching, web search, word counting — is in effect a tool: a piece of software that produces information the LLM could not derive on its own. The next module of the course generalizes this pattern into a systematic treatment of tool use, teaching how to have an LLM call different functions in a principled, structured way. Tool use builds directly on the foundation of reflection established in this module, and the combination makes agentic systems significantly more capable.

## Post-test

1. Describe the three-stage performance improvement curve the lecture uses to motivate external feedback, identifying what intervention corresponds to each inflection point.
2. How does regular-expression pattern matching function as external feedback in a content-generation workflow, and why is this more reliable than asking the model to self-censor?
3. What role does a programmatic word counter play in the reflection loop for length-constrained generation, and why is this preferable to relying on the model's own sense of length?

> [!example]- Answer Guide
> 
> #### Q1 — Three-Stage Performance Improvement Curve
> 
> Stage 1 — direct generation with prompt tuning: performance improves initially then plateaus as further tuning yields diminishing returns. Stage 2 — adding self-reflection and tuning the reflection prompt: a second bump in performance, then a second plateau because the model is still reasoning over fixed information. Stage 3 — introducing external feedback: the performance curve lifts to a higher trajectory because genuinely new, verifiable information enters the loop at each iteration.
> 
> #### Q2 — Regex Pattern Matching as External Feedback
> 
> A regular-expression scanner runs on the model's output after generation, deterministically finding any occurrence of competitor names. The result is an objective, factual signal ("Competitor X was mentioned") that is passed back as criticism. This is more reliable than asking the model to self-censor because the model may simply miss names it doesn't associate with competitors, or rationalize that a mention is acceptable; the scanner applies a consistent, rules-based check with no such ambiguity.
> 
> #### Q3 — Programmatic Word Counter in Reflection Loop
> 
> A programmatic counter measures the exact word count of a draft and reports it back to the model when the target is exceeded. The model uses that concrete number to understand by how much it overshot and adjusts its next draft accordingly. This is preferable to relying on the model's own sense of length because LLMs do not count tokens or words reliably and routinely miss explicit word-limit instructions; the external counter provides ground truth the model cannot argue with or misremember.
