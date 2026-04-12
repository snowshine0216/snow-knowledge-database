---
tags: [langchain, agent, tool-calling, redis, caching, pydantic, python-engineering, practice, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927431
---

# LangChain 多任务问答助手实战

Project 1 工程实践：用 LangChain LCEL 构建支持天气查询和新闻搜索的多任务问答助手，重点讲解 Python 项目工程化三件套（venv / requirements.txt / .env）、工具调用追踪、Redis 缓存与 Pydantic 类型验证。

## Key Concepts

- **工程化三件套**：venv（虚拟环境隔离）+ requirements.txt（依赖锁定）+ .env（密钥管理，不提交 Git）——Python 项目交付必备，缺一不可。
- **LangChain LCEL 工具链**：`ChatPromptTemplate` → `ChatOpenAI.bind_tools(tools)` → `create_tool_calling_agent` → `AgentExecutor`；工具由 `@tool` 装饰器 + docstring 描述触发。
- **工具调用追踪**：`AgentExecutor(return_intermediate_steps=True)` 返回 `intermediate_steps`，提取 `step[0].tool` 得到 `used_tools`，是调试工具选择的核心手段。
- **Redis 缓存 API 结果**：天气等有时效性数据缓存 24 小时（`SETEX`），通过 `elapsed_ms` 对比验证缓存效果，降低 API 调用成本。
- **Pydantic 类型验证**：Python 动态类型不自动验证，Pydantic 在运行时强制验证参数类型，防止调用方传入错误类型导致难以定位的 Bug。
- **Session ID 隔离**：每个用户独立 session_id + 独立线程，防止 Redis 中用户画像相互污染（对应 [[012-prompt-engineering-and-agent-design]] 的经典 Debug 案例）。
- **包结构**：`agents/qa.py`（LangChain 链）、`tools/weather.py`（`@tool` 封装高德 API）、`config/settings.py`（.env 加载）、`call/logging.py`（日志模块化）。

## Key Takeaways

- 工程化拆分多个文件与单文件实现功能完全相同——拆分是为了可迁移和可维护
- LangChain `RedisChatMessageHistory` 需手动维护历史；LangGraph 原生支持，下一模块覆盖
- `.env.example` 提交 Git，`.env` 绝不提交；`pip freeze > requirements.txt` 在每次新增依赖后运行
- 缓存验证：对比 `elapsed_ms`（首次 vs 再次）才能证明缓存真正生效

## See Also

- [[010-langchain-core-components-detailed]]
- [[012-prompt-engineering-and-agent-design]]
- [[015-multi-agent-customer-service-practice]]
