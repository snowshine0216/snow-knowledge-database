---
tags: [agentic-ai, deeplearning-ai, course, autonomy, human-in-the-loop, agents]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/zqs9ty/degrees-of-autonomy
---

## Pre-test

1. What practical argument did Andrew Ng make for treating "agentic" as an adjective (a spectrum) rather than defining "agent" as a binary yes/no category?
2. Describe the difference between a less-autonomous and a more-autonomous research agent that both write an essay about black holes. What specifically changes about who (or what) decides the sequence of steps?
3. At the highly autonomous end of the spectrum, agents can go beyond choosing from predefined tools. What additional capability do the most autonomous agents sometimes possess, and what tradeoffs come with that level of autonomy?

---

# Lecture 003: Degrees of Autonomy

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/zqs9ty/degrees-of-autonomy) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [The Debate Over What Counts as an Agent](#the-debate-over-what-counts-as-an-agent)
- [Introducing the Spectrum: Agentic as an Adjective](#introducing-the-spectrum-agentic-as-an-adjective)
- [Visual Notation Used in This Course](#visual-notation-used-in-this-course)
- [Less-Autonomous Agents: Predetermined Steps](#less-autonomous-agents-predetermined-steps)
- [More-Autonomous Agents: LLM-Directed Execution](#more-autonomous-agents-llm-directed-execution)
- [The Full Spectrum: From Fixed Pipelines to Self-Writing Tools](#the-full-spectrum-from-fixed-pipelines-to-self-writing-tools)
- [Practical Implications for Builders](#practical-implications-for-builders)

---

## The Debate Over What Counts as an Agent

A few years ago the AI community became caught up in a definitional dispute: when a researcher published a system and called it an "agent," others would push back and argue it was not a "true agent." The disagreement was largely semantic, yet it consumed real energy and distracted practitioners from the work of actually building these systems. Andrew Ng found the debate unnecessary. Rather than trying to draw a hard boundary around a binary concept, he proposed shifting the frame entirely.

## Introducing the Spectrum: Agentic as an Adjective

Ng's resolution was linguistic as much as technical. By treating "agentic" as an adjective — a property that a system can possess to a greater or lesser degree — the community can sidestep the question of whether a given system clears some definitional threshold. Any workflow that delegates at least some decision-making to an LLM is agentic; the interesting question is *how* agentic it is, not whether it qualifies. Ng made this case explicitly in a piece published in The Batch newsletter and in social media posts, arguing that the spectrum framing moves practitioners past unproductive gatekeeping and lets them focus on building.

When a team member challenged him — "why invent a new word when we already have 'agent'?" — Ng stuck with the adjective form precisely because it resists the binary reading that the noun "agent" invites.

## Visual Notation Used in This Course

To make the spectrum concrete, the course introduces a consistent visual language for diagrams throughout all lessons:

- **Red boxes** represent user input — a natural-language query, an input document, or any starting artifact provided by a human.
- **Gray boxes** represent calls to an LLM — wherever a language model is invoked to reason, plan, or generate text.
- **Green boxes** represent calls to external software — tool use such as a web search API call, code execution, or fetching the contents of a web page.

This notation makes it immediately visible, in any diagram, where human intent enters the system, where language-model reasoning occurs, and where the agent reaches out to the external world.

## Less-Autonomous Agents: Predetermined Steps

Consider the task of writing an essay about black holes. A less-autonomous agent might work as follows: the LLM generates a small set of web search queries, then a hard-coded step calls a search engine, another hard-coded step fetches the resulting web pages, and finally the LLM writes the essay using the retrieved content. Every non-LLM step in this pipeline is determined in advance by the programmer. The LLM's autonomy is confined to what text it generates at each fixed stage — it does not decide whether to search, which tool to call, or how many pages to retrieve. The overall sequence is fully deterministic from an engineering perspective.

This kind of system is common, valuable, and already widely deployed across commercial applications. Its predictability is a feature: the programmer can reason about exactly what will happen at runtime.

## More-Autonomous Agents: LLM-Directed Execution

At a higher point on the spectrum, the same essay-writing task looks different. Rather than following a fixed pipeline, the LLM itself decides which tool to invoke first: should it run a general web search, query a news source, or search for recent academic papers on arXiv? Once it retrieves results, it again decides — how many web pages should it fetch? If one result is a PDF, should it call a tool to convert that PDF to text? After drafting a section of the essay, it may choose to reflect on quality, decide the draft is insufficient, and loop back to fetch additional sources before producing a final output.

In this design, the sequence of steps is not predetermined by the programmer. It emerges from the LLM's decisions at runtime. The human engineer provides a set of available tools, but the LLM determines when and in what order to use them. This makes the agent more capable and flexible, but also less predictable.

## The Full Spectrum: From Fixed Pipelines to Self-Writing Tools

Ng positions systems along three broad bands:

**Less autonomous** — All steps are predetermined. The LLM's only role is to generate text within each fixed stage. Tool calls, if any, are hard-coded by the engineer. This covers the majority of production agentic systems today.

**Semi-autonomous** — The LLM makes some decisions — for example, choosing which tool to call from a predefined set — but the menu of available tools and the overall structure of the workflow are still controlled by the engineer.

**Highly autonomous** — The agent makes many decisions autonomously, including determining its own sequence of steps. The most advanced examples can go further still: writing new functions or creating entirely new tools on the fly that it then executes. This end of the spectrum is where the most active research is concentrated.

## Practical Implications for Builders

The value of the spectrum framing is that it gives practitioners a useful coordinate system rather than a gatekeeping criterion. Less-autonomous agents already power a large number of valuable business applications. They are controllable, predictable, and relatively straightforward to debug. Highly autonomous agents open up capabilities that were simply not achievable with earlier, purely prompt-driven applications — but they are also harder to control, more unpredictable in behavior, and the subject of ongoing research into safety and reliability.

As a builder, the spectrum helps you make an explicit design choice: for a given application, how much autonomy is appropriate? High autonomy is not always better. Many of the most commercially successful agentic systems today sit closer to the less-autonomous end, precisely because predictability and controllability matter in production. Understanding where your system sits on the spectrum — and why — is one of the foundational engineering decisions in agentic AI design.

---

## Post-test

1. In Ng's framing, what does it mean to treat "agentic" as an adjective rather than defining "agent" as a binary noun, and why did he prefer this approach?
2. Using the essay-writing-about-black-holes example, explain one concrete difference between how a less-autonomous agent and a more-autonomous agent handle the web search phase.
3. What are two practical tradeoffs that come with moving toward the highly autonomous end of the spectrum?

<details><summary>Answer Guide</summary>

**Q1.** Treating "agentic" as an adjective means any system can be more or less agentic — it is a continuous property, not an all-or-nothing category. Ng preferred this because the binary "is it an agent?" debate was unproductive, and the adjective framing lets practitioners acknowledge degrees of autonomy and focus on building rather than gatekeeping.

**Q2.** In the less-autonomous version, the web search step is hard-coded by the programmer — the agent always performs a web search, always calls the same tool, and the number of pages fetched is predetermined. In the more-autonomous version, the LLM decides whether to do a general web search, query news sources, or search arXiv; it also decides how many pages to fetch and whether to call additional tools (e.g., PDF-to-text conversion). The decision is made at runtime by the LLM, not preset by the engineer.

**Q3.** Any two of: (a) highly autonomous agents are less easily controllable; (b) they are more unpredictable in behavior; (c) they are the subject of significant active research, meaning best practices are still being established; (d) they can write new tools or functions on the fly, which increases capability but also increases the surface area for unexpected behavior.

</details>
