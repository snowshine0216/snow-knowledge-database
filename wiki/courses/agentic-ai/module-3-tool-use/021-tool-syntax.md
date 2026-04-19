---
tags: [agentic-ai, deeplearning-ai, course, tool-use, tool-syntax, json-schema, function-calling]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/154qpw/tool-syntax
---

## Pre-test

1. When you pass a Python function to the AI Suite library as a tool, what does the library use to auto-generate the JSON schema that gets sent to the LLM — and why does that matter for prompt design?
2. What is the purpose of the `max_turns` parameter in an agentic tool-calling loop, and in typical real-world usage how often does an agent actually hit that ceiling?
3. What conceptual distinction does the instructor draw between "the LLM calling a tool" and what is technically happening — and why do developers often use the shorter phrasing anyway?

---

# Lecture 021: Tool Syntax

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/154qpw/tool-syntax) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [The LLM-Tool Relationship](#the-llm-tool-relationship)
- [AI Suite and the OpenAI-Style API](#ai-suite-and-the-openai-style-api)
- [Automatic JSON Schema Generation](#automatic-json-schema-generation)
- [Handling Parameters: The Timezone Example](#handling-parameters-the-timezone-example)
- [The max_turns Guard](#the-max_turns-guard)
- [Code Execution as a Special Tool](#code-execution-as-a-special-tool)

## The LLM-Tool Relationship

A common point of confusion for developers new to agentic workflows is the phrase "the LLM calls the tool." Technically, the model never executes anything — it produces a structured response that *requests* a tool invocation, and the surrounding application code is responsible for actually running the function and returning the result. The model then receives that result and continues reasoning. Despite this distinction, "the LLM calls the tool" has become standard shorthand in the developer community because it captures the intent concisely. Understanding the real mechanics — LLM requests → host executes → LLM receives output — is essential for debugging and for understanding where errors can originate.

## AI Suite and the OpenAI-Style API

The code pattern for wiring tools to an LLM using the AI Suite open-source library is deliberately close to the OpenAI Python SDK syntax so that developers already familiar with OpenAI's interface face minimal friction. The core call follows the shape:

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=[get_current_time],
    max_turns=5
)
```

The `model` and `messages` arguments work exactly as in the standard OpenAI API. The important addition is `tools`, which accepts a list of Python callables. AI Suite inspects each callable and handles everything else automatically — no hand-written schema required.

## Automatic JSON Schema Generation

When a tool is registered this way, AI Suite generates a JSON schema for the function and passes it to the LLM inside the API request. The schema includes three critical pieces of information: the function **name** (used by the model to reference the tool in its response), a **description** derived from the function's docstring (used by the model to decide *when* the tool is appropriate), and a **parameters** block that describes each argument by type and meaning.

This automatic generation means that the quality of a tool's docstring directly affects the model's ability to use the tool correctly. A well-written docstring that explains what the function does, what each parameter means, and what kinds of values are acceptable will produce a richer schema, which in turn leads to more reliable function calls. Some LLM provider APIs require developers to construct this JSON schema manually and pass it as a raw dictionary; AI Suite's automatic path eliminates that boilerplate.

## Handling Parameters: The Timezone Example

A more complex version of `get_current_time` that accepts a `timezone` argument illustrates how AI Suite scales its schema generation. For a function with parameters, the generated schema gains a `parameters` object that enumerates each argument, its type, and a description drawn from the docstring. For the timezone argument, a good docstring might indicate that valid values follow the IANA timezone format (`America/New_York`, `Pacific/Auckland`, etc.), which the model will then include in the argument it constructs when calling the tool. This tight coupling between documentation and schema means that documenting functions well is no longer just good practice — it is directly load-bearing for model behavior.

When the code snippet executes, AI Suite orchestrates the full loop: the model decides whether to call `get_current_time`, AI Suite invokes the function if requested, feeds the return value back to the model as a tool result message, and repeats until the model produces a final answer or the turn limit is reached. The developer does not need to write any of this dispatch logic manually.

## The max_turns Guard

The `max_turns` parameter places an upper bound on how many sequential tool calls the model can make before the loop exits. This guard exists because an LLM can, in principle, keep requesting tool calls indefinitely — either because the task genuinely requires many steps or because something has gone wrong and the model is stuck in a repetitive pattern. In practice, the vast majority of agentic tasks resolve in far fewer turns than any reasonable ceiling. Setting `max_turns` to five is a common default that works well for typical use cases. The parameter is best thought of as a safety valve rather than a functional knob to tune.

## Code Execution as a Special Tool

Among all the tools that can be given to an LLM, code execution occupies a uniquely powerful position. Because code is a general-purpose language for describing computation, an LLM that can write code and have that code executed gains the ability to perform an enormous range of tasks that would otherwise require purpose-built tools for each. The lecture closes by flagging this distinction as the motivation for the following video, which focuses specifically on the code execution tool and why it merits its own treatment.

## Post-test

1. What three pieces of information does AI Suite's automatically generated JSON schema include for each tool, and where does each piece of information come from in the Python source?
2. Explain in your own words why the docstring of a tool function is "load-bearing" for model behavior in AI Suite — what breaks if the docstring is missing or vague?
3. If an agentic loop has `max_turns=5` and the model requests a tool call on every turn, how many times will the tool actually execute, and what happens after the limit is reached?

<details><summary>Answer Guide</summary>

**Q1 — Three schema pieces:**
The schema contains (a) the **function name**, taken directly from the Python function's `__name__`; (b) a **description**, extracted from the function's docstring; and (c) a **parameters** block, constructed from the function's argument names, type annotations, and per-parameter docstring descriptions.

**Q2 — Load-bearing docstrings:**
AI Suite uses the docstring as the primary source for the `description` field in the JSON schema. The model reads this description to decide *whether* and *when* to invoke the tool. If the docstring is absent or vague, the schema description is empty or unhelpful, so the model may invoke the tool at the wrong time, pass incorrect argument values, or ignore the tool entirely when it should be used. The docstring is therefore not optional documentation — it is functional input to the model's decision process.

**Q3 — max_turns arithmetic:**
With `max_turns=5` and a tool call on every turn, the tool executes up to 5 times (one per turn). After the fifth turn the loop exits and returns whatever response state exists at that point, regardless of whether the model intended to call more tools. In practice this limit is almost never reached in normal usage.

</details>
