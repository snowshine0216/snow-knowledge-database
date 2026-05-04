---
aliases: [Agentic Loop, Self-Correction Loop, Agentic Loop Self-Correction, Self-Correction（模型自纠）]
tags: [agentic-loop, self-correction, tool-use, harness-engineering, agents]
source: internal
---

# Agentic Loop Self-Correction

Agentic Loop Self-Correction is the pattern where tool outputs, failures, and intermediate observations are fed back into the next turn so the model can revise its plan instead of terminating immediately.

This is one of the main reasons an agent loop is more capable than a single-shot prompt: failure becomes information, not just a stop signal.

## The Core Mechanism

The loop is simple:

1. model proposes an action
2. tool executes the action
3. result or error is written back into context
4. model sees the observation and decides the next move

If the returned observation says "file not found", "syntax error", or "tool does not exist", the model can try a different path on the next turn. This is the foundation of self-correction.

## Why It Works

The model does not need perfect foresight if the loop is honest about reality. The harness supplies the missing feedback channel. That is why [[harness-engineering]] is more than tool exposure: it shapes how observations come back and what the model can do with them.

## What Good Self-Correction Requires

- error outputs must be visible to the model
- observations must stay associated with the triggering action
- retry behavior must be bounded
- there must be a way to escalate or stop when the loop is no longer improving

Without those controls, self-correction degrades into blind repetition.

## Failure Modes

- infinite retry loops
- repeated use of the wrong tool
- local fixes that never revisit the broader plan
- context growth from too many failed attempts

That is why self-correction often needs companions:

- [[human-in-the-loop]] for high-risk or ambiguous failures
- [[context-compaction]] when a long run accumulates too much failed history
- stronger [[context-engineering]] so the model sees the right state before retrying

## Practical Rule

Do not treat every tool error as a fatal runtime exception. First ask whether the error is informative enough to become the next observation. If yes, keep the loop alive. If not, stop early and escalate.

## See Also

- [[harness-engineering]]
- [[human-in-the-loop]]
- [[context-engineering]]
- [[context-compaction]]
