---
tags: [langgraph, checkpoint, memory-saver, human-in-the-loop, state-snapshot, langgraph-studio, error-handling, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927457
wiki: wiki/concepts/langgraph-state-control.md
---

# 041: 用LangGraph实现多轮对话流程控制（三）

**Source:** [10用LangGraph实现多轮对话流程控制3](https://u.geekbang.org/lesson/818?article=927457)

## Outline
- [状态快照（Snapshot）机制](#状态快照snapshot机制)
- [使用 MemorySaver 启用检查点](#使用-memorysaver-启用检查点)
- [快照的数据结构](#快照的数据结构)
- [时间旅行：回到任意历史节点](#时间旅行回到任意历史节点)
- [条件边增强：输入校验与重试](#条件边增强输入校验与重试)
- [Lambda 函数在路由中的应用](#lambda-函数在路由中的应用)
- [主备模型切换（错误处理）](#主备模型切换错误处理)
- [LangGraph Studio：可视化调试工具](#langgraph-studio可视化调试工具)
- [总结：LangGraph 的边角功能全景](#总结langgraph-的边角功能全景)
- [Connections](#connections)

---

## 状态快照（Snapshot）机制

LangGraph 通过**检查点（Checkpoint）**机制记录图执行过程中每个超步的状态快照，具备以下能力：

- **状态观测**：查看工作流执行到哪个阶段，每个节点的变量值
- **时间旅行（Time Travel）**：回到任意历史状态重新执行
- **容错（Fault Tolerance）**：从失败节点的前置状态重新开始
- **人机协同（Human-in-the-Loop）**：在特定节点暂停，等待人工干预后继续

快照机制主要用于：
1. 开发调试阶段的工作流监控
2. 构建类 Dify 的开发工具（让用户查看工作流状态）

---

## 使用 MemorySaver 启用检查点

```python
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    step_count: int

def node1(state: AgentState) -> dict:
    print("执行 Node1")
    return {"step_count": state.get("step_count", 0) + 1,
            "messages": [("assistant", "Hello from Node1")]}

def node2(state: AgentState) -> dict:
    print("执行 Node2")
    return {"messages": [("assistant", "Hello from Node2")]}

# 构建图
builder = StateGraph(AgentState)
builder.add_node(node1)
builder.add_node(node2)
builder.add_edge(START, "node1")
builder.add_edge("node1", "node2")
builder.add_edge("node2", END)

# 初始化 MemorySaver 并编译（启用检查点）
memory = MemorySaver()
graph = builder.compile(checkpointer=memory)

# 运行（必须指定 thread_id）
config = {"configurable": {"thread_id": "123"}}
result = graph.invoke({"messages": [("user", "开始")]}, config)
```

---

## 快照的数据结构

调用 `graph.get_state_history(config)` 可查看所有历史快照（**按时间倒序排列**，最新的在最前）：

```python
history = list(graph.get_state_history(config))

# 每个快照（StateSnapshot）包含：
# snapshot.config         → 检查点配置（含 thread_id 和 checkpoint_id）
# snapshot.values         → 当前状态变量的值（如 messages, step_count）
# snapshot.next           → 下一个要执行的节点名称（元组）
# snapshot.metadata       → 元数据
#   .step                 → 当前步骤编号
#   .created_at           → 创建时间戳
# snapshot.tasks          → 包含下一个要运行任务的元组（含 task_id 和 error 字段）
```

快照顺序说明：
```
history[0]  → 最新状态（执行完成后）
history[1]  → node2 执行前
history[2]  → node1 执行前
history[-1] → 初始状态（空）
```

查看每个检查点的 ID：
- **thread_id**：整个会话的 ID，每次运行相同
- **checkpoint_id**：每个快照唯一，不同快照不同

---

## 时间旅行：回到任意历史节点

```python
# 1. 获取目标快照（例如回到 node1 执行前的状态）
target_snapshot = history[2]  # node1 执行前的快照

# 2. 提取 thread_id 和 checkpoint_id
thread_id = target_snapshot.config["configurable"]["thread_id"]
checkpoint_id = target_snapshot.config["configurable"]["checkpoint_id"]

# 3. 构造回放配置
replay_config = {
    "configurable": {
        "thread_id": thread_id,
        "checkpoint_id": checkpoint_id,
    }
}

# 4. 获取该快照的状态
snapshot_state = graph.get_state(replay_config)

# 5. 从该快照状态继续执行（相当于"重放"）
for event in graph.stream(snapshot_state.values, replay_config):
    print(event)
```

**典型应用场景**：
- 调试：发现问题后回到问题前的节点重新尝试
- 测试不同分支：保存某个节点前的状态，分别测试两条路径
- 容错恢复：节点执行失败后从安全的检查点重新开始

---

## 条件边增强：输入校验与重试

利用条件边可以实现输入合法性校验和自动重试逻辑：

```python
import re
from typing import TypedDict, Annotated

class OrderState(TypedDict):
    order_id: str
    retry_count: Annotated[int, lambda x, y: x + y]  # 自动累加
    result: str

def is_valid_order_id(order_id: str) -> bool:
    """校验订单号格式：10-12位数字"""
    return bool(re.match(r"^\d{10,12}$", order_id))

def validate_input(state: OrderState) -> dict:
    """校验节点"""
    return {}  # 不修改状态，只触发路由

def handle_valid(state: OrderState) -> dict:
    """合法订单处理"""
    return {"result": f"订单 {state['order_id']} 处理成功"}

def handle_invalid(state: OrderState) -> dict:
    """非法订单处理：重试计数"""
    return {"retry_count": 1}  # 使用累加 reducer，每次 +1

# 路由函数
def route_validation(state: OrderState) -> str:
    if is_valid_order_id(state["order_id"]):
        return "valid"
    elif state.get("retry_count", 0) > 2:
        return "end"
    return "invalid"

# 构建图
builder = StateGraph(OrderState)
builder.add_node(validate_input)
builder.add_node(handle_valid)
builder.add_node(handle_invalid)

builder.add_edge(START, "validate_input")
builder.add_conditional_edges(
    "validate_input",
    route_validation,
    {"valid": "handle_valid", "invalid": "handle_invalid", "end": END}
)
builder.add_edge("handle_invalid", "validate_input")  # 循环重试
builder.add_edge("handle_valid", END)
```

---

## Lambda 函数在路由中的应用

当路由逻辑极简时，可以用 lambda 代替完整的函数定义：

```python
# 传统写法
def route(state: State) -> str:
    if state["step"] < 2:
        return "receive_input"
    return END

# Lambda 写法（等价）
route = lambda state: "receive_input" if state["step"] < 2 else END

# 直接内联到 add_conditional_edges
builder.add_conditional_edges(
    "process",
    lambda state: "receive_input" if state["step"] < 2 else END,
)
```

Lambda 函数适用于：
- 单一布尔判断的路由
- 不需要复用的一次性路由逻辑
- 代码可读性不受影响的简单情况

---

## 主备模型切换（错误处理）

在节点内部使用 try/except 实现主备模型降级：

```python
from langchain_openai import ChatOpenAI

# 主模型（设置较短超时或错误 key 来模拟故障）
primary_llm = ChatOpenAI(model="gpt-4", api_key="wrong-key")
# 备用模型
fallback_llm = ChatOpenAI(model="gpt-3.5-turbo")

def llm_node(state: State) -> dict:
    """带主备切换的 LLM 节点"""
    messages = state["messages"]
    
    try:
        # 尝试主模型
        response = primary_llm.invoke(messages)
        print(f"使用主模型: {primary_llm.model_name}")
    except Exception as e:
        # 主模型失败，切换备用模型
        print(f"主模型失败 ({e.name})，切换备用模型")
        # TODO: 发送告警通知
        response = fallback_llm.invoke(messages)
        print(f"使用备用模型: {fallback_llm.model_name}")
    
    return {"messages": [response]}
```

**降级策略建议**：
1. 主模型 → 备用模型（通过 try/except）
2. 备用模型也失败 → 使用规则匹配兜底（预设响应）
3. 生产环境必须配置降级告警

---

## LangGraph Studio：可视化调试工具

LangGraph Studio 是 LangChain 官方提供的可视化调试工具（目前功能尚不完善）：

### 安装与初始化

```bash
# 安装 LangGraph CLI
pip install langgraph-cli

# 创建项目模板
langgraph new my-agent --template react-agent
```

### 项目结构

```
my-agent/
├── src/
│   └── graph.py       # 图定义（StateGraph）
├── tests/
│   ├── unit/          # 单元测试
│   └── integration/   # 集成测试
└── langgraph.json     # 配置文件
```

### 启动调试服务

```bash
cd my-agent
langgraph dev  # 启动本地调试服务，自动打开浏览器
```

### 当前能力与限制

| 能力 | 是否支持 |
|---|---|
| 查看工作流结构（图形化节点/边） | ✅ |
| 单步调试（逐节点执行） | ✅ |
| 查看每个节点的输入/输出 | ✅ |
| 可视化编辑工作流 | ❌（只能查看，不能修改） |
| 添加新节点/边 | ❌ |

**结论**：LangGraph Studio 目前是调试和监控工具，不是设计工具。适合开发阶段排查问题，生产环境建议配合 LangSmith 使用。

---

## 总结：LangGraph 的边角功能全景

三讲内容覆盖的完整知识图谱：

| 功能 | 关键 API | 讲次 |
|---|---|---|
| 基础图构建 | `StateGraph`, `add_node`, `add_edge`, `compile` | 039 |
| 状态定义 | `TypedDict`, `Annotated`, `add_messages` | 039/040 |
| 条件边 | `add_conditional_edges`, `set_conditional_entry_point` | 039/040 |
| Reducer 函数 | `add_messages`, `operator.add`, lambda | 040 |
| 子图 | `compile()` 作为节点 | 040 |
| 检查点基础 | `MemorySaver`, `thread_id` | 040 |
| 状态快照 | `get_state_history`, `StateSnapshot` | 041 |
| 时间旅行 | `checkpoint_id` + `invoke` | 041 |
| 输入校验与重试 | 条件边 + 循环边 | 041 |
| 主备模型切换 | try/except 在节点内 | 041 |
| LangGraph Studio | `langgraph dev` | 041 |

### 学习建议

按以下顺序从简到繁练习：

```
1. START → 单节点 → END
2. START → 节点A → 节点B → END
3. 添加条件边（分支）
4. 添加循环（回边）+ 重试计数
5. 添加检查点（MemorySaver）
6. 实现完整的 RAG + LangGraph 工作流
```

---

## Connections
- → [[langgraph-state-control]]
- → [[langgraph-fundamentals]]
- → [[langgraph-advanced-patterns]]
- → [[human-in-the-loop]]
