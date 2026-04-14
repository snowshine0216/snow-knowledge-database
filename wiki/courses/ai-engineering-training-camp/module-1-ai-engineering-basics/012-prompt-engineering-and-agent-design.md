---
tags: [prompt-engineering, agent, slot-filling, intent-recognition, memory, state-machine, dialogue-design, jinja2, error-handling]
source: https://u.geekbang.org/lesson/818?article=927429
---

# Prompt 工程与 Agent 多轮对话设计

Prompt 是 AI 工程化控制层的核心，驱动工具调用、RAG 检索和 Agent 行为。本文涵盖生产级 Prompt 模板工程（Jinja2）、Agent 对话状态机设计、三层记忆架构、IR+SF 多轮对话框架，以及四级容错降级策略。

## Key Concepts

- **Prompt 高阶能力**：思维链（英文 CoT 比中文效果更稳定）、假设问题法（多角度反问验证答案可信度）、Safety Prompt + 后置过滤双层安全防护。
- **Jinja2 模板**：生产环境 Prompt 模板推荐用 Jinja2（支持条件判断、循环、变量插值），比 LangChain PromptTemplate 更符合工程习惯；用 Python 字典替代 switch/case 动态选择模板。
- **对话状态机（FSM）**：LangGraph、Coze、Dify 等所有工作流工具的底层技术支柱。设计要素：开始/结束节点、中间功能节点、节点间状态变量（单向 DAG 流转）。LangGraph 可移植，Coze 不可移植，Dify 可导出 DSL。
- **三层记忆**：Working Memory（上下文窗口，当前对话，延迟最低）→ Session Memory（Redis，会话级用户画像，跨设备可用）→ Long-term Memory（向量 DB + 结构化 DB，偏好历史，跨会话持久）。多人混用同一 Session ID 会污染用户画像。
- **IR（意图识别）**：只接管能处理的意图；涉钱/投诉直接转人工——AI 强行全接管会惹怒用户。
- **SF（槽位填充）**：三类槽：必填（为空追问）、可选（有更好）、依赖槽（前置解锁）。设计槽位依赖链（如城市确认 → 解锁酒店推荐）；偏离正常范围的槽值需反问确认。
- **四级降级**：重试（指数退避）→ 降级模型 → 规则引擎 → 转人工。保障服务连续性，任务必须能完成。

## Key Takeaways

- Prompt 安全没有完美方案，Safety Prompt + 后置过滤是当前最优组合
- 生产 Agent 不要试图接管所有意图，明确划定"不接"的边界反而提升用户满意度
- 对话状态机是 Agent 工作流的正确抽象，LangGraph 是其代码化实现
- Session ID 不要多人共用，用户画像污染是"时好时坏"的常见根因
- 四级降级策略缺一不可，无限等待和无限 AI 回答都是糟糕体验

## See Also

- [[009-function-calling-and-mcp-basics]]
- [[011-llamaindex-and-rag-systems]]
- [[006-what-is-ai-engineering]]
