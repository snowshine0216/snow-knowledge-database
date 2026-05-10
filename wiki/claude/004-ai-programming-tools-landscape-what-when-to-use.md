---
tags: [claude-code, ai-tools, mcp, context-management, software-engineering, tool-selection]
source: https://time.geekbang.org/column/article/975241
---
# AI 编程工具全景：武器库里有什么，什么时候拿哪一件？

来自课程《Claude Code 企业级老项目改造实战》第 04 讲（作者：Robert）。本讲提供了 AI 编程工具的五类分类地图，以及按场景选择武器的决策框架，确定了本课聚焦的四件核心工具。

## Key Concepts

- **AI 编码 Agent（主武器）**：Claude Code、Cursor、Copilot、Cline、Aider——所有场景的主武器，无论场景多复杂都以此为核心。分两种形态：IDE 内置型（Cursor/Cline，编辑器内对话改代码）和命令行型（Claude Code/Aider，终端会话）。
- **上下文管理**：CLAUDE.md、SKILL.md、.cursorrules、各种记忆系统——把上下文从"每次对话临时说一遍"变成"常驻项目、AI 每次会话自动读"。对老项目改造最关键的一类工具，对应三层控制中的理解层和约束层。
- **能力扩展（MCP）**：Model Context Protocol 是给 AI 接外部能力的标准协议。配合 Sourcegraph MCP（代码搜索）、GitHub/GitLab MCP（PR/commit 历史）、数据库 MCP（schema 查询），让 AI 能看到代码之外的信息。零 MCP 可完成完整改造，但有 MCP 特定场景快很多。
- **规范驱动开发（SDD）**：Spec-Kit（GitHub 官方开源）和 Kiro（AWS Agentic IDE）的核心思想是先写 spec 再让 AI 生成代码。本课不用——老项目没有清晰 spec，且三层控制已覆盖其"先约束再动手"核心思想。
- **够用就停**：判断新工具的三问：属于武器库哪一类？解决的是理解/约束/验证哪一层？相比现有工具有什么增量价值？想清楚再学。对核心工具的肌肉记忆（CLAUDE.md 闭眼能写）比学会十个新工具更有价值。

## Key Takeaways

- 五个典型场景的武器配置：接手陌生项目（Claude Code + Sourcegraph MCP）、改小 bug（Claude Code 直接上）、中等改造（Claude Code + CLAUDE.md + SKILL.md + 测试框架）、陌生语言项目（Claude Code + GitHub MCP）、高风险改造（Claude Code + SKILL.md + 独立 review）。
- 本课聚焦四件：Claude Code + CLAUDE.md + SKILL.md + MCP（按需）。其他工具在特定场景提及，不列为主线。
- SKILL.md 是 CLAUDE.md 的专项版：把特定改造流程（如安全审计、接口迁移）固化为可复用的专项技能文件。
- 工程辅助类（SonarQube、CI/CD、Cross-provider review）在 AI 时代重要性上升：AI 写代码速度远超人工 review 速度，传统工程工具成为必要的质量兜底。

## See Also

- [[claude-code-best-practice]]
- [[003-understanding-constraints-verification-three-layer-control]]
- [[claude-code-multi-agent-setup]]
