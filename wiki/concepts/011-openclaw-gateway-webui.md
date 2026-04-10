---
tags: [openclaw, ai-agent, gateway, web-ui, health-check, debugging, security, geektime]
source: https://time.geekbang.org/course/detail/101123301-963991
---
# OpenClaw Gateway 状态验证与 Web UI

安装完成后用 `openclaw health` 做健康检查，逐项验证 Node/Gateway/Channel 状态。Gateway 在 macOS 上以后台服务运行，睡眠后可能需要重启。Web UI 提供浏览器管理界面，**必须设置密码**——否则同网络内任何人都可控制你的 Agent。

## Key Concepts
- **健康检查**：`openclaw health` 是安装后第一步，类似医生查房，逐项显示 Node/Gateway/Channel 状态
- **Gateway 重启**：`openclaw gateway restart`，MacOS 睡眠后 Gateway 可能停止，重启即可
- **Web UI**：浏览器界面，可查看实时对话日志、管理 Channel 连接、控制 Node
- **密码安全**：早期版本无密码，同网任何人可控制 AI；现代版本强制密码，务必配置
- **Channel 故障排查**：飞书/微信连接失败时，逐一确认 App ID/Secret、权限配置、模型状态

## Key Takeaways
- `openclaw health` → 绿色全通 = 可以开始第一次对话
- Web UI 密码是必须配置项，不是可选项
- MacOS 用户需注意 Gateway 在睡眠后可能需要手动重启

## See Also
- [[004-openclaw-gateway-node-channel]]
- [[010-openclaw-clean-reinstall]]
