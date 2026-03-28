# 十个 Claude Code Skills 摘要（用途 + 原始安装来源）

- 来源文章: https://zhuanlan.zhihu.com/p/2015725269667840386
- 抽取方式: 复用本机浏览器会话与 Cookie 抓取页面 HTML 后解析
- 记录时间: 2026-03-28

## 1) Superpowers
- 用途: 一组覆盖开发全流程的组合技能包（如 brainstorming、TDD、代码审查、Git 提交流程）。重点价值是先做需求澄清与方案探索，再进入实现，减少返工。
- 安装:
  - `claude plugin install superpowers`
- 原始来源:
  - https://github.com/obra/superpowers

## 2) Planning with Files
- 用途: 将计划、进度、知识持久化到 Markdown 文件，避免仅在会话上下文里维护计划而导致压缩后丢失状态。
- 安装:
  - `claude plugin marketplace add OthmanAdi/planning-with-files`
  - `claude plugin install planning-with-files`
- 原始来源:
  - https://github.com/OthmanAdi/planning-with-files

## 3) UI UX Pro Max
- 用途: 提升 Claude 生成 UI 的设计质量，提供大量风格与配色方案，减少“模板化 AI 审美”，支持多前端/跨端技术栈。
- 安装:
  - `claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill`
  - `claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill`
- 原始来源:
  - https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

## 4) Code Review
- 用途: 使用多 Agent 并行审查 PR（逻辑、安全、风格等），并按置信度过滤结果，降低代码审查假阳性。
- 安装:
  - `claude plugin install code-review`
- 原始来源:
  - https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-review

## 5) Code Simplifier
- 用途: 面向最近修改代码做“等价简化”，聚焦重复逻辑、冗余变量和可合并分支，在不改功能前提下降低复杂度。
- 安装:
  - `claude plugin install code-simplifier`
- 原始来源:
  - https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier

## 6) Webapp Testing
- 用途: 让 Claude 自动完成 Web 应用测试流程（生成 Playwright 脚本、启动浏览器、执行测试、截图与调试）。
- 安装:
  - `claude plugin marketplace add anthropics/skills`
  - `claude plugin install example-skills@anthropic-agent-skills`
- 原始来源:
  - https://github.com/anthropics/skills/tree/main/skills/webapp-testing

## 7) Ralph Loop
- 用途: 通过 Stop Hook 阻止 Claude 过早结束任务；若未满足完成条件，自动回灌任务继续执行直到达标。
- 安装:
  - `claude plugin install ralph-loop`
- 原始来源:
  - 文章未给出明确 GitHub 仓库；给了用法参考页: https://awesomeclaude.ai/ralph-wiggum

## 8) MCP Builder
- 用途: 分阶段引导构建 MCP Server（理解 API、设计工具接口、实现、测试），降低从零开发门槛并覆盖边界场景。
- 安装:
  - `claude plugin marketplace add anthropics/skills`
  - `claude plugin install example-skills@anthropic-agent-skills`
- 原始来源:
  - https://github.com/anthropics/skills/tree/main/skills/mcp-builder

## 9) PPTX
- 用途: 直接生成 `.pptx` 初稿（含母版/图表/动画能力），解决“从零起稿”成本高的问题，再人工微调成正式版本。
- 安装:
  - `claude plugin marketplace add anthropics/skills`
  - `claude plugin install document-skills@anthropic-agent-skills`
- 原始来源:
  - https://github.com/anthropics/skills/tree/main/skills/pptx

## 10) Skill Creator
- 用途: 用于创建/迭代自定义 Skill，并配合评测（eval）验证 Skill 是否真正生效，支持对比实验。
- 安装:
  - `claude plugin install skill-creator`
- 原始来源:
  - https://github.com/anthropics/claude-plugins-official/tree/main/plugins/skill-creator

## 文章内附加资源（原文给出）
- Anthropic 官方 Skills 仓库: https://github.com/anthropics/skills
- Anthropic 官方 Plugins 仓库: https://github.com/anthropics/claude-plugins-official
- Awesome Claude Skills 社区列表: https://github.com/travisvn/awesome-claude-skills
- Claude Code Skills 文档: https://code.claude.com/docs/en/skills
- Skills 市场: https://skillsmp.com/
