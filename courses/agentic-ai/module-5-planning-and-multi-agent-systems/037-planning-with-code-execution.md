---
tags: [agentic-ai, deeplearning-ai, course, planning, code-execution, python, agents]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/egr0a8/planning-with-code-execution
---

## Pre-test

1. Why does giving an LLM a fixed set of custom data-analysis tools break down as query complexity grows, and what structural flaw does this reveal?
2. What specific advantage does Python (with libraries like pandas) give an LLM compared to JSON-based planning when the LLM needs to express a multi-step plan?
3. According to research cited in the lecture, how does "code as action" compare to JSON-based and text-based planning in terms of model performance, and what does this trend imply?

---

# Lecture 037: Planning with Code Execution

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/egr0a8/planning-with-code-execution) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [The Core Idea](#the-core-idea)
- [The Fixed-Tool Problem](#the-fixed-tool-problem)
- [Code as a Planning Medium](#code-as-a-planning-medium)
- [Research Evidence](#research-evidence)
- [Tradeoffs and Maturity](#tradeoffs-and-maturity)

## The Core Idea

Planning with code execution is a technique in which an LLM is not asked to output a structured plan — such as a JSON list of steps — and then execute those steps one at a time. Instead, the LLM is prompted to express its entire plan directly as runnable code. Each line or block of code corresponds to a step in the plan, and executing that code carries out the plan in full. Because modern programming languages like Python already encode multi-step logic naturally, this approach lets the LLM leverage its existing knowledge of how to sequence function calls to achieve a goal.

## The Fixed-Tool Problem

A common pattern for building data-analysis agents is to provide the LLM with a curated set of custom tools — functions like `get_column_max`, `filter_rows`, `get_column_mean`, `sum_rows`, and similar primitives — that it can call to process a spreadsheet or table. For simple queries this works adequately, but the approach degrades quickly as query complexity increases.

Consider the query "which month had the highest sales of hot chocolate?" To answer this with fixed tools, the LLM must filter rows for January, compute a statistic, repeat for February, repeat for every subsequent month, and then take the maximum across all results. The chain of tool calls is long and fragile. A query like "how many unique transactions were there last week?" may require a capability — such as deduplicating rows — that none of the existing tools provide, forcing the developer to add a new tool. Another unforeseen query demands yet another new tool. In practice, teams following this pattern find themselves continually expanding their tool library to cover edge cases, producing a brittle, unmaintainable system.

The root structural flaw is that the tool library is finite and predetermined, while the space of possible user queries is effectively unbounded.

## Code as a Planning Medium

The alternative is to prompt the LLM to write code that answers the query directly. A system prompt instructs the model to return its answer as Python code, delimited by tags such as `<execute_python>...</execute_python>`. The model then writes a short program — for example, loading a CSV with pandas, parsing a date column, sorting by date, and selecting the last five rows — and the application executes that code to produce the answer.

This works because Python, together with data-processing libraries like pandas, already exposes hundreds to thousands of functions that the LLM has encountered extensively during training. The LLM knows when and how to call `drop_duplicates`, `groupby`, `sort_values`, `tail`, and many other operations. By writing code instead of selecting from a narrow list of custom tools, the LLM can compose from this large pre-existing function vocabulary to handle nearly any query a user might ask — without the developer having to anticipate or implement each capability in advance.

In the code the LLM generates, each comment or logical block corresponds to a step of the plan. A four-step plan to answer "how many unique transactions last week?" might read: read the CSV, parse the date column, define the time window and filter rows, then drop duplicates and count. The plan is expressed and executed as a single coherent unit.

## Research Evidence

Research by Sunya Wang and others, summarized in a diagram in the lecture, shows that across a range of LLMs the "code as action" approach — where the model writes code and takes actions through that code — consistently outperforms having the model write a plan in JSON and then translating JSON into actions, which in turn outperforms planning in plain text. The performance gap is meaningful across multiple model families. This suggests that expressive, executable representations of plans are superior to declarative or textual ones, likely because they tap into the model's rich training signal on how programs are structured and executed.

## Tradeoffs and Maturity

Code-based planning is not universally applicable. When a task genuinely requires custom business logic tools or APIs that are not standard library functions, giving the LLM a set of well-designed custom tools remains the right approach. Developers must also consider sandboxing: running LLM-generated code in a secure, isolated environment reduces the risk of unintended side effects, though in practice many developers skip sandboxing and accept the associated risk.

The technique is still maturing. Outside of agentic software coding — where it has proven highly effective, enabling coding assistants to form checklists and execute complex multi-step software construction tasks — planning with code is considered cutting-edge rather than production-standard. One inherent tradeoff is control: when the developer does not specify exactly what steps the agent will take, runtime behavior becomes harder to predict. This loss of control is the price of the dramatically expanded range of tasks the model can attempt. As the field develops, planning will likely become more reliable across a broader set of application domains.

## Post-test

1. What is the structural reason that a fixed library of custom data-analysis tools becomes unmanageable as user queries grow more varied?
2. How does prompting an LLM to write Python code give it access to a much larger effective "tool library" than providing explicit custom tools?
3. What does the research evidence suggest about the relative performance of code-based planning versus JSON-based planning versus plain-text planning?

<details><summary>Answer Guide</summary>

**Q1.** The tool library is finite and predetermined by the developer, while the space of possible user queries is unbounded. Every unforeseen query type forces the developer to add a new tool, creating a brittle, ever-growing set of edge cases.

**Q2.** Python libraries like pandas already expose hundreds to thousands of functions that the LLM has seen extensively in training data. By writing code, the LLM can compose from this pre-existing vocabulary of functions — `groupby`, `drop_duplicates`, `sort_values`, etc. — without the developer having to anticipate or implement each capability as a custom tool.

**Q3.** Research shows "code as action" outperforms JSON-based planning, which in turn outperforms plain-text planning, consistently across multiple model families. Expressive executable representations give the LLM a richer medium for encoding and carrying out multi-step plans.

</details>
