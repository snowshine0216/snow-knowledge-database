---
aliases: [Filesystem as Memory]
tags: [filesystem-as-memory, memory, harness-engineering, checkpointing, agent-state]
source: internal
---

# Filesystem as Memory

Filesystem as Memory is the pattern of storing an agent's working state in ordinary files instead of keeping that state only in process memory or hidden framework internals.

Typical examples include:

- `TODO.md`
- `plan.md`
- checkpoint files
- compacted summaries
- scratch notes written during a long task

## Why It Exists

LLM calls are stateless, and long-running tasks are fragile. If critical state lives only inside a running process, then crashes, restarts, upgrades, or context overflow can wipe out the agent's progress. Externalizing that state to files makes it durable and inspectable.

This is why filesystem-backed memory pairs naturally with [[llm-api-statelessness]] and [[harness-engineering]].

## Benefits

### Recovery

After interruption, the next run can reload the state and continue.

### Human collaboration

Operators can open the files, see the current plan, and intervene if the agent is drifting.

### Simplicity

For many local or single-repo agents, files are easier to reason about than a dedicated database or hidden state container.

## Tradeoffs

- state must stay synchronized with execution
- noisy files can feed bad context back into the model
- governance is still needed: what gets persisted, when, and in what format?

So filesystem memory is not a magic replacement for all memory systems. It is a practical external state carrier that optimizes for recovery and operator visibility.

## Practical Rule

If the task is long enough that losing the current plan would be expensive, the state should probably exist outside the process.

## See Also

- [[llm-api-statelessness]]
- [[state-transparency]]
- [[crash-recovery-in-agent-harness]]
- [[long-running-agent-harness]]
