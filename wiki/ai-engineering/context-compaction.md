---
aliases: [Context Compaction]
tags: [context-compaction, context-window, token-optimization, harness-engineering, agents]
source: internal
---

# Context Compaction

Context Compaction is the harness-side process of shrinking a growing conversation or task history **without losing the information needed to continue the work**. It is the runtime answer to a simple fact: long-running agents eventually exceed the practical limits of the context window.

## What It Is Not

Context compaction is not just blind truncation. Truncation drops the oldest tokens and hopes nothing important was there. Compaction tries to preserve task continuity by transforming history into a smaller, more useful state representation.

## The Usual Strategy Ladder

1. **Summarize old turns** into stable conclusions, decisions, and open questions.
2. **Delete redundancy** once detailed evidence is no longer needed inline.
3. **Externalize large artifacts** into files, checkpoints, or memory stores.
4. **Preserve the live edge**: system prompt, current plan, latest observations, and immediate next actions.

This makes context compaction the memory-management layer inside [[harness-engineering]]. It sits directly next to [[context-engineering]]: one decides what belongs in the bundle, the other shrinks the bundle when it becomes too large.

## Why It Matters

Without compaction, long tasks degrade in three ways:

- token cost climbs every turn
- early constraints silently disappear as replay bundles overflow
- the model becomes increasingly distracted by stale history

That third failure mode is exactly where [[context-bloat-and-attention-dilution]] starts to hurt reliability.

## Good Outputs of Compaction

A compacted state should preserve:

- what the system is trying to achieve
- what has already been done
- what was learned from failures
- what must never be forgotten
- what the next likely action is

If those survive, the agent can continue as if it had a smaller but cleaner working memory.

## Design Principle

The goal is not to preserve every token. The goal is to preserve the task's decision boundary. If a future turn needs the full artifact again, it should be able to recover it from file storage, logs, or checkpoints instead of keeping everything inline forever.

## See Also

- [[context-engineering]]
- [[llm-api-statelessness]]
- [[harness-engineering]]
- [[long-running-agent-harness]]
