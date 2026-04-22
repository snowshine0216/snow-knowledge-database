---
tags: [agentic-ai, deeplearning-ai, course, planning, workflow, plan-and-execute, agents]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/jcl177/planning-workflows
---

## Pre-test

1. In the plan-and-execute design pattern, what is the purpose of the initial planning step, and how does it differ from a hard-coded tool-call sequence?
2. When an LLM executes a multi-step plan, how does the output of one step feed into the execution of the next step?
3. What is one concrete limitation or challenge that currently restricts widespread adoption of the planning design pattern outside of agentic coding systems?

---

# Lecture 035: Planning Workflows

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/jcl177/planning-workflows) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [Why Planning Matters](#why-planning-matters)
- [The Plan-and-Execute Architecture](#the-plan-and-execute-architecture)
- [Example: Sunglasses Customer Service Agent](#example-sunglasses-customer-service-agent)
- [Example: Email Assistant](#example-email-assistant)
- [Current State and Limitations of Planning](#current-state-and-limitations-of-planning)

## Why Planning Matters

A central challenge in building highly autonomous agents is determining the sequence of steps an agent should take to complete a complex task. One approach is to hard-code that sequence in advance, specifying exactly which tools to call and in what order. However, this works only for tasks that are known and well-defined ahead of time. Real-world scenarios often require flexibility: a customer might ask any of dozens of different questions, and each question might demand a completely different sequence of tool calls.

The planning design pattern addresses this by giving the LLM the ability to devise its own step-by-step plan at runtime, based on the specific request it receives. Rather than pre-programming every possible workflow, a developer instead provides the agent with a set of available tools and instructs the model to determine the appropriate sequence dynamically. This module introduces planning as the first of two major advanced design patterns, the second being multi-agent systems.

## The Plan-and-Execute Architecture

The plan-and-execute pattern works in two phases. In the planning phase, the LLM receives a description of the available tools and the user's request, then outputs a numbered list of steps that, if carried out in order, would fulfill the request. The LLM is not asked to take any action yet — it is only asked to produce a plan.

In the execution phase, the system iterates through the steps. For each step, it constructs a prompt that includes the step's instruction, relevant background context, descriptions of the available tools, and the accumulated outputs from all prior steps. A separate LLM call — which may be the same or a different model — processes this prompt and performs the appropriate tool call. The result of that call becomes part of the context for the next step. This chaining of outputs allows each step to build on the results of its predecessors, producing a coherent final answer.

A key insight is that a single LLM invocation does not need to handle the entire task. Instead, multiple focused calls handle individual steps, each informed by what came before.

## Example: Sunglasses Customer Service Agent

Consider a sunglasses retail store whose inventory is stored in a database. A customer asks: "Do you have any round sunglasses in stock that are under $100?" Answering this query is non-trivial — it requires examining product descriptions to identify which sunglasses are round, checking stock levels for those items, and then filtering by price.

To handle queries like this, the agent is given a set of tools: get item descriptions, check inventory, get item price, process item returns, check past transactions, and process item sale. A prompt instructs the LLM to return a step-by-step plan for the user's request. Given the customer's question, the model produces a plan such as:

1. Use get item descriptions to identify which sunglasses have round shapes.
2. Use check inventory to determine which of those are currently in stock.
3. Use get item price to filter the in-stock round sunglasses to those priced below $100.

The system then executes each step in turn. Step one's output — a list of round sunglasses — is passed alongside the step two instruction to a new LLM call, which invokes the inventory check. Step two's output is then passed with the step three instruction, which invokes the price lookup. The final output feeds into one last LLM call that synthesizes a customer-facing answer.

The same agent can handle completely different requests — for example, "I would like to return the gold frame glasses I purchased but not the metal frame ones" — by generating an entirely different plan at runtime. The developer does not need to anticipate each case.

## Example: Email Assistant

A second example demonstrates planning for an email management task. A user tells their assistant: "Please reply to that email invitation from Bob in New York, tell him I'll attend, and archive his email." The agent is equipped with tools to search email, move email, delete email, and send email.

Given this request, the LLM produces a plan such as:

1. Use search email to find the email from Bob that mentions dinner and New York.
2. Generate and send a reply confirming attendance.
3. Move the email from Bob to the archive folder.

Execution proceeds step by step: the search result from step one is passed into the prompt for step two, which sends an appropriate reply; then the confirmation that the email was sent successfully is used as context for step three, which archives the original message. The structured, sequential nature of the plan ensures that each action depends on verified outputs from prior actions.

## Current State and Limitations of Planning

The planning pattern has already proven highly effective in agentic coding systems. When a user asks such a system to build a complex application, the agent may produce a checklist of components to implement and then execute each item in sequence. This use case is mature enough that it has moved beyond being experimental.

For other domains, however, planning is still emerging. One reason is predictability: because the LLM generates the plan dynamically, a developer cannot know in advance exactly what sequence of steps will be chosen at runtime. This makes the system harder to audit, test, and control compared to a fixed workflow. In safety-sensitive or compliance-heavy environments, this unpredictability is a significant concern.

Despite these limitations, the trajectory is positive. As LLMs become more capable and practitioners develop better techniques for validating dynamically generated plans, adoption is expected to grow across a wider range of industries. The fundamental advantage — not needing to hard-code every possible workflow in advance — remains a compelling reason to invest in this design pattern.

## Post-test

1. In the sunglasses retail example, what three tools does the LLM plan to call, and in what order, to answer the customer's query about round sunglasses under $100?
2. How does the plan-and-execute pattern pass information between steps during the execution phase?
3. Why is the planning pattern currently more established in agentic coding systems than in other domains?

> [!example]- Answer Guide
> 
> #### Q1 — Tools Called for Sunglasses Query
> 
> The LLM plans to call: (1) get item descriptions to find round sunglasses, (2) check inventory to see which of those are in stock, and (3) get item price to filter for items priced under $100.
> 
> #### Q2 — Information Passing Between Steps
> 
> The output of each step is appended to the context for the next step. When the system invokes the LLM to execute step N+1, the prompt includes the step N+1 instruction plus the accumulated outputs from all prior steps, allowing the model to build on previous results.
> 
> #### Q3 — Planning Pattern in Coding Systems
> 
> The planning pattern is already well-established in agentic coding because those systems tolerate the inherent unpredictability of dynamic plans — developers can inspect and iterate on code outputs, and the domain is forgiving of variation. In other sectors, the inability to know at development time exactly what sequence of steps the agent will choose raises concerns about control and auditability, slowing adoption.
