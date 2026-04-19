---
tags: [agentic-ai, deeplearning-ai, course, llm, agents, multi-agent, workflow]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/608l3n/multi-agentic-workflows
---

## Pre-test

Before reading, answer these 3 questions from memory:

1. Why would you use multiple agents instead of a single agent for a complex task?
2. How do you define the role and capabilities of an individual agent in a multi-agent system?
3. What are two common communication patterns between agents in a multi-agentic workflow?

---

# Lecture 039: Multi-Agentic Workflows

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai) · DeepLearning.AI

## Outline

- Motivation for multi-agent systems
- Decomposing complex tasks into agent roles
- Designing individual agents with appropriate tools
- Linear workflow communication pattern
- Manager-agent coordination pattern

## Motivation for Multi-Agent Systems

In a multi-agent or multi-agentic workflow, a collection of multiple specialized agents collaborate to accomplish a task rather than a single agent handling everything end-to-end. When developers first encounter the concept, a natural question arises: why use multiple agents at all when it is the same underlying LLM being prompted repeatedly? The answer lies in a shift of mental model — from asking "what single instruction set covers everything?" to asking "what team of specialized roles would I hire to do this?"

A useful analogy is how a single computer, despite having one CPU, decomposes work into multiple processes or threads. As a developer, thinking in terms of concurrent, specialized units of work makes complex programs easier to design and reason about. The same principle applies to agentic systems: decomposing a complex task into subtasks handled by agents with distinct roles and tools makes the overall system easier to build, test, and extend.

The team analogy from the human workplace reinforces this idea. A marketing campaign might naturally involve a researcher, a graphic designer, and a copywriter. A research article calls for a statistician and an editor alongside the lead author. A legal case is prepared by associates, paralegals, and an investigator. Because human organizations already decompose complex work this way, these real-world role structures provide ready-made blueprints for designing multi-agent systems.

## Decomposing Complex Tasks into Agent Roles

To make the concept concrete, consider the task of creating marketing assets for a sunglasses product. Three natural roles emerge. First, a researcher analyzes market trends and studies competitor offerings. Second, a graphic designer creates visualizations, renders charts, and produces artwork assets. Third, a writer synthesizes the research and graphic output into a finished marketing brochure. Each role has a well-defined input, a clear deliverable, and a distinct skill set.

This decomposition is not arbitrary — it mirrors how human teams naturally divide such work. The key design question for each agent is: what tools does this role require to perform its function? A human researcher would search the internet; the agentic researcher therefore needs a web search tool. A human graphic designer would use design software; the agentic graphic designer needs image generation and manipulation APIs, or code execution to produce charts programmatically. The writer, by contrast, does not need external tools — composing polished prose is something an LLM can do natively with the research and graphic assets already provided as input.

## Designing Individual Agents with Role-Specific Prompts and Tools

Each agent in the system is built by prompting an LLM to play a specific role. For example, the research agent is instantiated with a system prompt along the lines of: "You are a research agent expert at analyzing market trends and competitors. Carry out online research to analyze market trends for the sunglasses product and give a summary of what competitors are doing." This system prompt, combined with access to a web search tool, produces an agent that behaves as a specialist researcher.

The same pattern applies to the graphic designer and writer agents: each receives a role-specific system prompt and is granted only the tools appropriate to that role. This separation of concerns has a practical benefit for development teams. Developers can work in parallel — one team refining the research agent while another perfects the graphic designer agent — and then integrate the agents into a unified workflow once each is individually solid. Additionally, well-designed agents can be reused across projects: a general-purpose graphic designer agent built for marketing brochures might also serve social media post creation or website illustration tasks.

## Linear Workflow Communication Pattern

Once the individual agents are defined, they must be arranged into a workflow. The simplest arrangement is a linear plan, where agents act sequentially, each consuming the output of the previous agent. In the marketing example, the researcher first produces a trends and competitive analysis report. That report is fed to the graphic designer, who generates relevant data visualizations and artwork. All of these assets are then passed to the writer, who produces the final marketing brochure.

This linear pipeline is straightforward to implement and reason about. Each handoff is a simple pass of data from one agent to the next. It is well suited to tasks where the outputs of earlier stages are prerequisites for later stages and where there is no need for iteration or feedback loops between agents. The main trade-off is inflexibility: if an early-stage agent produces poor output, the error propagates through the pipeline without correction.

## Manager-Agent Coordination Pattern

A more sophisticated pattern introduces a manager agent — an LLM that acts as an orchestrator rather than a specialist worker. Instead of calling tools directly, the manager is given a description of the available specialist agents and is asked to create a step-by-step plan and then delegate subtasks to the appropriate agents.

In practice, this looks similar to the tool-use planning pattern seen in earlier lessons, except the "tools" available to the LLM are the specialist agents themselves rather than functions like web search or code execution. The manager might instruct the researcher to gather sunglasses trend data, then direct the graphic designer to create visuals from that data, then ask the writer to draft the brochure, and finally perform a review or reflection pass before delivering the final output.

From a systems perspective, this manager-plus-specialists arrangement is actually a four-agent system: the marketing manager agent plus the three specialist agents it coordinates. The manager sets direction and delegates; the specialists execute. This pattern is more flexible than a strict linear pipeline because the manager can adapt the sequence of operations based on intermediate results, ask for revisions, or skip steps that are not needed for a particular request. It mirrors how a human team with a project manager operates, making it intuitive to design and explain.

## Post-test

1. Why does using multiple agents make complex agentic tasks easier to build and manage?
2. What determines which tools an individual agent needs in a multi-agent system?
3. How does the manager-agent pattern differ from a linear workflow, and what advantage does it offer?

> [!tip] Answer Guide
> **Q1: Why does using multiple agents make complex agentic tasks easier to build and manage?**
> Multiple agents allow developers to decompose a complex task into focused subtasks, each handled by a specialist with a clear role and tool set. Teams can build and test agents independently in parallel, and well-designed agents can be reused across different workflows, reducing duplication of effort.
>
> **Q2: What determines which tools an individual agent needs in a multi-agent system?**
> The agent's role determines its tools. The design question is: what would a human worker in this role need to do their job? A researcher needs web search; a graphic designer needs image generation or code execution for charts; a writer needs no external tools because composing text is an LLM's native capability.
>
> **Q3: How does the manager-agent pattern differ from a linear workflow, and what advantage does it offer?**
> In a linear workflow, agents execute in a fixed sequence with no feedback between stages. In the manager-agent pattern, an orchestrator LLM dynamically delegates tasks to specialist agents and can adjust the plan based on intermediate results, request revisions, or add a final review step — giving the system greater adaptability than a rigid pipeline.
