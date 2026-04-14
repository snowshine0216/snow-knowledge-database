---
tags: [multi-agent, mas, agent-design, distributed-systems, autogen, langgraph, crewai]
source: https://u.geekbang.org/lesson/818?article=927461
---

# Multi-Agent System Fundamentals

多智能体系统（Multi-Agent System，MAS）是由多个AI智能体协同工作的系统，通过分工协作实现单Agent难以完成的复杂任务。

## Key Concepts

### 为什么需要MAS

单Agent的智力水平存在上限。MAS的核心价值在于**集体智慧**——通过专业化分工降低整体错误率，并行处理突破单体上下文限制。

MAS在技术层面解决四类问题：
- **上下文过长**：长流程拆分为多个短上下文
- **错误传递**：各阶段错误隔离，防止放大
- **记忆管理**：专门的记忆Agent或外部存储
- **专业化分工**：不同Agent扮演不同专家角色

### Agent三要素

每个Agent必须具备：
1. **自主性**：接收目标，在约束下自主决策
2. **反应性**：对消息和环境变化产生响应
3. **目标导向性**：有明确的局部目标，服务于全局目标

### 通信是MAS最大的坑

通信机制需要处理：优先级、确认机制、重试机制、去重、过期/撤回。目前没有任何框架能完美解决多Agent通信问题。

通信方式选择：
- **同步**：简单但阻塞，适合低并发场景
- **异步**：高吞吐但需处理乱序、重复、丢失

### 主流框架对比

| 框架 | 特点 | 适用场景 |
|------|------|---------|
| [[autogen-framework]] | 功能完整，支持分布式 | 工程化MAS，代码开发 |
| [[crewai-framework]] | 提示词驱动，极简 | RPA，演示，入门 |
| [[langgraph-multi-agent]] | 图中套图，细粒度控制 | 复杂工作流 |

### 设计原则

- 从2个Agent开始，逐步扩展，尽量不超过3个
- 优先考虑单Agent + 上下文工程，MAS是最后手段
- 信息按需共享，避免状态爆炸
- 设计时必须考虑网络故障场景（网络分区容错）

## Key Takeaways

- MAS本质是**分而治之**，不是更智能，而是错误率更低、专业度更高
- MAS的天花板不一定比单Agent更高，但在专业领域错误率更低
- 难点在**架构设计**（通信、状态管理、容错），而非编码本身
- 业界对MAS存在分歧：Cognition主张单体Agent，LangChain中立，Anthropic两面押注
- "万能工具兜底"：工具超时时用大模型模拟返回，打标记让流程继续

## See Also

- [[autogen-collaboration-patterns]] — AutoGen四种协作模式详解
- [[mcp-protocol]] — Model Context Protocol，解决工具与模型解耦
- [[a2a-protocol]] — Agent-to-Agent协议，解决跨Agent通信标准化
