---
tags: [claude-code, workflow, productivity, ai-coding, cli, devops, tdd, mcp]
source: https://zhuanlan.zhihu.com/p/2026601124610815795
wiki: wiki/tools/45-claude-code-tips.md
---

# 45 个 Claude Code 神级技巧

**Source:** [知乎专栏 · 大模型爱好者社区](https://zhuanlan.zhihu.com/p/2026601124610815795) · 2026-04-13
**Author:** 大模型爱好者社区（机器学习社区）
**Content type:** article（工作流实操集）

## Overview

作者 ykdojo 总结长期使用 Claude Code 的 45 条实操技巧，覆盖状态栏、斜杠命令、Git 工作流、上下文管理、系统提示裁剪、容器化自治、测试验证、插件生态等主题。核心主张是：上下文像牛奶（Tip 5，新鲜最好），大任务必须拆分（Tip 3），通过 "十亿 token 法则" 大量实战积累直觉（Tip 22）。作者还开源了 `dx` 插件，把其中关键技巧打包成一键安装。

## Key Numbers / Quick Facts

| 项目 | 数值 / 细节 |
|---|---|
| Opus 4.5 上下文窗口 | 200k tokens，其中约 45k 预留给自动压缩 |
| 系统提示 + 工具定义占用 | 默认约 19k tokens（system prompt 3.0k + tools 15.6k） |
| 作者裁剪后占用 | 约 9k tokens（system prompt 1.8k + tools 7.4k），节省 ~10k |
| 建议同时运行任务数 | ≤ 3–4 个标签 |
| half-clone 自动触发阈值 | 上下文使用率 > 85% |
| 长任务手动指数退避间隔 | 1 分钟 → 2 分钟 → 4 分钟… |
| 作者累计用量 | 17.6m tokens / 4.1k sessions / 最长 session 20h 40m |
| 手动指数退避等待对象 | Docker 构建、GitHub CI |
| dx 插件安装命令 | `claude plugin marketplace add ykdojo/claude-code-tips` 然后 `claude plugin install dx@ykdojo` |

## 分模块精华

### 1. 状态栏与斜杠命令（Tip 0–1）

- **自定义状态栏**（Tip 0）：脚本路径 `scripts/context-bar.sh`，显示内容格式为 `Opus 4.5 | 📁目录 | 🔀main (未提交N文件, N分钟前同步) | ██░░░░░ 18% of 200k tokens 💬 最后消息`，支持 10 种主题色（橙、蓝、青、绿、薰衣草紫、玫瑰粉、金、石板灰、灰等）。第二行显示最后一句消息便于回顾。
- **必学斜杠命令**（Tip 1）：
  - `/usage` 查看本次 session / 本周 / Sonnet-only 用量重置时间（作者建议开个专门 tab 用 Shift+Tab 或 ←→ 刷新）
  - `/chrome` 启用浏览器集成
  - `/mcp` 管理 MCP 服务器（用户配置默认在 `~/.claude.json`）
  - `/stats` 显示 GitHub 贡献图风格的日历，含 favorite model、total tokens、最长连续使用天数
  - `/clear` 重开对话
  - `/release-notes` 查看新功能

### 2. 语音与输入（Tip 2, 38）

- **本地语音转写**推荐：`superwhisper`（付费）、`MacWhisper`（性价比）、`Super Voice Assistant`（开源，支持 Parakeet v2/v3）。即使识别错字（例："ExcelElanishMark" → "exclamation mark"），Claude 也能推出原意。Claude Code 现已原生支持语音模式。
- **硬件**：作者用 Apple EarPods（有线，不是 AirPods）凑近嘴边小声说，人多场合也能用。
- **输入框快捷键**（readline 风格）：`Ctrl+A/E` 行首/行尾、`Option+←/→` 按词跳转、`Ctrl+W` 删词、`Ctrl+U/K` 删到行首/尾、`Ctrl+G` 打开外部编辑器（粘长文用，直接粘终端很慢）、换行用 `\` + Enter 或 `/terminal-setup` 配置（Mac 作者用 Option+Enter）、贴图 Mac/Linux 是 `Ctrl+V`（不是 Cmd+V！）、Windows 是 `Alt+V`。编辑器通过 `export EDITOR=vim` 设置。

### 3. 拆分与规划（Tip 3, 39）

- **问题拆解**：A→B 直接失败时，拆成 A→A1→A2→A3→B。作者做语音转写系统的例子：① 一个能下载模型的小程序 ② 一个能录音的小程序 ③ 一个能转写已有音频的小程序，最后拼起来。
- **Plan Mode**：`Shift+Tab` 或 `/plan` 进入，让 Claude 先出技术选型、项目结构、文件安排再写代码；也可用快速原型判断技术方案是否合适。

### 4. Git / PR / DevOps（Tip 4, 26, 28, 29）

- **GitHub CLI 高阶**：用 `gh api graphql -f query='...'` 可查 PR 描述每次编辑的具体 UTC 时间和编辑者（作者给出表格示例）。
- **禁用 Claude 署名**：`~/.claude/settings.json` 加 `{"attribution": {"commit": "", "pr": ""}}`，移除 commit 的 `Co-Authored-By` 和 PR 脚注。
- **交互式 PR Review**（Tip 26）：`gh` 拉 PR 信息后对话式审查，可整体 review 也可逐文件。
- **输出验证四法**（Tip 28）：① 让 Claude 写测试 ② 用 GitHub Desktop 等可视化工具看 diff ③ 开 Draft PR，确认后再转正 ④ "仔细检查每一行每一句，最后列出验证结果表"（作者说这招超好用）。
- **`/gha <url>` 斜杠命令**（Tip 29）：自动调查 GitHub Actions 失败、识别 flaky / 破坏性 commit、建议修复，在 dx 插件中。典型追问链：哪个 commit 导致？是某个 PR 吗？还是 flaky？

### 5. 上下文管理（Tip 5, 8, 15, 23）

- **新鲜最好**（Tip 5）：每个新话题开新对话，避免长对话性能衰减。
- **手动压缩替代自动**（Tip 8）：作者在 `/config` 关闭自动压缩（默认占 200k 里的 45k），开新对话前写交接文档（如 `experiments/system-prompt-extraction/HANDOFF.md`），写明尝试了啥、成功失败，下个 agent 贴路径即可接手。作者做了 `/handoff` 斜杠命令自动化。
- **系统提示裁剪**（Tip 15）：把 3.0k 裁到 1.8k、工具定义 15.6k 裁到 7.4k，共省 10k tokens（~50%）。为保持补丁，需关自动更新：`{"env": {"DISABLE_AUTOUPDATER": "1"}}`。MCP 工具懒加载：`{"env": {"ENABLE_TOOL_SEARCH": "true"}}`。
- **克隆/半克隆**（Tip 23）：
  - 原生 `/fork` 或 `--fork-session`（配合 `--resume`/`--continue`）
  - 作者的 `clone-conversation` 复制整个对话生成新 UUID；`half-clone-conversation` 只保留后半段
  - 可在 shell 包装：`if [[ "$arg" == "--fs" ]]` 展开为 `--fork-session`，即可用 `c -c --fs`
  - **Hook 自动半克隆**：`check-context` 脚本在 `Stop` hook 里每次响应后检查使用率，>85% 就运行 `/half-clone`。配置在 `~/.claude/settings.json` 的 `hooks.Stop`。

### 6. 并行与长任务（Tip 14, 16, 17, 21, 36）

- **终端多标签瀑布流**（Tip 14）：最多 3–4 任务，作者按"最左常驻 → 新任务向右"的节奏循环切换。
- **Git Worktree**（Tip 16）：不同分支放不同目录，配合多标签无冲突并行。
- **手动指数退避**（Tip 17）：1/2/4 分钟间隔检查 Docker 构建或 GitHub CI。
- **容器化 `--dangerously-skip-permissions`**（Tip 21）：高风险长任务（如 Reddit 研究工作流跟 Gemini CLI 来回交互）放容器跑，出问题隔离。作者做了 **SafeClaw** 简化容器化会话管理，支持 Web 终端和多会话仪表板。
- **编排嵌套 Claude Code**：本地 Claude Code 启动 tmux session → 在 session 里连容器 → 容器内 Claude 用 `--dangerously-skip-permissions` → 外部用 `tmux send-keys` 发指令、`capture-pane` 读输出，得到完全自治的"工作型" Claude。
- **后台命令与子代理**（Tip 36）：`Ctrl+B` 把长命令移到后台，用 `BashOutput` 工具查进度；子代理默认 Sonnet，可按任务复杂度选 Opus/Sonnet/Haiku，可并行拆分大代码库分析。

### 7. 测试与自治（Tip 9, 34）

- **tmux 写-测循环**用于 CLI / 交互式应用测试（Tip 9）：
  ```bash
  tmux kill-session -t test-session 2>/dev/null
  tmux new-session -d -s test-session
  tmux send-keys -t test-session 'claude' Enter
  sleep 2
  tmux send-keys -t test-session '/context' Enter
  sleep 1
  tmux capture-pane -t test-session -p
  ```
- **Web 应用测试**：Playwright MCP 优于 Chrome DevTools MCP / 原生浏览器集成（基于 accessibility tree 而非截图坐标）。作者默认关原生浏览器集成，用 `ch` 别名按需开。
- **TDD 流程**（Tip 34）：① 写失败测试（红）② 提交测试 ③ 写代码到通过（绿）。作者的 `cc-safe` 就是这样写出来的——先写失败测试提交，给 Claude 明确目标。

### 8. 数据搜索与复制粘贴（Tip 6, 10, 11, 13, 20, 24）

- **对话历史**（Tip 13）：存在 `~/.claude/projects/`，目录名把斜杠换成横杠。例：`/Users/yk/Desktop/projects/claude-code-tips` → `~/.claude/projects/-Users-yk-Desktop-projects-claude-code-tips/`。每个 `.jsonl` 一个对话，可 `grep -l -i "keyword" ~/.claude/projects/-Users-yk-Desktop-projects-*/*.jsonl`，或配合 `find ... -mtime 0`。也可直接问 Claude "我们之前聊过 X 的什么"。
- **导出输出**（Tip 6）：`/copy` 把最后一次回复以 Markdown 放到剪贴板；或让 Claude 用 `pbcopy`；或写到文件、VS Code 打开指定行（`Cmd+Shift+P` → "Markdown: Open Preview" 可预览渲染）；或用 `open <url>`、打开 GitHub Desktop。
- **Cmd+A 万能复制**（Tip 10）：WebFetch 访问不到的页面（私有页、Reddit 等），直接 `Cmd+A` 全选粘贴给 AI。**Gmail 技巧**：点击 Print All 打开打印预览（不真打印），会展开所有邮件便于全选。
- **Gemini CLI 兜底**（Tip 11）：把 Reddit 抓取封装成 `~/.claude/skills/reddit-fetch/SKILL.md`，用 Tip 9 的 tmux 模式与 Gemini CLI 交互。Skills 按需加载更省 token，需先装 Gemini CLI。
- **Notion 中转链接**（Tip 20）：Slack 带链接文本直接粘贴 Claude Code 会掉链接——先贴 Notion，再从 Notion 复制可得到 Markdown 格式含链接的文本。反向同理（Tip 19：不支持 Markdown 的平台可经 Notion 转格式）。
- **`realpath`**（Tip 24）：跨目录告诉 Claude 文件时用 `realpath some/relative/path` 得到绝对路径。

### 9. 危险命令与安全（Tip 33）

Reddit 上有人 Claude Code 执行 `rm -rf tests/ patches/ plan/ ~/` 误删整个家目录。作者做了 **cc-safe** 扫 `.claude/settings.json` 中的危险命令：
- 安装：`npm install -g cc-safe` 或 `npx cc-safe .`
- 检测：`sudo`、`rm -rf`、`git reset --hard`、`npm publish`、`docker run --privileged` 等
- 仓库：[cc-safe](https://github.com/ykdojo/cc-safe)

### 10. 配置层级与插件（Tip 25, 44, 45）

| 类型 | 作用 | 加载时机 |
|---|---|---|
| CLAUDE.md | 默认 prompt，项目级 `./CLAUDE.md` 或全局 `~/.claude/CLAUDE.md` | 每次对话开头全量加载 |
| Skills | 结构化 CLAUDE.md，Claude 自动或用户手动调用 | 按需加载，省 token |
| 斜杠命令 | 用户或 Claude 显式调用 | 显式调用 |
| Plugins | 打包 skills、斜杠命令、agent、hook、MCP server（如 Anthropic 官方 frontend-design 本质就是 skill） | 按配置加载 |

**dx 插件命令表**：

| 命令 | 功能 |
|---|---|
| `/dx:gha <url>` | 分析 GitHub Actions 失败 |
| `/dx:handoff` | 创建上下文交接文档 |
| `/dx:clone` | 克隆对话分叉 |
| `/dx:half-clone` | 半克隆减少上下文 |
| `/dx:reddit-fetch` | 通过 Gemini CLI 抓 Reddit |
| `/dx:review-claudemd` | 审查对话并建议 CLAUDE.md 改进 |

**Playwright MCP** 推荐搭配：`claude mcp add -s user playwright npx @playwright/mcp@latest`。

**一键安装脚本**（Tip 45）：`bash <(curl -s https://raw.githubusercontent.com/ykdojo/claude-code-tips/main/scripts/setup.sh)`，10 项可选（状态栏、禁用自更、懒加载 MCP、读取 `~/.claude` 与 `/tmp` 权限、禁用署名、`c`/`ch` 别名、`--fs` 展开 `--fork-session` 等），用数字列表跳过不想要的。

### 11. 写作与自我提升（Tip 12, 18, 19, 30, 35, 40, 41, 42, 43）

- **左右分屏写作**（Tip 18）：终端在左（Claude）、编辑器在右；先给上下文 → 语音描述 → 逐行批注"这行保留因为…""这行挪到那里""这行改成这样"。
- **定期审查 CLAUDE.md**（Tip 30）：从没有开始，重复说到的东西才加进去；作者做了 `review-claudemd` skill 分析近期对话提修改建议。
- **敢在未知领域迭代**（Tip 35）：作者用 Claude 解决过 cloudpickle + Google Colab + Pydantic 问题、Rust + Python + JupyterLab 打印问题——之前没写过 Rust。初案不好就慢下来对齐思路，最终得到优雅方案。
- **简化过度复杂的代码**（Tip 40）：Claude 有"代码膨胀"倾向，要追问"为什么做这个改动？""这行干嘛用的？"才能比传统方式更快理解。
- **自动化的自动化**（Tip 41）：作者从 ChatGPT 时代做 Kaguya 插件想自动化复制粘贴 → 语音转写自动化打字 → 重复的就放 CLAUDE.md。标准：同样事做了几次就该想怎么自动化。
- **分享与反馈**（Tip 42）：作者给 Claude Code 仓库提 issue，几次更新被采纳（如 `/permissions` 删规则后滚动位置重置、`/permissions` 加搜索）——"他们用 Claude Code 开发 Claude Code，响应超快"。
- **学习资源**（Tip 43）：直接问 Claude Code 自己（有专门子代理回答）、`/release-notes`、r/ClaudeAI、关注 Anthropic DevRel Ado (@adocomplete)。

## Key Takeaways

- **上下文是金**：关自动压缩、裁剪系统提示（19k→9k）、85% 触发半克隆、MCP 懒加载——这组组合拳实打实多出几万 token 可用空间。
- **拆分是第一原则**：大任务拆到每个子任务都能解决；同时并行 ≤ 3–4 个标签，瀑布流节奏切换。
- **自治靠验证闭环**：写测-运行-捕获-验证四步循环（tmux 模式）是让 Claude 无人值守的关键；高风险长任务放容器 + `--dangerously-skip-permissions`。
- **Claude 是电脑万能接口**：ffmpeg 剪辑、Whisper 转写、Python 可视化、gh GraphQL 查 PR 编辑历史、磁盘清理——每个终端标签都是一个"第二大脑"的委托点。
- **安全默认值**：禁用 Claude 署名、`cc-safe` 扫危险命令、`realpath` 代替相对路径、贴图用 Ctrl+V（别在 Mac 上按 Cmd+V）。
- **个性化工具时代**：Slack Node SDK CLI 一小时手搓、幻灯片模板单 HTML、`/handoff` `/gha` `/half-clone` 都是个人工作流沉淀——发现重复就封装。
