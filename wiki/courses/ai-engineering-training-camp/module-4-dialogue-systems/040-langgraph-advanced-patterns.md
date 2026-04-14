---
tags: [langgraph, conditional-edge, reducer, subgraph, checkpoint, rag, workflow, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927456
---

# LangGraph Advanced Patterns

LangGraph 进阶模式，涵盖条件边路由、Reducer 更新策略、子图、检查点机制，以及 LangGraph 与 RAG 结合的完整工作流设计。

## Key Concepts

### Reducer 函数与更新策略

状态字段的更新行为由 Reducer 决定：

| Reducer | 行为 | 典型场景 |
|---|---|---|
| 无（默认） | 覆盖原值 | 单次更新的字段（问题、答案） |
| `add_messages` | 追加消息，支持按 id 更新 | 对话历史列表 |
| `operator.add` | 列表/字符串拼接 | 日志累积 |
| 自定义 lambda | 任意逻辑 | 计数器、累加步骤 |

### 条件边完整模式

```python
workflow.add_conditional_edges(
    "source_node",      # 触发节点
    routing_function,   # 返回字符串的路由函数
    {"key": "node_name"}  # 字符串 → 节点名 映射
)
```

入口条件边（意图识别的核心位置）：

```python
workflow.set_conditional_entry_point(routing_fn, mapping)
```

### 子图（多 Agent 架构基础）

子图是将已编译的 `StateGraph` 作为另一个图的节点使用。这是构建**多 Agent 系统**的核心机制，每个 Agent 是一个独立子图，主图负责调度协调。

### 超步（Super Step）执行模型

图执行遵循消息传递模型：节点完成工作后向邻居发消息，所有节点无消息可处理时图计算结束。每次"一轮消息处理"称为一个超步。

### LangGraph + RAG 工作流

典型 RAG 工作流节点：意图路由 → 文档检索 → 相关性评分 → 答案生成 → 质量评估 → 循环重试。条件边处理分支，Reducer 处理循环计数，回退到网络搜索的逻辑用条件边实现。

## Key Takeaways

- 条件边的路由函数接受 state 返回**字符串**，字符串通过映射字典找到目标节点
- 不声明 Reducer 时默认覆盖；`add_messages` 是多轮对话中 messages 字段的标准 Reducer
- LangGraph 节点函数编译后自动成为 `RunnableLambda`，支持异步和批处理
- 子图机制是多 Agent 设计的基础：每个 Agent 编译为子图，主图做调度
- 选型漏斗：Dify/Coze → 二次开发 → LangGraph 从头构建，越往下复杂度越高

## See Also

- [[langgraph-fundamentals]] — LangGraph 基础：三大核心概念
- [[langgraph-state-control]] — 检查点、快照、时间旅行
- [[rag-architecture]] — RAG 工作流
- [[react-agent-pattern]] — ReAct 模式
- [[multi-agent-systems]] — 多 Agent 系统设计
