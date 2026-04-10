---
tags: [openclaw, ai-agent, installation, local-first, cloud, macos, deployment, geektime]
source: https://time.geekbang.org/course/detail/101123301-956205
---
# OpenClaw 部署选型：本地 vs 云端

安装 OpenClaw 前最关键的决策是选择本地还是云端部署。本地部署（尤其是 macOS）提供最完整的系统集成体验和数据主权，代价是需要保持电脑常开；云端部署提供全天候可用性，但数据在第三方服务器。

## Key Concepts
- **部署位置决定体验上限**：本地部署可深度集成 macOS 原生工具（Shortcuts 等），操作本地文件，实现真正的个人数字员工体验；云端无法直接操作本地资源
- **模型成本 > 托管成本**：无论本地还是云端，主要成本来自 AI 大模型 API，平台托管费用相对微不足道——选型时关注模型价格
- **数据隐私**：本地部署所有对话数据留在本机，云端数据存第三方服务器
- **Qcolo 一键安装**：macOS 图形化安装工具，下载 DMG → 拖入 Applications → 完成，适合新手快速体验
- **24h 常开要求**：本地部署需电脑持续运行，否则 Agent 无法响应消息

## Key Takeaways
- Mac 用户首选本地部署：macOS 原生集成最完整，真正实现"个人 AI 操作系统"
- 安装后两天内把日常工作习惯迁移进去，体验质变
- 验证标准：在微信里发"查北京天气并写入备忘录"，Agent 自动完成即代表部署成功

## See Also
- [[004-openclaw-gateway-node-channel]]
- [[002-openclaw-digital-employee]]
