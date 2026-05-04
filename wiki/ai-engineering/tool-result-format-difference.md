---
aliases: [Tool Result Format Difference, ToolResult 位置差异, Tool Result 差异]
tags: [tool-result-format-difference, tool-use, provider-adapters, openai, anthropic]
source: internal
---

# Tool Result Format Difference

Tool Result Format Difference is the mismatch between how different model providers expect tool outputs to be represented in conversation history.

For example, one provider may use a dedicated tool-role message, while another may require the tool result to be wrapped inside a user message block. The semantic intent is the same, but the wire format is not.

## Why It Matters

This is one of the easiest places to silently break a harness. If tool results are replayed in the wrong structural position, the model loses the causal link between action and observation even though the data still looks "present" to a human reader.

## Practical Rule

Normalize tool results into one internal schema, and let provider adapters handle the vendor-specific placement and wrapping rules.

## See Also

- [[llm-provider-interface]]
- [[openai-provider]]
- [[claude-provider]]
- [[react-paradigm]]
