---
tags: [openclaw, ai-agent, installation, macos, curl, cli, api-key, geektime]
source: https://time.geekbang.org/course/detail/101123301-963180
---
# OpenClaw Mac 极速安装：curl 一键脚本

curl 命令行安装是 OpenClaw 在 macOS 上的推荐方式，安装原生完整版（相比 Qcolo GUI 版功能更全、版本更新）。单条 curl 命令自动检测芯片架构，全程无需手动配置，初次安装可全部跳过引导配置。

## Key Concepts
- **curl vs Qcolo**：curl 安装原生版（功能完整、版本最新）；Qcolo 是图形化简化版（适合体验）
- **架构自动检测**：脚本自动识别 Apple Silicon / Intel，选对应版本下载
- **全跳过策略**：初次安装引导（模型/Skills/Channel）全部选"稍后"，进系统后再配置更灵活
- **API Key 一次性显示**：Kimi/Claude 等 API Key 创建后必须立即复制，关闭后无法再查看
- **openclaw CLI**：`openclaw health` 健康检查，`openclaw upgrade` 升级，`openclaw --version` 查版本

## Key Takeaways
- 国内用户推荐 Kimi API：无需翻墙，直接访问，填入 OpenClaw 配置即可
- 安装报错多为警告，继续回车即可；网络中断重跑命令是幂等的
- 健康检查全绿 = 安装成功，下一步接入微信/飞书/钉钉

## See Also
- [[005-openclaw-local-vs-cloud-install]]
- [[004-openclaw-gateway-node-channel]]
