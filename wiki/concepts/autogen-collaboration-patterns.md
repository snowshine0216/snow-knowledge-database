---
tags: [autogen, mas, agent-collaboration, workflow, group-chat, agentchat, mcp, a2a]
source: https://u.geekbang.org/lesson/818?article=927462
---

# AutoGen Collaboration Patterns

AutoGen（微软）是目前最完整的多Agent框架之一，提供四种内置协作模式，并通过 AgentChat 提供高层抽象。

## Key Concepts

### AutoGen核心理念

AutoGen的本质：将多个Agent（每个继承自RoutedAgent）通过共享消息通道连接，通过runtime管理执行顺序。

两个Agent通信 ≈ 两个线程操作同一个互斥变量，只是语义上升级为"智能体"。

### 四种协作模式

| 模式 | 消息流向 | 实用价值 | 适用场景 |
|------|---------|---------|---------|
| **顺序工作流** | 线性链式，每Agent覆盖消息 | 最高 ★★★★★ | 多步骤任务、编码智能体 |
| **群聊** | 广播给所有参与者 | 中 ★★★ | 多Agent协商 |
| **辩论** | 轮流发言+聚合汇总 | 低 ★★ | 数学/科研难题 |
| **反思** | 链式+原路返回审批 | 低 ★★ | 审批流程 |

**顺序工作流**是最有实际工程价值的模式。

### AgentChat高层抽象

AutoGen底层（直接使用 `autogen-core`）需要手动定义消息类、消息处理器、注册逻辑，代码冗长。AgentChat（`autogen-agentchat`）提供了更简洁的接口：

```python
agent = AssistantAgent(
    name="assistant",
    model_client=OpenAIChatCompletionClient(model="gpt-4o-mini"),
    tools=[my_tool],
    system_message="系统提示词"
)
result = await agent.run(task="用户任务")
```

### 消息分层（MCP/A2A的前身）

AgentChat将消息分为两类，预示了后来的协议标准：

| 消息层 | 通信对象 | 后来的标准化协议 |
|--------|---------|----------------|
| 外部消息 | Agent ↔ Agent | [[a2a-protocol]] |
| 内部事件 | Agent ↔ 工具 | [[mcp-protocol]] |

### OpenAI Swarm的Handoff概念

Swarm引入了**移交（Handoff）**机制：分诊台Agent自动判断用户意图并转移到专业Agent，支持移交给人工（Human-in-the-Loop）。这是多Agent系统中实用价值较高的设计模式，适合客服、医疗分诊等场景。

### 框架演化路径

```
AutoGen底层 → AgentChat（高层抽象）
                    ↓
工具解耦 → MCP协议
Agent通信 → A2A协议
```

### 调试建议

```python
import logging
logging.basicConfig(level=logging.INFO)
# 开启后可看到完整的工具调用链路
```

## Key Takeaways

- MAS的工作模式是**有限的设计模式组合**，不是完全自主的智能协作
- 顺序工作流是工程实践中价值最高的模式
- AgentChat将复杂的底层通信封装为简洁API，是推荐的生产使用方式
- 消息格式设计是MAS中最难的部分，统一格式才能保证多Agent顺畅通信
- MCP+A2A的出现使工具调用和Agent间通信趋于标准化，降低了MAS的工程复杂度

## See Also

- [[multi-agent-system-fundamentals]] — MAS基础概念、设计原则、框架对比
- [[mcp-protocol]] — 工具与大模型解耦的标准协议
- [[a2a-protocol]] — Google提出的Agent间通信标准协议
- [[langgraph-multi-agent]] — LangGraph实现MAS的方式
