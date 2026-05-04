---
aliases: [Adapter Pattern, LLM Adapter Pattern, Provider Adapter]
tags: [adapter-pattern, llm-provider, interface-design, harness-engineering, abstraction]
source: internal
---

# Adapter Pattern

Adapter Pattern is the design move of wrapping incompatible external interfaces behind one stable internal contract.

In LLM systems, different providers expose different SDK shapes for:

- system message placement
- tool schema definitions
- tool result replay
- streaming event formats
- authentication and base URL setup

Without an adapter layer, those differences leak upward into the main loop and couple core agent control flow to vendor-specific protocol details.

## Why It Matters in Harnesses

In a harness, the engine should reason in one internal language while adapters translate to and from provider-specific APIs. That keeps the core loop focused on state, control flow, and runtime policy instead of SDK quirks.

Typical benefits are:

- switch providers without rewriting the engine
- test the loop against mocks or local stubs
- isolate protocol drift to one boundary
- keep the internal schema small and legible

## Typical LLM Example

An internal `Message` or `ToolCall` schema is translated into OpenAI, Anthropic, or compatible vendor request bodies. Responses are then translated back into the same internal types. The runtime sees one contract even though the outside world does not share one.

## Tradeoff

Adapters reduce coupling, but they also become the translation hotspot. If the internal contract is vague or bloated, the adapter layer turns into another hidden complexity sink. The fix is to keep the internal interface minimal and explicit.

## Practical Rule

If your main loop contains provider-specific branching, you probably need an adapter boundary.

## See Also

- [[harness-engineering]]
- [[llm-api-statelessness]]
- [[context-engineering]]
- [[04-provider-interface-claude-openai-adapter]]
