---
aliases: [Tool Call Offloading, 工具输出卸载]
tags: [tool-call-offloading, context-window, token-optimization, agent-tools, harness-engineering]
source: internal
---

# Tool Call Offloading

Tool Call Offloading is the pattern of moving oversized tool outputs out of the live prompt bundle while preserving a path to recover the full artifact later.

Instead of pasting a huge file or command result directly into context, the harness stores the full payload elsewhere and returns a compact summary such as a preview, metadata, and a reference path.

## Why It Matters

This is a stronger answer than blunt truncation. Truncation protects the context window, but it also destroys information. Offloading keeps the prompt lean without severing access to the complete result.

## Typical Return Shape

- short head preview
- short tail preview
- size or line-count metadata
- path or handle for follow-up reads

## Practical Rule

When a tool output is too large to inline but still important for downstream decisions, offload it instead of dropping it.

## See Also

- [[context-bloat-and-attention-dilution]]
- [[context-compaction]]
- [[read-file-tool]]
- [[05-tool-registry-and-dispatch]]
