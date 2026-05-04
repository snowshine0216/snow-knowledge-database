---
aliases: [Pseudo Tool Call, 伪工具调用, XML 伪调用]
tags: [pseudo-tool-call, tool-use, adaptive-reasoning, harness-engineering, reasoning]
source: internal
---

# Pseudo Tool Call

Pseudo Tool Call is the behavior where a model invents tool-like syntax even when no real tool surface is available.

In practice this often appears as XML or structured invocation text during a planning-only pass. The model is signaling an urge to act, but the runtime has withheld real tool execution.

## Why It Matters

This is useful evidence when tuning staged reasoning. It shows that the model still wants to operate through an action schema, which helps explain why explicit planning boundaries and adaptive reasoning controls are necessary.

## Practical Rule

Treat pseudo tool calls as a diagnostic signal: they reveal latent action pressure, not successful tool use.

## See Also

- [[adaptive-reasoning]]
- [[impulsive-model-problem]]
- [[thinking-phase]]
- [[two-stage-react]]
