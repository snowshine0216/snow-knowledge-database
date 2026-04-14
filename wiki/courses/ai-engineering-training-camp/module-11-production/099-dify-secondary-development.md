---
tags: [dify, secondary-development, plugin, mcp, external-knowledge-base, langfuse, nginx, postgresql]
source: https://u.geekbang.org/lesson/818?article=930881
---
# Dify 二次开发实践

Dify 二开最关键的一步不是写代码，而是判断"是否真的需要二开"。本讲从 `dify.ai` 官方文档的四个维度（使用 / 自托管 / API / 插件）出发，给出优先级明确的决策路径：**MCP → API → 外部知识库 → 插件 → Admin Server 旁路**，层层下沉，只有前五步都不能覆盖时才修改 Dify 核心代码。参考实现 Dify-Plus 展示了如何在不动 API 代码、只改 NGX 反代与 PostgreSQL 读取的约束下，交付完整的用户与额度管理后台。

## Key Concepts

- **Built-in extensions first**: MCP、API 调用、外部知识库、知识库管理 API、插件 — 这五类能力无需二开即可覆盖多数需求。判据是"需求能不能用管道语义描述"，能就走 MCP。
- **External Knowledge Base Protocol**: Dify 允许外接自研检索。协议硬性要求：HTTP POST + `Authorization: Bearer <api-key>`；请求体含 `knowledge_id`、`query`、`retrieval_setting`（top_k、score threshold）、`metadata_condition`；返回格式为 `metadata / score / title / content` 数组。保存配置时 Dify 会先发一次 ping — 认证失败则返回 `auths_failed`，配置不生效。
- **Dify-Plus 架构**: 开源企业增强项目，基座是 **Dify 1.8.1**。核心做法 — NGX 新增 `location = /gang/admin` 反代到 `:8081`，Admin Server（Go + GORM/GVADB）直读 PostgreSQL；PostgreSQL 仅做微量 schema 增加；前端在 Dify 原界面"挖洞"（加按钮、URL 跳转）。**对 Dify 核心 API 代码零修改**。
- **插件三件套**: Schema（YAML：工具名称、类型、中英文描述、参数）+ 实现类（继承 Dify `Tool` 基类，实现 `_invoke`）+ Credentials 类（继承 `ToolProviderCredentialsValidation`，实现 `_validate_credentials`）。官方示例 `slack-bot` 是入门范本（早期版本是微信 / 钉钉，因版权改为 Slack）。
- **反向调用 Dify**: 插件内通过 `session.model.llm.invoke(...)` 回调 Dify 其他 LLM、工具、工作流、节点，实现"工作流 → 自研插件 → Dify LLM"的组合。
- **版本与 Roadmap**: 进入 Dify 任意界面右上角都有 Roadmap，功能状态分 **Complete / In Progress / In Preview / In Plan**。二开前先查 Roadmap — 想要的能力若已 Complete（例如 MCP）直接升级；若 In Progress 就评估自己做是否比官方更快。
- **可观测性选型**: LangFuse（开源，支持自托管，有付费版） / LangSmith（闭源，云端付费） / Opik（开源，免费）。Dify 官方文档"使用 → 监控"章节已内置集成入口。

## Key Takeaways

- 80% 的"二开需求"其实不需要改 Dify 源码 — 用 MCP / API / 外部知识库 / 插件 四条路径就能交付。
- 真正需要改代码的场景只剩两类：**用户与额度管理** 和 **多租户**；后者是 Dify 商业化付费功能，不建议社区版重造。
- Dify-Plus 给出的架构范式适合所有"企业管理层"二开：NGX 挖洞 + 旁路 Admin Server + 直读 PostgreSQL，零 API 代码修改。
- 部署必须选 Linux 或 macOS；Windows 需要 WSL（虚拟机）且配置困难。源码部署后只需运行 API 服务器 + Worker + PG + Redis，原生前端可丢弃。
- 写插件比写二开代码简单得多 — 所有扩展能力都应先考虑是否可以封装成插件。
- 升级成本是二开的最大隐性负债；一切"增加而非修改"的设计都是为了让 Dify 版本能继续滚动升级。

## See Also

- [[098-ai-ethics-compliance-governance]] — 上一讲，AI 伦理数据合规与治理
- [[049-mcp-and-a2a-protocols-1]] — MCP 协议基础
- [[050-mcp-protocol-part-2]] — MCP 服务器构建实践
- [[langchain-memory-management]] — LangChain Memory 机制，Dify 外部知识库可参考
