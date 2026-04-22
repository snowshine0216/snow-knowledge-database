---
tags: [agentic-ai, deeplearning-ai, course, llm, agents, introduction]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/pu5xbv/welcome
---

## Pre-test

1. Andrew Ng coined the term "agentic" to describe a specific trend in AI application development. What precise characteristic of that trend does the term capture, and why does he consider mastery of it one of the most important skills in AI today?
2. The instructor identifies a single differentiator that separates developers who are highly effective at building agentic workflows from those who are less effective. What is that differentiator, and why might it be non-obvious?
3. Agentic workflows are described as enabling applications that "would be impossible" without them. What concrete domains does the instructor cite, and what does that range of domains imply about the generality of the agentic pattern?

---

# Lecture 001: Welcome

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/pu5xbv/welcome) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [The Origin and Hype Around "Agentic AI"](#the-origin-and-hype-around-agentic-ai)
- [Real-World Applications of Agentic Workflows](#real-world-applications-of-agentic-workflows)
- [The Decisive Skill: Disciplined Development with Evals](#the-decisive-skill-disciplined-development-with-evals)
- [What This Course Will Cover](#what-this-course-will-cover)

---

## The Origin and Hype Around "Agentic AI"

Andrew Ng opens by acknowledging that he coined the word "agentic" to name what he saw as an important and rapidly emerging pattern in how practitioners were building on top of large language models. The intent was descriptive: a category of LLM application in which the model does not merely respond once to a prompt but instead acts, reasons across steps, and uses tools or other models to accomplish a longer-horizon goal. The term gained traction — and then gained far more traction than he anticipated.

The problem with that success is well known to anyone who has watched a useful technical label become a marketing term. Vendors attached "agentic" to products whether or not the label was accurate, and the hype index for agentic AI climbed sharply. Ng is candid about this inflation: a lot of what is marketed as agentic is not meaningfully so.

The good news, however, is that beneath the noise the underlying substance has grown too. The number of genuinely valuable, working applications built on real agentic architectures has expanded rapidly — not as rapidly as the hype, but substantially. The course is designed to cut through the marketing fog and focus on the techniques that produce results.

## Real-World Applications of Agentic Workflows

To ground the concept before defining it formally, Ng surveys the kinds of applications that agentic workflows already power. Customer support agents that resolve inquiries end-to-end, deep research pipelines that synthesize information into insightful reports, legal document analysis tools, and medical systems that take patient-described symptoms and surface differential diagnoses — these all exist in production today. What they share is that no single LLM call could accomplish them; each requires the model to plan, call external tools or databases, evaluate intermediate outputs, and iterate.

Ng notes that on many of his own teams, projects that matter most simply could not be built without agentic patterns. This is not hyperbole for course marketing; it reflects a real engineering constraint. Tasks with sufficient complexity, ambiguity, or length exceed what a single forward pass through a model can reliably accomplish. Agentic decomposition — breaking the problem into subtasks, routing control flow, using memory and tools — is the mechanism that brings these hard problems into reach.

## The Decisive Skill: Disciplined Development with Evals

The most important observation in this opening lecture is not about architecture or tooling but about process. Ng has watched many developers attempt to build agentic workflows, and he has identified the single clearest separator between those who succeed and those who struggle: the ability to run a disciplined development process that centers on evaluations and error analysis.

This is non-obvious because it sounds like general software engineering advice. But in the agentic context it is especially critical. Agentic systems are probabilistic and long-horizon, which means failures can emerge deep in a multi-step pipeline, can be caused by compounding small errors across steps, and can be hard to reproduce. Developers who treat building an agentic application as "prompt and hope" are constantly surprised by these failures. Developers who instrument their pipelines with evals — structured tests that measure whether the system produces acceptable outputs on representative inputs — can locate and fix errors systematically.

Error analysis closes the loop: when an eval reveals a failure, you inspect the traces to understand which step failed and why, then fix that step in isolation before re-running the full pipeline. This cycle, iterated, is how agentic systems go from fragile demos to reliable products. The course will elaborate on what good evals look like and how to build the infrastructure that supports this workflow.

## What This Course Will Cover

The course promises to make agentic AI concrete, practical, and learnable. Ng frames the goal as equipping practitioners with best practices and expanding their sense of what is now buildable. Beyond technical patterns, the course will teach the development discipline — particularly around evals — that separates hobbyist experimentation from professional-grade agentic engineering.

The next video dives directly into defining what agentic workflows are, establishing the conceptual foundation the rest of the course will build on.

---

## Post-test

1. What problem does Andrew Ng identify with the widespread adoption of the word "agentic" by the broader industry, and what is his bottom-line assessment despite that problem?
2. Name at least three application domains the instructor uses to illustrate real-world agentic deployments, and explain why each one requires a multi-step approach rather than a single LLM call.
3. According to the lecture, what specific development practice most strongly predicts success when building agentic workflows, and what two activities does that practice combine?

> [!example]- Answer Guide
> 
> #### Q1 — Hype vs. Real Value of "Agentic"
> 
> Ng says marketers attached "agentic" to almost every product indiscriminately, causing hype to skyrocket beyond the actual state of the technology. His bottom-line assessment is nonetheless positive: genuine, valuable agentic applications have also grown rapidly, and the course focuses on that real substance rather than the hype.
> 
> #### Q2 — Real-World Agentic Application Domains
> 
> The domains cited are:
> 
> (a) **Customer support agents** — require multi-turn reasoning and tool access to actually resolve a user's issue;
> 
> (b) **Deep research and report generation** — require search, retrieval, synthesis, and iterative refinement across many documents;
> 
> (c) **Legal document analysis** — requires parsing complex language, cross-referencing clauses, and applying domain knowledge across a lengthy document;
> 
> (d) **Medical diagnosis suggestion** — requires gathering patient history, mapping symptoms to differentials, and possibly querying medical knowledge bases.
> 
> Each exceeds what a single prompt-response cycle can reliably do.
> 
> #### Q3 — Development Practice Predicting Success
> 
> The practice is running a disciplined development process centered on **evals and error analysis**. Evals provide structured, repeatable measurement of whether the system works; error analysis examines failures to locate which pipeline step caused them and why, enabling targeted fixes rather than undirected prompt tweaking.
