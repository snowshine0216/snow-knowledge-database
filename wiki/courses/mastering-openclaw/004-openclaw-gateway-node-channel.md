---
tags: [openclaw, ai-agent, architecture, gateway, node, channel, unix-philosophy, geektime]
source: https://time.geekbang.org/course/detail/101123301-956203
---
# OpenClaw 三层架构：Gateway、Node、Channel

OpenClaw 的核心运行机制建立在三层架构之上：Gateway（网关）作为中央大脑负责任务调度和记忆管理，Node（节点）作为执行手臂在本地运行 shell 命令和操作文件，Channel（通道）作为适配层连接微信、飞书、钉钉、Slack 等即时通信平台。这三层共同实现"无处不在的 AI 助手"体验。

## Key Concepts
- **Gateway**：系统总控中央，监听 `127.0.0.1`（不对外暴露），负责记忆管理（对话上下文+长期记忆）、AI 员工选派、消息路由
- **Node**：本地执行层，直接操作电脑（shell、文件、API 调用），是连接大脑与现实世界的"手臂"
- **Channel**：平台适配层，用户在最熟悉的聊天软件里直接交互，无需学习新工具
- **命令行即终极接口**：只给 AI 基础 shell 工具 + 强大模型，让它自主组合完成任意任务——比预建专用工具灵活强大得多
- **本地优先隐私**：所有数据以文件形式存储在本地，不依赖第三方服务器

## Key Takeaways
- 三层架构的可组合性是 OpenClaw 超越传统聊天 AI 的关键——一条消息可触发多步自主执行链
- Gateway 的本地化（127.0.0.1）是安全设计，不是限制
- "给工人万能工具箱而非特定白手套"的设计哲学让 AI 能应对任意未知任务，代价是必须使用强模型
- 记忆分层（日常→对话→长期）使 AI 能建立真正长期的工作关系

## See Also
- [[002-openclaw-digital-employee]]
- [[openclaw-architecture]]
