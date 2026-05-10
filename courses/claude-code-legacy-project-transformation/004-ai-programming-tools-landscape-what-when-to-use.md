---
tags: [claude-code, ai-tools, mcp, context-management, software-engineering, tool-selection]
source: https://time.geekbang.org/column/article/975241
wiki: wiki/claude/004-ai-programming-tools-landscape-what-when-to-use.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 你现在用过哪些 AI 编程工具？你能把它们按"解决的问题"分成几类？
2. MCP 是什么，它解决了 AI 的什么局限？
3. 老项目改造时，你觉得哪类工具最重要？为什么？

## Chapter Metadata
- Course: Claude Code 企业级老项目改造实战
- Chapter: 004 — AI 编程工具全景：武器库里有什么，什么时候拿哪一件？
- Author: Robert
- Date: 2026-05-09
- Article ID: 975241

## Cornell Notes

### Cue Column (Questions)
- AI 编程工具武器库分哪五类？各类解决什么问题？
- 五个典型场景分别应该拿哪些武器？
- 本课实际重度使用的工具是哪几件？
- "够用就停"背后的逻辑是什么？
- SDD（规范驱动开发）工具为什么在本课不用？

### Notes Column

**为什么需要武器库地图**

工具太多是核心焦虑来源：Claude Code、Cursor、Copilot、Cline、CLAUDE.md、AGENTS.md、SKILL.md、Spec-Kit、Kiro、MCP、Sourcegraph……每周新出几个。缺的不是工具知识，是一张能帮你判断"该不该学这个"的地图。

**五类工具**

| 类别 | 代表工具 | 解决的问题 |
|---|---|---|
| **AI 编码 Agent**（主武器） | Claude Code、Cursor、Copilot、Cline、Aider | 你与 AI 打交道的入口，改代码的执行者 |
| **上下文管理** | CLAUDE.md、AGENTS.md、.cursorrules、SKILL.md、各种记忆系统 | 把上下文从"每次临时说一遍"变成"常驻项目、AI 自动读" |
| **能力扩展** | MCP（Model Context Protocol）、Sourcegraph、GitHub/GitLab MCP、数据库 MCP | 让 AI 从"只能看代码"升级到"能看代码之外的东西"（历史、依赖、数据库、线上指标） |
| **规范驱动开发（SDD）** | Spec-Kit（GitHub 官方开源）、Kiro（AWS Agentic IDE）、Tessl | 先写 spec/验收标准/接口契约，再让 AI 生成代码 |
| **工程辅助** | SonarQube、测试框架（Jest/JUnit/pytest）、CI/CD 集成、Cross-provider review | 传统工程工具，AI 时代因代码产出速度远超 review 速度而变得更重要 |

**AI 编码 Agent 形态对比**

- **IDE 内置型**：Cursor、Copilot、Cline（VS Code 插件）——在编辑器里直接对话和改代码
- **命令行型**：Claude Code、Aider——终端会话，用自然语言指挥

选一个就够了。本课用 Claude Code，不是唯一选择，而是老项目改造场景下最顺手。

**五个典型场景 → 武器选择**

| 场景 | 主武器 | 辅武器 |
|---|---|---|
| 接手陌生项目第一天 | Claude Code | 上下文管理 + Sourcegraph MCP（大项目） |
| 改一个小 bug | Claude Code | 无（直接上） |
| 跨模块中等改造 | Claude Code + CLAUDE.md + SKILL.md | 测试框架 + CI |
| 陌生语言 + 陌生项目 | Claude Code + CLAUDE.md | GitHub MCP + Sourcegraph |
| 高风险改造（安全/跨核心服务） | Claude Code + SKILL.md | Sourcegraph + 独立 review（多角度） |

规律：主武器永远是 AI 编码 Agent，辅助工具随场景复杂度增加。

**本课重度使用的四件工具**

1. **Claude Code**（AI 编码 Agent）
2. **CLAUDE.md**（项目级上下文）
3. **SKILL.md**（专项技能文件）
4. **MCP**（按需接入外部能力，相对少用）

其他工具：特定场景提一下，不列为主线。SDD 工具（Spec-Kit、Kiro）不用——老项目没有清晰 spec，强行补 spec 意义不大；而且 SDD 核心思想（先约束、再动手）已经在 03 讲三层控制里了。

**"够用就停"原则**

多学一个工具，认知成本上涨。学的时候觉得懂了，用的时候还是会模糊反查。注意力被切碎，真正花在项目上的思考反而变少。老项目改造不需要花哨工具栈，需要对核心工具的肌肉记忆：`CLAUDE.md` 闭眼能写、`SKILL.md` 一眼知道该加什么、MCP 知道什么时候接什么时候不接。这些熟到不用思考，才能把脑子留给项目本身。

**判断新工具的三个问题**

1. 它属于武器库的哪一类？
2. 解决的是理解、约束、验证哪一层的问题？
3. 相比现在用的工具，有什么增量价值？

想清楚再决定要不要学。不对路的工具，知道有就够了。

### Summary

AI 编程工具武器库分五类：AI 编码 Agent（主武器）、上下文管理、能力扩展（MCP 为代表）、规范驱动开发（SDD）、工程辅助。主武器永远是 AI 编码 Agent，辅助工具按场景复杂度叠加。本课聚焦四件：Claude Code + CLAUDE.md + SKILL.md + MCP。SDD 工具不适合老项目改造场景，因为老项目没有清晰 spec 且三层控制已覆盖其核心思想。核心心法：够用就停——工具熟练度比工具数量重要。

## Key Takeaways
- **主武器唯一性**：无论什么场景，AI 编码 Agent 永远是主武器，其他四类都是辅助——这解释了为什么大多数人坐下来干活只用那一个 AI 工具。
- **MCP 是能力扩展层**：让 AI 从"只能看代码"升级到"能看 PR 历史、数据库 schema、线上指标"，老项目改造有用但非必需——可以零 MCP 完成完整改造。
- **上下文管理类是老项目核心**：CLAUDE.md/SKILL.md 把上下文从"每次临时说"变成"常驻自动读"，对应三层控制中的理解层和约束层。
- **SDD 工具跳过**：Spec-Kit/Kiro 适合从零开始的新项目，老项目没有清晰 spec；且三层控制已包含 SDD 的"先约束再动手"核心思想。
- **够用就停**：对四件核心工具建立肌肉记忆（CLAUDE.md 闭眼能写、MCP 知道何时接）比学会十个新工具更有价值。

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[AI编程工具五类]]：AI 编码 Agent + 上下文管理 + 能力扩展 + 规范驱动开发 + 工程辅助，是武器库的全景框架
- [[MCP]]：Model Context Protocol，给 AI 接入外部能力的标准协议，让 AI 能查 GitHub 历史、数据库 schema、线上指标
- [[SKILL.md]]：专项技能文件，把特定改造流程固化为可复用的静态约束，是 CLAUDE.md 的专项版
- [[够用就停]]：工具选择原则——不对路的工具知道有就够了，熟练度比数量重要
- [[规范驱动开发-SDD]]：先写 spec/验收标准/接口契约再让 AI 生成代码，代表工具 Spec-Kit/Kiro，不适合老项目改造
- [[AI编码Agent]]：武器库主武器，形态分 IDE 内置型（Cursor/Cline）和命令行型（Claude Code/Aider）

### 2. 课程内导航链接
- [[001-legacy-project-handoff-and-delivery-true-workflow|第 01 讲 九步改造链路]]：本讲五个典型场景对应九步链路中的不同阶段
- [[002-what-changed-and-unchanged-when-claude-code-enters|第 02 讲 三档分工模型]]：第一档（AI 做 80%）正是靠本讲的上下文管理类工具实现
- [[003-understanding-constraints-verification-three-layer-control|第 03 讲 三层控制]]：CLAUDE.md 承载理解层和约束层，SKILL.md 承载静态约束层——本讲工具与三层控制的对应关系
- [[005-industry-landscape-2026-ai-legacy-code-academic-engineering|第 05 讲 业界在做什么]]：Sourcegraph、Aider、Cline 等工具在业界实践中的定位和验证

### 3. 课程外与通用概念关联
- [[mcp]]：本讲介绍的 MCP 能力扩展类工具的标准协议
- [[claude-code]]：本讲的主武器，在老项目改造场景下是命令行型 AI 编码 Agent
- [[context-engineering]]：上下文管理类工具（CLAUDE.md/SKILL.md）的底层工程学科

### 4. 推荐关系边（可直接扩成独立卡片）
- [[AI编码Agent]] → centers-on → [[AI编程工具五类]]
- [[MCP]] → extends → [[AI编码Agent]]
- [[CLAUDE.md]] → implements → [[上下文管理]]
- [[SKILL.md]] → specializes → [[CLAUDE.md]]
- [[够用就停]] → constrains → [[工具学习策略]]
- [[规范驱动开发-SDD]] → replaces → [[三层控制]] （被三层控制替代，不在本课使用）

### 5. 后续值得沉淀成卡片的主题
- [[SKILL.md工程化实践]]
- [[MCP老项目场景选型]]
- [[够用就停]]

## Notes For Review
- SKILL.md 的具体写法和触发时机在哪一讲详细展开？
- MCP 在什么具体场景下接入老项目的 GitHub 历史或 Sourcegraph？第四部分实战应该有案例。
- Cross-provider review（Codex 和 Claude Code 互相 review）的具体操作流程？

---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. AI 编程工具武器库的五类分别是什么？本课只重点用哪四件？
2. MCP 解决了 AI 的什么局限？老项目改造时，什么场景下应该接入 MCP？
3. 为什么"够用就停"比"多学一个总没坏处"更适合老项目改造场景？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 五类：AI 编码 Agent（主武器，如 Claude Code/Cursor/Copilot）、上下文管理（CLAUDE.md/SKILL.md）、能力扩展（MCP/Sourcegraph）、规范驱动开发 SDD（Spec-Kit/Kiro）、工程辅助（SonarQube/测试框架/CI）。本课重点用的四件：Claude Code + CLAUDE.md + SKILL.md + MCP（后者按需使用，相对较少）。
>
> ---
>
> **题目 2 - 引导答案思路：**
> AI 默认只能读代码，MCP 让它能访问代码之外的信息（GitHub PR 历史、数据库 schema、Sourcegraph 依赖分析、线上指标）。老项目场景的典型 MCP 使用时机：接手一个大型陌生项目时（Sourcegraph MCP 帮助快速找出全局依赖关系）；需要了解某段代码历史变更原因时（GitHub MCP 读取 commit 历史和 PR 讨论）。零 MCP 可以完成完整改造，但有 MCP 时某些信息获取会快很多。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 老项目改造是需要深度专注的长跑任务。每多学一个工具，认知成本上涨，在实际使用时还需要回查细节，注意力被切碎。真正的效率来自对核心工具的肌肉记忆（CLAUDE.md 闭眼能写、MCP 知道何时接）——这需要持续使用而非广泛涉猎。工具数量是虚的，工具熟练度才是真实能力。
