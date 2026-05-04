---
aliases: [Two-Stage ReAct, 双阶段 ReAct]
tags: [two-stage-react, react, planning, harness-engineering, function-calling]
source: internal
---

# Two-Stage ReAct

Two-Stage ReAct is the harness pattern of splitting one agent turn into two separate model calls: a planning pass first, then an action pass.

In the first pass, the runtime withholds tools so the model must produce text planning instead of immediate tool-call JSON. In the second pass, the runtime replays that planning trace with tools enabled, so the model acts from its own freshly written plan.

## Why It Matters

This is a direct response to tool impulsivity. Instead of asking the model to "please think first," the harness changes the action surface so planning becomes the only legal behavior in phase one.

## Tradeoff

Two-stage execution improves deliberation, but it also adds extra latency and token cost. A static always-on switch is usually a transitional design rather than the ideal final form.

## Practical Rule

Use Two-Stage ReAct when planning quality matters enough that you want an explicit physical boundary between thinking and acting.

## See Also

- [[react-paradigm]]
- [[mechanism-over-prompt]]
- [[impulsive-model-problem]]
- [[03-thinking-stage-slow-reasoning]]
