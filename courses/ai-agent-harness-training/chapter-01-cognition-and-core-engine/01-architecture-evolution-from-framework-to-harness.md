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
![[file-20260504123027989.png|309]]

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
- **go-tiny-claw 的四层切分不是普通模块分层**：它实质上在隔离意图入口、任务决策、上下文治理和副作用执行，避免 Main Loop 直接与工具细节或记忆细节耦合。
- **Framework vs Harness 的本质差别是控制流形状**：前者是预先画好的静态图，后者是“感知状态 → 决策下一步 → 执行动作 → 回写状态”的动态闭环。
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
>
> ### 5. 为什么 go-tiny-claw 必须切成四层，而不是简单的“模型层 + 工具层”
>
> 表面看，Agent 好像只需要两部分：大模型负责思考，工具负责执行。但一旦进入真实工程，这种二分法很快失效，因为还存在两类独立复杂度：
>
> - **上下文治理复杂度**：Prompt 动态组装、Token 水位监控、记忆回写、事件提醒注入、压缩与 Swap。
> - **运行时控制复杂度**：风险拦截、审批、Fallback、预算、审计、异常终止。
>
> 如果把这些逻辑直接塞进 Main Loop，核心引擎会很快变成一个巨大 God Object；如果把它们塞进工具层，又会把本来应该独立治理的上下文工程与副作用执行混在一起。
>
> 所以 go-tiny-claw 的四层切法，本质上是在隔离四种不同责任：
>
> - **Entry & UI Layer**：负责接收世界的输入，也负责把系统状态暴露给人。
> - **Core Engine Layer**：只维护 ReAct 主循环，不承担具体工具细节。
> - **Context Engineering Layer**：专职做记忆、压缩、Prompt 组装和状态治理。
> - **Tool Execution Layer**：专职做能力暴露、风险拦截和真实副作用执行。
>
> #### 单轮请求如何穿过这四层
>
> ```text
> 用户问题 / 外部事件
>          ↓
> Entry & UI Layer
> (CLI / 飞书 / Human-in-the-loop)
>          ↓
> Core Engine Layer
> Main Loop 启动一次推理循环
>          ↓
> Context Engineering Layer
> - 读取 AGENTS.md / TODO / 记忆文件
> - 组装 system prompt + history + tools
> - 检查 token 水位，必要时压缩
>          ↓
> Provider 推理
> 模型产出：回答 or 工具调用意图
>          ↓
> Tool Execution Layer
> - Middleware 校验动作是否合法
> - 限制参数 / 命令 / 路径 / 风险级别
> - 失败时执行 retry / fallback / ask-human
>          ↓
> 真实工具执行
> read / edit / bash / search / API
>          ↓
> 执行结果回写 Context / Memory
>          ↓
> Main Loop 判断：继续下一步 or 终止
> ```
>
> 这个流转图说明了一个关键点：**四层不是部署层，而是责任层**。一次请求会在这些层之间往返流动，直到任务完成或被终止。
>
> ### 6. Framework vs Harness 控制流对照图
>
> ```text
> Framework / DAG / Hidden State Machine          Harness / Main Loop / Middleware
>
> 用户任务                                        用户任务
>   ↓                                             ↓
> Node A: Analyze                                 Main Loop 启动
>   ↓                                             ↓
> Node B: Search                                  Context + tools + memory
>   ↓                                             ↓
> Node C: Summarize                               模型决定下一步动作
>   ↓                                             ↓
> Node D: Write                                   Middleware 校验动作
>   ↓                                             ↓
> 完成                                            执行工具 / 生成回答
>
> 若 Node B 超时：                                若工具超时：
> - 框架内部状态机决定跳转                         - 结果回写 context
> - 可能重试，也可能直接报错                       - 模型可基于新状态重规划
> - 人通常看不见真实跳转规则                       - runtime 可 retry / fallback / terminate
> - 很容易变成黑盒                                - 人可观察并随时介入
> ```
>
> 这里最本质的区别不是“谁更先进”，而是**谁在运行时保有重规划能力**：
>
> - Framework 更像把任务提前翻译成一张流程图。
> - Harness 更像保持一个持续运行的操作系统循环，每一轮都重新根据当前状态做局部最优决策。
>
> 也正因为如此，Harness 对模型能力要求更高，但一旦模型具备足够强的规划能力，Harness 在复杂开放任务上的弹性通常明显优于静态图。
>
> ### 7. 为什么 Main Loop + Middleware 是 Harness 的最小稳定内核
>
> 如果说 DAG 的思路是“预先画出正常路径”，那 Main Loop 的思路就是“每一轮都先看当前状态，再决定下一步”。这使它天然更适合开放世界任务，因为系统不需要假设自己一开始就知道完整路径。
>
> 从工程角度看，Harness 可以不断扩展很多东西，但真正不可再删减的稳定内核只有两个：
>
> - **Main Loop**：负责维持 `观察状态 → 生成意图 → 执行动作 → 回写结果` 的循环。
> - **Middleware**：负责把所有危险性、合规性、预算性和失败恢复问题集中到一个统一入口。
>
> 这也是为什么 Middleware 在 Harness 里不是“附加装饰”，而是**系统唯一可信的 choke point**。只要动作最终要落到工具上，Middleware 就应该成为必经关口。
>
> #### 单轮 Main Loop 的最小闭环
>
> ```text
> 当前 Context / Memory
>          ↓
> 模型推理：下一步做什么？
>          ↓
> 产出回答 or 工具调用意图
>          ↓
> Middleware 检查
> - allow
> - rewrite / constrain
> - retry / fallback
> - ask human
> - terminate
>          ↓
> 工具执行 / 最终回答
>          ↓
> 结果回写 Context
>          ↺ 进入下一轮
> ```
>
> 这个结构看起来朴素，但恰恰因为它朴素，才有几个很难被 DAG 替代的优点：
>
> - **每轮都可观察**：系统当前知道什么、准备做什么，都会体现在 Context 和动作记录里。
> - **每轮都可干预**：人或策略都能在 Middleware 这一层插手，而不必修改整张业务图。
> - **每轮都可重规划**：失败并不必然意味着跳某条固定边，而是可以基于新状态重新思考。
>
> 换句话说，DAG 更像“预设路线”，而 Main Loop 更像“持续导航”。
>
> ### 8. 为什么“文件系统即内存”比隐藏进程内状态更适合长任务
>
> 文章里一句很重要的话是：**不使用内部变量存储进度，直接写本地 `TODO.md`。** 这背后不只是极简偏好，而是一种很强的工程取舍。
>
> 对长任务 Agent 来说，最可怕的不是某一步失败，而是**失败后系统失忆**。如果任务进度、计划、关键结论都只存在于进程内存里，一旦崩溃、重启、升级、上下文溢出，这些状态就很容易直接丢失。
>
> 把状态外显到文件系统后，会发生三个关键变化：
>
> - **可恢复**：进程挂掉后可以重新读取 `TODO.md`、checkpoint、摘要文件继续跑。
> - **可检查**：人可以直接打开文件看 Agent 当前计划和已完成步骤。
> - **可接管**：必要时人可以手动修改状态文件，帮助系统脱离坏局面。
>
> #### 隐藏内存状态 vs 文件系统状态
>
> ```text
> 方案 A：隐藏进程内状态
>
> in-memory variables / hidden state machine
>                 ↓
>         process crash / context overflow
>                 ↓
>              state lost
>
> 方案 B：文件系统即内存
>
> TODO.md / plan.md / checkpoint / summary files
>                 ↓
>         process crash / restart / upgrade
>                 ↓
>            reload from filesystem
>                 ↓
>              continue task
> ```
>
> 当然，这种设计也不是零代价。它会带来：
>
> - **一致性成本**：内存状态和文件状态必须保持同步。
> - **污染风险**：如果状态文件写得太噪，反而会把坏上下文再次喂回模型。
> - **治理要求**：需要明确哪些信息写文件、什么时候压缩、什么时候丢弃。
>
> 所以更准确地说，文件系统不是“万能记忆”，而是**最便于恢复和人类协作的外部状态载体**。这与 Harness 强调的状态透明原则是完全一致的。

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
>
> **题目 6：** 为什么 go-tiny-claw 不能只分成“模型层 + 工具层”？为什么 `Context Engineering` 必须被单独抽成一层？
>
> **题目 7：** 请按顺序描述一个用户请求如何穿过 go-tiny-claw 的四层架构，并解释工具执行结果为什么必须回写到 Context。
>
> **题目 8：** 结合控制流对照图，解释 Framework 和 Harness 在“工具超时 / 节点失败”场景下的恢复路径有什么本质差异。
>
> **题目 9：** 为什么说 `Main Loop + Middleware` 是 Harness 的最小稳定内核？如果少了其中一个，会分别失去什么能力？
>
> **题目 10：** 请描述一次 Main Loop 的最小闭环，并解释为什么它更像“持续导航”而不是“预设路线图”。
>
> **题目 11：** 为什么“文件系统即内存”比隐藏进程内状态更适合长任务 Agent？它带来了哪些好处，又引入了哪些工程代价？

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
>
> ---
>
> **题目 6 - 引导答案思路：**
>
> 因为除了“思考”和“执行”，Agent 还要处理一整套独立复杂度很高的上下文治理问题：Prompt 动态组装、记忆回写、Token 监控、压缩和 Swap。如果这些逻辑塞进模型层，Main Loop 会迅速膨胀成 God Object；如果塞进工具层，又会把上下文治理和副作用执行耦合在一起。因此 `Context Engineering` 必须独立成层。
>
> ---
>
> **题目 7 - 引导答案思路：**
>
> 请求先由 Entry & UI Layer 接收，再进入 Core Engine 的 Main Loop；随后 Context Engineering 层读取 AGENTS、记忆和历史消息，拼出本轮 Prompt，并检查 Token 水位；模型据此输出回答或工具调用意图；Tool Layer 通过 Middleware 做风险校验后执行真实工具；结果再回写到 Context / Memory，供下一轮推理使用。回写是必须的，因为 Harness 的状态核心就是“不断累加并被治理的 Context”。没有回写，模型下一轮就失去刚刚获得的新事实。
>
> ---
>
> **题目 8 - 引导答案思路：**
>
> Framework 的失败恢复通常依赖预先写死的节点跳转或框架内部状态机；失败后往哪走，往往由隐藏规则决定，人不容易观察和干预。Harness 则把失败结果显式写回 Context，让模型和 runtime 在下一轮重新基于当前状态做判断：可以重试、降级、回退、请求人工，或者直接终止。前者更像沿既定轨道找备用线，后者更像每一轮都重新导航。
>
> ---
>
> **题目 9 - 引导答案思路：**
>
> `Main Loop` 负责维持“看状态、做决策、执行动作、回写结果”的持续闭环；没有它，系统就退回成一次性流程或静态图。`Middleware` 负责把安全、预算、审批、Fallback 和终止机制集中到统一入口；没有它，模型虽然还能调用工具，但系统会失去统一的边界控制。两者一起才构成 Harness 的最小稳定内核。
>
> ---
>
> **题目 10 - 引导答案思路：**
>
> 一轮最小闭环是：读取当前 Context / Memory → 模型推理下一步 → 产出回答或工具调用意图 → Middleware 检查并决定放行、约束、重试、Fallback、审批或终止 → 执行工具 → 把结果写回 Context → 再进入下一轮。它像持续导航，是因为每一轮都基于最新状态重新做局部决策，而不是沿着预先画好的静态路线机械前进。
>
> ---
>
> **题目 11 - 引导答案思路：**
>
> 长任务最怕的是“崩溃后失忆”。把计划、摘要、检查点写入文件系统后，系统即使崩溃也能从 `TODO.md` 或 checkpoint 恢复，而且人能直接查看和修改这些状态，这是隐藏进程内状态做不到的。代价则包括状态同步成本、噪声污染风险，以及需要额外设计压缩和治理策略。它不是免费的，但换来的是可恢复性和可协作性。

---

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点

- [[harness-engineering|Harness Engineering]]：本讲总纲，作为 [[Framework vs Harness]] 这条主轴上的新范式
- 控制反转（Agent 场景）：任务路径交给模型，边界与终止条件保留在 [[runtime-boundary-control|Runtime Boundary Control]]
- [[main-loop-vs-dag|Main Loop]]：Harness 的持续导航器，与 [[react-paradigm|ReAct Loop]]、[[agentic-loop-self-correction|Agentic Loop]] 属同一类控制结构
- Middleware：所有风险控制、审批、预算与恢复逻辑的统一关口
- [[context-engineering|Context Engineering]]：负责 Prompt Assembly、Memory Persistence、[[context-compaction|Token Compactor]] 与上下文治理
- [[state-transparency|State Transparency]]：Harness 相比隐式状态机的核心优势之一
- [[filesystem-as-memory|Filesystem as Memory]]：把计划、摘要、检查点外显为可恢复状态
- [[runtime-boundary-control|Guardrails / Runtime Boundary Control]] 与 [[crash-recovery-in-agent-harness|Fallback / Recovery]]：分别对应“能不能做”和“失败后怎么办”
- go-tiny-claw：本讲用来承载架构蓝图的实现项目

### 2. 课程内导航链接

- [[02-main-loop-react-cycle|第 02 讲 Main Loop / ReAct 循环]]：把本讲提出的 [[Main Loop]] 进一步展开成逐轮执行机制
- [[03-thinking-stage-slow-reasoning|第 03 讲 Thinking Stage / Slow Reasoning]]：解释慢思考如何嵌入 Harness 的主循环
- [[04-provider-interface-claude-openai-adapter|第 04 讲 Provider Adapter]]：承接本讲的“大脑接口”抽象
- [[05-tool-registry-and-dispatch|第 05 讲 Tool Registry]]：对应四层架构中的工具执行层
- [[06-minimal-toolset-yolo-philosophy|第 06 讲 Minimal Toolset / YOLO]]：解释为什么工具层最终收敛为极简原语集合

### 3. 课程外与通用概念关联

- [[harness-engineering|Harness Engineering]]：可作为本讲的总索引概念卡片
- [[long-running-agent-harness|Long-Running Agent Harness]]：与本讲的长任务恢复、外部状态持久化直接关联
- [[openclaw-architecture|OpenClaw Architecture]]：理解 go-tiny-claw / OpenClaw 一类项目的总体形态
- [[llm-api-statelessness|LLM API Statelessness]]：解释为什么 Harness 必须显式重放 Context，并把状态外置到消息列表或文件系统
- [[react-paradigm|ReAct Paradigm]]：本讲 Main Loop 背后的通用认知框架
- [[agentic-loop-self-correction|Agentic Loop]]：与工具调用、自纠错、循环推进相关的上位概念
- [[human-in-the-loop|Human-in-the-Loop]]：与 [[yolo-execution-philosophy|YOLO Mode]] 形成部署风险上的对照轴

### 4. 推荐关系边（可直接扩成独立卡片）

- [[harness-engineering|Harness Engineering]] → replaces → DAG-based Framework
- [[harness-engineering|Harness Engineering]] → centers-on → [[runtime-boundary-control|Runtime Boundary Control]]
- [[harness-engineering|Harness Engineering]] → emphasizes → [[state-transparency|State Transparency]]
- 控制反转（Agent 场景） → shifts-control-from → 静态控制流
- 控制反转（Agent 场景） → shifts-control-to → 模型规划
- [[main-loop-vs-dag|Main Loop]] → protected-by → Middleware
- Middleware → enforces → [[runtime-boundary-control|Guardrails]]
- Middleware → triggers → [[crash-recovery-in-agent-harness|Fallback]]
- [[context-engineering|Context Engineering]] → manages → Context Window
- [[context-engineering|Context Engineering]] → includes → [[context-compaction|Token Compactor]]
- [[filesystem-as-memory|Filesystem as Memory]] → enables → [[crash-recovery-in-agent-harness|Crash Recovery]]
- go-tiny-claw → composed-of → Entry & UI Layer, Core Engine Layer, [[context-engineering|Context Engineering]], Tool Execution Layer
- go-tiny-claw → inspired-by → [[openclaw-architecture|OpenClaw Architecture]]

### 5. 后续值得沉淀成卡片的主题

- [[runtime-boundary-control|Runtime Boundary Control]]
- [[state-transparency|State Transparency]]
- [[filesystem-as-memory|Filesystem as Memory]]
- [[main-loop-vs-dag|Main Loop vs DAG]]
- [[crash-recovery-in-agent-harness|Crash Recovery in Agent Harness]]
- [[context-compaction|Context Compression Strategy]]

---

## Notes For Review

- 思考题：Context Window 接近 128k Tokens 时，go-tiny-claw 应采用哪些类 OS 策略？（文章提出问题，下一讲回答）
  - 候选策略：优先 Swap 早期对话到文件 → 摘要中间段 → 保留最近 N 轮 + System Prompt → OOM 时优雅终止并保存检查点
- 飞书集成的 Human-in-the-loop 异步回调机制（入口交互层）将在后续讲次实现，需关注回调超时处理
- Thinking 模块（强制慢思考）与 provider 层的关系待后续讲次细化

## One-Minute Recap

> [!info]+ 💡 Explanation - 一分钟速记框架
>
> 如果要用最短的话把这一讲讲给别人听，可以按下面这 6 句来复述：
>
> 1. **Framework 时代的问题不只是工具不够多，而是控制流被写死成了静态图。**
> 2. **Harness 的变化不是取消控制，而是把任务决策权交给模型，把边界控制权留给 runtime。**
> 3. **Main Loop 是持续导航器：每一轮都根据最新状态重新决定下一步。**
> 4. **Middleware 是唯一可信的关口：风险、预算、审批、Fallback 都必须在这里收口。**
> 5. **Context Engineering 是内存管理器：负责 Prompt 组装、记忆回写、压缩和状态治理。**
> 6. **文件系统即内存是为了抗失忆：崩溃后还能从 `TODO.md`、checkpoint、summary 继续任务。**

---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 解释传统 DAG/Chain 框架为什么无法应对真实生产环境的动态异常？举出具体失败场景。
2. 什么是 Harness 中的"控制反转（IoC）"？它与 Harness 出现之前在 Web 框架 / DI / 事件系统中的 IoC 有什么连续性，又有什么关键差别？
3. 为什么传统软件里的 IoC 往往提升工程质量，但早期 Agent Framework 的 IoC 却容易演变成隐式状态机灾难？
4. 按顺序描述一个用户请求如何穿过 go-tiny-claw 的四层架构，并说明每层各自负责什么。
5. 结合控制流对照图，解释 Framework 与 Harness 在“工具超时 / 节点失败”时的恢复路径有什么本质差异。
6. 为什么说 `Main Loop + Middleware` 是 Harness 的最小稳定内核？如果少了其中一个，各会丢掉什么能力？
7. 为什么“文件系统即内存”比隐藏进程内状态更适合长任务 Agent？它带来了哪些收益，又引入了哪些代价？
8. go-tiny-claw 的“阶梯压缩器”类比 OS 的哪个机制？当 Context Window 接近上限时，它应该按什么顺序响应？

> [!example]- 💡 答案指南 (Answer Guide)
>
> #### Q1 — 为什么 DAG/Chain 难以应对动态异常
>
> DAG 图的逻辑是硬编码的。若 NodeA 执行时遇到网络超时或意外 JSON 格式，框架往往没有弹性回退机制，只能直接抛异常崩溃；而底层隐式状态机一旦进入死循环，开发者也很难从外部插手干预。
>
> #### Q2 — Harness 中的控制反转
>
> Harness 里的控制反转，仍然延续了传统软件工程里的 IoC 思想：代码提供规则和能力，由外部调度者决定执行顺序。连续性在于它和 Web 框架、DI 容器、事件系统一样，都是把调用时机从业务代码手里拿走；关键差别在于 Harness 里接管“下一步做什么”的不再是固定框架生命周期，而是大模型的实时推理。与此同时，runtime 仍保留工具注册、Guardrails、Budget、Fallback、Termination 等边界控制。
>
> #### Q3 — 为什么早期 Agent Framework 的 IoC 容易失控
>
> 因为传统 IoC 管理的是有限、可预测的生命周期，而早期 Agent Framework 处理的却是开放世界任务。把这类任务固化进 DAG / Chain / 隐式状态机后，重试、回退、终止、跳转都会被埋进框架内部，人只能看到节点图，看不见真实控制流；一旦任务偏离预设路径，系统就容易卡死、黑盒化、难以人工介入。
>
> #### Q4 — 四层架构的请求流转
>
> 请求先从 Entry & UI Layer 进入系统；Core Engine Layer 启动 Main Loop；Context Engineering Layer 读取 AGENTS、历史、记忆和状态文件，拼出本轮 Prompt，并检查 Token 水位；模型产生回答或工具调用意图后，Tool Execution Layer 通过 Middleware 做风险校验与动作约束，再执行真实工具；执行结果最终回写 Context / Memory，供下一轮循环使用。
>
> #### Q5 — Framework 与 Harness 的失败恢复差异
>
> Framework 的恢复路径通常依赖预先写死的节点跳转或隐藏状态机，因此失败后往哪走，多半由内部规则决定。Harness 则把失败结果显式写回 Context，让模型与 runtime 在下一轮重新决定：重试、Fallback、回退、请求人工或直接终止。前者像沿固定轨道找备用线，后者像拿着最新路况重新导航。
>
> #### Q6 — 为什么 Main Loop + Middleware 是最小稳定内核
>
> 没有 Main Loop，系统就无法形成“观察状态 → 决策下一步 → 执行动作 → 回写结果”的持续闭环，会退回一次性流程或静态图。没有 Middleware，工具调用虽然还存在，但风险控制、预算、审批、Fallback 和终止条件会分散到系统各处，最终失去统一边界。两者组合，才让 Harness 同时具备自主性和可控性。
>
> #### Q7 — 为什么文件系统即内存更适合长任务
>
> 因为长任务最怕的是进程崩溃或上下文溢出后直接失忆。把计划、摘要、检查点写到文件系统里后，系统可以在重启后继续读取这些状态，人也能直接查看或接管任务。收益是可恢复、可检查、可协作；代价是一致性维护成本、噪声污染风险，以及需要设计好压缩和治理策略。
>
> #### Q8 — 阶梯压缩器对应的 OS 机制
>
> 阶梯压缩器可以类比操作系统的内存回收器，也就是 GC 与 Swap 的组合。Context Window 接近上限时，它应分级响应：先摘要早期对话、再删除冗余轮次、再把历史 Swap 到本地文件，保留最近几轮高价值上下文和 System Prompt，必要时优雅终止并保存检查点，避免 Agent 因 API 超限而彻底失忆。
