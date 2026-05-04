---
aliases: [BaseTool 接口, BaseTool Interface]
tags: [basetool-interface, interface-design, agent-tools, harness-engineering, go]
source: internal
---

# BaseTool Interface

BaseTool Interface is the contract that every tool implementation must satisfy before it can be mounted into a harness registry.

The exact method names can vary by codebase, but the contract usually requires three things:

- a stable tool name
- a machine-readable definition or input schema
- an execution entrypoint that accepts structured arguments

## Why It Matters

This contract does two jobs at once. It gives the model a reliable callable surface, and it gives the runtime a uniform way to register, inspect, and execute tools.

That is why interface design matters here: the harness is not just exposing functions, it is standardizing how tools become part of the runtime.

## Practical Rule

If one tool needs special-case handling in the registry, the interface is probably too weak or inconsistently applied.

## See Also

- [[tool-registry]]
- [[read-file-tool]]
- [[05-tool-registry-and-dispatch]]
