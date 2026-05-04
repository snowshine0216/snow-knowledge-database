---
aliases: [Impulsive Model Problem, 工具冲动问题, 工具饥饿]
tags: [impulsive-model-problem, tool-use, function-calling, harness-engineering, autoregression]
source: internal
---

# Impulsive Model Problem

Impulsive Model Problem is the failure mode where a model jumps into tool use before it has formed a useful plan.

This often appears when tool schemas are present in the request context. Because tool-call JSON is an immediately available continuation, the model's next-token process can collapse toward action before reflective planning has happened.

## Why It Matters

The problem is structural, not just motivational. Telling the model to "think step by step" may help sometimes, but it does not remove the strong action attractor created by exposed tools.

## Common Symptoms

- editing the first file it sees without broader inspection
- calling a tool before reading enough state
- repeating shallow actions instead of replanning

## Practical Rule

If exposed tools consistently pull the model into premature action, treat it as a runtime-design problem rather than a prompt-writing problem.

## See Also

- [[two-stage-react]]
- [[mechanism-over-prompt]]
- [[react-paradigm]]
- [[agentic-loop-self-correction]]
