---
tags: [agentic-ai, deeplearning-ai, course, planning, llm-planning, plan-execution, agents]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/wr78er/creating-and-executing-llm-plans
---

## Pre-test

1. Why do many developers ask an LLM to output plans in JSON format rather than plain English, and what downstream benefit does this provide?
2. What are the four plan-formatting options discussed in this lesson, and which two are recommended as the most reliable?
3. Beyond JSON and XML structured plans, what is the second major mechanism for getting LLMs to produce and execute complex plans reliably?

---

# Lecture 036: Creating and Executing LLM Plans

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/wr78er/creating-and-executing-llm-plans) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

1. [From High-Level Plans to Structured Formats](#from-high-level-plans-to-structured-formats)
2. [JSON as a Plan Representation](#json-as-a-plan-representation)
3. [Comparing Format Options](#comparing-format-options)
4. [Code as an Alternative Plan Representation](#code-as-an-alternative-plan-representation)

---

## From High-Level Plans to Structured Formats

Building on the customer service agent example introduced in the previous lesson, this lecture examines how to move beyond simple natural-language plan descriptions toward machine-parseable formats that downstream code can read and execute reliably. The core challenge is straightforward: a plan expressed only in free-form prose is difficult to parse programmatically. When a workflow needs to extract step numbers, tool names, and arguments from a plan, ambiguity in the text leads to fragile parsing logic and unpredictable execution. Structured formats solve this by giving the executing code a clear, deterministic schema to work with.

## JSON as a Plan Representation

The most widely adopted approach among developers is to instruct the LLM to format its plan as a JSON array. The system prompt describes the available tools and then explicitly requests a step-by-step plan in JSON format, providing enough schema detail for the model to produce the desired structure.

A well-formed JSON plan looks like an ordered list of objects. Each object carries a small set of unambiguous keys: a step index, a human-readable description of what the step accomplishes, the name of the tool to invoke for that step, and a nested object containing the arguments to pass to that tool. With this structure, downstream code can iterate over the array, dispatch each tool call with the specified arguments, and move to the next step without any natural-language parsing. Leading LLMs are reliable at producing valid JSON when asked, making this a practical and low-friction choice.

## Comparing Format Options

The lesson surveys four plan-formatting approaches and ranks them by reliability for programmatic parsing.

JSON and XML sit at the top. Both use explicit delimiters — curly braces and keys in JSON, tags with named attributes in XML — so parsers can extract step data without heuristics. The choice between them is largely a matter of team preference and existing tooling.

Markdown occupies the middle tier. Its heading and list conventions provide some structure, but the syntax is loose enough that small variations in model output can break a parser. It is usable but requires more defensive handling.

Plain text is the least reliable option. Without a formal schema, the executing code must infer step boundaries and tool names from prose, which introduces significant fragility. While capable LLMs can produce consistent plain-text formats when given detailed examples, the probability of parse failures under varied inputs is materially higher than with JSON or XML.

The practical recommendation from the lesson is to default to JSON or XML for any production plan-and-execute workflow, and to reserve Markdown or plain text only for rapid prototyping or situations where the plan is read by a human rather than parsed by code.

## Code as an Alternative Plan Representation

Beyond structured data formats, there is a second powerful mechanism for expressing and executing plans: letting the LLM write executable code. Instead of emitting a data structure that a separate execution engine must interpret, the model produces a program — Python, JavaScript, or another language — where the sequence of function calls, conditionals, and loops constitutes the plan itself.

This approach unlocks a qualitatively different level of plan complexity. A JSON or XML plan is essentially a flat list of steps with fixed branching rules baked into the execution engine. Code, by contrast, can express arbitrary control flow: conditional branches that depend on the output of earlier steps, loops that retry until a condition is satisfied, and parallel invocations of multiple tools. The executing environment simply runs the generated program, and the language runtime handles all the flow control natively. This makes code generation a compelling option for tasks whose plans cannot be fully specified in advance or whose structure depends heavily on intermediate results. The next lesson will explore this technique in detail.

---

## Post-test

1. What keys would you typically find in a single step object within a JSON-formatted LLM plan, and what does each key represent?
2. Rank the four plan-formatting options from most to least reliable for programmatic parsing, and briefly explain what makes the top two preferable.
3. What fundamental limitation of JSON/XML plan lists does using code as a plan representation overcome, and why does this matter for complex agentic tasks?

<details><summary>Answer Guide</summary>

**Q1.** A step object in a JSON plan typically contains: a step index (indicating order), a description (human-readable summary of the step's purpose), a tool name (the identifier of the tool to invoke), and an arguments object (key-value pairs passed to that tool). Together these four fields give the execution engine everything it needs to dispatch the call without any natural-language interpretation.

**Q2.** From most to least reliable: (1) JSON — explicit schema with unambiguous delimiters; (2) XML — explicit tags that parsers handle cleanly; (3) Markdown — loose syntax that requires more defensive handling; (4) Plain text — no formal schema, highest risk of parse failure. JSON and XML are preferred because their syntax is formally specified and parsers for both are mature, making model output variations less likely to cause failures.

**Q3.** JSON and XML plans are essentially flat ordered lists; the execution engine must implement all branching and looping logic itself, which limits how dynamic the plan can be. Code overcomes this by embedding control flow directly in the plan: conditionals, loops, and parallel calls are native language constructs. This matters for complex agentic tasks where the next step depends on the result of a prior step, making the full plan structure unknowable until runtime.

</details>
