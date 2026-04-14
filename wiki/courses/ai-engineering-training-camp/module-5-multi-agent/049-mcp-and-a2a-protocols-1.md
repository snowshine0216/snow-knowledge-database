---
tags: [mcp, model-context-protocol, a2a, agent-to-agent, function-calling, tools, resources, prompts, sse, stdio]
source: https://u.geekbang.org/lesson/818?article=927465
---

# MCP（模型上下文协议）深度解析

## Key Concepts

### MCP 三层架构（C/H/S，非 C/S）
| 角色 | 职责 |
|------|------|
| **Host（主机）** | 与 LLM 直接交互；管理上下文；拼接 Prompt；决策是否调用 Server。MCP 的智能核心。 |
| **Client（客户端）** | Host 与 Server 之间的中间件；负责 JSON-RPC 协议转换和连接维护；无业务逻辑。 |
| **Server（服务器）** | 声明并提供工具/资源/提示词；无 AI 逻辑；输出可预测且可靠。 |

Host 与 Client 是**包含关系**，Host 内嵌 Client，官方 C/S 图常导致误解。

### 三种原语
- **Tool（工具）**：执行动作能力，当前使用最广；几乎取代 Resource。
- **Resource（资源）**：只读数据（日志/文件/配置），实际使用较少（安全风险+工具可替代）。
- **Prompt（提示词模板）**：服务端提供的操作剧本，实际使用极少（本地维护更方便）。

### MCP vs Function Calling
| | Function Calling | MCP |
|--|--|--|
| 本质 | 模型的决策能力（手） | 基础设施协议（神经系统） |
| 工具位置 | 本地，随调用注入 | 远程 Server，通过协议发现 |
| 类比 | GRPC 调用本地方法 | GRPC 连接远程服务 |
| 关系 | 互补，可结合 | 互补，可结合 |

### 传输类型
- **stdio**：本地进程通信（标准 I/O）。
- **SSE（Server-Sent Events）**：远程 HTTP 服务，Client 只需配置 URL 即可连接。

## Key Takeaways

- MCP 是 **C/H/S 三层结构**，不是 C/S；Host 是智能核心，Client 只做通信中间件。
- Server 不含任何 AI 逻辑，结果必须可预测；把大模型塞进 Server 是错误用法。
- 三种原语中，当前实践几乎只用 **Tool**；Resource 和 Prompt 设计初衷好但落地少。
- MCP ≠ Function Calling：前者是协议/基础设施，后者是模型能力；两者互补不替代。
- 工程建议：内部接口用 Function Calling（调试方便、稳定）；外部 API 用 MCP（第三方维护质量高）。
- 单个 Agent 工具数量建议 ≤3；超过时考虑拆分为多 Agent 系统。
- 判断用单 Agent 还是 MAS：单领域/少工具→单 Agent；多领域/多系统→MAS。

## See Also

- [[009-function-calling-and-mcp-basics]]
- [[048-agent-collaboration-frameworks-3]]
- [[012-prompt-engineering-and-agent-design]]
- [[013-multi-agent-finetuning-deployment]]
