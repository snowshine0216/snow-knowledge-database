---
tags: [openclaw, ai-agent, cloud, deployment, aliyun, tencent-cloud, server, geektime]
source: https://time.geekbang.org/course/detail/101123301-963414
---
# OpenClaw 云端一键镜像部署

云端部署让不懂服务器的小白也能 30 分钟内完成 OpenClaw 部署，实现 7×24h 不间断运行。核心是在阿里云/腾讯云选择 OpenClaw 一键镜像，主要成本来自 LLM API 调用而非服务器本身。

## Key Concepts
- **适用场景**：需要 24h 可用（不能让电脑持续开机）、开发者测试、多端访问
- **一键镜像**：腾讯云/阿里云镜像市场中选 OpenClaw 镜像，自动完成安装，无需手动配置
- **地区选择**：建议新加坡节点（国际 API 访问更顺畅）
- **主要成本是 LLM API**：服务器费用百元/年，但 LLM API 调用（Claude/Kimi）是月度变动成本，需监控
- **与本地部署后续一致**：部署完成后连接 Channel、安装 Skills 步骤相同

## Key Takeaways
- 云端 vs 本地唯一区别是服务器在哪里运行，配置和使用体验完全相同
- API 成本需警惕：Skills 配置不当可能导致循环调用，成本激增
- 国内推荐方案：一键镜像 + Kimi API，月度成本控制在百元内可行

## See Also
- [[005-openclaw-local-vs-cloud-install]]
- [[007-openclaw-wechat-feishu]]
