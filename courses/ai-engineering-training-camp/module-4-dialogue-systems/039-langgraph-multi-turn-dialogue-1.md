---
tags: [langgraph, langchain, state-graph, multi-turn-dialogue, agent, workflow, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927455
wiki: wiki/concepts/langgraph-fundamentals.md
---

# 039: 用LangGraph实现多轮对话流程控制（一）

**Source:** [8用LangGraph实现多轮对话流程控制1](https://u.geekbang.org/lesson/818?article=927455)

## Outline
- [LangGraph 定位与生态](#langgraph-定位与生态)
- [为什么需要 LangGraph](#为什么需要-langgraph)
- [三大核心概念：节点、边、状态](#三大核心概念节点边状态)
- [LangGraph vs LangChain：DAG 与 DCG 的区别](#langgraph-vs-langchain-dag-与-dcg-的区别)
- [状态定义：TypedDict 与 Pydantic](#状态定义typeddict-与-pydantic)
- [节点的定义规范](#节点的定义规范)
- [边的类型](#边的类型)
- [Hello World：构建第一个 LangGraph 应用](#hello-world构建第一个-langgraph-应用)
- [Connections](#connections)

---

## LangGraph 定位与生态

LangGraph 是 LangChain 生态中位于 LangChain 之上的一层框架，专门用于：

- **多轮对话编排**：管理跨轮次的状态保持
- **复杂工作流**：支持循环、分支、条件跳转
- **企业级开发**：相比 LangChain 更适合生产环境

LangChain 生态层级：

```
LangSmith（监控/调试平台）
    ↑
LangGraph（工作流编排层）
    ↑
LangChain（基础 SDK 层）
```

LangSmith 是贯穿整个生态的监控与调试工具，但目前尚不成熟，处于"凑合能用"的阶段。

---

## 为什么需要 LangGraph

传统 LangChain 开发面临三大痛点：

1. **多轮对话**：从头组建对话逻辑，需要处理的事情太多
2. **状态管理**：上下文状态的持久化与共享复杂
3. **工作流复杂性**：稍微复杂的工作流代码量暴增，难以维护

LangGraph 将这三个问题统一纳入框架，通过节点（node）、边（edge）、状态（state）三个抽象统一解决。

---

## 三大核心概念：节点、边、状态

### 节点（Node）

节点是封装具体业务逻辑的 Python 函数（或可调用类）：

```python
def my_node(state: GraphState) -> dict:
    # 从状态中读取输入
    user_input = state["user_input"]
    # 执行逻辑（调用大模型、工具、业务代码等）
    result = llm.invoke(user_input)
    # 返回对状态的更新（不是替换整个状态）
    return {"output": result}
```

节点可以包含：
- 大模型调用
- 工具调用
- 普通业务逻辑
- 子图（subgraph）

**关键规范**：节点函数的**第一个参数必须是 state**，不可省略。

节点也可以用带 `__call__` 魔术方法的类来实现：

```python
class MyNode:
    def __call__(self, state: GraphState) -> dict:
        return {"output": "result"}
```

### 边（Edge）

边决定节点执行的顺序和路由逻辑：

| 边的类型 | 说明 |
|---|---|
| 普通边（normal edge） | 固定路由，A → B |
| 条件边（conditional edge） | 根据函数返回值动态路由 |
| 入口边（entry point） | 指定图的起始节点 |
| 条件入口边 | 在入口处即做分支判断 |

**并行执行**：当一个节点通过多条普通边连接多个后续节点时，这些节点会并行执行。

**环路（cycle）支持**：LangGraph 支持节点间构成循环，这是它与 Dify、Coze 等可视化工具的核心区别之一。

### 状态（State）

状态是所有节点共享的一组数据，以字典形式存在：

```python
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class GraphState(TypedDict):
    user_input: str          # 用户问题
    messages: Annotated[list, add_messages]  # 消息列表（追加模式）
    loop_step: int           # 循环计数
    answer: str              # 最终答案
```

状态的三种作用域：
- **共享（shared）**：所有节点都能读写（最常用）
- **私有（private）**：只有当前节点可见
- **内部（internal）**：类似私有，但 schema 有约束（较少使用）

---

## LangGraph vs LangChain：DAG 与 DCG 的区别

| 特性 | LangChain | LangGraph |
|---|---|---|
| 图结构 | DAG（有向无环图） | DCG（有向环图，支持循环） |
| 适用场景 | 原型开发、简单链式调用 | 企业级复杂工作流 |
| 状态管理 | 手动处理 | 内置状态图机制 |
| 复杂度 | 低 | 高（但更灵活） |

LangChain 的链式调用是从左到右的单向流动（DAG），不能回头。LangGraph 则允许节点之间形成环路，天然支持 ReAct 等需要循环推理的模式。

---

## 状态定义：TypedDict 与 Pydantic

LangGraph 支持两种状态定义方式：

### 方式一：TypedDict（推荐）

```python
from typing import TypedDict

class GraphState(TypedDict):
    question: str
    generation: str
    web_search: str
    documents: list[str]
```

简洁，类型约束在运行时会抛出 TypeError（TypeHint → TypeError）。

### 方式二：Pydantic BaseModel

```python
from pydantic import BaseModel

class GraphState(BaseModel):
    question: str
    generation: str = ""
    web_search: str = "No"
```

更严格的数据验证，但写法更复杂，适合需要严格数据校验的场景。

---

## 节点的定义规范

```python
# 标准节点函数签名
def web_search(state: GraphState) -> dict:
    """节点函数：执行网络搜索"""
    query = state["question"]                        # 从 state 读取
    docs = web_search_tool.invoke({"query": query})  # 执行工作
    return {"documents": state["documents"] + docs}  # 返回 state 更新
```

**注意**：`add_node` 传入的是函数对象（不加括号）：

```python
workflow.add_node(web_search)          # ✅ 传函数对象
workflow.add_node("search", web_search)  # ✅ 自定义节点名称
workflow.add_node(web_search())        # ❌ 错误！执行了函数
```

---

## 边的类型

### 普通边

```python
workflow.add_edge("web_search", "generate")  # websearch → generate
workflow.add_edge(START, "chatbot")           # 入口 → chatbot
```

### 条件边

```python
def route_question(state: GraphState) -> str:
    """路由函数：返回下一个节点名称"""
    if state["question_type"] == "rag":
        return "retrieve"
    return "web_search"

workflow.add_conditional_edges(
    "grade_documents",          # 触发节点
    decide_to_generate,         # 路由函数
    {
        "websearch": "web_search",   # 返回值 → 节点名称 的映射
        "generate": "generate",
    }
)
```

### 条件入口边

```python
workflow.set_conditional_entry_point(
    route_question,
    {
        "websearch": "web_search",
        "vectorstore": "retrieve",
    }
)
```

---

## Hello World：构建第一个 LangGraph 应用

完整示例：构建一个最基本的多轮对话机器人：

```python
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

# Step 1: 定义状态
class State(TypedDict):
    messages: Annotated[list, add_messages]  # 追加模式，保存对话历史

# Step 2: 创建图
graph_builder = StateGraph(State)

# Step 3: 定义节点
def chatbot(state: State) -> dict:
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

# Step 4: 添加节点
graph_builder.add_node(chatbot)  # 节点名自动取函数名 "chatbot"

# Step 5: 添加边
graph_builder.add_edge(START, "chatbot")  # 入口 → chatbot
# chatbot 没有添加后续边，默认到 END

# Step 6: 编译（必须编译后才能运行）
graph = graph_builder.compile()

# Step 7: 运行
for event in graph.stream({"messages": [("user", "你好！")]}):
    print(event)
```

**关键原则**：
1. 先定义状态 → 再添加节点 → 再添加边 → 最后编译
2. 编译（`compile()`）是运行的前提，不编译无法执行
3. 流式执行用 `graph.stream()`，返回每个超步（super step）的结果

---

## Connections
- → [[langgraph-fundamentals]]
- → [[langchain-overview]]
- → [[rag-architecture]]
