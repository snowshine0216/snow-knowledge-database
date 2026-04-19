---
tags: [agentic-ai, deeplearning-ai, course, design-patterns, reflection, tool-use, planning, multi-agent]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/rm9bg7/agentic-design-patterns
---

## Pre-test

1. What distinguishes the **reflection** design pattern from a simple single-pass LLM prompt, and what role does external feedback (such as code execution output) play in making reflection more powerful?
2. In the **planning** design pattern, why is it significant that the LLM — rather than the developer — decides the sequence of steps to take, and what trade-off does this introduce compared to hard-coded pipelines?
3. How does the **multi-agent collaboration** pattern mirror human team structures, and what concrete evidence from research suggests it produces better outcomes for complex tasks?

---

# Lecture 008: Agentic Design Patterns

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/rm9bg7/agentic-design-patterns) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [Overview of the Four Patterns](#overview-of-the-four-patterns)
- [Reflection](#reflection)
- [Tool Use](#tool-use)
- [Planning](#planning)
- [Multi-Agent Collaboration](#multi-agent-collaboration)
- [Putting It All Together](#putting-it-all-together)

---

## Overview of the Four Patterns

Agentic workflows are assembled by combining simpler building blocks into more complex sequences. Rather than leaving developers to invent arbitrary combinations from scratch, a small set of recurring design patterns has emerged from practice and research. Andrew Ng identifies four key patterns that cover the vast majority of useful agentic architectures: **reflection**, **tool use**, **planning**, and **multi-agent collaboration**. Each pattern represents a different strategy for extending what a language model can accomplish beyond a single, isolated prompt-response exchange. The rest of this course explores each pattern in depth; this lesson provides an orienting overview of all four before the deeper dives begin.

Understanding these patterns matters because they are not merely implementation tricks. They shape how you structure prompts, how you wire components together, and — critically — where you can expect reliability versus experimentation. Some patterns are relatively mature and straightforward to control; others are powerful but introduce unpredictability that demands careful evaluation.

---

## Reflection

The reflection pattern is the simplest of the four to implement and often delivers a surprisingly meaningful bump in output quality. The core idea is to ask a language model to examine and critique its own earlier output, then use that critique as feedback for a second generation pass.

Consider a concrete coding scenario. An LLM is prompted to write a Python function for a given task and produces a first draft. Rather than accepting that draft as final, you construct a follow-up prompt that contains the original task description, the code the model just produced, and an explicit instruction: check this code carefully for correctness, style, and efficiency, and provide constructive criticism. The same model, prompted this way, is often able to identify genuine problems — logic errors, edge cases, inefficiencies — that it did not catch during initial generation. Taking that critique and feeding it back into another generation prompt typically yields an improved version.

The pattern becomes even more effective when external information sources supplement the model's self-critique. If you can actually execute the code and capture any error messages or test failures, feeding those concrete signals back to the model gives it grounding that pure self-reflection cannot provide. This combination — model critique plus real-world execution feedback — can drive iterative improvement through multiple rounds, producing a version three or four that is substantially better than the original single-shot output.

It is important to temper expectations: reflection is not magic, and it does not guarantee correct results every time. It improves the probability of a good outcome but does not eliminate failures. Developers should treat it as a technique that raises the expected quality of outputs, not one that makes failures impossible.

A natural extension of reflection connects it to multi-agent thinking. Instead of having the same model critique its own work, you can introduce a dedicated critic agent — a separate LLM instance (or even the same model under a different system prompt) whose job is explicitly to identify errors, suggest unit tests, or rank alternative approaches. By having a generator agent and a critic agent exchange outputs back and forth, you create a simulated review loop that can catch categories of mistakes that a single-agent self-critique might miss.

---

## Tool Use

The tool use pattern addresses one of the fundamental limitations of a language model operating in isolation: its knowledge is frozen at training time, and it cannot take actions in the world. By providing an LLM with callable functions — tools — you allow it to reach out for current information, execute computations, and interact with external systems.

Practical examples illustrate the range of what tool use enables. If a user asks which coffee maker reviewers currently rate most highly, a model equipped with a web search tool can actually query the internet, retrieve recent reviews, and synthesize a well-grounded answer rather than relying on potentially stale training data. If a user poses a compound interest calculation, a model with a code execution tool can write a short script, run it, and return the numerically correct answer rather than attempting mental arithmetic that may introduce errors.

The landscape of tools that developers have built for LLMs has grown rapidly. Common categories include mathematical and data analysis tools, web and database retrieval tools, productivity application interfaces (email, calendar, task management), and multimodal processing tools for images, audio, and documents. What makes tool use architecturally significant is that the model itself decides which tool to invoke and when. This decision-making capacity is what allows the model to handle open-ended queries where the right answer depends on the specific information retrieved at runtime — not on what the model memorized during training.

---

## Planning

The planning pattern pushes autonomy one step further: instead of executing a fixed, developer-specified sequence of steps, the LLM reasons about what steps are needed and constructs the plan itself. A concrete research illustration comes from the HuggingGPT paper. Given a complex multi-modal request — generate an image of a girl reading a book in the same pose as a boy in a reference image, then describe the result aloud — the system autonomously decomposes the goal into a pipeline: first apply a pose-estimation model to extract the boy's pose, then use image generation conditioned on that pose to create the girl's image, then apply image-to-text captioning, and finally convert the text to speech. Each step is an API call; the model decided the right API calls and their ordering without the developer pre-specifying the pipeline.

This ability to dynamically sequence actions is powerful because many real-world tasks do not have a fixed, predetermined structure. The appropriate steps depend on the specific input, and a planning agent can adapt its strategy at runtime. However, planning agents are currently harder to control than simpler, hard-coded workflows. Because the model decides the plan, it may choose unexpected paths or make incorrect assumptions about what steps are feasible. For this reason, planning is described as somewhat experimental — capable of producing impressive results, but requiring robust evaluation frameworks to verify correctness and catch failures.

---

## Multi-Agent Collaboration

The multi-agent collaboration pattern draws a deliberate analogy to human organizational structures. Just as a manager assembles a team of specialists to tackle a complex project — each person contributing a distinct area of expertise — a multi-agent workflow assembles a team of simulated agents, each defined by a distinct role and system prompt, that work together toward a shared goal.

The ChatDev project, created by Chen Qian and collaborators, provides a vivid demonstration. ChatDev simulates an entire virtual software company populated by agents playing roles such as chief executive officer, programmer, tester, and designer. These agents communicate with one another, divide responsibilities, review each other's work, and collaboratively produce software artifacts — all driven by LLM calls operating under role-specific prompts.

A more accessible illustration is a marketing brochure workflow. Rather than prompting a single model to research, write, and polish a brochure in one pass, you instantiate three agents: a researcher that searches for relevant information, a marketer that drafts the content, and an editor that reviews and refines the text. Each agent focuses on what it does best, and their sequential (or sometimes parallel) collaboration produces output that tends to be stronger than what any single agent generates alone.

Research findings support this intuition: multi-agent workflows have been shown to improve outcomes on complex tasks such as biographical writing and strategic game play. The mechanism is that specialization and division of labor reduce the cognitive overload on any single model instance, and that inter-agent critique catches errors that self-critique misses.

The trade-off, as with planning, is control. In a multi-agent system, you cannot always predict in advance what each agent will do or how their interactions will unfold. This unpredictability demands investment in evaluation tooling — you need ways to measure system-level outcomes, not just individual agent outputs, in order to detect regressions and guide improvement.

---

## Putting It All Together

The four design patterns — reflection, tool use, planning, and multi-agent collaboration — are not mutually exclusive. Real agentic systems often combine them: a planning agent might invoke tool-use to gather information, route subtasks to specialized sub-agents, and use reflection loops within each sub-agent to improve output quality before passing results upstream. The patterns are building blocks for building blocks, providing a vocabulary for reasoning about agentic system design.

A consistent theme across all four patterns is the importance of evaluation. Because agentic systems iterate, branch, and produce emergent behaviors that are difficult to predict, investing in evals that measure end-to-end performance is not optional — it is the mechanism by which you distinguish whether a design choice is genuinely helping. The next module will dive deeply into the reflection pattern, examining how to implement it and what performance gains are realistically achievable.

---

## Post-test

1. Describe the reflection design pattern in your own words. What is the minimal implementation — what inputs and outputs are involved — and how does adding code execution feedback extend the basic version?
2. The HuggingGPT paper is used to illustrate the planning pattern. What specific task was used as the example, and why does that task illustrate dynamic step sequencing rather than a fixed pipeline?
3. What are the two main trade-offs that the lecture identifies for both the planning and multi-agent collaboration patterns, and why does the instructor recommend developing evaluation tooling as a response to those trade-offs?

---

<details><summary>Answer Guide</summary>

**Q1 — Reflection:**
At its simplest, reflection feeds the model's own output back into a new prompt that asks the model to critique it (inputs: original task + generated output; outputs: critique, then revised output). Adding code execution extends this by providing external, ground-truth signals — actual error messages or test failures — that are more objective than pure self-critique, enabling multiple iterative rounds toward a more correct solution.

**Q2 — Planning / HuggingGPT:**
The example task was: generate an image of a girl reading a book in the same pose as a boy in a reference image, then describe the resulting image aloud. This illustrates dynamic sequencing because the correct pipeline — pose estimation → conditioned image generation → image captioning → text-to-speech — is not known at design time; it depends on the nature of the input. The LLM constructs the plan at runtime rather than executing a fixed set of developer-specified steps.

**Q3 — Trade-offs and evals:**
Both planning and multi-agent collaboration make system behavior harder to predict and control: the LLM (or ensemble of LLMs) makes decisions that the developer did not hard-code, so unexpected paths and compounding errors become possible. The instructor recommends evaluation tooling because, without a way to measure end-to-end outcomes objectively, you cannot tell whether a design choice is genuinely improving performance or just shifting failure modes. Evals provide the feedback signal needed to iterate productively.

</details>
