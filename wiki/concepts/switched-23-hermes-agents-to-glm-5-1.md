---
tags: [ai-agents, glm, hermes, multi-agent, llm-comparison, telegram, rate-limiting, zhipu]
source: https://mp.weixin.qq.com/s/iAu5VRfFHXA8oqXJQbElvw
---

# 把23个Hermes Agent从GPT切到GLM-5.1的实战经验

作者将运行在Hermes框架上的23个AI Agent从GPT全部迁移至智谱GLM-5.1，原因是GPT成本高且输出啰嗦。切换极简（改两行config，5分钟完成），实测一天跑1556条消息，成本砍半，但多Agent并发触发rate limit是最大硬伤。

## Key Concepts

- **Hermes Agent框架**：开源多平台（Telegram/Discord/CLI）AI Agent框架，支持多模型切换，全局配置中心化于`~/.hermes/config.yaml`，改provider两行即可切换所有Agent的底层模型
- **GLM-5.1编程API**：智谱推出的面向Agent场景的模型API，base_url为 `open.bigmodel.cn/api/coding/paas/v4`，zai provider依次查找 `GLM_API_KEY`、`ZAI_API_KEY`、`Z_AI_API_KEY` 三个环境变量
- **Bot-to-Bot Communication**：Telegram在@BotFather中新增的开关，允许Bot通过@提及或reply与其他Bot通信；Telegram Bot API 9.6（2026-04-03）进一步开放Managed Bots（Bot创建和管理其他Bot）——此前多Bot协作几乎不可能
- **Pipeline回调机制**：以JSON状态文件驱动的串行Agent流水线——主Agent派发Step N，子Agent完成后主动回调 `/pipeline-done <pipeline-id> step-N`，主Agent标记done并派发Step N+1，实现10步全链路自动推进（调研→PRD→预算→合规→SEO→设计→开发→部署→验收→推广）
- **并发rate limit（429）**：GLM-5.1最大硬伤，3–4个Agent同时跑即触发，应对策略：错峰调度（cron错开10分钟）+ 串行Pipeline + 自动retry

## Key Takeaways

- **切换5分钟**：Hermes配置中心化，`config.yaml`改两行 + Shell脚本同步23个profile，重启gateway即完成迁移，比想象中容易得多
- **执行力>表达能力**：Agent场景下"少废话"价值极高——GPT每次改配置都要先解释再总结，23个Agent叠加后效率损失显著；GLM-5.1直接干活不过场
- **调试能力超预期**：GLM-5.1能自主追根溯源（翻Telegram Bot API文档发现mention entity格式问题；查Hermes源码发现API Key命名规则；排查ALLOWED_USERS白名单过滤），作者原以为此能力只有Claude/GPT-5级别才有
- **Telegram多Bot协作2026年4月才成熟**：依赖Bot API 9.6的Managed Bots能力，之前Bot默认看不到其他Bot消息，多Bot自动协作流水线是这阵子才真正可行的新架构
- **成本砍半**：日常任务全走GLM-5.1，高并发场景fallback GPT；23个Agent的整体Token成本直接减少50%
- **串行Pipeline是当前最优架构**：既绕开了rate limit限制，又比并发更易追踪状态，10个Agent串行流水线一天内跑通
- **国产模型Agent差距被低估**：GLM-5.1执行力、调试能力、中文理解均达实用级别，差距主要在API层（并发限制）而非模型能力本身

## Key Numbers

| 数值 | 含义 |
|---|---|
| 23 | Agent总数 |
| 1556条 / 15 sessions | 切换首日总消耗 |
| 5分钟 | 全部Agent切换耗时 |
| 172条消息 | 小墨独立建站（hermes101.pages.dev）消耗 |
| 50% | 成本降幅 |
| 3–4 | 触发429的并发Agent数量阈值 |

## See Also

- [[hermes-agent-framework]]
- [[multi-agent-systems]]
- [[llm-comparison]]
