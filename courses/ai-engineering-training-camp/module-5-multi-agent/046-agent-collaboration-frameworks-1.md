---
tags: [autogen, mas, agent-collaboration, workflow, group-chat, debate, reflection, agentchat, mcp, a2a]
source: https://u.geekbang.org/lesson/818?article=927462
wiki: wiki/concepts/autogen-collaboration-patterns.md
---

# 046: 主流Agent协作框架对比与案例（一）

**Source:** [2主流 Agent 协作框架对比与案例1](https://u.geekbang.org/lesson/818?article=927462)

## Outline
- [本节课结构](#本节课结构)
- [重新理解MAS的本质](#重新理解mas的本质)
- [AutoGen顺序工作流（Sequential Workflow）](#autogen顺序工作流sequential-workflow)
- [AutoGen群聊模式（Group Chat）](#autogen群聊模式group-chat)
- [AutoGen辩论模式（Debate）](#autogen辩论模式debate)
- [AutoGen反思模式（Reflection）](#autogen反思模式reflection)
- [OpenAI Swarm与移交（Handoff）概念](#openai-swarm与移交handoff概念)
- [AgentChat：AutoGen的高层抽象](#agentchat：autogen的高层抽象)
- [框架选择总结](#框架选择总结)
- [Connections](#connections)

---

## 本节课结构

本节课讲解MAS实现的三大技术框架：

1. **AutoGen**（微软）：详细讲解四种协作模式及代码实现
2. **LangGraph**：与AutoGen对比，补充多Agent模式
3. **MCP + A2A 协议**：解决框架共有问题——工具解耦与跨Agent通信标准化

> CrewAI因完全靠提示词驱动、不涉及工程编程能力，本节不展开讲解。

---

## 重新理解MAS的本质

### MAS不是你想的那么"智能"

AutoGen的核心模式只有四种（顺序工作流、群聊、辩论、反思），没有任何框架能让Agent完全自主决定"谁该干活、谁不该干活"。

**关键认知**：

> 多Agent工作流 ≈ 以前的单Agent工作流，只是节点从"函数/工具"升级为"完整的Agent"。

| 以前的工作流节点 | 现在的MAS节点 |
|----------------|---------------|
| 大模型调用节点 | 具备工作流能力的Agent |
| 知识库查询节点 | 具备RAG能力的Agent |
| 数据库操作节点 | 具备数据库工具的Agent |

类比："以前组装器官（手、嘴、脑、眼），现在组装完整的人。"

### MAS vs 单Agent + 长提示词

| 方案 | 优点 | 缺点 |
|------|------|------|
| **单Agent + 复杂提示词** | 架构简单，无通信开销 | 提示词极度复杂；对模型能力要求高；状态管理困难 |
| **MAS多Agent** | 每个Agent职责单一；提示词简单；可并行 | 通信机制复杂；设计难度高 |

**实际建议**：能用单Agent（包括复杂提示词方式）解决的，优先单Agent；当单Agent的上下文长度和提示词复杂度超出可控范围时，考虑拆分为MAS。

---

## AutoGen顺序工作流（Sequential Workflow）

### 架构模式

```
用户输入 → Agent1（概念提取）→ Agent2（内容撰写）→ Agent3（格式校对）→ Agent4（用户展示）
```

特点：每个Agent按固定顺序依次执行，不可跳过中间节点。

### 核心代码结构

```python
from autogen_core import SingleThreadedAgentRuntime

@dataclass
class Message:
    content: str  # 所有Agent共享同一消息格式，读取后覆盖

class ConceptExtractAgent(RoutedAgent):
    @message_handler
    async def handle_message(self, message: Message, ctx: MessageContext):
        # 读取消息，通过大模型处理，发布新消息覆盖原有内容
        result = await self.llm_call(self.system_prompt, message.content)
        await self.publish_message(Message(content=result), ...)

# 初始化并注册四个Agent
runtime = SingleThreadedAgentRuntime()
await runtime.register("ConceptExtract", ConceptExtractAgent, ...)
await runtime.register("Writer", WriterAgent, ...)
# ... 注册剩余Agent

# 启动并发送初始消息
await runtime.start()
await runtime.publish_message(Message(content=user_input), ...)
await runtime.stop_when_idle()
```

### 关键设计原则

- **消息格式是MAS设计的难点**：所有Agent必须共享一个统一的消息格式，设计不当会导致通信障碍
- **顺序工作流是所有模式中最有实用价值的**，适合把每个步骤拆分为专家Agent

### 实际应用案例

**Cursor/Trae类编码智能体的工作方式：**
1. 任务分解Agent：将用户需求拆解为N个步骤（如"做一个淘宝"→10个步骤）
2. 编码Agent：对每个步骤生成代码
3. 代码质量检查Agent：验证生成的代码
4. 结果追加到消息列表（非覆盖，而是追加）
5. 汇总Agent：整合所有步骤的结果

---

## AutoGen群聊模式（Group Chat）

### 架构模式

消息发给**所有**参与者，所有Agent共享同一个群聊上下文。

```
用户 → GroupChat（所有Agent共有）
     ↓
  GroupChatManager 决定下一个发言人
     ↓
  某Agent发言 → 再次广播给所有人
     ↓
  直到终止条件满足
```

### 特点
- 每条消息所有Agent都能看到
- 通过 `group_chat_message` 将消息持续广播
- 适合需要多Agent讨论、协商的场景
- **实际使用较少**，了解即可

---

## AutoGen辩论模式（Debate）

### 架构模式

多Agent多轮交互，每个Agent的发言其他Agent都能听到，最后由聚合Agent汇总答案。

```
聚合Agent → 分发问题给各求解Agent
求解Agent1 → 处理后发给下一个Agent
...
求解AgentN → 处理完毕
聚合Agent → 收集所有答案并汇总
```

### 适用场景
- 数学难题求解
- 科研性问题的多角度分析

### 局限性
- 实测效果：大量消耗token，但没有发现特别新颖的解法
- 实际上聚合器更多作为**任务分发器**，而非真正的聚合器

---

## AutoGen反思模式（Reflection）

### 架构模式

Agent生成答案后，传给审核Agent，审核后原路返回（支持链式/树形结构）。

```
Agent1 生成 → Agent2 审核 → Agent3 再审核
     ↑_____________↓（原路返回）
```

### 本质
更像一个**审批链**（批准/拒绝流程），而非真正的"反思"。

理论上可以挂载树形结构实现深度/广度遍历，但实际场景较少，且消耗较大。

### AutoGen四种模式总结

| 模式 | 消息流向 | 主要用途 | 实用价值 |
|------|---------|---------|---------|
| **顺序工作流** | 线性链式 | 多步骤任务处理 | ★★★★★ 最高 |
| **群聊** | 广播给所有人 | 多Agent协商讨论 | ★★★ |
| **辩论** | 轮流发言+聚合 | 数学/科研难题 | ★★ |
| **反思** | 链式+原路返回 | 审批流程 | ★★ |

---

## OpenAI Swarm与移交（Handoff）概念

OpenAI 在实验框架 Swarm 中引入了 **Handoff（移交）** 概念：

### 分诊台模式

```
用户（病人）→ 分诊台Agent → 自动分流到对应科室Agent
                          ├── 外科Agent（有自己的知识库+工具+历史记忆）
                          ├── 内科Agent
                          └── 无法分类 → 移交人工处理
```

### 特点
- 分诊台Agent自动判断用户意图并转移到专业Agent
- 专业Agent携带自己的知识库、工具、用户历史记忆
- 支持**移交给人工**（Human-in-the-Loop）
- 实用价值高，但AutoGen底层实现较为复杂

---

## AgentChat：AutoGen的高层抽象

### 背景

AutoGen 底层代码较为复杂（需要手动定义消息格式、消息处理器、注册流程），因此提供了更高层次的抽象包：**AgentChat**（`autogen-agentchat`）。

类比：LangChain → LangGraph 的进化逻辑。

### AgentChat的核心改进

**1. 更简洁的Agent定义（AssistantAgent）：**

```python
from autogen_agentchat.agents import AssistantAgent

agent = AssistantAgent(
    name="assistant",
    model_client=OpenAIChatCompletionClient(model="gpt-4o-mini"),
    tools=[my_tool_function],
    system_message="你是一个专业助手"
)

# 运行
result = await agent.run(task="找到关于AutoGen的信息")
```

只需四项：名称、模型、工具、系统提示词。

**2. 消息分层管理：**

AgentChat将消息分为两类（这正是后来MCP和A2A协议的雏形）：

| 消息类型 | 通信对象 | 管理方式 |
|---------|---------|---------|
| Agent-to-Agent消息 | 不同Agent之间 | 外部通信（后来由A2A协议标准化） |
| Agent内部事件 | Agent与其工具 | 内部通信（后来由MCP协议标准化） |

**3. 团队（Team）概念：**

多个Agent组成一个Team，Team内部通过消息完成通信，执行顺序通过注册时指定。

**4. 流式输出支持：**

```python
# 非流式
result = await agent.run(task="...")

# 流式输出（效果更好，token消耗实时可见）
async for chunk in agent.run_stream(task="..."):
    print(chunk)
```

**5. MCP工具集成：**

```python
# 通过MCP协议连接外部工具服务器
# 使用 stdio server + UVX 方式调用MCP服务
```

### 调试建议

开发时打开 INFO 级别日志，可看到完整的工具调用过程：

```python
import logging
logging.basicConfig(level=logging.INFO)
```

---

## 框架选择总结

| 框架 | 适用场景 | 推荐程度 |
|------|---------|---------|
| **AutoGen + AgentChat** | 需要工程化MAS系统；复杂工作流；代码开发类 | ★★★★★ |
| **CrewAI** | 快速演示；RPA；初学者入门 | ★★★（不适合生产） |
| **LangGraph** | 已有LangGraph项目；需要细粒度状态控制 | ★★★ |

### 为什么CrewAI社区最火但不适合生产？

最终抽象后，影响MAS效果的关键因素是**提示词质量**；工具连接用MCP，Agent间通信用A2A。CrewAI在这套新标准下最轻量，因此社区热度最高。但对于工程化开发，还是需要更底层的控制能力。

### 演化路径

```
AutoGen底层（复杂）
    → AgentChat高层抽象
        → MCP解决工具解耦
            → A2A解决Agent间通信标准化
```

---

## Connections
- → [[autogen-collaboration-patterns]]
- → [[multi-agent-system-fundamentals]]
- → [[mcp-protocol]]
- → [[a2a-protocol]]
- → [[langgraph-multi-agent]]
