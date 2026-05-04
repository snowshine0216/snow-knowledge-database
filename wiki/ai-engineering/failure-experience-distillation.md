---
aliases: [Failure Experience Distillation, 失败经验沉淀机制, 失败案例库, 经验库]
tags: [failure-learning, memory, critic-phase, few-shot, harness-engineering]
source: internal
---

# Failure Experience Distillation

Failure Experience Distillation is the practice of turning a failed attempt into reusable guidance for future runs.

Instead of treating a bad branch as pure token waste, the harness extracts why it failed, what constraint was discovered, and what alternative worked better. That lesson can then be stored as a compact memory, a failure case, or a few-shot example for later planning.

## Why It Matters

Agent systems often pay real cost to discover that path A does not work. If that lesson is not preserved, future runs may repeat the same mistake and pay again.

## Common Outputs

- a short critic summary of why the plan failed
- a reusable constraint for future planning
- a few-shot example showing pitfall and correction
- a failure-library entry for similar tasks

## Practical Rule

If the system spent tokens, tools, or human review to discover a pitfall, preserve the lesson in a form that future runs can load cheaply.

## See Also

- [[critic-phase]]
- [[thinking-phase]]
- [[filesystem-as-memory]]
- [[context-compaction]]
