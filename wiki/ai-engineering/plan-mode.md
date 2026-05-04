---
aliases: [Plan Mode, 计划模式]
tags: [plan-mode, dynamic-reasoning, planning, harness-engineering, agent-control]
source: internal
---

# Plan Mode

Plan Mode is the pattern of activating explicit planning only when a task actually needs it, instead of forcing every turn through a slow reasoning pass.

It is the natural refinement of always-on staged reasoning. Rather than a static global switch, the runtime decides when planning should be invoked based on task complexity, risk, or ambiguity.

## Why It Matters

Always-on deliberation is expensive. Plan Mode preserves the value of explicit planning while avoiding unnecessary token and latency cost on routine steps.

## Common Triggers

- high-risk actions
- broad or underspecified tasks
- repeated failure in the current loop
- large scope changes or replanning moments

## Practical Rule

If a reasoning boundary is valuable only some of the time, promote it from a global toggle to a conditional mode.

## See Also

- [[two-stage-react]]
- [[thinking-phase]]
- [[mechanism-over-prompt]]
- [[runtime-boundary-control]]
