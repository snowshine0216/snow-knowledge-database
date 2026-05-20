---
tags: [agent-harness, state-externalization, file-based-memory, plan-mode, checkpoint-resume, human-in-the-loop, long-term-memory, go-agent, prompt-engineering, context-management]
source: https://time.geekbang.org/column/article/978775
wiki: wiki/ai-engineering/004-memory-persistence-state-externalization-file-based-persistent-memory.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 当 Agent 执行一个跨越数小时、上百轮 ReAct 循环的长程任务时，Context Compactor 已经在工作，但仍然存在什么致命问题？
2. 传统 AI 框架（如 LangChain、AutoGPT）通常用什么技术方案来持久化 Agent 的执行状态？它有什么缺点？
3. "慢思考（Thinking Phase）"和"Plan Mode（计划模式）"听起来都像是帮助 Agent 更深入思考的机制，你认为它们有什么本质区别？

---

## Chapter Metadata
- Course: AI Agent 工程实战（从0开始构建 Agent Harness）
- Chapter: 004 — 13｜记忆沉淀：状态外部化，基于文件系统的持久化记忆与待办管理
- Author: Tony Bai
- Date: 2026-05-20
- Article ID: 978775

## Cornell Notes

### Cue Column (Questions)
- Context Compactor 已经解决 Token 溢出，为何长程任务仍会失败？
- 什么是"状态外部化（Externalized State）"？它的核心设计哲学是什么？
- 文件系统记忆法（File-based Memory）相比数据库方案有哪四大优势？
- Plan Mode 是如何通过 PromptComposer 动态激活的？
- Agent 进程崩溃后，断点续传是如何工作的？
- Plan Mode（宏观导航）vs Thinking Phase（微观手术刀）——两者如何分工？
- 工业级 Agent 的完整多层记忆体系是什么结构？

### Notes Column

**长程失忆症（Long-term Amnesia）的根源**

Context Compactor 通过掩码和截断解决了单次调用的 Token 溢出，但它同时也会不断"吞噬"早期历史。对于跨越几小时、上百个 Turn 的长程任务（如"将 Python 用户服务重构为 Go 语言并补充测试和 Makefile"），Agent 会产生严重的长程失忆症：
- 忘记第一分钟做出的全局架构规划
- 忘记还有哪些子模块未被重构
- 最致命：服务器关机或进程被 Kill 后，存储在 Go 内存里的 Session 瞬间灰飞烟灭

传统框架的解法是引入图数据库（Graph DB）、向量数据库（Vector DB）或代码内的庞大 State Machine——但这些方案藏在黑盒里，人类开发者无法直观查看、调试和干预。

**状态外部化（Externalized State）：把状态机变成肉眼可见的 Markdown**

核心思想：不在 Go 内存里维护 `type AgentState struct`，也不序列化进 Redis，而是直接教大模型使用最朴素的文件系统。

约定两个核心文件：
- `PLAN.md`：架构设计、重构思路和全局约束（宏大蓝图）
- `TODO.md`：细颗粒度的待办事项，使用标准 Markdown Checkbox（`- [ ] 步骤1`），实时打勾追踪进度

**文件系统记忆法的四大优势**

1. **绝对透明与可观测性**：随时在终端或 VS Code 中打开 `TODO.md`，一眼看清 Agent 在干嘛、接下来要干嘛
2. **零成本人机协同（Human-in-the-loop）**：不需要调用 API 或写控制台指令——直接像编辑普通文本一样手动修改 `PLAN.md`，下一个 Turn 重新读取后状态自动纠正
3. **天然断电持久化**：go-tiny-claw 进程崩溃 100 次，只要 `TODO.md` 还在，重启后说"继续执行任务"即可无缝恢复
4. **极致内存节省**：长程规划不占用昂贵的 Context Window（迟早被 Compactor 压缩），沉淀在物理文件中，Agent 每轮开头 `read_file` 一次即可以极低成本唤醒关键记忆

**Plan Mode 的实现：通过 PromptComposer 动态激活**

关键设计：不在 `engine/loop.go` 核心引擎中添加任何记忆处理代码，而是通过 `AgentEngine` 的 `PlanMode bool` 开关决定是否向 `PromptComposer` 注入"文件系统记忆范式"。

`PromptComposer.Build()` 中的条件分支：
```go
if c.planMode {
    // 注入 PLAN.md/TODO.md 强制规范，包含三步骤：
    // STEP 1: 强制环境嗅探 (ls -la 检查文件是否存在)
    //   - 分支 A (全新任务)：依次 write_file PLAN.md 和 TODO.md
    //   - 分支 B (断点续传)：read_file 读取两文件，从第一个 - [ ] 继续
    // STEP 2: 严格单步执行，完成一步立刻 edit_file 打勾
    // STEP 3: 迷失时 read_file TODO.md 自救
}
```

为什么这是正确的设计：简单的"帮我查日志报错"不需要生成 PLAN.md。通过开关实现轻重任务的完美分流。

**断点续传实战演示**

第一阶段：`go run cmd/claw/main.go -prompt="我需要你搭建一个极简的 Go 语言 Web Server 项目。"`
- Agent 先 `ls -la` 嗅探工作区（无 PLAN.md）→ 判定为全新任务
- 依次 `write_file PLAN.md`、`write_file TODO.md`
- 开始执行：创建 `go.mod`，完成后立即 `edit_file` 将 `- [ ] 创建 go.mod` 改为 `- [x]`
- 进程因 API 400 错误崩溃，内存中 Session 清零

第二阶段（重启，相同 prompt）：
- Agent 先 `ls -la` → 发现 PLAN.md 和 TODO.md 存在 → 判定为断点续传
- 按序 `read_file PLAN.md`、`read_file TODO.md`、`read_file main.go`
- 输出："我看到这是一个断点续传的任务" → 找到第一个 `- [ ]` → 继续执行

无需向 Agent 解释任何上下文，它凭借文件中的外部状态自动清醒。

**隐蔽的坑：空 Content 字段引发 API 400 错误**

当大模型直接调用工具时，`assistant` 角色的 `Content` 字段往往为空字符串。严格的 OpenAI 兼容端点（如智谱 GLM）要求：即便带了 `tool_calls`，也必须显式传递 `""` 而不是省略该字段。修复：在 `internal/provider/openai.go` 和 `claude.go` 处理 `RoleAssistant` 时，强制序列化空字符串 `""`。

**Plan Mode vs Thinking Phase：两条不同维度的防线**

| 机制 | 维度 | 解决的问题 | 作用时机 |
|---|---|---|---|
| Plan Mode + PLAN.md/TODO.md | 宏观导航（战略方向） | 跨 Turn 长程失忆、上下文压缩后跑偏 | 跨越数十个 Turn 的长跑 |
| Thinking Phase（慢思考） | 微观手术刀（推理跳步） | 单次推理时走捷径、跳过边界条件验证 | 每一轮的具体实现决策 |

两者不可互相替代。只有 Plan Mode 没有慢思考 → Agent 是"眼高手低的建筑师"，蓝图漂亮但每块砖砌得歪歪扭扭。

更实用的动态算力分配（未来优化方向）：
- 宏观触发：PLAN.md 检测到目标变更时开启慢思考
- 微观触发：工具调用返回非预期结果时动态开启
- 确定性执行步骤：直接执行，节省算力

**工业级多层记忆体系（Multi-tiered Memory System）**

| 层级 | 名称 | 实现 | 作用 |
|---|---|---|---|
| L1 | 短期工作记忆（Working Memory） | `GetWorkingMemory()` 最近 N 轮 | 模型思考的"草稿纸"，防止 OOM |
| L2 | 任务级状态记忆（State Memory） | PLAN.md + TODO.md | 当前任务的看板，任务结束后归档 |
| L3 | 情景记忆沉淀池（Episodic Memory） | `~/.openclaw/workspace/memory/2026-04-12.md` + `MEMORY.md` | 自动在压缩前落盘；可选 Dreaming 后台机制晋升高质量条目 |
| L4 | 长程记忆检索（Hybrid Retrieval） | `memory_search` 工具；向量搜索 + BM25 | 跨任务历史查询；本地 SQLite 向量索引，支持离线语义检索 |

OpenClaw 的极简哲学：记忆存储降维为本地 Markdown 文件"追加写入"，以内置 SQLite 向量索引支撑混合语义检索——极简部署成本 + 强大检索能力。

**为下一讲埋伏笔：失控的后台进程**

Agent 执行 `./server &` 时，通过 Go 的 `os/exec` 调用若未分离标准输入/输出管道，子进程与父进程强绑定 → 引擎卡死。大模型不知道自身处于非交互式终端环境。下一讲将实现 System Reminders 运行时提醒机制来解决此类 Doom Loop。

### Summary

本讲的核心洞见是：Agent 的长程记忆问题不需要复杂数据库，只需"状态外部化"——引导大模型把架构规划（PLAN.md）和执行进度（TODO.md）写入本地文件，即可实现天然的断电持久化、零成本人机协同和极致的透明可观测性。通过在 AgentEngine 暴露 `PlanMode` 开关，PromptComposer 动态注入三步骤强制规范（环境嗅探→单步打勾→迷失自救），使 Agent 在进程重启后能自动识别断点并续传任务。Plan Mode 解决宏观战略方向问题，Thinking Phase 解决微观推理跳步问题，两者不可替代，共同构成工业级 Agent 的完整防线。

## Key Takeaways

- **状态外部化是反直觉的优雅**：与其在内存维护 `State Machine` 序列化到 Redis，不如直接教大模型读写 `PLAN.md`（架构蓝图）和 `TODO.md`（执行看板）——人类可实时查看和干预，进程崩溃后自动续传
- **Plan Mode 是可选的架构开关**：通过 `PromptComposer` 条件注入，简单的"查日志"任务不触发，复杂的"重构项目"任务才激活——实现轻重分流，避免"官僚式"繁文缛节
- **断点续传的三步骤 Prompt 规范**：STEP 1 强制 `ls -la` 嗅探工作区（新任务 vs 续传分支），STEP 2 完成一步立即 `edit_file` 打勾（禁止批量打勾），STEP 3 迷失时 `read_file TODO.md` 自救
- **空 Content 字段是隐蔽 API 坑**：工具调用时 `assistant` 角色的 `Content` 往往为空，严格的 OpenAI 兼容端点要求显式传 `""`——Harness 必须在 provider 层抹平此差异
- **Plan Mode ≠ 慢思考**：Plan Mode 是跨 Turn 的宏观导航（防失忆），Thinking Phase 是每轮的微观推理纠偏（防走捷径），缺少后者的 Agent 是"眼高手低的建筑师"
- **OpenClaw 四层记忆体系**：Working Memory（草稿纸）→ State Memory（PLAN.md/TODO.md）→ Episodic Memory（按日期 Markdown + MEMORY.md，压缩前自动落盘）→ Hybrid Retrieval（向量 + BM25，本地 SQLite 离线可用）
- **文件系统记忆法的极简哲学**：追加写入本地 Markdown + SQLite 向量索引 = 极简部署成本 + 强大检索能力，无需引入外部图数据库或向量数据库

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点

- [[ExternalizedState]]：将 Agent 的执行状态（规划、进度）外部化为工作区内的 [[PLAN.md]] 和 [[TODO.md]] 文件，而非维护内存状态机
- [[FileBasedMemory]]：基于纯文件系统的持久化记忆策略，依赖 [[PromptComposer]] 注入操作规范
- [[PlanMode]]：AgentEngine 的架构开关；开启时向 System Prompt 注入状态外部化强制规范，关闭时走极速问答路径
- [[PromptComposer]]：动态 System Prompt 组装器，根据 [[PlanMode]] 开关条件拼接长程任务规范；详见第 10 讲
- [[CheckpointResume]]：断点续传能力；依赖 [[ExternalizedState]] 实现进程重启后无缝恢复，无需重传上下文
- [[HumanInTheLoop]]：通过直接编辑 [[PLAN.md]]/[[TODO.md]] 实现零 API 成本的人机协同干预
- [[MultiTieredMemory]]：工业级 Agent 四层记忆体系：[[WorkingMemory]] → [[StateMemory]] → [[EpisodicMemory]] → [[HybridRetrieval]]
- [[DoomLoop]]：Agent 陷入无限重试死循环的失控状态；由后台进程阻塞引发，下一讲的 System Reminders 解决此问题
- [[HybridRetrieval]]：向量语义搜索 + BM25 关键词搜索双路合并；OpenClaw 以本地 SQLite 向量索引实现离线可用

### 2. 课程内导航链接

- [[001-prompt-assembly-dynamic-loading-agents-md-and-skills|第 10 讲 Prompt 组装：动态加载 AGENTS.md 与 Skills]]：[[PromptComposer]] 的基础实现；本讲在此基础上扩展 PlanMode 条件分支
- [[002-session-isolation-and-working-memory|第 11 讲 Session 隔离与工作记忆]]：[[WorkingMemory]] 的 `GetWorkingMemory(N)` 实现；本讲的 L1 记忆层
- [[003-context-compaction-staged-degradation-strategy|第 12 讲 Context 压缩与分级降级策略]]：[[ContextCompactor]] 解决短期 Token 溢出，但正是它的压缩行为迫使引入 [[ExternalizedState]]

### 3. 课程外与通用概念关联

- [[harness-engineering]]：本讲是 Harness Engineering 核心哲学的实践体现——透明、可干预、极简部署，对抗黑盒框架
- [[openclaw-architecture]]：OpenClaw 的 `~/.openclaw/workspace/memory/` 目录、`MEMORY.md` 与 Dreaming 机制是本讲多层记忆体系的具体参考实现
- [[react-loop]]：ReAct 循环是长程任务失忆症的发生场景；[[ExternalizedState]] 是在 ReAct 循环中注入外部记忆锚点的解法
- [[human-in-the-loop]]：文件系统记忆法将 Human-in-the-loop 降低为"编辑文本文件"的零成本操作

### 4. 推荐关系边

- [[PlanMode]] → enables → [[CheckpointResume]]
- [[PlanMode]] → enables → [[HumanInTheLoop]]
- [[ExternalizedState]] → implements → [[FileBasedMemory]]
- [[PromptComposer]] → governs-by → [[PlanMode]]
- [[ContextCompactor]] → necessitates → [[ExternalizedState]]
- [[ExternalizedState]] → specializes → [[MultiTieredMemory]]
- [[HybridRetrieval]] → composed-of → [[EpisodicMemory]]
- [[DoomLoop]] → prevented-by → [[SystemReminders]]

### 5. 后续值得沉淀成卡片的主题

- [[ExternalizedState]]
- [[FileBasedMemory]]
- [[PlanMode]]
- [[CheckpointResume]]
- [[MultiTieredMemory]]
- [[EpisodicMemory]]
- [[DoomLoop]]
- [[HybridRetrieval]]

## Notes For Review

- 本讲演示中 Agent 因 `assistant.Content` 为空导致智谱 API 400 错误——是否所有 OpenAI 兼容端点都有此要求？是否需要在 provider 层统一处理？
- 思考题：去掉 `edit_file` 工具只用 `bash + sed` 更新 TODO.md 时，特殊字符（`[ ]`、`[x]`、方括号转义）极易导致文件损坏——具体有哪些 sed 命令坑？
- `Dreaming` 后台机制（对短期记忆信号评分并晋升至长期 MEMORY.md）是实验性功能——其触发条件和评分算法值得深入研究
- 动态算力分配（宏观触发 + 微观触发慢思考）是未提供实现的优化方向——如何检测"工具返回非预期结果"的信号？

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 为什么 Context Compactor 已经在工作，长程任务仍然需要"状态外部化"这个额外机制？两者各自解决的是什么维度的问题？
2. 描述 go-tiny-claw 断点续传的完整工作流程：从进程崩溃到重启后恢复执行，Agent 会调用哪些工具、按什么顺序、做出什么判断？
3. Plan Mode（计划模式）和 Thinking Phase（慢思考）都是为了让 Agent "想得更清楚"，但它们解决的是完全不同的问题——请分别解释这两个机制的作用维度和适用场景。

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> Context Compactor 解决的是"短期存活"问题——防止单次 API 调用因 Token 超限而崩溃。但它的副作用是不断"吞噬"早期历史，导致 Agent 忘记宏观规划和未完成的子任务。状态外部化解决的是"长程记忆"问题——将 Agent 的执行状态写入本地文件（PLAN.md/TODO.md），使其在 Context 被压缩、甚至进程重启后仍能恢复。两者是互补关系：Compactor 管 Token 不溢出，外部化记忆管任务不跑偏。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 进程崩溃后内存 Session 清零。重启后用相同 prompt 唤醒 Agent：① `bash ls -la` 嗅探工作区，发现 PLAN.md 和 TODO.md 已存在 → 进入"断点续传"分支；② `read_file PLAN.md` 了解全局目标；③ `read_file TODO.md` 找到第一个 `- [ ]` 未完成任务；④ 从该任务继续执行，完成后立即 `edit_file` 打勾。全程无需用户重新提供任何上下文。
>
> ---
>
> **题目 3 - 引导答案思路：**
> Plan Mode 是"宏观导航"，解决跨越数十个 Turn 的战略方向问题——通过 PLAN.md/TODO.md 防止 Agent 在长跑中因 Context 压缩而忘记全局目标和执行进度，属于任务级别的状态管理。Thinking Phase（慢思考）是"微观手术刀"，解决单次推理的跳步问题——约束 Agent 在做具体实现时不走捷径、不跳过边界条件验证，属于每个 Turn 内的推理质量保障。缺少 Plan Mode 的 Agent 会在长程任务中跑偏；缺少慢思考的 Agent 会成为"眼高手低的建筑师"——蓝图漂亮但每块砖都砌得歪歪扭扭。
