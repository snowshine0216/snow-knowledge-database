---
tags: [langgraph, pluggable-architecture, hot-reload, intent-recognition, dynamic-graph, node-registration, dialog-management]
source: https://u.geekbang.org/lesson/818?article=937026
---

# 可插拔意图识别与 LangGraph 动态图热更新

本文总结在 [[008-langchain-core-components|LangGraph]] 中实现运行时动态插入/删除节点（可插拔架构）的工程模式，核心是 `DynamicGraphManager` 封装 + 热编译机制。

## Key Concepts

### 静态图 vs 动态图

静态图（demo）：`compile()` 后节点和边完全固定，新增意图节点必须停服重启。动态图（demo2）：通过 `DynamicGraphManager` 封装，运行时注册节点、调整边、触发热编译，无需重启。

### DynamicGraphManager

将 LangGraph 图的构建和编译封装为类，提供三个核心操作：
- `register_node(name, func)`：注册新节点
- `remove_edges_from(node)`：清除指定节点的所有出边（插入新节点前必须调用）
- `_hot_compile()`：重建并编译图，使所有变更对新请求生效

### 热编译（Hot Compile）

`_hot_compile()` 重新实例化 `StateGraph`，重新注册所有节点和边，调用 `.compile(checkpointer=...)` 生成新的可执行图。之后到来的请求使用新图，已在处理中的请求使用旧图（无感切换）。

### 并发安全性

LangGraph 底层模拟线程模型，每个 `thread_id` 对应独立执行上下文。`_hot_compile()` 只替换 `self.app` 引用，不中断进行中的请求，不会出现"思考到一半被截断"的情况。编译期间可能有短暂处理延迟。

### 边的清理原则

插入中间节点时，必须先删除上游节点的出边，再添加新路径：

```
删除前：input → chatbot
操作：remove_edges_from("input")
      add_edge("input", "promotion")
      add_edge("promotion", "chatbot")
删除后：input → promotion → chatbot
```

## Key Takeaways

- **注册 ≠ 生效**：调用 `register_node()` 后，必须调用 `_hot_compile()` 才能使新节点对新请求生效
- **插入前清边**：新增中间节点前，调用 `remove_edges_from()` 删除原有出边，避免图结构出现游离节点
- **热编译是安全的**：LangGraph 的线程隔离模型保证在途请求不受热编译影响
- **动态图的核心价值**：按租户/会员级别/业务事件动态开启功能节点，无停机上线

## See Also

- [[043-multi-turn-order-service]] — 本实践的基础，静态版本的多轮对话客服
- [[042-tool-calling-engine-hot-reload]] — 工具级别的热更新（importlib + WatchDog），与本文图级别的热更新互补
- [[008-langchain-core-components]] — LangGraph 状态图基础
