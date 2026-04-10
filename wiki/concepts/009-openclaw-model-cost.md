---
tags: [openclaw, ai-agent, cost-optimization, model-routing, llm, pricing, geektime]
source: https://time.geekbang.org/course/detail/101123301-963460
---
# OpenClaw 极致性价比：模型分层路由策略

不要让 Claude Opus 做倒垃圾的工作。95% 的日常任务（翻译、查询、记录）用国产便宜模型（Kimi/DeepSeek）完全胜任，只有 5% 复杂任务才需要顶级模型。按此分层配置 Primary/Fallback 模型，每月成本可控制在咖啡钱级别。

## Key Concepts
- **任务分层**：95% 简单任务 → 国产便宜模型；5% 复杂任务 → Claude Opus，是降本核心
- **Primary/Fallback 配置**：OpenClaw 支持主备模型路由，主模型失败自动切换备用
- **成本对比**：Claude Opus 输入 $3/M tokens；Kimi/DeepSeek 约 ¥0.75/M tokens，差距 10-20 倍
- **预算熔断**：必须设置每日 API 上限（5-10 元），防止 Agent 错误循环导致天价账单
- **输出贵于输入**：输出 token 价格约为输入的 5 倍，Agent 大量输出使模型选择更关键

## Key Takeaways
- 黄金法则：把对的任务交给对的模型，不要一刀切用最贵模型
- 推荐组合：Kimi 为主 + Claude Opus 为备 + 每日 5-10 元上限
- 预算上限是必须配置项，不是可选项——Agent 循环失控是真实风险

## See Also
- [[004-openclaw-gateway-node-channel]]
- [[008-openclaw-cloud-deploy]]
