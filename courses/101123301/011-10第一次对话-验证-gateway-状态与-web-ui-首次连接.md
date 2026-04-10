---
tags: [openclaw, ai-agent, gateway, web-ui, health-check, debugging, security, geektime]
source: https://time.geekbang.org/course/detail/101123301-963991
wiki: wiki/concepts/011-openclaw-gateway-webui.md
---

# 010 第一次对话：验证 Gateway 状态与 Web UI 首次连接

**Source:** [玩虾 60 讲：捕获 Agent 时代的商业红利](https://time.geekbang.org/course/detail/101123301-963991) · 极客时间

## Outline
- [安装后第一步：健康检查](#安装后第一步健康检查)
- [Channel 连接问题诊断](#channel-连接问题诊断)
- [Gateway 重启方法](#gateway-重启方法)
- [Web UI 首次访问](#web-ui-首次访问)
- [安全警告：必须设置密码](#安全警告必须设置密码)

---

## 安装后第一步：健康检查

安装完成后，用健康检查命令验证各组件状态：

```bash
openclaw health
```

输出类似"医生查房"，逐项检查：
- **Node**（执行节点）：是否正常
- **Gateway**（网关）：是否运行
- **Channel 连接**：各平台（飞书/微信等）连接状态

全部显示绿色/正常 → 可以开始第一次对话。

---

## Channel 连接问题诊断

示例：健康检查发现"飞书连接失败"

**排查步骤**：
1. 确认 App ID / App Secret 填写正确
2. 检查飞书开放平台权限是否开启
3. 分别确认：模型是否正常、OpenClaw 是否正常、飞书配置是否正确

```bash
# 单独查看 Gateway 状态
openclaw gateway status
```

---

## Gateway 重启方法

**常见问题**：MacOS 关上笔记本盖子后重新打开，Gateway 可能停止响应。

**解决方法**：

```bash
# 重启 Gateway
openclaw gateway restart
```

**macOS 注意**：Gateway 作为后台服务运行，若出现问题：
1. 关闭 Gateway
2. 重新启动
3. 重新打开时可能需要授权

如果 Gateway 停止后无法通过命令重启，可以通过以下方式：
```bash
# 找到并执行 OpenClaw 启动脚本
open -a OpenClaw   # 或通过 Qcolo 重启
```

---

## Web UI 首次访问

OpenClaw 提供 Web UI 界面，可在浏览器中管理：

**访问方式**：
1. 通过 `openclaw webui` 命令打开
2. 默认在本地浏览器弹出界面

**Web UI 功能**：
- 查看当前连接的 Channel 状态
- 实时查看 AI 对话日志（完整对话记录）
- 控制 Node 的开启/关闭
- 管理配置

---

## 安全警告：必须设置密码

⚠️ **重要安全提示**：

早期版本的 OpenClaw Web UI **没有密码保护**，这意味着同一网络内任何人都可以访问并控制你的 AI。

**现代版本已强制要求密码**，初次设置时务必：
1. 配置访问密码
2. 不要使用默认弱密码
3. 在公共 WiFi 下特别注意

> 没有密码保护 = 同网络内任何人都可以控制你的 OpenClaw，包括查看你的所有对话、控制你的 Agent 行为。
