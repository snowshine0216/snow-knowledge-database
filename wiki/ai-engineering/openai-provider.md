---
aliases: [OpenAIProvider, OpenAI 适配器]
tags: [openai-provider, openai, llm-provider, adapter-pattern, harness-engineering]
source: internal
---

# OpenAIProvider

OpenAIProvider is a concrete implementation of an internal LLM provider interface that translates harness messages, tools, and tool results into OpenAI-compatible protocol shapes.

Its job is not just to call the API. It must also replay tool calls, encode tool definitions, and map vendor-specific message structures back into the harness's internal schema.

## Why It Matters

This provider shows why adapters are necessary. Even when the public capability seems similar, SDK details such as tool message constructors, union fields, and schema parameter types can differ enough to break the harness if not isolated.

## Practical Rule

Treat OpenAI compatibility as a protocol translation problem, not as permission to let OpenAI SDK types leak into the engine.

## See Also

- [[llm-provider-interface]]
- [[claude-provider]]
- [[tool-result-format-difference]]
- [[adapter-pattern]]
