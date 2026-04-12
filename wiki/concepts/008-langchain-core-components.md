---
tags: [langchain, langgraph, autogen, multi-agent, tools, memory, function-calling, agent-framework]
source: https://u.geekbang.org/lesson/818?article=927425
---

# LangChain vs. LangGraph：工具箱与流程引擎

本文区分 LangChain 和 LangGraph 的定位，介绍 LangChain 三类核心组件（Tools、Agents、Memory），并通过 AutoGen 物流客服 Multi-Agent 演示展示 Agent 协同在实际业务场景中的应用。

## Key Concepts

- **为什么用框架**：手写 Function Calling JSON 易出错，且工具能否被调用取决于用户 Prompt 质量——工程化里不可接受。框架封装确保调用路径可靠。

- **LangChain = 工具箱**：提供模型调用、工具执行、链式组合的原材料（螺丝刀/锤子）。控制流线性/简单循环；0.3 版本之前文档混乱，之后改善。

- **LangGraph = 流程引擎**：管理"谁先执行、什么条件重试、失败走哪个分支"。支持复杂控制流：分支、循环、条件、并行。生产环境 Agent 工作流首选。

- **LangChain 三大核心组件**：
  - **Tools**：封装 Function Calling，支持自定义（搜索/计算/API）
  - **Agents**：内置 ReAct（思考→行动循环）和 Plan-and-Execute（先规划再执行）
  - **Memory**：短期记忆（会话上下文）+ 长期记忆（持久化用户数据）

- **AutoGen 多 Agent 协同**：微软框架，用于 Multi-Agent 编排。演示场景：物流客服系统，四个专业 Agent（客服接待/订单/物流/库管）协作处理订单查询、缺货、延误三类问题。

- **学习路径建议**：先建立分层架构认知，再从代码（05.py LangChain/06.py AutoGen）入手理解组件，比从官方文档或教程快得多。

## Key Takeaways

- LangChain 管工具，LangGraph 管流程——不要混用定位
- LangChain 不是完整系统，通常取其某几个组件配合其他工具使用
- AutoGen/CrewAI/MetaGPT 等 Multi-Agent 框架降低了实现难度，但提高了架构设计难度

## See Also

- [[007-llm-invocation-and-function-calling-basics]]
- [[006-what-is-ai-engineering]]
