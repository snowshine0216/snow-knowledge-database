---
tags: [langchain, agent, react, tool-use, langgraph, function-calling, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927454
---

# LangChain Agent: ReAct & Tool Use

ReAct（Reasoning + Acting）是让大模型以"思考→行动→观察"循环处理复杂任务的 agent 模式，通过提示词驱动而非硬编码逻辑，适合步骤动态变化的任务场景。LangChain 通过 `create_react_agent` 和 `@tool` 装饰器提供了完整的实现支持。

## Key Concepts

- **ReAct 循环**: Thought（思考当前状态和下一步）→ Action（选择工具和参数）→ Observation（观察工具返回结果）→ 重复直到 Final Answer
- **`create_react_agent`**: LangChain 工厂函数，三个必填参数：`llm`（模型）、`tools`（工具列表，可为空但必须传）、`prompt`（ReAct 提示词模板）
- **`AgentExecutor`**: 负责执行 agent 的运行时容器，支持 `verbose`、`max_iterations`、`handle_parsing_errors` 等安全参数
- **`@tool` 装饰器**: 将普通 Python 函数注册为 agent 工具，自动提取函数名为 `name`、三引号 docstring 为 `description`、函数参数为 `args` schema；description 是大模型判断何时调用工具的依据
- **`handle_parsing_errors=True`**: 工具调用失败时将错误信息返回给大模型，防止大模型编造错误答案
- **DuckDuckGoSearchRun / DuckDuckGoSearchResults**: LangChain Community 内置的免费搜索工具，前者返回纯文本，后者返回带来源链接的结构化结果
- **ReAct vs 状态机**: ReAct 适合步骤动态的创作/研究类任务；有限状态机（FSM）适合流程固定的审批/订单处理，LangGraph 更适合实现 FSM
- **Human-in-the-Loop（HIL）**: ReAct 循环中插入人工决策节点，大模型以 JSON 格式返回选项，用户选择后流程继续
- **多层 ReAct**: 大任务→to-do 清单→每个子任务套小 ReAct 循环→整体复盘，是生产级写作助手等产品的实际架构

## Key Takeaways

- ReAct 的动态性在于"步骤"动态，工具集是预定义固定的，不能运行时随意增加
- 工具的 docstring 必须使用三引号，大模型无法读取单行注释作为 description
- 生产必须设置 `max_iterations` 和 `handle_parsing_errors`，防止无限循环和幻觉输出
- 流程固定的业务（如发票审批）不适合 ReAct，应使用 LangGraph 状态机
- 多 agent 协作时，可以把下游 agent 当作工具传入上游 agent 的 tools 列表

## See Also

- [[langchain-memory-management]]
