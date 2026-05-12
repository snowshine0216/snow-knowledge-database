---
tags: [agent-harness, go, feishu, chatops, reporter-pattern, io-decoupling, goroutine, harness-engineering]
source: https://time.geekbang.org/column/article/975185
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 为什么一个在云端运行的 Agent 引擎不能继续用 `fmt.Printf` 输出结果？这个问题的本质是什么？
2. 什么是 ChatOps？将 Agent 接入即时通讯工具（如飞书/Slack）能解决哪些纯终端模式解决不了的问题？
3. 如果飞书群里同时有 10 人给同一个机器人发指令，后台并发启动 10 个 ReAct 循环并操作同一个工作目录，会引发什么工程问题？

---

## Chapter Metadata
- Course: AI Agent Harness Training（从0开始构建 Agent Harness）
- Chapter: 09 — 飞书集成：打通真实世界，将 go-tiny-claw 接入飞书机器人的事件流
- Author: Tony Bai
- Article ID: 975185

## Cornell Notes

### Cue Column (Questions)
- 为什么终端输出（`fmt.Printf`）在云端部署场景下失效？
- Reporter 接口定义了哪 4 个生命周期回调，各在何时触发？
- FeishuBot 如何监听飞书事件流并将每条消息路由给 Agent 引擎？
- 并发消息处理的机制是什么？为什么用 Goroutine？
- 本讲结尾留下了哪两个未解决的"致命问题"？

### Notes Column

#### 问题根源：为什么要 I/O 解耦

前 8 讲的引擎使用 `fmt.Printf` / `log.Println` 直接打印输出。这在终端下可行，但部署到云端服务器后：飞书用户在群里 @机器人，引擎在云端默默打印日志——用户根本看不到任何反馈。

更深层的设计问题是：引擎不应该关心自己"在哪里运行"。类比 Linux 哲学：内核只负责调度和运算，显示内容交给终端设备。引擎的核心循环（Main Loop）只需在特定生命周期节点"广播事件"，由外部注入的 Reporter 决定如何展示。

#### Reporter 接口：引擎解耦的核心抽象

新建 `internal/engine/reporter.go`，定义 4 个回调：

```go
type Reporter interface {
    OnThinking(ctx context.Context)              // Phase 1 慢思考开始时
    OnToolCall(ctx context.Context, toolName string, args string)         // 模型决定调用工具时
    OnToolResult(ctx context.Context, toolName string, result string, isError bool) // 工具执行完毕时
    OnMessage(ctx context.Context, content string)     // 模型输出最终回复时
}
```

`Run()` 方法签名增加 `reporter Reporter` 参数。引擎在各阶段调用 `reporter.OnXxx()`，不再写死任何输出逻辑。

- 终端运行 → 注入 `TerminalReporter`
- 接入飞书 → 注入 `FeishuReporter`
- 接入钉钉/Slack/微信 → 再实现一个对应的 Reporter

#### 飞书集成：FeishuBot + FeishuReporter

新建 `internal/feishu/bot.go`，完成两件事：

**1. 监听飞书 Webhook 事件**

使用 `oapi-sdk-go/v3` 的 `dispatcher.EventDispatcher`，注册 `OnP2MessageReceiveV1` 回调。收到消息后：
- 解析消息文本（去掉 JSON 包装的 `{"text":"..."}` 外壳）
- 取出 `chatId`
- **立即开一个 Goroutine**：`go b.handleAgentRun(chatId, contentStr)`

关键点：HTTP 回调必须立即返回 200，不能阻塞。Agent 任务放进 Goroutine 异步执行，飞书平台才不会超时重试。

**2. FeishuReporter：将引擎状态发回飞书**

`handleAgentRun` 为每条消息实例化一个专属的 `FeishuReporter`，它持有 `*lark.Client` 和 `chatId`：

```go
func (r *FeishuReporter) OnThinking(ctx context.Context) {
    r.sendMsg("🤔 模型正在慢思考 (Thinking)...")
}
func (r *FeishuReporter) OnToolCall(ctx context.Context, toolName string, args string) {
    r.sendMsg(fmt.Sprintf("🛠️ 正在执行工具：`%s`\n参数：`%s`", toolName, args))
}
func (r *FeishuReporter) OnToolResult(ctx context.Context, toolName string, result string, isError bool) {
    if isError { r.sendMsg("⚠️ 执行报错...") } else { r.sendMsg("✅ 执行成功") }
}
func (r *FeishuReporter) OnMessage(ctx context.Context, content string) {
    r.sendMsg(content)  // 最终回复发给用户
}
```

工具结果超过 200 字符时截断再发飞书（但传给大模型的 `observationMsgs` 仍是完整数据），防止飞书消息被截断。

#### 并发高吞吐：Go 的天然优势

每条飞书消息触发 `go b.handleAgentRun()`，等于独立的 ReAct 循环。飞书群里同时发 3 条指令 → 3 个独立循环并行运行，各自思考、各自回传对应聊天窗口。`main.go` 从 CLI 程序重构为 `net/http` Web Server，监听 `:48080/webhook/event`。

#### 两个遗留的"致命问题"

1. **Context 失忆**：每条消息调用 `b.engine.Run(context.Background(), prompt, reporter)` 启动全新 Run，上轮对话上下文丢失。用户说"在刚才那个文件末尾加一行字"——Agent 完全不知道"刚才那个文件"是什么。
2. **Context Window 爆炸**：若用户让 Agent 读取 50MB 系统日志，大模型 Context 瞬间溢出，Web Server 中的 Panic 是不可接受的。

这两个问题将在下一模块"上下文工程体系（Context Engineering）"中解决。

### Summary

本讲通过引入 `Reporter` 接口将 go-tiny-claw 的 Main Loop 与输出媒介彻底解耦，实现了从终端孤岛到飞书 ChatOps 机器人的跨越。核心思路是：引擎只广播生命周期事件，由外部注入的 Reporter 决定如何呈现；每条飞书消息独立启动 Goroutine 处理，天然支持高并发。然而无状态的 HTTP 处理和无限制的 Context 增长是下一阶段必须解决的两大挑战。

## Key Takeaways

- **Reporter 接口是 I/O 解耦的核心**：引擎定义 4 个生命周期回调（OnThinking / OnToolCall / OnToolResult / OnMessage），不关心输出目标。终端、飞书、钉钉各自实现对应 Reporter，切换输出层无需改动 Main Loop 任何代码。
- **飞书事件流接入只需 3 步**：① 用 `oapi-sdk-go/v3` 的 `EventDispatcher` 注册 `OnP2MessageReceiveV1` 回调；② 在回调中立即 `go handleAgentRun()`（绝不阻塞 HTTP 线程）；③ 在 `handleAgentRun` 里实例化专属 `FeishuReporter` 并调用 `engine.Run()`。
- **Goroutine 即天然并发**：每条飞书消息 `go b.handleAgentRun(...)` 一行，go-tiny-claw 就成了支持海量并发的 ChatOps 后端——飞书群里同时来 10 条指令，10 个 ReAct 循环并行，各自回传给对应聊天窗口。
- **工具结果在 Reporter 层截断，传给模型的数据保持完整**：`FeishuReporter.OnToolResult` 对超 200 字符的结果截断显示，避免飞书消息因过长被平台截断；但 `observationMsgs` 仍携带完整 output 送入大模型 Context。
- **无状态 HTTP 是 Context 失忆的根源**：每次 `engine.Run()` 都是全新会话，Agent 无法引用上轮对话内容——这是 ChatOps 场景的核心缺陷，需要 Session ID + 短期工作记忆机制解决。
- **同目录并发写文件会引发物理数据竞争**：多个 Goroutine 同时在同一 `WorkDir` 执行 `write_file` / `bash` 会产生文件锁冲突，需在 Dispatcher 层或 Engine 初始化层引入工作区 Mutex 或任务调度队列。

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[Reporter 接口]]：go-tiny-claw 引擎的生命周期事件广播规范，解耦 [[Main Loop]] 与具体输出载体
- [[FeishuReporter]]：实现 [[Reporter 接口]]，通过飞书 OpenAPI 将引擎状态消息实时推送给用户
- [[TerminalReporter]]：终端版 Reporter，保留给后续 CLI 入口（本讲预留，未实现具体逻辑）
- [[FeishuBot]]：封装飞书 SDK 的 Bot 服务，持有 [[AgentEngine]] 引用并注册事件调度器
- [[oapi-sdk-go]]：飞书官方 Go SDK（v3），提供 EventDispatcher 与 Im.Message.Create API
- [[ChatOps]]：通过群聊指令直接触发系统行为的运维范式，本讲令 go-tiny-claw 具备此能力
- [[handleAgentRun]]：每条飞书消息独立启动 Goroutine 的入口函数，桥接飞书与引擎
- [[工作区读写锁]]：防止并发 Agent 任务同时写入同一 WorkDir 的 Mutex / Queue 机制（思考题留白）
- [[Context 失忆问题]]：无状态 HTTP 导致每次 Run() 丢失上轮对话上下文的架构缺陷

### 2. 课程内导航链接
- [[01-architecture-evolution-from-framework-to-harness|第 01 讲 框架到 Harness 的架构演进]]：奠定 Harness 与 Framework 的概念边界，本讲的 I/O 解耦是 Harness 灵活性的体现
- [[02-main-loop-react-cycle|第 02 讲 Main Loop 与 ReAct 循环]]：本讲解耦的核心循环 `loop.go` 出自此讲，Reporter 注入改造正是修改这里
- [[03-thinking-stage-slow-reasoning|第 03 讲 慢思考阶段与推理]]：`OnThinking` 回调对应此讲的 Phase 1 慢思考触发点
- [[04-provider-interface-claude-openai-adapter|第 04 讲 Provider 接口与适配器]]：同类 I/O 解耦模式的先例，Reporter 接口与 Provider 接口是平行设计
- [[05-tool-registry-and-dispatch|第 05 讲 Tool Registry 与分派]]：`OnToolCall` / `OnToolResult` 汇报的工具调用来自此讲的 Registry
- [[06-minimal-toolset-yolo-philosophy|第 06 讲 极简工具集 YOLO 哲学]]：本讲飞书实战中使用的 `read_file` / `bash` / `write_file` 工具正是此讲定义的原语
- [[07-fault-tolerance-art-fuzzy-matching-edit-tool|第 07 讲 容错与 fuzzy 匹配 Edit 工具]]：工具执行可靠性基础，Reporter 的 `isError` 字段处理此讲涉及的错误场景
- [[08-concurrent-efficiency-parallel-tool-calling|第 08 讲 并发效率与并行工具调用]]：本讲复用此讲的 Goroutine 并发模式，从工具并行扩展为消息处理并行

### 3. 课程外与通用概念关联
- [[harness-engineering]]：驾驭工程，本专栏核心主题；Reporter 机制体现了 Harness 对引擎的"可插拔 I/O 层"设计
- [[inversion-of-control]]：Reporter 注入是典型的控制反转（IoC）——引擎不主动选择输出目标，由调用方注入依赖
- [[chatops]]：本讲令 go-tiny-claw 具备 ChatOps 能力；Slack / 钉钉等同类场景可用同样模式接入

### 4. 推荐关系边
- [[Reporter 接口]] → decouples → [[Main Loop]]
- [[FeishuReporter]] → implements → [[Reporter 接口]]
- [[TerminalReporter]] → implements → [[Reporter 接口]]
- [[FeishuBot]] → holds → [[AgentEngine]]
- [[handleAgentRun]] → enables → [[ChatOps]]
- [[oapi-sdk-go]] → provides → [[EventDispatcher]]
- [[Reporter 接口]] → inspired-by → [[Linux 内核与终端设备分离]]
- [[Context 失忆问题]] → constrains → [[ChatOps]]
- [[工作区读写锁]] → prevents → [[物理数据竞争]]

### 5. 后续值得沉淀成卡片的主题
- [[Reporter 接口]]
- [[ChatOps]]
- [[工作区读写锁]]
- [[Context 失忆问题]]
- [[飞书 EventDispatcher]]

## Notes For Review
- 思考题：如何在 Dispatcher 层或 Engine 初始化层引入工作区 Mutex / 任务队列，确保同一 WorkDir 同一时刻只有一个 Agent 任务执行文件修改？（下一模块的 Session 隔离可能提供答案）
- `FeishuReporter.OnToolResult` 截断 200 字符是经验值还是飞书 API 限制？需确认飞书消息长度上限
- 下一讲进入"上下文工程体系"：AGENTS.md 系统指令、Context 压缩、Session ID + 短期工作记忆

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. go-tiny-claw 通过什么设计让同一个引擎既能在终端运行、又能接入飞书，而无需修改 Main Loop？请说明 Reporter 接口的 4 个方法及各自的触发时机。
2. 飞书 Bot 收到消息后，`handleAgentRun` 是如何实现并发的？为什么不能在 HTTP 回调里直接同步调用 `engine.Run()`？
3. 本讲结尾提到了两个"致命问题"。请分别描述它们，并说明它们各自在什么场景下会触发、后果是什么。

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 引擎通过引入 `Reporter` 接口实现 I/O 解耦。`Run()` 方法接受一个 `Reporter` 参数，在 4 个生命周期节点调用对应回调：`OnThinking`（Phase 1 慢思考开始时）、`OnToolCall`（模型决定调用工具时，传入工具名和参数）、`OnToolResult`（工具执行完毕时，传入结果和是否报错）、`OnMessage`（模型输出最终回复时）。终端场景注入 `TerminalReporter`，飞书场景注入 `FeishuReporter`，Main Loop 代码完全不变。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 收到飞书消息后，回调中执行 `go b.handleAgentRun(chatId, contentStr)`——用一个 Goroutine 异步运行 Agent 任务。必须这样做，因为飞书平台要求 Webhook 回调在极短时间内返回 200，否则会超时重试；而一次 ReAct 循环可能需要数秒到数十秒。每条消息独立 Goroutine 还意味着系统天然支持并发：10 条消息 → 10 个 Goroutine → 10 个独立 ReAct 循环并行，各自回传对应的 chatId。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 第一个问题是"Context 失忆"：每条飞书消息触发 `engine.Run(context.Background(), prompt, reporter)`，启动全新会话，上轮对话的 Context History 完全丢失。用户说"在刚才那个文件末尾加一行字"时，Agent 没有任何上下文可以知道"刚才那个文件"是什么。第二个问题是"Context Window 爆炸"：若让 Agent 读取 50MB 日志文件，大模型的 Context 瞬间溢出。在无状态的 Web Server 中，这种 Panic 不可接受（会导致整个服务崩溃），而非简单地结束一个终端会话。
