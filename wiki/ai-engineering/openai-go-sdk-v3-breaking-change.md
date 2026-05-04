---
aliases: [OpenAI Go SDK V3 Breaking Change, OpenAI V3 破坏性变更, OpenAI V3 Breaking Change]
tags: [openai-go-v3, sdk-breaking-change, openai, provider-adapters, harness-engineering]
source: internal
---

# OpenAI Go SDK V3 Breaking Change

OpenAI Go SDK V3 Breaking Change refers to the adapter-breaking API shifts that require code updates when moving provider integrations to the V3 package.

In this course slice, the high-risk examples are constructor argument order changes and pointer-shape changes in tool-call union fields. These are the kind of changes that compile differently, replay tool history incorrectly, or silently break tool result linking.

## Why It Matters

Provider adapters often sit on narrow protocol details. A small SDK change can therefore break the semantic continuity between tool call and tool result even if the surrounding engine design is still correct.

## Practical Rule

When upgrading a provider SDK, audit tool-call replay and tool-result wiring first. Those are the most fragile seams.

## See Also

- [[openai-provider]]
- [[llm-provider-interface]]
- [[tool-result-format-difference]]
- [[04-provider-interface-claude-openai-adapter]]
