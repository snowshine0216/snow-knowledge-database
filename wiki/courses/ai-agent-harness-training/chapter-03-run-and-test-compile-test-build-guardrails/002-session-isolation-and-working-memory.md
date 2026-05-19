---
tags: [session-management, working-memory, context-engineering, agent-harness, go, concurrency, session-isolation, harness-engineering, context-truncation, context-window]
source: https://time.geekbang.org/column/article/977388
---

# 会话管理：Session 物理隔离与 Working Memory 的底层实现

go-tiny-claw 第 11 讲构建了两个互补的上下文工程基础设施：**Session 物理隔离**（用 `SessionManager` 为每个用户/频道分配独立上下文内存空间）和 **Working Memory 截取**（用 `GetWorkingMemory(limit)` 限制每次 LLM 推理的上下文规模）。`AgentEngine.Run()` 经重构后成为无状态执行器，通过传入 `Session` 实例驱动 ReAct 循环，实现真正的记忆连续体架构。

## Key Concepts

- **Session 物理隔离**：多端并发场景（飞书群 A 重构代码 + 飞书群 B 查日志）若共用全局 `contextHistory`，大模型会"精神分裂"。`GlobalSessionMgr` 通过带 `sync.RWMutex` 的 Map，按来源（终端目录哈希、飞书 ChatID、微信 OpenID）为每次对话分配独立的 `Session` 实例，从内存层物理隔离不同用户的上下文。

- **Working Memory**：Session 维护完整历史池，但向 LLM 发起推理时只截取最近 N 轮对话（如 6 条消息）作为 Working Memory，拼接 System Prompt 发送。用户聊了 50 条消息后第 51 条请求，LLM 收到的仍是固定大小的上下文，避免严重超时、天价 Token 账单和 API 400。

- **孤儿 ToolResult 防御**：截断后若首条消息是 `ToolResult`（RoleUser + ToolCallID），但配对的 `ToolCall` 已被截断丢弃，大模型 API 因无法匹配工具调用链而返回 400 Bad Request。`GetWorkingMemory` 在截取后必须逐条检查首部，过滤孤儿 ToolResult 直到遇到正常的 User/Assistant 消息。

- **AgentEngine 无状态重构**：`Run()` 签名从 `(ctx, userPrompt, reporter)` 改为 `(ctx, session *Session, reporter)`。Engine 不再持有 WorkDir 或历史队列；WorkDir 跟随 Session，每轮 ReAct 循环通过 `session.GetWorkingMemory(6)` 动态提取上下文，结果通过 `session.Append()` 持久化回 Session。

- **Token 感知截断（进阶）**：用 BPE 词表实时计算每条消息 Token 数，从最新消息向前累加，逼近模型安全水位线（如 120k Token）才停，精确控制 Token 预算。

- **Episodic Summarization（进阶）**：截断时后台触发廉价小模型，将被丢弃的远古历史浓缩为百字大纲注入 System Prompt 头部，让 LLM 同时拥有最新细节记忆和宏观历史记忆。

## Key Takeaways
- Session 隔离是多端并发的必要前提；任务混杂的根因是共用全局上下文，而非并发本身。
- `GetWorkingMemory` 的孤儿 ToolResult 过滤是"调包"开发接触不到的底层细节，省略会导致 API 400。
- 固定条数截取在单条超长消息时仍会爆掉 Context Window；生产需叠加 Token 感知截断 + Episodic Summarization 双重防线（第 12 讲）。
- Claude Code 和 OpenClaw 均采用全局唯一 WorkDir；per-Session WorkDir 需 `context.Context` 透传给工具，几乎无产品这样做。

## See Also
- [[001-prompt-assembly-dynamic-loading-agents-md-and-skills|第 10 讲：提示词组装]]
- [[harness-engineering]]
- [[context-engineering]]

## Related sources

- **[第 12 讲：突破内存——基于阶梯降级的 Context Compaction 策略]**: 本讲留下的"固定条数截取无法防御单条大文件暴击"问题在第 12 讲得到直接回答。第 12 讲引入 `Compactor` 结构体，在 `provider.Generate()` 之前对远期历史执行 Full Masking、对近期超长 ToolResult 执行 Head-Tail Truncation，将发往 API 的上下文压缩至安全水位线内，同时在 `Session.Append()` 中始终保留全量原始数据。见 [[003-context-compaction-staged-degradation-strategy]]
