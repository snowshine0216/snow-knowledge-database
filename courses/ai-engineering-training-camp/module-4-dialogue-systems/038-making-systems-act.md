---
tags: [langchain, agent, react, tool-use, langgraph, function-calling, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927454
wiki: wiki/concepts/langchain-agent-react-tool-use.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. ReAct 这个名字由两个单词组成，你认为它代表什么含义？Agent 在每一轮会经历哪几个步骤？
2. 在 LangChain 中，如果你想把一个普通 Python 函数注册为 Agent 可以调用的工具，你会用什么方式实现？
3. 什么情况下你会选择用"固定流程状态机"而不是 ReAct Agent 来完成一个任务？举一个具体例子。

---

# 038: 让系统会行动

**Source:** [7让系统会行动](https://u.geekbang.org/lesson/818?article=927454)

## Outline
- [Agent 的工作本质：感知-决策-执行](#agent-的工作本质感知-决策-执行)
- [ReAct 模式：推理与行动](#react-模式推理与行动)
- [LangChain 实现 ReAct Agent](#langchain-实现-react-agent)
- [工具定义：@tool 装饰器](#工具定义tool-装饰器)
- [内置工具：DuckDuckGo 搜索](#内置工具duckduckgo-搜索)
- [工具错误处理](#工具错误处理)
- [ReAct vs 状态机（有限状态机）](#react-vs-状态机有限状态机)
- [ReAct 的实际应用案例](#react-的实际应用案例)
- [何时用 ReAct，何时用工作流](#何时用-react何时用工作流)
- [小结](#小结)

---

## Agent 的工作本质：感知-决策-执行

理解一个 agent 完整工作，需要把它拆成三个阶段：

```
感知（Perception）→ 决策（Decision）→ 执行（Action）→ [闭环回到感知]
```

- **感知**：理解用户任务（基于规则或大模型）
- **决策**：把任务拆解为可执行的函数/步骤
- **执行**：调用工具或大模型完成每个步骤
- **闭环**：执行结果反馈给感知层，判断问题是否解决；若否，继续迭代

## ReAct 模式：推理与行动

**ReAct**（Reasoning + Acting）是让大模型模拟人类完成工作的思维模式，通过 **提示词驱动**，不依赖硬编码逻辑。

核心循环：

```
思考（Thought）→ 行动（Action）→ 观察（Observation）→ 回复或继续思考
```

每一轮：
1. **思考**：分析当前问题，决定是否调用工具及调用哪个工具
2. **行动**：选择 action 并传入 action_input
3. **观察**：拿到工具返回结果
4. 重复，直到大模型认为已有最终答案（`Final Answer`）

提示词控制思考粒度：可以把大任务拆成子步骤清单（to-do list），对每个子步骤再套一层 Thought→Action→Observation 小循环，全部完成后做整体复盘。

## LangChain 实现 ReAct Agent

LangChain 内置 `create_react_agent` 工厂函数，三个必填参数：

```python
from langchain import hub
from langchain.agents import create_react_agent, AgentExecutor

# 1. 获取或自定义 ReAct prompt 模板
prompt = hub.pull("hwchase17/react")  # 官方内置模板，也可自定义

# 2. 定义模型和工具列表（工具列表可以为空，但必须传入）
llm = ChatOpenAI(model="gpt-4o")
tools = []  # 必须传，即使为空

# 3. 创建 agent（绑定 prompt、model、tools）
agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)

# 4. 用 AgentExecutor 运行
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
result = agent_executor.invoke({"input": "你叫什么名字？"})
```

**物流场景示例**（多工具）：

```python
# 定义工具（mock 数据）
@tool
def trace_package(order_id: str) -> dict:
    """追踪包裹状态，返回快递单号、状态、位置、预计送达时间"""
    # ... 调用内部 API 或返回 mock 数据
    return {"order_id": order_id, "status": "运输中", "location": "上海转运中心"}

@tool
def calculate_shipping_fee(origin: str, destination: str, weight: float) -> float:
    """计算从 origin 到 destination 的运费（元）"""
    return 15.0  # mock

@tool
def check_inventory(product_id: str) -> int:
    """查询商品库存数量"""
    return 100  # mock

tools = [trace_package, calculate_shipping_fee, check_inventory]

agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 三类查询
executor.invoke({"input": "查询订单 SF123456 的状态"})
executor.invoke({"input": "从北京寄 2kg 包裹到上海需要多少钱？"})
executor.invoke({"input": "商品 A01 的库存是多少？"})
```

## 工具定义：@tool 装饰器

`@tool` 是 LangChain 提供的装饰器，将普通函数注册为 agent 可调用的工具：

```python
from langchain.tools import tool

@tool
def my_search_tool(query: str) -> str:
    """搜索互联网获取最新信息。
    
    Args:
        query: 搜索关键词
    """
    # 调用搜索 API
    results = search_api(query)
    return results

# 装饰器会自动提取：
# - tool.name：函数名
# - tool.description：函数的 docstring（必须用三引号）
# - tool.args：函数参数 schema
print(my_search_tool.name)         # "my_search_tool"
print(my_search_tool.description)  # docstring 内容
print(my_search_tool.args)         # {"query": {"title": "Query", "type": "string"}}
```

**重要**：description 必须写在三引号 docstring 中，大模型通过 description 判断何时调用该工具。

## 内置工具：DuckDuckGo 搜索

LangChain Community 集成了大量开箱即用的工具：

```bash
pip install -qU langchain-community duckduckgo-search
```

```python
from langchain_community.tools import DuckDuckGoSearchRun, DuckDuckGoSearchResults

# 直接调用（返回纯文本结果）
search = DuckDuckGoSearchRun()
result = search.invoke("苹果公司的创始人是谁")

# 返回带来源链接的结构化结果
search_with_sources = DuckDuckGoSearchResults()
results = search_with_sources.invoke("LangChain 最新版本")
# 输出: [{"snippet": "...", "title": "...", "link": "..."}]
```

与 LangChain agent 结合：

```python
tools = [DuckDuckGoSearchRun()]
agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)
executor = AgentExecutor(agent=agent, tools=tools)
executor.invoke({"input": "苹果公司的创始人是谁？"})
# Thought: 需要搜索苹果公司的创始人
# Action: duckduckgo_search
# Action Input: 苹果公司创始人
# Observation: ... 乔布斯 ...
# Final Answer: 苹果公司的创始人是史蒂夫·乔布斯
```

## 工具错误处理

工具调用失败时，默认行为是大模型可能编造答案。推荐始终开启 `handle_parsing_errors`：

```python
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True,  # 工具出错时，把错误信息返回给大模型
    max_iterations=10             # 防止无限循环
)
```

开启后的效果：工具报错 → 大模型收到错误信息 → 大模型回复"工具调用出错"，而不是伪造结果。这对下游使用方更安全。

## ReAct vs 状态机（有限状态机）

这是两种适用于不同场景的 agent 架构：

| 维度 | ReAct | 状态机（FSM） |
|------|-------|------------|
| **工作流灵活性** | 动态，每次思考路径可变 | 固定，节点和流转预先定义 |
| **适用场景** | 创作类、研究类、路径不确定的任务 | 审批流、订单处理等流程固定的任务 |
| **驱动方式** | 提示词驱动，大模型决策 | 条件判断驱动，代码控制 |
| **LangChain 实现** | `create_react_agent` + `AgentExecutor` | LangChain 实现繁琐 |
| **LangGraph 实现** | 均支持，代码更简洁 | **LangGraph 更适合** |

**判断原则**：
- 工作流步骤固定 → **状态机（用 LangGraph）**
- 工作流步骤随输入动态变化 → **ReAct**

```python
# 状态机示例：发票审批（付款状态判断）
# 张总 → 王总 → 财务 的固定流程，不需要思考，直接用条件判断
class OrderState:
    PENDING = "pending"
    PAID = "paid"
    INVOICED = "invoiced"

def check_payment(order_id: str) -> bool:
    # 查询订单是否付款
    ...

def process_invoice(order_id: str) -> None:
    if check_payment(order_id):
        issue_invoice(order_id)
    else:
        notify_user("请先完成付款")
```

## ReAct 的实际应用案例

以内测写作助手（多 Agent 写作系统）为例，展示真实产品中 ReAct 的分层用法：

```
用户提交主题
    ↓
[意图理解层] 拆解写作任务，生成 to-do 清单（存入短期记忆）
    ↓
[调研 Agent - 小美] 调用搜索工具，汇总调研报告
    ↓
[规划层] 基于调研结果，生成多个文章框架方案，请用户选择（Human-in-the-Loop）
    ↓
[写作 Agent - 小帅] 分段撰写每个章节（每段套一轮小 ReAct）
    ↓
[主编 Agent - 仓标] 审阅逻辑漏洞，提出修改建议
    ↓
[整体复盘] 最终答案是否满足原始要求？否则继续迭代
```

**Human-in-the-Loop（HIL）**：大模型生成待办清单时，以 JSON 格式返回选项，前端渲染为可点击的决策节点，用户选择后继续流程。

**工具是固定的**：ReAct 的"动态"指的是步骤动态，工具集是预定义的（如：专用知识库检索、全网搜索），不能在运行时随意增加工具。

## 何时用 ReAct，何时用工作流

```
任务步骤固定且顺序不变？
    是 → 用 LangGraph 状态机（工作流）
    否 →
        步骤是否依赖用户输入/搜索结果动态生成？
            是 → 用 ReAct
            否 → 简单条件判断即可
```

**例子**：
- 写文章（主题不固定、框架随调研结果变化）→ **ReAct**
- 代码提交流程（创建分支→提交→合并请求，顺序固定）→ **LangGraph 状态机**
- 发票审批（先付款才能开票，简单条件）→ **条件判断，不需要 agent**

## 小结

本讲核心要点：

1. **ReAct = Thought + Action + Observation 循环**，靠提示词驱动，适合动态任务
2. **`create_react_agent`** 三要素：model、tools、prompt（三个都必填）
3. **`@tool` 装饰器**：docstring 是工具的 description，大模型依赖它做调用决策
4. **`handle_parsing_errors=True`** + **`max_iterations`** 是生产级必须设置的安全兜底
5. **ReAct vs 状态机**：灵活任务用 ReAct，固定流程用 LangGraph
6. 多层 ReAct：大任务拆成 to-do，每个子任务套小 ReAct，最后整体复盘

## Connections
- → [[langchain-agent-react-tool-use]]
- → [[langchain-memory-management]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话描述 ReAct 的核心循环，并解释为什么大模型能够通过"提示词驱动"完成这个循环，而不需要硬编码逻辑。
2. `@tool` 装饰器中的 docstring 起什么作用？如果 docstring 写得模糊或缺失，会对 Agent 行为产生什么影响？
3. 在生产环境中，`AgentExecutor` 有哪两个参数是必须设置的安全兜底配置？分别解决了什么问题？

> [!example]- Answer Guide
> 
> #### Q1 — ReAct 核心循环与提示词驱动
> 
> ReAct 是 Reasoning + Acting 的缩写，核心循环为：思考（Thought）→ 行动（Action）→ 观察（Observation），不断重复直到得出 Final Answer。它完全依赖提示词控制大模型的决策路径，无需在代码中硬编码工具调用顺序。
> 
> #### Q2 — @tool 装饰器 Docstring 作用
> 
> `@tool` 装饰器会自动将函数的 docstring 提取为该工具的 `description`，大模型正是通过 description 判断何时、为何调用该工具；描述不准确会导致大模型选错工具或完全忽略该工具。
> 
> #### Q3 — AgentExecutor 安全兜底配置
> 
> 必须设置 `handle_parsing_errors=True`（工具出错时将错误信息反馈给大模型，避免其编造答案）和 `max_iterations=10`（防止 Agent 陷入无限循环，控制最大推理轮数）。
