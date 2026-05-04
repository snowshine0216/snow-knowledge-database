---
aliases: [Thinking Trace Filtering Strategy, Thinking Trace 过滤策略, 思考轨迹过滤策略]
tags: [thinking-trace, observability, review, harness-engineering, transparency]
source: internal
---

# Thinking Trace Filtering Strategy

Thinking Trace Filtering Strategy is the practice of deciding how much internal reasoning trace should be exposed, summarized, collapsed, or hidden in user-facing workflows.

Raw traces can be useful for audit and debugging, but they are often too noisy for normal review. A good strategy preserves transparency without turning every review surface into a dump of low-signal internal text.

## Typical Pattern

- show a concise reasoning summary by default
- keep raw traces collapsible or behind an audit surface
- expose more detail only when the task is risky, disputed, or hard to debug

## Why It Matters

This is an observability design problem, not just a UI preference. Too little trace makes audits weak. Too much trace buries reviewers under noise and reduces attention on the decisions that matter.

## Practical Rule

Design traces for the reviewer who needs evidence, not for the impossible goal of showing every internal token by default.

## See Also

- [[critic-phase]]
- [[state-transparency]]
- [[human-in-the-loop]]
- [[thinking-phase]]
