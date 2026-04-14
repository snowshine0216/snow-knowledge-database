---
tags: [python, conda, virtual-environment, api-key-security, llm-invocation, function-calling, tool-calling, mcp]
source: https://u.geekbang.org/lesson/818?article=927424
---

# 大模型调用基础与 Function Calling 设计哲学

本文覆盖 AI 工程化的能力层基础：Python 虚拟环境工程规范、API Key 安全管理、大模型三种调用方式，以及 Function Calling 的核心设计哲学。重点在于理解为何 Function Calling 是两步交互（tool_call JSON → 客户端执行 → 再次请求），以及它如何实现模型与业务逻辑的解耦。

## Key Concepts

- **虚拟环境**：AI 项目必须用 Conda/venv 隔离依赖，AI 框架版本迭代快，工具链脆弱。`pip freeze > requirements.txt` 用于迁移；**不要在已有环境上升级 Python 版本**。

- **API Key 安全**：用 `python-dotenv` 加载 `.env`（文件放在项目目录外或加 `.gitignore`）；工程化设计 API 时应提供额度限制、过期时间和开关三要素。冲突规则：`load_dotenv()` 默认不覆盖已有环境变量。

- **三种调用方式**：OpenAI 官方 API（版本变动风险）→ 厂商 SDK（稳定但厂商绑定）→ HTTP POST 封装（最通用，屏蔽差异）。推荐封装为统一 `query()` 函数，底层可随时替换。

- **Function Calling 两步走**：模型输出 tool_call JSON（不执行！）→ 客户端执行工具函数 → 结果追加消息历史 → 再次请求模型得到最终答案。工具**在客户端执行，不在模型端**。

- **Function Calling 解耦价值**："要不要查"由模型决定，"具体怎么查"由函数负责——模型与实现彻底解耦，扩展只需增加工具定义，不改主流程。

- **vs. 硬编码**：硬编码控制流静态固定、扩展需改代码、错误处理局限；Function Calling 动态决策、增量扩展、支持 fallback/重试/验证。

## Key Takeaways

- AI 工程化环境管理不能偷懒——虚拟环境和依赖锁定是基本功
- Function Calling 是两步，返回的是 JSON 不是执行结果——理解这点是理解 MCP 的前提
- 封装 `query()` 函数屏蔽厂商 API 差异，是生产环境的标准做法

## See Also

- [[006-what-is-ai-engineering]]
- [[008-langchain-core-components]]
