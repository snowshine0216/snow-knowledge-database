---
tags: [agent, multi-agent, autogen, agentchat, swarm, round-robin, human-in-the-loop]
source: https://u.geekbang.org/lesson/818?article=927463
wiki: wiki/concepts/047-agent-collaboration-frameworks-2.md
---

# 047: 主流 Agent 协作框架对比与案例（二）

**Source:** [3主流 Agent 协作框架对比与案例2](https://u.geekbang.org/lesson/818?article=927463)

## Outline
- [团队（Team）概念](#团队team概念)
- [Round-Robin 轮循模式](#round-robin-轮循模式)
- [创作者与评论家：轮循实践](#创作者与评论家轮循实践)
- [人机协作（Human-in-the-Loop）](#人机协作human-in-the-loop)
- [Swarm 模式](#swarm-模式)
- [框架比较总结](#框架比较总结)
- [Connections](#connections)

---

## 团队（Team）概念

在 AgentChat 框架中，多个 Agent 组合工作的单元称为 **团队（Team）**。团队对应 AutoGen 中的"代理模式场景"（工作流群聊、辩论反思等）。

团队的核心设计问题：**多个 Agent 工作时如何确定顺序和流转方式**。

AgentChat 支持的团队运行方式：

| 模式 | 说明 |
|------|------|
| `RoundRobinGroupChat` | 轮循发言：每个参与者按顺序依次发言 |
| `SelectorGroupChat` | 模型选择：通过 chat completion 模型选定下一个发言者 |
| `Swarm` | 去中心化：Agent 通过 HandoffMessage 互相移交控制权，无需中央调度 |

---

## Round-Robin 轮循模式

`RoundRobinGroupChat` 是最基础的团队运行方式，所有参与者轮流发言，直到触发终止条件。

**关键代码结构：**

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination

# 创建两个 Agent
primary = AssistantAgent(name="primary", model=..., system_message=...)
critic  = AssistantAgent(name="critic",  model=..., system_message=...)

# 终止条件：当消息中出现 "APPROVE" 时结束
termination = TextMentionTermination("APPROVE")

# 组建轮循团队（参数是列表，不是关键字 agents=）
team = RoundRobinGroupChat([primary, critic], termination_condition=termination)
```

**注意事项：**
- `RoundRobinGroupChat` 的参与者传入的是一个**列表**，而非 `agents=` 关键字参数。
- 如果第二轮 critic 就输出了终止词，轮循提前结束——并不代表只能运行一轮。
- 可调用 `team.reset()` 清除中间状态，回到初始状态重新开始。

---

## 创作者与评论家：轮循实践

本节演示了一个「内容创作 + 评论家审核」的轮循流程：

1. **Primary Agent**（内容创作者）：根据提示词撰写文章/诗歌。
2. **Critic Agent**（评论家）：审核内容，若满意则回复 `APPROVE`，否则提出修改意见。
3. **终止条件**：Critic 输出 `APPROVE` 时对话结束。

调试技巧：开启日志后，可在控制台查看完整对话轮次及消息流转。

---

## 人机协作（Human-in-the-Loop）

通过引入 `UserProxyAgent` 并将其 `input_func` 设置为 Python 内置的 `input()`，可以让 Agent 在运行时暂停等待人工输入。

```python
from autogen_agentchat.agents import UserProxyAgent

user_proxy = UserProxyAgent(name="user", input_func=input)
```

**工作流程：**
1. AssistantAgent 先调用大模型完成任务（如写四行诗）。
2. 流程交给 UserProxyAgent，程序暂停等待人的输入。
3. 人输入意见后，Primary Agent 继续修改，直到人满意（输入特定词）为止。

**前端集成方向：** AgentChat 支持 WebSocket，可通过 ws 的方式等待前端页面的交互，替代命令行 `input()`。

---

## Swarm 模式

Swarm 模式来自 OpenAI 的设计理念，核心特点是**去中心化**——不需要中央调度/意图识别节点，Agent 通过 `HandoffMessage` 自行决定将控制权移交给谁。

**与传统中心化方案对比：**

| 维度 | 传统中心化 | Swarm |
|------|-----------|-------|
| 调度方式 | 独立中央调度 Agent 负责意图识别与分发 | 每个 Agent 通过提示词自主决定移交目标 |
| 编写复杂度 | 需单独实现调度逻辑 | 靠提示词驱动，代码更简洁 |
| 适用场景 | 意图分支明确且固定 | 流程灵活、多目标移交 |

**航班退票案例流程：**

```
用户: "我要退票"
  → TravelAgent（旅行社）评估请求
    → 信息不全：移交给 User（追问航班号）
    → 信息明确：移交给 FlightRefundAgent（退款员）
      → 退款完成后移交回 TravelAgent
        → 触发终止条件，流程结束
```

**关键实现要点：**
- `handoffs` 参数指定可移交的目标 Agent。
- 流程完全由 `system_message`（提示词）驱动，无需硬编码分支逻辑。
- 必须定义终止标志（如 `terminate` 消息类型）防止无限循环。
- 与 AutoGen 的 Swarm 模式、LangGraph 中的 Swarm 模式在概念上一致，各框架均有实现。

---

## 框架比较总结

本节课使用 AgentChat 框架演示了 Round-Robin 和 Swarm 两种模式：

- **顺序工作流（Round-Robin）**：适合任务有明确先后顺序，每个节点依次执行。
- **Swarm 模式**：适合任务需要在多个专职 Agent 间灵活流转，无需中央调度。
- AutoGen / AgentChat / LangGraph 均支持这两种模式，学习设计模式比学具体框架 API 更重要。
- 每个 Agent 内部信息与外部通信需通过 Message 严格隔离；A2A 协议正是为了统一 Agent 间消息格式而设计的。

**多 Agent 提示词设计原则（预告）：**
1. 启发式写法，描述能力而非写死行为。
2. 任务分配描述准确，避免歧义。
3. 每个 Agent 携带工具不超过 3 个。
4. 专用工具描述要细化（如明确是学术搜索还是通用搜索）。

---

## Connections

- → [[008-langchain-core-components]]
- → [[012-prompt-engineering-and-agent-design]]
- → [[013-multi-agent-finetuning-deployment]]
- → [[047-agent-collaboration-frameworks-2]]
