---
aliases: [Thinking Phase, 思考阶段, 规划阶段]
tags: [thinking-phase, planning, two-stage-react, harness-engineering, reasoning]
source: internal
---

# Thinking Phase

Thinking Phase is the planning pass in a staged agent loop where the model is asked to reason without being allowed to act yet.

In a two-stage harness, this usually means calling the model with no tools exposed. The runtime is not asking for tool JSON or execution, only for planning text that clarifies the next move.

## Why It Matters

This phase creates a physical pause between seeing the task and taking action. That pause is valuable because it reduces premature tool use and produces a planning trace that the next step can follow.

## Tradeoff

Thinking Phase improves deliberation, but it costs extra latency and tokens. It is most useful when the task is ambiguous, risky, or broad enough that premature action is expensive.

## Practical Rule

Use a Thinking Phase when the harness needs a reliable planning boundary instead of hoping the model will voluntarily slow down.

## See Also

- [[two-stage-react]]
- [[action-phase]]
- [[mechanism-over-prompt]]
- [[03-thinking-stage-slow-reasoning]]
