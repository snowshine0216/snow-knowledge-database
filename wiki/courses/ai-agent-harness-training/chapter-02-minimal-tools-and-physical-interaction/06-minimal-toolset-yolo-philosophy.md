---
tags: [ai-agent, harness-engineering, go, minimal-tools, yolo, openclaw, tool-design, context-bloat, bash-tool]
source: https://time.geekbang.org/column/article/970292
---

# Chapter 06: 大道至简 — OpenClaw 最简工具集法则与 YOLO 执行哲学

## Overview

OpenClaw 的核心设计哲学是：给 Agent 的工具越少越精，而非越多越全。每次 LLM 请求时，所有工具的 JSON Schema 都被送入上下文——工具越多，模型的 Attention 被稀释越严重，幻觉率上升、token 成本指数增长，这就是 **Context Bloat（上下文膨胀）**。OpenClaw 的解法是只保留 4 个图灵完备的原语工具：`read / write / edit / bash`，其中 `bash` 通过直接暴露 Shell 接口，让 LLM 调用其已内化的海量 CLI 知识（git、grep、npm、curl 等），无需为每个命令单独封装工具。在安全层面，OpenClaw 奉行 **YOLO 模式**：在本地开发环境放弃静态黑名单（"安全剧场"），改用 Git 回滚作为兜底，同时在 bash 工具底层内置超时控制（30s）、工作区约束（`cmd.Dir`）、错误原样回传（让模型自纠错）、长度截断（防 OOM）这 4 条物理边界。YOLO 仅适用于本地；远端线上运维场景（第 16 讲）则切换为 Human-in-the-loop 中间件审批。

---

## Key Concepts

### Context Bloat（上下文膨胀）

每次 LLM 请求发起时，所有已挂载工具的完整 JSON Schema 都会被塞入上下文。一个标准 GitHub MCP 含 20+ 工具、消耗上万 token；问一句简单问题就需先发送 3 万 token 的工具描述。后果有三：(1) API 成本和延迟指数级上升；(2) 注意力被稀释，LLM 在几十个相似工具中选错，产生幻觉；(3) 每个专用工具都需维护一套 Go 反序列化 + API 调用代码，第三方接口变更则 Agent 罢工。

### 4 原语工具集（图灵完备的最小集）

| 工具 | 作用 | 备注 |
|------|------|------|
| `read` | 读取文件内容 | Agent 的"眼睛"，第 05 讲实现 |
| `write` | 创建 / 全量覆盖写入文件 | 自动创建父目录，路径约束在 workDir 内 |
| `edit` | 精准局部代码替换 | 多级降级 Fuzzy Match，第 07 讲实现 |
| `bash` | 在 workDir 执行任意 Shell 命令 | **终极原语**，替代所有专用 CLI 工具 |

### YOLO 模式（You Only Live Once）

在本地开发环境，Agent 对 bash 命令默认全权信任、直接执行，不设黑名单过滤。理由：只要 Agent 能执行代码，静态黑名单（如拦截 `rm -rf`）总能被绕过（变量拼接、写脚本再执行）；与其维护脆弱的黑名单，不如用 **Git 回滚** 作为兜底。这种"放弃安全剧场"的态度就是 YOLO。

### 安全剧场（Security Theater）

安全措施停留在形式层面——做了很多看起来严格的校验，但对真实风险降低有限。在 bash 工具里写大量正则黑名单是典型安全剧场：看起来有防护，实则 Agent 一个 `python evil.py` 就绕过了。

### bash 工具的 4 条驾驭底线

YOLO 对**业务意图**给予最高自由度，但对**底层资源**施加物理边界：

1. **超时控制**：`context.WithTimeout(ctx, 30s)`，超时后返回警告字符串（不静默 kill），让模型知晓并建议改用 `nohup &`
2. **工作区约束**：`cmd.Dir = workDir`，命令在 workDir 内执行，防止模型修改系统级路径
3. **错误原样回传（Self-Correction）**：`err != nil` 时返回 `(errorString, nil)` 而非 `("", error)`，保持 Agentic Loop 不中断，让模型看到 stderr 后自主修正
4. **长度截断**：输出超过 8000 字节时截断，防止 OOM

### 慢思考关闭（YOLO 急速模式）

对明确的机械性任务（查 Go 版本、写 Hello World），设置 `EnableThinking: false` 关闭慢思考阶段，大幅降低延迟——这是 YOLO 执行哲学在速度维度的体现。

---

## Key Takeaways

- 工具数量与 Agent 性能**负相关**：额外工具的 JSON Schema 占用 Attention，导致幻觉率上升
- `bash` 是图灵完备的终极接口：通过 Shell 可调用一切 CLI，LLM 已内化足够的命令知识无需额外封装
- YOLO ≠ 无防护：物理底线（超时、工作区约束、截断）比静态黑名单更有效
- 错误回传而非抛异常：Self-Correction Loop 依赖模型看到错误信息后自主重试
- 本地 YOLO / 远端 Human-in-the-loop：YOLO 是部署环境决定的架构折中，不是绝对原则

---

## See Also

- [[courses/ai-agent-harness-training/chapter-05-tool-registry/05-tool-registry-design]] — Tool Registry 设计与 `read_file` 实现（本章基础）
- [[courses/ai-agent-harness-training/chapter-07-fuzzy-edit/07-fuzzy-edit-tool]] — Fuzzy Edit 工具：多级降级的局部代码替换（本章 `edit` 原语的具体实现）
- [[agent-frameworks/openclaw]] — OpenClaw 项目整体架构分析
- [[ai-engineering/context-bloat-and-attention-dilution]] — Context Bloat 与 Attention 稀释的通用原理
- [[ai-engineering/agentic-loop-self-correction]] — Agentic Loop 的自纠错机制
