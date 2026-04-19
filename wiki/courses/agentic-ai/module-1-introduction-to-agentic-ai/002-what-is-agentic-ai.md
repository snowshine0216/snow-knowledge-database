---
tags: [agentic-ai, deeplearning-ai, course, llm, agents, definition]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/nae3i1/what-is-agentic-ai
---

## Pre-test

1. A standard single-pass LLM prompt and an agentic workflow are both asked to write an essay. What structural property of the single-pass approach makes it systematically inferior for complex writing tasks, and why does iteration overcome that limitation?

2. The lesson describes a multi-step essay-writing agentic workflow that includes a "human in the loop" step. What specific role does that human step play, and at what point in the pipeline does it appear?

3. The instructor argues that task decomposition is the central skill for building agentic workflows. What two sub-skills does he identify within decomposition, and why does he describe mastering them as "tricky but important"?

---

# Lecture 002: What is Agentic AI

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/nae3i1/what-is-agentic-ai) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [The Single-Pass Problem](#the-single-pass-problem)
- [What an Agentic Workflow Looks Like](#what-an-agentic-workflow-looks-like)
- [A Concrete Pipeline: Essay Writing](#a-concrete-pipeline-essay-writing)
- [The Running Example: A Research Agent](#the-running-example-a-research-agent)
- [The Spectrum of Autonomy](#the-spectrum-of-autonomy)
- [Key Takeaway: Task Decomposition as Core Skill](#key-takeaway-task-decomposition-as-core-skill)

---

## The Single-Pass Problem

Most people's first encounter with a large language model follows a simple pattern: you type a prompt, and the model produces a response in one uninterrupted pass from the first token to the last. The instructor uses a vivid analogy to illustrate why this is limiting. Imagine being told to write an essay — but you must begin at word one and type straight through to the final word without ever pressing backspace. No pausing to reconsider structure, no revisiting an earlier paragraph once you have a better idea, no opportunity to look something up mid-draft. That constraint would cripple even the most capable human writer, yet it precisely describes what a standard LLM prompt demands of the model.

This is not merely a stylistic complaint. The single-pass regime forces the model to commit to every decision simultaneously: the overall argument, the supporting evidence, the transitions, the tone. If an early assumption turns out to be wrong, it propagates forward uncorrected. The model cannot step back, notice the problem, and repair it the way a human editing a document naturally would. Despite this, current LLMs perform surprisingly well under the constraint — which makes the gains from removing the constraint all the more striking.

## What an Agentic Workflow Looks Like

An agentic workflow breaks the single-pass mold by allowing a system to execute multiple steps, with each step informing the next. Applied to the same essay task, the process might unfold as follows: the system first drafts an outline, then decides whether additional research is needed, performs web searches and retrieves relevant pages, writes an initial draft, reads that draft critically to identify weak sections, conducts further research where needed, revises, and so on. The loop continues until the output meets some quality criterion or a fixed number of iterations is reached.

This iterative structure mirrors how skilled human professionals actually work. A researcher does not sit down and write a polished paper from beginning to end without stopping; she reads, thinks, drafts, rereads, revises, and often returns to the literature. Agentic AI workflows encode that same rhythm into software. The tradeoff is time: iteration costs more compute and takes longer than a single pass. But the resulting work product is substantially better — a return on investment that becomes increasingly attractive as the complexity of the task grows.

## A Concrete Pipeline: Essay Writing

The instructor walks through a specific agentic pipeline for essay writing that makes these ideas concrete. The pipeline chains together several LLM calls, each with a distinct responsibility:

The first LLM call produces an essay outline, establishing the structure before any prose is committed. A second call determines what search terms to issue to a web search API, translating the essay's information needs into actionable queries. The retrieved web pages are fed into a third LLM call that synthesizes the external information and writes a first draft grounded in those sources. A fourth LLM call then reads the draft as a critic, identifying which claims need stronger evidence and which sections lack coherence.

At this point the workflow may optionally insert a human-in-the-loop step. The LLM is given the ability to flag certain facts — perhaps contested data points or legally sensitive claims — for human review before revision proceeds. Once that feedback is incorporated, the system produces a revised draft. The full pipeline delivers an output that is more accurate, more coherent, and better supported than anything a single prompt could produce.

## The Running Example: A Research Agent

Throughout the course, the instructor uses a research agent as the primary worked example. The agent accepts a research question — the demonstration uses "How do I build a new rocket company to compete with SpaceX?" — and executes a full autonomous research cycle. It plans which sources to consult, issues web searches, downloads and synthesizes web pages, drafts an outline, passes the outline to a separate editor agent that reviews for coherence, and finally generates a comprehensive structured report in Markdown.

The instructor notes that this kind of agent has direct practical value. He has personally built specialized research agents for legal compliance, healthcare, and business product analysis. The pattern of finding and loading multiple sources, thinking deeply about their implications, and synthesizing a structured output generalizes across domains. Learning to build this one example therefore equips learners to tackle a broad range of real-world agentic applications.

## The Spectrum of Autonomy

The research agent shown in the demo sits at the complex, highly autonomous end of a spectrum. The instructor signals that the next lesson will explore that spectrum in depth, providing a framework for thinking about how autonomous different agentic workflows are and how that choice affects ease of implementation, reliability, and appropriate use cases. Not every valuable agentic workflow needs to be fully autonomous; some of the most useful applications involve simpler structures with more human oversight.

## Key Takeaway: Task Decomposition as Core Skill

The central skill this course aims to build is task decomposition: the ability to take a complex goal and break it into a sequence of smaller, well-defined steps that an LLM-based system can execute reliably. This involves two sub-skills. The first is knowing how to partition a task — understanding which boundaries between steps reduce error propagation, which operations benefit from separate LLM calls, and which intermediate outputs are worth storing. The second is knowing how to build the components that execute each step well, designing prompts, tool integrations, and feedback loops that make each stage robust.

The instructor describes this as tricky because the right decomposition is rarely obvious from the task description alone. A poor partition can multiply errors across steps rather than containing them, and components that work well in isolation can fail when chained together. Mastering decomposition is therefore not a one-time design decision but an ongoing engineering discipline — and it is the skill that determines the ceiling of what an agentic workflow can achieve.

---

## Post-test

1. What analogy does the instructor use to explain why single-pass LLM prompting is limiting, and what fundamental writing practice does it prevent?

2. Describe the sequence of LLM calls in the essay-writing agentic pipeline presented in the lesson, including when and why a human-in-the-loop step might be inserted.

3. What are the two sub-skills of task decomposition that the instructor identifies as central to building agentic workflows, and what happens when the decomposition is done poorly?

<details><summary>Answer Guide</summary>

**Q1 — Single-pass analogy**
The instructor compares standard LLM prompting to asking a human to write an essay from the first word to the last without ever pressing backspace — a completely linear, non-revisable process. This prevents the writer (human or AI) from reconsidering earlier decisions in light of later discoveries, correcting errors once they are recognized, or looking up information mid-draft. Iteration removes this constraint, enabling the kind of reflective, recursive process that produces higher-quality writing.

**Q2 — Essay-writing pipeline sequence**
(1) Draft an essay outline. (2) Determine web search terms and query a search API to retrieve relevant pages. (3) Feed downloaded pages into an LLM to write a first draft grounded in external sources. (4) Have a separate LLM call read the draft critically and identify sections needing revision or additional research. (5) Optionally, invoke a human-in-the-loop step where the LLM requests human review of specific facts — inserted before final revision to catch contested or sensitive claims. (6) Revise the draft based on all feedback.

**Q3 — Two sub-skills of decomposition and failure modes**
The first sub-skill is knowing how to partition a complex task into the right steps — identifying which boundaries minimize error propagation and which operations benefit from separate LLM invocations. The second is building the components that execute each step reliably, including well-designed prompts, tool integrations, and feedback mechanisms. When decomposition is poor, errors multiply across steps rather than staying contained, and components that work individually can fail when chained — meaning the quality ceiling of the entire workflow is set by the weakest partition decision.

</details>
