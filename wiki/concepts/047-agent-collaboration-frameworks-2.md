---
tags: [agent, multi-agent, autogen, agentchat, swarm, round-robin, human-in-the-loop]
source: https://u.geekbang.org/lesson/818?article=927463
---

# Agent 协作框架：Round-Robin、Swarm 与人机协作

## Key Concepts

### 团队（Team）
AgentChat 中多 Agent 协作的容器。对应 AutoGen 的"代理模式场景"。支持三种运行模式：
- **RoundRobinGroupChat**：轮循发言，每个 Agent 按序发言直到终止条件触发。
- **SelectorGroupChat**：由大模型动态选择下一个发言者。
- **Swarm**：去中心化，Agent 通过 HandoffMessage 自主移交控制权。

### Round-Robin 模式
参与者列表按顺序轮流执行；通过 `TextMentionTermination` 等条件触发终止。适合有明确审核/反馈循环的任务（如创作→审核）。

### Swarm 模式
无需中央调度节点，流程完全由提示词驱动。Agent 通过 `handoffs` 配置声明可移交的目标，借助 `HandoffMessage` 实现控制权转移。适合多专职 Agent 间灵活流转的场景（如旅行社→退款员→用户）。

### Human-in-the-Loop
通过 `UserProxyAgent` + `input_func=input` 将控制权临时交给人类。前端场景可替换为 WebSocket 方式等待页面交互。

## Key Takeaways

- 学习设计模式（Round-Robin、Swarm）比学具体框架 API 更重要；AutoGen / AgentChat / LangGraph 均实现这些模式。
- Swarm 的核心价值：去掉中央意图识别节点，流程靠提示词驱动，降低架构复杂度。
- 每个 Agent 的内部状态与外部通信必须通过 Message 严格隔离；A2A 协议正是为了统一 Agent 间消息格式。
- `RoundRobinGroupChat` 的参与者参数为列表，`team.reset()` 可清除中间状态重新开始。
- 每个 Agent 携带工具不超过 3 个；相似工具会导致调用混乱。

## See Also

- [[008-langchain-core-components]]
- [[012-prompt-engineering-and-agent-design]]
- [[013-multi-agent-finetuning-deployment]]
- [[048-agent-collaboration-frameworks-3]]
