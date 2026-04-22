---
tags: [rag, agentic-rag, agents, tool-use, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/aam1f5/agentic-rag
---

## Pre-test

1. **A naive RAG system sends every user query through retrieval, even when the answer is trivially available from the LLM's parametric knowledge. What architectural pattern directly solves this inefficiency, and what capability does the pattern require from the component that implements it?**

2. **In a multi-step agentic RAG workflow, a designer must choose which model to assign to each stage — routing, retrieval evaluation, response generation, and citation addition. What principle should guide those assignments, and what practical advantage does following the principle provide?**

3. **Iterative and conditional workflows both involve branching logic, but they differ in a key structural way. Describe the structural difference and give one concrete RAG-specific example of each.**

---

# Lecture 051: Agentic RAG

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/aam1f5/agentic-rag | DeepLearning.AI | Retrieval-Augmented Generation Course

## Outline

1. [From Single LLM to Multi-LLM Systems](#1-from-single-llm-to-multi-llm-systems)
2. [Anatomy of an Agentic RAG Pipeline](#2-anatomy-of-an-agentic-rag-pipeline)
3. [Four Workflow Patterns](#3-four-workflow-patterns)
4. [Model Selection Across Workflow Stages](#4-model-selection-across-workflow-stages)
5. [Implementation Considerations](#5-implementation-considerations)
6. [The Mindset Shift: LLMs as Modular Components](#6-the-mindset-shift-llms-as-modular-components)

---

## 1. From Single LLM to Multi-LLM Systems

The simplest RAG architecture connects a retriever and a single LLM: a query arrives, the retriever fetches relevant documents, the documents and query are assembled into a prompt, and the LLM produces a response. This design is easy to reason about and straightforward to implement, which is why it is the right starting point for any RAG project — as established back in [[003-introduction-to-rag]].

As a system matures and quality expectations rise, the monolithic single-LLM design begins to show its limits. The LLM is asked to do many things at once: filter irrelevant passages, synthesise information from multiple sources, stay grounded in the retrieved context, format the response correctly, and optionally add citations. Asking one model to handle all of these concerns simultaneously means accepting a performance ceiling set by the weakest link in that model's capabilities for each task.

Agentic workflows break this single-LLM assumption in two complementary ways. First, the overall task is decomposed into a sequence of discrete steps, each of which can be assigned to its own LLM call — a different model or a differently prompted invocation of the same model. Second, models are given access to external tools: a code interpreter, a web browser, or, in the RAG case, a vector database that the model can query programmatically. The result is a system in which the LLM is no longer just an end-processor; it becomes an active participant that can invoke tools and hand off work to other specialised models.

This architectural shift is not purely theoretical. You have already seen smaller versions of it in the course: [[047-prompt-engineering-advanced-techniques]] covered query expansion and prompt rewriting — each of which can be implemented as a lightweight, upstream LLM step. Agentic RAG generalises that idea into a principled design pattern applicable to the entire pipeline.

---

## 2. Anatomy of an Agentic RAG Pipeline

A concrete agentic RAG pipeline illustrates how the general principles translate into a working system. Consider the following flow:

A user submits a query. The query first reaches a **router LLM** — a small, purpose-tuned model whose only job is to answer a binary question: does this query require information from the vector database, or can it be answered from the model's parametric knowledge? The router outputs exactly one of two signals: retrieve or skip.

If the router signals skip, the query is forwarded directly to a generation LLM, bypassing the retrieval machinery entirely. This is an important optimisation: queries like "what is two plus two" or "summarise what I just told you" do not benefit from retrieval and would only be harmed by injecting irrelevant retrieved passages.

If the router signals retrieve, the query passes to the vector database, and a set of candidate documents is returned. An **evaluator LLM** then examines the retrieved set and decides whether the documents are collectively sufficient to answer the question. If they are not sufficient — perhaps the relevant information is split across documents that were partially retrieved, or the top results are off-topic — the evaluator can request an additional retrieval pass, potentially with a reformulated query. This loop continues until the evaluator is satisfied.

Once sufficient context has been assembled, a **generation LLM** constructs the response from the augmented prompt. A final **citation LLM** post-processes the response to identify claims that correspond to specific retrieved passages and adds inline references. Each model in this chain is responsible for exactly one task and operates with full awareness of the output of the preceding stage.

The key insight is that this entire pipeline is just a flowchart. Every node in the diagram is still a standard LLM call — text in, text out — but the routing logic connecting those calls determines which node executes next, how many times the loop iterates, and when the system terminates. Building an agentic RAG system is fundamentally an exercise in flowchart design.

---

## 3. Four Workflow Patterns

Real agentic systems are built from a small vocabulary of composable workflow patterns. Understanding each pattern clearly makes it possible to combine them deliberately.

**Sequential workflows** pass a prompt through a fixed, linear chain of LLM steps. Every query follows the same path with no branching. A typical sequential RAG chain might include a query parser, a query rewriter (as described in [[047-prompt-engineering-advanced-techniques]]), the generation step, and a citation annotator. The appeal of sequential workflows is their predictability: the control flow is fully deterministic, latency is the sum of individual step latencies, and debugging is straightforward because the execution trace never forks.

**Conditional workflows** introduce branching by using an LLM — typically called a router — to classify the input and direct it down one of several paths. The router LLM in the pipeline described in section 2 is an example of a conditional workflow: two possible downstream paths exist, and the router selects one. More sophisticated conditional workflows might have a router choose among several specialised generation models, each tuned for a different query type or domain.

**Iterative workflows** add loops to the conditional pattern. Instead of routing the prompt to a downstream model, a conditional node routes it back to an earlier stage, forming a cycle that repeats until a termination condition is satisfied. An evaluator LLM implementing a code-review loop illustrates this: the evaluator assesses each draft of generated code, identifies failures, and routes the feedback back to the generation model until the code passes all checks or a maximum iteration count is reached.

**Parallel workflows** use an orchestrator LLM to decompose the original prompt into independent sub-tasks, dispatch each sub-task to a separate LLM worker, and then use a synthesiser LLM to merge the individual outputs into a coherent final response. Parallel workflows are appropriate when the query inherently contains distinct parts that can be processed independently — for example, comparing two research papers, where each paper can be summarised by its own dedicated model before a synthesiser combines the summaries. This pattern bears similarity to the [[022-hybrid-search]] strategy of running multiple retrieval passes in parallel before merging results: both exploit independence to reduce overall latency and improve coverage.

These four patterns are not mutually exclusive. Most production agentic RAG systems combine them: a sequential backbone with conditional routing at select stages, iterative loops for quality-critical steps, and parallel sub-tasks when the query warrants decomposition.

---

## 4. Model Selection Across Workflow Stages

One of the most practically significant design freedoms in an agentic workflow is the ability to use different models at different stages. This freedom, used well, produces systems that are simultaneously more capable and more cost-efficient than any single-model architecture could be.

The guiding principle is task-model alignment: match the complexity and cost of the model to the difficulty of the task it is asked to perform. Router LLMs and evaluator LLMs have narrow, well-defined jobs. A router needs only to output a binary signal. An evaluator needs only to judge whether a set of documents contains sufficient information to answer a question. Both tasks can be handled by small, fast, and inexpensive models — models that would be entirely inadequate for open-ended response generation but that are more than capable for these bounded classification tasks.

Conversely, the generation step — where a coherent, accurate, and well-structured response must be assembled from multiple retrieved documents — typically benefits from a larger, more capable model. Similarly, citation generation requires a model that can reliably cross-reference claims in a generated response against specific passages in the retrieved set, a task that is harder than binary routing but easier than full generation, suggesting a mid-tier model.

The economic implication is substantial. In a naive single-LLM architecture, every query is processed by the most expensive model in the system for every step. In an agentic architecture, expensive model calls are reserved for the steps that genuinely require them. Many queries will be routed away from retrieval entirely (no retrieval cost, cheaper generation), and the evaluation and citation steps can be handled by lightweight models. The aggregate cost per query is lower, and the quality of the expensive generation step is higher because the model receives better-prepared context from the upstream stages.

---

## 5. Implementation Considerations

For simple agentic systems, the routing logic, loop conditions, and model invocations can be implemented directly in application code. A Python function that calls a router model, branches on its output, calls a retriever, calls an evaluator, loops as necessary, calls a generator, and calls a citation model is entirely readable and maintainable. This direct implementation approach keeps the control flow explicit and avoids any dependency on external orchestration libraries.

As the workflow grows in complexity — more conditional paths, nested loops, parallel branches, dynamic tool selection — managing the control flow by hand becomes error-prone. This is where dedicated agentic frameworks become useful. Libraries and platforms designed for multi-agent orchestration provide abstractions for defining workflows declaratively, managing state across steps, handling failures and retries, and observing the execution trace. The specific choice of framework is secondary to understanding the underlying workflow patterns; the frameworks are implementation conveniences, not substitutes for clear architectural thinking.

One practical consideration is failure handling. Unlike a single LLM call, an agentic pipeline has multiple points of failure: any individual model call can fail, return an unexpected output format, or produce a response that the next stage cannot process. Robust agentic systems include fallback paths — for example, if the evaluator LLM fails to parse a retrieval result, the system should have a default path rather than crashing — and should cap iterative loops with a maximum iteration count to prevent unbounded execution.

Observability is another practical concern. When a multi-stage pipeline produces a poor final response, identifying which stage is responsible requires logging the inputs and outputs of every model call in the pipeline. Without this trace, debugging is effectively impossible. This connects directly to the evaluation principles in [[050-evaluating-your-llms-performance]] and [[023-evaluating-retrieval]]: component-level evaluation assumes you can isolate the inputs and outputs of each component, which in turn assumes those inputs and outputs are recorded.

---

## 6. The Mindset Shift: LLMs as Modular Components

Agentic RAG represents more than an engineering technique — it encodes a fundamental shift in how to think about large language models in a system context.

In the early framing of LLM-based applications, a single model was treated as a solution in itself: you gave it a well-crafted prompt and expected it to handle everything. Performance improvements came from better prompts, larger models, or more context. This framing makes the LLM a monolith: capable, but opaque and brittle when it encounters tasks outside its core strengths.

The agentic framing reverses this: LLMs are modular components whose strengths can be narrowly scoped to specific tasks within a larger system. A model that is mediocre at general-purpose response generation may be excellent at binary routing decisions. A model that struggles with long-form synthesis may be outstanding at claim-level citation verification. The agentic architecture makes it possible to exploit these narrow strengths without asking any single model to cover all its weaknesses.

This modular perspective also changes what "good enough" means. In a monolithic architecture, you need the best affordable general-purpose model because that one model must excel at every task. In an agentic architecture, you are more than willing to use smaller, cheaper, task-specialised models — because their capabilities are well-matched to the specific portions of the workflow they own. The overall system quality emerges from the composition of well-matched components rather than from the ceiling of any single component.

The creative design space that opens up is genuinely large. Any step in a RAG pipeline that currently relies on heuristics, rules, or user-facing quality tuning is a candidate for replacement with a purpose-tuned LLM stage. Any output that is currently passed directly to the end user without post-processing is a candidate for an evaluator or citation stage. Building an agentic RAG system means continuously asking: which decisions in this pipeline could be made better by a specialised LLM, and how should its output connect to the next stage?

---

## Post-test

1. **A router LLM outputs "no retrieval needed" for a query that would actually benefit from retrieval. Describe what happens downstream in the agentic pipeline, and explain what design change would make the router more conservative in skipping retrieval for ambiguous queries.**

2. **An iterative workflow is used to refine generated code until an evaluator LLM approves it. What termination risk exists in this design, and what two mechanisms should every iterative workflow include to prevent it?**

3. **In an agentic RAG pipeline, the evaluator LLM decides the retrieved documents are insufficient and requests a second retrieval pass. What should be different about the second retrieval query compared to the first, and what upstream capability is required to produce that difference?**

> [!example]- Answer Guide
> 
> #### Q1 — Router Skips Retrieval Downstream Effects
> 
> If the router incorrectly skips retrieval, the query is forwarded directly to the generation LLM without any retrieved context. The generation LLM must answer entirely from its parametric knowledge, risking a response that is stale, domain-inappropriate, or hallucinated. The output will not reference any documents from the knowledge base. To make the router more conservative, its classification prompt or fine-tuning objective should be adjusted to shift the decision boundary: when a query is ambiguous — meaning the router is not highly confident in "skip" — it should default to "retrieve" rather than "skip." This asymmetric error preference accepts some unnecessary retrieval calls in exchange for much fewer missed retrievals on genuinely knowledge-base-dependent queries.
> 
> #### Q2 — Iterative Loop Termination Risk
> 
> The termination risk is an infinite loop: if the generated code never satisfies the evaluator — whether because the task is too hard, the evaluator's criteria are too strict, or the generation model is stuck in a local failure mode — the loop continues indefinitely, consuming compute and accumulating costs. Two mechanisms prevent this: (1) a hard cap on the maximum number of iterations, after which the system exits the loop and either returns the best draft produced so far or escalates to a human reviewer; (2) a convergence check that detects when successive drafts are not improving and exits early. Both mechanisms must be implemented at the control-flow level, not inside the evaluator LLM, because the evaluator itself may be the source of the non-termination.
> 
> #### Q3 — Reformulated Second Retrieval Query
> 
> The second retrieval query should be a reformulated version of the original — rewritten to target the specific informational gap that the evaluator identified after examining the first retrieved set. If the evaluator determined that the first set of documents answered part of the question but lacked specific domain details, the reformulated query should be more specific, potentially using different keywords or including additional context terms. Producing this reformulation requires that the evaluator's output include not just a binary "insufficient" signal but a natural-language description of what is missing — and that a downstream step (another LLM call or rule-based logic) translates that description into an improved query. This is effectively a structured form of [[047-prompt-engineering-advanced-techniques]] query rewriting, applied iteratively within a retrieval loop.
