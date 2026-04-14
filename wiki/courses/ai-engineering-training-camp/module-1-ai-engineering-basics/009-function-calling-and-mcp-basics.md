---
tags: [function-calling, tool-calling, mcp, agent, openai, api-design, security]
source: https://u.geekbang.org/lesson/818?article=927426
---

# Function Calling 深解与 MCP 对比

本文深入拆解 Tool Calling 的五步工作流程，阐明工具在客户端（非模型端）执行的核心机制，介绍工具定义最佳实践，并从分层架构角度对比 Function Calling 与 MCP 的定位差异与适用场景。

## Key Concepts

- **命名演变**：Function Calling → Tool Calling。Tool Calling 更准确——"工具由客户端持有并执行"，不是模型内部函数调用。Function 是 Tool 的一种，函数调用是工具调用的子集。引入时间：2023-06-13 随 GPT-4 Turbo。

- **Agent 起源**：工具调用 + 意图识别 + 任务规划 + 内循环（Agent Loop）= Agent。Agent 将感知（Prompt）、记忆（向量DB + SQL）、规划（推理模型）、工具调用（FC/MCP）整合在一起。

- **Tool Calling 五步流程**：①定义工具 + 问题一起发给模型 → ②模型返回 tool_call JSON（不是答案，finish_reason = "tool_calls"）→ ③客户端本地执行工具函数 → ④将工具结果追加消息历史再次请求模型 → ⑤模型整合结果生成最终答案。整个过程需要两次 API 请求。

- **工具定义最佳实践**：函数名清晰无缩写；用 enum 约束有限值参数（防模型乱填）；已知参数由代码填充不交给模型；单次工具数 < 20；优先用模型内置工具。name + description 共同决定模型是否正确选择工具。

- **Function Calling vs. MCP 定位**：FC 在应用层（工具执行机制），MCP 在协议层（工具获取标准）。两者不可替代。FC 适合内部 API/数据库（自己写工具，安全可控）；MCP 适合外部 SaaS（动态获取工具列表，无需写字典，但需审查安全）。

- **MCP 安全现状**：第三方工具可访问本地硬盘；客户端批准常被默认绕过；认证是单向的（验证服务使用权，不验证服务安全性）。企业生产仍以 Function Calling 为主，MCP 目前不成熟。

## Key Takeaways

- 调试工具调用出错时，逐步打印每阶段输出（发送工具列表 → tool_call JSON → 执行结果 → 最终消息），Function Calling 理解到底层才能排查上层 Agent/LangChain 问题
- 内部 API 用 Tool Calling，外部 SaaS 用 MCP——这是当前最佳实践
- 工具数量超过 20 会显著降低调用精度

## See Also

- [[007-llm-invocation-and-function-calling-basics]]
- [[006-what-is-ai-engineering]]
- [[008-langchain-core-components]]
