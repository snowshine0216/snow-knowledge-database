---
aliases: [Tool Registry, 工具注册表, Registry（工具注册与分发）]
tags: [tool-registry, function-calling, dispatch, harness-engineering, agent-tools]
source: internal
---

# Tool Registry

Tool Registry is the middleware layer that connects model-emitted tool calls to concrete tool implementations.

In a harness, the main loop should not know how each tool works. It should only pass a tool name plus arguments to a registry that can find the right implementation and run it.

## Core Responsibilities

- register available tools
- expose tool definitions and schemas to the model
- route each tool call to the correct executor

This is what keeps the main loop small while still allowing the tool surface to grow.

## Why It Matters

Without a registry, every new tool leaks routing logic back into the engine. With a registry, new tools can be added as isolated modules and the engine stays unchanged.

## Practical Rule

If the main loop needs `if` or `switch` branches for individual tools, the registry boundary is not doing its job.

## See Also

- [[basetool-interface]]
- [[read-file-tool]]
- [[05-tool-registry-and-dispatch]]
