---
tags: [langgraph, state-graph, conditional-edge, reducer, rag, workflow, ai-engineering, multi-turn-dialogue]
source: https://u.geekbang.org/lesson/818?article=927456
wiki: wiki/concepts/langgraph-advanced-patterns.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. LangGraph 的"超步（Super Step）"执行模型是什么概念？你认为图中的节点是如何被激活和停止的？
2. 在状态管理中，"Reducer 函数"的作用是什么？如果没有 Reducer，多次更新同一字段会发生什么？
3. 条件边（Conditional Edge）与普通边有什么区别？在多轮对话或 RAG 工作流中，它通常用来解决什么问题？

---

# 040: 用LangGraph实现多轮对话流程控制（二）

**Source:** [9用LangGraph实现多轮对话流程控制2](https://u.geekbang.org/lesson/818?article=927456)

## Outline
- [图的执行机制：超步（Super Step）](#图的执行机制超步-super-step)
- [状态深入：Schema 与 Reducer 函数](#状态深入schema-与-reducer-函数)
- [Reducer 的两种模式：覆盖 vs 追加](#reducer-的两种模式覆盖-vs-追加)
- [节点定义进阶](#节点定义进阶)
- [条件边的完整用法](#条件边的完整用法)
- [子图（Subgraph）](#子图subgraph)
- [检查点（Checkpoint）基础介绍](#检查点checkpoint-基础介绍)
- [综合实战：LangGraph + RAG 完整示例](#综合实战langgraph--rag-完整示例)
- [LangGraph vs LangChain vs Dify/Coze 选择策略](#langgraph-vs-langchain-vs-difycoze-选择策略)
- [Connections](#connections)

---

## 图的执行机制：超步（Super Step）

LangGraph 的执行遵循**超步（Super Step）**模型，整个生命周期分为七个阶段：

1. **图编译** → 所有节点处于 Inactive 状态
2. **调用入口** → 从 START 节点开始
3. **节点激活** → START 执行完毕，向邻居节点发消息
4. **chatbot 激活** → 接收消息，完成工作，继续向下发
5. **到达 END** → 没有更多消息待处理
6. **举手投票（Vote to Halt）** → 所有节点举手表示完成
7. **图计算结束** → 释放内存，节点回到 Inactive 状态

这一模型意味着：LangGraph 的每次执行都是有序的消息传递过程，可以在任意超步之间插入检查点。

---

## 状态深入：Schema 与 Reducer 函数

状态（State）由两部分组成：
- **Schema**：定义数据结构（字段名和类型）
- **Reducer 函数**：定义每个字段的更新策略

```python
from typing import TypedDict, Annotated
from operator import add
from langgraph.graph.message import add_messages

class GraphState(TypedDict):
    user_input: str                              # 覆盖模式（默认）
    total_calls: list                            # 覆盖模式（默认）
    final_response: str                          # 覆盖模式（默认）
    messages: Annotated[list, add_messages]      # 追加模式（add_messages reducer）
    log: Annotated[list, add]                    # 追加模式（operator.add reducer）
    loop_step: Annotated[int, lambda x, y: x+y] # 自定义 reducer（累加）
```

三种状态作用域：

| 作用域 | 用途 | 是否被其他节点共享 |
|---|---|---|
| 共享（shared） | 所有节点读写 | 是（最常用） |
| 私有（private） | 当前节点独享 | 否 |
| 内部（internal） | 类似私有，schema 必须可哈希 | 否 |

实际开发中**私有和内部模式使用较少**，绝大多数字段都是共享状态。

---

## Reducer 的两种模式：覆盖 vs 追加

### 默认：覆盖（Override）

不声明 Reducer 时，新值直接覆盖旧值：

```python
class State(TypedDict):
    answer: str   # 每次节点返回 {"answer": "新值"} 都会覆盖原值
```

### 追加（Append）：add_messages

```python
from langgraph.graph.message import add_messages
from typing import Annotated

class State(TypedDict):
    messages: Annotated[list, add_messages]
    # 效果等同于 messages.append(new_message)
    # 支持自动去重（根据 message id）
```

`add_messages` 的行为：
- 新消息追加到列表末尾
- 如果新消息与现有消息 id 相同，则更新（覆盖）该消息
- 专为多轮对话设计

### 自定义 Reducer

```python
from operator import add

class State(TypedDict):
    steps: Annotated[int, lambda x, y: x + y]  # 每次加上新值
    logs: Annotated[list, add]                  # 列表拼接
```

---

## 节点定义进阶

### 基本规范

```python
def handle_user_input(state: GraphState, config: dict = None) -> dict:
    """
    节点函数规范：
    - 第一个参数必须是 state
    - 第二个参数（可选）是 config，用于接收运行时配置
    - 返回值是对 state 的部分更新（字典格式）
    """
    user_msg = state["messages"][-1] if state["messages"] else None
    return {"user_input": user_msg.content if user_msg else ""}
```

节点函数在编译后会自动包装为 `RunnableLambda` 对象，天然支持异步和批处理。

### 自定义节点名称

```python
# 函数名与节点名不同时
workflow.add_node("input_handler", handle_user_input)

# 函数名与节点名相同时（更简洁）
workflow.add_node(handle_user_input)  # 节点名 = "handle_user_input"
```

---

## 条件边的完整用法

### 标准条件边（推荐）

```python
def decide_to_generate(state: GraphState) -> str:
    """路由函数：必须返回字符串，对应节点名称"""
    if state["web_search"] == "Yes":
        return "websearch"
    return "generate"

workflow.add_conditional_edges(
    "grade_documents",       # 从哪个节点出发
    decide_to_generate,      # 路由函数
    {
        "websearch": "web_search",  # 返回值 → 节点名 映射
        "generate": "generate",
    }
)
```

### 使用 lambda 简化路由函数

```python
# 适合简单的路由逻辑
workflow.add_conditional_edges(
    "router",
    lambda state: "retrieve" if state["is_logged_in"] else "login",
)
```

### 条件入口边

```python
def route_question(state: GraphState) -> str:
    """在图的入口处做分支判断"""
    source = llm_decide_source(state["question"])
    return "websearch" if source == "web" else "vectorstore"

workflow.set_conditional_entry_point(
    route_question,
    {
        "websearch": "web_search",
        "vectorstore": "retrieve",
    }
)
```

入口条件边的核心应用：**意图识别**。可在图的入口处根据用户意图分流到不同处理节点。

### add_edge vs set_conditional_entry_point 的区别

| 方法 | 用途 |
|---|---|
| `add_edge(START, "node")` | 固定入口，直接进入某节点 |
| `add_entry_point("node")` | 等效于 `add_edge(START, "node")` |
| `set_conditional_entry_point(fn, mapping)` | 入口处有条件分支 |

---

## 子图（Subgraph）

子图是指将一个完整的 `StateGraph` 作为另一个图中的节点使用：

```python
# 子图
sub_graph_builder = StateGraph(SubState)
# ... 添加子图的节点和边
sub_graph = sub_graph_builder.compile()

# 主图中使用子图
main_builder = StateGraph(MainState)
main_builder.add_node("process", sub_graph)  # 子图作为节点
```

子图是实现**多 Agent 系统**的核心机制：每个 Agent 可以是一个独立的子图，主图负责协调。

---

## 检查点（Checkpoint）基础介绍

检查点机制允许保存图执行过程中的状态快照：

```python
from langgraph.checkpoint.memory import MemorySaver

# 创建检查点存储
memory = MemorySaver()

# 编译时启用检查点
graph = graph_builder.compile(checkpointer=memory)

# 运行时指定会话 ID（thread_id）
config = {"configurable": {"thread_id": "session-123"}}
result = graph.invoke({"messages": [("user", "你好")]}, config)
```

会话（thread）机制：
- 每个 `thread_id` 代表一个独立的对话会话
- 同一 `thread_id` 的多次调用共享状态（实现多轮对话记忆）
- 不同 `thread_id` 之间完全隔离

---

## 综合实战：LangGraph + RAG 完整示例

本节课演示了一个完整的 RAG 工作流，架构如下：

```
START
  ↓ (条件入口边：意图识别)
  ├─→ web_search → generate → (条件边：质量评估) ─→ END
  │                                              └─→ web_search（循环）
  └─→ retrieve → grade_documents → (条件边：相关性)
                                   ├─→ generate
                                   └─→ web_search
```

### 状态定义

```python
class GraphState(TypedDict):
    question: str              # 用户问题
    generation: str            # 大模型生成的答案
    web_search: str            # 是否需要网络搜索标志
    max_retries: int           # 最大重试次数
    answers: int               # 当前重试计数
    loop_step: Annotated[int, lambda x, y: x + y]  # 循环步数（累加）
    documents: list[str]       # 检索到的文档列表
```

### 核心节点实现

```python
def web_search(state: GraphState) -> dict:
    """网络搜索节点"""
    query = state["question"]
    docs = web_search_tool.invoke({"query": query})
    web_results = "\n".join([d["content"] for d in docs[:3]])
    # 手动追加（因为 documents 是覆盖模式）
    return {"documents": state["documents"] + [Document(page_content=web_results)]}

def retrieve(state: GraphState) -> dict:
    """RAG 检索节点"""
    question = state["question"]
    documents = retriever.invoke(question)
    return {"documents": documents}

def grade_documents(state: GraphState) -> dict:
    """文档相关性评分节点"""
    question = state["question"]
    documents = state["documents"]
    filtered_docs = []
    web_search_needed = "No"
    for doc in documents:
        score = llm_grader.invoke({"question": question, "document": doc})
        if score.binary_score == "yes":
            filtered_docs.append(doc)
        else:
            web_search_needed = "Yes"
    return {"documents": filtered_docs, "web_search": web_search_needed}

def generate(state: GraphState) -> dict:
    """答案生成节点"""
    question = state["question"]
    documents = state["documents"]
    generation = rag_chain.invoke({"context": documents, "question": question})
    return {"generation": generation, "loop_step": 1}  # loop_step 使用累加 reducer
```

### 路由函数

```python
def route_question(state: GraphState) -> str:
    """入口路由：判断使用 RAG 还是网络搜索"""
    source = llm_router.invoke({"question": state["question"]})
    return "websearch" if source.datasource == "web_search" else "vectorstore"

def decide_to_generate(state: GraphState) -> str:
    """文档评分后的路由"""
    return "web_search" if state["web_search"] == "Yes" else "generate"

def grade_generation_v_documents_and_question(state: GraphState) -> str:
    """生成质量评估路由：四种出口"""
    # 检查幻觉
    hallucination = hallucination_grader.invoke({"documents": state["documents"], "generation": state["generation"]})
    if hallucination.binary_score == "yes":
        # 检查答案与问题的匹配度
        answer_grader = answer_grader.invoke({"question": state["question"], "generation": state["generation"]})
        if answer_grader.binary_score == "yes":
            return "useful"
        elif state["loop_step"] <= state["max_retries"]:
            return "not useful"
        else:
            return "max retries"
    elif state["loop_step"] <= state["max_retries"]:
        return "not supported"
    return "max retries"
```

### 图的构建

```python
workflow = StateGraph(GraphState)

# 添加节点
workflow.add_node(web_search)
workflow.add_node(retrieve)
workflow.add_node(grade_documents)
workflow.add_node(generate)

# 添加入口条件边
workflow.set_conditional_entry_point(
    route_question,
    {"websearch": "web_search", "vectorstore": "retrieve"}
)

# 添加普通边
workflow.add_edge("web_search", "generate")
workflow.add_edge("retrieve", "grade_documents")

# 添加条件边
workflow.add_conditional_edges(
    "grade_documents",
    decide_to_generate,
    {"web_search": "web_search", "generate": "generate"}
)
workflow.add_conditional_edges(
    "generate",
    grade_generation_v_documents_and_question,
    {
        "useful": END,
        "not useful": "web_search",
        "not supported": "generate",
        "max retries": END,
    }
)

# 编译
app = workflow.compile()
```

---

## LangGraph vs LangChain vs Dify/Coze 选择策略

推荐使用**漏斗模型**决策：

```
优先考虑 Dify / Coze
    ↓（能搞定就用）
考虑对 Dify/Coze 进行二次开发（插件/API 扩展）
    ↓（二次开发能搞定就用）
使用 LangGraph 从头构建
    ↓（复杂度最高，但最灵活）
```

**关键判断标准**：
- Dify/Coze 能满足 80% 需求？→ 直接用
- 文档解析、分块等能力太弱需要替换？→ Dify 二次开发
- 整体工作流逻辑都需要定制？→ LangGraph

**ReAct vs LangGraph 的关系**：
- ReAct 是一种**思路/范式**（循环推理 + 工具调用）
- LangGraph 是一个**工具/框架**
- 在 LangGraph 中，ReAct 可以作为一个节点的实现模式
- LangChain 可以看作 LangGraph 图中的一个节点能力

---

## Connections
- → [[langgraph-fundamentals]]
- → [[langgraph-advanced-patterns]]
- → [[rag-architecture]]
- → [[react-agent-pattern]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话描述 LangGraph 超步模型的七个阶段，并解释"举手投票（Vote to Halt）"机制的作用。
2. `add_messages` reducer 和默认覆盖模式有什么本质区别？`add_messages` 的去重行为是如何工作的？请结合代码示例解释。
3. 课程推荐用"漏斗模型"来选择 Dify/Coze、LangGraph 还是 LangChain——请用自己的话描述这个漏斗的决策逻辑，并说明什么情况下才需要用 LangGraph 从头构建。

> [!example]- Answer Guide
> 
> #### Q1 — LangGraph 超步模型七阶段
> 
> 七个阶段依次为：图编译（节点 Inactive）→ 调用入口（从 START 开始）→ START 激活并向邻居发消息 → chatbot 激活完成工作继续传递 → 到达 END（无待处理消息）→ 所有节点举手投票表示完成 → 图计算结束释放内存。"举手投票"是终止条件：只有所有节点都无消息可处理时，图才真正停止。
> 
> #### Q2 — add_messages Reducer 去重机制
> 
> 默认覆盖模式下，节点每次返回新值会直接替换旧值；`add_messages` reducer 则将新消息追加到列表末尾，实现多轮对话历史积累。去重机制：若新消息的 `id` 与已有消息相同，则原地更新（覆盖）该条消息，而非重复追加。
> 
> #### Q3 — 工具选型漏斗决策逻辑
> 
> 漏斗模型优先使用 Dify/Coze（能满足 80% 需求时直接用），其次对 Dify/Coze 做二次开发（替换文档解析、分块等弱项能力），最后才使用 LangGraph 从头构建——仅当整体工作流逻辑都需要深度定制时选择，代价是复杂度最高但灵活性最强。
