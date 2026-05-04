---
aliases: [Context Engineering]
tags: [context-engineering, context-window, harness-engineering, prompt-engineering, agents]
source: internal
---

# Context Engineering

Context Engineering is the discipline of deciding **what information an LLM should see for this call, in what structure, and in what order**. If [[prompt-engineering]] is about phrasing instructions well, context engineering is about assembling the evidence bundle the model reasons over.

## Why It Exists

Hosted LLM calls are stateless. Every turn must replay the relevant state, constraints, retrieved knowledge, and tool definitions. That is why [[llm-api-statelessness]] naturally leads to context engineering: if the bundle is wrong, the model's reasoning starts from the wrong world state.

## Core Operations

1. **Select** the minimum relevant information.
2. **Structure** it so high-value signals are legible.
3. **Prune** low-signal or stale material before it crowds out what matters.
4. **Replay** enough task state that the next call can continue coherently.

Typical ingredients include:

- system instructions
- current task state
- recent observations
- retrieved reference material
- tool schemas
- memory files or checkpoints

## What Good Context Engineering Looks Like

- The model sees the task boundary clearly.
- The latest constraints are not buried under old noise.
- Large artifacts are referenced indirectly when possible instead of pasted wholesale.
- State is explicit enough that a fresh call can resume work without guessing.

This is why mature [[harness-engineering]] systems separate context engineering from prompt writing. Prompt quality matters, but an excellent prompt wrapped around a bad evidence bundle still fails.

## Common Failure Modes

- **Under-context**: the model is missing a critical fact, prior decision, or file path.
- **Over-context**: too much irrelevant material causes [[context-bloat-and-attention-dilution]].
- **Stale context**: the bundle reflects an earlier task state, not the current one.
- **Unstructured replay**: everything is appended linearly, making important signals hard to recover.

## Practical Rule

Treat context like working memory, not storage. Storage can be large; working memory must stay selective. When the bundle grows too large, hand off to [[context-compaction]] or an external state store rather than hoping the model will sort the noise for you.

## See Also

- [[llm-api-statelessness]]
- [[harness-engineering]]
- [[context-compaction]]
- [[context-bloat-and-attention-dilution]]
