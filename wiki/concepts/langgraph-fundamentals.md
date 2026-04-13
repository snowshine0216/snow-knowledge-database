---
tags: [langgraph, state-graph, node, edge, state, workflow, multi-turn-dialogue, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927455
---

# LangGraph Fundamentals

LangGraph 是 LangChain 生态的企业级工作流编排框架，通过**节点（node）、边（edge）、状态（state）**三个核心抽象，支持循环、分支、状态持久化等复杂对话流程控制能力。

## Key Concepts

### 三大核心抽象

**节点（Node）**：封装业务逻辑的 Python 函数，接收 state 作为输入，返回对 state 的局部更新。可以包含大模型调用、工具调用、普通业务代码或子图。

**边（Edge）**：定义节点间的执行顺序和路由逻辑。分为普通边（固定路由）、条件边（动态路由）、入口边（指定起点）。

**状态（State）**：所有节点共享的字典结构，通过 `TypedDict` 或 Pydantic `BaseModel` 定义。每个字段可以配置 Reducer 函数控制更新策略（覆盖 or 追加）。

### 图的执行流程

```
定义 State → add_node → add_edge → compile() → invoke/stream
```

编译（`compile()`）是必须步骤，只有编译后的图才能运行。

### TypedDict vs LangChain DAG

LangChain 使用 DAG（有向无环图），不支持循环。LangGraph 使用 DCG（有向环图），原生支持循环，是实现 ReAct 等需要反复推理模式的基础。

## Key Takeaways

- LangGraph 适合**企业级复杂工作流**，LangChain 适合原型和简单链式调用
- 节点函数第一个参数**必须是 state**，返回值是对 state 的部分更新字典
- `add_messages` 是最常用的 Reducer，实现消息列表追加而非覆盖
- 条件边的路由函数返回字符串，通过映射字典对应到节点名称
- 并行执行：一个节点用多条普通边连接多个后续节点，这些节点会并行运行

## See Also

- [[langchain-overview]] — LangGraph 的底层 SDK
- [[langgraph-advanced-patterns]] — 条件边、Reducer、子图
- [[langgraph-state-control]] — 检查点、快照、人机协同
- [[rag-architecture]] — LangGraph 在 RAG 场景的应用
- [[react-agent-pattern]] — ReAct 模式
