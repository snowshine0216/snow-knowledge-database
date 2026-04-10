---
tags: [openclaw, ai-agent, installation, macos, curl, cli, api-key, geektime]
source: https://time.geekbang.org/course/detail/101123301-963180
wiki: wiki/concepts/006-openclaw-curl-install.md
---

# 005 Mac 极速安装：使用 curl 一键脚本开启养虾之旅

**Source:** [玩虾 60 讲：捕获 Agent 时代的商业红利](https://time.geekbang.org/course/detail/101123301-963180) · 极客时间

## Outline
- [两种安装方式对比](006-05mac-极速安装-使用-curl-一键脚本开启养虾之旅.md#两种安装方式对比)
- [curl 一键安装步骤](006-05mac-极速安装-使用-curl-一键脚本开启养虾之旅.md#curl-一键安装步骤)
- [API Key 配置](006-05mac-极速安装-使用-curl-一键脚本开启养虾之旅.md#api-key-配置)
- [安装后验证与健康检查](006-05mac-极速安装-使用-curl-一键脚本开启养虾之旅.md#安装后验证与健康检查)
- [常见问题处理](006-05mac-极速安装-使用-curl-一键脚本开启养虾之旅.md#常见问题处理)

---

## 两种安装方式对比

| 方式 | 适合人群 | 特点 |
|------|---------|------|
| **Qcolo 图形化**（上一讲） | 新手，快速体验 | 简单点击，功能相对精简 |
| **curl 命令行**（本讲） | 希望原生完整体验 | 安装最新版，功能完整，推荐长期使用 |

**推荐**：curl 方式安装原生版，体验最完整、版本最新。

---

## curl 一键安装步骤

### 1. 打开终端（Terminal）

macOS 自带终端，在 Spotlight 搜索"Terminal"打开。

### 2. 运行安装命令

根据电脑芯片选择对应命令：
- **Apple Silicon（M 系列）**：选 ARM/Apple Silicon 版本
- **Intel Mac**：选 x86 版本

运行后脚本自动检测当前系统架构，开始准备环境（需等待一段时间）。

也可通过 **Homebrew** 安装：`brew install openclaw`（需已安装 Homebrew）。

### 3. 等待环境准备

安装过程中脚本会自动：
- 检测当前平台和架构
- 准备运行环境
- 下载必要依赖

出现"已安装"提示即环境就绪。

### 4. 初始配置（可全部跳过）

安装完成后进入引导配置：
- **选择模型**：可跳过，稍后配置
- **配置 Skills**：可跳过
- **配置 Channel**：可跳过
- **其他配置**：可全部选"稍后"

> **技巧**：初次安装全部跳过，进入系统后按需配置更灵活。

---

## API Key 配置

OpenClaw 运行需要 AI 大模型 API Key。国内用户推荐：

**Kimi（月之暗面）**：国内可直接访问，无需翻墙
1. 访问 Kimi API 开放平台
2. 点击"创建 API Key"
3. 给 Key 命名（如"OpenClaw 专用"）
4. **立即复制保存**——Key 只显示一次，关闭后无法再查看

> **安全提示**：API Key 要保存在安全的地方，不要泄露。他人拿到 Key 可消耗你的额度。

将 Key 填入 OpenClaw 配置后，重启即可使用对应模型。

---

## 安装后验证与健康检查

使用 OpenClaw CLI 进行验证：

```bash
# 查看当前版本
openclaw --version

# 健康检查（检测 Node、Gateway 等状态）
openclaw health

# 检查是否有可用升级
openclaw upgrade
```

健康检查会验证：
- Node（执行节点）是否正常
- Gateway（网关）是否运行
- Channel 连接状态

全部绿色 → 安装成功，可以开始使用。

---

## 常见问题处理

**安装中断 / 出现错误提示**
- 大多数红色警告可以忽略，继续回车往下走
- 网络问题导致中断：重新运行安装命令（幂等，不会重复安装）

**想查看当前版本**
```bash
openclaw --version
```

**已有旧版本，想升级**
```bash
openclaw upgrade
```

**安装完成后接下来**
- 下一步：将 OpenClaw 接入微信 / 飞书 / 钉钉
- 接入后即可在熟悉的聊天软件中使用 AI 助手
