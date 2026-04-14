---
tags: [multi-agent, autogen, customer-service, fastapi, retry, slot-filling, langchain, practice, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927432
---

# 多 Agent 协同客服系统实战

AutoGen GroupChat 构建多 Agent 客服系统的完整工程实践，涵盖五 Agent 角色设计、指数退避重试、槽位填充入口以及现场 Debug 的异常类型 Bug。

## Key Concepts

- **AutoGen GroupChat 架构**：`GroupChat`（持有 agents + 消息历史）+ `GroupChatManager`（LLM 驱动的调度器）自动决定下一个发言 Agent，无需手写路由逻辑。
- **五角色分工**：customer_reception（槽位填充提取 order_id）→ order_agent（订单 API FC）→ logistics_agent（物流 API FC）→ manager（汇总输出）→ user_proxy（对话入口）。
- **指数退避重试装饰器**：`@retry(min_wait, max_wait, max_retries)` + 随机 jitter 防惊群效应，参数从 `config/settings` 集中管理。
- **防死循环**：`max_round=12` 硬限制，与 [[013-multi-agent-finetuning-deployment]] 中的 `max_turns` 设计一致。
- **A2A 协议**：非 AutoGen 场景下多 Agent 间通信使用 Agent-to-Agent 协议。
- **FastAPI 模拟服务**：用 FastAPI mock 外部订单/物流 API，与生产服务解耦，便于本地联调。

## Key Takeaways

- GroupChatManager 的自动调度是 AutoGen 的核心价值——无需手写 Agent 路由
- 槽位填充是多 Agent 入口质量保障，接待 Agent 必须完成槽位填充才触发专职 Agent
- 重试异常类型不匹配是常见 Bug：`raise_for_status()` 抛 `HTTPError`，要显式捕获而非依赖父类继承
- 生产级重试三要素：指数退避 + 随机 jitter + 集中配置（不硬编码）

## See Also

- [[013-multi-agent-finetuning-deployment]]
- [[012-prompt-engineering-and-agent-design]]
- [[009-function-calling-and-mcp-basics]]
