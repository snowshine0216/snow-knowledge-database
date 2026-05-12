---
tags: [agent-harness, go, feishu, chatops, reporter-pattern, io-decoupling, goroutine, harness-engineering]
source: https://time.geekbang.org/column/article/975185
---
# Feishu Integration: I/O Decoupling and ChatOps with go-tiny-claw

第 9 讲将 go-tiny-claw 从终端孤岛进化为飞书 ChatOps 机器人，核心突破是通过 `Reporter` 接口将 Main Loop 与任何具体输出媒介彻底解耦。运维老哥在飞书群里 @机器人说"帮我查一下这台机器的 nginx 报错日志"，Agent 就会在云端独立 Goroutine 里跑完整的 ReAct 循环，实时把"正在慢思考"、"执行工具成功"、"最终回答"逐条推送给飞书聊天窗口。

## Key Concepts

- **Reporter 接口 — I/O 解耦的核心抽象**：`Run()` 方法新增 `reporter Reporter` 参数。接口定义 4 个生命周期回调：`OnThinking`（Phase 1 慢思考开始时）、`OnToolCall`（模型决定调用工具时，传入工具名和 JSON 参数）、`OnToolResult`（工具底层执行完毕，传入 result 和 isError）、`OnMessage`（模型输出最终纯文本回复时）。Main Loop 代码零修改，切换终端 / 飞书 / 钉钉只需在调用方注入不同 Reporter。
  - 类比：Linux 内核只调度计算，显示交给终端设备；引擎只广播事件，输出交给注入的 Reporter。

- **FeishuBot + FeishuReporter — 飞书集成层**：
  - `FeishuBot` 用 `oapi-sdk-go/v3` 的 `EventDispatcher` 注册 `OnP2MessageReceiveV1` 回调，收到消息后立即 `go b.handleAgentRun(chatId, text)`，不阻塞 HTTP 线程（飞书平台要求回调极速返回 200，否则会超时重试）。
  - `FeishuReporter` 为每条消息实例化一个，持有 `*lark.Client` 和 `chatId`，通过 `Im.Message.Create` API 把引擎状态推送给指定飞书聊天窗口。工具结果超过 200 字符时截断显示，但传给大模型的 `observationMsgs` 仍保持完整（避免飞书截断 vs. 保证模型 Context 质量）。

- **Goroutine 即天然并发**：每条飞书消息 `go handleAgentRun()` 独立 Goroutine，飞书群里同时 10 条指令 → 10 个并行 ReAct 循环，各自回传给对应 chatId。`main.go` 从 CLI 程序改为 `net/http` Web Server，监听 `:48080/webhook/event`。

- **物理数据竞争（Data Race in Physical World）**：多 Goroutine 并发操作同一 `WorkDir` 时，`write_file` / `bash` 可能产生文件锁冲突。本讲提出问题但未解决：需在 Dispatcher 层或 Engine 初始化层引入工作区 Mutex 或任务调度队列，确保同一目录同一时刻只有一个 Agent 任务执行文件修改。

- **两个遗留的致命问题**：
  1. **Context 失忆**：每条消息触发全新 `engine.Run()`，上轮对话 Context History 全部丢失，Agent 无法跨消息引用上文（如"在刚才那个文件末尾加一行"会完全失败）。
  2. **Context Window 爆炸**：让 Agent 读取 50MB 日志文件，Context 瞬间溢出；Web Server 中的 Panic 不可接受，会导致整个服务崩溃而非仅结束终端会话。两者均将在下一模块"上下文工程体系（Context Engineering）"中解决。

## Key Takeaways

- Reporter 接口是 Harness I/O 解耦的通用模式：引擎只广播生命周期事件，由调用方注入具体的输出实现——终端、飞书、Slack 可无缝切换
- 飞书事件流接入 3 步：注册 EventDispatcher 回调 → 立即开 Goroutine 异步运行 Agent → 注入 FeishuReporter 实时推送状态
- Go Goroutine 让 ChatOps 后端天然高并发，但并发写同一物理工作目录会引发数据竞争，需要 Mutex / 任务队列保护
- 无状态 HTTP 处理带来 Context 失忆问题，是 ChatOps Agent 的核心架构缺陷，解法是 Session ID + 短期工作记忆

## See Also

- [[harness-engineering]]
- [[reporter-pattern]]
- [[02-main-loop-react-cycle|Main Loop 与 ReAct 循环]]
- [[08-concurrent-efficiency-parallel-tool-calling|并发工具调用]]
