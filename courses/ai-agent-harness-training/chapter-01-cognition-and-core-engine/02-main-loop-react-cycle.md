---
tags: [ai-agent, harness-engineering, go, react-loop, main-loop, agent-engine, context-history, tool-dispatch]
source: https://time.geekbang.org/column/article/967512
wiki: wiki/courses/ai-agent-harness-training/chapter-01-cognition-and-core-engine/02-main-loop-react-cycle.md
---

## Pre-test
> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*
1. ReAct 范式中的三个步骤是什么？它们如何构成一个闭环？
2. 在 go-tiny-claw 中，`AgentEngine.Run()` 的退出条件是什么？
3. 为什么 `ToolCall.Arguments` 使用 `json.RawMessage` 而不是具体的结构体类型？

---

## Chapter Metadata
- Course: AI Agent工程化训练营（从0开始构建 Agent Harness）
- Chapter: 002 — 核心心脏：手写 Agent 的 Main Loop
- Author: Tony Bai
- Date: 2026-05-04
- Article ID: 967512

---

## Cornell Notes

### Cue Column (Questions)
- ReAct 范式的学术来源是什么？它与纯 CoT（Chain of Thought）有何本质区别？
- `contextHistory []schema.Message` 在 Main Loop 中扮演什么角色？
- `AgentEngine` 如何实现与 Provider 和 Registry 的解耦？
- ToolCallID 为何必须被携带回 Observation 消息中？
- 顶级引擎（Claude Code、OpenClaw）如何避免"max_turns"的硬限制？
- WorkDir 字段的设计意图是什么？

### Notes Column

#### 1. ReAct 范式的学术根源

ReAct（Reason + Act）范式来自 2022 年 10 月普林斯顿大学博士生 Shunyu Yao 与 Google 研究人员合作的论文，正式发表于 ICLR 2023。它解决了两个早期流派各自的缺陷：

- **纯推理（CoT）**：通过 "Let's think step by step" 触发推理，但模型无法与外部世界交互，依赖训练数据"幻觉"。
- **纯行动（Acting Only）**：直接给工具让模型预测动作，缺乏深度状态跟踪，容易在报错后迷失。

ReAct 的闭环三步骤：
1. **Thought（思考）**：分析当前已获得的 Observation，规划下一步意图。
2. **Action（行动）**：发出工具调用请求（`ToolCall`）给外部环境。
3. **Observation（观察）**：Harness 引擎执行工具，将结果作为 `schema.RoleUser` 消息追加回 `contextHistory`，供下一轮思考使用。

#### 2. go-tiny-claw 目录骨架（本讲涉及的四个模块）

```
internal/
  engine/loop.go       # Main Loop 核心逻辑
  provider/interface.go # LLMProvider 接口
  schema/message.go    # 统一血液：Message / ToolCall / ToolResult / ToolDefinition
  tools/registry.go    # Registry 接口：工具注册与分发
cmd/claw/main.go       # Mock 桩验证入口
```

#### 3. Schema 层 — 统一血液（`internal/schema/message.go`）

四个核心类型：

- **`Role`**（string alias）：`RoleSystem`（"system"）、`RoleUser`（"user"）、`RoleAssistant`（"assistant"）。Observation 被追加为 `RoleUser` 消息，不是新建角色。
- **`Message`**：携带 `Role`、`Content`（纯文本）、`ToolCalls []ToolCall`（模型输出工具请求时填充）、`ToolCallID string`（Observation 消息必须携带，用于关联推理链）。
- **`ToolCall`**：`ID`（唯一 ID）、`Name`（工具名，如 "bash"）、`Arguments json.RawMessage`（延迟解析——Main Loop 不解析参数，由具体工具负责，实现极致解耦）。
- **`ToolResult`**：`ToolCallID`、`Output string`、`IsError bool`（标记失败，为后续"错误自愈"预留接口）。
- **`ToolDefinition`**：`Name`、`Description`、`InputSchema interface{}`（JSON Schema，供模型理解工具用途）。

#### 4. 接口层 — Provider 与 Registry

`LLMProvider` 接口（`internal/provider/interface.go`）：
```go
Generate(ctx context.Context, messages []schema.Message, availableTools []schema.ToolDefinition) (*schema.Message, error)
```
接收完整上下文历史和可用工具，返回模型的一次推理结果。

`Registry` 接口（`internal/tools/registry.go`）：
```go
GetAvailableTools() []schema.ToolDefinition
Execute(ctx context.Context, call schema.ToolCall) schema.ToolResult
```
Engine 通过接口持有 Provider 和 Registry，不依赖任何具体实现——方便 Mock 测试和后续替换真实 LLM。

#### 5. Main Loop 实现细节（`internal/engine/loop.go`）

`AgentEngine` 结构体：
```go
type AgentEngine struct {
    provider provider.LLMProvider
    registry tools.Registry
    WorkDir  string  // 物理边界，借鉴 OpenClaw 的 WorkDir 设计
}
```

`Run()` 函数的完整流程（每次循环 = 一个 Turn）：

1. **初始化 `contextHistory`**：两条初始消息——`RoleSystem`（系统提示词）+ `RoleUser`（用户任务指令）。
2. **`for {}` 无限循环**：
   - `e.registry.GetAvailableTools()` 获取当前挂载工具列表。
   - `e.provider.Generate(ctx, contextHistory, availableTools)` 发起 LLM 推理。
   - 将 `responseMsg` append 到 `contextHistory`（先追加模型输出，再处理工具调用）。
   - **退出条件**：`len(responseMsg.ToolCalls) == 0` → `break`（模型输出纯文本，视为任务完成）。
   - **工具调用循环**：串行遍历 `responseMsg.ToolCalls`，调用 `e.registry.Execute(ctx, toolCall)` 获取 `ToolResult`。
   - 每个 `ToolResult` 被封装为 `schema.Message{Role: RoleUser, Content: result.Output, ToolCallID: toolCall.ID}` 追加到 `contextHistory`。
3. **ToolCallID 必须携带**：这是维系大模型推理链条的关键——让模型知道哪个 Observation 对应哪个 ToolCall，确保上下文的逻辑一致性。

#### 6. 顶级引擎的三个鲜明设计特征

1. **极度纯粹，无预设分支**：循环体内无任何业务逻辑，全凭模型决定走向。
2. **不设硬性 max_turns 限制**：工业任务可能需要 50+ 步。顶级引擎依赖 **Context Compaction（内存压缩）** 和 **System Reminders（系统级防死循环干预）** 维持稳定（后续章节讲解），而非在此处生硬截断。
3. **contextHistory 是唯一记忆载体**：数据滚雪球式累积，记录每一轮的 Thought / Action / Observation。

#### 7. WorkDir 物理边界的设计意图

`AgentEngine.WorkDir` 显式限定 Agent 的工作范围，借鉴 OpenClaw 理念：Agent 不是全局幽灵，必须像普通开发者一样受限于具体项目工作区。这是安全性与可预测性的基础设计。

#### 8. Mock 桩验证（`cmd/claw/main.go`）

- `mockProvider`：第 1 轮返回含 `ToolCalls` 的 `RoleAssistant` 消息（调用 bash `ls -la`），第 2 轮返回纯文本（无 ToolCalls），触发退出。
- `mockRegistry`：`Execute` 直接返回伪造的终端输出字符串（51 字节）。
- 验证 Main Loop 在 2 个 Turn 内正确驱动了 Reason → Act → Observe → Reason → Break 的完整循环。

#### 9. 思考题（第 08 讲预告）

当前工具调用是串行的（`for _, toolCall := range responseMsg.ToolCalls`）。若模型并行请求 3 个独立文件，需等第 1 个返回才能处理第 2 个。思考题：如何用 Go 的 **Goroutine + WaitGroup** 改造为并行执行，并按正确顺序将结果组装回 `contextHistory`？答案将在第 08 讲揭晓。

### Summary

Chapter 02 从 ReAct 论文出发，将"思考—行动—观察"三步骤直接映射为 `for {}` 循环中的 Provider 推理、Registry 执行和 contextHistory 追加。核心架构通过四个模块（schema / provider / tools / engine）定义统一数据结构和接口，使 `AgentEngine.Run()` 完全不耦合任何具体的 LLM SDK 或工具实现。WorkDir 字段确立了 Agent 的物理安全边界，而故意省略 max_turns 限制则体现了工业级 Harness 的长任务设计哲学。

---

## Key Takeaways
- `schema.Message` 使用 `ToolCallID` 字段将 Observation 与 ToolCall 关联，是维系 LLM 推理链的关键——缺少此字段会使模型上下文逻辑断裂。
- `ToolCall.Arguments` 使用 `json.RawMessage` 实现延迟解析：`loop.go` 不解析参数内容，直接转发给 `registry.Execute`，工具自己负责解析，实现引擎与工具的极致解耦。
- Main Loop 退出条件是 `len(responseMsg.ToolCalls) == 0`，而非超时或步骤数——纯文本响应即表示任务完成，任务长度完全由模型决定。
- Observation 消息以 `schema.RoleUser` 写入 `contextHistory`，不创建新角色——这保持了三角色（system / user / assistant）对话格式的简洁性。
- 工业级引擎（Claude Code、OpenClaw）不设 max_turns 硬限制，依赖 Context Compaction 和 System Reminders 防止死循环，这是与玩具框架（max_turns=10）的核心差异之一。
- `AgentEngine.WorkDir` 是显式的物理边界字段，借鉴 OpenClaw 设计，确保 Agent 行为受限于指定项目目录，是安全性的基础。
- 当前版本串行执行多工具调用；第 08 讲将用 Goroutine + WaitGroup 改造为并行，并解决结果有序组装回 contextHistory 的问题。

---

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[ReAct Loop]]：本讲总纲，Reason → Act → Observe 三步闭环，直接映射到 [[AgentEngine]] 的 `for {}` 循环
- [[AgentEngine]]：Harness 的核心引擎结构体，持有 [[LLMProvider]] 与 [[Registry]] 两个接口，通过 [[Main Loop]] 驱动任务执行
- [[Main Loop]]：`AgentEngine.Run()` 中的无限 `for {}` 循环，与 [[ReAct Loop]]、[[Agentic Loop]] 属同一类控制结构
- [[contextHistory]]：Agent 的唯一记忆载体，滚雪球式累积每轮的 Thought / Action / Observation，由 `[]schema.Message` 实现
- [[LLMProvider]]：抽象接口，接收 contextHistory 和工具列表，返回模型推理结果，使引擎不耦合任何具体 LLM SDK
- [[Registry]]：工具注册与分发接口，`Execute()` 接收 [[schema.ToolCall]]，返回 [[schema.ToolResult]]
- [[schema.Message]]：统一血液数据结构，携带 Role、Content、ToolCalls 和 [[ToolCallID]]，贯穿整个 [[contextHistory]]
- [[ToolCallID]]：将 Observation 消息与对应 ToolCall 绑定的唯一标识，维系 LLM 推理链的逻辑一致性
- [[json.RawMessage]]：延迟解析策略，[[AgentEngine]] 不解析工具参数，直接转发给工具自己处理，体现极致解耦
- [[WorkDir]]：Agent 的物理边界字段，借鉴 OpenClaw 设计，将 Agent 行为限定在指定项目目录内
- [[context-compaction|Context Compaction]]：替代 max_turns 硬限制的工业级机制，与 [[System Reminders]] 共同防止死循环

### 2. 课程内导航链接
- [[01-architecture-evolution-from-framework-to-harness|第 01 讲 架构演进]]：提出四层架构蓝图和 [[Main Loop]] 的概念基础，是本讲实现的理论前提
- [[03-thinking-stage-slow-reasoning|第 03 讲 Thinking Stage]]：深入 Slow Reasoning 阶段，[[LLMProvider]] 调用的延伸
- [[04-provider-interface-claude-openai-adapter|第 04 讲 Provider 接口与适配器]]：实现 [[LLMProvider]] 接口的 Claude / OpenAI 真实适配层
- [[05-tool-registry-and-dispatch|第 05 讲 工具注册与分发]]：实现 [[Registry]] 接口，工具挂载和 `Execute()` 调度的具体机制
- [[06-minimal-toolset-yolo-philosophy|第 06 讲 最小工具集与 YOLO 哲学]]：决定挂载哪些工具、如何保持工具集精简

### 3. 课程外与通用概念关联
- [[harness-engineering|Harness Engineering]]：本讲 [[AgentEngine]] 是 Harness 理念的第一个具体实现，印证了"边界由 Harness 守，路径交给模型"的核心原则
- ReAct Paradigm：Shunyu Yao 等人 ICLR 2023 论文提出的 Reason + Act 范式，是本讲 [[ReAct Loop]] 的学术来源
- Inversion of Control：[[AgentEngine]] 将任务路径决策权交给 [[LLMProvider]]，自身只维护边界和退出条件，是 IoC 在 Agent 领域的具体体现
- [[context-compaction|Context Compaction]]：`contextHistory` 无限追加最终会触及上下文窗口上限，压缩与治理是工业级应对机制
- Interface-Driven Design：[[LLMProvider]] 和 [[Registry]] 均为接口，使 Mock 测试与真实实现可无缝替换

### 4. 推荐关系边（可直接扩成独立卡片）
- [[AgentEngine]] → implements → [[ReAct Loop]]
- [[AgentEngine]] → holds → [[LLMProvider]]
- [[AgentEngine]] → holds → [[Registry]]
- [[AgentEngine]] → maintains → [[contextHistory]]
- [[AgentEngine]] → governed-by → [[WorkDir]]
- [[LLMProvider]] → consumes → [[contextHistory]]
- [[LLMProvider]] → produces → [[schema.Message]]
- [[Registry]] → executes → [[schema.ToolCall]]
- [[Registry]] → produces → [[schema.ToolResult]]
- [[schema.Message]] → composed-of → [[ToolCallID]]
- [[schema.Message]] → composed-of → [[schema.ToolCall]]
- [[schema.ToolCall]] → carries → [[json.RawMessage]]
- [[context-compaction|Context Compaction]] → replaces → max_turns hardcap
- [[System Reminders]] → protects → [[Main Loop]] from infinite loops
- [[ReAct Loop]] → maps-to → `for {}` loop in [[AgentEngine]]

### 5. 后续值得沉淀成卡片的主题
- [[context-compaction|Context Compaction]]：内存压缩的具体触发条件与实现机制（后续章节展开）
- [[System Reminders]]：系统级防死循环干预的注入时机与内容格式
- [[Parallel Tool Execution]]：用 Goroutine + WaitGroup 改造串行工具调用为并行，并有序组装结果（第 08 讲）
- [[Dynamic Prompt Assembly]]：用 AGENTS.md 动态替换 `Run()` 中硬编码系统提示词的机制
- [[Error Self-Healing]]：`ToolResult.IsError` 字段预留的错误自愈能力，具体实现章节待确认

---

## Notes For Review
- Context Compaction 和 System Reminders 的具体实现将在后续章节讲解——需标记为待追踪知识点。
- 并行工具执行（Goroutine + WaitGroup）在第 08 讲揭晓，届时补充笔记。
- 真实场景中的动态 Prompt 组装器（加载 AGENTS.md）将替换 `Run()` 中当前的硬编码系统提示词——后续章节需关注。
- `ToolResult.IsError` 标记预留给"错误自愈"机制，具体实现章节待确认。

---

## Post-test
> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*
1. `AgentEngine.Run()` 的 `for {}` 循环什么情况下才会 break？完整说出判断条件和代码逻辑。
2. Observation 消息为什么必须携带 `ToolCallID`？如果缺少这个字段会发生什么？
3. 为什么 `ToolCall.Arguments` 使用 `json.RawMessage` 而不是 `map[string]interface{}`？这个选择体现了什么设计原则？

> [!example]- 💡 答案指南 (Answer Guide)
>
> #### Q1 — Main Loop 何时退出
>
> 当 `e.provider.Generate()` 返回的 `responseMsg` 满足 `len(responseMsg.ToolCalls) == 0` 时，循环就会 break。完整逻辑是：每个 turn 先调用 `provider.Generate` 得到 `responseMsg`，把它 append 到 `contextHistory`，再检查是否仍有工具请求；若没有，就把这次纯文本响应视为任务完成信号。
>
> #### Q2 — 为什么 Observation 必须带 `ToolCallID`
>
> `ToolCallID` 是把 Observation 与对应 ToolCall 绑定起来的唯一标识。模型只有知道“这条工具输出到底是回应哪一次调用”，才能维系完整推理链；如果缺少这个字段，Action 和 Observation 会错位，模型容易产生混乱甚至幻觉。
>
> #### Q3 — 为什么使用 `json.RawMessage`
>
> `json.RawMessage` 本质上是原始 JSON 字节，不会在 Main Loop 中被提前解析。这样 `loop.go` 只负责转发参数，而把具体结构解释留给各工具自己完成，体现的正是职责单一和解耦原则：引擎不应知道任何具体工具的内部参数格式。
