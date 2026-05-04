---
aliases: [Turing Complete Toolset, 图灵完备工具集]
tags: [turing-complete-toolset, minimal-tools, agent-tools, harness-engineering, bash]
source: internal
---

# Turing Complete Toolset

Turing Complete Toolset is the idea that a very small set of general primitives can express the full space of useful local agent actions without requiring a large catalog of specialized tools.

For coding harnesses, the common minimal set is:

- read
- write
- edit
- bash

Together, these cover inspection, creation, partial modification, and arbitrary operating-system interaction.

## Why It Matters

Every extra tool usually adds more schema, more maintenance burden, and more attention competition inside the prompt. A small but expressive toolset gives the model broad capability without overwhelming it with dozens of overlapping choices.

That is why toolset size is not just a product design question. It is also a context-engineering question.

## Why `bash` Changes the Equation

Once a model has a shell primitive, it can often reach many existing system capabilities indirectly:

- version control through `git`
- search through `grep` or similar tools
- package management through ecosystem CLIs
- network access through command-line utilities

This is what makes a compact local toolset surprisingly powerful: the agent does not need a custom tool for every sub-capability if one primitive already exposes the operating system's existing surface.

## Tradeoff

A turing-complete toolset is powerful, but it puts more pressure on boundary control. Minimality does not remove risk. It removes tool-count sprawl while demanding stronger runtime limits on the remaining powerful primitives.

## Practical Rule

Prefer the smallest toolset that preserves expressive power. Add specialized tools only when they reduce cost or ambiguity more than they increase context bloat.

## See Also

- [[context-bloat-and-attention-dilution]]
- [[yolo-execution-philosophy]]
- [[fuzzy-edit-tool]]
- [[06-minimal-toolset-yolo-philosophy]]
