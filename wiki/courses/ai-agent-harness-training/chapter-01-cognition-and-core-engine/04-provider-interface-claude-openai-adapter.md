---
tags: [ai-agent, harness-engineering, go, provider, claude, openai, adapter-pattern, llm-interface, zhipu, glm]
source: https://time.geekbang.org/column/article/967860
---

# Chapter 04: Provider 接口 — Claude 与 OpenAI 双协议适配器

## Overview

在 go-tiny-claw 的 Harness 架构中，Provider 层充当"同声传译员"：Main Loop 只认识内部的 `schema.Message`、`schema.ToolCall`、`schema.ToolResult` 三种结构，而 Provider 负责在这套内部语言与各大厂商 SDK（OpenAI V3、Anthropic）的复杂协议格式之间进行双向翻译。通过单一接口 `LLMProvider.Generate(ctx, messages, availableTools)`，引擎实现了对底层 SDK 的完全解耦——当 `availableTools` 为空时即触发慢思考（Phase 1），非空时触发行动阶段（Phase 2），同一套逻辑无缝适配智谱 GLM 的 OpenAI 兼容端点和 Claude 兼容端点。

---

## Key Concepts

### 1. `LLMProvider` 接口契约

```go
// internal/provider/interface.go
type LLMProvider interface {
    Generate(
        ctx context.Context,
        messages []schema.Message,
        availableTools []schema.ToolDefinition,
    ) (*schema.Message, error)
}
```

`availableTools` 为空 = Phase 1（剥夺工具，强制慢思考）；非空 = Phase 2（挂载工具，等待行动）。这是接口的隐含语义约定，不通过额外参数表达。

---

### 2. OpenAI Adapter 关键翻译点（`openai-go/v3`）

- **Tool Result**：`openai.ToolMessage(content, toolCallID)` — V3 中参数顺序为 `(content, toolCallID)`，与旧版相反
- **ToolCall 历史回放**：`ChatCompletionMessageToolCallUnionParam{OfFunction: &...}` — `OfFunction` 为指针类型
- **InputSchema**：先尝试类型断言为 `map[string]interface{}` 转 `shared.FunctionParameters`，失败则 JSON 往返序列化（双保险策略）
- **慢思考支撑**：`if len(openaiTools) > 0 { params.Tools = openaiTools }` — 空工具列表不挂载 Tools 字段

---

### 3. Claude Adapter 关键翻译点（`anthropic-sdk-go`）

- **System 消息**：从消息数组中单独提取，作为 `params.System = []anthropic.TextBlockParam{{Text: ...}}`，而非放入 `Messages` 数组
- **Tool Result**：`anthropic.NewUserMessage(anthropic.NewToolResultBlock(toolCallID, content, false))` — 必须包装在 User 消息中，这是与 OpenAI 最大的结构差异
- **ToolCall 历史回放**：`ContentBlockParamUnion{OfToolUse: &anthropic.ToolUseBlockParam{ID, Name, Input}}` — `Input` 类型为 `map[string]interface{}`，需 `json.Unmarshal` 从 `[]byte` 得到
- **InputSchema 严格结构化**：必须从 `InputSchema.(map[string]interface{})` 手动提取 `properties` 和 `required` 字段分别填充 `ToolInputSchemaParam`，不接受整体 JSON map

---

### 4. 智谱 GLM 双协议兼容

智谱端点 `https://open.bigmodel.cn/api/paas/v4/` 同时支持 OpenAI 协议和 Anthropic 协议。两个适配器仅在构造函数中替换 `option.WithBaseURL(...)` 即可接入，其余翻译逻辑完全不变。

---

### 5. Adaptive Reasoning（自适应推理）

| 任务类型 | `EnableThinking` | 效果 |
|---------|-----------------|------|
| 简单检索（查天气、列目录） | `false` | 跳过 Phase 1，直接行动，极低 Token 消耗 |
| 复杂重构（多文件依赖分析） | `true` | Phase 1 强制规划，防止盲目行动，用算力换准确性 |

实验证明：`EnableThinking=true` 时，模型在 Phase 1 会自发生成 XML 格式伪工具调用（如 `<invoke name="getWeather">`），这是算力浪费的直接证据——简单任务不需要"系统 2"推理。

---

## Key Takeaways

- **接口隔离**：`LLMProvider` 单一方法将 Main Loop 与厂商 SDK 完全解耦，OpenAI 和 Claude 在引擎内部都收敛为 `schema.Message` 序列
- **最大协议差异**：Tool Result 在 OpenAI 中是独立 `role=tool` 消息，在 Claude 中必须嵌入 `role=user` 消息的 `ToolResultBlock` 中
- **V3 破坏性变更**：OpenAI Go SDK V3 的 `ToolMessage` 参数顺序反转，`OfFunction` 为指针类型
- **即插即用验证**：在 `main.go` 中切换 `NewZhipuOpenAIProvider` 与 `NewZhipuClaudeProvider`，运行结果完全相同，证明抽象层正确

---

## See Also

- [[03-two-phase-thinking-react-loop]] — Ch.03：慢思考两阶段架构，Provider 抽象所服务的 Main Loop
- [[05-tool-registry-bash-primitive]] — Ch.05：真实 Tool Registry 与 Bash 原语
- [[agent-frameworks/go-tiny-claw]] — go-tiny-claw 整体架构概览
- [[ai-engineering/adapter-pattern-llm]] — Adapter Pattern 在 LLM 工程中的通用应用
