---
tags: [agentic-ai, deeplearning-ai, course, task-decomposition, workflow, planning, agents]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/moivygo8/task-decomposition-identifying-the-steps-in-a-workflow
---

## Pre-test

1. When an agentic workflow produces essays that feel disjointed — where the beginning, middle, and end lack consistency — what is the recommended corrective strategy discussed in the lesson, and why does it work better than simply prompting harder?

2. For each discrete step identified during task decomposition, what is the single most important question the instructor says you must ask before finalizing that step in the workflow?

3. The lesson describes three distinct categories of building blocks available when constructing agentic workflows. Name all three, and give at least one concrete example of a tool within each category.

---

# Lecture 006: Task Decomposition — Identifying the Steps in a Workflow

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/moivygo8/task-decomposition-identifying-the-steps-in-a-workflow) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [The Core Problem: From Work to Workflow](#the-core-problem-from-work-to-workflow)
- [Example 1: The Research Essay Agent](#example-1-the-research-essay-agent)
- [Iterative Refinement Through Decomposition](#iterative-refinement-through-decomposition)
- [Example 2: Customer Order Inquiry](#example-2-customer-order-inquiry)
- [Example 3: Invoice Processing](#example-3-invoice-processing)
- [The Building Blocks of Agentic Workflows](#the-building-blocks-of-agentic-workflows)
- [The Decomposition Heuristic](#the-decomposition-heuristic)

---

## The Core Problem: From Work to Workflow

People and businesses do an enormous amount of work every day. The foundational challenge in agentic AI engineering is translating that work — which humans carry out fluidly, drawing on intuition, memory, and judgment — into discrete, executable steps that an agentic system can reliably follow. This translation process is called task decomposition.

Task decomposition is not a mechanical procedure. It requires the builder to study how humans actually perform a task, identify where natural breaks occur in that reasoning process, and then ask whether each resulting step is something an AI model or a software tool can handle. The goal is to arrive at a sequence of steps that is simultaneously granular enough to be implementable and coherent enough to produce a high-quality result.

---

## Example 1: The Research Essay Agent

The instructor opens with one of the most instructive cases: building an agent that writes a well-researched essay on a given topic. The naive approach is direct generation — you prompt an LLM and ask it to produce the essay in a single pass. This is fast and simple, but the output tends to be shallow. The model covers only surface-level facts and obvious points, because it has no mechanism for going deeper into the subject.

The first act of decomposition is to ask: how would a thoughtful human write this essay? A human would not simply sit down and type from start to finish. Instead, a human might:

1. Write an essay outline.
2. Search the web to gather relevant information.
3. Write the essay using the outline and web search results as inputs.

This three-step decomposition immediately improves the potential quality of the output, because each step is now something that can be evaluated individually. For each step, the key diagnostic question is: **can this step be carried out by an LLM, or by a short piece of code, or by a function call, or by a tool?** Applying that test here yields positive answers across the board: an LLM can draft an outline on most topics, an LLM can generate search queries and a web search tool can execute them, and an LLM can synthesize search results into coherent prose.

---

## Iterative Refinement Through Decomposition

After implementing the three-step workflow, the instructor encountered a new problem: the resulting essays still felt disjointed. The beginning did not feel consistent with the middle, and the middle did not feel consistent with the end. The whole read as though different parts had been written in isolation without a unifying thread.

This is a common failure mode, and the response it calls for is further decomposition — not prompting harder or switching models, but breaking a problematic step into additional sub-steps. In this case, step three ("write the essay") was the culprit. Writing an entire essay in a single LLM call asks too much of the model in one shot. The natural fix is to mirror what a careful human writer would do:

1. Write a first draft.
2. Read over the draft and identify what needs revision (a self-critique step).
3. Revise the draft based on that critique.

The progression from initial design to final design now looks like: one step (direct generation) → three steps → five steps (with step three expanded into three sub-steps). Each expansion was motivated by observing a concrete quality failure and asking how a skilled human would address it. This iterative pattern — decompose, implement, evaluate, decompose further — is the core rhythm of agentic workflow development.

---

## Example 2: Customer Order Inquiry

The second example shifts domain entirely: an agent that handles basic customer service emails about order status. A human customer service representative working through such an email would proceed through a recognizable sequence:

1. **Extract key information** from the email — who sent it, what they ordered, what the order number is. An LLM is well-suited to this extraction task.
2. **Query the database** to retrieve the customer's order record, shipping status, and other relevant details. An LLM equipped with the ability to call a database query function can handle this step.
3. **Write and send a reply** to the customer, drawing on the retrieved order information. An LLM with access to an email-sending API can execute this step.

This example illustrates that task decomposition applies equally well to structured, transactional workflows, not just open-ended creative or research tasks. In each case, the three-question test applies: can this step be done by an LLM, a piece of code, or a tool?

---

## Example 3: Invoice Processing

The third example is more narrowly scoped and emphasizes the practical integration of AI models with database tools. When processing a PDF invoice (after it has already been converted to text by a separate AI model), the workflow breaks down into two steps:

1. **Extract structured information** — the name of the biller, billing address, due date, amount due, and any other required fields. An LLM reading the text representation of the invoice can accomplish this reliably.
2. **Save the extracted data** to a database by calling a function that creates or updates the relevant record. An LLM with access to the appropriate function call can trigger this write operation.

This example also highlights a broader architectural insight: agentic workflows often involve heterogeneous AI models working together. A specialized model handles the PDF-to-text conversion upstream, and then an LLM handles the downstream text understanding and action-taking. Decomposition applies at the level of AI components as well as at the level of individual tasks.

---

## The Building Blocks of Agentic Workflows

When constructing any agentic workflow, the instructor describes the available building blocks in three categories:

**Large Language Models (and multimodal models).** LLMs are the primary reasoning component. They excel at generating text, deciding which tools to invoke, and extracting structured information from unstructured inputs. When the inputs include images or audio, large multimodal models extend these capabilities accordingly.

**Specialized AI models.** For certain tasks, a purpose-built AI model outperforms a general-purpose LLM. Examples include models that convert PDFs to text, perform text-to-speech synthesis, or carry out image analysis. These models slot into the workflow at the steps where their particular capability is needed, and the LLM orchestrates calls to them.

**Software tools.** This category encompasses a wide range of callable capabilities: external APIs (web search, real-time weather, email sending, calendar access), database retrieval functions, RAG (retrieval-augmented generation) systems that search large text corpora for the most relevant passages, and code execution environments that allow an LLM to write and run code directly on a computer. The code execution tool in particular unlocks an enormous range of computational tasks.

The art of workflow design is understanding what each building block does well, and then sequencing them in the combination that best accomplishes the task at hand.

---

## The Decomposition Heuristic

The lesson closes with a concise summary of the decomposition heuristic the instructor applies in practice:

1. Observe the work a person or business is doing and identify the discrete steps that make it up.
2. For each step, ask: can this be implemented with an LLM, or with a tool such as an API or function call?
3. If the answer is no, ask: how would I as a human carry out this step? Can it be broken down into smaller sub-steps that are more amenable to implementation?

This heuristic is applied iteratively. The first decomposition is rarely the last. After implementing a workflow and evaluating its output, builders typically discover that one or more steps are still too coarse-grained or too ambitious for a single model call, and those steps get further decomposed. This process continues until the workflow delivers the quality level the builder is targeting.

The lesson explicitly connects this iterative improvement process to the topic of the next lesson: **evaluations**. Knowing how to evaluate an agentic workflow's output is what makes it possible to identify which steps are underperforming and therefore need to be redesigned or further decomposed. Without a systematic evaluation process, improvement is guesswork.

---

## Post-test

1. The instructor describes a specific failure mode encountered when building a research essay agent with a three-step workflow. What was the failure, and what structural change to the workflow addressed it?

2. Describe the three-step workflow the instructor proposes for handling a customer service email about an order inquiry. For each step, identify which building block (LLM, specialized model, or software tool) is responsible for carrying it out.

3. What is the iterative relationship between task decomposition and evaluation that the instructor establishes at the end of the lesson?

<details><summary>Answer Guide</summary>

**Post-test Answer 1:**
The failure was that the essays felt disjointed — the beginning, middle, and end did not feel consistent with each other, as though the sections had been written in isolation. The structural fix was to further decompose step three ("write the essay") into three sub-steps: (1) write a first draft, (2) critique the draft to identify what needs revision, and (3) revise the draft based on that critique. By breaking one large generation step into a draft-then-revise loop, the model has the opportunity to catch and correct inconsistencies before producing the final output.

**Post-test Answer 2:**
Step 1: Extract key information from the email (who sent it, what they ordered, their order number) — carried out by an **LLM**, which is good at information extraction from unstructured text. Step 2: Query the customer database to retrieve the order record and shipping details — carried out by an **LLM equipped with a database query function** (a software tool), since the LLM generates the query and the tool executes it. Step 3: Write and send a reply to the customer — carried out by an **LLM with access to an email-sending API** (a software tool), since the LLM composes the response and the API delivers it.

**Post-test Answer 3:**
The instructor frames task decomposition and evaluation as complementary, iterative practices. Decomposition produces the initial workflow design, but the design is rarely correct on the first attempt. Evaluating the workflow's outputs reveals which steps are failing or underperforming. Those findings then drive further decomposition — breaking problematic steps into smaller, more implementable sub-steps. The cycle then repeats: implement the refined workflow, evaluate its outputs, identify remaining weaknesses, and decompose further. Evaluation is therefore the feedback mechanism that steers decomposition, and the two together form the improvement engine for agentic systems.

</details>
