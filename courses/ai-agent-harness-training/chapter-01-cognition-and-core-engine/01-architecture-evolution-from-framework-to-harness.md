---
tags: [ai-agent, harness-engineering, agent-architecture, go, framework-vs-harness, react-loop, context-engineering, llm]
source: https://time.geekbang.org/column/article/967047
wiki: wiki/courses/ai-agent-harness-training/chapter-01-cognition-and-core-engine/01-architecture-evolution-from-framework-to-harness.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 传统的 Agent 框架（如 LangChain、AutoGen）通常使用什么数据结构来编排多步任务？这种结构有哪些已知缺陷？
2. 当现代大模型（如 GPT-4o、Claude 3.5 Sonnet）具备自主规划能力后，Agent 底层架构发生了怎样的根本性转变？
3. 如果用"操作系统"类比 Agent Harness，大模型对应什么组件？Context 对应什么组件？

---

## Chapter Metadata
- Course: AI Agent工程化训练营（从0开始构建 Agent Harness）
- Chapter: 001 — 架构演进：从 Framework 到 Harness，Agent 到底需要怎样的底层支撑？
- Author: Tony Bai
- Date: 2026-05-04
- Article ID: 967047

---

## Cornell Notes

### Cue Column (Questions)
- 传统 DAG/Chain 框架为什么在生产环境中频繁崩溃？
- Harness 与 Framework 的本质架构差异是什么？
- 控制反转（IoC）在 Agent 领域意味着什么？
- go-tiny-claw 的四层架构各层的职责边界在哪里？
- 为什么 Harness 用"无限循环 + Middleware"替换了 DAG 图？
- Context Window 溢出时，类 OS 的策略是什么？

### Notes Column

#### 传统 Framework 的架构陷阱

早期（GPT-3 时代），模型缺乏原生规划和 Function Calling 能力，开发者发明了 Chain/DAG 框架来**硬编码业务逻辑**。典型写法：

```
定义 ErrorAnalyzerNode → 定义 WebSearchNode → 用代码 Edge 连接二者
```

这种架构的两大致命问题：
1. **静态 + 过度干预**：DAG 图无法应对真实世界的突发情况（如 NodeA 执行时网络超时、返回意外 JSON），直接抛异常崩溃，缺乏弹性回退机制。
2. **隐式状态机**：框架底层维护人类难以阅读的复杂状态机来实现节点跳转，一旦发生死循环，开发者无法插手干预。
![[file-20260504123027989.png]]

#### Harness 的革命性转变

Claude 3.5 Sonnet / GPT-4o 等模型已进化为**具有极强自主规划能力的 CPU**——只需一个包含当前状态的 Context + 可用工具列表，模型便能自主推导下一步。

Harness 因此抛弃 DAG，回归最古老可靠的结构：

```
无限循环（Main Loop）+ 事件驱动拦截器（Interceptors/Middlewares）
```

三大革命性转变：

| 转变 | 旧 Framework | Harness |
|---|---|---|
| **控制反转（IoC）** | Go/Python 代码决定执行顺序 | 大模型实时推理决定下一步，代码只提供物理定律（文件读写、沙箱执行） |
| **防线前移** | 业务逻辑分散在各节点 | 核心代码集中在 Middleware（防破坏）和 Compactor（防 Token 爆炸） |
| **状态透明** | 隐式树/图节点变量 | 单一数据结构：不断累加的 Context 消息列表，无任何隐式变量 |

#### go-tiny-claw 四层架构蓝图

```
┌─────────────────────────────────────────┐
│  入口交互层（Entry & UI Layer）           │
│  CLI + 飞书集成 + Human-in-the-loop      │
│  异步回调机制                             │
├─────────────────────────────────────────┤
│  核心引擎层（Core Engine Layer — 心脏）   │
│  Main Loop（ReAct 循环）                 │
│  大模型适配器（Claude / OpenAI 兼容）     │
│  Thinking 模块（强制慢思考）              │
├─────────────────────────────────────────┤
│  上下文工程层（Context Engineering — 内存管理器）│
│  a. Prompt 动态组装器（读取 AGENTS.md）  │
│  b. Token 监控与阶梯压缩器              │
│  c. 运行时事件提醒注入（防走神）          │
│  d. 基于文件系统的状态记忆（TODO.md）    │
├─────────────────────────────────────────┤
│  工具与执行层（Tool Execution — 四肢）    │
│  动态 ToolRegistry                       │
│  极简工具集（read/write/edit/bash）      │
│  Middleware 安全门（拦截危险命令）        │
└─────────────────────────────────────────┘
```

**关键设计决策**：
- **文件系统即内存**：不使用内部变量存储进度，直接写本地 `TODO.md`——极简哲学，崩溃后可恢复。
- **Thinking 模块**：在模型执行任何工具调用前，强制触发慢思考（类似 o1 推理模式），降低错误率。
- **阶梯压缩器**：类比 OS 内存回收，Token 水位到达阈值时触发分级压缩（摘要早期对话 → 删除冗余 → Swap 到文件）。

#### go-tiny-claw 项目骨架

```
go-tiny-claw/
├── cmd/claw/main.go          # 程序入口
├── internal/
│   ├── engine/               # MainLoop 核心实现（ReAct 循环）
│   ├── provider/             # 大模型接口抽象（Claude/OpenAI 适配器）
│   ├── context/              # Token 监控、Prompt 动态组装、Compactor
│   ├── tools/                # 工具注册表、Middleware、极简内置工具
│   ├── memory/               # 基于文件系统的记忆状态（PLAN/TODO）
│   └── feishu/               # 飞书机器人交互回调
├── go.mod
└── README.md
```

`main.go` 骨架用注释形式展示了四个初始化步骤：
1. `provider.NewClaudeProvider(...)` — 初始化大脑
2. `tools.NewRegistry()` + `Register(tools.NewBashTool())` — 初始化手脚
3. `context.NewManager(...)` — 初始化内存管理器
4. `engine.NewAgentEngine(provider, registry, ctxManager)` — 启动心脏

### Summary

本讲从软件架构演进视角，系统阐释了为什么传统 DAG/Chain 框架在工业生产环境中脆弱不堪——硬编码的逻辑无法应对动态异常，隐式状态机令调试维护极其困难。随着 Claude 3.5 Sonnet / GPT-4o 等强规划模型的出现，**驾驭工程（Harness Engineering）**应运而生：以"无限循环 + Middleware"替代 DAG，将控制权完全交还给模型，代码只负责提供工具和安全防线。go-tiny-claw 的四层架构（入口交互 / 核心引擎 / 上下文工程 / 工具执行）是这一哲学的 Go 语言实现蓝图，贯穿整个专栏。

---

## Key Takeaways

- **Framework 的根本缺陷不是 API 封装不够好，而是"静态控制流"本身**：DAG 图无法在运行时动态响应错误，隐式状态机让死循环无法被外部干预，这是结构性问题而非配置问题。
- **Harness 的核心是控制反转（IoC）**：业务逻辑控制权从 Go/Python 代码转移到大模型推理，代码只提供"物理定律"（文件读写、bash 执行、沙箱），任务走向完全由模型决定。
- **Main Loop = 无限循环 + Middleware**，比 DAG 更可靠：这是计算机科学中最古老的结构——操作系统调度循环；Middleware 是唯一的安全关卡，集中防止危险操作和 Token 爆炸。
- **状态透明原则**：Harness 只依赖一个数据结构——累加的 Context 消息列表；进度持久化到 `TODO.md` 文件，而非内部变量，崩溃重启后状态可完整恢复。
- **Context 压缩 = OS 的内存管理**：当 Token 水位接近 128k 上限时，阶梯压缩器触发（摘要 → 删除冗余 → Swap 到磁盘），防止因 API 超限导致 Agent 完全失忆崩溃。
- **go-tiny-claw 目录结构遵循 Standard Go Project Layout**：`internal/engine`（心脏）、`internal/provider`（大脑接口）、`internal/context`（内存）、`internal/tools`（手脚），高内聚低耦合，每层职责单一。

---

## Knowledge Graph Seeds

**Entities:**
- (Course: AI Agent工程化训练营)
- (Chapter: 架构演进——从 Framework 到 Harness)
- (Author: Tony Bai)
- (Project: go-tiny-claw)
- (Concept: Harness Engineering / 驾驭工程)
- (Concept: ReAct Loop / Main Loop)
- (Concept: Context Engineering)
- (Concept: Inversion of Control in Agent)
- (Concept: Token Compactor)
- (Tool: Middleware)
- (Framework: LangChain)
- (Framework: AutoGen)
- (Engine: OpenClaw)

**Relations:**
- (Course: AI Agent工程化训练营) -> contains -> (Chapter: 架构演进)
- (Chapter: 架构演进) -> introduces -> (Project: go-tiny-claw)
- (Chapter: 架构演进) -> contrasts -> (Framework: LangChain)
- (Concept: Harness Engineering) -> replaces -> (Concept: DAG-based Framework)
- (Concept: Harness Engineering) -> uses -> (Concept: ReAct Loop)
- (Concept: ReAct Loop) -> protected-by -> (Tool: Middleware)
- (Concept: Context Engineering) -> includes -> (Concept: Token Compactor)
- (Project: go-tiny-claw) -> inspired-by -> (Engine: OpenClaw)

---

## Notes For Review

- 思考题：Context Window 接近 128k Tokens 时，go-tiny-claw 应采用哪些类 OS 策略？（文章提出问题，下一讲回答）
  - 候选策略：优先 Swap 早期对话到文件 → 摘要中间段 → 保留最近 N 轮 + System Prompt → OOM 时优雅终止并保存检查点
- 飞书集成的 Human-in-the-loop 异步回调机制（入口交互层）将在后续讲次实现，需关注回调超时处理
- Thinking 模块（强制慢思考）与 provider 层的关系待后续讲次细化

---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 解释传统 DAG/Chain 框架为什么无法应对真实生产环境的动态异常？举出具体失败场景。
2. 什么是 Harness 中的"控制反转（IoC）"？代码的角色从什么变成了什么？
3. go-tiny-claw 的"阶梯压缩器"类比 OS 的哪个机制？当 Context Window 接近上限时它应该做什么？

> [!example]- 💡 答案指南 (Answer Guide)
>
> #### Q1 — 为什么 DAG/Chain 难以应对动态异常
>
> DAG 图的逻辑是硬编码的。若 NodeA 执行时遇到网络超时或意外 JSON 格式，框架往往没有弹性回退机制，只能直接抛异常崩溃；而底层隐式状态机一旦进入死循环，开发者也很难从外部插手干预。
>
> #### Q2 — Harness 中的控制反转
>
> 控制反转指业务流程的执行顺序不再由 Go/Python 代码写死，而是完全交由大模型实时推理和规划。代码的角色因此从“业务逻辑编排者”收缩成“物理定律提供者”，只暴露文件读写、bash 执行、沙箱等原子能力。
>
> #### Q3 — 阶梯压缩器对应的 OS 机制
>
> 阶梯压缩器可以类比操作系统的内存回收器，也就是 GC 与 Swap 的组合。Context Window 接近上限时，它应分级响应：先摘要早期对话、再删除冗余轮次、再把历史 Swap 到本地文件，避免 Agent 因 API 超限而彻底失忆。
