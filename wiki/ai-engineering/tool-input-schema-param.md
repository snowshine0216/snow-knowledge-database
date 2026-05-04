---
aliases: [ToolInputSchemaParam, Claude ToolInputSchemaParam, ToolInputSchemaParam 拆解模式]
tags: [tool-input-schema-param, anthropic, tool-schema, provider-adapters, harness-engineering]
source: internal
---

# ToolInputSchemaParam

ToolInputSchemaParam is the strict schema-shaping requirement used by Anthropic-style tool definitions, where fields such as `properties` and `required` must be populated explicitly instead of passing one raw JSON map through unchanged.

This matters inside provider adapters because the harness may store tool schemas in a generic internal format, but the vendor SDK still expects a more structured destination shape.

## Why It Matters

If the provider adapter does not extract and reassemble these fields correctly, the tool schema can become incomplete or malformed even when the logical tool definition is correct.

## Practical Rule

Treat schema translation as a typed adapter step, not as a blind map pass-through.

## See Also

- [[claude-provider]]
- [[llm-provider-interface]]
- [[adapter-pattern]]
- [[04-provider-interface-claude-openai-adapter]]
