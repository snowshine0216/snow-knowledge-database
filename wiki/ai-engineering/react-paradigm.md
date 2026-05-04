---
aliases: [ReAct Paradigm, ReAct Pattern, ReAct Loop]
tags: [react, agent-loop, reasoning-and-acting, harness-engineering, tool-use]
source: internal
---

# ReAct Paradigm

ReAct Paradigm is an agent pattern that interleaves reasoning and acting instead of forcing the model to finish all analysis before interacting with the environment.

In its minimal form, each turn does five things:

1. read the current state and latest observations
2. reason about the next best move
3. invoke a tool or answer directly
4. write the new observation back into context
5. repeat until termination

## Why It Mattered

Before ReAct, pure Chain-of-Thought could reason but could not inspect the world, while action-only tool use could act but often lost track of why it was acting. ReAct ties the two together by letting new evidence continuously reshape the plan.

## Why It Fits Harnesses

A harness can implement ReAct as a compact main loop:

- the model proposes the next step
- tools create real observations
- the runtime appends those results back into state
- the next turn replans from the updated evidence

That makes ReAct a natural bridge between [[llm-api-statelessness]] and [[main-loop-vs-dag]]. Because each LLM call is stateless, the harness must explicitly replay the growing trace of thought, action, and observation.

## Common Failure Mode

Naive ReAct often becomes too eager to act when tools are present. Strong tool schemas can pull the model toward immediate calls instead of planning. A common harness extension is to separate planning and acting into distinct passes, as shown in [[03-thinking-stage-slow-reasoning]].

## Practical Rule

Use ReAct when the next step depends on what the environment reveals, not when the entire path is known ahead of time.

## See Also

- [[main-loop-vs-dag]]
- [[agentic-loop-self-correction]]
- [[harness-engineering]]
- [[02-main-loop-react-cycle]]
