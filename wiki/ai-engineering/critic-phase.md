---
aliases: [Critic Phase, Critic Phase 微循环, 自我审计阶段]
tags: [critic-phase, self-audit, planning, harness-engineering, agent-reflection]
source: internal
---

# Critic Phase

Critic Phase is an optional review pass inserted between planning and action, or after a failed attempt, so the model can critique its own proposal before continuing.

Instead of immediately executing the first plan, the harness asks for a short self-audit: what could fail, what assumptions are weak, and what should be revised before tool use proceeds.

## Why It Matters

This creates a structured place for second thoughts. In agent systems, that matters because many costly failures are not caused by missing capability but by moving from a plausible first plan to action too quickly.

## Common Uses

- review a Phase 1 plan before tool execution
- summarize why a failed attempt did not work
- turn a bad branch into reusable guidance for the next attempt

## Practical Rule

Use a Critic Phase when the cost of one extra review step is lower than the cost of executing the wrong plan.

## See Also

- [[thinking-phase]]
- [[action-phase]]
- [[two-stage-react]]
- [[mechanism-over-prompt]]
