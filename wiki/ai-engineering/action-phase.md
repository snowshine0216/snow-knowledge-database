---
aliases: [Action Phase, 执行阶段, 行动阶段]
tags: [action-phase, tool-use, two-stage-react, harness-engineering, execution]
source: internal
---

# Action Phase

Action Phase is the execution pass in a staged agent loop where tools are exposed and the model can turn planning into concrete operations.

In a two-stage design, the Action Phase runs after the Thinking Phase has already written a planning trace into context. The model is then acting from a recent plan rather than jumping cold into tool use.

## Why It Matters

Separating action from planning makes execution easier to audit and easier to control. The runtime can inspect, gate, or summarize the planning step before tool access is unlocked.

## Practical Rule

Keep the Action Phase focused on tool choice and execution, not first-pass planning. If those two behaviors blur together, the staging boundary is weakening.

## See Also

- [[thinking-phase]]
- [[two-stage-react]]
- [[react-paradigm]]
- [[agentic-loop-self-correction]]
