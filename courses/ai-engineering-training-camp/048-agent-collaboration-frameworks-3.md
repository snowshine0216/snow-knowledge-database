---
tags: [agent, multi-agent, langgraph, crewai, mas, supervisor, handoff, prompt-engineering]
source: https://u.geekbang.org/lesson/818?article=927464
wiki: wiki/concepts/048-agent-collaboration-frameworks-3.md
---

# 048: 主流 Agent 协作框架对比与案例（三）

**Source:** [4主流 Agent 协作框架对比与案例3](https://u.geekbang.org/lesson/818?article=927464)

## Outline
- [LangGraph Multi-Agent 架构模式](#langgraph-multi-agent-架构模式)
- [LangGraph 图与子图结构](#langgraph-图与子图结构)
- [航班+酒店预订实战（LangGraph MAS）](#航班酒店预订实战langgraph-mas)
- [Handoff 工具实现](#handoff-工具实现)
- [框架对比：LangGraph vs CrewAI](#框架对比langgraph-vs-crewai)
- [多 Agent 提示词设计原则](#多-agent-提示词设计原则)
- [MCP 与 A2A 协议定位（预告）](#mcp-与-a2a-协议定位预告)
- [Connections](#connections)

---

## LangGraph Multi-Agent 架构模式

LangGraph 官方支持六种多 Agent 架构模式：

| 模式 | 说明 |
|------|------|
| **Single Agent** | 单一 Agent，最简场景 |
| **Network** | 每个 Agent 都可与其他 Agent 通信（等同于群聊） |
| **Supervisor** | 主管分发任务，下属 Agent 互不通信，只与主管交互 |
| **Supervisor as Tool** | 把 Agent 视为工具，由大模型统一做多 Agent 调用 |
| **Hierarchical** | Supervisor 的多层嵌套（主管下还有子主管） |
| **Custom** | 自定义任意拓扑 |

**Supervisor vs Network 的区别：**
- Supervisor：主管与下属通信，下属之间**不能**直接通信。
- Network：任意节点均可互相通信。

---

## LangGraph 图与子图结构

LangGraph 的核心抽象是**图（Graph）**，三层关键要素：

1. **State**：在节点间传递的状态对象（消息驱动）。
2. **Node**：执行逻辑单元；节点本身可以是另一张子图（SubGraph）。
3. **Edge**：节点间的连接与流转路径。

通过图嵌套子图，可以实现 Supervisor 层级结构：顶层图的某个节点本身是一个完整的子图。

---

## 航班+酒店预订实战（LangGraph MAS）

**任务：** 同时预订波士顿→纽约机票 + 指定酒店。

**两种实现思路：**
1. 订机票用一个 Agent，订酒店用另一个 Agent（MAS 方式）。
2. 同一个 Agent，内部调用两个工具（单 Agent + 多工具）。

本节选择方案1（MAS），以练习多智能体系统设计。

**图的流程：**

```
START → flight_agent → hotel_agent → END
         ↑                |
         └────────────────┘  (通过 handoff 双向转接)
```

**设计决策：** 先订机票再订酒店，符合"先确认航班再订酒店"的真实业务逻辑。

---

## Handoff 工具实现

LangGraph 的 Agent 间移交（Handoff）通过**工厂函数**实现，并非随意编写：

```python
from langgraph.prebuilt import create_handoff_tool
from langgraph.types import Command

# 创建移交到酒店 Agent 的工具
transfer_to_hotel = create_handoff_tool(agent_name="hotel")
# 创建移交到航班 Agent 的工具
transfer_to_flight = create_handoff_tool(agent_name="flight")
```

`create_handoff_tool` 返回一个可执行对象，执行时返回 `Command` 类型（LangGraph 内置），其内部逻辑等同于 `goto` 跳转到指定节点：

```python
# 工厂函数内部结构（简化）
def handoff_tool(...) -> Command:
    return Command(goto=target_node, update=messages)
```

**局限性：** 当前 LangGraph 的 Handoff 封装仍较底层（基于工具调用机制），代码相对复杂，预计未来会被更高层的 API 替代。

---

## 框架对比：LangGraph vs CrewAI

直接对比同一任务（订机票+订酒店）在两个框架下的开发体验：

| 维度 | LangGraph | CrewAI |
|------|-----------|--------|
| 代码量 | 较多，需手动定义 State、Node、Edge | 极少，声明式配置 |
| 灵活性 | 极高，可自定义任意图结构 | 较低，以 Sequential/Hierarchical 为主 |
| 上手难度 | 高，需理解图的概念 | 低，接近自然语言描述 |
| Agent 定义 | 指定 role、goal、backstory | 同样声明式，但更贴近代码习惯 |
| Handoff 支持 | 通过工具实现，较繁琐 | 原生支持，写法优雅 |

**结论：** CrewAI 因其简洁性而流行；LangGraph 的繁重写法在企业中常见，是因为公司制定了统一标准。实际工作中两者都会遇到，关键是理解**设计模式**，而非死记框架 API。

---

## 多 Agent 提示词设计原则

无论使用哪个 MAS 框架，提示词都是驱动 Agent 协作的核心：

### 1. 启发式写法
- 描述 Agent **能做什么**，而不是写死它**要做什么**。
- 赋予 Agent 能力边界，让其根据上下文自主决策。

### 2. 精准的任务描述
- 分配任务时描述要准确，**避免歧义**。
- 歧义会导致 Agent 在不该流转时流转，或在该流转时停滞。

### 3. 工具数量限制
- 每个 Agent 携带工具**不超过 3 个**（经验值）。
- 相似工具会导致 Agent 调用混乱，难以区分。
- 工具相似时需通过强化学习等方式辅助区分，成本较高，应提前规避。

### 4. 专用工具描述要细化
- 工具描述不能只写"这是搜索工具"。
- 需明确：是学术搜索、官方文档搜索，还是通用社科搜索。
- 模糊描述会导致大模型无法正确选择工具。

---

## MCP 与 A2A 协议定位（预告）

课程在本节末尾预告了 MCP 和 A2A 的设计初衷：

- **MCP（Model Context Protocol）**：标准化大模型与工具之间的调用协议，解决工具调用的标准化、发现和互操作性问题。
- **A2A（Agent-to-Agent Protocol，Google）**：标准化 Agent 与 Agent 之间的消息通信格式，解决多 Agent 系统中消息混乱的问题。

两者**各司其职，互不替代**：
- MCP = Agent 调用工具的神经系统（如何调用外部能力）
- A2A = Agent 之间通信的语言规范（如何传递消息）

---

## Connections

- → [[047-agent-collaboration-frameworks-2]]
- → [[049-mcp-and-a2a-protocols-1]]
- → [[012-prompt-engineering-and-agent-design]]
- → [[013-multi-agent-finetuning-deployment]]
- → [[009-function-calling-and-mcp-basics]]
