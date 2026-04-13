---
tags: [langgraph, checkpoint, memory-saver, state-snapshot, human-in-the-loop, time-travel, langgraph-studio, error-handling, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927457
---

# LangGraph State Control

LangGraph 的状态控制能力，包括检查点（Checkpoint）机制、状态快照（Snapshot）查看、时间旅行（Time Travel）回放、人机协同（Human-in-the-Loop）中断，以及 LangGraph Studio 可视化调试工具。

## Key Concepts

### 检查点（Checkpoint）

检查点在每个超步执行前后自动保存状态快照。启用方式：

```python
from langgraph.checkpoint.memory import MemorySaver
memory = MemorySaver()
graph = builder.compile(checkpointer=memory)
# 运行时必须指定 thread_id
config = {"configurable": {"thread_id": "session-abc"}}
graph.invoke(inputs, config)
```

持久化选项：`MemorySaver`（内存）、`SqliteSaver`（SQLite）、自定义 Redis/PostgreSQL。

### 状态快照（StateSnapshot）

`graph.get_state_history(config)` 返回倒序排列的快照列表。每个 `StateSnapshot` 包含：

| 字段 | 内容 |
|---|---|
| `config` | thread_id + checkpoint_id |
| `values` | 当前所有 state 变量的值 |
| `next` | 下一个待执行节点（元组） |
| `metadata.step` | 步骤编号 |
| `tasks` | 包含 task_id 和 error 信息 |

### 时间旅行（Time Travel）

通过 `checkpoint_id` 回到历史节点并重新执行：

```python
# 取出目标快照的 checkpoint_id
checkpoint_id = target_snapshot.config["configurable"]["checkpoint_id"]
replay_config = {"configurable": {"thread_id": tid, "checkpoint_id": checkpoint_id}}
graph.stream(target_snapshot.values, replay_config)
```

### 人机协同（Human-in-the-Loop）

在节点前后设置中断点，等待人工确认后继续：

```python
graph = builder.compile(
    checkpointer=memory,
    interrupt_before=["dangerous_action_node"]  # 执行该节点前暂停
)
```

暂停后人工修改状态再恢复：
```python
graph.update_state(config, {"confirmed": True})
graph.invoke(None, config)  # 从中断点继续
```

### 主备模型切换

在节点内用 try/except 实现：主模型失败（401/超时）→ 捕获异常 → 切换备用模型 → 记录告警。备用模型也失败时用规则兜底（预设响应）。

### LangGraph Studio

本地可视化调试工具：`langgraph dev` 启动服务后可查看工作流节点图、执行状态、单步调试。目前**只能查看不能编辑**，相当于 Dify 的只读版调试面板。

## Key Takeaways

- 检查点是实现多轮对话记忆、容错恢复、时间旅行的底层机制
- `thread_id` 标识会话（同一会话共享状态），`checkpoint_id` 标识某次执行的某个快照
- 快照列表**倒序排列**：`history[0]` 是最新状态，`history[-1]` 是初始空状态
- 人机协同 = 检查点 + `interrupt_before/after` + `update_state` + 继续执行
- LangGraph Studio 是调试工具而非设计工具，功能尚不完善（2024年）

## See Also

- [[langgraph-fundamentals]] — LangGraph 基础三要素
- [[langgraph-advanced-patterns]] — 条件边、子图、RAG 集成
- [[human-in-the-loop]] — 人机协同模式
- [[multi-agent-systems]] — 多 Agent 架构
