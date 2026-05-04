---
aliases: [ReadFileTool, Read File Tool, read_file 工具]
tags: [read-file-tool, file-io, workdir-constraint, agent-tools, harness-engineering]
source: internal
---

# ReadFileTool

ReadFileTool is the canonical first physical tool in a local coding harness: it turns a model request for file contents into bounded filesystem I/O.

It is a useful teaching example because it shows that even a simple read operation needs multiple defenses.

## Typical Defense Chain

- parse arguments late and explicitly
- restrict paths to the active work directory
- surface filesystem errors back to the model
- truncate oversized output before it floods context

## Why It Matters

ReadFileTool makes the harness boundary concrete. The model is not reading arbitrary machine state; it is reading through a controlled interface with explicit physical limits.

## Practical Rule

Treat file reads as runtime-controlled I/O, not as a harmless helper. A read tool can still create path traversal, context bloat, and silent state confusion if it is unbounded.

## See Also

- [[tool-registry]]
- [[basetool-interface]]
- [[workdir-constraint]]
- [[tool-call-offloading]]
