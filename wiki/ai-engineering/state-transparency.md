---
aliases: [State Transparency]
tags: [state-transparency, observability, harness-engineering, agent-state, debugging]
source: internal
---

# State Transparency

State Transparency is the principle that an agent's important working state should be **inspectable, explainable, and externally recoverable** rather than hidden inside an opaque runtime or state machine.

In practice, this means the system should make it clear:

- what it currently believes
- what it has already done
- what it plans to do next
- what facts or observations caused the last decision

This is one of the major differences between a transparent harness and a brittle workflow engine.

## Why It Matters

When state is hidden, debugging becomes guesswork. A failure may look like "the agent is confused," but the real issue is often invisible state drift, stale intermediate data, or a bad transition buried in framework internals.

With transparent state, humans and tools can intervene:

- inspect the live plan
- verify whether the last observation was recorded correctly
- checkpoint or compact the right information
- resume work after interruption

That makes state transparency foundational for both [[crash-recovery-in-agent-harness]] and [[filesystem-as-memory]].

## What Transparent State Often Looks Like

- explicit message history
- visible task lists or plan files
- structured tool observations
- summaries or checkpoints written to disk
- logs that explain why execution paused or terminated

## What It Is Not

State transparency does not require exposing every token of private chain-of-thought. The goal is not maximal disclosure. The goal is operational legibility: enough state is visible that the system can be audited, resumed, and corrected.

## Practical Rule

If a human cannot answer "what is the agent doing right now and why?" without reading source code or guessing, the system does not have enough state transparency.

## See Also

- [[harness-engineering]]
- [[filesystem-as-memory]]
- [[crash-recovery-in-agent-harness]]
- [[context-engineering]]
