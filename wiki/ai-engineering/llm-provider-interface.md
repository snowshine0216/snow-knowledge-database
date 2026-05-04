---
aliases: [LLMProvider Interface, LLMProvider 接口]
tags: [llm-provider-interface, interface-design, llm, harness-engineering, provider]
source: internal
---

# LLMProvider Interface

LLMProvider Interface is the stable contract between an agent engine and any concrete model backend.

Instead of letting the main loop depend on OpenAI, Claude, or any single SDK directly, the engine talks to one internal interface such as `Generate(ctx, messages, tools)`. Concrete providers then translate that internal contract into vendor-specific requests and responses.

## Why It Matters

This interface is what keeps the main loop vendor-agnostic. Without it, every provider quirk leaks into execution logic and makes provider switching expensive.

## Practical Rule

If adding a new model vendor requires editing the main loop, the provider interface is too weak or too leaky.

## See Also

- [[adapter-pattern]]
- [[openai-provider]]
- [[claude-provider]]
- [[04-provider-interface-claude-openai-adapter]]
