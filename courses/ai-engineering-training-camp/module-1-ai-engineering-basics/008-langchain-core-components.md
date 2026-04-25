---
tags: [langchain, langgraph, autogen, multi-agent, tools, memory, function-calling, agent-framework]
source: https://u.geekbang.org/lesson/818?article=927425
wiki: wiki/concepts/008-langchain-core-components.md
---
j g
## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 手写 Function Calling（即手动拼 JSON Schema 让模型调用工具）会带来哪些工程化问题？你能想到几个？
2. LangChain 和 LangGraph 听起来都是 AI 框架，你猜它们的定位有什么不同？各自解决什么问题？
3. 一个 Agent 框架通常需要哪些核心能力？（从"让模型能用工具、能记住对话、能规划步骤"这几个方向猜猜看）

---

# 008: LangChain 核心组件概述

**Source:** [AI 工程化训练营 LangChain 核心组件概述](https://u.geekbang.org/lesson/818?article=927425)

## Outline
- [为什么要用框架](#为什么要用框架)
- [LangChain vs. LangGraph：工具箱与流程引擎](#langchain-vs-langgraph工具箱与流程引擎)
- [LangChain 核心组件](#langchain-核心组件)
- [AutoGen 多 Agent 协同演示](#autogen-多-agent-协同演示)
- [课程阶段小结](#课程阶段小结)

---

## 为什么要用框架

手写 Function Calling 有两个核心问题：
1. **易出错**：手动拼 JSON Schema，工具格式稍有偏差就调用失败
2. **主动权在用户 Prompt 手里**：工具能不能被调用到，取决于用户 Prompt 写得好不好——这在工程化里是不可接受的

解决方案：**用框架封装 Function Calling**，确保工具调用路径可靠、可预期，而不依赖 Prompt 质量。LangChain 是目前最主流的封装框架，尽管历史上文档混乱（社区甚至要求"别开新功能了，先把文档写好"），0.3 版本之后已有显著改善。

---

## LangChain vs. LangGraph：工具箱与流程引擎

这两个是同一个生态下的不同工具，定位完全不同：

| 维度 | LangChain | LangGraph |
|------|-----------|-----------|
| 比喻 | 工具箱（螺丝刀、锤子、扳手） | 流程引擎（干活步骤的调度者） |
| 关注点 | 怎么调用模型、怎么执行工具 | 谁先执行、什么条件下重试、失败走哪个分支 |
| 控制流 | 线性管道（Pipeline），简单循环 | 复杂控制流：分支、循环、条件、**并行** |
| 适用场景 | 工具组合、链式调用 | Agent 工作流编排、Multi-Agent 协同 |

**选型规则**：工作流→选 LangGraph；工具底层添加→用 LangChain 组件。LangChain 不完整——它是众多组件中的一块拼图，使用时通常取某几个功能，配合其他工具完成完整系统。

---

## LangChain 核心组件

**1. Tools（工具封装）**
将 Function Calling 的 JSON 定义封装成声明式的 Tool 对象，支持搜索工具、计算工具、API 调用工具等自定义功能。核心逻辑：
```python
from langchain.tools import tool

@tool
def get_current_time(timezone: str) -> str:
    """获取指定时区的当前时间"""
    ...
```

**2. Agents**
内置两种主要 Agent：
- **ReAct Agent**：思考（Reasoning）→ 行动（Acting）循环，评估→调用工具→再评估
- **Plan-and-Execute Agent**：先规划所有步骤，再逐步执行

**3. Memory（记忆）**
- **短期记忆（Conversation Memory）**：当前会话上下文积累，多轮对话中保持连贯性
- **长期记忆**：持久化存储用户偏好或历史数据

> 注意：LangChain 中 Tools 和 Agents 并存，初学时容易造成层级混乱（工具 vs. agent 的边界不清）。因此课程不从 LangChain 入手，而是先建立分层架构认知，再用 LangChain 填充具体组件。

**推荐预习代码：`05.py`（约 200–300 行）**

涵盖 LangChain 0.3 版本的核心用法，包括：
- 链式组合（Prompt → LLM → Output）
- 工具定义与调用（获取时间、计算）
- ReAct Agent 使用
- Memory 多轮对话（含 bug 演示：第四轮的短期记忆）
- 流程编排与可观测性

比看官方文档或教程快得多——直接读这份代码建立整体认知。

---

## AutoGen 多 Agent 协同演示

预习代码 `06.py`：使用微软 AutoGen 框架演示多 Agent 协同（使用 GPT 或国内代理 API，**不要放敏感数据**）。

**场景：物流客服 Multi-Agent 系统**

模拟企业数据库 API，创建四个专业 Agent：

| Agent | 职责 |
|-------|------|
| 客服接待 Agent | 接收用户问题，协调其他 Agent |
| 订单 Agent | 查询订单状态和编号 |
| 物流 Agent | 跟踪包裹轨迹 |
| 库管 Agent | 查询库存与货源 |

**三个演示场景**：
1. **订单状态查询**：用户问"我的订单什么时候到货" → 订单 Agent 查询 → 物流 Agent 跟踪 → 客服汇总返回
2. **缺货处理**：库存不足时的处理流程
3. **物流延误**：延误情况的客服响应

这套系统原型来自讲师为某物流公司设计的真实项目，抽取精简后用于教学演示。

---

## 课程阶段小结

本次课（第 1 讲）仅完成了前三个部分：

1. **认知层（模块 1）**：AI 工程化的分层架构，遇到问题先定位层级再选方案
2. **能力层（模块 2 上半）**：大模型调用方式（API/SDK/HTTP），Function Calling 原理（两步走、客户端执行、模型与逻辑解耦）
3. **能力层封装（模块 2 下半引子）**：LangChain 简介——只讲了开头，下周日（周日课）详细讲 LangChain 组件设计 + Function Calling 封装 + MCP 核心流程与对比

**后续模块预告（周日课）**：
- LangChain 底层 + Function Calling 深入
- LlamaIndex 知识增强与 RAG 组合
- Prompt 驱动 Agent
- Multi-Agent 业务层架构
- AutoGen 协同细节
- 微调方法与个性化

**学习建议**：
- 准备白纸和笔，边听课边画架构图，主动参与思考比被动接收更有效
- 预习 `05.py`（LangChain）和 `06.py`（AutoGen），直接读代码比看文档快
- 熟悉 Python 的同学：直接跑代码，手动修改观察行为变化
- 不熟悉 Python 的同学：借助 AI 解释代码，再动手改

---

## Connections

- → [[007-llm-invocation-and-function-calling-basics]]（Function Calling 原理）
- → [[006-what-is-ai-engineering]]（LangChain 在能力层/工具增强层）
- → 模块 2 周日课：Function Calling 深入 + MCP


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释：手写 Function Calling 的两个核心问题是什么？LangChain 是如何通过封装来解决它们的？
2. LangChain 和 LangGraph 分别比作"工具箱"和"流程引擎"——用这个比喻说明两者的分工，并举例说明什么场景该选哪个。
3. LangChain 的三大核心组件（Tools、Agents、Memory）各自负责什么？ReAct Agent 和 Plan-and-Execute Agent 的执行方式有何不同？

> [!example]- Answer Guide
> 
> #### Q1 — Function Calling 两个核心问题
> 
> 两个问题：①手动拼 JSON Schema 易出错，格式稍有偏差就调用失败；②工具能否被调用取决于用户 Prompt 质量，工程上不可控。LangChain 将 Function Calling 封装成声明式 Tool 对象，使调用路径可靠、可预期，不再依赖 Prompt 写法。
> 
> #### Q2 — 工具箱与流程引擎分工
> 
> LangChain 是"工具箱"，关注怎么调用模型、怎么执行工具（线性管道）；LangGraph 是"流程引擎"，关注谁先执行、条件分支、并行与重试（复杂控制流）。选型规则：需要编排工作流或 Multi-Agent 协同→选 LangGraph；只需要组合工具底层→用 LangChain 组件。
> 
> #### Q3 — 三大组件与 Agent 执行模式
> 
> Tools 将 Function Calling 封装为声明式对象；Agents 内置 ReAct（思考→行动循环，边执行边评估）和 Plan-and-Execute（先规划全部步骤再执行）两种模式；Memory 分短期记忆（当前会话上下文，保持多轮连贯）和长期记忆（持久化用户偏好或历史数据）。
