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
| **控制反转（IoC）** | Go/Python 代码决定执行顺序 | 大模型实时推理决定任务路径，代码保留工具边界、预算、终止条件等运行时控制 |
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

本讲从软件架构演进视角，系统阐释了为什么传统 DAG/Chain 框架在工业生产环境中脆弱不堪——硬编码的逻辑无法应对动态异常，隐式状态机令调试维护极其困难。随着 Claude 3.5 Sonnet / GPT-4o 等强规划模型的出现，**驾驭工程（Harness Engineering）**应运而生：以"无限循环 + Middleware"替代 DAG，把**任务路径决策权**交还给模型，而代码保留工具边界、预算、压缩、审批与安全护栏。go-tiny-claw 的四层架构（入口交互 / 核心引擎 / 上下文工程 / 工具执行）是这一哲学的 Go 语言实现蓝图，贯穿整个专栏。

---

## Key Takeaways

- **Framework 的根本缺陷不是 API 封装不够好，而是"静态控制流"本身**：DAG 图无法在运行时动态响应错误，隐式状态机让死循环无法被外部干预，这是结构性问题而非配置问题。
- **Harness 的核心是控制反转（IoC）**：任务路径的决定权从 Go/Python 代码转移到大模型推理，但 runtime 仍牢牢掌握工具注册、Guardrails、Budget、Fallback、Termination 等边界控制。
- **Main Loop = 无限循环 + Middleware**，比 DAG 更可靠：这是计算机科学中最古老的结构——操作系统调度循环；Middleware 是唯一的安全关卡，集中防止危险操作和 Token 爆炸。
- **Harness 不是"无约束自治"**：模型负责决定“下一步做什么”，代码负责决定“最多能做什么、失败后怎么收场、何时必须停下来”。目标不是绝不失控，而是让错误可观测、可中断、可恢复。
- **状态透明原则**：Harness 只依赖一个数据结构——累加的 Context 消息列表；进度持久化到 `TODO.md` 文件，而非内部变量，崩溃重启后状态可完整恢复。
- **Context 压缩 = OS 的内存管理**：当 Token 水位接近 128k 上限时，阶梯压缩器触发（摘要 → 删除冗余 → Swap 到磁盘），防止因 API 超限导致 Agent 完全失忆崩溃。
- **go-tiny-claw 目录结构遵循 Standard Go Project Layout**：`internal/engine`（心脏）、`internal/provider`（大脑接口）、`internal/context`（内存）、`internal/tools`（手脚），高内聚低耦合，每层职责单一。

---

## Deep Dive

> [!info]+ 💡 Explanation - 控制反转不是“放权”，而是重新分配控制权
>
> ### 1. 什么是控制反转（IoC）
>
> 一句话：从“代码主动编排业务流程”变成“代码提供规则、能力和边界，由外部调度者决定执行顺序”。
>
> 在 Harness 出现之前，IoC 早已是软件工程里的经典思想，常见于：
>
> - **Web 框架**：请求何时进入 Handler，由框架而不是业务代码决定。
> - **GUI / 事件系统**：按钮点击、消息回调的触发时机由事件循环控制。
> - **依赖注入（DI）容器**：对象不再自己 `new` 依赖，而由容器负责装配。
> - **插件 / Middleware / Hook 体系**：主程序暴露扩展点，由运行时统一调用注册模块。
>
> 所以 IoC 并不是 Harness 发明的新概念。Harness 的新意在于：接管“下一步干什么”的不再是框架内部状态机，而是大模型的**实时推理**。
>
> ### 2. 为什么传统 IoC 往往是好事，但早期 Agent Framework 容易演变成隐式状态机灾难
>
> 传统 IoC 管理的是**有限、可预测的生命周期**：请求到了就进 Handler，按钮点了就触发回调，事务开始后就进入提交或回滚。这些流程稳定、边界清晰，框架比业务代码更适合统一管理。
>
> 早期 Agent Framework 处理的却是**开放世界任务**：故障排查、搜索、研究、代码修改、跨工具协作。这样的任务路径不是预定义的，错误类型也不是有限集合，执行中经常要边看结果边改计划。
>
> 问题不在于用了 IoC，而在于把“本该由智能体实时判断的任务决策”提前固化进了 DAG / Chain / 隐式状态机：
>
> - **静态图不擅长动态修正**：某个节点超时、返回异常 JSON、权限不足时，固定边很难优雅改道。
> - **隐藏规则太多**：重试、回退、终止、跳转往往被埋在框架内部，人只看到表面的 Node / Edge。
> - **人难以介入**：一旦陷入循环，开发者很难从外部精确判断系统到底卡在了哪条隐藏状态转移上。
>
> 这就是为什么传统软件里的 IoC 常常提升工程质量，但放到早期 Agent Framework 里却容易降低透明度和可控性。
>
> ### 3. Harness 并不是撤掉控制，而是把控制拆成两层
>
> Harness 的核心不是“让模型随便干”，而是把不同类型的控制权分层：
>
> - **模型负责任务决策**：根据当前 Context 和工具列表，决定下一步是搜索、读文件、执行 bash，还是回头重规划。
> - **Runtime 负责边界控制**：决定哪些工具存在、哪些参数非法、预算何时耗尽、什么时候要审批、失败后如何重试或回退、何时必须终止。
>
> #### 具体分层图
>
> ```text
>                         用户目标 / 人类输入
>                                  │
> ┌────────────────────────────────────────────────────────────┐
> │ Layer 1. Policy & Runtime Boundary                        │
> │ Human approval / budget / termination / audit policy      │
> │ 决定：系统何时暂停、何时中断、何时升级人工                 │
> ├────────────────────────────────────────────────────────────┤
> │ Layer 2. Model Decision Layer                             │
> │ 基于 Context + Tools 推理“下一步做什么”                   │
> │ 决定：是否搜索、是否读文件、是否调用 bash、是否重规划      │
> ├────────────────────────────────────────────────────────────┤
> │ Layer 3. Harness Control Layer                            │
> │ Middleware / guardrails / fallback / compactor / memory   │
> │ 决定：哪些动作允许发生、失败后如何恢复、上下文如何压缩     │
> ├────────────────────────────────────────────────────────────┤
> │ Layer 4. Tool Execution Layer                             │
> │ read / write / edit / bash / search / API                 │
> │ 产生：文件修改、命令执行、网络请求等真实副作用             │
> ├────────────────────────────────────────────────────────────┤
> │ Layer 5. External World                                   │
> │ repo / filesystem / network / third-party services        │
> └────────────────────────────────────────────────────────────┘
> ```
>
> 读图方式：
>
> - 越往上越接近“意图与决策”，越往下越接近“执行与副作用”。
> - **模型只拥有 Layer 2 的任务决策权**。
> - **Runtime 永远保留 Layer 1 / Layer 3 的边界控制权**。
> - 工具和外部世界是副作用发生地，不应把最终控制权下放到这一层。
>
> ### 4. Guardrails 与 Fallback 的真实作用
>
> `guardrails` 解决的是“**这件事能不能做**”：例如禁止删除关键目录、限制危险命令、在高风险工具前要求人工审批。
>
> `fallback` 解决的是“**这一步失败后怎么办**”：例如超时重试、切换备用 Provider、解析失败后降级、计划失败后回退并重规划。
>
> 但真正让 Harness 不至于失控的，不只是这两个词，而是以下几层同时存在：
>
> - **有限 action space**：模型只能使用你注册过的工具和参数。
> - **预算约束**：step budget / time budget / token budget / tool-call budget。
> - **显式状态**：计划、上下文、记忆写到 Context 或文件系统里，人能看见系统在做什么。
> - **中断与终止机制**：超预算、异常循环、策略命中时，runtime 可以强制停机。
> - **Human-in-the-loop**：高风险动作必须经过人类确认。
>
> 因此，工程目标不是“绝不失控”，而是把错误从“隐蔽、不可恢复、破坏性强”转化为“**可观测、可中断、可恢复、损失可控**”。

---

## Interview Follow-up

> [!question]- 📋 面试题 (Interview Follow-up)
>
> **题目 1：** 什么是控制反转（IoC）？请先给出一句话定义，再分别举出 Harness 出现之前的两个典型软件工程场景。
>
> **题目 2：** 为什么传统软件里的 IoC 往往提升工程质量，但早期 Agent Framework 的 IoC 容易演变成“隐式状态机灾难”？
>
> **题目 3：** 在 Harness 中，模型真正控制的是什么？Runtime / 代码必须保留的控制权又有哪些？请结合分层图回答。
>
> **题目 4：** `guardrails` 和 `fallback` 分别解决什么问题？为什么只提这两个词还不足以完整解释 Harness 的稳定性来源？
>
> **题目 5：** 为什么说 Harness 的目标不是“保证绝不失控”，而是“让错误可观测、可中断、可恢复”？请给出一个具体例子。

> [!example]- 💡 答案指南 (Answer Guide)
>
> **题目 1 - 引导答案思路：**
>
> IoC 的一句话定义是：代码不再主动写死执行顺序，而是提供规则和能力，由外部调度者决定何时调用、按什么顺序调用。Harness 之前的典型例子包括：Web 框架接管请求生命周期、GUI 事件循环触发回调、DI 容器负责依赖装配、插件 / Middleware 体系统一调用扩展点。
>
> ---
>
> **题目 2 - 引导答案思路：**
>
> 传统 IoC 管理的是有限、稳定、可预测的生命周期，所以框架统一调度通常更可靠。早期 Agent Framework 处理的却是开放世界任务，路径必须动态修正，错误也不是有限集合。把这类任务固化进 DAG / Chain / 隐式状态机，就会产生大量隐藏规则：何时重试、何时跳转、何时终止都埋在框架内部，最后人只看到节点图，却看不见真实控制流。
>
> ---
>
> **题目 3 - 引导答案思路：**
>
> 模型真正控制的是 **Layer 2 的任务决策权**：基于当前 Context 决定下一步该搜索、读文件、执行工具还是重新规划。Runtime 必须保留的则是边界控制权：工具注册、参数约束、预算、Guardrails、Fallback、Context 压缩、审批、终止条件。这就是“模型决定怎么走，代码决定最多能走到哪”。
>
> ---
>
> **题目 4 - 引导答案思路：**
>
> `guardrails` 解决“能不能做危险动作”，`fallback` 解决“这一步失败后怎么办”。但完整稳定性还依赖有限 action space、预算约束、显式状态、强制中断机制和 Human-in-the-loop。只有 Guardrails 和 Fallback，没有预算和终止条件，系统仍可能在安全边界内空转。
>
> ---
>
> **题目 5 - 引导答案思路：**
>
> 工程上几乎不可能保证 Agent 永不出错，因此更现实的目标是：出错时能被及时发现、能被人打断、能保留状态并恢复。比如模型连续三次调用同一个搜索工具都失败，runtime 不该继续无限循环，而应触发超步数终止、保存当前 Context / TODO、请求人工介入。这就把“失控”变成了可审计、可恢复的异常流程。

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
> 控制反转指任务路径的执行顺序不再由 Go/Python 代码写死，而是主要交由大模型实时推理和规划；但 runtime 仍保留工具注册、Guardrails、Budget、Fallback、Termination 等边界控制。代码的角色因此从“业务逻辑编排者”收缩成“运行时环境与物理定律提供者”，向模型暴露文件读写、bash 执行、沙箱等原子能力。
>
> #### Q3 — 阶梯压缩器对应的 OS 机制
>
> 阶梯压缩器可以类比操作系统的内存回收器，也就是 GC 与 Swap 的组合。Context Window 接近上限时，它应分级响应：先摘要早期对话、再删除冗余轮次、再把历史 Swap 到本地文件，避免 Agent 因 API 超限而彻底失忆。
