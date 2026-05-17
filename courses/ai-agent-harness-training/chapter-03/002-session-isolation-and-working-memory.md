---
tags: [session-management, working-memory, context-engineering, agent-harness, go, concurrency, session-isolation, harness-engineering, context-truncation, context-window]
source: https://time.geekbang.org/column/article/977388
wiki: wiki/courses/ai-agent-harness-training/chapter-03/002-session-isolation-and-working-memory.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 如果飞书群 A 和群 B 同时向 Agent 发消息，共用同一个 `contextHistory` 切片会出现什么问题？
2. Working Memory（短期工作记忆）解决的是哪类问题？它与 Session 历史池的关系是什么？
3. 如果 `GetWorkingMemory` 截取后，第一条消息恰好是一个 `ToolResult`（孤儿响应），会造成什么后果？

## Chapter Metadata
- Course: AI Agent 实战训练营
- Chapter: 011 — 会话管理：Session 物理隔离与 Working Memory 的底层实现
- Author: Tony Bai
- Date: 2026-05-14
- Article ID: 977388

## Cornell Notes

### Cue Column (Questions)
- 多端并发场景下不隔离 Session 会有什么灾难性后果？
- Session 的本质是什么？`SessionManager` 如何实现并发安全？
- `GetWorkingMemory(limit)` 的"截断边界处理"为什么必须过滤孤儿 `ToolResult`？
- 工业级 Working Memory 截取的两种进阶策略是什么？
- 引擎 `Run()` 方法重构后，`AgentEngine` 如何从"有状态消耗品"变为"无状态打工执行器"？
- 为什么 Claude Code 和 OpenClaw 都选择全局唯一 WorkDir 而非 per-Session WorkDir？

### Notes Column

#### 1. 多端并发的上下文污染问题

在前 10 讲中，Agent 以"单次运行（One-shot Execution）"模式工作——每次 `go run` 都从零开始。但工业级场景极其复杂：

- **Console 场景**：Harness 以当前目录（WorkDir）为单位建立默认 Main Session。
- **飞书 / 微信 / Slack 场景**：后台服务可能同时接收"飞书研发群 A"让 Agent 重构 `main.go`、"飞书运维群 B"让 Agent 查服务器日志的并发指令。

若只有一个全局 `contextHistory` 切片，两个任务的消息会混杂发给大模型，导致**大模型精神分裂**——同一个上下文里同时存在"重构前端代码"和"查看服务器日志"两条主线。

#### 2. Session 物理隔离：内存空间隔离

Session 的本质是**一块被隔离的上下文内存空间**。实现要点：

```go
type Session struct {
    ID        string
    WorkDir   string         // 绑定物理工作区
    history   []schema.Message
    mu        sync.RWMutex  // 读写锁保证并发安全
}
```

- `GlobalSessionMgr` 是全局单例，通过带 `sync.RWMutex` 锁的 Map 实现：`map[sessionID]*Session`。
- 请求来源（终端目录哈希、飞书 ChatID、微信 OpenID）映射为 SessionID，`GetOrCreate(id, workDir)` 分配或唤醒对应实例。
- 注：Claude Code 中 Session 历史以 `.json/.jsonl` 格式持久化到工作区隐藏目录支持重启恢复；本讲保持极简，仅内存实现。

#### 3. Working Memory：短期工作记忆截取

**核心问题**：用户 A 在群里聊了整整一个下午（50 条消息），第 51 条消息时若全量发送历史给大模型，会触发严重超时、天价 Token 账单、甚至 API 400 Bad Request。

**解法**：维护长期历史池（Session），推理时只截取最近 N 轮对话作为 Working Memory，拼接 System Prompt 发给大模型。

```go
func (s *Session) GetWorkingMemory(limit int) []schema.Message {
    // 截取最近 limit 条
    res := s.history[total-limit:]
    // 过滤孤儿 ToolResult
    for len(res) > 0 {
        if res[0].Role == schema.RoleUser && res[0].ToolCallID != "" {
            res = res[1:]
        } else {
            break
        }
    }
    return res
}
```

**关键防线——孤儿 ToolResult 过滤**：大模型 API 要求消息连续性。若截断后首条是 `ToolResult`（RoleUser + ToolCallID），但发出该请求的 `ToolCall` 已被截断丢弃，API 会直接返回 **400 Bad Request**。必须顺延到下一条正常的 User/Assistant 消息。

#### 4. 工业级 Working Memory 进阶策略（本讲未实现，下一讲延伸）

| 策略 | 机制 | 优势 |
|---|---|---|
| **Token 感知截断** | 用 BPE 词表实时计算每条消息 Token 数，从后往前塞消息，逼近模型安全水位线（如 120k Token）才停 | 精确控制 Token 预算，不会因单条超长消息爆掉 |
| **摘要接力（Episodic Summarization）** | 截断时后台用廉价小模型将"远古历史"浓缩成百字大纲，塞入 System Prompt 头部 | 大模型同时拥有最新细节记忆 + 宏观历史记忆 |

#### 5. AgentEngine 无状态重构

**重构前**：引擎持有 `WorkDir` 和 `contextHistory`，`Run(ctx, userPrompt, reporter)` 每次从零组装上下文。

**重构后**：引擎变为纯粹的"打工执行器"：

```go
func NewAgentEngine(p provider.LLMProvider, r tools.Registry, enableThinking bool) *AgentEngine

func (e *AgentEngine) Run(ctx context.Context, session *Session, reporter Reporter) error
```

- `WorkDir` 跟随 Session 走，而非绑定在 Engine 上。
- 每一个 ReAct 循环轮次从 `session.GetWorkingMemory(6)` 提取上下文，拼接 System Prompt 后调用 LLM。
- `session.Append()` 线程安全地持久化每一轮 LLM 响应和工具结果，供下一轮截取。

#### 6. 实验验证：物理隔离与截断双双生效

测试设计：
- Session A（飞书前端群）：Turn 1 读取 `/tmp/project_front/README.md` 获取密钥 `token_12345`，然后塞入 6 条闲聊撑爆 Working Memory，Turn 2 问"刚才的密钥是什么"。
- Session B（飞书后端群）：工作区 `/tmp/project_back`，问"能看到别人的密钥吗"。

**结果**：
- Session B 完全不知道 Session A 的内容（物理隔离生效）。
- Session A 的 Turn 2 中大模型回答"我忘了"（Working Memory 截断生效，`token_12345` 被挤出边界）。

#### 7. Registry-WorkDir 绑定的工业级真相

若真需要 per-Session WorkDir，必须通过 `context.Context` 将动态 WorkDir 透传给 `BaseTool.Execute()`，而非在 `NewReadFileTool` 时写死路径。

**但现实产品几乎不这么做**：
- **Claude Code**：CLI 工具，WorkDir = 当前终端目录，单用户单 WorkDir。
- **OpenClaw**：守护进程，WorkDir = `~/.openclaw/workspace`，多端 Session 共享同一物理领地。

全局唯一 Registry + 全局唯一 WorkDir 是当前工业级 Agent 的主流设计。

### Summary

本讲在 go-tiny-claw 驾驭工程体系中完成了两个互补的基础设施建设：**Session 物理隔离**（用 `SessionManager` + 读写锁为每个用户/频道分配独立上下文内存）和 **Working Memory 截取**（用 `GetWorkingMemory(limit)` 限制推理时的上下文规模，并防御孤儿 ToolResult 引发的 API 400）。经重构的 `AgentEngine.Run()` 成为无状态执行器，通过传入 Session 实例驱动 ReAct 循环，实现了真正的"记忆连续体"架构，为后续阶梯式 Context Compaction 铺平道路。

## Key Takeaways
- **Session 物理隔离是多端并发的必要前提**：共用 `contextHistory` 会导致任务混杂、大模型"精神分裂"；`GlobalSessionMgr` 的读写锁 Map 从根源隔离不同用户/频道的上下文内存空间。
- **Working Memory 的核心洞察**：大模型不需要两小时前的无关闲聊，只需最近 N 轮的工作上下文；`GetWorkingMemory(6)` 将推理请求的 Token 消耗严格控制在边界内，保护系统稳定性。
- **孤儿 ToolResult 防御不可省略**：截断边界若首条消息是 `ToolResult` 而其配对的 `ToolCall` 已被截掉，API 必然报 400——这是"调包"开发者接触不到的底层细节，必须在 `GetWorkingMemory` 中主动过滤。
- **Engine 无状态化是并发安全的设计基础**：`Run()` 不维护自身状态，WorkDir 跟随 Session 而非 Engine，同一个 Engine 实例可安全服务数百个并发 Session。
- **Token 感知截断和摘要接力是生产必备**：纯粹的"固定条数截取"在单条消息超长时仍会爆掉 Context Window；生产级引擎需叠加 BPE 实时计算 + Episodic Summarization 双重防线。
- **全局唯一 WorkDir 是工业级主流**：Claude Code 和 OpenClaw 均选择单 WorkDir，per-Session WorkDir 仅适用于极特殊场景且需 `context.Context` 透传，而非在工具初始化时写死路径。

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[SessionManager]]：go-tiny-claw 全局会话管理器，通过 `sync.RWMutex` + Map 实现多端并发下的 [[Session]] 物理隔离。
- [[Session]]：一块被隔离的上下文内存空间，持有完整历史消息队列和绑定的 [[WorkDir]]。
- [[Working Memory]]：短期工作记忆，从 Session 历史池中截取最近 N 条消息作为 LLM 推理的实际输入，防止 [[Context Window]] 超限。
- [[GetWorkingMemory]]：Session 的核心方法，实现滑动窗口截取并过滤孤儿 [[ToolResult]]，防止 API 400 Bad Request。
- [[AgentEngine]] 无状态重构：移除 Engine 层级的 WorkDir，`Run()` 接收 [[Session]] 实例驱动 ReAct 循环，Engine 成为纯打工执行器。
- [[孤儿 ToolResult]]：截断后首条消息是 ToolResult 但配对 ToolCall 已被截掉，导致 API 400 的边界条件。
- [[Token 感知截断]]：用 BPE 词表计算 Token 数，从后往前填充消息至安全水位线的精确截取策略。
- [[Episodic Summarization]]：摘要接力策略，用廉价小模型将远古历史浓缩为百字大纲注入 System Prompt 头部，保留宏观记忆。

### 2. 课程内导航链接
- [[001-prompt-assembly-dynamic-loading-agents-md-and-skills|第 10 讲 提示词组装]]：本讲基于上讲 `PromptComposer` 注入 AGENTS.md + Skills 的基础，进一步解决 Session 隔离和 Working Memory 两大工程问题。

### 3. 课程外与通用概念关联
- [[harness-engineering|Harness Engineering]]：Session 隔离和 Working Memory 管理是 Harness 工程中上下文工程体系的第二核心痛点，继 Prompt 动态组装之后。
- [[openclaw-architecture|OpenClaw]]：OpenClaw 守护进程（Daemon）采用全局唯一 `~/.openclaw/workspace` 的 WorkDir 绑定模式，与本讲结论一致。
- [[context-engineering|Context Engineering]]：本讲的 Session 隔离和 Working Memory 是 Context Engineering 体系中"上下文大小管控"这一维度的具体实现。

### 4. 推荐关系边（可直接扩成独立卡片）
- [[SessionManager]] → implements → [[Session]] 物理隔离
- [[Working Memory]] → specializes → [[Context Engineering]]
- [[GetWorkingMemory]] → prevents → [[孤儿 ToolResult]] 400 错误
- [[AgentEngine]] → composed-of → [[SessionManager]]
- [[Token 感知截断]] → extends → [[Working Memory]]
- [[Episodic Summarization]] → extends → [[Working Memory]]
- [[Working Memory]] → constrains → [[Context Window]]

### 5. 后续值得沉淀成卡片的主题
- [[SessionManager]]
- [[Working Memory]]
- [[孤儿 ToolResult]]
- [[Token 感知截断]]
- [[Episodic Summarization]]
- [[Context Compaction]]

## Notes For Review
- 下一讲（第 12 讲）将实现基于阶梯降级的 Context Compaction，是对本讲"固定条数截取不够用"问题的直接回答。
- `GetWorkingMemory` 中 limit=6 是演示值；生产中应结合 Token 感知截断动态调整。
- Session 持久化（`.jsonl` 落盘）是本讲刻意预留的设计空间，注释 `// s.SaveToDisk()` 标记了未来扩展点。

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 解释 `GetWorkingMemory(limit)` 中孤儿 `ToolResult` 过滤的必要性：如果不过滤会发生什么，为什么？
2. 工业级 Working Memory 有哪两种超越"固定条数截取"的进阶策略？各自的核心机制是什么？
3. 重构后的 `AgentEngine.Run()` 签名从 `(ctx, userPrompt, reporter)` 变为了什么？这次重构带来了什么架构层面的根本改变？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 大模型 API 要求历史消息具有连续性：每条 ToolResult（RoleUser + ToolCallID）必须有对应的前置 ToolCall。若截断后第一条是孤儿 ToolResult（其配对 ToolCall 已被截掉），API 无法匹配工具调用链，直接返回 400 Bad Request。因此 `GetWorkingMemory` 在截取后需从头检查，逐条丢弃首部的孤儿 ToolResult，直到遇到正常的 User 或 Assistant 消息。
>
> ---
>
> **题目 2 - 引导答案思路：**
> ①**Token 感知截断**：不按消息条数截，而是用 BPE 词表实时计算每条消息的 Token 数，从最新消息向前累加，逼近模型安全水位线（如 120k Token）时停止。②**摘要接力（Episodic Summarization）**：截断时后台触发廉价小模型，将被丢弃的"远古历史"浓缩成百字大纲，注入 System Prompt 头部，让大模型同时拥有最新细节记忆和宏观历史记忆。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 新签名为 `Run(ctx context.Context, session *Session, reporter Reporter) error`，不再接收 `userPrompt` 字符串。根本改变是：Engine 彻底变为无状态执行器——它不持有 WorkDir 或 contextHistory，所有状态由外部传入的 Session 承载；同一 Engine 实例可安全并发服务多个 Session；每轮循环从 `session.GetWorkingMemory(6)` 动态提取上下文，工具执行结果通过 `session.Append()` 持久化回 Session。
