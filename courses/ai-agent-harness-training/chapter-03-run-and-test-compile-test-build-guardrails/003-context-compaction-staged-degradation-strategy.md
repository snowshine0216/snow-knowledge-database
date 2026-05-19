---
tags: [context-compaction, staged-degradation, working-memory, context-engineering, agent-harness, go, oom-prevention, context-window, masking, head-tail-truncation, harness-engineering]
source: https://time.geekbang.org/column/article/977397
wiki: wiki/courses/ai-agent-harness-training/chapter-03-run-and-test-compile-test-build-guardrails/002-session-isolation-and-working-memory.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 上一讲用"最近 N 条消息"截取 Working Memory，为什么这仍然无法防止 Context Window 超限？
2. 为什么不能直接从消息列表里删除超长的 ToolResult 消息？删了会出现什么问题？
3. "掐头去尾截断法"（Head-Tail Truncation）保留前 500 字 + 后 500 字，这种策略背后的假设是什么？

## Chapter Metadata
- Course: AI Agent 工程化实战（从0开始构建 Agent Harness）
- Chapter: 012 — 突破内存：基于阶梯降级的 Context Compaction 策略
- Author: Tony Bai
- Date: 2026-05-19
- Article ID: 977397

## Cornell Notes

### Cue Column (Questions)
- 固定条数 Working Memory 为什么仍无法防止单次大文件读取导致的 OOM？
- 为什么不能直接删掉超长 ToolResult 消息？会造成什么断层？
- 阶梯降级压缩策略的两道防线分别是什么？各自保护什么？
- Compactor 在引擎中插入在哪个位置？为什么全量数据仍必须写入 Session？
- 字符数量（Char Count）作为 Token 估算指标的局限是什么？工业界有哪些更精确的替代方案？

### Notes Column

#### 1. Working Memory 的未解难题：单条消息暴击

上一讲用 `GetWorkingMemory(N)` 将 LLM 推理时的上下文限制在最近 N 条消息，控制了"长期闲聊"的 Token 消耗。但这道防线有一个盲区：**单条 ToolResult 超长**。

场景：Agent 在 Turn 2 读取一个两万行的 Nginx 报错日志（≈1MB）。此 ToolResult 消息就算处于 Working Memory 的保护区（最近 3 条）内，发往 API 时仍会触发 `400 Bad Request: context length exceeded`。

**驾驭铁律**：Context Window = 昂贵且受限的 RAM；防止 OOM（内存溢出）的优先级永远高于业务逻辑（记忆完整性）。

#### 2. 为什么不能直接删掉超长 ToolResult？

大模型依赖连续的 ReAct 逻辑链（Chain of Thought）。若直接删除某条 ToolResult，历史中会出现**致命断层**：大模型明明发出了 `bash 'cat large.log'`（ToolCall），却找不到对应的执行结果（ToolResult），会误以为命令未发出，**反复重试**，陷入死循环。

结论：**ToolCall 意图记录必须保留**，丢弃的只能是执行结果中的冗余数据内容。

#### 3. 阶梯降级压缩（Staged Degradation）：双重防线

针对不同"时间距离"的消息，施加不同力度的压缩处理：

| 消息区域 | 处理策略 | 核心逻辑 |
|---|---|---|
| **System Prompt** | 永远保留，不可侵犯 | 大模型的行为基础 |
| **远期历史**（Working Memory 保护区之外） | **全量掩码（Full Masking）**：ToolResult 内容替换为 `…[早期工具输出已清理，原始长度: N 字节]…` | 保留 ToolCall 意图，丢弃冗余结果 |
| **Working Memory**（最近 N 轮） | **掐头去尾（Head-Tail Truncation）**：超过 1000 字符时只保留前 500 字 + 后 500 字 | 日志通常头部含错因、尾部含堆栈，中间循环可丢弃 |

注：即使消息处于 Working Memory 保护区，只要单条内容过大（>1000 字符），第二道防线仍然触发。

#### 4. Go 代码实现：`Compactor` 结构体

新建 `internal/context/compactor.go`：

```go
type Compactor struct {
    MaxChars       int // 触发压缩的字符数阈值（水位线）
    RetainLastMsgs int // Working Memory 保护区大小（最近 N 条）
}

func (c *Compactor) Compact(msgs []schema.Message) []schema.Message {
    if c.estimateLength(msgs) < c.MaxChars {
        return msgs // 未超水位线，直接返回
    }
    // 遍历消息，对 ToolResult 施加不同级别降级
    // System Prompt：直接保留
    // 远期 ToolResult：替换为掩码字符串
    // 近期 ToolResult 超长：掐头去尾截断
    // 注：永远不动 ToolCall 意图记录
}
```

关键参数（演示值）：`MaxChars=3000`，`RetainLastMsgs=6`（约两轮 Turn 交互）。

#### 5. 注入引擎：边界清晰的两条数据流

在 `internal/engine/loop.go` 的 ReAct 循环中，注入点在**调用 `provider.Generate()` 之前**：

```go
workingMemory := session.GetWorkingMemory(20)
contextHistory := append([]schema.Message{systemMsg}, workingMemory...)

// 压缩：仅影响本次 API 调用的临时 Context
compactedContext := e.compactor.Compact(contextHistory)

// 使用 compactedContext 调用 LLM
actionResp, _ := e.provider.Generate(ctx, compactedContext, availableTools)

// 全量原始结果仍写入 Session（不受 Compact 影响）
session.Append(*actionResp)
```

**驾驭精髓**：`Session.Append()` 存储的永远是**全量真实数据**；`Compactor.Compact()` 只是一副"有色眼镜"，过滤后的视图只存在于本次 API 调用的瞬间，绝不污染持久化历史。

#### 6. 实测验证：OOM Killer 完美介入

测试场景：三步任务，Step 2 读取含两千行重复文本的 `mock_log.txt`（`yes "极其冗长的日志" | head -n 2000`）。

```
[Compactor] ⚠️ 内存告警：当前上下文长度 (9221 字符) 超过阈值 (3000)，触发压缩清理...
[Compactor] ✅ 压缩完成。上下文长度从 9221 降至 2217 字符。
```

大模型在 Turn 3 没有产生幻觉，清楚知道自己读过该文件，丝滑继续执行 `date` 命令——因为 ToolCall 意图记录（"我调用了 read_file"）被完整保留。

#### 7. 工业界前沿：本讲策略的局限与替代方案

| 方案 | 原理 | 优点 | 缺点 |
|---|---|---|---|
| **本讲：字符级截断** | 掩码 + 掐头去尾 | 成本极低、延迟极小、绝对防 OOM | 中间关键内容可能丢失 |
| **LLM 摘要压缩** | 后台调廉价小模型浓缩历史为百字大纲 | 最大限度保留语义 | 增加 API 成本和延迟，摘要模型可能幻觉遗漏 |
| **Memory Paging（向量检索）** | 历史分块存向量库，推理时按需调用 `search_memory` 换入 | 支持极长历史的精确检索 | 架构复杂，需要 Vector DB |
| **长上下文大模型** | 直接扩大模型 Context Window（Gemini：100w Token） | 无需工程手段 | Token 计费极贵 |

**结论**：没有银弹，只有最适合当前场景的 Trade-off。本讲策略在"低成本 + 低延迟 + 绝对防溢出"三维度取胜，主要目的在于理解 Compactor 存在的意义。

### Summary

本讲解决了 Working Memory 条数截取无法防御的盲区——单条 ToolResult 超长导致的 OOM。核心设计是**阶梯降级压缩（Staged Degradation）**：系统提示永远保留，远期历史 ToolResult 全量掩码（保留 ToolCall 意图），近期 Working Memory 中超长 ToolResult 掐头去尾截断（保留前 500 + 后 500 字符）。`Compactor` 以字符数为水位线，只作用于发往 LLM API 的临时上下文视图，全量原始数据始终完整写入 Session，实现了"持久层无损"与"API 层安全"的双重保证。

## Key Takeaways
- **单条消息暴击是固定条数 Working Memory 的死穴**：N 条保护区无法防止一条含 1MB 日志的 ToolResult 触发 Context Window 超限；Compactor 是专门应对此类"大文件暴击"的第二道防线。
- **永远不删 ToolCall，只压缩 ToolResult 内容**：删 ToolCall 会切断 ReAct 逻辑链，导致大模型反复重试陷入死循环；掩码/截断只作用于执行结果的冗余字节，意图记录必须保留。
- **两道防线分工明确**：远期历史（保护区外）→ Full Masking 全量替换；近期 Working Memory → Head-Tail Truncation 掐头去尾。前者彻底释放内存，后者在 OOM 压力下仍保留日志最有价值的开头错因 + 尾部堆栈。
- **Compactor 是一副有色眼镜，不是持久化操作**：`Session.Append()` 永远存储全量真实数据，Compactor 过滤出的压缩视图只存在于本次 `provider.Generate()` 调用的瞬间，绝不污染历史记录。
- **字符数是最简可行的 Token 估算指标**：英文约 1 token ≈ 4 字符，中文约 1 token ≈ 1.5 字符；比引入 tiktoken 词表成本低 100 倍，足以满足防 OOM 的工程需求，精度损失在工程可接受范围内。
- **下一个核心问题是长程状态外部化**：多天、多模块的大型任务中，即使有 Compactor 也无法帮大模型知晓"完成了几分之几"；下一讲将用 `TODO.md/PLAN.md` 将状态写到文件系统，替代复杂 State Machine。

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[Context Compaction]]：上下文压缩机制，核心目标是在不切断 ReAct 逻辑链的前提下，将发往 LLM API 的 Context 控制在安全水位线内。
- [[Staged Degradation]]：阶梯降级策略，根据消息在时间轴上的距离，对不同区域施加不同力度的内存压缩：系统提示 → 永远保留，远期历史 → [[Full Masking]]，近期超长 → [[Head-Tail Truncation]]。
- [[Compactor]]：go-tiny-claw 的上下文内存回收器，字段为 `MaxChars`（水位线）和 `RetainLastMsgs`（保护区大小），在 `loop.go` 的 `provider.Generate()` 调用前执行。
- [[Full Masking]]：远期历史的 ToolResult 内容替换为掩码字符串（保留原始字节数信息），ToolCall 意图记录严禁删除。
- [[Head-Tail Truncation]]：近期 Working Memory 中单条 ToolResult 超过阈值（1000 字符）时，保留前 500 + 后 500 字符，丢弃中间冗余循环内容。
- [[ReAct 逻辑链]]：大模型通过 ToolCall（意图）→ ToolResult（观测）→ 下一次推理的连贯逻辑链；切断 ToolCall 会导致大模型幻觉重试死循环。
- [[OOM Prevention]]：防止 Context Window 溢出（OOM）的物理防线，优先级高于业务逻辑完整性的工程原则。

### 2. 课程内导航链接
- [[002-session-isolation-and-working-memory|第 11 讲 Session 物理隔离与 Working Memory]]：本讲 Compactor 是对上讲"固定条数截取不能防止单条大消息"问题的直接回答，两讲构成 Context 管控的完整双层防线。
- [[001-prompt-assembly-dynamic-loading-agents-md-and-skills|第 10 讲 提示词组装]]：`PromptComposer` 构建的 System Prompt 是本讲 Compactor 中"永不压缩"的神圣区域，两讲共同定义了 Context 的静态基座与动态水位线。

### 3. 课程外与通用概念关联
- [[context-engineering|Context Engineering]]：阶梯降级压缩是 Context Engineering 中"上下文大小管控"维度的核心实现，补全了"动态内容 OOM 防护"这一环。
- [[harness-engineering|Harness Engineering]]：Compactor 是 Harness 工程体系中防止运行时崩溃的基础设施，与 Session 隔离、Working Memory 共同构成 Harness 的内存管理层。
- [[openclaw-architecture|OpenClaw]]：工业级 Agent 产品（OpenClaw/Claude Code）均面临相同的 OOM 挑战，本讲的 Compactor 是对其底层机制的教学还原。

### 4. 推荐关系边（可直接扩成独立卡片）
- [[Compactor]] → implements → [[Staged Degradation]]
- [[Full Masking]] → protects → [[ReAct 逻辑链]]
- [[Head-Tail Truncation]] → prevents → [[OOM Prevention]]
- [[Staged Degradation]] → extends → [[Working Memory]]
- [[Compactor]] → constrains → [[Context Window]]
- [[Session]] → governs → [[Compactor]] 数据流（全量写入 Session，压缩视图仅用于 API）
- [[Context Compaction]] → inspired-by → 操作系统 Garbage Collector

### 5. 后续值得沉淀成卡片的主题
- [[Context Compaction]]
- [[Staged Degradation]]
- [[Full Masking]]
- [[Head-Tail Truncation]]
- [[OOM Prevention]]
- [[Adaptive Compression]]

## Notes For Review
- 下一讲将实现"状态外部化"：用 `TODO.md/PLAN.md` 将任务进度写到文件系统，替代复杂的内存状态机，解决跨天跨模块超大型任务的记忆断层问题。
- 本讲 `MaxChars=3000` 是演示用的激进阈值（便于复现 OOM）；生产环境应参考模型实际 Token 窗口（如 128k Token ≈ 约 512k 字符）动态设置。
- 思考题：如何利用 API Response 中 `Usage.PromptTokens` 字段，将固定字符阈值改造为"基于真实 Token 消耗水位线"的自适应压缩（Adaptive Compression）？

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 解释为什么阶梯降级压缩对 ToolResult 进行掩码/截断时，必须严禁删除 ToolCall 记录？
2. 阶梯降级的两道防线分别针对哪个区域？各自用什么策略处理超长内容？
3. Compactor 在引擎中的注入位置和 Session.Append() 的写入时机有什么根本区别？这个区别体现了什么设计原则？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 大模型的 ReAct 推理依赖连续的"意图→观测"逻辑链。ToolCall 是大模型发出的行动意图（"我调用了 read_file"），ToolResult 是执行结果。若删除 ToolCall，大模型在后续上下文中看不到自己发出过该命令，会误判"命令未执行"，重复发起相同的 ToolCall，陷入死循环幻觉。因此只能掩码/截断 ToolResult 内容（冗余字节），ToolCall 意图记录必须完整保留以维系逻辑链。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 第一道防线针对**远期历史**（Working Memory 保护区之外的早期消息）：对 ToolResult 内容执行**全量掩码（Full Masking）**，替换为包含原始字节数的单行提示字符串，彻底释放内存。第二道防线针对**近期 Working Memory**（保护区内但单条内容过大）：执行**掐头去尾截断（Head-Tail Truncation）**，保留前 500 字符（含错因）和后 500 字符（含堆栈），丢弃中间冗余循环内容。
>
> ---
>
> **题目 3 - 引导答案思路：**
> `Compactor.Compact()` 在 `provider.Generate()` 调用**之前**执行，只生成一个临时压缩视图（本次 API 调用后即丢弃）；`Session.Append()` 在 LLM 响应**返回后**执行，始终存储全量完整数据。根本区别在于：压缩只作用于"发给大模型的那一瞬间的上下文视图"，持久化层永远保留未被压缩的原始真相。这体现了"效果隔离"原则：物理内存防护（OOM 防线）不得污染持久化数据的完整性。
