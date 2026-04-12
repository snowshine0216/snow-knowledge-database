---
tags: [ai-engineering, layered-architecture, multi-agent, design-patterns, mcp, function-calling, rag]
source: https://u.geekbang.org/lesson/818?article=927423
---

# AI 工程化：分层架构与 Multi-Agent 编排模式

本文整理了 AI 工程化训练营模块一的核心内容。课程从"什么是 AI 工程化"出发，以代码复杂度为切入点，引入八层逻辑架构和六层技术栈，厘清 MCP 与 Function Calling 的层级关系，并给出六种 Multi-Agent 编排模式的设计框架，帮助工程师从"能跑就行"的实验原型迈向可靠、可观测、可维护的工业级系统。

## Key Concepts

- **AI 工程化的触发条件**：代码简单时无需工程化（20 行 API 调用不需要维护性/扩展性考虑）；代码复杂化后，Prompt 管理（策略模式）、模型网关（负载均衡、服务发现）等问题自然涌现，分层架构是应对复杂度的核心方法。

- **八层逻辑架构（Greg 模型）**：基础设施层 → AI 智能体互联网层（A2A、Ray、信任系统）→ 协议层（A2A/ACP/AGP/MCP）→ 工具增强层（RAG、Function Calling）→ 认知推理层（ReAct、AutoGen）→ 记忆与个性化层 → 垂类智能层 → 运维治理层。**下层制约上层**——算力不足往下层扩硬件，而非在模型层调参。工程师主要在第 4、5 层工作。

- **MCP vs Function Calling**：MCP 处于协议层（第 3 层），Function Calling 处于应用层（第 5 层）。MCP 是 Function Calling 能力的标准化延展，不能替代——协议层规范通信，应用层执行逻辑。

- **六种 Multi-Agent 编排模式**：Prompt Chaining（条件分支）、Routing（意图识别路由）、Parallelization（多路并发 + 汇总，如多路 RAG）、Orchestrator-Workers（任务分拆编排）、Evaluator-Optimizer（ReAct 闭环）、Autonomous Agent（持续 Human-AI 交互，如 Manus）。

- **工程化挑战三类**：①AI 调用数据库——从 Prompt 拼接 Schema → Function Calling → Agentic RAG → Tool 封装（加权限控制和审计日志）；②复杂任务分解——TOT/GOT + 多 Agent + LangGraph DAG；③多 Agent 协同——流水线、并行裁决、辩论式三种组织方式。

- **传统 AI 开发 vs AI 工程化**：调用一次模型 vs. 多 Agent 分层；硬编码 Prompt vs. 流程控制 Prompt；"能跑就行" vs. 可靠/可控/可观测/可携带系统。

## Key Takeaways

- 分层是应对 AI 系统复杂度的核心方法；遇到问题先定位层级，再选解决方案
- MCP 扩展 Function Calling，两者不在同一层，不存在替代关系
- 六种编排模式是现成模板——套用模式比从头发明更快；遇到无法解决的 Multi-Agent 问题时对着六种模式逐一比对
- 在实效性保障前提下多 Agent 化是近 1–2 年 AI 工程化的核心趋势

## See Also

- [[005-fourth-qa-session]]
- [[ai-engineering-three-patterns]]
- [[003-second-qa-session]]
