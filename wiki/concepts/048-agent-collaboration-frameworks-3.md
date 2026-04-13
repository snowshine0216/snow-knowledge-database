---
tags: [agent, multi-agent, langgraph, crewai, mas, supervisor, handoff, prompt-engineering]
source: https://u.geekbang.org/lesson/818?article=927464
---

# Agent 协作框架：LangGraph MAS、CrewAI 对比与提示词设计

## Key Concepts

### LangGraph 六种多 Agent 模式
Single Agent / Network / Supervisor / Supervisor-as-Tool / Hierarchical / Custom。核心三层：State（传递状态）、Node（执行单元，可嵌套子图）、Edge（流转路径）。

### Supervisor vs Network
- **Supervisor**：主管统一分发，下属互不通信；适合任务边界清晰的层级结构。
- **Network**：任意节点可互通；适合需要多方协商的场景。

### LangGraph Handoff 工具
通过 `create_handoff_tool(agent_name=...)` 工厂函数创建，执行后返回 `Command(goto=target_node)` 实现图内跳转。当前实现较底层（基于 Tool Calling 机制），预计未来会有更高层封装。

### CrewAI 声明式风格
通过 role/goal/backstory 声明 Agent，极少代码实现多 Agent 协作；Handoff 原生支持，写法比 LangGraph 更优雅。LangGraph 灵活但笨重，CrewAI 简洁但灵活性有限。

### 多 Agent 提示词设计四原则
1. **启发式**：描述能力边界，不写死行为。
2. **精准**：任务分配描述准确，避免歧义（歧义是流转错误的主因）。
3. **工具精简**：每个 Agent ≤3 个工具，相似工具导致调用混乱。
4. **工具描述细化**：明确用途（学术搜索 vs 通用搜索），防止模型误用。

## Key Takeaways

- LangGraph 适合需要精细控制图结构的复杂 MAS；CrewAI 适合快速构建标准化多 Agent 流程。
- 企业强制使用 LangGraph 往往是标准化需求，而非 LangGraph 本身更优。
- MCP 解决工具调用标准化；A2A 解决 Agent 间消息格式标准化——两者各司其职，互不替代。
- 拆分多 Agent 会引入消息传递复杂性，应尽量保持单 Agent，工具数超限再拆。

## See Also

- [[047-agent-collaboration-frameworks-2]]
- [[049-mcp-and-a2a-protocols-1]]
- [[009-function-calling-and-mcp-basics]]
- [[012-prompt-engineering-and-agent-design]]
