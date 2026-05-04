---
aliases: [Adaptive Reasoning, 自适应推理]
tags: [adaptive-reasoning, reasoning-budget, token-optimization, harness-engineering, planning]
source: internal
---

# Adaptive Reasoning

Adaptive Reasoning is the practice of giving an agent more deliberate reasoning only when task complexity or risk justifies the extra cost.

Instead of forcing every turn through the same amount of thought, the harness adjusts whether explicit planning is enabled so simple tasks stay cheap and difficult tasks get more cognitive budget.

## Why It Matters

Always-on slow reasoning wastes tokens on routine work, while always-fast execution increases the chance of shallow mistakes on complex work. Adaptive reasoning exists to spend compute where it changes outcomes.

## Practical Rule

Reasoning depth should scale with task difficulty, ambiguity, or risk, not with a single global default.

## See Also

- [[plan-mode]]
- [[thinking-phase]]
- [[pseudo-tool-call]]
- [[03-thinking-stage-slow-reasoning]]
