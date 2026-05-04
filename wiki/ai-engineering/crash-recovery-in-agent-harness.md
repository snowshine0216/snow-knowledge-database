---
aliases: [Crash Recovery in Agent Harness]
tags: [crash-recovery, harness-engineering, checkpoints, agents, fault-tolerance]
source: internal
---

# Crash Recovery in Agent Harness

Crash Recovery in Agent Harness is the ability of an agent system to **resume useful work after interruption** instead of starting over from zero.

Interruptions happen for many reasons:

- process crash
- machine restart
- context overflow
- deployment change
- timeout or forced termination

Reliable agent systems assume these events will happen and design recovery around them.

## What Recovery Usually Requires

- a durable record of current task state
- enough recent observations to understand what was attempted
- a checkpoint, plan file, or summary that can be reloaded
- clear stop reasons so the next run knows why execution ended

This is why crash recovery depends heavily on [[filesystem-as-memory]] and [[state-transparency]]. If important state is invisible or ephemeral, recovery becomes reconstruction by guesswork.

## Recovery Patterns

### Checkpoint and resume

Persist plan, progress, and compacted context periodically so a future run can continue from the latest stable point.

### Graceful failure

When budgets or policy limits are hit, stop cleanly and save state instead of dying mid-step.

### Escalation exit

If recovery is ambiguous, stop with enough detail that a human can take over via [[human-in-the-loop]].

## Why It Matters

Long-running agents are only practical if interruption is survivable. Otherwise every disconnection, restart, or tool failure destroys the value of previous work and turns autonomous execution into expensive repetition.

## Practical Rule

If the task is worth running for hours, it is worth designing to resume after failure.

## See Also

- [[filesystem-as-memory]]
- [[state-transparency]]
- [[runtime-boundary-control]]
- [[long-running-agent-harness]]
