---
tags: [multi-tenancy, customer-service, ai-agent, rag, mcp, performance-testing, deployment, feishu, langgraph]
source: https://u.geekbang.org/lesson/818?article=930875
---

# 094: Supplementing Core Interaction Capabilities Part 3

AI客服项目收尾：多租户架构、前端开发、文档交付、压测、第三方渠道接入的综合实践。

## Core Concepts

### Multi-Tenancy (多租户)

两种隔离方案：

- **真隔离**：不同租户使用独立的 database 和向量 index，数据完全物理/逻辑隔离，适合 SaaS 多公司场景
- **假隔离**：共用同一张表，通过 `tenant_id` 字段区分，向量检索后按 metadata 过滤，成本低但安全性弱

前端通过 HTTP Header 中的 `Tenant-ID` 传递租户标识，后端据此路由到对应的知识库路径和数据库连接。

### Chrome MCP Server

将 Chrome 浏览器通过 MCP 协议接入 AI 开发工具（如 Claude / Cursor），使大模型可以直接读取页面 DOM、控制台错误、样式等，无需手动 F12 调试。三步安装：下载 GitHub 扩展 → 加载到 Chrome → 配置 MCP 服务地址。

### Third-Party Channel Integration

使用开源中转工具（如 wechat-chatgpt / 微差）将智能客服系统接入飞书、钉钉、企业微信等渠道。中转程序按 OpenAI 格式转发请求，需公网域名支持 Webhook 回调。

## Performance Testing Strategy

- 工具：Locust 进行 HTTP 并发压测
- 瓶颈分类：CPU（加 Nginx 负载均衡）、网络（优化调用链路）、GPU（扩容或降低要求）
- AI 专项：召回率 + 准确率，选核心5-6场景作为验收依据
- 客户对 QPS 的理解（并发用户数）与技术口径（真实请求量）存在差异，需对齐预期

## Delivery Documents

| 文档 | 关键内容 |
|------|----------|
| 架构设计 | 流程图（mermaid.live）、技术选型、多租户设计 |
| 部署说明 | 环境配置、启动步骤 |
| API 文档 | 接口列表、参数说明 |
| 性能报告 | 第三方压测结果、容量规划 |

大模型使用原则："掐住两头"——固定函数签名（输入）和输出格式，让模型填充中间逻辑，效果最佳。

## AI Landscape Trends

- RAG 已从独立主流方案降级为 Agent 工具链中的一个工具
- 提示词、工具未来将抽象为可复用技能（Skill）层
- 国产化合规路径：工具国产化 + 模型本地化（DeepSeek-70B / 千问开源）+ 国产 GPU

## Related Notes

- [[093-core-interaction-capabilities-2]]
- [[095-project-delivery-and-review]]
