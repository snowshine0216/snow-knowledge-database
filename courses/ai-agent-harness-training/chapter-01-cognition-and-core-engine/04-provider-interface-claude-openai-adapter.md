---
tags: [ai-agent, harness-engineering, go, provider, claude, openai, adapter-pattern, llm-interface, zhipu, glm, tool-calling]
source: https://time.geekbang.org/column/article/967860
wiki: wiki/courses/ai-agent-harness-training/chapter-01-cognition-and-core-engine/04-provider-interface-claude-openai-adapter.md
---

# 04｜大脑接入：抽象 Provider 接口，适配 Claude 与 OpenAI 兼容大模型

**课程**：AI Agent 工程化训练营 · 《从0开始构建 Agent Harness》  
**作者**：Tony Bai  
**章节**：第 04 讲  
**日期**：2026-05-04

---

## Pre-Test（读前自测）

> 先用这三道问题检测已有认知，再对照正文看答案是否准确。

1. **接口设计**：在 Go 语言中，`LLMProvider` 接口只有一个方法 `Generate`，它的完整签名是什么？为什么 `availableTools` 参数使用 nil/空切片来区分"慢思考阶段"和"行动阶段"？

2. **协议差异**：Claude（Anthropic SDK）与 OpenAI 在处理"工具调用历史回放"时，最关键的结构体差异是什么？（提示：OpenAI 用 `ToolMessage(content, toolCallID)`，Claude 用什么？）

3. **自适应推理**：`EnableThinking = true` 与 `EnableThinking = false` 在 token 消耗和任务适配上各有什么代价和收益？什么类型的任务应该关闭慢思考？

---

## Chapter Metadata

| 字段 | 内容 |
|------|------|
| 核心问题 | 如何用 Provider 抽象层隔离 OpenAI 与 Claude 的 API 协议差异，实现即插即用的大脑接入 |
| 关键技术 | Adapter Pattern、Go Interface、OpenAI SDK V3、Anthropic SDK、智谱 GLM 兼容层 |
| 前置章节 | Ch.03（两阶段慢思考架构）|
| 后续章节 | Ch.05（真实 Tool Registry 与 Bash 原语）|
| 代码路径 | `internal/provider/interface.go`、`internal/provider/openai.go`、`internal/provider/claude.go` |

---

## Cornell Notes

### Cue Column ↔ Notes Column

---

**Q: Provider 层的核心职责是什么？用一个比喻描述。**

Provider 层是"同声传译员"（Translator）。Main Loop 只说一种语言：内部的 `schema.Message`、`schema.ToolCall`、`schema.ToolResult`。Provider 负责双向翻译：

- **出站**：把干净的 `[]schema.Message` 历史翻译为厂商 SDK 的复杂请求体（如 OpenAI 的 `ChatCompletionMessageParamUnion` 或 Claude 的 `anthropic.MessageParam`）
- **入站**：把厂商返回的 `ToolUseBlock`（Claude）或 `ToolCall`（OpenAI）翻译回 `schema.ToolCall`

---

**Q: `LLMProvider` 接口的完整 Go 签名是什么？**

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

关键设计：当 `availableTools` 为 `nil` 或长度为 0 时，Provider 不挂载 `Tools` 字段到 SDK 请求中。这是 Main Loop 触发 Phase 1（慢思考）的唯一信号——不是通过特殊参数，而是通过传入空工具列表。

---

**Q: 为什么直接在 Main Loop 里写 if/else 判断模型类型是"面条代码"？**

```go
// 反面教材：直接在 Main Loop 中耦合 SDK
if engine.ModelType == "claude" {
    // 构造 anthropic.MessageParam
    // 解析 anthropic.ToolUseBlock
} else if engine.ModelType == "openai" {
    // 构造 openai.ChatCompletionMessage
    // 解析 openai.ToolCall
}
```

违背了 Harness Engineering 的极简与解耦哲学：Main Loop 的唯一职责是维护上下文时间线（Context History），不应该知道外部的通信协议。Provider 抽象层将这一职责完全隔离。

---

**Q: OpenAI Adapter 的关键翻译细节——ToolMessage 和 ToolCall 历史回放**

**OpenAI SDK V3** 中（`github.com/openai/openai-go/v3`）：

- 工具调用结果（Tool Result）用 `openai.ToolMessage(content, toolCallID)` 构造，**注意 V3 中参数顺序是 `(content, toolCallID)`**，与旧版不同
- 历史中的 Assistant ToolCalls 必须原样放回，使用 `ChatCompletionMessageToolCallUnionParam`，其 `OfFunction` 字段类型为 **指针** `*openai.ChatCompletionMessageFunctionToolCallParam`

```go
// 历史 ToolCall 回放（OpenAI V3）
toolCalls = append(toolCalls, openai.ChatCompletionMessageToolCallUnionParam{
    OfFunction: &openai.ChatCompletionMessageFunctionToolCallParam{
        ID:   tc.ID,
        Type: "function",
        Function: openai.ChatCompletionMessageFunctionToolCallFunctionParam{
            Name:      tc.Name,
            Arguments: string(tc.Arguments), // []byte → string
        },
    },
})
```

---

**Q: OpenAI Adapter 的 InputSchema 翻译——类型适配技巧**

`schema.ToolDefinition.InputSchema` 是 `interface{}` 类型。OpenAI V3 要求 `shared.FunctionParameters`（底层是 `map[string]interface{}`）。翻译时使用"类型断言 + JSON 往返序列化"的双保险策略：

```go
var params shared.FunctionParameters
if m, ok := toolDef.InputSchema.(map[string]interface{}); ok {
    params = shared.FunctionParameters(m) // 直接断言
} else {
    // fallback：JSON 往返序列化保证类型匹配
    b, _ := json.Marshal(toolDef.InputSchema)
    _ = json.Unmarshal(b, &params)
}
```

---

**Q: Claude Adapter 与 OpenAI Adapter 的三大结构差异**

| 维度 | OpenAI Adapter | Claude Adapter |
|------|---------------|----------------|
| System 消息 | `openai.SystemMessage(content)` 加入消息数组 | 单独提取为 `params.System = []anthropic.TextBlockParam{{Text: systemPrompt}}` |
| Tool Result 消息 | `openai.ToolMessage(content, toolCallID)` | `anthropic.NewUserMessage(anthropic.NewToolResultBlock(toolCallID, content, false))` — 包装在 User 消息中 |
| ToolCall 历史回放 | `ToolUseBlockParam` 放在 `OfFunction` 指针字段 | `anthropic.ContentBlockParamUnion{OfToolUse: &anthropic.ToolUseBlockParam{ID, Name, Input}}` — `Input` 为 `map[string]interface{}` |

---

**Q: Claude Adapter 的 InputSchema 翻译——与 OpenAI 的关键差异**

Anthropic SDK 的 `ToolInputSchemaParam` 将 `properties` 和 `required` 做了严格的结构体抽离，不接受整个 JSON blob：

```go
// Claude Adapter：必须手动提取 properties 和 required
var properties map[string]any
var required []string
if m, ok := toolDef.InputSchema.(map[string]interface{}); ok {
    if p, ok := m["properties"].(map[string]interface{}); ok {
        properties = p
    }
    if r, ok := m["required"].([]string); ok {
        required = r
    }
}
tp := anthropic.ToolParam{
    Name:        toolDef.Name,
    Description: anthropic.String(toolDef.Description),
    InputSchema: anthropic.ToolInputSchemaParam{
        Properties: properties,
        Required:   required,
    },
}
```

对比 OpenAI 可以整体转换 `map[string]interface{}` 为 `shared.FunctionParameters`，Claude 必须逐字段填充。

---

**Q: 智谱 GLM 兼容层的接入原理——为什么两个 SDK 都能用？**

智谱（Zhipu）的 `open.bigmodel.cn/api/paas/v4/` 端点实现了对 **OpenAI 协议和 Anthropic（Claude）协议的双协议兼容**。两个适配器只需在构造函数中替换 `BaseURL`：

```go
// OpenAI SDK：替换 BaseURL
openai.NewClient(
    option.WithAPIKey(apiKey),
    option.WithBaseURL("https://open.bigmodel.cn/api/paas/v4/"),
)

// Anthropic SDK：同样替换 BaseURL
anthropic.NewClient(
    option.WithAPIKey(apiKey),
    option.WithBaseURL("https://open.bigmodel.cn/api/paas/v4/"),
)
```

核心逻辑（schema 翻译）完全不变，仅接入点不同。这正是 Provider 抽象的价值：国内模型替换国际模型，Main Loop 代码零修改。

---

**Q: `EnableThinking` 开关的实验结果——算力浪费的证据**

实验任务：「我想去北京跑步，帮我查查天气适合吗？」

**开启慢思考（EnableThinking = true）**时，Phase 1 出现了 LLM 在纯文本思考中"脑补"出 XML 格式的伪工具调用：

```xml
<invoke name="getWeather">
  <parameter name="location">北京</parameter>
</invoke>
```

这说明模型在被剥夺工具访问权时，因为"想要执行任务"的冲动，自发生成了非法格式的伪调用。这产生了大量额外 Token 消耗（Token Waste）和延迟（Latency），对简单检索任务完全没有必要。

**关闭慢思考（EnableThinking = false）**时，日志简洁：直接进入 Phase 2，正确输出 JSON ToolCall，完成任务，无伪调用。

---

**Q: Adaptive Reasoning（自适应推理）策略的判断标准**

| 任务类型 | EnableThinking 建议 | 理由 |
|---------|---------------------|------|
| 查天气、列目录、简单检索 | `false` | 路径明确，无需规划，慢思考造成 Token Waste |
| 分析 10 个文件依赖关系、重构缓存层 | `true` | 路径复杂，需要规划防止盲目行动，用算力换准确性 |

这是 **Adaptive Reasoning** 的工程化实现：不用"杀鸡用牛刀"，动态分配算力。

---

### Summary（本讲总结）

本讲完成了 go-tiny-claw 的"大脑接入"层。核心结论：

1. **Provider 是同声传译员**：通过 `LLMProvider` 接口的单一方法 `Generate`，将 Main Loop 与底层 SDK 协议完全解耦。OpenAI 和 Claude 的消息格式差异（尤其是 Tool Result 的位置和 System 消息的处理方式）全部收敛在适配器内部。

2. **三大翻译难点**：Tool Result 在 Claude 中是 User 消息中的 `ToolResultBlock`，在 OpenAI 中是独立的 `ToolMessage`；Claude 的 InputSchema 需要逐字段拆解 `properties` 和 `required`；OpenAI V3 的 ToolCall 回放 `OfFunction` 字段是指针类型。

3. **智谱双协议兼容**：仅替换 `BaseURL` 即可用官方 SDK 接入国内算力，零修改核心逻辑。

4. **Adaptive Reasoning**：`EnableThinking` 硬开关是算力自适应分配的工程化体现——简单任务关闭慢思考，复杂任务开启，避免系统性 Token Waste。

---

## Key Takeaways

1. **接口即契约**：Go interface `LLMProvider` 仅暴露一个方法 `Generate(ctx, messages, availableTools)`，`availableTools` 为空即代表"慢思考模式"——这是一种隐含的语义约定，值得记忆。

2. **Claude vs OpenAI Tool Result 位置差异**：OpenAI 的 tool result 是独立的 `role=tool` 消息；Claude 的 tool result 必须包裹在 `role=user` 消息中，作为 `ToolResultBlock`——这是最易踩坑的差异。

3. **OpenAI V3 破坏性变更**：`ToolMessage` 参数顺序从旧版 `(toolCallID, content)` 改为 `(content, toolCallID)`，且 `OfFunction` 字段为指针类型，编译错误即提示，但语义错误无提示。

4. **Claude InputSchema 严格结构化**：Anthropic SDK 的 `ToolInputSchemaParam` 要求单独填充 `Properties` 和 `Required`，不能整体传入 JSON map——比 OpenAI 更严格。

5. **即插即用的工程价值**：`NewZhipuOpenAIProvider` 与 `NewZhipuClaudeProvider` 可在 `main.go` 中任意切换，效果完全一致——这验证了抽象层的正确性。

---

## Knowledge Graph Seeds

### 1. 本讲核心节点

- [[LLMProvider Interface]] — Go interface，单方法 `Generate(ctx, messages, tools)`，将 Main Loop 与厂商 SDK 完全解耦
- [[OpenAIProvider]] — 实现 [[LLMProvider Interface]] 的 OpenAI 适配器，使用 `openai-go/v3` SDK
- [[ClaudeProvider]] — 实现 [[LLMProvider Interface]] 的 Anthropic 适配器，使用 `anthropic-sdk-go`
- [[Adapter Pattern]] — 将不兼容的厂商协议统一到内部 `schema` 类型，零侵入 Main Loop
- [[Tool Result Format Difference]] — OpenAI 用独立 `role=tool` 消息，Claude 将 ToolResultBlock 包裹在 `role=user` 消息中
- [[ToolInputSchemaParam]] — Claude SDK 要求逐字段填充 `properties` 与 `required`，不接受整体 JSON map
- [[Adaptive Reasoning]] — 通过 `EnableThinking` 开关动态分配慢思考算力，避免简单任务的 Token Waste
- [[Pseudo Tool Call]] — 模型在无工具环境下自发生成 XML 格式伪调用，是 Adaptive Reasoning 存在的实验依据
- [[Zhipu GLM Dual Protocol]] — 智谱 GLM 同时兼容 OpenAI 协议与 Anthropic 协议，仅需替换 BaseURL
- [[OpenAI Go SDK V3 Breaking Change]] — V3 版 `ToolMessage` 参数顺序由 `(id, content)` 改为 `(content, id)`，`OfFunction` 字段改为指针类型

### 2. 课程内导航链接

- [[01-architecture-evolution-from-framework-to-harness]] — 第 01 讲 架构演进
- [[02-main-loop-react-cycle]] — 第 02 讲 Main Loop
- [[03-thinking-stage-slow-reasoning]] — 第 03 讲 Thinking Stage
- [[05-tool-registry-and-dispatch]] — 第 05 讲 Tool Registry
- [[06-minimal-toolset-yolo-philosophy]] — 第 06 讲 最简工具集

### 3. 课程外与通用概念关联

- Adapter Pattern — 经典 GoF 设计模式，本讲是其在 LLM 多厂商场景的典型工程化实践
- Go interface — Go 的隐式接口机制是 Provider 抽象层零侵入 Main Loop 的语言基础
- [[llm-api-statelessness|LLM API Statelessness]] — Provider 每次都只消费当轮 replay 的 `messages`，自身不应持有隐藏会话状态
- [[context-engineering|Context Engineering]] — `messages + availableTools` 的组织质量直接决定 Provider 的调用效果
- Token optimization — Adaptive Reasoning 的核心动机：对简单任务关闭慢思考以节省 Token
- OpenAI-compatible API — 智谱 GLM 的双协议兼容是这一生态的典型案例

### 4. 推荐关系边

- [[AgentEngine]] → 调用 → [[LLMProvider Interface]]
- [[LLMProvider Interface]] → 实现为 → [[OpenAIProvider]]
- [[LLMProvider Interface]] → 实现为 → [[ClaudeProvider]]
- [[OpenAIProvider]] → 依赖 → [[OpenAI Go SDK V3 Breaking Change]]
- [[ClaudeProvider]] → 依赖 → [[ToolInputSchemaParam]]
- [[Tool Result Format Difference]] → 区分 → [[OpenAIProvider]] 与 [[ClaudeProvider]]
- [[Adaptive Reasoning]] → 由证据 → [[Pseudo Tool Call]] 驱动
- [[Zhipu GLM Dual Protocol]] → 验证了 → [[Adapter Pattern]] 的即插即用价值
- [[Adapter Pattern]] → 消除了 → Main Loop 内的厂商耦合

### 5. 后续值得沉淀成卡片的主题

- **ToolResult 位置差异卡片** — OpenAI vs Claude 的 Tool Result 消息结构对比，含代码示例
- **OpenAI V3 破坏性变更备忘** — `ToolMessage` 参数顺序、`OfFunction` 指针类型，防踩坑速查
- **Claude ToolInputSchemaParam 拆解模式** — 从 `interface{}` 提取 `properties` + `required` 的标准模板
- **Adaptive Reasoning 决策矩阵** — 任务类型 × EnableThinking 的收益/代价表，可复用于其他 harness 设计
- **BaseURL 替换接入国内模型** — 以智谱为例的通用"OpenAI Compatible 快速接入"模式卡片

---

## Notes For Review

> [!warning]- 易错点汇总（3 个高概率踩坑位置）
>
> **坑 1：OpenAI V3 `ToolMessage` 参数顺序**
> - 旧版（V2）：`ToolMessage(toolCallID, content)`
> - V3 新版：`ToolMessage(content, toolCallID)` ← 顺序反了！
> - 后果：工具结果无法被模型正确关联，导致上下文断裂
>
> ---
>
> **坑 2：OpenAI V3 `OfFunction` 字段必须为指针**
> ```go
> // 错误写法（编译报错）
> OfFunction: openai.ChatCompletionMessageFunctionToolCallParam{...}
> // 正确写法
> OfFunction: &openai.ChatCompletionMessageFunctionToolCallParam{...}
> ```
>
> ---
>
> **坑 3：Claude `ToolInputSchemaParam` 不接受整体 map**
> - 必须手动从 `InputSchema.(map[string]interface{})` 中提取 `properties` 和 `required`
> - 如果 `required` 字段是 `[]interface{}` 而非 `[]string`，类型断言会静默失败 → 工具 Schema 残缺

> [!info]+ SDK 版本固定
>
> 本章使用的 SDK 包路径：
> - OpenAI Go SDK V3：`github.com/openai/openai-go/v3`（注意是 V3，不是旧版 `v1`/`v2`）
> - Anthropic SDK：`github.com/anthropics/anthropic-sdk-go`
>
> 智谱 API Base URL：`https://open.bigmodel.cn/api/paas/v4/`  
> 模型名：`glm-4.5-air`

> [!note]+ 下一讲预告
>
> Ch.05 将：
> 1. 抛弃 `mockRegistry`，实现真实的 `ToolRegistry`（动态挂载、强扩展性）
> 2. 实现 Bash 原语——让 Agent 真正能改变操作系统状态
> 3. 开启第二章"极简工具与物理交互"

---

## Post-Test（读后自测）

> [!question]- 📋 Post-Test 问题
>
> **题目 1：** `LLMProvider.Generate` 方法在慢思考阶段（Phase 1）和行动阶段（Phase 2）分别收到什么样的 `availableTools` 参数？Provider 内部如何响应这个信号？
>
> **题目 2：** 在 OpenAI Adapter 中，当历史消息里有 `schema.Message{Role: RoleUser, ToolCallID: "xyz", Content: "结果是25度"}` 时，应该翻译成什么 OpenAI SDK 类型？写出具体的构造调用。
>
> **题目 3：** 在 Claude Adapter 中，一条 `schema.Message{Role: RoleAssistant, ToolCalls: [...]}` 应该翻译成什么 Anthropic SDK 结构？`Input` 字段的类型是什么，如何从 `tc.Arguments ([]byte)` 得到它？

> [!example]- 💡 答案指南 (Answer Guide)
>
> **题目 1 - 引导答案思路：**
> - Phase 1（慢思考）：Main Loop 传入 `nil` 或空 `[]schema.ToolDefinition{}`
> - Provider 内部：检查 `len(openaiTools) > 0`（OpenAI）或 `len(anthropicTools) > 0`（Claude），**不设置 `params.Tools` 字段**，从而让模型在无工具环境下进行纯文本推理
> - Phase 2（行动）：传入完整的工具列表，Provider 填充 `params.Tools`，模型可输出 ToolCall
>
> ---
>
> **题目 2 - 引导答案思路：**
> ```go
> // ToolCallID 非空 → 翻译为 ToolMessage
> // V3 参数顺序：ToolMessage(content, toolCallID)
> openai.ToolMessage("结果是25度", "xyz")
> ```
> 注意区分 V3 和旧版参数顺序，这是最常见的踩坑点。
>
> ---
>
> **题目 3 - 引导答案思路：**
> - 翻译为 `anthropic.NewAssistantMessage(blocks...)`，其中 `blocks` 包含 `anthropic.ContentBlockParamUnion{OfToolUse: &anthropic.ToolUseBlockParam{...}}`
> - `ToolUseBlockParam.Input` 类型为 `map[string]interface{}`
> - 从 `tc.Arguments ([]byte)` 获取：
>   ```go
>   var inputMap map[string]interface{}
>   _ = json.Unmarshal(tc.Arguments, &inputMap)
>   ```
