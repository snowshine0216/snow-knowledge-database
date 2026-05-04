---
aliases: [ClaudeProvider, Claude 适配器, Anthropic Provider]
tags: [claude-provider, anthropic, llm-provider, adapter-pattern, harness-engineering]
source: internal
---

# ClaudeProvider

ClaudeProvider is a concrete implementation of an internal LLM provider interface that translates harness data structures into Anthropic's request and content-block format.

Compared with OpenAI-style providers, the important work is in the translation details: system-message handling, tool result wrapping, tool-use replay, and strict schema shaping.

## Why It Matters

Claude support makes the provider abstraction earn its keep. The engine can stay unchanged only because the provider absorbs structural differences that would otherwise infect the main loop.

## Practical Rule

When a vendor protocol treats system prompts, tool use, or tool results differently, isolate that difference inside the provider adapter rather than teaching the engine multiple protocol dialects.

## See Also

- [[llm-provider-interface]]
- [[openai-provider]]
- [[tool-result-format-difference]]
- [[adapter-pattern]]
