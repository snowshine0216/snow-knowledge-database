---
tags: [agentic-ai, deeplearning-ai, course, tool-use, function-calling, tools, llm]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/3s0czq/what-are-tools
---

## Pre-test

1. When an LLM is given a `getCurrentTime` function as a tool and the user asks "how much caffeine is in green tea?", what does the LLM do — and why?
2. In the tool-use execution sequence, at which exact step does the function's return value re-enter the conversation, and how does the LLM use it afterward?
3. What is the visual notation the instructor uses to indicate that one or more tools are being made available to the LLM (as opposed to hard-coded function calls)?

---

# Lecture 019: What Are Tools

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/3s0czq/what-are-tools) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

1. [The Analogy: Tools Extend What LLMs Can Do](#the-analogy-tools-extend-what-llms-can-do)
2. [Defining Tool Use](#defining-tool-use)
3. [Step-by-Step Execution Flow](#step-by-step-execution-flow)
4. [LLM Discretion: Calling Tools Only When Needed](#llm-discretion-calling-tools-only-when-needed)
5. [Real-World Tool Examples](#real-world-tool-examples)
6. [Multiple Tools and Sequential Calls](#multiple-tools-and-sequential-calls)
7. [Developer Responsibilities](#developer-responsibilities)

---

## The Analogy: Tools Extend What LLMs Can Do

Just as humans accomplish far more with hammers, spanners, and pliers than with bare hands alone, large language models become dramatically more capable when they are given access to tools. In the context of LLMs, however, those tools are not physical instruments — they are functions that the model can request to be called on its behalf. This framing motivates the entire module: tool use is the mechanism by which an LLM moves from a static, knowledge-bounded system to one that can actively gather real-time information, perform calculations, query databases, and take actions in the world.

A simple illustration makes the limitation of a bare LLM vivid. If you ask a model trained many months ago "what time is it right now?", the model has no way to know — and ideally responds honestly that it lacks access to the current time. Providing that same model with a `getCurrentTime` function transforms the situation entirely: the model can now retrieve the answer instead of confessing ignorance.

## Defining Tool Use

Tool use means allowing an LLM to request that a specific function be called during the course of generating a response. The word "request" is deliberate: the LLM does not execute code itself. Instead it signals its intent to call a particular function, that call is executed by the surrounding system, and the result is returned to the model so it can continue reasoning.

Tools, therefore, are simply functions that a developer provides to the LLM. The model is made aware of what functions exist and what they do, and it can choose — at its own discretion — to invoke them when they are relevant to the task at hand.

## Step-by-Step Execution Flow

The mechanics of a single tool call follow a clear sequence:

1. **Input prompt arrives.** The user or orchestrating system sends a message to the LLM.
2. **LLM inspects available tools.** The model reviews the set of tools it has been given (in this example, just `getCurrentTime`).
3. **LLM decides to call a tool.** Finding the question relevant to the function, it requests a call to `getCurrentTime`.
4. **Function executes and returns a value.** The system runs the function and receives, say, `3:20 PM`.
5. **Return value is fed back into conversation history.** The result is appended to the context the LLM is processing.
6. **LLM generates its final output.** Now informed by the function's return value, the model produces a useful answer: "It is 3:20 PM."

This loop — prompt → tool selection → function execution → result injection → final output — is the fundamental building block of agentic tool use.

## LLM Discretion: Calling Tools Only When Needed

A crucial property of well-designed tool use is that the LLM decides for itself whether any tool is necessary. If a user asks "how much caffeine is in green tea?" while the only available tool is `getCurrentTime`, the model recognizes that the current time is irrelevant to the question and answers directly from its training knowledge — without invoking any function at all.

This voluntary, context-sensitive selection is what separates tool use from hard-coded pipelines. In earlier agentic patterns (such as always performing a web search at a fixed point in a research agent), the function call is wired in by the developer regardless of relevance. With tool use, the model's own judgment controls whether and which tool to invoke. The instructor uses a distinctive dashed-box notation in diagrams to mark when one or more tools are being offered to the LLM for optional use, distinguishing this from deterministic, hard-coded calls.

## Real-World Tool Examples

The power of tool use becomes concrete across a range of application domains:

**Restaurant discovery.** Asked to find Italian restaurants near Mountain View, California, an LLM equipped with a web search tool can issue a query for local restaurants, retrieve live results, and synthesize a useful recommendation — something a static model could not reliably do.

**Retail database queries.** A store assistant application might give the LLM access to a query-database tool. When a manager asks "show me customers who bought white sunglasses," the model can construct and execute a lookup against a sales table and return the matching records.

**Financial calculations.** For a question like "if I deposit $500 at 5% interest for 10 years, what will I have?", the LLM can call a dedicated interest-calculation function — or, as a notable alternative, write a mathematical expression as code and invoke a code-execution tool to evaluate it. The latter illustrates that tools need not be domain-specific; the ability to run arbitrary code is itself a powerful general-purpose tool.

These examples share a common structure: the developer identifies the kinds of tasks the application needs to handle, implements the corresponding functions, and exposes them to the LLM as tools.

## Multiple Tools and Sequential Calls

Many realistic applications require not one tool but a suite of them, and may require multiple sequential calls within a single user request. A calendar assistant provides a clear illustration. Handling "find a free slot Thursday and schedule a meeting with Alice" might require three available functions: `checkCalendar`, `makeAppointment`, and `deleteAppointment`.

The LLM would reason through the task as follows:

1. Call `checkCalendar` to learn when Thursday is free. The result (available time slots) is fed back.
2. Select a slot — say, 3:00 PM — and call `makeAppointment` to send a calendar invite to Alice and add the event to the user's calendar. A confirmation is returned.
3. Inform the user: "Your appointment with Alice is set for Thursday at 3:00 PM."

In this flow the LLM orchestrates multiple function calls in sequence, using the output of each to inform the next decision. The `deleteAppointment` tool is available but not invoked, demonstrating again that the model only calls what is actually needed.

## Developer Responsibilities

Enabling tool use places a meaningful responsibility on developers. They must think carefully about the capabilities their application needs, implement reliable functions for each, and make those functions available to the LLM in a way the model can understand. The right set of tools will differ substantially between a restaurant recommender, a retail question-answering assistant, and a financial advisor agent. Identifying, building, and registering those tools is core agentic engineering work — the subject of the lessons that follow.

---

## Post-test

1. Describe the complete sequence of steps that occurs when an LLM uses a tool to answer "what time is it?" — starting from the user's prompt and ending with the LLM's final output.
2. How does the LLM decide whether to call any of the available tools for a given user query, and what happens when none of the tools are relevant?
3. Walk through the calendar assistant example: which tools are available, in what order are they called, and which tool is available but never invoked — and why?

<details><summary>Answer Guide</summary>

**Q1 — Tool execution sequence:**
(1) User prompt arrives. (2) LLM reviews the available tool(s) — here, `getCurrentTime`. (3) LLM decides to call `getCurrentTime`. (4) The system executes the function; it returns the current time (e.g., `3:20 PM`). (5) The return value is inserted into the conversational history / context. (6) The LLM reads the result and generates its final answer ("It is 3:20 PM").

**Q2 — LLM discretion:**
The LLM uses its own judgment to evaluate whether any available tool is relevant to the query. If the question can be answered from training knowledge alone (e.g., "how much caffeine is in green tea?"), the model skips all tools and responds directly. No tool call is hard-coded; the model's decision is context-sensitive at inference time.

**Q3 — Calendar assistant:**
Three tools are available: `checkCalendar`, `makeAppointment`, and `deleteAppointment`. The LLM first calls `checkCalendar` to identify free Thursday slots, then calls `makeAppointment` with the chosen time (3:00 PM) and Alice as the invitee, and finally reports the confirmation to the user. `deleteAppointment` is never called because no existing appointment needs to be cancelled — it was available but not needed for this particular request.

</details>
