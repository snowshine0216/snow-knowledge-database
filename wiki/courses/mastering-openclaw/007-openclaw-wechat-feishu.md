---
tags: [openclaw, ai-agent, wechat, feishu, channel, integration, geektime]
source: https://time.geekbang.org/course/detail/101123301-963397
---
# OpenClaw 生态集成：接入微信与飞书

OpenClaw 安装后必须连接通讯渠道才能真正"开口说话"。微信接入最简单（官方直接支持，Qcolo 扫码即完成）；飞书需在飞书开放平台创建自定义应用获取 App ID + App Secret，适合企业/团队场景。

## Key Concepts
- **Channel 层作用**：接入通讯平台是让 OpenClaw 有"耳朵和嘴巴"的关键步骤，没有 Channel 就无法接收和回复消息
- **微信接入**：Qcolo → 设置 → 微信 → 扫码，或命令行运行官方连接命令扫码，两种方式效果相同
- **飞书接入**：需在飞书开放平台创建自定义机器人应用，获取 App ID + App Secret，配置消息读写权限
- **企业飞书优势**：与企业工具深度集成（会议、文档、日历），适合团队协作；微信适合个人日常

## Key Takeaways
- 个人用户首选微信（最简单）；企业用户首选飞书（与协作工具联动）
- 至少连接一个渠道后 OpenClaw 才算真正可用，建议安装当天就完成连接
- 连接成功后 OpenClaw 以联系人形式出现，即可开始 24h 随时对话

## See Also
- [[006-openclaw-curl-install]]
- [[004-openclaw-gateway-node-channel]]
