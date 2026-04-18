---
tags: [claude-code, workflow, productivity, ai-coding, cli, devops, tdd, mcp]
source: https://zhuanlan.zhihu.com/p/2026601124610815795
---

# 45 个 Claude Code 神级技巧（ykdojo）

ykdojo 基于长期使用 Claude Code 的 45 条实操技巧汇编，覆盖状态栏、斜杠命令、Git/PR、上下文管理、系统提示裁剪、容器化自治、TDD、插件生态。核心主张：上下文像牛奶（新鲜最好）、大任务必拆分、通过"十亿 token 法则"大量实战积累直觉。作者把关键能力封装进开源 `dx` 插件一键安装。

## Key Numbers

| 项目 | 数值 |
|---|---|
| Opus 4.5 上下文窗口 | 200k tokens（45k 预留给自动压缩） |
| 系统提示+工具默认占用 | ~19k tokens（裁剪后 ~9k，省 50%） |
| 建议并行任务数 | ≤ 3–4 标签 |
| 半克隆自动触发阈值 | 上下文使用率 > 85% |
| 手动指数退避间隔 | 1→2→4 分钟 |

## Key Concepts

- **上下文是金**：关自动压缩（`/config`）、裁剪系统提示（需禁用自动更新 `DISABLE_AUTOUPDATER=1` 保持补丁）、MCP 懒加载（`ENABLE_TOOL_SEARCH=true`）、Stop hook 在 >85% 自动触发 `/half-clone`。
- **任务拆分**：A→B 翻车就拆成 A→A1→A2→A3→B；作者语音转写 App 拆成"下载模型/录音/转写"三个独立小程序再拼装。
- **写-测自治循环**：tmux 启动 session → `send-keys` 发命令 → `sleep` 等待 → `capture-pane -p` 捕获输出；高风险长任务放容器 + `--dangerously-skip-permissions`，可嵌套让外层 Claude 编排容器内 Claude（`tmux send-keys` / `capture-pane`）。
- **Git/PR 高阶**：`gh api graphql` 可查 PR 描述每次编辑的 UTC 时间与编辑者；`/gha <url>` 自动调查 GitHub Actions 失败（识别 flaky / 破坏性 commit）；禁用署名用 `{"attribution":{"commit":"","pr":""}}`。
- **安全工具**：`cc-safe`（`npm i -g cc-safe` 或 `npx cc-safe .`）扫描 `.claude/settings.json` 中 `sudo`、`rm -rf`、`git reset --hard`、`docker run --privileged` 等危险命令——起因是有用户 Claude 误删 `~/` 整个家目录。
- **Cmd+A 万能复制**：WebFetch 访问不到的页面（Reddit、私有页）直接全选粘贴；Gmail 用 Print All 打印预览展开所有邮件再全选；Slack 含链接文本经 Notion 中转可保留 Markdown 链接。
- **Skill vs 斜杠命令 vs Plugin**：CLAUDE.md 每次全量加载；Skills 按需加载省 token；斜杠命令显式调用；Plugin 把 skills/命令/agent/hook/MCP 打包（Anthropic 的 frontend-design 本质就是个 skill）。

## Key Takeaways

- 关自动压缩 + 手写 `HANDOFF.md` 交接比让 `/compact` 盲压缩更省上下文；作者做了 `/handoff` 斜杠命令自动化。
- Playwright MCP 优于截图坐标方案（基于 accessibility tree）——推荐 `claude mcp add -s user playwright npx @playwright/mcp@latest`。
- 输出验证四件套：写测试、GitHub Desktop 看 diff、Draft PR、让 Claude 输出"逐行检查后的验证结果表"。
- 贴图坑：Mac 用 `Ctrl+V`（**不是** `Cmd+V`），Windows 用 `Alt+V`；粘长文用 `Ctrl+G` 打开外部编辑器（终端贴慢）。
- 一键安装：`bash <(curl -s https://raw.githubusercontent.com/ykdojo/claude-code-tips/main/scripts/setup.sh)` 覆盖状态栏、别名、MCP 懒加载、禁用署名等 10 项可选配置。
- dx 插件命令：`/dx:gha` `/dx:handoff` `/dx:clone` `/dx:half-clone` `/dx:reddit-fetch` `/dx:review-claudemd`。

## See Also

- [[claude-code-tips-collection]] — Boris Cherny's 42-tip collection (官方视角)
- [[claude-code-internals]] — agent runtime architecture
- [[claude-hud]] — session observability plugin
- [[caveman-token-saver]] — output token compression plugin
- [[claude-code-multi-agent-setup]] — skills/plugins/subagents 四层扩展
