---
tags: [ai-agent, harness-engineering, agent-architecture, go, framework-vs-harness, react-loop, context-engineering, llm]
source: https://time.geekbang.org/column/article/967047
---

# 架构演进：从 Framework 到 Harness，Agent 到底需要怎样的底层支撑？

Tony Bai 在《AI Agent工程化训练营》第一讲中，从软件架构演进视角系统拆解了传统 DAG/Chain 框架的致命缺陷，提出 **Harness Engineering（驾驭工程）**作为工业级 Agent 的底层范式，并以 go-tiny-claw 项目为实战载体，绘制出四层架构蓝图。

## Key Concepts

- **传统 Framework 的架构陷阱**：早期框架（LangChain、AutoGen）用**硬编码 DAG 图**定义业务逻辑——为"报错分析 + 搜索修复"任务，必须手写 `ErrorAnalyzerNode → WebSearchNode → Edge`。缺陷是双重的：① DAG 无弹性回退，NodeA 遇到网络超时直接抛异常崩溃；② 底层隐式状态机人类无法阅读，死循环无法外部干预。

- **控制反转（IoC）**：Harness 的核心转变。Claude 3.5 Sonnet / GPT-4o 等模型已经是**自主规划 CPU**，不需要代码告诉它"先 A 再 B"。代码只负责提供"物理定律"（文件读写、bash 执行、沙箱），任务走向完全由模型实时推理决定。

- **Main Loop 替代 DAG**：Harness 抛弃状态图，回归最古老可靠的结构：**无限循环（Main Loop）+ 事件驱动拦截器（Middleware）**。循环只依赖一个数据结构——不断累加的 Context 消息列表，没有任何隐式节点变量，状态完全透明。

- **Middleware = 安全防线前移**：既然模型自由规划，就可能犯错或发出危险命令。因此 Harness 的核心代码集中在：
  - `Middleware`：拦截危险操作，对接人工审批（Human-in-the-loop）
  - `Compactor`：类 OS 内存回收，Token 水位触发阶梯压缩

- **go-tiny-claw 四层架构**：
  1. **入口交互层** — CLI + 飞书集成 + 异步 Human-in-the-loop 回调
  2. **核心引擎层（心脏）** — ReAct Main Loop + 多模型适配器（Claude/OpenAI 兼容）+ Thinking 模块（强制慢思考）
  3. **上下文工程层（内存管理器）** — Prompt 动态组装器（读取 `AGENTS.md`）、Token 阶梯压缩器、运行时事件注入（防走神）、`TODO.md` 文件系统状态
  4. **工具执行层（四肢）** — 动态 `ToolRegistry` + 极简工具集（read/write/edit/bash）+ Middleware 安全门

- **文件系统即内存**：极简哲学的核心——进度不写内部变量，直接写本地 `TODO.md`；崩溃重启后状态完整恢复，无需额外持久化基础设施。

## Key Numbers / Quick Facts

| 事实 | 说明 |
|---|---|
| 4 层架构 | 入口交互 / 核心引擎 / 上下文工程 / 工具执行 |
| 128k Tokens | Context Window 压缩触发阈值（思考题参数）|
| 6 个 internal 包 | engine / provider / context / tools / memory / feishu |
| 1 个数据结构 | Main Loop 只依赖累加的 Context 消息列表 |

## Key Takeaways

- DAG 框架的失败是**结构性的**，不是 Prompt 问题——静态控制流无法应对真实世界的动态异常，隐式状态机让死循环无法被干预。
- Harness = 为大模型写微型 OS：大模型是 CPU，Context 是 RAM，Middleware 是内核安全层，Compactor 是内存回收器。
- 项目骨架遵循 Standard Go Project Layout，各层高内聚低耦合，`main.go` 的 4 条 TODO 注释就是整个专栏的航程图。

## See Also

- [[openclaw-architecture]]
- [[harness-engineering]]
- [[long-running-agent-harness]]
