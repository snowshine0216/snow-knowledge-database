---
aliases: [Main Loop vs DAG]
tags: [main-loop, dag, harness-engineering, control-flow, agent-architecture]
source: internal
---

# Main Loop vs DAG

Main Loop vs DAG is the contrast between two different ways of controlling an agent system.

## DAG Style

In a DAG-oriented framework, the developer predefines the execution graph:

- node A runs first
- then node B
- then node C
- special cases are handled through additional branches or state transitions

This works best when the path is mostly known in advance.

## Main Loop Style

In a main-loop harness, the system repeatedly does a smaller cycle:

1. inspect current state
2. ask what the next best action is
3. execute it
4. write the result back into state
5. repeat or stop

That means the path is not fully precommitted. It is re-decided turn by turn.

## Why This Matters for Agents

Open-ended tasks rarely fail in neat preplanned ways. Tools timeout, outputs are malformed, requirements change, and intermediate discoveries alter the plan. A loop handles that better because it is designed to replan from live state instead of forcing recovery through a hidden graph transition.

This is why a harness with a main loop often pairs well with [[state-transparency]], [[runtime-boundary-control]], and [[agentic-loop-self-correction]].

## The Tradeoff

- **DAG**: easier to reason about when the workflow is stable and narrow
- **Main Loop**: more adaptive when the environment is open and the next step depends on new evidence

Neither is universally superior. The design question is whether the environment is mostly deterministic or continuously changing.

## Practical Rule

If you find yourself adding many special-case recovery edges to a DAG, that is often a signal the system wants a loop instead.

## See Also

- [[harness-engineering]]
- [[runtime-boundary-control]]
- [[state-transparency]]
- [[agentic-loop-self-correction]]
