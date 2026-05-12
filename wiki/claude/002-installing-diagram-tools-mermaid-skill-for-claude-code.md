---
tags: [claude-code, mermaid, diagram, skill, visualization, legacy-project]
source: https://time.geekbang.org/column/article/975826
---
# Claude Code SKILL 机制与画图能力扩展

Claude Code 出厂时没有直接输出图片的能力——要求画架构图，它只会返回 mermaid 源码，让你自己到 mermaid.live 渲染。通过 SKILL 机制装入 claude-mermaid 之后，Claude Code 可以直接输出 SVG/PNG/PDF 并在浏览器实时预览。

## Key Concepts

- **SKILL 机制**：Claude Code 的扩展点。启动时扫描 `~/.claude/skills/`（全局）和项目根目录 `.claude/skills/`（项目级），加载所有 SKILL 进上下文。一个 SKILL = 一个文件夹 + `SKILL.md`，告诉 Claude Code 这项能力干什么、什么时候用、用什么工具。安装方式：Plugin marketplace（`/plugin marketplace add <repo>` → `/plugin install`，自动处理 MCP 依赖）或手动 `git clone`（更透明，可查看修改）。
- **claude-mermaid（veelenga）**：MCP Server + Plugin 一体方案。安装两步缺一不可：
  1. `npm install -g claude-mermaid`（Node 20+ 的渲染程序，真正干活的部分）
  2. `/plugin install claude-mermaid@claude-mermaid`（在 Claude Code 里安装 SKILL 定义和 MCP 配置）
  装完需**完全退出 Claude Code 再重新启动**（非 reload），让 MCP Server 起来。
- **四类必备图**（老项目改造反复用到的全部场景）：
  - **架构图** (`graph TD/LR`)：系统骨架，前端/后端/数据库/中间件分层，改造影响范围判断
  - **模块依赖图** (`graph LR`)：模块之间的依赖关系，循环依赖用红色标出，改一个模块前先看辐射范围
  - **时序图** (`sequenceDiagram`)：一次 API 调用从 Controller 到 DB 的完整生命周期，提示词里必须加"先 grep 真实代码"否则 AI 会臆造调用链
  - **ER 图** (`erDiagram`)：数据表主外键关系，必须要求 AI 读真实 DDL 或 JPA entity
- **工具三层分工**：Mermaid（90% 场景，Claude Code/GitHub/Notion 原生支持，AI 生成能力最强）→ PlantUML（复杂 UML，偶尔用）→ DrawIO（最终交付精修图，不适合 AI 快速生成）
- **AI 画图工作流**：AI 起稿 → 工程师 review 修正 → 定稿存 `docs/` → 成为 `CLAUDE.md` 的前置资产。核心约束：AI 基于代码画图，代码之外的历史约定/隐性限制它看不见，所以 AI 画的图一定有错，review 不可省。

## Key Takeaways

- SKILL 机制是 Claude Code 的"npm 生态"——装一个 SKILL 就多一项能力，来源：Plugin marketplace 或手动 clone
- claude-mermaid 两步安装缺一不可；装完要完全重启而非 reload
- 各类图的关键提示词技巧：架构图加"分层+subgraph"、时序图加"grep 真实代码"、模块图加"读 pom.xml"、ER 图加"读 DDL"——少说这些 AI 就会凭空捏造
- 图的美学三原则：`classDef` 颜色分层、留白（图是索引不是百科）、统一方向（全项目 TD 或 LR 选一个不变）
- 所有 AI 生成图必须 review → 修正 → 存档，否则图是负债而非资产

## See Also

- [[claude-code]] — 本讲所有操作的宿主工具
- [[mermaid]] — 主流文本化图表工具，AI 生成能力最强
- [[001-eight-step-method-for-understanding-legacy-projects]] — 八步心法中第四步"画项目全景"是本讲工具能力的使用场景
- [[003-birds-eye-view-draw-architecture-module-dependency-diagrams]] — 下一讲实操：用装好的画图能力产出三张项目全景图

## Related sources

- **[俯视项目全景：用提示词画出架构图、模块图、依赖图]**: 在 Spring AI Alibaba Admin 上实操产出三张图，补充了每张图的具体提示词、review 清单、常见坑，以及"画不出整齐的图 = 架构问题诊断信号"这一重要洞察。还引入了`docs/`目录规范和依赖图三类来源文件（pom.xml/application.yml/README）的分工。See also: [[003-birds-eye-view-draw-architecture-module-dependency-diagrams]]
