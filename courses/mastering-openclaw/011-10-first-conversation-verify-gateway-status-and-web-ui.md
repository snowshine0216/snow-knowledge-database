---
tags: [openclaw, ai-agent, gateway, web-ui, health-check, debugging, security, geektime]
source: https://time.geekbang.org/course/detail/101123301-963991
wiki: wiki/concepts/011-openclaw-gateway-webui.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 安装一个新的 AI 网关工具后，你会用什么方式验证它是否正确运行？你会检查哪些组件？
2. 如果你在 macOS 上运行一个后台服务，合上笔记本盖再打开后，服务可能出现什么问题？
3. 一个没有密码保护的本地 Web 管理界面，在公共 WiFi 环境下会带来什么安全风险？

---

# 010 第一次对话：验证 Gateway 状态与 Web UI 首次连接

**Source:** [玩虾 60 讲：捕获 Agent 时代的商业红利](https://time.geekbang.org/course/detail/101123301-963991) · 极客时间

## Outline
- [安装后第一步：健康检查](011-10第一次对话-验证-gateway-状态与-web-ui-首次连接.md#安装后第一步健康检查)
- [Channel 连接问题诊断](011-10第一次对话-验证-gateway-状态与-web-ui-首次连接.md#channel-连接问题诊断)
- [Gateway 重启方法](011-10第一次对话-验证-gateway-状态与-web-ui-首次连接.md#gateway-重启方法)
- [Web UI 首次访问](011-10第一次对话-验证-gateway-状态与-web-ui-首次连接.md#web-ui-首次访问)
- [安全警告：必须设置密码](011-10第一次对话-验证-gateway-状态与-web-ui-首次连接.md#安全警告必须设置密码)

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


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释 `openclaw health` 命令会检查哪三类组件，以及"全部绿色"意味着什么？
2. 当健康检查发现"飞书连接失败"时，应该按照什么顺序排查问题？每一步的目的是什么？
3. OpenClaw Web UI 早期版本的安全漏洞具体是什么？如果不设密码，攻击者在同一网络下能做哪些事？

> [!example]- Answer Guide
> 
> #### Q1 — openclaw health 三类组件
> 
> `openclaw health` 逐项检查三类组件：
> - **Node**：执行节点是否正常
> - **Gateway**：网关是否运行
> - **Channel 连接**：飞书/微信等各平台的连接状态
> 
> 全部显示绿色/正常，才表示可以开始第一次对话。
> 
> #### Q2 — 飞书连接失败排查顺序
> 
> 排查顺序（逐层隔离问题来源）：
> 1. 确认 **App ID / App Secret** 是否填写正确
> 2. 检查**飞书开放平台权限**是否已开启
> 3. 分别确认**模型、OpenClaw 本身、飞书配置**三者各自是否正常
> 
> #### Q3 — Web UI 早期安全漏洞
> 
> 早期版本 Web UI **完全没有密码保护**，同一网络内任何人都可以访问并控制该 OpenClaw 实例，包括：
> - 查看所有对话记录
> - 控制 Agent 行为
> 
> 现代版本已强制要求设置访问密码，在公共 WiFi 下尤其需要注意。
